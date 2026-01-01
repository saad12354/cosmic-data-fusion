import { MousePointer2 } from 'lucide-react';
import type { UserCursor } from '../hooks/useCollaboration';

interface PresenceCursorsProps {
    cursors: UserCursor[];
}

export function PresenceCursors({ cursors }: PresenceCursorsProps) {
    return (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
            {cursors.map(cursor => (
                <div
                    key={cursor.id}
                    className="absolute transition-all duration-100 ease-linear flex flex-col items-start"
                    style={{
                        left: `${cursor.x * 100}%`,
                        top: `${cursor.y * 100}%`,
                    }}
                >
                    <MousePointer2
                        className="w-4 h-4"
                        style={{ fill: cursor.color, color: cursor.color }}
                    />
                    <span
                        className="ml-4 -mt-3 text-xs px-2 py-0.5 rounded-full text-white font-bold whitespace-nowrap"
                        style={{ backgroundColor: cursor.color }}
                    >
                        {cursor.name}
                    </span>
                </div>
            ))}
        </div>
    );
}
