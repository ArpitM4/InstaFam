'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  Users,
  Coins,
  Gift,
  RefreshCw
} from 'lucide-react';

export default function FamPointsClient() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'month', 'year'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchFamPointsData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('filter', dateFilter);
      if (dateFilter === 'month') {
        params.append('month', selectedMonth);
        params.append('year', selectedYear);
      } else if (dateFilter === 'year') {
        params.append('year', selectedYear);
      }

      const response = await fetch(`/api/admin/fampoints?${params}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching FamPoints data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamPointsData();
  }, [dateFilter, selectedMonth, selectedYear]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num || 0);
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <div className="bg-[var(--background)] border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--text)]/60">{title}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className={`text-2xl font-bold ${color}`}>{formatNumber(value)}</p>
            {trend && (
              <div className={`flex items-center gap-1 text-xs ${
                trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'
              }`}>
                {trend > 0 ? <TrendingUp className="h-3 w-3" /> : 
                 trend < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                {Math.abs(trend)}%
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-[var(--text)]/50 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')} dark:${color.replace('text-', 'bg-').replace('-600', '-900')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[var(--background)] border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-[var(--background)] border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[var(--text)]/60" />
            <span className="text-sm font-medium text-[var(--text)]">Filter by:</span>
          </div>
          
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All Time' },
              { value: 'year', label: 'Year' },
              { value: 'month', label: 'Month' }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setDateFilter(filter.value)}
                className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                  dateFilter === filter.value
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                    : 'bg-[var(--background)] text-[var(--text)] border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {dateFilter === 'year' && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-[var(--background)] text-[var(--text)]"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}

          {dateFilter === 'month' && (
            <div className="flex gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-[var(--background)] text-[var(--text)]"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-[var(--background)] text-[var(--text)]"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={fetchFamPointsData}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-[var(--primary)] text-white rounded-md hover:opacity-90"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Points Generated"
          value={data?.stats?.totalGenerated}
          icon={Coins}
          color="text-blue-600"
          subtitle="All earned points"
        />
        <StatCard
          title="Total Points Redeemed"
          value={data?.stats?.totalRedeemed}
          icon={Gift}
          color="text-green-600"
          subtitle="Points used for rewards"
        />
        <StatCard
          title="Total Points Expired"
          value={data?.stats?.totalExpired}
          icon={AlertTriangle}
          color="text-red-600"
          subtitle="Unused expired points"
        />
        <StatCard
          title="Active Points"
          value={data?.stats?.totalActive}
          icon={TrendingUp}
          color="text-purple-600"
          subtitle="Available for use"
        />
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Users with Points"
          value={data?.stats?.usersWithPoints}
          icon={Users}
          color="text-indigo-600"
          subtitle="Users having points"
        />
        <StatCard
          title="Points Expiring Soon"
          value={data?.stats?.expiringSoon}
          icon={Clock}
          color="text-orange-600"
          subtitle="Next 30 days"
        />
        <StatCard
          title="Average Points per User"
          value={data?.stats?.avgPointsPerUser}
          icon={TrendingUp}
          color="text-teal-600"
          subtitle="Among active users"
        />
        <StatCard
          title="Redemption Rate"
          value={`${data?.stats?.redemptionRate || 0}%`}
          icon={DollarSign}
          color="text-cyan-600"
          subtitle="Points redeemed vs generated"
        />
      </div>

      {/* Recent Transactions */}
      {data?.recentTransactions && data.recentTransactions.length > 0 && (
        <div className="bg-[var(--background)] border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-[var(--text)]">Recent Transactions</h3>
            <p className="text-sm text-[var(--text)]/60 mt-1">Latest point transactions across the platform</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {data.recentTransactions.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'Earned' ? 'bg-green-100 dark:bg-green-900' :
                      transaction.type === 'Spent' ? 'bg-red-100 dark:bg-red-900' :
                      transaction.type === 'Expired' ? 'bg-gray-100 dark:bg-gray-900' :
                      'bg-blue-100 dark:bg-blue-900'
                    }`}>
                      {transaction.type === 'Earned' ? <TrendingUp className="h-4 w-4 text-green-600" /> :
                       transaction.type === 'Spent' ? <TrendingDown className="h-4 w-4 text-red-600" /> :
                       transaction.type === 'Expired' ? <AlertTriangle className="h-4 w-4 text-gray-600" /> :
                       <Coins className="h-4 w-4 text-blue-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text)]">
                        {transaction.userEmail || 'Unknown User'}
                      </p>
                      <p className="text-xs text-[var(--text)]/60">
                        {transaction.description || `${transaction.type} Transaction`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      transaction.type === 'Earned' ? 'text-green-600' :
                      transaction.type === 'Spent' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {transaction.type === 'Earned' ? '+' : transaction.type === 'Spent' ? '-' : ''}
                      {formatNumber(Math.abs(transaction.amount))}
                    </p>
                    <p className="text-xs text-[var(--text)]/60">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Expiry Analytics */}
      {data?.expiryAnalytics && (
        <div className="bg-[var(--background)] border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-[var(--text)]">Expiry Analytics</h3>
            <p className="text-sm text-[var(--text)]/60 mt-1">Points expiry breakdown and trends</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{formatNumber(data.expiryAnalytics.expiring7Days)}</p>
                <p className="text-sm text-[var(--text)]/60">Expiring in 7 days</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{formatNumber(data.expiryAnalytics.expiring30Days)}</p>
                <p className="text-sm text-[var(--text)]/60">Expiring in 30 days</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">{formatNumber(data.expiryAnalytics.expiredThisMonth)}</p>
                <p className="text-sm text-[var(--text)]/60">Expired this month</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
