"use client";
import React from 'react';
import { FaGem, FaDownload, FaHandshake, FaComment, FaLock } from 'react-icons/fa';

const VaultItemCard = ({ item, isOwner, onRedeem, onEdit, onView, isRedeemed, status, userRedemptionCount = 0 }) => {

    const type = item.type || 'file'; // Default to file but ideally should be explicit
    const fileType = item.fileType;

    const getIcon = (t, fType) => {
        if (t === 'promise') return <FaHandshake className="text-2xl text-purple-400" />;
        if (t === 'qna') return <FaComment className="text-2xl text-blue-400" />;
        if (t === 'text') return <span className="text-2xl">🔐</span>; // Lock/Key for secret
        if (t === 'file') {
            if (fType === 'image') return <span className="text-2xl">🖼️</span>;
            if (fType === 'video') return <span className="text-2xl">🎥</span>;
            if (fType === 'pdf') return <span className="text-2xl">📄</span>;
            if (fType === 'audio') return <span className="text-2xl">🎵</span>;
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
        // Instant items (file/text) don't need status badges as they are instant
        if (type === 'file' || type === 'text') return null;

        if (!status) return null;
        if (status === 'Pending') return <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded">⏳ Pending</span>;
        if (status === 'Fulfilled') return <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">✅ Fulfilled</span>;
        if (status === 'Rejected') return <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded">❌ Rejected</span>;
        return null;
    };

    // Limit Logic
    const reachedTotalLimit = item.limit > 0 && item.unlockCount >= item.limit;
    const reachedUserLimit = item.userLimit > 0 && userRedemptionCount >= item.userLimit;

    // For single-use items (File/Text), simple 'isRedeemed' check is often enough, but tracking userLimit is safer.
    // If it's multi-use (QnA), we rely on reachedUserLimit.

    // Determine button state
    // Disabled if: owner OR reached total limit OR reached user limit
    // (Note: Owner button is separate)

    const isSoldOut = reachedTotalLimit;
    const isUnlocked = isRedeemed && (type === 'file' || type === 'text'); // Only show 'Unlocked' for static content
    const isLimitReached = reachedUserLimit;

    // Effective disable condition for Fan:
    // Disabled if Sold Out OR Limit Reached (unless it's an unlocked static item which we want to view)
    // Wait, if I've already unlocked it, I should be able to VIEW it regardless of limits.
    // So 'isActionDisabled' mainly applies to NEW redemptions.

    // View Mode: If redeemed.
    const canView = isRedeemed;

    // Unlock Mode: If NOT redeemed (or multi-use allowed and limit not reached).
    // Actually, simple rule: If isRedeemed, show VIEW button.
    // Except for multi-use? The requirement "My Redemptions" implies listing individual redemptions.
    // In the main vault list:
    // If QnA/Promise: You can redeem AGAIN if userLimit not reached. 
    // If you have redeemed it once, should it show "View"? Or "Unlock Another"?
    // The card represents the ITEM.
    // If I have pending requests, maybe show "View Status"?
    // For simplicity: If user has ANY redemption of this item, provide a way to see it? 
    // But typically QnA is "Ask Another".
    // Let's stick to the User Request: "In the Promise and QnA , Simple show the status of their Request. on clicking upon the button show them their inpupt and the creator's response."

    // So if isRedeemed is true (meaning user has interacted), we prioritize "View Status".
    // BUT what if they want to ask ANOTHER QnA? 
    // Maybe we need two buttons? Or just stick to "View" if they have an active interaction?
    // Let's assume for now: If redeemed, show View. If they want another, they usually can't unless we added "Buy Again" logic explicitly.
    // Current logic: `isRedeemed` is passed as true if `redeemedItems.includes(item._id)`.
    // `redeemedItems` is list of IDs user has redeemed.

    const showViewButton = isRedeemed;

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
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold">
                        🪙 {item.pointCost} FP
                    </span>
                </div>

                <p className="text-white/60 text-sm line-clamp-2 min-h-[40px] text-sm leading-relaxed">{item.description}</p>
            </div>

            {/* Stats / Limits */}
            <div className="px-4 py-2 border-b border-white/5 flex justify-between text-xs text-white/40">
                <span>
                    {item.type?.toUpperCase() || 'REWARD'}
                    {item.type === 'file' && ` • ${item.fileType?.toUpperCase() || 'FILE'}`}
                </span>
                <span>
                    {item.limit > 0 ? `${item.unlockCount} / ${item.limit} Claimed` : `${item.unlockCount} Unlocks`}
                </span>
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
                ) : (
                    <button
                        onClick={() => {
                            if (showViewButton) {
                                if (onView) onView(item);
                            } else {
                                onRedeem(item);
                            }
                        }}
                        disabled={!showViewButton && (isSoldOut || isLimitReached)}
                        className={`w-full py-2.5 px-4 rounded-xl font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-2 ${showViewButton
                            ? 'bg-transparent border border-white/20 text-white hover:bg-white/5' // Simplified View Button
                            : (isSoldOut || isLimitReached)
                                ? 'bg-white/5 text-white/40 cursor-not-allowed border border-white/5'
                                : 'btn-gradient text-white hover:scale-[1.02] hover:shadow-lg'
                            }`}
                    >
                        {showViewButton ? (
                            <>
                                {(type === 'file' || type === 'text') ? (
                                    <><FaDownload className="text-xs" /> View Reward</>
                                ) : (
                                    <><FaComment className="text-xs" /> View Request</>
                                )}
                            </>
                        ) : (isSoldOut || isLimitReached) ? (
                            <>
                                <FaLock className="text-xs" /> {getButtonText()}
                            </>
                        ) : (
                            <>
                                Unlock Reward
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default VaultItemCard;
