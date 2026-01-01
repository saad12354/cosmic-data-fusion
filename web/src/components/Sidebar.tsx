import { LayoutDashboard, Users, Settings, History, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    user: string;
    onLogout: () => void;
}

export function Sidebar({ activeTab, setActiveTab, user, onLogout }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'forum', icon: Users, label: 'Community' },
        { id: 'history', icon: History, label: 'Observation History' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <aside
            className={`fixed left-0 top-0 h-screen bg-slate-900/80 backdrop-blur-xl border-r border-white/5 transition-all duration-300 z-[60] flex flex-col ${isCollapsed ? 'w-20' : 'w-64'}`}
        >
            <div className="p-6 flex items-center justify-between">
                {!isCollapsed && (
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-cyan to-accent-purple">
                        COSMIC
                    </span>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 hover:bg-white/5 rounded-lg text-slate-400"
                >
                    {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${activeTab === item.id
                                ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-accent-blue' : 'group-hover:text-white'}`} />
                        {!isCollapsed && <span className="font-medium">{item.label}</span>}
                        {activeTab === item.id && !isCollapsed && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-blue shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                        )}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-white/5">
                <div className={`flex items-center gap-4 p-4 rounded-xl bg-white/5 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center border border-accent-purple/50 shrink-0">
                        <span className="text-xs font-bold text-accent-purple">{user[0].toUpperCase()}</span>
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 truncate">
                            <p className="text-sm font-bold text-white truncate">{user}</p>
                            <p className="text-[10px] text-slate-500">Explorer Node</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={onLogout}
                    className={`w-full flex items-center gap-4 px-4 py-3 mt-4 text-red-400 hover:bg-red-400/5 rounded-xl transition-all ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <LogOut className="w-5 h-5" />
                    {!isCollapsed && <span className="font-medium">Sign Out</span>}
                </button>
            </div>
        </aside>
    );
}
