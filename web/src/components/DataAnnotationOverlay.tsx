import { useState } from 'react';
import { X, ShieldCheck, AlertTriangle, HelpCircle, Bug, Send, User } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

interface DataAnnotationOverlayProps {
    datasetId: number;
    pointData: any;
    onClose: () => void;
    user: string;
    onAnnotationAdded: () => void;
}

const FLAG_TYPES = [
    { id: 'verified', label: 'Verified', icon: ShieldCheck, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
    { id: 'suspicious', label: 'Suspicious', icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
    { id: 'quality_issue', label: 'Equipment Error', icon: Bug, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
    { id: 'interesting', label: 'Needs Review', icon: HelpCircle, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
];

export function DataAnnotationOverlay({ datasetId, pointData, onClose, user, onAnnotationAdded }: DataAnnotationOverlayProps) {
    const [selectedFlag, setSelectedFlag] = useState(FLAG_TYPES[0].id);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!comment.trim()) return;
        setIsSubmitting(true);
        try {
            await axios.post('http://127.0.0.1:8000/annotations', null, {
                params: {
                    dataset_id: datasetId,
                    data_object_id: pointData.id.toString(),
                    user_id: user,
                    flag_type: selectedFlag,
                    comment: comment
                }
            });
            onAnnotationAdded();
            onClose();
        } catch (error) {
            console.error('Failed to submit annotation:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl z-[100] overflow-hidden"
        >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                    <h4 className="text-lg font-bold text-white">Annotate Data Point</h4>
                    <p className="text-[10px] text-slate-500 font-mono">ID: {pointData.id} • VAL: {pointData.value?.toFixed(4)}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="p-6 space-y-6">
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Flag Status</label>
                    <div className="grid grid-cols-2 gap-2">
                        {FLAG_TYPES.map(flag => {
                            const Icon = flag.icon;
                            const isActive = selectedFlag === flag.id;
                            return (
                                <button
                                    key={flag.id}
                                    onClick={() => setSelectedFlag(flag.id)}
                                    className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-xs font-bold ${isActive
                                            ? `${flag.bg} ${flag.border} ${flag.color}`
                                            : 'bg-white/2 border-white/5 text-slate-400 hover:bg-white/5'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {flag.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Researcher Notes</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Explain your finding (e.g., 'Likely cosmic ray hit', 'Verified via secondary source')"
                        className="w-full h-24 bg-black/20 border border-white/5 rounded-xl p-4 text-xs text-white outline-none focus:border-accent-cyan/50 resize-none"
                    />
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-white/2 p-3 rounded-xl">
                    <User className="w-3 h-3" />
                    Acting as: <span className="text-accent-purple font-bold">{user}</span>
                </div>

                <button
                    disabled={isSubmitting || !comment.trim()}
                    onClick={handleSubmit}
                    className="w-full py-3 bg-accent-blue hover:bg-accent-blue/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-accent-blue/20"
                >
                    {isSubmitting ? 'Syncing...' : 'Save Annotation'}
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}
