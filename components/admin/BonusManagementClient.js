'use client';

import { useState, useEffect } from 'react';
import { Gift, CheckCircle, RefreshCw, DollarSign } from 'lucide-react';

export default function BonusManagementClient() {
  const [requestedBonuses, setRequestedBonuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [granting, setGranting] = useState(null);
  const [bonusAmount, setBonusAmount] = useState({});

  const fetchRequestedBonuses = async () => {
    try {
      const response = await fetch('/api/admin/requested-bonuses');
      const data = await response.json();
      setRequestedBonuses(data.bonuses || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const grantBonus = async (bonusId) => {
    const amount = bonusAmount[bonusId];
    if (!amount || amount <= 0) {
      alert('Please enter a valid bonus amount');
      return;
    }

    setGranting(bonusId);
    try {
      const response = await fetch(`/api/admin/grant-bonus/${bonusId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bonusAmount: parseFloat(amount) }),
      });
      
      if (response.ok) {
        // Remove granted bonus from list
        setRequestedBonuses(prev => prev.filter(bonus => bonus._id !== bonusId));
        setBonusAmount(prev => {
          const { [bonusId]: removed, ...rest } = prev;
          return rest;
        });
      }
    } catch (error) {
      console.error('Grant bonus error:', error);
    } finally {
      setGranting(null);
    }
  };

  useEffect(() => {
    fetchRequestedBonuses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
  <div className="bg-[var(--background)] text-[var(--text)] rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-[var(--textStrong)]">Requested Bonuses</h2>
            <p className="text-sm text-[var(--textSoft)] mt-1">
              Creator bonuses that have been requested and are awaiting approval
            </p>
          </div>
          <button
            onClick={fetchRequestedBonuses}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded-md"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Requested Bonuses List */}
      {requestedBonuses.length === 0 ? (
  <div className="bg-[var(--background)] text-[var(--text)] rounded-lg shadow-sm p-12 border border-gray-200 dark:border-gray-700 text-center">
          <Gift className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--textStrong)] mb-2">All caught up!</h3>
          <p className="text-[var(--textSoft)]">No pending bonus requests at the moment.</p>
        </div>
      ) : (
  <div className="bg-[var(--background)] text-[var(--text)] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-[var(--textStrong)]">
              {requestedBonuses.length} Pending Bonus Request{requestedBonuses.length !== 1 ? 's' : ''}
            </h3>
          </div>
          
          <div className="divide-y">
            {requestedBonuses.map((bonus) => (
              <div key={bonus._id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-6">
                      {/* Creator Info */}
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-[var(--textStrong)]">
                          @{bonus.creatorUsername}
                        </h4>
                        <p className="text-sm text-[var(--textSoft)] mt-1">
                          Creator ID: {bonus.creatorId}
                        </p>
                      </div>
                      
                      {/* Period Info */}
                      <div className="text-center">
                        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 min-w-[120px]">
                          <p className="text-xs text-blue-600 mb-1">Period</p>
                          <p className="text-lg font-bold text-blue-900">
                            {new Date(bonus.year, bonus.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      
                      {/* Stats */}
                      <div className="text-center">
                        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 min-w-[140px]">
                          <p className="text-xs text-green-600 mb-1">Points Redeemed</p>
                          <p className="text-lg font-bold text-green-900">
                            {bonus.totalFamPointsRedeemed.toLocaleString()}
                          </p>
                          <p className="text-xs text-green-600">
                            {bonus.totalRedemptions} redemption{bonus.totalRedemptions !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      
                      {/* Request Time */}
                      <div className="text-center">
                        <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-3 min-w-[140px]">
                          <p className="text-xs text-gray-600 mb-1">Requested</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(bonus.requestedAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-600">
                            {new Date(bonus.requestedAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Grant Action */}
                  <div className="ml-6 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        placeholder="Bonus amount"
                        step="0.01"
                        min="0"
                        value={bonusAmount[bonus._id] || ''}
                        onChange={(e) => setBonusAmount(prev => ({
                          ...prev,
                          [bonus._id]: e.target.value
                        }))}
                        className="w-32 px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={() => grantBonus(bonus._id)}
                      disabled={granting === bonus._id || !bonusAmount[bonus._id]}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 text-sm"
                    >
                      {granting === bonus._id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Granting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Grant Bonus
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
