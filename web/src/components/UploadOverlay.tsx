import React, { useCallback, useState } from 'react';
import axios from 'axios';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface UploadOverlayProps {
    onClose: () => void;
    onUploadComplete: (data: any) => void;
}

export function UploadOverlay({ onClose, onUploadComplete }: UploadOverlayProps) {
    const [isDragActive, setIsDragActive] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragActive(true);
        } else if (e.type === "dragleave") {
            setIsDragActive(false);
        }
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await processFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            await processFile(e.target.files[0]);
        }
    };

    const processFile = async (file: File) => {
        setUploadStatus('uploading');
        setErrorMessage(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Step 1: Upload and Analyze
            setUploadStatus('processing');
            // Add a fake delay for "Premium" feel if it's too fast
            await new Promise(r => setTimeout(r, 1500));

            const response = await axios.post('http://127.0.0.1:8000/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setUploadStatus('success');
            setTimeout(() => {
                onUploadComplete(response.data);
                onClose();
            }, 1000);

        } catch (err: any) {
            console.error(err);
            setUploadStatus('error');
            setErrorMessage(err.response?.data?.detail || "Failed to process cosmic data.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-2xl bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass-panel">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Upload className="w-5 h-5 text-accent-cyan" />
                        Ingest Dataset
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* content */}
                <div className="p-8">
                    {uploadStatus === 'idle' || uploadStatus === 'uploading' ? (
                        <div
                            className={twMerge(
                                "border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer group",
                                isDragActive ? "border-accent-cyan bg-accent-cyan/10" : "border-slate-700 hover:border-slate-500 hover:bg-slate-800/50"
                            )}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-upload')?.click()}
                        >
                            <input type="file" id="file-upload" className="hidden" onChange={handleFileInput} accept=".fits,.csv,.h5" />

                            <div className={clsx("p-4 rounded-full bg-slate-800 mb-4 transition-transform duration-500", isDragActive && "scale-110")}>
                                <Upload className="w-8 h-8 text-accent-blue" />
                            </div>

                            <h4 className="text-lg font-semibold text-white mb-2">Drag & Drop your FITS/CSV here</h4>
                            <p className="text-slate-400 text-sm max-w-sm">
                                Support for FITS (Standard), CSV (Tabular), and HDF5 (Hierarchical).
                                Automatic coordinate conversion to ICRS enabled.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            {uploadStatus === 'processing' && (
                                <>
                                    <Loader2 className="w-12 h-12 text-accent-purple animate-spin" />
                                    <h4 className="text-xl font-bold mt-6 bg-clip-text text-transparent bg-gradient-to-r from-accent-purple to-pink-500">
                                        Harmonizing Data...
                                    </h4>
                                    <p className="text-slate-400 mt-2">Standardizing coordinates to ICRS • Converting units</p>
                                </>
                            )}

                            {uploadStatus === 'success' && (
                                <>
                                    <CheckCircle className="w-16 h-16 text-green-500 animate-in zoom-in duration-300" />
                                    <h4 className="text-xl font-bold mt-4 text-white">Ingestion Complete</h4>
                                </>
                            )}

                            {uploadStatus === 'error' && (
                                <>
                                    <AlertCircle className="w-12 h-12 text-red-500" />
                                    <h4 className="text-xl font-bold mt-4 text-white">Ingestion Failed</h4>
                                    <p className="text-red-400 mt-2">{errorMessage}</p>
                                    <button
                                        onClick={() => setUploadStatus('idle')}
                                        className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-sm font-medium transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-slate-950/50 p-4 border-t border-white/5 flex justify-between items-center text-xs text-slate-500 px-8">
                    <div className="flex gap-4">
                        <span>SECURE TRANSMISSION</span>
                        <span>TLS 1.3 ENCRYPTED</span>
                    </div>
                    <div>v1.0.4-alpha</div>
                </div>
            </div>
        </div>
    );
}
