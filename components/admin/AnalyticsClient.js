'use client';

import { useState, useEffect } from 'react';
import { Users, UserCheck, Crown, Gift, TrendingUp, Calendar, RefreshCw, Filter } from 'lucide-react';

export default function AnalyticsClient() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/analytics';
      const params = new URLSearchParams();
      
      if (dateRange === 'custom' && customStartDate && customEndDate) {
        params.append('startDate', customStartDate);
        params.append('endDate', customEndDate);
      } else if (dateRange !== 'all') {
        params.append('range', dateRange);
      }
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      const response = await fetch(url);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Fetch analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const applyFilters = () => {
    fetchAnalytics();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-[var(--background)] border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-[var(--text)] mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--background)] border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[var(--primary)] text-[var(--text)]"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 3 Months</option>
              <option value="year">Last 12 Months</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          {dateRange === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 bg-[var(--background)] border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[var(--primary)] text-[var(--text)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 bg-[var(--background)] border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[var(--primary)] text-[var(--text)]"
                />
              </div>
            </>
          )}
          
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:opacity-90 flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Apply Filters
          </button>
          
          <button
            onClick={fetchAnalytics}
            className="p-2 text-[var(--text)] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[var(--background)] border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--text)] opacity-70">Total Users</p>
              <p className="text-2xl font-bold text-[var(--text)]">{analytics?.totalUsers?.toLocaleString() || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--background)] border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--text)] opacity-70">Verified Creators</p>
              <p className="text-2xl font-bold text-[var(--text)]">{analytics?.verifiedCreators?.toLocaleString() || 0}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--background)] border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--text)] opacity-70">Total Creators</p>
              <p className="text-2xl font-bold text-[var(--text)]">{analytics?.totalCreators?.toLocaleString() || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--background)] border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--text)] opacity-70">Total Points Redeemed</p>
              <p className="text-2xl font-bold text-[var(--text)]">{analytics?.totalPointsRedeemed?.toLocaleString() || 0}</p>
            </div>
            <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-full">
              <Gift className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div className="bg-[var(--background)] text-[var(--text)] rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-[var(--textStrong)] mb-4">Redemption Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[var(--textSoft)]">Total Redemptions</span>
              <span className="font-semibold">{analytics?.totalRedemptions?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--textSoft)]">Pending Redemptions</span>
              <span className="font-semibold">{analytics?.pendingRedemptions?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--textSoft)]">Completed Redemptions</span>
              <span className="font-semibold">{analytics?.completedRedemptions?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>

  <div className="bg-[var(--background)] text-[var(--text)] rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-[var(--textStrong)] mb-4">Bonus Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[var(--textSoft)]">Total Bonuses</span>
              <span className="font-semibold">{analytics?.totalBonuses?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--textSoft)]">Requested Bonuses</span>
              <span className="font-semibold">{analytics?.requestedBonuses?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--textSoft)]">Granted Bonuses</span>
              <span className="font-semibold">{analytics?.grantedBonuses?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>

  <div className="bg-[var(--background)] text-[var(--text)] rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-[var(--textStrong)] mb-4">Growth Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[var(--textSoft)]">New Users (Period)</span>
              <span className="font-semibold">{analytics?.newUsers?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--textSoft)]">New Creators (Period)</span>
              <span className="font-semibold">{analytics?.newCreators?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--textSoft)]">Verification Rate</span>
              <span className="font-semibold">
                {analytics?.totalCreators > 0 
                  ? Math.round((analytics.verifiedCreators / analytics.totalCreators) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[var(--background)] text-[var(--text)] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-[var(--textStrong)]">Platform Health</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-[var(--textStrong)] mb-3">User Engagement</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--textSoft)]">Active Users (with points)</span>
                  <span className="font-medium text-[var(--textStrong)]">{analytics?.activeUsers?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--textSoft)]">Users with Followers</span>
                  <span className="font-medium text-[var(--textStrong)]">{analytics?.usersWithFollowers?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--textSoft)]">Average Points per User</span>
                  <span className="font-medium text-[var(--textStrong)]">{analytics?.avgPointsPerUser?.toFixed(1) || 0}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-[var(--textStrong)] mb-3">Creator Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--textSoft)]">Unverified Creators</span>
                  <span className="font-medium text-[var(--textStrong)]">{analytics?.unverifiedCreators?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--textSoft)]">Pending OTP Verification</span>
                  <span className="font-medium text-[var(--textStrong)]">{analytics?.pendingOTPVerification?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--textSoft)]">Avg Redemptions per Creator</span>
                  <span className="font-medium text-[var(--textStrong)]">{analytics?.avgRedemptionsPerCreator?.toFixed(1) || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
