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
    transactions: []
  });
  const [redemptions, setRedemptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('points');
  const [expandedRedemptions, setExpandedRedemptions] = useState(new Set()); // Track expanded Q&A redemptions

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    fetchPointsData();
    fetchRedemptionsData();
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
      <div className="min-h-screen flex items-center justify-center bg-background text-text">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text/70">Loading your Fam Points...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pt-20 text-text py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">My Fam Points</h1>
          <p className="text-text/70">Track your earning history and rewards</p>
        </div>

        {/* Points Summary Card */}
        <div className="bg-text/10 border border-text/20 rounded-lg p-6 mb-8 text-center">
          <div className="text-6xl mb-4">⭐</div>
          <h2 className="text-3xl font-bold text-primary mb-2">
            {pointsData.totalPoints} Fam Points
          </h2>
         
          <div className="text-sm text-text/60">
            <p>Earn 1 Fam Point for every $10 donated</p>
            <p>Points are awarded instantly after successful donations</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-text/20">
          <div className="flex justify-center items-center gap-8">
            <button
              onClick={() => setActiveTab('points')}
              className={`px-4 py-3 text-lg font-semibold uppercase tracking-wider transition-colors duration-200 ${
                activeTab === 'points'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text/60 hover:text-text border-b-2 border-transparent'
              }`}
            >
              Points History
            </button>
            <button
              onClick={() => setActiveTab('redemptions')}
              className={`px-4 py-3 text-lg font-semibold uppercase tracking-wider transition-colors duration-200 ${
                activeTab === 'redemptions'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text/60 hover:text-text border-b-2 border-transparent'
              }`}
            >
              My Redemptions
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'points' ? (
          /* Transaction History */
          <div className="bg-text/10 border border-text/20 rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-6 text-secondary">Points History</h3>
            
            {pointsData.transactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎯</div>
                <p className="text-text/60 mb-4">No points earned yet</p>
                <p className="text-text/50 text-sm">
                  Start donating to creators to earn your first Fam Points!
                </p>
                <button
                  onClick={() => router.push('/explore')}
                  className="mt-4 bg-primary hover:bg-primary/80 text-text px-6 py-2 rounded-md font-semibold transition"
                >
                  Explore Creators
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {pointsData.transactions.map((transaction, index) => (
                  <div
                    key={transaction._id || index}
                    className="flex justify-between items-center p-4 bg-background/50 border border-text/10 rounded-md"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">🎉</span>
                        <span className="font-semibold text-success">
                          +{transaction.points_earned} Points
                        </span>
                      </div>
                      <p className="text-sm text-text/70">
                        Donation of ${transaction.donation_amount} 
                        {transaction.payment_id?.message && (
                          <span className="ml-2 italic">"{transaction.payment_id.message}"</span>
                        )}
                      </p>
                      <p className="text-xs text-text/50">
                        To: {transaction.payment_id?.to_user?.username || 'Unknown creator'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-text/60">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Redemption History */
          <div className="bg-text/10 border border-text/20 rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-6 text-secondary">My Redemption History</h3>
            
            {redemptions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 opacity-50">🎁</div>
                <p className="text-text/60 text-lg mb-2">No redemptions yet</p>
                <p className="text-text/40">Visit vault sections to redeem rewards with your Fam Points!</p>
                <button
                  onClick={() => router.push('/explore')}
                  className="mt-4 bg-primary hover:bg-primary/80 text-text px-6 py-2 rounded-md font-semibold transition"
                >
                  Explore Creators
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {redemptions.map((redemption, index) => {
                  const isQandA = redemption.fanInput && redemption.vaultItemId.fileType === 'text-reward';
                  const isExpanded = expandedRedemptions.has(redemption._id);
                  const hasCreatorResponse = redemption.creatorResponse && redemption.status === 'Fulfilled';

                  return (
                    <div
                      key={redemption._id}
                      className="bg-background/50 border border-text/20 rounded-lg p-6 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-text">{redemption.vaultItemId.title}</h4>
                            {isQandA && (
                              <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs font-medium">
                                Q&A
                              </span>
                            )}
                          </div>
                          <p className="text-text/70 text-sm mb-2">{redemption.vaultItemId.description}</p>
                          <div className="flex items-center gap-4 text-sm text-text/60">
                            <span className="flex items-center gap-1">
                              <span className="text-primary">💎</span>
                              {redemption.vaultItemId.pointCost} points
                            </span>
                            <span>•</span>
                            <span className="capitalize">
                              {redemption.vaultItemId.perkType === 'DigitalFile' ? 'Digital File' : redemption.vaultItemId.perkType}
                            </span>
                            <span>•</span>
                            <span>Redeemed {new Date(redemption.redeemedAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-text/50 mt-1">
                            From: {redemption.creatorId.username}
                          </p>
                        </div>
                        
                        {/* Status Badge */}
                        {redemption.vaultItemId.fileType === 'text-reward' && (
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            redemption.status === 'Fulfilled'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {redemption.status === 'Fulfilled' ? '✅ Answered' : '⏳ Pending'}
                          </div>
                        )}
                      </div>

                      {/* Q&A Interface */}
                      {isQandA ? (
                        <div className="space-y-4">
                          {/* Show Q&A Preview or Full View */}
                          {!isExpanded ? (
                            <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="text-sm text-text/80">
                                    <span className="font-medium text-primary">Your Question:</span> 
                                    <span className="italic"> "{redemption.fanInput.substring(0, 100)}{redemption.fanInput.length > 100 ? '...' : ''}"</span>
                                  </p>
                                  {hasCreatorResponse && (
                                    <p className="text-xs text-green-400 mt-1">
                                      ✨ {redemption.creatorId.username} has answered your question!
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() => toggleRedemptionExpansion(redemption._id)}
                                  className="ml-4 bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1 rounded text-sm font-medium transition"
                                >
                                  {hasCreatorResponse ? 'View Answer' : 'View Details'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {/* Full Q&A View */}
                              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                                <h5 className="font-medium text-primary mb-3 flex items-center gap-2">
                                  <span className="text-lg">❓</span>
                                  Your Question:
                                </h5>
                                <div className="bg-background/30 p-3 rounded border-l-4 border-primary/50">
                                  <p className="text-text/90 italic">"{redemption.fanInput}"</p>
                                </div>
                              </div>

                              {/* Creator's Answer */}
                              {hasCreatorResponse ? (
                                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                                  <h5 className="font-medium text-green-400 mb-3 flex items-center gap-2">
                                    <span className="text-lg">✨</span>
                                    {redemption.creatorId.username}'s Exclusive Answer:
                                  </h5>
                                  <div className="bg-background/30 p-4 rounded border-l-4 border-green-500/50">
                                    <p className="text-text/90 whitespace-pre-wrap">{redemption.creatorResponse}</p>
                                  </div>
                                  <p className="text-xs text-green-400 mt-3">
                                    Answered on {new Date(redemption.fulfilledAt).toLocaleDateString()}
                                  </p>
                                </div>
                              ) : (
                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
                                  <div className="text-4xl mb-2">⏳</div>
                                  <p className="text-yellow-400 font-medium">Waiting for {redemption.creatorId.username}'s Answer</p>
                                  <p className="text-text/60 text-sm mt-1">You'll be notified when they respond!</p>
                                </div>
                              )}

                              <div className="flex justify-center">
                                <button
                                  onClick={() => toggleRedemptionExpansion(redemption._id)}
                                  className="bg-text/10 hover:bg-text/20 text-text/70 px-4 py-2 rounded text-sm transition"
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
                          {redemption.fanInput && (
                            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
                              <p className="text-sm text-text/80">
                                <span className="font-medium text-primary">Your input:</span> {redemption.fanInput}
                              </p>
                            </div>
                          )}
                          
                          {redemption.status === 'Fulfilled' && redemption.fulfilledAt && redemption.vaultItemId.fileType === 'text-reward' && (
                            <p className="text-xs text-green-400">
                              Fulfilled on {new Date(redemption.fulfilledAt).toLocaleDateString()}
                            </p>
                          )}
                          
                          {redemption.vaultItemId.fileType !== 'text-reward' && (
                            <button
                              onClick={() => {
                                // Download file
                                const link = document.createElement('a');
                                link.href = redemption.vaultItemId.fileUrl;
                                link.download = redemption.vaultItemId.title;
                                link.click();
                              }}
                              className="mt-3 bg-primary text-text px-4 py-2 rounded-lg hover:bg-primary/80 transition text-sm font-medium"
                            >
                              ⬇️ Download
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

        {/* Points Info */}
        <div className="mt-8 bg-text/5 border border-text/10 rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-3 text-accent">How Fam Points Work</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-text/80">
            <div>
              <h5 className="font-semibold text-text mb-2">Earning Points:</h5>
              <ul className="list-disc list-inside space-y-1 text-text/70">
                <li>Earn 1 point for every $10 donated</li>
                <li>Points are rounded down (e.g., $15 = 1 point)</li>
                <li>Minimum donation of $10 required to earn points</li>
                <li>Points are awarded instantly after payment</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-text mb-2">Using Points:</h5>
              <ul className="list-disc list-inside space-y-1 text-text/70">
                <li>Track your donation activity</li>
                <li>Show your support for the community</li>
                <li>Future rewards and features coming soon</li>
                <li>Points never expire</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.back()}
            className="bg-text/20 hover:bg-text/30 text-text px-6 py-2 rounded-md font-semibold transition"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyFamPointsPage;
