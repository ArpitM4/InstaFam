"use client";

import { useState, useEffect } from "react";
import { fetchPendingRedemptions, fulfillRedemption, submitCreatorAnswer, fetchFulfilledRedemptions } from "@/actions/vaultActions";
import { toast } from 'react-toastify';

const VaultRequests = () => {
  const [pendingRedemptions, setPendingRedemptions] = useState([]);
  const [fulfilledRedemptions, setFulfilledRedemptions] = useState([]);
  const [redemptionsLoading, setRedemptionsLoading] = useState(false);
  const [activeRequestsTab, setActiveRequestsTab] = useState('pending');
  const [creatorResponses, setCreatorResponses] = useState({});
  const [submittingAnswers, setSubmittingAnswers] = useState({});

  useEffect(() => {
    loadRedemptions();
  }, [activeRequestsTab]);

  const loadPendingRedemptions = async () => {
    try {
      setRedemptionsLoading(true);
      const result = await fetchPendingRedemptions();
      if (result.success) {
        setPendingRedemptions(result.redemptions);
      }
    } catch (error) {
      console.error('Error loading pending redemptions:', error);
    } finally {
      setRedemptionsLoading(false);
    }
  };

  const loadFulfilledRedemptions = async () => {
    try {
      setRedemptionsLoading(true);
      const result = await fetchFulfilledRedemptions();
      if (result.success) {
        setFulfilledRedemptions(result.redemptions);
      }
    } catch (error) {
      console.error('Error loading fulfilled redemptions:', error);
    } finally {
      setRedemptionsLoading(false);
    }
  };

  const loadRedemptions = async () => {
    if (activeRequestsTab === 'pending') {
      await loadPendingRedemptions();
    } else {
      await loadFulfilledRedemptions();
    }
  };

  const handleFulfillRedemption = async (redemptionId) => {
    if (!confirm('Are you sure you want to mark this redemption as fulfilled?')) {
      return;
    }

    try {
      const result = await fulfillRedemption(redemptionId);
      
      if (result.success) {
        toast.success('Redemption marked as fulfilled!');
        // Move the fulfilled redemption from pending to fulfilled list
        const fulfilledRedemption = pendingRedemptions.find(r => r._id === redemptionId);
        if (fulfilledRedemption) {
          setPendingRedemptions(prev => prev.filter(r => r._id !== redemptionId));
          setFulfilledRedemptions(prev => [...prev, { ...fulfilledRedemption, fulfilledAt: new Date() }]);
        }
      } else {
        toast.error(result.error || 'Error fulfilling redemption');
      }
    } catch (error) {
      toast.error('Error fulfilling redemption');
      console.error(error);
    }
  };

  const handleSubmitAnswer = async (redemptionId) => {
    const response = creatorResponses[redemptionId];
    
    if (!response || !response.trim()) {
      toast.error('Please write an answer before submitting');
      return;
    }

    setSubmittingAnswers(prev => ({ ...prev, [redemptionId]: true }));

    try {
      const result = await submitCreatorAnswer(redemptionId, response.trim());
      
      if (result.success) {
        toast.success('Answer submitted successfully! The redemption has been marked as fulfilled.');
        
        // Update the redemption with the answer and move to fulfilled
        const answeredRedemption = pendingRedemptions.find(r => r._id === redemptionId);
        if (answeredRedemption) {
          setPendingRedemptions(prev => prev.filter(r => r._id !== redemptionId));
          setFulfilledRedemptions(prev => [...prev, { 
            ...answeredRedemption, 
            creatorResponse: response.trim(),
            fulfilledAt: new Date()
          }]);
        }
        
        // Clear the response from state
        setCreatorResponses(prev => {
          const newResponses = { ...prev };
          delete newResponses[redemptionId];
          return newResponses;
        });
      } else {
        toast.error(result.error || 'Error submitting answer');
      }
    } catch (error) {
      toast.error('Error submitting answer');
      console.error(error);
    } finally {
      setSubmittingAnswers(prev => ({ ...prev, [redemptionId]: false }));
    }
  };

  const handleResponseChange = (redemptionId, value) => {
    setCreatorResponses(prev => ({
      ...prev,
      [redemptionId]: value
    }));
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-text/20 pb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">Vault Requests</h1>
        <p className="text-text/70">Manage fan redemptions that require your action</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-text/10 rounded-lg p-1">
        <button
          onClick={() => {
            setActiveRequestsTab('pending');
            loadRedemptions();
          }}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeRequestsTab === 'pending'
              ? 'bg-primary text-text shadow-sm'
              : 'text-text/70 hover:text-text hover:bg-text/5'
          }`}
        >
          Pending Requests
          {pendingRedemptions.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {pendingRedemptions.length}
            </span>
          )}
        </button>
        <button
          onClick={() => {
            setActiveRequestsTab('fulfilled');
            loadRedemptions();
          }}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeRequestsTab === 'fulfilled'
              ? 'bg-primary text-text shadow-sm'
              : 'text-text/70 hover:text-text hover:bg-text/5'
          }`}
        >
          Fulfilled Requests
          {fulfilledRedemptions.length > 0 && (
            <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              {fulfilledRedemptions.length}
            </span>
          )}
        </button>
      </div>

      {/* Pending Redemptions */}
      {activeRequestsTab === 'pending' && (
        <section className="bg-text/5  border-text/10 rounded-lg p-6">
          <h3 className="text-2xl font-semibold mb-4">
            Pending Fulfillments 
            {pendingRedemptions.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                {pendingRedemptions.length}
              </span>
            )}
          </h3>
          
          {redemptionsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent mx-auto mb-2"></div>
              <p className="text-text/60">Loading pending requests...</p>
            </div>
          ) : pendingRedemptions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-text/60">No pending requests! All your fans' redemptions are up to date.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRedemptions.map((redemption) => (
                <div key={redemption._id} className="bg-background/50 border border-text/10 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-primary mb-2">
                        {redemption.vaultItemId.title}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-text/60">
                        <span className="flex items-center gap-1">
                          👤 <strong>{redemption.fanId.username}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                           {new Date(redemption.redeemedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Perk Type Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    {redemption.vaultItemId.requiresFanInput && redemption.fanInput && (
                      <span className="bg-text/10  text-red-500 px-3 py-1 rounded-full text-xs font-medium">
                        Answer Required *
                      </span>
                    )}
                  </div>

                  {/* Fan Input Section - Q&A Interface */}
                  {redemption.vaultItemId.requiresFanInput && redemption.fanInput ? (
                    <div className="space-y-6">
                      {/* Fan's Question */}
                      <div className="space-y-3">
                        <div className="bg-background/30 rounded-lg ">
                          <p className="text-text/90 leading-relaxed">
                            {redemption.fanInput}
                          </p>
                        </div>
                      </div>

                      {/* Creator's Answer Interface */}
                      <div className="space-y-3">
                        <h5 className="text-sm font-medium text-text/70 uppercase tracking-wide">
                          Your Answer
                        </h5>
                        <textarea
                          value={creatorResponses[redemption._id] || ''}
                          onChange={(e) => handleResponseChange(redemption._id, e.target.value)}
                          placeholder="Write your exclusive answer to this fan's question..."
                          className="w-full bg-background/30 border border-text/10 rounded-lg p-4 text-text resize-none focus:border-primary/30 focus:outline-none min-h-[100px] transition-colors"
                          maxLength={2000}
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-text/50">
                            {(creatorResponses[redemption._id] || '').length}/2000 characters
                          </span>
                          <button
                            onClick={() => handleSubmitAnswer(redemption._id)}
                            disabled={submittingAnswers[redemption._id] || !(creatorResponses[redemption._id] || '').trim()}
                            className="bg-primary hover:bg-primary/90 disabled:bg-text/20 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                          >
                            {submittingAnswers[redemption._id] ? (
                              <>
                                <div className="animate-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent"></div>
                                Sending...
                              </>
                            ) : (
                              'Send Answer'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Non-Q&A redemptions (simple fulfillment)
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleFulfillRedemption(redemption._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Mark as Fulfilled
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Fulfilled Redemptions */}
      {activeRequestsTab === 'fulfilled' && (
        <section className="bg-text/5 border-text/10 rounded-lg p-6">
          <h3 className="text-2xl font-semibold mb-4">
            Fulfilled Requests History
            {fulfilledRedemptions.length > 0 && (
              <span className="ml-2 bg-green-500 text-white text-sm px-3 py-1 rounded-full">
                {fulfilledRedemptions.length}
              </span>
            )}
          </h3>
          
          {redemptionsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent mx-auto mb-2"></div>
              <p className="text-text/60">Loading fulfilled requests...</p>
            </div>
          ) : fulfilledRedemptions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-text/60">No fulfilled requests yet. Completed requests will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {fulfilledRedemptions.map((redemption) => (
                <div key={redemption._id} className="bg-background/50 border border-text/10 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-primary mb-2">
                        {redemption.vaultItemId.title}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-text/60">
                        <span className="flex items-center gap-1">
                          👤 <strong>{redemption.fanId.username}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          {new Date(redemption.redeemedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Perk Type Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-text/10 text-green-500 px-3 py-1 rounded-full text-xs font-medium">
                      Completed ✓
                    </span>
                  </div>

                  {/* Show Q&A History if applicable */}
                  {redemption.vaultItemId.requiresFanInput && redemption.fanInput && (
                    <div className="space-y-6">
                      {/* Fan's Question */}
                      <div className="space-y-3">
                        <div className="bg-background/30 rounded-lg p-4">
                          <p className="text-text/90 leading-relaxed">
                            {redemption.fanInput}
                          </p>
                        </div>
                      </div>

                      {/* Creator's Answer (if available) */}
                      {redemption.creatorResponse && (
                        <div className="space-y-3">
                          <h5 className="text-sm font-medium text-text/70 uppercase tracking-wide">
                            Your Answer
                          </h5>
                          <div className="bg-background/30 rounded-lg p-4">
                            <p className="text-text/90 leading-relaxed whitespace-pre-wrap">{redemption.creatorResponse}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default VaultRequests;
