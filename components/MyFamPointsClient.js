"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    FaDownload, FaCheckCircle,
    FaTimesCircle, FaClock
} from 'react-icons/fa';
import { toast } from 'sonner';
import VaultSuccessModal from './vault/VaultSuccessModal';

const MyFamPointsClient = ({ pointsData, redemptions }) => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('points');
    const [selectedRedemption, setSelectedRedemption] = useState(null);

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
                        <div className="space-y-4">
                            {redemptions.map((redemption) => {
                                const item = redemption.vaultItemId || {};
                                const type = item.type || 'file'; // default to file if unknown
                                const isRejected = redemption.status === 'Rejected';
                                const isCancelled = redemption.status === 'Cancelled';
                                const isInstant = type === 'file' || type === 'text';

                                return (
                                    <div
                                        key={redemption._id}
                                        className={`bg-dropdown-hover rounded-xl p-5 border ${isRejected || isCancelled ? 'border-red-500/20' : 'border-white/5'} flex justify-between items-center`}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${type === 'file' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20' :
                                                    type === 'text' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/20' :
                                                        type === 'qna' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/20' :
                                                            'bg-purple-500/20 text-purple-300 border border-purple-500/20' // Promise
                                                    }`}>
                                                    {item.type === 'text' ? 'SECRET MESSAGE' : item.type === 'promise' ? 'SERVICE / PROMISE' : item.type === 'qna' ? 'Q & A' : 'DIGITAL FILE'}
                                                </span>
                                                <span className="text-text/40 text-xs">• {formatDate(redemption.createdAt || redemption.redeemedAt)}</span>
                                            </div>
                                            <h4 className="text-lg font-bold text-white mb-1">
                                                {item.title || 'Deleted Item'}
                                            </h4>
                                            <p className="text-sm text-text/60">From @{redemption.creatorId?.username || 'unknown'}</p>
                                        </div>

                                        <div className="text-right flex flex-col items-end gap-2">
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

                                            <button
                                                onClick={() => setSelectedRedemption(redemption)}
                                                className="px-4 py-2 rounded-lg border border-white/20 text-white text-sm font-medium hover:bg-white/5 transition-colors"
                                            >
                                                {isInstant ? 'View Reward' : 'View Details'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Detail Modal */}
            {selectedRedemption && (
                <VaultSuccessModal
                    item={selectedRedemption.vaultItemId}
                    fanInput={selectedRedemption.fanInput}
                    creatorResponse={selectedRedemption.creatorResponse}
                    status={selectedRedemption.status}
                    onClose={() => setSelectedRedemption(null)}
                />
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
