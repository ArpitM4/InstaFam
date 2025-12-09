"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    FaDownload, FaEye, FaEyeSlash, FaCopy, FaCheckCircle,
    FaTimesCircle, FaClock, FaExternalLinkAlt
} from 'react-icons/fa';
import { toast } from 'sonner';

const MyFamPointsClient = ({ pointsData, redemptions }) => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('points');
    const [expandedRedemptions, setExpandedRedemptions] = useState(new Set());
    const [revealedSecrets, setRevealedSecrets] = useState(new Set()); // For secret codes

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getDaysUntilExpiry = (expiresAt) => {
        if (!expiresAt) return null;
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const toggleRedemptionExpansion = (redemptionId) => {
        setExpandedRedemptions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(redemptionId)) {
                newSet.delete(redemptionId);
            } else {
                newSet.add(redemptionId);
            }
            return newSet;
        });
    };

    const toggleSecretReveal = (redemptionId) => {
        setRevealedSecrets(prev => {
            const newSet = new Set(prev);
            if (newSet.has(redemptionId)) newSet.delete(redemptionId);
            else newSet.add(redemptionId);
            return newSet;
        });
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied!");
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-1">My Fam Points</h1>
                <div className="w-12 h-1 bg-primary rounded-full"></div>
                <p className="text-gray-400 text-sm mt-4">Points earned from supporting creators. Use them in their Vaults!</p>
            </div>

            {/* Total Points Summary */}
            <div className="bg-dropdown-hover rounded-lg p-6 mb-8 text-center">
                <h2 className="text-3xl font-bold text-text mb-2">
                    🪙 {pointsData.totalPoints} Fam Points
                </h2>
                <p className="text-text/60 text-sm">Across {pointsData.pointsByCreator?.length || 0} creator(s)</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex rounded-lg p-1 mb-8">
                <button
                    onClick={() => setActiveTab('points')}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'points'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-text/70 hover:text-text hover:bg-background/50'
                        }`}
                >
                    Points by Creator
                </button>
                <button
                    onClick={() => setActiveTab('redemptions')}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'redemptions'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-text/70 hover:text-text hover:bg-background/50'
                        }`}
                >
                    My Redemptions
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'points' ? (
                <div className="space-y-6">
                    {/* Points by Creator Cards */}
                    {(!pointsData.pointsByCreator || pointsData.pointsByCreator.length === 0) ? (
                        <div className="text-center py-12 bg-dropdown-hover rounded-lg">
                            <p className="text-text/60 mb-4">No points earned yet</p>
                            <p className="text-text/40 text-sm mb-6">Support your favorite creators to earn FamPoints!</p>
                            <button
                                onClick={() => router.push('/explore')}
                                className="bg-primary hover:bg-primary/90 text-text px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
                            >
                                Explore Creators
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Creator Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pointsData.pointsByCreator.map((creator) => {
                                    const daysUntilExpiry = getDaysUntilExpiry(creator.nextExpiry);

                                    return (
                                        <div
                                            key={creator.creatorId}
                                            className="bg-dropdown-hover rounded-xl p-5 hover:bg-dropdown-hover/80 transition-colors cursor-pointer"
                                            onClick={() => router.push(`/${creator.creatorUsername}`)}
                                        >
                                            <div className="flex items-center gap-4 mb-4">
                                                {/* Creator Avatar */}
                                                <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                                                    {creator.creatorProfilePic ? (
                                                        <Image
                                                            src={creator.creatorProfilePic}
                                                            alt={creator.creatorUsername}
                                                            width={48}
                                                            height={48}
                                                            className="w-full h-full object-cover"
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-lg font-bold text-text/50">
                                                            {(creator.creatorUsername || creator.creatorName || '?')[0].toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Creator Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-text truncate">
                                                        {creator.creatorName || creator.creatorUsername}
                                                    </h3>
                                                    <p className="text-sm text-text/60">@{creator.creatorUsername}</p>
                                                </div>

                                                {/* Points */}
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-primary">{creator.points}</p>
                                                    <p className="text-xs text-text/50">points</p>
                                                </div>
                                            </div>

                                            {/* Expiring Warning */}
                                            {creator.expiringPoints > 0 && (
                                                <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                                    <p className="text-xs text-yellow-300">
                                                        ⚠️ {creator.expiringPoints} points expiring
                                                        {daysUntilExpiry && daysUntilExpiry <= 30 && (
                                                            <span> in {daysUntilExpiry} days</span>
                                                        )}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Visit Vault Button */}
                                            <button className="mt-4 w-full py-2 bg-primary/20 hover:bg-primary/30 text-primary text-sm font-medium rounded-lg transition-colors">
                                                Visit Vault →
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Recent Transactions */}
                            {pointsData.transactions && pointsData.transactions.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-xl font-semibold mb-4 text-text">Recent Transactions</h3>
                                    <div className="space-y-3">
                                        {pointsData.transactions.slice(0, 10).map((tx, index) => (
                                            <div
                                                key={tx._id || index}
                                                className="bg-dropdown-hover rounded-lg p-4 flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${tx.type === 'Earned' ? 'bg-green-500/20 text-green-300' :
                                                        tx.type === 'Spent' ? 'bg-red-500/20 text-red-300' :
                                                            tx.type === 'Expired' ? 'bg-gray-500/20 text-gray-300' :
                                                                tx.type === 'Refund' ? 'bg-blue-500/20 text-blue-300' :
                                                                    tx.type === 'Bonus' ? 'bg-purple-500/20 text-purple-300' :
                                                                        'bg-blue-500/20 text-blue-300'
                                                        }`}>
                                                        {tx.type}
                                                    </span>
                                                    <div>
                                                        <p className="text-sm text-text/80">{tx.description || 'Transaction'}</p>
                                                        {tx.creatorUsername && (
                                                            <p className="text-xs text-text/50">@{tx.creatorUsername}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-semibold ${tx.type === 'Earned' || tx.type === 'Refund' || tx.type === 'Bonus'
                                                        ? 'text-green-400'
                                                        : 'text-red-400'
                                                        }`}>
                                                        {tx.type === 'Earned' || tx.type === 'Refund' || tx.type === 'Bonus' ? '+' : ''}
                                                        {Math.abs(tx.amount)} pts
                                                    </p>
                                                    <p className="text-xs text-text/50">{formatDate(tx.createdAt)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            ) : (
                /* Redemption History */
                <div className="rounded-lg p-6">
                    <h3 className="text-2xl font-semibold mb-6 text-text">My Redemptions</h3>

                    {redemptions.length === 0 ? (
                        <div className="text-center py-8 bg-dropdown-hover rounded-lg">
                            <p className="text-text/60 mb-4">No redemptions yet</p>
                            <button
                                onClick={() => router.push('/explore')}
                                className="bg-primary hover:bg-primary/90 text-text px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
                            >
                                Explore Creators
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {redemptions.map((redemption) => {
                                const item = redemption.vaultItemId || {};
                                const isExpanded = expandedRedemptions.has(redemption._id);
                                const isRevealed = revealedSecrets.has(redemption._id);
                                const isRejected = redemption.status === 'Rejected';
                                const isCancelled = redemption.status === 'Cancelled';
                                const type = item.type || 'file'; // default to file if unknown

                                return (
                                    <div
                                        key={redemption._id}
                                        className={`bg-dropdown-hover rounded-xl p-5 border ${isRejected || isCancelled ? 'border-red-500/20' : 'border-white/5'
                                            }`}
                                    >
                                        {/* CARD HEADER */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${type === 'file' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20' :
                                                            type === 'text' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/20' :
                                                                type === 'qna' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/20' :
                                                                    'bg-purple-500/20 text-purple-300 border border-purple-500/20' // Promise
                                                        }`}>
                                                        {type === 'text' ? 'SECRET CODE' : type === 'promise' ? 'SERVICE / PROMISE' : type === 'qna' ? 'Q & A' : 'DIGITAL FILE'}
                                                    </span>
                                                    <span className="text-text/40 text-xs">• {formatDate(redemption.redeemedAt)}</span>
                                                </div>
                                                <h4 className="text-lg font-bold text-white mb-1">
                                                    {item.title || 'Deleted Item'}
                                                </h4>
                                                <p className="text-sm text-text/60">From @{redemption.creatorId?.username || 'unknown'}</p>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="text-right">
                                                <div className={`px-3 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 ${redemption.status === 'Fulfilled' ? 'bg-green-500/20 text-green-400' :
                                                    redemption.status === 'Rejected' ? 'bg-red-500/20 text-red-400' :
                                                        redemption.status === 'Cancelled' ? 'bg-gray-500/20 text-gray-400' :
                                                            'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                    {redemption.status === 'Fulfilled' && <FaCheckCircle />}
                                                    {redemption.status === 'Rejected' && <FaTimesCircle />}
                                                    {redemption.status === 'Cancelled' && <FaTimesCircle />}
                                                    {redemption.status === 'Pending' && <FaClock />}
                                                    {redemption.status.toUpperCase()}
                                                </div>
                                                <p className="text-xs text-text/40 mt-1">{redemption.pointsSpent} pts</p>
                                            </div>
                                        </div>

                                        {/* Status Context Message */}
                                        {(isRejected || isCancelled) && (
                                            <div className="bg-red-500/10 border-l-2 border-red-500 p-3 rounded-r-lg mb-4">
                                                <p className="text-red-400 text-sm font-medium mb-1">
                                                    Request {isCancelled ? 'Cancelled' : 'Rejected'}
                                                </p>
                                                <p className="text-white/60 text-xs italic">
                                                    Reason: "{redemption.rejectionReason || 'No reason provided'}"
                                                </p>
                                                <p className="text-green-400 text-xs mt-2 font-bold">
                                                    ✓ {redemption.pointsSpent} Points Refunded
                                                </p>
                                            </div>
                                        )}

                                        {/* CONTENT AREA (Based on Type) - Only show if active */}
                                        {!isRejected && !isCancelled && (
                                            <div className="bg-black/20 rounded-xl p-4 border border-white/5">

                                                {/* --- TYPE: FILE --- */}
                                                {type === 'file' && (
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm text-white/80 mb-1">File Reward</p>
                                                            <p className="text-xs text-white/40">Ready to download</p>
                                                        </div>
                                                        {item.fileUrl && (
                                                            <button
                                                                onClick={() => window.open(item.fileUrl, '_blank')}
                                                                className="bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
                                                            >
                                                                <FaDownload /> Download
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                                {/* --- TYPE: TEXT (Secret Code) --- */}
                                                {type === 'text' && (
                                                    <div>
                                                        <div className="flex justify-between items-center mb-2">
                                                            <p className="text-sm text-white/80">Secret Code / Link</p>
                                                            <button
                                                                onClick={() => toggleSecretReveal(redemption._id)}
                                                                className="text-white/40 hover:text-white text-xs flex items-center gap-1"
                                                            >
                                                                {isRevealed ? <><FaEyeSlash /> Hide</> : <><FaEye /> Reveal</>}
                                                            </button>
                                                        </div>
                                                        <div className="bg-black/40 p-3 rounded-lg flex items-center gap-2 border border-white/10 relative group">
                                                            <code className={`flex-1 font-mono text-sm ${isRevealed ? 'text-primary' : 'text-white/20 blur-sm select-none'}`}>
                                                                {item.fileUrl || "SECRET-CODE"}
                                                            </code>
                                                            {isRevealed && (
                                                                <button
                                                                    onClick={() => copyToClipboard(item.fileUrl)}
                                                                    className="p-1.5 text-white/40 hover:text-white rounded transition-colors"
                                                                    title="Copy"
                                                                >
                                                                    <FaCopy />
                                                                </button>
                                                            )}
                                                            {!isRevealed && (
                                                                <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={() => toggleSecretReveal(redemption._id)}>
                                                                    <span className="text-xs text-white/40 font-bold uppercase tracking-widest">Click to Reveal</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {isRevealed && item.fileUrl && item.fileUrl.startsWith('http') && (
                                                            <a
                                                                href={item.fileUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-primary hover:underline flex items-center gap-1 mt-2 inline-flex"
                                                            >
                                                                Open Link <FaExternalLinkAlt />
                                                            </a>
                                                        )}
                                                    </div>
                                                )}

                                                {/* --- TYPE: Q&A --- */}
                                                {type === 'qna' && (
                                                    <div className="space-y-4">
                                                        <div>
                                                            <p className="text-xs text-yellow-500/80 uppercase font-bold mb-1">Your Question</p>
                                                            <div className="text-sm text-white/90 italic">"{redemption.fanInput}"</div>
                                                        </div>

                                                        {redemption.status === 'Fulfilled' ? (
                                                            <div className="bg-green-500/10 border-l-2 border-green-500 pl-3 py-1">
                                                                <p className="text-xs text-green-400 uppercase font-bold mb-1">Answer from @{redemption.creatorId?.username}</p>
                                                                <div className="text-sm text-white">{redemption.creatorResponse}</div>
                                                            </div>
                                                        ) : (
                                                            <div className="bg-white/5 rounded p-2 text-center text-xs text-white/40">
                                                                Waiting for response...
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* --- TYPE: PROMISE --- */}
                                                {type === 'promise' && (
                                                    <div className="space-y-4">
                                                        <div>
                                                            <p className="text-xs text-blue-400/80 uppercase font-bold mb-1">Request Details</p>
                                                            <div className="text-sm text-white/90 italic">"{redemption.fanInput || "No details provided"}"</div>
                                                        </div>

                                                        {/* Progress Bar */}
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-xs text-white/60">
                                                                <span>Status</span>
                                                                <span>{redemption.status === 'Fulfilled' ? 'Completed' : 'In Progress'}</span>
                                                            </div>
                                                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-500 ${redemption.status === 'Fulfilled' ? 'w-full bg-green-500' : 'w-1/2 bg-yellow-500 animate-pulse'}`}
                                                                />
                                                            </div>
                                                        </div>

                                                        {redemption.status === 'Fulfilled' && redemption.creatorResponse && (
                                                            <div className="bg-green-500/10 border-l-2 border-green-500 pl-3 py-1">
                                                                <p className="text-xs text-green-400 uppercase font-bold mb-1">Delivery Note</p>
                                                                <div className="text-sm text-white">{redemption.creatorResponse}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Back Button */}
            <div className="text-center mt-8 pb-12">
                <button
                    onClick={() => router.back()}
                    className="bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                    ← Back
                </button>
            </div>
        </div>
    );
};

export default MyFamPointsClient;
