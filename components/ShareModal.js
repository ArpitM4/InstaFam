import React, { useState, useEffect } from 'react';
import { FaWhatsapp, FaInstagram, FaTwitter, FaTelegramPlane, FaEnvelope, FaCopy, FaCheck } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { toast } from 'sonner';


const ShareModal = ({ isOpen, onClose, username, title = "Share Your Sygil Page" }) => {
    const [copied, setCopied] = useState(false);
    const [pageUrl, setPageUrl] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPageUrl(`${window.location.origin}/${username}`);
        }
    }, [username]);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(pageUrl).then(() => {
            setCopied(true);
            toast.success('Link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);

            // Auto-close option mentioned in requirements (optional)
            // setTimeout(() => onClose(), 1500); 
        }).catch(() => {
            toast.error('Failed to copy link');
        });
    };

    const shareText = `Check out my Sygil page! ${pageUrl}`;
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(pageUrl);

    const shareLinks = {
        whatsapp: `https://wa.me/?text=${encodeURIComponent(`Check out my Sygil page! ${pageUrl}`)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent("Check out my Sygil page!")}&url=${encodedUrl}`,
        telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent("Check out my Sygil page!")}`,
        email: `mailto:?subject=${encodeURIComponent("Check out my Sygil page!")}&body=${encodeURIComponent(`Hey, check out my Sygil page here: ${pageUrl}`)}`
    };

    const handleShare = (platform) => {
        if (platform === 'instagram') {
            // Instagram doesn't have a direct web share API for DMs, so we copy the link
            handleCopy();
            toast.info("Link copied! Paste it in Instagram DMs.");
            window.open('https://instagram.com/direct/inbox/', '_blank');
            return;
        }

        window.open(shareLinks[platform], '_blank');
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[10000] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-md bg-[#0a0a0f] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300"
                style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                }}
            >
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-full transition-all z-10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>

                <div className="p-8 pt-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-orange-500 mb-4 shadow-lg shadow-primary/25">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
                        <p className="text-white/60 text-sm leading-relaxed max-w-xs mx-auto">
                            Add this link to your Instagram/YouTube bio to grow faster.
                        </p>
                    </div>

                    {/* Link Copy Section */}
                    <div className="mb-8">
                        <div
                            className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:border-primary/30 transition-colors group cursor-pointer relative overflow-hidden"
                            onClick={handleCopy}
                        >
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-0.5">Your Page Link</p>
                                <p className="text-white font-medium truncate text-sm">sy.gl/{username}</p>
                            </div>

                            <button
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2 ${copied
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
                                    }`}
                            >
                                {copied ? (
                                    <>
                                        <FaCheck /> Copied!
                                    </>
                                ) : (
                                    <>
                                        <FaCopy /> Copy
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Social Share Grid */}
                    <div>
                        <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-4 text-center">Share directly to</p>
                        <div className="grid grid-cols-5 gap-2 sm:gap-4">
                            <ShareButton
                                icon={<FaWhatsapp className="text-xl" />}
                                label="WhatsApp"
                                color="#25D366"
                                bg="rgba(37, 211, 102, 0.1)"
                                onClick={() => handleShare('whatsapp')}
                            />
                            <ShareButton
                                icon={<FaInstagram className="text-xl" />}
                                label="Instagram"
                                color="#E1306C"
                                bg="rgba(225, 48, 108, 0.1)"
                                onClick={() => handleShare('instagram')}
                            />
                            <ShareButton
                                icon={<FaXTwitter className="text-xl" />}
                                label="X"
                                color="#ffffff"
                                bg="rgba(255, 255, 255, 0.1)"
                                onClick={() => handleShare('twitter')}
                            />
                            <ShareButton
                                icon={<FaTelegramPlane className="text-xl" />}
                                label="Telegram"
                                color="#0088cc"
                                bg="rgba(0, 136, 204, 0.1)"
                                onClick={() => handleShare('telegram')}
                            />
                            <ShareButton
                                icon={<FaEnvelope className="text-xl" />}
                                label="Email"
                                color="#EA4335"
                                bg="rgba(234, 67, 53, 0.1)"
                                onClick={() => handleShare('email')}
                            />
                        </div>
                    </div>

                    {/* Footer Note */}
                    <div className="mt-8 text-center bg-white/5 rounded-lg p-3">
                        <p className="text-primary text-xs font-medium">✨ Share your page and grow your Sygil community.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ShareButton = ({ icon, label, color, bg, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center gap-2 group w-full"
        >
            <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 border border-white/5"
                style={{ color: color, backgroundColor: bg }}
            >
                {icon}
            </div>
            <span className="text-[10px] text-white/40 group-hover:text-white/80 transition-colors hidden sm:block">
                {label}
            </span>
        </button>
    );
};

export default ShareModal;
