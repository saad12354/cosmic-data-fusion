import { Activity, AlertTriangle, Database, CheckCircle2 } from 'lucide-react';

export const StatisticsCard = ({ stats, quality }) => {
    /*
      stats: { count: 1200, mean: 45.2, std: 12.1 }
      quality: { missing_percentage: 2.5, outlier_count: 15 }
    */

    if (!stats) return null;

    return (
        <div className="glass-card bg-slate-900/50 border border-white/10 p-6 rounded-xl">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-accent-blue" />
                    Statistical Overview
                </h3>
                {quality?.missing_percentage < 5 ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> High Quality
                    </span>
                ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Data Gaps
                    </span>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-lg">
                    <span className="text-xs text-slate-400 block mb-1">Total Objects</span>
                    <span className="text-2xl font-mono font-bold text-white">{stats.count || 0}</span>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                    <span className="text-xs text-slate-400 block mb-1">Mean Flux</span>
                    <span className="text-2xl font-mono font-bold text-accent-cyan">{stats.mean ? stats.mean.toFixed(2) : 'N/A'}</span>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                    <span className="text-xs text-slate-400 block mb-1">Std Deviation</span>
                    <span className="text-2xl font-mono font-bold text-accent-purple">{stats.std ? stats.std.toFixed(2) : 'N/A'}</span>
                </div>
                <div className="bg-white/5 p-4 rounded-lg relative overflow-hidden">
                    {/* Simple progress bar for data completeness */}
                    <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-red-500 to-green-500 w-full opacity-30"></div>
                    <div
                        className="absolute bottom-0 left-0 h-1 bg-white"
                        style={{ width: `${100 - (quality?.missing_percentage || 0)}%` }}
                    ></div>
                    <span className="text-xs text-slate-400 block mb-1">Completeness</span>
                    <span className="text-2xl font-mono font-bold text-white">
                        {(100 - (quality?.missing_percentage || 0)).toFixed(1)}%
                    </span>
                </div>
            </div>
        </div>
    );
};
