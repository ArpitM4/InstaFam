"use client";
import React from 'react';
import { FaGem, FaDownload, FaHandshake, FaComment, FaLock, FaUnlock, FaImage, FaVideo, FaFilePdf, FaMusic, FaKey, FaClock, FaCheck, FaTimes, FaBan } from 'react-icons/fa';

const VaultItemCard = ({ item, isOwner, onRedeem, onEdit, onView, isRedeemed, status, userRedemptionCount = 0, isRedemptionCard = false, userPoints = 0 }) => {

    const type = item.type || 'file'; // Default to file but ideally should be explicit
    const fileType = item.fileType;

    const getIcon = (t, fType) => {
        if (t === 'promise') return <FaHandshake className="text-2xl text-purple-400" />;
        if (t === 'qna') return <FaComment className="text-2xl text-blue-400" />;
        if (t === 'text') return <FaKey className="text-2xl text-pink-400" />;
        if (t === 'file') {
            if (fType === 'image') return <FaImage className="text-2xl text-emerald-400" />;
            if (fType === 'video') return <FaVideo className="text-2xl text-red-400" />;
            if (fType === 'pdf') return <FaFilePdf className="text-2xl text-orange-400" />;
            if (fType === 'audio') return <FaMusic className="text-2xl text-cyan-400" />;
            return <FaDownload className="text-2xl text-sky-400" />;
        }
        return <FaGem className="text-2xl text-pink-500" />;
    };

    const getTypeLabel = (t) => {
        if (t === 'promise') return 'SERVICE / PROMISE';
        if (t === 'qna') return 'Q & A';
        if (t === 'text') return 'SECRET MESSAGE';
        if (t === 'file') return 'DIGITAL FILE';
        return 'REWARD';
    };

    const getTypeColor = (t) => {
        if (t === 'promise') return 'bg-purple-500/20 text-purple-300 border-purple-500/20';
        if (t === 'qna') return 'bg-blue-500/20 text-blue-300 border-blue-500/20';
        if (t === 'text') return 'bg-pink-500/20 text-pink-300 border-pink-500/20';
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/20'; // File
    };

    const getStatusBadge = () => {
        // Only show status badge on Redemption Cards (History), not Store Cards (Unlock)
        if (!isRedemptionCard) return null;

        // Instant items (file/text) don't need status badges as they are instant
        if (type === 'file' || type === 'text') return null;

        if (!status) return null;
        if (status === 'Pending') return <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded flex items-center gap-1"><FaClock className="text-[10px]" /> Pending</span>;
        if (status === 'Fulfilled') return <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded flex items-center gap-1"><FaCheck className="text-[10px]" /> Fulfilled</span>;
        if (status === 'Rejected') return <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded flex items-center gap-1"><FaTimes className="text-[10px]" /> Rejected</span>;
        if (status === 'Cancelled') return <span className="bg-gray-500/20 text-gray-400 text-xs px-2 py-1 rounded flex items-center gap-1"><FaBan className="text-[10px]" /> Cancelled</span>;
        return null;
    };

    // Limit Logic
    const limit = Number(item.limit) || 0;
    // Explicitly handle 0 as a valid limit (Unlimited)
    // If userLimit is explicitly 0 or '0', treat as 0. 
    // Otherwise if falsy/missing, default to 1.
    const userLimit = (item.userLimit === 0 || item.userLimit === '0') ? 0 : (Number(item.userLimit) || 1);

    // console.log("VaultItem:", { title: item.title, userLimit, raw: item.userLimit });

    const reachedTotalLimit = limit > 0 && (item.unlockCount || 0) >= limit;
    const reachedUserLimit = userLimit > 0 && userRedemptionCount >= userLimit;

    const isSoldOut = reachedTotalLimit;
    const isLimitReached = reachedUserLimit;

    // View Mode is FORCED if isRedemptionCard is true.
    // Otherwise it's Store Mode (Unlock).

    const getButtonText = () => {
        if (isSoldOut) return "Sold Out";
        if (isLimitReached) return "Limit Reached";
        return "Unlock Reward";
    };

    return (
        <div className="rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl border border-white/10 relative group bg-[#1a1a1f] hover:border-white/20">

            {/* Type Badge (Top Right) */}
            <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-bold tracking-wider border-b border-l ${getTypeColor(type)}`}>
                {getTypeLabel(type)}
            </div>

            {/* Item Header */}
            <div className="p-4 pt-8 border-b border-white/10 relative">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                            {getIcon(type, fileType)}
                        </div>
                        {getStatusBadge()}
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg text-white mb-1 line-clamp-1 pr-2">{item.title}</h3>
                    {(item.pointCost !== undefined && item.pointCost !== null) && (
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold">
                            🪙 {item.pointCost} FP
                        </span>
                    )}
                </div>

                <p className="text-white/60 text-sm line-clamp-2 min-h-[40px] text-sm leading-relaxed">{item.description}</p>
            </div>

            {/* Stats / Limits */}
            <div className="px-4 py-2 border-b border-white/5 flex flex-col gap-1 text-xs text-white/40">
                <div className="flex justify-between">
                    <span>
                        {item.type?.toUpperCase() || 'REWARD'}
                        {item.type === 'file' && ` • ${item.fileType?.toUpperCase() || 'FILE'}`}
                    </span>
                    <span>
                        {/* Only show claimed count if valid numbers exist and NOT redemption card */}
                        {isRedemptionCard ? (
                            // For redemption cards, just show the type
                            null
                        ) : (item.unlockCount !== undefined) ? (
                            limit > 0 ? `${item.unlockCount} / ${limit} Claimed` : `${item.unlockCount} Unlocks`
                        ) : (
                            // Fallback if unlockCount is missing
                            limit > 0 ? `Limit: ${limit}` : null
                        )}
                    </span>
                </div>
                {/* User Limit - Only show if NOT a redemption card (Store Mode) */}
                {!isRedemptionCard && userLimit > 0 && (
                    <div className="flex justify-between items-center text-[11px] font-medium mt-1 bg-white/5 p-1.5 rounded-lg border border-white/5">
                        <span className="text-white/60">Max {userLimit} per user</span>
                        {!isOwner && (
                            <span className={`${reachedUserLimit ? 'text-red-400' : 'text-primary'}`}>
                                You: {userRedemptionCount} / {userLimit}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Action Footer */}
            <div className="p-4">
                {isOwner ? (
                    <button
                        onClick={() => onEdit && onEdit(item)}
                        className="w-full py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all text-sm font-medium border border-white/10"
                    >
                        Edit / Manage Item
                    </button>
                ) : isRedemptionCard ? (
                    <button
                        onClick={() => onView && onView(item)}
                        className="w-full py-2.5 px-4 rounded-xl font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-2 bg-transparent border border-white/20 text-white hover:bg-white/5"
                    >
                        View Details
                    </button>
                ) : (isSoldOut || isLimitReached) ? (
                    <button
                        disabled
                        className="w-full py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-white/5 text-white/40 cursor-not-allowed border border-white/5"
                    >
                        <FaLock className="text-xs" /> {getButtonText()}
                    </button>
                ) : (
                    // LIQUID FILL BUTTON
                    (() => {
                        const cost = item.pointCost || 0;
                        const progress = cost === 0 ? 100 : Math.min(((userPoints || 0) / cost) * 100, 100);
                        const canAfford = cost === 0 || (userPoints || 0) >= cost;
                        const almostThere = !canAfford && progress > 70;
                        const remaining = cost - (userPoints || 0);

                        return (
                            <button
                                onClick={() => onRedeem(item)}
                                disabled={!canAfford}
                                className={`w-full h-12 rounded-xl relative overflow-hidden group transition-all duration-300 
                                    ${canAfford
                                        ? 'shadow-lg hover:shadow-primary/20 cursor-pointer'
                                        : almostThere
                                            ? 'shadow-[0_0_15px_rgba(255,47,114,0.3)] animate-pulse cursor-not-allowed'
                                            : 'bg-white/5 cursor-not-allowed'
                                    }`}
                            >
                                {/* Background Empty State */}
                                <div className="absolute inset-0 bg-[#0f0f13]" />

                                {/* Liquid Fill Layer (Horizontal) */}
                                <div
                                    className={`absolute top-0 left-0 h-full transition-all duration-700 ease-out flex items-center justify-end
                                        ${canAfford
                                            ? 'bg-gradient-to-r from-[#FF2F72] via-[#FF4B86] to-[#FF6A2F]'
                                            : 'bg-gradient-to-r from-[#FF2F72]/30 via-[#FF4B86]/30 to-[#FF6A2F]/30'
                                        }
                                    `}
                                    style={{ width: `${progress}%` }}
                                >
                                    {/* Wave Edge (Vertical right line) */}
                                    <div className={`h-full w-[2px] ${canAfford ? 'bg-white/40' : 'bg-primary/40 shadow-[0_0_10px_rgba(255,47,114,0.4)]'}`} />
                                </div>

                                {/* Content Layer (Text & Icons) */}
                                <div className="absolute inset-0 flex items-center justify-center z-10 gap-2">
                                    {canAfford ? (
                                        <>
                                            <FaUnlock className="text-white text-sm drop-shadow-md" />
                                            <span className="font-bold text-white drop-shadow-md">Unlock Reward</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaLock className={`text-sm ${almostThere ? 'text-primary-light' : 'text-white/40'}`} />
                                            <span className={`font-bold text-sm ${almostThere ? 'text-primary-light' : 'text-white/40'}`}>
                                                {remaining > 0 ? `Need ${remaining} More 🪙` : 'Unlock'}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </button>
                        );
                    })()
                )}
            </div>
        </div>
    );
};

export default VaultItemCard;
