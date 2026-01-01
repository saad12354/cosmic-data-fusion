import socketio
from typing import Dict, Any

# Create a Socket.IO server
# async_mode='asgi' is compatible with FastAPI/Uvicorn
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

class CollaborationManager:
    def __init__(self):
        # user_id -> { "name": str, "color": str, "x": float, "y": float, "room": str }
        self.active_users: Dict[str, Any] = {}
        # room_id -> [history_states]
        self.room_history = {}  # For simple undo/redo
        
    async def connect_user(self, sid: str, data: dict):
        self.active_users[sid] = {
            "id": sid,
            "name": data.get("username", "Anonymous"),
            "color": data.get("color", "#ffffff"),
            "x": 0, "y": 0,
            "room": "default"
        }
        
    def disconnect_user(self, sid: str):
        if sid in self.active_users:
            del self.active_users[sid]
            
    def update_cursor(self, sid: str, x: float, y: float):
        if sid in self.active_users:
            self.active_users[sid]["x"] = x
            self.active_users[sid]["y"] = y
            return self.active_users[sid]
        return None

    def get_room_users(self, room="default"):
        return [u for u in self.active_users.values() if u["room"] == room]

manager = CollaborationManager()

# --- Socket Event Handlers ---

@sio.event
async def connect(sid, environ):
    print(f"User connected: {sid}")

@sio.event
async def join(sid, data):
    """User joins a specific analysis session (room)."""
    username = data.get("username", f"User-{sid[:4]}")
    await manager.connect_user(sid, {"username": username, "color": data.get("color")})
    
    room = "default" # Support multiple rooms later
    sio.enter_room(sid, room)
    
    # Broadcast to others that a user joined
    await sio.emit('user_joined', manager.active_users[sid], room=room, skip_sid=sid)
    
    # Send current state to new user (active users list)
    await sio.emit('sync_users', manager.get_room_users(room), to=sid)

@sio.event
async def cursor_move(sid, data):
    """Real-time cursor tracking."""
    # data: {x: 0.5, y: 0.5} (normalized coordinates)
    user_data = manager.update_cursor(sid, data.get("x", 0), data.get("y", 0))
    if user_data:
        # Broadcast cursor position (volatile=True means drop if network busy)
        await sio.emit('cursor_update', user_data, skip_sid=sid)

@sio.event
async def update_view(sid, data):
    """Sync camera/zoom state or filters."""
    # Broadcast view change to everyone else to sync views (Presentation Mode)
    await sio.emit('view_updated', data, skip_sid=sid)

@sio.event
async def annotation_add(sid, data):
    """User added a note/flag."""
    # data: { data_id, text, type }
    await sio.emit('annotation_broadcast', {
        "user": manager.active_users.get(sid, {}).get("name"),
        "annotation": data
    }, skip_sid=sid)

@sio.event
async def disconnect(sid):
    manager.disconnect_user(sid)
    await sio.emit('user_left', {"sid": sid})
    print(f"User disconnected: {sid}")
