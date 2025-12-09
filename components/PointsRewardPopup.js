import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaCoins, FaTimes } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import confetti from 'canvas-confetti';

const PointsRewardPopup = ({ isOpen, onClose, pointsEarned, creatorName }) => {
    const [show, setShow] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setShow(true);
            // Trigger confetti with theme colors
            const duration = 3000;
            const end = Date.now() + duration;

            const colors = ['#FF2F72', '#FF6A2F', '#00E5D4', '#FFD700'];

            (function frame() {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        } else {
            setTimeout(() => setShow(false), 300); // Wait for exit animation
        }
    }, [isOpen]);

    if (!mounted) return null;
    if (!show && !isOpen) return null;

    return createPortal(
        <div
            className={`fixed inset-0 z-[10001] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'bg-black/80 backdrop-blur-sm opacity-100' : 'bg-black/0 backdrop-blur-none opacity-0 pointer-events-none'}`}
            onClick={onClose}
        >
            <div
                className={`relative w-full max-w-sm transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-10 opacity-0'}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Glow Effects - Theme Colors */}
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#FF2F72]/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#FF6A2F]/20 rounded-full blur-[100px] pointer-events-none" />

                {/* Card Container */}
                <div className="relative bg-[#0F0F16] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                    {/* Top Decorative Gradient */}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-[#FF2F72]/20 via-[#FF6A2F]/10 to-transparent pointer-events-none" />

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors z-10 p-2 hover:bg-white/5 rounded-full"
                    >
                        <FaTimes size={16} />
                    </button>

                    <div className="flex flex-col items-center pt-12 pb-8 px-6 text-center">

                        {/* Icon Circle */}
                        <div className="relative mb-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#FF2F72] to-[#FF6A2F] flex items-center justify-center shadow-lg shadow-[#FF2F72]/30 ring-4 ring-black/40 relative z-10 animate-bounce-gentle">
                                <FaCoins className="text-3xl text-white drop-shadow-md" />
                            </div>
                            <div className="absolute inset-0 bg-[#FF2F72] rounded-full blur-xl opacity-50 animate-pulse"></div>

                            {/* Floating Sparkles */}
                            <HiSparkles className="absolute -top-2 -right-2 text-[#00E5D4] text-xl animate-pulse delay-100" />
                            <HiSparkles className="absolute bottom-0 -left-2 text-[#FFD700] text-lg animate-pulse delay-300" />
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-white mb-2">
                            Reward Unlocked!
                        </h2>

                        <p className="text-white/60 text-sm mb-8 leading-relaxed">
                            You've earned <span className="text-[#FF2F72] font-bold text-glow">{pointsEarned} FamPoints</span> for following <span className="text-white font-medium">{creatorName}</span>.
                        </p>

                        {/* Action Button */}
                        <button
                            onClick={onClose}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF2F72] to-[#FF6A2F] text-white font-semibold text-sm shadow-lg shadow-[#FF2F72]/20 hover:shadow-[#FF2F72]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                        >
                            Awesome
                        </button>

                        <p className="mt-4 text-[10px] uppercase tracking-widest text-white/20 font-medium">InstaFam Rewards</p>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default PointsRewardPopup;
