"use client";
import React from 'react';
import { FaGem, FaDownload, FaHandshake, FaComment, FaLock } from 'react-icons/fa';

const VaultItemCard = ({ item, isOwner, onRedeem, onEdit, isRedeemed, status }) => {

    const getIcon = (type, fileType) => {
        if (type === 'promise') return <FaHandshake className="text-2xl text-purple-400" />;
        if (type === 'qna') return <FaComment className="text-2xl text-blue-400" />;
        if (type === 'file') {
            if (fileType === 'image') return <span className="text-2xl">🖼️</span>;
            if (fileType === 'video') return <span className="text-2xl">🎥</span>;
            if (fileType === 'pdf') return <span className="text-2xl">📄</span>;
            return <FaDownload className="text-2xl" />;
        }
        return <FaGem className="text-2xl" />;
    };

    const getStatusBadge = () => {
        if (!status) return null;
        if (status === 'Pending') return <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded">⏳ Pending</span>;
        if (status === 'Fulfilled') return <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">✅ Fulfilled</span>;
        if (status === 'Rejected') return <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded">❌ Rejected</span>;
        return null;
    };

    return (
        <div className="rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl border border-white/10 relative group"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', backdropFilter: 'blur(10px)' }}>

            {/* Item Header */}
            <div className="p-4 border-b border-white/10 relative">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        {getIcon(item.type, item.fileType)}
                        {getStatusBadge()}
                    </div>
                    <span className="bg-primary/20 text-primary px-3 py-1 rounded-xl text-sm font-medium border border-primary/20">
                        {item.pointCost} FP
                    </span>
                </div>
                <h3 className="font-bold text-lg text-white mb-1 line-clamp-1">{item.title}</h3>
                <p className="text-white/60 text-sm line-clamp-2 min-h-[40px]">{item.description}</p>
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
