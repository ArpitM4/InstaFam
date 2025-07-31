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
        <div className="border-b border-text/20 pb-6 mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">My Fam Points</h1>
          <p className="text-text/70">Track your points and redemptions</p>
        </div>

        {/* Points Summary Card */}
        <div className="bg-text/5 border-text/10 rounded-lg p-6 mb-8 text-center">
          <h2 className="text-2xl font-semibold text-text mb-2">
            {pointsData.totalPoints} Fam Points
          </h2>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-text/10 rounded-lg p-1 mb-8">
          <button
            onClick={() => setActiveTab('points')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'points'
                ? 'bg-primary text-text shadow-sm'
                : 'text-text/70 hover:text-text hover:bg-text/5'
            }`}
          >
            Points History
          </button>
          <button
            onClick={() => setActiveTab('redemptions')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'redemptions'
                ? 'bg-primary text-text shadow-sm'
                : 'text-text/70 hover:text-text hover:bg-text/5'
            }`}
          >
            My Redemptions
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'points' ? (
          /* Transaction History */
          <div className="bg-text/5 border-text/10 rounded-lg p-6">
            <h3 className="text-2xl font-semibold mb-6 text-text">Points History</h3>
            
            {pointsData.transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text/60 mb-4">No points earned yet</p>
                <button
                  onClick={() => router.push('/explore')}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Explore Creators
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {pointsData.transactions.map((transaction, index) => (
                  <div
                    key={transaction._id || index}
                    className="bg-background/50 border border-text/10 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-green-400">
                            +{transaction.points_earned} Points
                          </span>
                        </div>
                        <p className="text-sm text-text/70">
                          ${transaction.donation_amount} donation
                          {transaction.payment_id?.to_user?.username && (
                            <span className="ml-2">to {transaction.payment_id.to_user.username}</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-text/60">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Redemption History */
          <div className="bg-text/5 border-text/10 rounded-lg p-6">
            <h3 className="text-2xl font-semibold mb-6 text-text">My Redemptions</h3>
            
            {redemptions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text/60 mb-4">No redemptions yet</p>
                <button
                  onClick={() => router.push('/explore')}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors"
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
                      className="bg-background/50 border border-text/10 rounded-lg p-6"
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
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            redemption.status === 'Fulfilled'
                              ? 'bg-text/10 text-green-500'
                              : 'bg-text/10 text-red-500'
                          }`}>
                            {redemption.status === 'Fulfilled' ? 'Answered' : 'Pending'}
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
                                    <span className="font-medium">Your Question:</span> 
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
                                  className="ml-4 bg-text/10 hover:bg-text/20 text-text px-3 py-1 rounded text-sm font-medium transition-colors"
                                >
                                  {hasCreatorResponse ? 'View Answer' : 'View Details'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {/* Full Q&A View */}
                              <div className="space-y-3">
                                <h5 className="text-sm font-medium text-text/70 uppercase tracking-wide">
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
                                  className="bg-text/10 hover:bg-text/20 text-text/70 px-4 py-2 rounded text-sm transition-colors"
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
                          {redemption.vaultItemId.fileType !== 'text-reward' && (
                            <button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = redemption.vaultItemId.fileUrl;
                                link.download = redemption.vaultItemId.title;
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
            className="bg-text/10 hover:bg-text/20 text-text px-6 py-2 rounded-lg font-medium transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyFamPointsPage;
