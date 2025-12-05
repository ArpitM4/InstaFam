"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const VaultPayouts = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [payoutData, setPayoutData] = useState({
    currentMonthFamPoints: 0,
    totalFamPointsRedeemed: 0,
    nextPayoutDate: '',
    redemptionHistory: [],
    totalRedemptions: 0,
    currentMonthRedemptions: 0,
    monthlyBonuses: []
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
        console.log('API Response:', result.data); // Debug logging
        setPayoutData(result.data);
      } else if (response.status === 403) {
        toast.error("Access denied. Creator account required.");
        router.push("/creator/dashboard");
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

  const requestBonus = async (month, year) => {
    try {
      const response = await fetch('/api/vault/request-bonus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ month, year }),
      });

      if (response.ok) {
        toast.success("Bonus request submitted successfully!");
        fetchPayoutData(); // Refresh data
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to request bonus");
      }
    } catch (error) {
      console.error('Error requesting bonus:', error);
      toast.error("Error submitting bonus request");
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

  const formatFamPoints = (points) => {
    const numPoints = parseInt(points) || 0;
    return new Intl.NumberFormat('en-IN').format(numPoints);
  };

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'UnRequested':
        return 'bg-gray-500/10 text-gray-500';
      case 'Requested':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'Granted':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
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
        <h1 className="text-2xl font-semibold text-primary mb-3">Vault Bonuses</h1>
        <p className="text-text/60 text-sm">Track your FamPoints from vault redemptions and request monthly bonuses</p>
      </div>

      {/* Current Month FamPoints Section */}
      <section className="space-y-6">
        <h3 className="text-lg font-medium text-text/90">Current Month Vault Activity</h3>
        <div className="bg-dropdown-hover rounded-xl p-8">
          <div className="text-center">
            <p className="text-4xl font-light text-text mb-2">
              {formatFamPoints(payoutData.currentMonthFamPoints || 0)} <span className="text-lg text-primary">FP</span>
            </p>
            <p className="text-text/60 text-sm">
              FamPoints from {payoutData.currentMonthRedemptions || 0} redemptions this month
            </p>
            {(payoutData.currentMonthRedemptions || 0) !== (payoutData.totalRedemptions || 0) && (
              <p className="text-text/50 text-xs mt-2">
                Total: {payoutData.totalRedemptions || 0} redemptions ({formatFamPoints(payoutData.totalFamPointsRedeemed || 0)} FP lifetime)
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Bonus Schedule Section */}
      <section className="space-y-6">
        <h3 className="text-lg font-medium text-text/90">Bonus Schedule</h3>
        <div className="bg-dropdown-hover rounded-xl p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <span className="text-sm text-text/70">Next Bonus Period:</span>
            <span className="text-sm font-medium text-primary">{payoutData.nextPayoutDate}</span>
          </div>
          <p className="text-text/60 text-sm">
            Monthly bonuses are calculated based on your FamPoints activity. Request bonuses at the end of each month.
          </p>
        </div>

        {/* Monthly Bonuses Table */}
        {payoutData.monthlyBonuses && payoutData.monthlyBonuses.length > 0 && (
          <div className="bg-dropdown-hover rounded-xl p-6">
            <h4 className="text-md font-medium text-text/90 mb-4">Monthly Bonus History</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-text/10">
                    <th className="text-left py-3 text-sm font-medium text-text/70">Month</th>
                    <th className="text-left py-3 text-sm font-medium text-text/70">FamPoints</th>
                    <th className="text-left py-3 text-sm font-medium text-text/70">Redemptions</th>
                    <th className="text-left py-3 text-sm font-medium text-text/70">Status</th>
                    <th className="text-left py-3 text-sm font-medium text-text/70">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payoutData.monthlyBonuses.map((bonus, index) => (
                    <tr key={index} className="border-b border-text/5">
                      <td className="py-3 text-sm text-text">
                        {getMonthName(bonus.month)} {bonus.year}
                      </td>
                      <td className="py-3 text-sm text-text">
                        {formatFamPoints(bonus.totalFamPointsRedeemed)} FP
                      </td>
                      <td className="py-3 text-sm text-text">
                        {bonus.totalRedemptions}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bonus.status)}`}>
                          {bonus.status}
                        </span>
                      </td>
                      <td className="py-3">
                        {bonus.status === 'UnRequested' && bonus.totalFamPointsRedeemed > 0 && (
                          <button
                            onClick={() => requestBonus(bonus.month, bonus.year)}
                            className="px-3 py-1 bg-primary text-white text-xs rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            Request Bonus
                          </button>
                        )}
                        {bonus.status === 'Requested' && (
                          <span className="text-xs text-text/50">Pending Review</span>
                        )}
                        {bonus.status === 'Granted' && (
                          <span className="text-xs text-green-500 font-medium">₹{bonus.bonusAmount || 0}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
                onClick={() => router.push('/creator/vault')}
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
                    <p className="font-semibold text-primary text-sm">
                      {formatFamPoints(redemption.famPointsSpent || 0)} FP
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
                {payoutData.totalRedemptions || 0}
              </p>
              <p className="text-text/60 text-sm">Total Redemptions</p>
            </div>
            <div className="bg-dropdown-hover rounded-xl p-6 text-center">
              <p className="text-2xl font-light text-text mb-2">
                {formatFamPoints(payoutData.totalFamPointsRedeemed || 0)} <span className="text-sm text-primary">FP</span>
              </p>
              <p className="text-text/60 text-sm">Total FamPoints</p>
            </div>
            <div className="bg-dropdown-hover rounded-xl p-6 text-center">
              <p className="text-2xl font-light text-text mb-2">
                {formatFamPoints(Math.round((payoutData.totalFamPointsRedeemed || 0) / (payoutData.totalRedemptions || 1)))} <span className="text-sm text-primary">FP</span>
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
