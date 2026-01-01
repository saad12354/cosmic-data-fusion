import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell, ComposedChart, Line
} from 'recharts';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PointMaterial } from '@react-three/drei';
import { LayoutDashboard, BarChart3, Box, Layers, Settings2, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { DataAnnotationOverlay } from './DataAnnotationOverlay';
import { ResearchReport } from './ResearchReport';
import { FileText, Loader2 } from 'lucide-react';

interface CosmicVisualizationProps {
    dataset: any;
    user: string;
}

const TABS = [
    { id: 'scatter', label: 'Scatter Plot', icon: LayoutDashboard },
    { id: 'histogram', label: 'Histogram', icon: BarChart3 },
    { id: 'box', label: 'Box Plot', icon: Box },
    { id: '3d', label: '3D Plot', icon: Layers },
];

export const CosmicVisualization = ({ dataset, user }: CosmicVisualizationProps) => {
    const [activeTab, setActiveTab] = useState('scatter');
    const [annotations, setAnnotations] = useState<any[]>([]);
    const [selectedPoint, setSelectedPoint] = useState<any>(null);
    const [qualityFilter, setQualityFilter] = useState('all');
    const [generatingReport, setGeneratingReport] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    useEffect(() => {
        if (dataset?.id) {
            fetchAnnotations();
        }
    }, [dataset?.id]);

    const fetchAnnotations = async () => {
        try {
            const resp = await axios.get(`http://127.0.0.1:8000/datasets/${dataset.id}/annotations`);
            setAnnotations(resp.data);
        } catch (error) {
            console.error('Failed to fetch annotations');
        }
    };
    const data = dataset?.preview || [];
    const numericCols = dataset?.statistics?.numeric_columns || [];

    const filteredData = useMemo(() => {
        return data.filter((point: any) => {
            const annotation = annotations.find(a => a.data_object_id === point.id || a.original_id === point.id.toString());
            if (qualityFilter === 'all') return true;
            if (qualityFilter === 'verified') return annotation?.flag_type === 'verified';
            if (qualityFilter === 'suspicious') return annotation?.flag_type === 'suspicious';
            if (qualityFilter === 'clean') return annotation?.flag_type !== 'quality_issue';
            return true;
        });
    }, [data, annotations, qualityFilter]);

    const handleGenerateReport = async () => {
        setGeneratingReport(true);
        try {
            const resp = await axios.get(`http://127.0.0.1:8000/datasets/${dataset.id}/report`);
            setReportData(resp.data);
        } catch (error) {
            console.error('Failed to generate report');
        } finally {
            setGeneratingReport(false);
        }
    };

    // Controls State
    const [xAxis, setXAxis] = useState(numericCols[0] || 'x');
    const [yAxis, setYAxis] = useState(numericCols[1] || 'y');
    const [zAxis, setZAxis] = useState(numericCols[2] || 'value');

    // Process data for Histogram
    const histogramData = useMemo(() => {
        if (!filteredData.length || !xAxis) return [];
        const values = filteredData.map((d: any) => d[xAxis]).filter((v: any) => !isNaN(v));
        const min = Math.min(...values);
        const max = Math.max(...values);
        const binCount = 20;
        const binWidth = (max - min) / binCount;

        const bins = Array.from({ length: binCount }, (_, i) => ({
            binStart: min + i * binWidth,
            binEnd: min + (i + 1) * binWidth,
            count: 0,
            name: `${(min + i * binWidth).toFixed(1)} - ${(min + (i + 1) * binWidth).toFixed(1)}`
        }));

        values.forEach((v: number) => {
            const binIdx = Math.min(Math.floor((v - min) / binWidth), binCount - 1);
            if (binIdx >= 0) bins[binIdx].count++;
        });

        return bins;
    }, [data, xAxis]);

    // Process data for Box Plot (Simplified)
    const boxPlotData = useMemo(() => {
        if (!data.length || !xAxis) return [];
        const values = data.map((d: any) => d[xAxis]).filter((v: any) => !isNaN(v)).sort((a: any, b: any) => a - b);
        const q1 = values[Math.floor(values.length * 0.25)];
        const median = values[Math.floor(values.length * 0.5)];
        const q3 = values[Math.floor(values.length * 0.75)];
        const min = values[0];
        const max = values[values.length - 1];

        return [{
            name: xAxis,
            min, q1, median, q3, max
        }];
    }, [data, xAxis]);

    // 3D Point Cloud Data
    const pointPositions = useMemo(() => {
        if (!data.length) return new Float32Array(0);
        const positions = new Float32Array(data.length * 3);

        // Normalize values for 3D space [-5, 5]
        const getNorm = (key: string) => {
            const values = data.map((d: any) => d[key]);
            const min = Math.min(...values);
            const max = Math.max(...values);
            return (val: number) => ((val - min) / (max - min) - 0.5) * 10;
        };

        const normX = getNorm(xAxis);
        const normY = getNorm(yAxis);
        const normZ = getNorm(zAxis);

        data.forEach((d: any, i: number) => {
            positions[i * 3] = normX(d[xAxis]);
            positions[i * 3 + 1] = normY(d[yAxis]);
            positions[i * 3 + 2] = normZ(d[zAxis]);
        });

        return positions;
    }, [data, xAxis, yAxis, zAxis]);

    return (
        <section className="glass-card bg-slate-900/40 border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[700px] shadow-2xl">
            {/* Header / Tabs */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/2 backdrop-blur-md relative z-20">
                <div className="flex gap-2 p-1 bg-black/40 rounded-2xl border border-white/5">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${active ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 ${active ? 'text-accent-cyan' : ''}`} />
                                {tab.label}
                                {active && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white/10 rounded-xl -z-10 border border-white/10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-accent-blue animate-pulse" />
                    Interactive Visualization Engine
                </h3>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleGenerateReport}
                        disabled={generatingReport}
                        className="group relative px-6 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:opacity-50 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95 flex items-center gap-2"
                    >
                        {generatingReport ? (
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                        ) : (
                            <FileText className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
                        )}
                        {generatingReport ? 'Analyzing Data...' : 'Generate Report'}
                    </button>
                </div>
            </div>

            {/* Main Graph Area */}
            <div className="flex-1 relative overflow-hidden bg-black/20">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        className="w-full h-full p-8"
                    >
                        {activeTab === 'scatter' && (
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis
                                        type="number"
                                        dataKey={xAxis}
                                        name={xAxis}
                                        stroke="#475569"
                                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                                        label={{ value: xAxis, position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                                    />
                                    <YAxis
                                        type="number"
                                        dataKey={yAxis}
                                        name={yAxis}
                                        stroke="#475569"
                                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                                        label={{ value: yAxis, angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                                    />
                                    <ZAxis type="number" dataKey={zAxis} range={[20, 400]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Scatter
                                        name="Star Clusters"
                                        data={filteredData}
                                        onClick={(point) => setSelectedPoint(point.payload)}
                                        cursor="pointer"
                                    >
                                        {filteredData.map((point: any, index: number) => {
                                            const annotation = annotations.find(a => a.data_object_id === point.id || a.original_id === point.id.toString());
                                            let color = index % 2 === 0 ? '#3b82f6' : '#8b5cf6';

                                            if (annotation) {
                                                if (annotation.flag_type === 'verified') color = '#22c55e';
                                                if (annotation.flag_type === 'suspicious') color = '#eab308';
                                                if (annotation.flag_type === 'quality_issue') color = '#ef4444';
                                                if (annotation.flag_type === 'interesting') color = '#06b6d4';
                                            }

                                            return (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={color}
                                                    style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
                                                />
                                            );
                                        })}
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                        )}

                        {activeTab === 'histogram' && (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={histogramData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis dataKey="name" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 8 }} />
                                    <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                                    />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {histogramData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill="#06b6d4" fillOpacity={0.6 + (index / 40)} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}

                        {activeTab === 'box' && (
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={boxPlotData} margin={{ top: 40, right: 100, bottom: 40, left: 100 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis dataKey="name" stroke="#475569" tick={{ fill: '#94a3b8' }} />
                                    <YAxis stroke="#475569" tick={{ fill: '#94a3b8' }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />

                                    {/* Box part (Q1 to Q3) */}
                                    <Bar dataKey="q3" fill="#8b5cf6" fillOpacity={0.3} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="q1" fill="#0f172a" fillOpacity={1} radius={[0, 0, 4, 4]} />

                                    {/* Median Line */}
                                    <Line type="monotone" dataKey="median" stroke="#fff" strokeWidth={3} dot={false} />

                                    {/* Whisker Lines */}
                                    <Line type="monotone" dataKey="min" stroke="#ff4d4d" strokeDasharray="5 5" dot={true} />
                                    <Line type="monotone" dataKey="max" stroke="#00e600" strokeDasharray="5 5" dot={true} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        )}

                        {activeTab === '3d' && (
                            <div className="w-full h-full rounded-2xl overflow-hidden border border-white/5 relative">
                                <Canvas camera={{ position: [10, 10, 10], fov: 45 }}>
                                    <ambientLight intensity={0.5} />
                                    <pointLight position={[10, 10, 10]} />
                                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                                    <points>
                                        <bufferGeometry>
                                            <bufferAttribute
                                                attach="attributes-position"
                                                count={pointPositions.length / 3}
                                                array={pointPositions}
                                                itemSize={3}
                                                args={[pointPositions, 3]}
                                            />
                                        </bufferGeometry>
                                        <PointMaterial
                                            transparent
                                            color="#06b6d4"
                                            size={0.15}
                                            sizeAttenuation={true}
                                            depthWrite={false}
                                        />
                                    </points>

                                    <OrbitControls enablePan={true} enableZoom={true} />
                                </Canvas>

                                <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10">
                                    <p className="text-[10px] text-slate-400 font-mono">
                                        X: {xAxis} | Y: {yAxis} | Z: {zAxis}
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <AnimatePresence>
                    {selectedPoint && (
                        <DataAnnotationOverlay
                            datasetId={dataset.id}
                            pointData={selectedPoint}
                            user={user}
                            onClose={() => setSelectedPoint(null)}
                            onAnnotationAdded={fetchAnnotations}
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {reportData && (
                        <ResearchReport
                            report={reportData}
                            onClose={() => setReportData(null)}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Footer / Controls */}
            <div className="px-8 py-6 border-t border-white/5 bg-white/2 backdrop-blur-md flex items-center gap-8 relative z-20">
                <div className="flex items-center gap-3">
                    <Settings2 className="w-5 h-5 text-accent-cyan" />
                    <span className="text-xs font-black uppercase text-white tracking-widest">Graph Controls</span>
                </div>

                <div className="flex-1 flex gap-6">
                    <ControlSelect label="X Axis" value={xAxis} onChange={setXAxis} options={numericCols} />
                    <ControlSelect label="Y Axis" value={yAxis} onChange={setYAxis} options={numericCols} />
                    <ControlSelect label="Z Axis" value={zAxis} onChange={setZAxis} options={numericCols} />
                    <div className="flex-1 flex flex-col gap-1.5">
                        <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider ml-1">Quality Filter</span>
                        <div className="relative group">
                            <select
                                value={qualityFilter}
                                onChange={(e) => setQualityFilter(e.target.value)}
                                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white appearance-none outline-none focus:border-accent-cyan/50 hover:bg-slate-800 transition-all cursor-pointer"
                            >
                                <option value="all">Show All Points</option>
                                <option value="verified">Verified Only</option>
                                <option value="suspicious">Flag Suspicious</option>
                                <option value="clean">Hide Quality Issues</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none group-hover:text-accent-cyan transition-colors" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const ControlSelect = ({ label, value, onChange, options }: any) => {
    return (
        <div className="flex-1 flex flex-col gap-1.5">
            <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider ml-1">{label}</span>
            <div className="relative group">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white appearance-none outline-none focus:border-accent-cyan/50 hover:bg-slate-800 transition-all cursor-pointer"
                >
                    {options.map((opt: string) => (
                        <option key={opt} value={opt} className="bg-slate-900">{opt}</option>
                    ))}
                    {!options.length && <option value={value}>{value}</option>}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none group-hover:text-accent-cyan transition-colors" />
            </div>
        </div>
    );
};
