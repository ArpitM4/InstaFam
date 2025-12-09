import React from 'react';
import { FaCheckCircle, FaDownload, FaCopy, FaExternalLinkAlt } from 'react-icons/fa';
import { toast } from 'sonner';

const VaultSuccessModal = ({ item, fanInput, onClose }) => {
    if (!item) return null;

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

                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                    <FaCheckCircle />
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">Unlocked!</h3>
                <p className="text-white/60 mb-6">
                    You have successfully redeemed <span className="text-white font-medium">"{item.title}"</span>.
                </p>

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
                        <div>
                            <p className="text-white/80 text-sm mb-2">Your question has been sent!</p>
                            <div className="bg-white/5 p-3 rounded-lg border border-white/10 italic text-white/60 text-sm">
                                "{fanInput}"
                            </div>
                            <p className="text-xs text-white/40 mt-3 text-center">
                                Check "My FamPoints" to see the creator's answer.
                            </p>
                        </div>
                    )}

                    {/* PROMISE TYPE */}
                    {item.type === 'promise' && (
                        <div>
                            <p className="text-white/80 text-sm mb-2">Request sent to the Creator!</p>
                            {fanInput && (
                                <div className="bg-white/5 p-3 rounded-lg border border-white/10 italic text-white/60 text-sm mb-2">
                                    Note: "{fanInput}"
                                </div>
                            )}
                            <p className="text-xs text-white/40 mt-1 text-center">
                                You can track the status in "My FamPoints".
                            </p>
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
