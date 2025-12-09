"use client";
import React from 'react';
import { FaGem, FaDownload, FaHandshake, FaComment, FaLock } from 'react-icons/fa';

const VaultItemCard = ({ item, isOwner, onRedeem, onEdit, isRedeemed, status }) => {

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
        if (t === 'text') return 'SECRET CODE';
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
        if (!status) return null;
        if (status === 'Pending') return <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded">⏳ Pending</span>;
        if (status === 'Fulfilled') return <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">✅ Fulfilled</span>;
        if (status === 'Rejected') return <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded">❌ Rejected</span>;
        return null;
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
                    {/* Points placed below or differently? Keeping typical layout */}
                </div>

                <h3 className="font-bold text-lg text-white mb-1 line-clamp-1 pr-2">{item.title}</h3>

                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold border border-primary/20">
                        💎 {item.pointCost} FP
                    </span>
                    {item.limit > 0 && (
                        <span className="text-xs text-white/40">
                            {item.limit - item.unlockCount} left
                        </span>
                    )}
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
                        Start Event / Edit (Coming Soon)
                    </button>
                ) : (
                    <button
                        onClick={() => onRedeem(item)}
                        disabled={isRedeemed && status !== 'Rejected'}
                        className={`w-full py-2.5 px-4 rounded-xl font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-2 ${isRedeemed && status !== 'Rejected'
                            ? 'bg-green-500/20 text-green-400 cursor-default'
                            : 'btn-gradient text-white hover:scale-[1.02] hover:shadow-lg'
                            }`}
                    >
                        {isRedeemed && status !== 'Rejected' ? (
                            <>
                                <FaLock className="text-xs" /> Unlocked
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
