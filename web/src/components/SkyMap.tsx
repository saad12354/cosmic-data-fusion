import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { useMemo } from 'react';

// Custom tooltip to show object details
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-900 border border-white/10 p-4 rounded-lg shadow-xl backdrop-blur-md">
                <p className="text-accent-cyan font-bold mb-2">Object #{data.id}</p>
                <p className="text-slate-300 text-sm">RA: <span className="text-white">{data.x.toFixed(4)}°</span></p>
                <p className="text-slate-300 text-sm">Dec: <span className="text-white">{data.y.toFixed(4)}°</span></p>
                <p className="text-slate-300 text-sm">Flux: <span className="text-white">{data.value.toFixed(4)}</span></p>
            </div>
        );
    }
    return null;
};

interface SkyMapProps {
    data: any[];
}

export function SkyMap({ data }: SkyMapProps) {
    // Normalize flux for size (Z-axis) visualization
    const previewData = useMemo(() => {
        if (!data || data.length === 0) return [];
        return data;
    }, [data]);

    return (
        <div className="w-full h-full min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    style={{ cursor: 'crosshair' }}
                >
                    {/* Grid References for Sky Map effect */}
                    <ReferenceLine y={0} stroke="#334155" strokeDasharray="3 3" />
                    <ReferenceLine x={180} stroke="#334155" strokeDasharray="3 3" />

                    <XAxis
                        type="number"
                        dataKey="x"
                        name="RA"
                        unit="°"
                        domain={[0, 360]}
                        reversed
                        tick={{ fill: '#94a3b8' }}
                        stroke="#475569"
                        label={{ value: 'Right Ascension (RA)', position: 'insideBottom', offset: -10, fill: '#94a3b8' }}
                    />
                    <YAxis
                        type="number"
                        dataKey="y"
                        name="Dec"
                        unit="°"
                        domain={[-90, 90]}
                        tick={{ fill: '#94a3b8' }}
                        stroke="#475569"
                        label={{ value: 'Declination (Dec)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                    />
                    <ZAxis type="number" dataKey="value" range={[20, 400]} name="Flux" />
                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Objects" data={previewData} fill="#8884d8">
                        {previewData.map((_entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={index % 2 === 0 ? '#8b5cf6' : '#06b6d4'}
                                style={{ filter: 'drop-shadow(0 0 4px rgba(139, 92, 246, 0.5))' }}
                            />
                        ))}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
}
