"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const MyFamPointsClient = ({ pointsData, redemptions }) => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('points');
    const [expandedRedemptions, setExpandedRedemptions] = useState(new Set());

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
                        <div className="space-y-4">
                            {redemptions.map((redemption) => {
                                const isQandA = redemption.fanInput && (redemption.vaultItemId?.fileType === 'text-reward' || redemption.vaultItemId?.fileType === 'promise');
                                const isExpanded = expandedRedemptions.has(redemption._id);
                                const hasCreatorResponse = redemption.creatorResponse && redemption.status === 'Fulfilled';

                                return (
                                    <div
                                        key={redemption._id}
                                        className="bg-dropdown-hover rounded-lg p-4"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-semibold text-primary mb-2">
                                                    {redemption.vaultItemId?.title || 'Vault Item'}
                                                </h4>
                                                <div className="flex items-center gap-4 text-sm text-text/60">
                                                    <span>{redemption.vaultItemId?.pointCost || 0} points</span>
                                                    <span>•</span>
                                                    <span>{formatDate(redemption.redeemedAt)}</span>
                                                    <span>•</span>
                                                    <span>From @{redemption.creatorId?.username || 'unknown'}</span>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            {isQandA && (
                                                <div className={`px-3 py-1 rounded-lg text-xs font-medium ${redemption.status === 'Fulfilled'
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : redemption.status === 'Unfulfilled'
                                                        ? 'bg-red-500/20 text-red-400'
                                                        : 'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                    {redemption.status === 'Fulfilled' ? 'Answered' :
                                                        redemption.status === 'Unfulfilled' ? 'Unfulfilled' : 'Pending'}
                                                </div>
                                            )}
                                        </div>

                                        {/* Q&A Interface */}
                                        {isQandA ? (
                                            <div className="space-y-4">
                                                {!isExpanded ? (
                                                    <div className="bg-background/30 rounded-lg p-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <p className="text-sm text-text/80">
                                                                    <span className="font-medium text-yellow-500">Your Question:</span>
                                                                    <span className="italic"> "{redemption.fanInput?.substring(0, 100)}{redemption.fanInput?.length > 100 ? '...' : ''}"</span>
                                                                </p>
                                                                {hasCreatorResponse && (
                                                                    <p className="text-xs text-green-500 mt-1">
                                                                        {redemption.creatorId?.username} has answered!
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => toggleRedemptionExpansion(redemption._id)}
                                                                className="ml-4 bg-primary text-text hover:bg-primary/90 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                                                            >
                                                                {hasCreatorResponse ? 'View Answer' : 'View Details'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div className="bg-background/30 rounded-lg p-4">
                                                            <h5 className="text-sm font-medium text-yellow-500 mb-2">Your Question</h5>
                                                            <p className="text-text/90">{redemption.fanInput}</p>
                                                        </div>

                                                        {hasCreatorResponse ? (
                                                            <div className="bg-background/30 rounded-lg p-4">
                                                                <h5 className="text-sm font-medium text-text/70 mb-2">
                                                                    {redemption.creatorId?.username}'s Answer
                                                                </h5>
                                                                <p className="text-text/90 whitespace-pre-wrap">{redemption.creatorResponse}</p>
                                                            </div>
                                                        ) : (
                                                            <div className="bg-background/30 rounded-lg p-4 text-center">
                                                                <p className="text-text/60">Waiting for answer...</p>
                                                            </div>
                                                        )}

                                                        <button
                                                            onClick={() => toggleRedemptionExpansion(redemption._id)}
                                                            className="bg-background/50 hover:bg-background/70 text-red-300 px-4 py-2 rounded-lg text-sm"
                                                        >
                                                            Collapse
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                {/* Download button for digital items */}
                                                {redemption.vaultItemId?.fileUrl && (
                                                    <button
                                                        onClick={() => {
                                                            const link = document.createElement('a');
                                                            link.href = redemption.vaultItemId.fileUrl;
                                                            link.download = redemption.vaultItemId.title || 'download';
                                                            link.click();
                                                        }}
                                                        className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                                                    >
                                                        Download
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Back Button */}
            <div className="text-center mt-8">
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
