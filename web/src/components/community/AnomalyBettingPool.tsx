import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, Trophy, ChevronRight, MessageSquare, Send, CheckCircle2, TrendingUp } from 'lucide-react';
import type { AnomalyChallenge } from './mockData';

interface AnomalyBettingPoolProps {
    challenge: AnomalyChallenge;
}

export const AnomalyBettingPool = ({ challenge }: AnomalyBettingPoolProps) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [hasVoted, setHasVoted] = useState(false);

    const handleVote = (optionId: string) => {
        if (!hasVoted) {
            setSelectedOption(optionId);
            setHasVoted(true);
        }
    };

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-accent-blue/10 to-accent-purple/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-blue/20 flex items-center justify-center text-accent-blue border border-accent-blue/30 shadow-lg shadow-accent-blue/10">
                        <Target className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-white">Anomaly Challenge #{challenge.challengeNumber}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live Discovery Pool
                        </p>
                    </div>
                </div>
                <div className="px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-accent-cyan" />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider">{challenge.resolvesIn} left</span>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6">
                <div className="space-y-4">
                    <h4 className="text-lg font-bold text-white leading-tight">
                        {challenge.title}
                    </h4>

                    {challenge.imageUrl && (
                        <div className="relative group rounded-2xl overflow-hidden border border-white/10 aspect-video lg:aspect-square max-h-[300px]">
                            <img
                                src={challenge.imageUrl}
                                alt="anomaly"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-bottom p-4">
                                <p className="text-[11px] text-slate-300 italic self-end bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                                    Raw Spectral Scan: Andromeda Sector X-92
                                </p>
                            </div>
                        </div>
                    )}

                    <p className="text-sm text-slate-400 leading-relaxed italic border-l-2 border-accent-blue/30 pl-4">
                        "The signal appears to have a coherent duty cycle of 12.4ms, which doesn't align with any known terrestrial RFI profiles..."
                    </p>
                </div>

                {/* Voting Section */}
                <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Cast your prediction
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                        {challenge.options.map((option) => {
                            const isSelected = selectedOption === option.id;
                            const percentage = Math.round((option.votes / challenge.totalVotes) * 100);

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => handleVote(option.id)}
                                    disabled={hasVoted}
                                    className={`group relative w-full p-4 rounded-2xl border transition-all overflow-hidden flex items-center justify-between ${isSelected
                                            ? 'bg-accent-blue/20 border-accent-blue'
                                            : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                                        }`}
                                >
                                    {/* Progress Bar background */}
                                    {hasVoted && (
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            className={`absolute inset-y-0 left-0 -z-10 ${isSelected ? 'bg-accent-blue/20' : 'bg-white/5'}`}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                        />
                                    )}

                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-accent-blue bg-accent-blue' : 'border-white/20'
                                            }`}>
                                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                            {option.label}
                                        </span>
                                        {isSelected && <span className="text-[10px] bg-accent-blue text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Your Pick</span>}
                                    </div>

                                    {hasVoted && (
                                        <div className="text-right">
                                            <span className="text-xs font-black text-white">{percentage}%</span>
                                            <p className="text-[8px] text-slate-500 uppercase font-bold">{option.votes} votes</p>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Top Contributors */}
                <div className="pt-4 border-t border-white/5 space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Top Research Contributors</h5>
                    <div className="space-y-3">
                        {challenge.topContributors.map((user, i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-xs text-accent-cyan">
                                            {user.name[0]}
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                                            <Trophy className="w-2.5 h-2.5 text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white group-hover:text-accent-blue transition-colors">{user.name}</p>
                                        <p className="text-[9px] text-slate-500 font-medium">{user.correctPredictions} correct predictions</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-accent-blue transition-all" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Footer */}
                <div className="pt-2 grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all">
                        <MessageSquare className="w-3.5 h-3.5" /> View Discussion
                    </button>
                    <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-accent-blue to-accent-purple hover:opacity-90 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg shadow-accent-blue/20">
                        <Send className="w-3.5 h-3.5" /> Submit Analysis
                    </button>
                </div>
            </div>

            {/* Resolving Footer */}
            <div className="p-4 bg-slate-800/40 text-center border-t border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    WINNER GETS <span className="text-accent-cyan">+500 REPUTATION</span> AND <span className="text-yellow-500">EXOPLANET SEEKER</span> BADGE
                </p>
            </div>
        </div>
    );
};
