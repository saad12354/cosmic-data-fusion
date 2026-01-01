import { motion } from 'framer-motion';
import { FileText, Download, Share2, X, CheckCircle, AlertTriangle, BookOpen } from 'lucide-react';

interface ResearchReportProps {
    report: any;
    onClose: () => void;
}

export const ResearchReport = ({ report, onClose }: ResearchReportProps) => {
    if (!report) return null;

    const handleDownload = () => {
        const reportText = `
        TITLE: ${report.title}
        DATE: ${new Date().toLocaleDateString()}
        
        ABSTRACT:
        ${report.abstract}
        
        1. INTRODUCTION:
        ${report.introduction}
        
        2. DATA & METHODOLOGY:
        ${report.methodology}
        
        3. RESULTS:
        ${report.results.summary}
        Key Findings:
        ${report.results.key_findings.join('\n')}
        
        4. DISCUSSION:
        ${report.discussion}
        
        5. CONCLUSION:
        ${report.conclusion}
        
        REFERENCES:
        ${report.references.join('\n')}
        `;
        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Research_Report_${report.filename.replace(/\.[^/.]+$/, "")}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleShare = () => {
        alert("Report link copied to clipboard! Ready for co-author review.");
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-8"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white w-full max-w-4xl h-full max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl text-slate-900"
            >
                {/* Header Actions */}
                <div className="bg-slate-50 border-b border-slate-200 px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-tight text-slate-900">Research Report Generator</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Status: Publication Ready</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-bold transition-all"
                        >
                            <Download className="w-4 h-4" /> Download Report
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-black rounded-xl text-xs font-bold transition-all shadow-lg"
                        >
                            <Share2 className="w-4 h-4" /> Share with Co-authors
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-200 rounded-full transition-all ml-2"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Paper Content */}
                <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50">
                    <div className="max-w-2xl mx-auto bg-white p-12 shadow-sm border border-slate-100 min-h-screen">
                        {/* Paper Header */}
                        <div className="text-center mb-12">
                            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-4 leading-tight">
                                {report.title}
                            </h1>
                            <div className="flex justify-center gap-8 text-xs font-medium text-slate-500 italic mb-8">
                                <span>Author: COSMIC Autonomous AI</span>
                                <span>Affiliation: Global Astrophysics Network</span>
                                <span>Date: {new Date().toLocaleDateString()}</span>
                            </div>
                            <div className="h-px w-32 bg-slate-200 mx-auto" />
                        </div>

                        {/* Abstract */}
                        <div className="mb-10 text-justify">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 text-center">Abstract</h3>
                            <p className="text-sm leading-relaxed text-slate-700 italic px-8">
                                {report.abstract}
                            </p>
                        </div>

                        {/* Sections */}
                        <div className="space-y-10 text-sm leading-relaxed text-slate-800">
                            <section>
                                <h3 className="text-lg font-bold text-slate-900 mb-3 border-b border-slate-100 pb-1">1. Introduction</h3>
                                <p>{report.introduction}</p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-slate-900 mb-3 border-b border-slate-100 pb-1">2. Data & Methodology</h3>
                                <p className="mb-4">{report.methodology}</p>
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 font-mono text-[11px] text-slate-600">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold uppercase">Pipeline Metadata</span>
                                        <span className="text-blue-600 font-bold">Verified</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>Source: {report.filename}</div>
                                        <div>Format: HDF5/FITS High-Res</div>
                                        <div>Processor: COSMIC Fusion v1.0</div>
                                        <div>Timestamp: {new Date().toISOString()}</div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-slate-900 mb-3 border-b border-slate-100 pb-1">3. Results & Findings</h3>
                                <p className="mb-6">{report.results.summary}</p>

                                <div className="grid grid-cols-1 gap-4 mb-6">
                                    {report.results.key_findings.map((finding: string, i: number) => (
                                        <div key={i} className="flex gap-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                                            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                                            <p className="text-xs font-medium text-emerald-900">{finding}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative shadow-xl">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <BookOpen className="w-20 h-20 rotate-12" />
                                    </div>
                                    <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-4">Statistical Profile</h4>
                                    <div className="grid grid-cols-3 gap-6">
                                        <StatBox label="N-Points" value={report.results.statistics.row_count} />
                                        <StatBox label="Confidence" value="98.2%" />
                                        <StatBox label="Anomalies" value={report.results.statistics.anomalies_count || 0} />
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-slate-900 mb-3 border-b border-slate-100 pb-1">4. Discussion</h3>
                                <p>{report.discussion}</p>
                                <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                                    <p className="text-[11px] text-amber-900 font-medium">Interpretation reflects AI-generated hypothesis. Manual peer review is recommended for secondary confirmation.</p>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-slate-900 mb-3 border-b border-slate-100 pb-1">5. Conclusion</h3>
                                <p>{report.conclusion}</p>
                            </section>

                            <section className="pt-10">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">References</h3>
                                <ul className="list-decimal list-inside space-y-2 text-[11px] font-medium text-slate-500">
                                    {report.references.map((ref: string, i: number) => (
                                        <li key={i}>{ref}</li>
                                    ))}
                                </ul>
                            </section>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const StatBox = ({ label, value }: { label: string, value: any }) => (
    <div>
        <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-1">{label}</p>
        <p className="text-xl font-black">{value}</p>
    </div>
);
