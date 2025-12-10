"use client";
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const VaultRequests = ({ creatorUsername }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    // Action Inputs
    const [responseText, setResponseText] = useState("");
    const [rejectReason, setRejectReason] = useState("");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [actionType, setActionType] = useState(null); // 'fulfill' | 'reject'

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/vault/requests');
            if (res.ok) {
                const data = await res.json();
                setRequests(data.requests || []);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        if (!selectedRequest || !actionType) return;

        setProcessingId(selectedRequest._id);
        try {
            const body = {
                requestId: selectedRequest._id,
                action: actionType,
                response: actionType === 'fulfill' ? responseText : undefined,
                rejectionReason: actionType === 'reject' ? rejectReason : undefined
            };

            const res = await fetch('/api/vault/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                toast.success(actionType === 'fulfill' ? "Request Fulfilled!" : "Request Rejected & Refunded");
                fetchRequests(); // Refresh list
                setSelectedRequest(null);
                setActionType(null);
                setResponseText("");
                setRejectReason("");
            } else {
                const data = await res.json();
                toast.error(data.error || "Action failed");
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <div className="text-center p-8 text-white/50">Loading requests...</div>;

    if (requests.length === 0) {
        return (
            <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-white/60">No active vault requests.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {requests.map(req => (
                <div key={req._id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                {/* Type Badge */}
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${req.vaultItemId?.type === 'qna' ? 'bg-blue-500/20 text-blue-300 border-blue-500/20' :
                                    req.vaultItemId?.type === 'promise' ? 'bg-purple-500/20 text-purple-300 border-purple-500/20' :
                                        'bg-white/10 text-white/60 border-white/10'
                                    }`}>
                                    {req.vaultItemId?.type === 'qna' ? 'Q & A' : req.vaultItemId?.type === 'promise' ? 'Promise' : req.vaultItemId?.type || 'Reward'}
                                </span>

                                {/* Status Badge */}
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${req.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                    req.status === 'Fulfilled' ? 'bg-green-500/20 text-green-400' :
                                        'bg-red-500/20 text-red-400'
                                    }`}>
                                    {req.status.toUpperCase()}
                                </span>
                                <span className="text-white/40 text-xs">
                                    {new Date(req.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <h4 className="font-medium text-white">{req.vaultItemId?.title || "Unknown Item"}</h4>
                            <p className="text-sm text-white/60">Fan: <span className="text-white">{req.fanId?.name || "Unknown"}</span> (@{req.fanId?.username})</p>
                        </div>
                        <div className="text-right">
                            <span className="text-primary font-bold">{req.vaultItemId?.pointCost} FP</span>
                        </div>
                    </div>

                    {/* Fan Input Display */}
                    <div className="bg-black/40 p-3 rounded-lg text-sm text-white/80 mb-3 border-l-2 border-primary">
                        <p className="text-xs text-white/40 mb-1 uppercase font-bold">User Input</p>
                        "{req.fanInput || "No input provided"}"
                    </div>

                    {/* Creator Response Display (If fulfilled) */}
                    {req.creatorResponse && (
                        <div className="bg-green-500/5 p-3 rounded-lg text-sm text-white/80 mb-3 border-l-2 border-green-500/40">
                            <p className="text-xs text-green-400 mb-1 uppercase font-bold">Your Response</p>
                            "{req.creatorResponse}"
                        </div>
                    )}

                    {/* Actions (Only actions for Pending) */}
                    {req.status === 'Pending' && (
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={() => { setSelectedRequest(req); setActionType('fulfill'); }}
                                className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                            >
                                <FaCheck className="text-xs" /> Fulfill
                            </button>
                            <button
                                onClick={() => { setSelectedRequest(req); setActionType('reject'); }}
                                className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                            >
                                <FaTimes className="text-xs" /> Reject
                            </button>
                        </div>
                    )}
                </div>
            ))}

            {/* Action Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
                    <div className="bg-[#1a1a1f] p-6 rounded-2xl max-w-md w-full border border-white/10">
                        <h3 className="text-xl font-bold text-white mb-4">
                            {actionType === 'fulfill' ? 'Fulfill Request' : 'Reject Request'}
                        </h3>

                        {/* Show Fan Input Context in Modal */}
                        <div className="bg-white/5 p-3 rounded-lg mb-4 text-sm">
                            <p className="text-xs text-white/40 mb-1 uppercase font-bold">Request from {selectedRequest.fanId?.name}</p>
                            <p className="text-white/80 italic">"{selectedRequest.fanInput || 'No message'}"</p>
                        </div>

                        {actionType === 'fulfill' && (() => {
                            const isQnA = selectedRequest.vaultItemId?.type === 'qna';
                            return (
                                <div className="mb-4">
                                    <label className="block text-sm text-white/60 mb-2">
                                        {isQnA ? "Your Answer (Required)" : "Your Response / Note (Optional)"}
                                    </label>
                                    <textarea
                                        value={responseText}
                                        onChange={(e) => setResponseText(e.target.value)}
                                        className={`w-full bg-black/50 border rounded-lg p-3 text-white focus:outline-none ${isQnA && !responseText.trim() ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary'}`}
                                        rows={3}
                                        placeholder={isQnA ? "Type your answer here..." : "Send a message back to the fan..."}
                                    />
                                    {isQnA && <p className="text-xs text-white/30 mt-1">This answer will be visible to the fan.</p>}
                                </div>
                            );
                        })()}

                        {actionType === 'reject' && (
                            <div className="mb-4">
                                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg mb-3">
                                    <p className="text-red-400 text-xs flex items-center gap-1.5">
                                        <FaExclamationTriangle className="text-[10px]" /> Warning: Rejecting will automatically refund {selectedRequest.vaultItemId?.pointCost} points to the fan.
                                    </p>
                                </div>
                                <label className="block text-sm text-white/60 mb-2">Rejection Reason (Required):</label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500"
                                    rows={3}
                                    placeholder="Why are you rejecting this request?"
                                />
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setSelectedRequest(null); setActionType(null); }}
                                className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAction}
                                disabled={
                                    processingId === selectedRequest._id ||
                                    (actionType === 'reject' && !rejectReason) ||
                                    (actionType === 'fulfill' && selectedRequest.vaultItemId?.type === 'qna' && !responseText.trim())
                                }
                                className={`flex-1 py-2 rounded-lg text-white font-medium ${actionType === 'fulfill' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {processingId === selectedRequest._id ? 'Processing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VaultRequests;
