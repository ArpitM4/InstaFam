"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { fetchMyRedemptions } from "@/actions/vaultActions";

const MyFamPointsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pointsData, setPointsData] = useState({
    totalPoints: 0,
    transactions: [],
    expiryInfo: {
      totalExpiring: 0,
      expiringCount: 0,
      nextExpiry: null
    }
  });
  const [expiringPoints, setExpiringPoints] = useState([]);
  const [pointsBreakdown, setPointsBreakdown] = useState(null);
  const [redemptions, setRedemptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('points');
  const [expandedRedemptions, setExpandedRedemptions] = useState(new Set()); // Track expanded Q&A redemptions

  // Add helper functions for expiry display
  const getDaysUntilExpiry = (expiresAt) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (daysUntilExpiry) => {
    if (daysUntilExpiry === null) return null;
    if (daysUntilExpiry <= 0) return 'expired';
    if (daysUntilExpiry <= 7) return 'critical';
    if (daysUntilExpiry <= 30) return 'warning';
    return 'safe';
  };

  const ExpiryWarningBanner = () => {
    const totalExpiring = pointsData.expiryInfo?.totalExpiring || 0;
    const nextExpiry = pointsData.expiryInfo?.nextExpiry;
    
    if (totalExpiring === 0) return null;

    const daysUntilNext = nextExpiry ? getDaysUntilExpiry(nextExpiry) : null;
    
    return (
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-yellow-200 mb-1">FamPoints Expiring Soon!</h4>
            <p className="text-yellow-100 text-sm">
              <strong>{totalExpiring} points</strong> will expire in the next 30 days
              {daysUntilNext && (
                <span className="block mt-1">
                  Next expiry: {daysUntilNext} day{daysUntilNext !== 1 ? 's' : ''} 
                  ({new Date(nextExpiry).toLocaleDateString()})
                </span>
              )}
            </p>
            <p className="text-yellow-200/80 text-xs mt-2">
              💡 Use your points in the Vault section to prevent them from expiring!
            </p>
          </div>
        </div>
      </div>
    );
  };

  const ExpiryInfoBanner = () => (
    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-blue-200 mb-1">FamPoints Expiry Policy</h4>
          <p className="text-blue-100 text-sm">
            Your FamPoints automatically expire after <strong>60 days</strong> if not used. 
            This ensures an active and engaging community.
          </p>
          <ul className="text-blue-200/80 text-xs mt-2 space-y-1">
            <li>• Points earned from donations expire 60 days after earning</li>
            <li>• Use points in creator Vaults to prevent expiration</li>
            <li>• You'll receive warnings 7 days before expiration</li>
            <li>• Expired points cannot be recovered</li>
          </ul>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    fetchPointsData();
    fetchRedemptionsData();
    fetchExpiringPoints();
    fetchPointsBreakdown();
  }, [session, status, router]);

  const fetchPointsData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/points');
      if (response.ok) {
        const data = await response.json();
        setPointsData(data);
      } else {
        toast.error("Failed to fetch points data");
      }
    } catch (error) {
      console.error('Error fetching points:', error);
      toast.error("Error loading points data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRedemptionsData = async () => {
    try {
      if (!session?.user?.name) return;
      
      const userRedemptions = await fetchMyRedemptions();
      if (userRedemptions.success) {
        setRedemptions(userRedemptions.redemptions || []);
      }
    } catch (error) {
      console.error('Error fetching redemptions:', error);
      toast.error("Error loading redemption data");
    }
  };

  const fetchExpiringPoints = async () => {
    try {
      const response = await fetch('/api/points/expiring?days=30');
      if (response.ok) {
        const data = await response.json();
        setExpiringPoints(data.expiringPoints || []);
      }
    } catch (error) {
      console.error('Error fetching expiring points:', error);
    }
  };

  const fetchPointsBreakdown = async () => {
    try {
      const response = await fetch('/api/points/breakdown');
      if (response.ok) {
        const data = await response.json();
        setPointsBreakdown(data);
      }
    } catch (error) {
      console.error('Error fetching points breakdown:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your Fam Points...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">My Fam Points</h1>
        <div className="w-12 h-1 bg-primary rounded-full"></div>
        <p className="text-gray-400 text-sm mt-4">Track your points and redemptions</p>
      </div>

        {/* Points Summary Card */}
        <div className="bg-dropdown-hover rounded-lg p-6 mb-8 text-center">
          <h2 className="text-2xl font-semibold text-text mb-2">
            🪙 {pointsBreakdown?.totals?.active || pointsData.totalPoints} Fam Points
          </h2>
        </div>

        {/* Tab Navigation */}
        <div className="flex rounded-lg p-1 mb-8">
          <button
            onClick={() => setActiveTab('points')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'points'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text/70 hover:text-text hover:bg-background/50'
            }`}
          >
            Points History
          </button>
          <button
            onClick={() => setActiveTab('redemptions')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'redemptions'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text/70 hover:text-text hover:bg-background/50'
            }`}
          >
            My Redemptions
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'points' ? (
          /* Transaction History */
          <div className=" rounded-lg p-6">
            <h3 className="text-2xl font-semibold mb-6 text-text">Points History</h3>
            
            {/* Removed ExpiryInfoBanner and ExpiryWarningBanner as requested */}

            {/* Points Breakdown Section */}
            {pointsBreakdown && (
              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-6 text-text">Points Breakdown</h4>
                
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-dropdown-hover rounded-lg p-4">
                    <h4 className="text-sm font-medium text-text/70 mb-1">Active Points</h4>
                    <p className="text-2xl font-bold text-green-400">{pointsBreakdown.totals?.active || 0}</p>
                    <p className="text-xs text-text/60">Ready to use</p>
                  </div>
                  
                  <div className="bg-dropdown-hover rounded-lg p-4">
                    <h4 className="text-sm font-medium text-text/70 mb-1">Expiring Soon</h4>
                    <p className="text-2xl font-bold text-yellow-400">{pointsBreakdown.totals?.expiring || 0}</p>
                    <p className="text-xs text-text/60">Next 30 days</p>
                  </div>
                  
                  <div className="bg-dropdown-hover rounded-lg p-4">
                    <h4 className="text-sm font-medium text-text/70 mb-1">Recently Expired</h4>
                    <p className="text-2xl font-bold text-gray-400">{pointsBreakdown.totals?.recentlyExpired || 0}</p>
                    <p className="text-xs text-text/60">Last 30 days</p>
                  </div>
                  
                  <div className="bg-dropdown-hover rounded-lg p-4">
                    <h4 className="text-sm font-medium text-text/70 mb-1">Total Spent</h4>
                    <p className="text-2xl font-bold text-blue-400">{pointsBreakdown.totals?.spent || 0}</p>
                    <p className="text-xs text-text/60">All time</p>
                  </div>
                </div>

                {/* Expiring Points Section */}
                {pointsBreakdown.expiringPoints?.length > 0 && (
                  <div className="mb-6">
                    <h5 className="text-lg font-semibold mb-4 text-yellow-400">⚠️ Points Expiring Soon</h5>
                    <div className="space-y-2">
                      {/* Show only the soonest expiring point */}
                      {(() => {
                        const soonest = [...pointsBreakdown.expiringPoints].sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt))[0];
                        if (!soonest) return null;
                        return (
                          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="font-semibold text-yellow-200">{soonest.amount} points</span>
                                <p className="text-sm text-yellow-100/80">
                                  Expires in {soonest.daysUntilExpiry} day{soonest.daysUntilExpiry !== 1 ? 's' : ''}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-yellow-200/60">
                                  {new Date(soonest.expiresAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Removed Active Points Section as requested */}

                {/* Recently Expired Points */}
                {pointsBreakdown.recentlyExpired?.length > 0 && (
                  <div className="mb-6">
                    <h5 className="text-lg font-semibold mb-4 text-gray-400">❌ Recently Expired</h5>
                    <div className="space-y-2">
                      {pointsBreakdown.recentlyExpired.map((point, index) => (
                        <div key={index} className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-semibold text-gray-300">{point.amount} points</span>
                              <p className="text-sm text-gray-100/80">{point.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-300/60">
                                {new Date(point.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Transaction History Section */}
            <div>
              <h4 className="text-xl font-semibold mb-6 text-text">Transaction History</h4>
              
              {pointsData.transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-text/60 mb-4">No points earned yet</p>
                  <button
                    onClick={() => router.push('/explore')}
                    className="bg-primary hover:bg-primary/90 text-background px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
                  >
                    Explore Creators
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {pointsData.transactions.map((transaction, index) => {
                    const daysUntilExpiry = getDaysUntilExpiry(transaction.expiresAt);
                    const expiryStatus = getExpiryStatus(daysUntilExpiry);
                    
                    return (
                      <div
                        key={transaction._id || index}
                        className={`bg-dropdown-hover rounded-lg p-4 py-8 ${
                          expiryStatus === 'critical' ? 'ring-2 ring-red-500/50' :
                          expiryStatus === 'warning' ? 'ring-2 ring-yellow-500/50' : ''
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-semibold ${
                                transaction.type === 'Earned' ? 'text-green-400' :
                                transaction.type === 'Spent' ? 'text-red-400' :
                                transaction.type === 'Expired' ? 'text-gray-400' :
                                transaction.type === 'Refund' ? 'text-blue-400' :
                                transaction.type === 'Bonus' ? 'text-purple-400' :
                                'text-blue-400'
                              }`}>
                                {(transaction.type === 'Earned' || transaction.type === 'Refund' || transaction.type === 'Bonus') ? '+' : ''}
                                {Math.abs(transaction.amount || transaction.points_earned)} Points
                              </span>
                              
                              {/* Transaction Type Badge */}
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                transaction.type === 'Earned' ? 'bg-green-500/20 text-green-300' :
                                transaction.type === 'Spent' ? 'bg-red-500/20 text-red-300' :
                                transaction.type === 'Expired' ? 'bg-gray-500/20 text-gray-300' :
                                transaction.type === 'Refund' ? 'bg-blue-500/20 text-blue-300' :
                                transaction.type === 'Bonus' ? 'bg-purple-500/20 text-purple-300' :
                                'bg-blue-500/20 text-blue-300'
                              }`}>
                                {transaction.type}
                              </span>

                              {/* Expiry Warning Badge - Show for Earned, Refund, and Bonus */}
                              {(transaction.type === 'Earned' || transaction.type === 'Refund' || transaction.type === 'Bonus') && !transaction.used && !transaction.expired && expiryStatus && (
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  expiryStatus === 'critical' ? 'bg-red-500/20 text-red-300 animate-pulse' :
                                  expiryStatus === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                                  'bg-green-500/20 text-green-300'
                                }`}>
                                  {daysUntilExpiry <= 0 ? 'Expired' : `${daysUntilExpiry}d left`}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-sm text-text/70">
                              {transaction.description || (
                                <>
                                  ${transaction.donation_amount} donation
                                  {transaction.payment_id?.to_user?.username && (
                                    <span className="ml-2">to {transaction.payment_id.to_user.username}</span>
                                  )}
                                </>
                              )}
                            </p>

                            {/* Expiry Date for Earned, Refund, and Bonus Points */}
                            {(transaction.type === 'Earned' || transaction.type === 'Refund' || transaction.type === 'Bonus') && transaction.expiresAt && !transaction.used && !transaction.expired && (
                              <p className="text-xs text-text/50 mt-1">
                                Expires: {new Date(transaction.expiresAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm text-text/60">
                              {formatDate(transaction.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Redemption History */
          <div className="bg- rounded-lg p-6">
            <h3 className="text-2xl font-semibold mb-6 text-text">My Redemptions</h3>
            
            {redemptions.length === 0 ? (
              <div className="text-center rounded-lg p-4 py-8">
                <p className="text-text/60 mb-4">No redemptions yet</p>
                <button
                  onClick={() => router.push('/explore')}
                  className="bg-primary hover:bg-primary/90 text-background px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                  Explore Creators
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {redemptions.map((redemption, index) => {
                  const isQandA = redemption.fanInput && (redemption.vaultItemId.fileType === 'text-reward' || redemption.vaultItemId.fileType === 'promise');
                  const isExpanded = expandedRedemptions.has(redemption._id);
                  const hasCreatorResponse = redemption.creatorResponse && redemption.status === 'Fulfilled';

                  return (
                    <div
                      key={redemption._id}
                      className="bg-dropdown-hover rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-primary mb-2">{redemption.vaultItemId.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-text/60">
                            <span>{redemption.vaultItemId.pointCost} points</span>
                            <span>•</span>
                            <span>{new Date(redemption.redeemedAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>From {redemption.creatorId.username}</span>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        {isQandA && (
                          <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
                            redemption.status === 'Fulfilled'
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
                                    <span className="italic"> "{redemption.fanInput.substring(0, 100)}{redemption.fanInput.length > 100 ? '...' : ''}"</span>
                                  </p>
                                  {hasCreatorResponse && (
                                    <p className="text-xs text-green-500 mt-1">
                                      {redemption.creatorId.username} has answered your question!
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() => toggleRedemptionExpansion(redemption._id)}
                                  className="ml-4 bg-primary text-text hover:bg-primary/90 px-3 py-1 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                >
                                  {hasCreatorResponse ? 'View Answer' : 'View Details'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {/* Full Q&A View */}
                              <div className="space-y-3">
                                <h5 className="text-sm font-medium text-yellow-500 uppercase tracking-wide">
                                  Your Question
                                </h5>
                                <div className="bg-background/30 rounded-lg p-4">
                                  <p className="text-text/90 leading-relaxed">{redemption.fanInput}</p>
                                </div>
                              </div>

                              {/* Creator's Answer */}
                              {hasCreatorResponse ? (
                                <div className="space-y-3">
                                  <h5 className="text-sm font-medium text-text/70 uppercase tracking-wide">
                                    {redemption.creatorId.username}'s Answer
                                  </h5>
                                  <div className="bg-background/30 rounded-lg p-4">
                                    <p className="text-text/90 leading-relaxed whitespace-pre-wrap">{redemption.creatorResponse}</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-background/30 rounded-lg p-4 text-center">
                                  <p className="text-text/60">Waiting for {redemption.creatorId.username}'s answer</p>
                                </div>
                              )}

                              <div className="flex justify-center">
                                <button
                                  onClick={() => toggleRedemptionExpansion(redemption._id)}
                                  className="bg-background/50 hover:bg-background/70 text-red-300 px-4 py-2 rounded-lg text-sm transition-colors"
                                >
                                  Collapse
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          {/* Non-Q&A Content */}
                          {redemption.vaultItemId.fileType !== 'text-reward' && redemption.vaultItemId.fileType !== 'promise' && (
                            <button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = redemption.vaultItemId.fileUrl;
                                link.download = redemption.vaultItemId.title;
                                link.click();
                              }}
                              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm"
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

export default MyFamPointsPage;
