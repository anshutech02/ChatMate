import React, { useState } from 'react';
import axios from '../api/axiosconfig';

const UploadContextCard = ({ customContext, onCustomContextChange, onFileParsed }) => {
    const [uploading, setUploading] = useState(false);
    const [fileName, setFileName] = useState('');
    const [fileSize, setFileSize] = useState('');
    const [charCount, setCharCount] = useState(0);
    const [uploadError, setUploadError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [showTextInput, setShowTextInput] = useState(false);

    const processFile = async (file) => {
        if (!file) return;

        const allowed = ['application/pdf', 'text/plain'];
        if (!allowed.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
            setUploadError('Only PDF (.pdf) and Text (.txt) files are supported.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setUploadError('File exceeds 10MB limit.');
            return;
        }

        setUploading(true);
        setUploadError('');
        setFileName(file.name);
        setFileSize((file.size / 1024).toFixed(1) + ' KB');

        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await axios.post('/api/context/parse-file', formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                const text = res.data.text || '';
                onCustomContextChange(text);
                setCharCount(text.length);
                if (onFileParsed) onFileParsed(file.name, text);
                if (res.data.truncated) {
                    setUploadError('Document is extensive; extracted the first 8,000 characters for optimal AI memory.');
                }
            }
        } catch (err) {
            console.error('File parse error:', err);
            setUploadError(err.response?.data?.message || err.response?.data?.error || 'Failed to extract text from document.');
            setFileName('');
        } finally {
            setUploading(false);
        }
    };

    const handleClear = () => {
        setFileName('');
        setFileSize('');
        setCharCount(0);
        onCustomContextChange('');
        setUploadError('');
        if (onFileParsed) onFileParsed('', '');
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-md p-5 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg">
                        <i className="ri-folder-upload-line" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            Attach Context Document <span className="text-[11px] font-normal text-zinc-400">(Optional)</span>
                        </h4>
                        <p className="text-xs text-zinc-400">
                            Upload PDF or TXT to prime the model with domain knowledge.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowTextInput(!showTextInput)}
                        className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                        <i className={showTextInput ? "ri-arrow-up-s-line" : "ri-edit-line"} />
                        <span>{showTextInput ? "Hide Text Input" : "Write Custom Text"}</span>
                    </button>
                    <span className="text-[11px] px-2.5 py-1 rounded-md bg-white/5 text-zinc-400 border border-white/5">
                        PDF/TXT ≤ 10MB
                    </span>
                </div>
            </div>

            {/* Dropzone Card */}
            {!fileName ? (
                <label
                    htmlFor="context-panel-file-input"
                    className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 text-center ${
                        isDragging
                            ? 'border-cyan-400 bg-cyan-500/10'
                            : 'border-indigo-500/30 hover:border-indigo-400/60 bg-indigo-500/[0.03] hover:bg-indigo-500/[0.07]'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) processFile(file);
                    }}
                >
                    <input
                        id="context-panel-file-input"
                        type="file"
                        accept=".pdf,.txt,application/pdf,text/plain"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) processFile(file);
                        }}
                        className="hidden"
                        disabled={uploading}
                    />
                    {uploading ? (
                        <div className="flex flex-col items-center gap-2 py-2">
                            <i className="ri-loader-4-line ri-spin text-2xl text-indigo-400" />
                            <span className="text-xs font-semibold text-white">
                                Parsing and extracting document text...
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3.5 flex-wrap justify-center py-1">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-300 text-xl">
                                <i className="ri-upload-cloud-line" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-semibold text-white">
                                    Click or Drag & Drop PDF / TXT document
                                </p>
                                <p className="text-[11px] text-zinc-400 mt-0.5">
                                    Reports, articles, agreements, study notes, or research papers
                                </p>
                            </div>
                        </div>
                    )}
                </label>
            ) : (
                /* Extracted file status card */
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 shadow-md">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-lg shrink-0">
                            <i className={fileName.endsWith('.pdf') ? 'ri-file-pdf-fill' : 'ri-file-text-fill'} />
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                                {fileName}
                            </div>
                            <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 mt-0.5">
                                <span>✓ {fileSize}</span>
                                <span>•</span>
                                <span>{charCount.toLocaleString()} chars extracted & attached</span>
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClear}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Remove attached document"
                    >
                        <i className="ri-delete-bin-line text-sm" />
                    </button>
                </div>
            )}

            {uploadError && (
                <p className="text-xs text-rose-400 mt-2.5 flex items-center gap-1.5">
                    <i className="ri-error-warning-line" />
                    <span>{uploadError}</span>
                </p>
            )}

            {/* Optional Written Text Box */}
            {showTextInput && (
                <div className="mt-3.5 pt-3 border-t border-white/5">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-zinc-300">
                            Custom Prompt Instructions / Guidelines
                        </span>
                        {customContext && (
                            <span className="text-[11px] text-indigo-400">
                                {customContext.length} chars
                            </span>
                        )}
                    </div>
                    <textarea
                        className="w-full rounded-xl bg-white/[0.04] border border-white/10 p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-y min-h-[80px]"
                        placeholder="Add specific instructions, target audience details, or background facts..."
                        value={customContext}
                        onChange={(e) => onCustomContextChange(e.target.value)}
                        rows={3}
                    />
                </div>
            )}
        </div>
    );
};

export default UploadContextCard;
