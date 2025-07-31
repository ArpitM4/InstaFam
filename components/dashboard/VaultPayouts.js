"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const VaultPayouts = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [payoutData, setPayoutData] = useState({
    vaultEarningsBalance: 0,
    currentMonthEarnings: 0,
    nextPayoutDate: '',
    redemptionHistory: [],
    totalRedemptions: 0,
    currentMonthRedemptions: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    fetchPayoutData();
  }, [session, status, router]);

  const fetchPayoutData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/vault/payouts');
      if (response.ok) {
        const result = await response.json();
        setPayoutData(result.data);
      } else if (response.status === 403) {
        toast.error("Access denied. Creator account required.");
        router.push("/dashboard");
      } else {
        toast.error("Failed to fetch payout data");
      }
    } catch (error) {
      console.error('Error fetching payout data:', error);
      toast.error("Error loading payout data");
    } finally {
      setIsLoading(false);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="pb-8">
        <h1 className="text-2xl font-semibold text-text mb-3">Vault Payouts</h1>
        <p className="text-text/60 text-sm">Track your earnings from fan vault redemptions</p>
      </div>

      {/* Current Earnings Section */}
      <section className="space-y-6">
        <h3 className="text-lg font-medium text-text/90">Current Month Vault Earnings</h3>
        <div className="bg-dropdown-hover rounded-xl p-8">
          <div className="text-center">
            <p className="text-4xl font-light text-text mb-2">
              {formatCurrency(payoutData.vaultEarningsBalance)}
            </p>
            <p className="text-text/60 text-sm">
              Earnings from {payoutData.currentMonthRedemptions} redemptions this month
            </p>
            {payoutData.currentMonthRedemptions !== payoutData.totalRedemptions && (
              <p className="text-text/50 text-xs mt-2">
                Total: {payoutData.totalRedemptions} redemptions (₹{payoutData.redemptionHistory.reduce((sum, r) => sum + r.earnings, 0)} lifetime earnings)
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Next Payout Section */}
      <section className="space-y-6">
        <h3 className="text-lg font-medium text-text/90">Payout Schedule</h3>
        <div className="bg-dropdown-hover rounded-xl p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <span className="text-sm text-text/70">Next Payout:</span>
            <span className="text-sm font-medium text-primary">{payoutData.nextPayoutDate}</span>
          </div>
          <p className="text-text/60 text-sm">
            Vault earnings are paid out monthly on the 1st of each month to your registered payment method.
          </p>
        </div>
      </section>

      {/* Redemption History Section */}
      <section className="space-y-6">
        <h3 className="text-lg font-medium text-text/90">Redemption History</h3>
        <div className="bg-dropdown-hover rounded-xl p-6">
          {payoutData.redemptionHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <div className="w-20 h-20 bg-text/5 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-10 h-10 text-text/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <p className="text-text/60 mb-6">No vault redemptions yet</p>
              <button
                onClick={() => router.push('/dashboard/vault')}
                className="px-6 py-3 bg-primary rounded-lg hover:bg-primary/90 text-sm font-medium text-white transition-colors"
              >
                Manage Vault Items
              </button>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-3">
              {payoutData.redemptionHistory.map((redemption, index) => (
                <div
                  key={redemption.id}
                  className="bg-background/30 rounded-lg p-4 flex items-center justify-between hover:bg-background/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary font-medium text-sm">
                        {redemption.fanUsername.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-text text-sm">{redemption.fanUsername}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          redemption.status === 'Fulfilled'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {redemption.status}
                        </span>
                      </div>
                      <p className="text-text/60 text-xs">
                        {redemption.vaultItemTitle} • {formatDate(redemption.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-500 text-sm">
                      {formatCurrency(redemption.earnings)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Summary Statistics */}
      {payoutData.redemptionHistory.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-lg font-medium text-text/90">Summary Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-dropdown-hover rounded-xl p-6 text-center">
              <p className="text-2xl font-light text-text mb-2">
                {payoutData.totalRedemptions}
              </p>
              <p className="text-text/60 text-sm">Total Redemptions</p>
            </div>
            <div className="bg-dropdown-hover rounded-xl p-6 text-center">
              <p className="text-2xl font-light text-text mb-2">
                {formatCurrency(payoutData.redemptionHistory.reduce((sum, r) => sum + r.earnings, 0))}
              </p>
              <p className="text-text/60 text-sm">Total Earnings</p>
            </div>
            <div className="bg-dropdown-hover rounded-xl p-6 text-center">
              <p className="text-2xl font-light text-text mb-2">
                ₹{Math.round(payoutData.redemptionHistory.reduce((sum, r) => sum + r.earnings, 0) / payoutData.totalRedemptions) || 0}
              </p>
              <p className="text-text/60 text-sm">Avg per Redemption</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default VaultPayouts;
