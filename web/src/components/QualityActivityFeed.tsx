import { useState, useEffect } from 'react';
import { History, ShieldCheck, AlertTriangle, Bug, HelpCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const FLAG_CONFIG: any = {
    verified: { icon: ShieldCheck, color: 'text-green-400', label: 'Verified' },
    suspicious: { icon: AlertTriangle, color: 'text-yellow-400', label: 'Suspicious' },
    quality_issue: { icon: Bug, color: 'text-red-400', label: 'Equipment Error' },
    interesting: { icon: HelpCircle, color: 'text-blue-400', label: 'Needs Review' },
};

export function QualityActivityFeed() {
    const [feed, setFeed] = useState<any[]>([]);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const resp = await axios.get('http://127.0.0.1:8000/quality-feed');
                setFeed(resp.data);
            } catch (error) {
                console.error('Failed to fetch quality feed');
            }
        };
        fetchFeed();
        const interval = setInterval(fetchFeed, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass-card bg-slate-900/40 border border-white/10 rounded-3xl p-6 h-full flex flex-col shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-accent-purple" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Quality Timeline</h3>
                </div>
                <span className="text-[10px] font-bold text-accent-purple bg-accent-purple/10 px-2 py-1 rounded-lg border border-accent-purple/20">LIVE</span>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {feed.map((item) => {
                        const config = FLAG_CONFIG[item.flag_type] || FLAG_CONFIG.interesting;
                        const Icon = config.icon;

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="group p-4 bg-white/2 hover:bg-white/5 border border-white/5 rounded-2xl transition-all"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg bg-black/40 ${config.color}`}>
                                            <Icon className="w-3.5 h-3.5" />
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-tighter ${config.color}`}>
                                            {config.label}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-xs text-white font-medium mb-1 line-clamp-2">
                                    {item.comment}
                                </p>
                                <div className="flex items-center justify-between mt-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-4 h-4 rounded-full bg-accent-purple/20 flex items-center justify-center text-accent-purple border border-accent-purple/30">
                                            {item.user_id[0]?.toUpperCase()}
                                        </span>
                                        {item.user_id}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-accent-cyan">
                                        {item.filename}
                                        <ArrowRight className="w-2.5 h-2.5" />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {feed.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-30">
                        <History className="w-10 h-10 mb-4" />
                        <p className="text-xs font-bold uppercase tracking-widest">No activity yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
