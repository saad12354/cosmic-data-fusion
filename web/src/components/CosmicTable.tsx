import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Table, CheckCircle2, AlertTriangle, ArrowRight, X } from 'lucide-react';

const TableHeader = ({ children }: { children: React.ReactNode }) => (
    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/10 font-mono">
        {children}
    </th>
);

const TableCell = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <td className={`px-4 py-3 text-xs font-mono text-slate-300 border-b border-white/5 ${className}`}>
        {children}
    </td>
);

const StatusBadge = ({ status }: { status: string }) => {
    const isHot = status.toLowerCase() === 'hot' || status.toLowerCase() === 'anomaly' || status.toLowerCase() === 'warn';
    const isFail = status.toLowerCase() === 'fail' || status.toLowerCase() === 'critical';

    return (
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${isFail ? 'bg-red-500/10 border-red-500/30 text-red-400' :
            isHot ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
                'bg-green-500/10 border-green-500/30 text-green-400'
            }`}>
            {isFail || isHot ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
            <span className="text-[10px] uppercase font-bold tracking-tighter">
                {isFail ? '✕ FAIL' : isHot ? '⚠ WARN' : '✓ VALID'}
            </span>
        </div>
    );
};

export const CosmicTable = ({ data }: any) => {
    const [isFullView, setIsFullView] = useState(false);

    // If no data, show a message or empty state
    if (!data || data.length === 0) {
        return (
            <div className="glass-card bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-lg p-10 flex flex-col items-center justify-center text-center">
                <Table className="w-10 h-10 text-slate-600 mb-4" />
                <p className="text-slate-400 font-mono text-sm underline decoration-slate-800 underline-offset-8">AWAITING SYSTEM DATA...</p>
            </div>
        );
    }

    // Identify columns to display (exclude internal mapping keys like x, y, value, id if they are duplicates)
    const allKeys = Object.keys(data[0]);
    let displayKeys = allKeys.filter(k => !['id', 'x', 'y', 'value', 'status'].includes(k));

    // If no extra keys found, just show the coordinates and value
    if (displayKeys.length === 0) {
        displayKeys = allKeys.filter(k => k !== 'status').slice(0, 5);
    } else {
        displayKeys = displayKeys.slice(0, 5);
    }
    // Always include ID or Name first if it exists
    const nameKey = allKeys.find(k => k.toLowerCase() === 'name' || k.toLowerCase() === 'id') || allKeys[0];

    const finalCols = [nameKey, ...displayKeys.filter(k => k !== nameKey)].slice(0, 5);

    return (
        <section className="relative group">
            {/* Terminal Border Accents */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white/20 group-hover:border-accent-cyan/50 transition-colors z-20" />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-white/20 group-hover:border-accent-cyan/50 transition-colors z-20" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-white/20 group-hover:border-accent-cyan/50 transition-colors z-20" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white/20 group-hover:border-accent-cyan/50 transition-colors z-20" />

            <div className="glass-card bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-lg overflow-hidden transition-all group-hover:border-white/20">
                <div className="px-6 py-4 border-b border-white/10 bg-white/2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-accent-cyan/10 border border-accent-cyan/20">
                            <Table className="w-4 h-4 text-accent-cyan" />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                            Data Preview <span className="text-slate-500 font-normal">(Showing {Math.min(data.length, 5)} of {data?.length || 0} rows)</span>
                        </h3>
                    </div>
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500/20" />
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/20" />
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500/20" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-white/2">
                                {finalCols.map(col => (
                                    <TableHeader key={col}>{col.replace(/_/g, ' ')}</TableHeader>
                                ))}
                                <TableHeader>Status</TableHeader>
                            </tr>
                        </thead>
                        <tbody>
                            {data.slice(0, 5).map((row: any, idx: number) => (
                                <motion.tr
                                    key={row.id || idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="hover:bg-white/5 transition-colors cursor-pointer group/row"
                                >
                                    {finalCols.map((col, cIdx) => (
                                        <TableCell key={col} className={cIdx === 0 ? "text-white font-bold group-hover/row:text-accent-cyan transition-colors" : ""}>
                                            {typeof row[col] === 'number' ? row[col].toLocaleString(undefined, { maximumFractionDigits: 3 }) : String(row[col] ?? '--')}
                                        </TableCell>
                                    ))}
                                    <TableCell>
                                        <StatusBadge status={row.status || (row.value > 1000 ? 'hot' : 'valid')} />
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 bg-white/2 border-t border-white/5 flex justify-center">
                    <motion.button
                        whileHover={{ gap: '1rem' }}
                        onClick={() => setIsFullView(true)}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all group/btn"
                    >
                        [ View Full Dataset
                        <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                        ]
                    </motion.button>
                </div>
            </div>

            {/* Full View Modal */}
            <AnimatePresence>
                {isFullView && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12"
                    >
                        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setIsFullView(false)} />

                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="relative w-full max-w-6xl h-full max-h-[80vh] bg-slate-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl"
                        >
                            <div className="px-8 py-6 border-b border-white/10 bg-white/2 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20">
                                        <Table className="w-5 h-5 text-accent-cyan" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Extended Data Repository</h2>
                                        <p className="text-[10px] text-slate-500 font-mono mt-1">TOTAL PARSED RECORDS: {data.length}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsFullView(false)}
                                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                                <table className="w-full border-collapse">
                                    <thead className="sticky top-0 bg-slate-900 z-10">
                                        <tr>
                                            {finalCols.map(col => (
                                                <TableHeader key={col}>{col.replace(/_/g, ' ')}</TableHeader>
                                            ))}
                                            <TableHeader>Status</TableHeader>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {data.map((row: any, idx: number) => (
                                            <tr key={row.id || idx} className="hover:bg-white/5 transition-colors group/row">
                                                {finalCols.map((col, cIdx) => (
                                                    <TableCell key={col} className={cIdx === 0 ? "text-white font-bold group-hover/row:text-accent-cyan transition-colors" : ""}>
                                                        {typeof row[col] === 'number' ? row[col].toLocaleString(undefined, { maximumFractionDigits: 5 }) : String(row[col] ?? '--')}
                                                    </TableCell>
                                                ))}
                                                <TableCell>
                                                    <StatusBadge status={row.status || (row.value > 1000 ? 'hot' : 'valid')} />
                                                </TableCell>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

