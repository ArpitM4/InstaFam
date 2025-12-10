import React from 'react';
import { FaCheckCircle, FaDownload, FaCopy, FaExternalLinkAlt } from 'react-icons/fa';
import { toast } from 'sonner';

const VaultSuccessModal = ({ item, fanInput, creatorResponse, status, rejectionReason, onClose }) => {
    if (!item) return null;

    const isInstant = item.type === 'file' || item.type === 'text';
    const isRejectedOrCancelled = status === 'Rejected' || status === 'Cancelled';

    const getStatusBadge = () => {
        if (!status || status === 'Pending') return <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded inline-block mb-4">⏳ Pending</span>;
        if (status === 'Fulfilled') return <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded inline-block mb-4">✅ Fulfilled</span>;
        if (status === 'Rejected') return <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded inline-block mb-4">❌ Rejected</span>;
        if (status === 'Cancelled') return <span className="bg-gray-500/20 text-gray-400 text-xs px-2 py-1 rounded inline-block mb-4">⛔ Cancelled</span>;
        return null;
    };

    const handleCopy = () => {
        if (item.fileUrl) {
            navigator.clipboard.writeText(item.fileUrl);
            toast.success("Copied to clipboard!");
        }
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = item.fileUrl;
        link.download = item.title || 'download';
        link.target = '_blank'; // For cloud files
        link.click();
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
            <div className="bg-[#1a1a1f] p-8 rounded-2xl max-w-md w-full border border-white/10 text-center shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/30 hover:text-white"
                >
                    ✕
                </button>

                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary rounded-full flex items-center justify-center text-3xl mx-auto mb-6 border border-white/5">
                    {isInstant ? <FaCheckCircle className="text-green-400" /> : <FaCheckCircle />}
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">{isInstant ? "Unlocked!" : "Request Details"}</h3>
                <p className="text-white/60 mb-4">
                    {item.title}
                </p>
                {!isInstant && getStatusBadge()}

                {/* TYPE SPECIFIC CONTENT */}
                <div className="bg-black/40 rounded-xl p-4 border border-white/5 mb-6 text-left">

                    {/* FILE TYPE */}
                    {item.type === 'file' && (
                        <div className="text-center">
                            <p className="text-white/80 text-sm mb-4">Your file is ready for download.</p>
                            <button
                                onClick={handleDownload}
                                className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                            >
                                <FaDownload /> Download File
                            </button>
                        </div>
                    )}

                    {/* TEXT / SECRET TYPE */}
                    {item.type === 'text' && (
                        <div>
                            <p className="text-white/60 text-xs mb-2 uppercase font-bold tracking-wider">Secret Content:</p>
                            <div className="flex items-center gap-2 bg-white/5 p-3 rounded-lg border border-white/10 mb-2">
                                <code className="flex-1 text-primary font-mono text-sm break-all">
                                    {item.fileUrl || "No content provided"}
                                </code>
                                <button
                                    onClick={handleCopy}
                                    className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                                    title="Copy"
                                >
                                    <FaCopy />
                                </button>
                            </div>
                            {item.fileUrl && item.fileUrl.startsWith('http') && (
                                <a
                                    href={item.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline flex items-center gap-1 justify-center mt-2"
                                >
                                    Open Link <FaExternalLinkAlt />
                                </a>
                            )}
                        </div>
                    )}

                    {/* QnA TYPE */}
                    {item.type === 'qna' && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-white/60 text-xs uppercase font-bold tracking-wider mb-1">Your Question</p>
                                <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-white/90 text-sm">
                                    "{fanInput}"
                                </div>
                            </div>

                            {isRejectedOrCancelled && rejectionReason ? (
                                <div>
                                    <p className="text-red-400/80 text-xs uppercase font-bold tracking-wider mb-1">{status === 'Rejected' ? 'Rejection Reason' : 'Cancellation Reason'}</p>
                                    <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-red-100 text-sm">
                                        {rejectionReason}
                                    </div>
                                </div>
                            ) : creatorResponse ? (
                                <div>
                                    <p className="text-emerald-400/80 text-xs uppercase font-bold tracking-wider mb-1">Creator Answer</p>
                                    <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 text-emerald-100 text-sm">
                                        "{creatorResponse}"
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-white/40 text-center italic">Waiting for creator response...</p>
                            )}
                        </div>
                    )}

                    {/* PROMISE TYPE */}
                    {item.type === 'promise' && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-white/60 text-xs uppercase font-bold tracking-wider mb-1">Your Request Info</p>
                                <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-white/90 text-sm">
                                    "{fanInput}"
                                </div>
                            </div>

                            {isRejectedOrCancelled && rejectionReason ? (
                                <div>
                                    <p className="text-red-400/80 text-xs uppercase font-bold tracking-wider mb-1">{status === 'Rejected' ? 'Rejection Reason' : 'Cancellation Reason'}</p>
                                    <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-red-100 text-sm">
                                        {rejectionReason}
                                    </div>
                                </div>
                            ) : creatorResponse ? (
                                <div>
                                    <p className="text-emerald-400/80 text-xs uppercase font-bold tracking-wider mb-1">Creator Note</p>
                                    <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 text-emerald-100 text-sm">
                                        {creatorResponse}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-white/40 text-center italic">Waiting for update from creator...</p>
                            )}
                        </div>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="text-white/60 hover:text-white text-sm font-medium transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default VaultSuccessModal;
