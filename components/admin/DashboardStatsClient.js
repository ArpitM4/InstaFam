'use client';

import { useState, useEffect } from 'react';
import { Users, UserCheck, Clock, Gift } from 'lucide-react';

export default function DashboardStatsClient() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedCreators: 0,
    pendingVerifications: 0,
    pendingBonuses: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [analyticsRes, verificationsRes, bonusesRes] = await Promise.all([
          fetch('/api/admin/analytics'),
          fetch('/api/admin/pending-verifications'),
          fetch('/api/admin/requested-bonuses')
        ]);

        const analytics = await analyticsRes.json();
        const verifications = await verificationsRes.json();
        const bonuses = await bonusesRes.json();

        setStats({
          totalUsers: analytics.totalUsers || 0,
          verifiedCreators: analytics.verifiedCreators || 0,
          pendingVerifications: verifications.users?.length || 0,
          pendingBonuses: bonuses.bonuses?.length || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Verified Creators',
      value: stats.verifiedCreators,
      icon: UserCheck,
      color: 'green'
    },
    {
      title: 'Pending Verifications',
      value: stats.pendingVerifications,
      icon: Clock,
      color: 'orange'
    },
    {
      title: 'Pending Bonuses',
      value: stats.pendingBonuses,
      icon: Gift,
      color: 'purple'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div 
              key={card.title}
              className="bg-[var(--background)] border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4"
            >
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text)] opacity-70">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-[var(--text)] mt-1">
                    {loading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      card.value.toLocaleString()
                    )}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${getColorClasses(card.color)}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="bg-[var(--background)] border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Welcome to Admin Dashboard</h2>
        <p className="text-[var(--text)] opacity-70 leading-relaxed">
          Use the sidebar to navigate to different sections. You can search and manage users, 
          verify Instagram accounts, approve bonus requests, and view detailed analytics about 
          your platform's performance.
        </p>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-medium text-[var(--text)]">Quick Actions</h3>
            <ul className="text-sm text-[var(--text)] opacity-70 space-y-1">
              <li>• Search and edit user profiles</li>
              <li>• Verify creator Instagram accounts</li>
              <li>• Approve monthly bonus requests</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-[var(--text)]">Analytics</h3>
            <ul className="text-sm text-[var(--text)] opacity-70 space-y-1">
              <li>• View platform growth metrics</li>
              <li>• Monitor user engagement</li>
              <li>• Track creator performance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
