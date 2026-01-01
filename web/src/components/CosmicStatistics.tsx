import { motion } from 'framer-motion';
import { Thermometer, Zap, Info, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

interface StatRowProps {
    label: string;
    value: string | number;
    unit?: string;
    color?: string;
    delay?: number;
}

const StatRow = ({ label, value, unit, color = "text-slate-300", delay = 0 }: StatRowProps) => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        className="flex justify-between items-center py-1 border-b border-white/5 last:border-0"
    >
        <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono">{label}</span>
        <div className="flex items-center gap-2">
            <span className={`text-sm font-bold font-mono ${color}`}>{value}</span>
            {unit && <span className="text-[10px] text-slate-500 font-mono italic">{unit}</span>}
        </div>
    </motion.div>
);

const QualityRow = ({ label, warn, fail, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        className="flex items-center gap-2 py-1"
    >
        {fail ? (
            <AlertTriangle className="w-3 h-3 text-red-500" />
        ) : warn ? (
            <AlertTriangle className="w-3 h-3 text-yellow-500" />
        ) : (
            <CheckCircle2 className="w-3 h-3 text-green-500" />
        )}
        <span className={`text-[10px] uppercase font-mono ${fail ? 'text-red-200/70' : warn ? 'text-yellow-200/70' : 'text-green-200/70'}`}>
            {fail ? '✕' : warn ? '⚠' : '✓'} {label}
        </span>
    </motion.div>
);

const SectionBox = ({ title, icon: Icon, children, accentColor }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group h-full"
    >
        {/* Decorative ASCII border corners */}
        <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-white/20 group-hover:border-white/40 transition-colors" />
        <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-right border-white/20 group-hover:border-white/40 transition-colors" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-white/20 group-hover:border-white/40 transition-colors" />
        <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-right border-white/20 group-hover:border-white/40 transition-colors" />

        <div className="glass-card bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 rounded-lg h-full transition-all group-hover:bg-slate-900/80 group-hover:border-white/20 group-hover:-translate-y-1 relative overflow-hidden">
            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] animate-pulse" />

            <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className={`p-2 rounded-lg bg-${accentColor}/10 border border-${accentColor}/20`}>
                    <Icon className={`w-4 h-4 text-${accentColor}`} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white">{title}</h3>
            </div>

            <div className="space-y-1 relative z-10">
                {children}
            </div>
        </div>
    </motion.div>
);

export const CosmicStatistics = ({ dataset }: any) => {
    if (!dataset) return null;

    const stats = dataset.statistics || {};
    const metadata = dataset.metadata || {};
    const ai = dataset.ai_analysis || {};

    const findBestCol = (keywords: string[]) => {
        if (!stats.samples) return null;
        return Object.keys(stats.samples).find(c =>
            keywords.some(kw => c.toLowerCase().includes(kw.toLowerCase()))
        ) || null;
    };

    const tempCol = findBestCol(['temp', 'teff', 'kelvin']);
    const brightCol = findBestCol(['bright', 'flux', 'mag', 'lum', 'value', 'intensity', 'val']);

    const renderMetricRows = (colName: string | null, unit: string, baseColor: string) => {
        if (!colName || !stats.samples?.[colName]) {
            return (
                <div className="py-4 flex flex-col items-center justify-center border-t border-white/5">
                    <span className="text-[10px] text-slate-500 font-mono uppercase">DATASTREAM NULL</span>
                    <span className="text-[9px] text-slate-600 font-mono italic">Column not found</span>
                </div>
            );
        }

        const s = stats.samples[colName];
        return (
            <>
                <div className="mb-2">
                    <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Tracking: {colName}</span>
                </div>
                <StatRow label="Mean" value={s.mean.toLocaleString()} unit={unit} color={baseColor} delay={0.1} />
                <StatRow label="Median" value={s['50%'].toLocaleString()} unit={unit} color="text-slate-300" delay={0.15} />
                <StatRow label="Min" value={s.min.toLocaleString()} unit={unit} color="text-blue-400" delay={0.2} />
                <StatRow label="Max" value={s.max.toLocaleString()} unit={unit} color="text-red-500" delay={0.25} />
            </>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {/* TEMPERATURE */}
            <SectionBox title="Temperature Info" icon={Thermometer} accentColor="orange-500">
                {renderMetricRows(tempCol, "K", "text-orange-400")}
            </SectionBox>

            {/* BRIGHTNESS */}
            <SectionBox title="Luminosity Intel" icon={Zap} accentColor="yellow-400">
                {renderMetricRows(brightCol, "Flux", "text-yellow-400")}
            </SectionBox>

            {/* DATA QUALITY */}
            <SectionBox title="Integrity Report" icon={ShieldCheck} accentColor="emerald-400">
                <div className="mb-4">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] text-slate-500 font-mono uppercase">Score</span>
                        <span className="text-xl font-black font-mono text-emerald-400">{dataset.quality_report?.score || 0}/100</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full border border-white/10 p-[1px] overflow-hidden">
                        <motion.div
                            key={dataset.quality_report?.score}
                            initial={{ width: 0 }}
                            animate={{ width: `${dataset.quality_report?.score || 0}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-emerald-500/50 rounded-full"
                        />
                    </div>
                </div>

                <div className="space-y-0">
                    {(dataset.quality_report?.checks || []).slice(0, 3).map((check: any, i: number) => (
                        <QualityRow
                            key={i}
                            label={check.label}
                            warn={check.status === 'warn'}
                            fail={check.status === 'fail'}
                            delay={0.3 + (i * 0.05)}
                        />
                    ))}
                </div>
            </SectionBox>

            {/* DATASET INFO */}
            <SectionBox title="Meta Analysis" icon={Info} accentColor="blue-400">
                <StatRow label="Rows" value={metadata.row_count || 0} color="text-white" delay={0.5} />
                <StatRow label="Features" value={metadata.columns?.length || 0} color="text-slate-300" delay={0.55} />
                <StatRow label="Anomalies" value={ai.anomalies_count || 0} color={ai.anomalies_count > 0 ? "text-red-400" : "text-green-400"} delay={0.6} />
                <StatRow label="Format" value={dataset.format || "CSV"} color="text-accent-cyan" delay={0.65} />
            </SectionBox>
        </div>
    );
};

