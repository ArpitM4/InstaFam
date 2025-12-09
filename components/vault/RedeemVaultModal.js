"use client";
import React, { useState } from 'react';
import { toast } from 'sonner';

const RedeemVaultModal = ({ item, userPoints, onClose, onRedeemSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Input (if needed), 2: Disclaimer (for Promise/Qna)
    const [fanInput, setFanInput] = useState('');

    const needsInput = item.instructions || item.type === 'qna' || item.type === 'promise';
    const needsDisclaimer = item.type === 'qna' || item.type === 'promise';

    const handleNext = () => {
        if (step === 1 && needsInput && !fanInput.trim()) {
            toast.error("Please provide the required info");
            return;
        }

        if (step === 1 && needsDisclaimer) {
            setStep(2);
        } else {
            handleRedeem();
        }
    };

    const handleRedeem = async () => {
        setLoading(true);
        // Call the PARENT/Global redeem function or API directly?
        // VaultSection passes `processRedemption`. But logic is complex.
        // Ideally this component calls the API and returns success.
        // BUT VaultSection has state (userPoints). 
        // Let's call the prop `onRedeemSuccess` with the input if successful.
        // Wait, let's keep logic here for cleaner separation if possible, but existing VaultSection has API calls.
        // I will call `onRedeemSuccess(item, fanInput)` and let parent handle API and state update?
        // User requested "Refactor VaultSection.js into smaller components".
        // So logic should stay in Parent or be in a Hook.
        // I'll emit the event to parent to finalize redemption.
        await onRedeemSuccess(item, fanInput);
        setLoading(false);
        // Close is handled by parent after success usually, or we close here if parent waits.
        // Assuming parent handles async, we don't close here immediately if loading.
    };

    // STEP 1: INPUT
    if (step === 1) {
        return (
            <div className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
                <div className="bg-[#1a1a1f] p-6 rounded-2xl max-w-md w-full border border-white/10">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-white mb-2">Redeem Reward</h3>
                        <p className="text-white/60 text-sm">{item.title} ({item.pointCost} FP)</p>
                    </div>

                    {needsInput ? (
                        <div className="mb-6">
                            <label className="block text-sm text-primary mb-2 font-medium">
                                {item.instructions || "Your Input Required:"}
                            </label>
                            <textarea
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                                rows={3}
                                placeholder="Type here..."
                                value={fanInput} onChange={e => setFanInput(e.target.value)}
                            />
                        </div>
                    ) : (
                        <div className="mb-6 bg-white/5 p-4 rounded-xl text-center">
                            <p className="text-white/80 text-sm">Are you sure you want to spend <span className="text-primary font-bold">{item.pointCost} points</span>?</p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button onClick={onClose} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium">
                            Cancel
                        </button>
                        <button onClick={handleNext} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90">
                            {needsDisclaimer ? 'Next' : 'Confirm Redeem'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // STEP 2: DISCLAIMER (Only for Promise/QnA)
    if (step === 2) {
        return (
            <div className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
                <div className="bg-[#1a1a1f] p-6 rounded-2xl max-w-md w-full border border-yellow-500/30">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-white mb-2">Fan Disclaimer</h2>
                        <p className="text-sm text-white/60">Please read carefully before redeeming.</p>
                    </div>

                    <div className="bg-white/5 p-4 rounded-xl text-xs text-white/70 space-y-2 mb-6 border border-white/10 h-48 overflow-y-auto">
                        <p>By redeeming this reward, you understand and agree that:</p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>The reward is fulfilled directly by the creator, not by Sygil.</li>
                            <li>Sygil does not verify, manage, or guarantee the creator’s actions.</li>
                            <li>Request delivery happens off-platform at your own risk.</li>
                            <li>FamPoints are deducted immediately and only returned if rejected or expired (60 days).</li>
                            <li>Sygil has no liability for missed or unsatisfactory fulfillment.</li>
                        </ul>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setStep(1)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium">
                            Back
                        </button>
                        <button onClick={handleRedeem} disabled={loading} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50">
                            {loading ? 'Processing...' : 'I Agree & Redeem'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default RedeemVaultModal;
