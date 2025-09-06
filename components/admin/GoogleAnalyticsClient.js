'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Eye, 
  Globe, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Calendar,
  Activity
} from 'lucide-react';

export default function GoogleAnalyticsClient() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('7days');

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/google-analytics?dateRange=${dateRange}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const data = await response.json();
      setAnalyticsData(data);
      setLoading(false);

    } catch (err) {
      setError('Failed to fetch analytics data');
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, positive = true }) => (
    <div className="bg-[var(--background)] border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--text)] opacity-70 font-medium">{title}</p>
          <p className="text-2xl font-bold text-[var(--text)] mt-1">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 ${positive ? 'text-green-600' : 'text-red-600'}`}>
              {positive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              <span className="text-sm font-medium">{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-[var(--primary)]/10 rounded-lg">
          <Icon className="h-6 w-6 text-[var(--primary)]" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[var(--background)] border border-gray-200 dark:border-gray-700 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button 
          onClick={fetchAnalyticsData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mock Data Notice */}
      {analyticsData?.mockData && (
        <div className="px-4 py-2 mb-4 text-sm bg-amber-50 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-md">
          <span className="font-medium">Note:</span> Displaying mock analytics data. To connect real Google Analytics, see GOOGLE_ANALYTICS_SETUP.md.
        </div>
      )}

      {/* Fallback Error Notice */}
      {analyticsData?.error && (
        <div className="px-4 py-2 mb-4 text-sm bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md">
          <span className="font-medium">Info:</span> {analyticsData.error}
        </div>
      )}

      {/* Real Data Success Notice */}
      {analyticsData && !analyticsData.mockData && !analyticsData.error && (
        <div className="px-4 py-2 mb-4 text-sm bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md">
          <span className="font-medium">Success:</span> Displaying live Google Analytics data.
        </div>
      )}

      {/* Date Range Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[var(--text)] opacity-70" />
          <span className="text-[var(--text)] font-medium">Date Range:</span>
        </div>
        <select 
          value={dateRange} 
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-2 bg-[var(--background)] border border-gray-200 dark:border-gray-700 rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          <option value="1day">Last 24 hours</option>
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="90days">Last 90 days</option>
        </select>
      </div>

      {/* Real-time Stats */}
      <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text)] mb-2">Real-time Activity</h3>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-2xl font-bold text-[var(--text)]">{analyticsData?.realTime?.activeUsers}</span>
              <span className="text-[var(--text)] opacity-70">users online</span>
            </div>
          </div>
          <Activity className="h-8 w-8 text-[var(--primary)]" />
        </div>
        <p className="text-sm text-[var(--text)] opacity-70 mt-2">
          Top active page: {analyticsData?.realTime?.topActivePage}
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Users" 
          value={analyticsData?.overview?.users?.toLocaleString()} 
          change={analyticsData?.overview?.usersTrend}
          icon={Users}
          positive={analyticsData?.overview?.usersTrend > 0}
        />
        <StatCard 
          title="Sessions" 
          value={analyticsData?.overview?.sessions?.toLocaleString()} 
          change={analyticsData?.overview?.sessionsTrend}
          icon={Eye}
          positive={analyticsData?.overview?.sessionsTrend > 0}
        />
        <StatCard 
          title="Page Views" 
          value={analyticsData?.overview?.pageviews?.toLocaleString()} 
          change={analyticsData?.overview?.pageviewsTrend}
          icon={Globe}
          positive={analyticsData?.overview?.pageviewsTrend > 0}
        />
        <StatCard 
          title="Avg. Session Duration" 
          value={analyticsData?.overview?.avgSessionDuration} 
          change={analyticsData?.overview?.durationTrend}
          icon={Clock}
          positive={analyticsData?.overview?.durationTrend > 0}
        />
        <StatCard 
          title="Bounce Rate" 
          value={analyticsData?.overview?.bounceRate} 
          change={analyticsData?.overview?.bounceTrend}
          icon={TrendingDown}
          positive={analyticsData?.overview?.bounceTrend < 0}
        />
        <StatCard 
          title="New Users" 
          value={analyticsData?.overview?.newUsers?.toLocaleString()} 
          change={analyticsData?.overview?.newUsersTrend}
          icon={Users}
          positive={analyticsData?.overview?.newUsersTrend > 0}
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-[var(--background)] border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Top Pages</h3>
          <div className="space-y-3">
            {analyticsData?.topPages?.map((page, index) => (
              <div key={page.page} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[var(--text)] opacity-70">#{index + 1}</span>
                  <span className="text-[var(--text)] font-medium">{page.page}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[var(--text)] opacity-70">{page.views.toLocaleString()} views</span>
                  <span className="text-sm font-medium text-[var(--primary)]">{page.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-[var(--background)] border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Device Types</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Monitor className="h-5 w-5 text-[var(--primary)]" />
                <span className="text-[var(--text)]">Desktop</span>
              </div>
              <span className="font-medium text-[var(--text)]">{analyticsData?.devices?.desktop}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-[var(--primary)]" />
                <span className="text-[var(--text)]">Mobile</span>
              </div>
              <span className="font-medium text-[var(--text)]">{analyticsData?.devices?.mobile}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Tablet className="h-5 w-5 text-[var(--primary)]" />
                <span className="text-[var(--text)]">Tablet</span>
              </div>
              <span className="font-medium text-[var(--text)]">{analyticsData?.devices?.tablet}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Countries */}
      <div className="bg-[var(--background)] border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Top Countries</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {analyticsData?.topCountries?.map((country, index) => (
            <div key={country.country} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-[var(--primary)]" />
                <span className="text-[var(--text)] font-medium">{country.country}</span>
              </div>
              <p className="text-2xl font-bold text-[var(--text)]">{country.users.toLocaleString()}</p>
              <p className="text-sm text-[var(--text)] opacity-70">{country.percentage}% of users</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
