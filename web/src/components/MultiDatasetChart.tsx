import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const MultiDatasetChart = ({ datasets }) => {
    // Datasets prop structure:
    // [ { name: "Hubble", color: "#8884d8", data: [{x: 10, y: 20, z: 5}, ...] }, ... ]

    return (
        <div className="w-full h-[500px] glass-panel p-4">
            <h3 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Cross-Dataset Comparison
            </h3>
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                        type="number"
                        dataKey="x"
                        name="RA"
                        unit="°"
                        stroke="#94a3b8"
                        label={{ value: 'Right Ascension', position: 'insideBottom', offset: -10, fill: '#94a3b8' }}
                    />
                    <YAxis
                        type="number"
                        dataKey="y"
                        name="Dec"
                        unit="°"
                        stroke="#94a3b8"
                        label={{ value: 'Declination', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                    />
                    <ZAxis type="number" dataKey="z" range={[50, 400]} name="Brightness" />
                    <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                        itemStyle={{ color: '#f8fafc' }}
                    />
                    <Legend />

                    {datasets.map((ds, index) => (
                        <Scatter
                            key={ds.name}
                            name={ds.name}
                            data={ds.data}
                            fill={ds.color}
                            shape="circle"
                        />
                    ))}
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
};
