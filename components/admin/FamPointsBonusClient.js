'use client';

import { useState, useEffect } from 'react';

export default function FamPointsBonusClient() {
  const [loading, setLoading] = useState(false);
  const [recentBonuses, setRecentBonuses] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [formData, setFormData] = useState({
    identifier: '',
    points: '',
    description: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBonusData();
  }, []);

  const fetchBonusData = async () => {
    try {
      const response = await fetch('/api/admin/bonus');
      const data = await response.json();
      
      if (data.success) {
        setRecentBonuses(data.recentBonuses);
        setStatistics(data.statistics);
      } else {
        setError(data.error || 'Failed to fetch bonus data');
      }
    } catch (error) {
      console.error('Error fetching bonus data:', error);
      setError('Failed to fetch bonus data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/admin/bonus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setFormData({ identifier: '', points: '', description: '' });
        fetchBonusData(); // Refresh the data
      } else {
        setError(data.error || 'Failed to award bonus points');
      }
    } catch (error) {
      console.error('Error awarding bonus:', error);
      setError('Failed to award bonus points');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Total Bonus Points Awarded
          </h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {statistics.totalBonusPoints?.toLocaleString() || 0}
          </p>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
            Active Bonus Points
          </h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {statistics.activeBonusPoints?.toLocaleString() || 0}
          </p>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2">
            Total Transactions
          </h3>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {statistics.totalBonusTransactions?.toLocaleString() || 0}
          </p>
        </div>
      </div>

      {/* Award Bonus Form */}
      <div className="bg-[var(--background-secondary)] p-6 rounded-lg border border-[var(--border)]">
        <h3 className="text-xl font-semibold text-[var(--text)] mb-4">
          Award Bonus FamPoints
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-[var(--text)] mb-2">
              Username or User ID
            </label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleInputChange}
              placeholder="Enter username or user ID"
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--text)] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="points" className="block text-sm font-medium text-[var(--text)] mb-2">
              Points Amount
            </label>
            <input
              type="number"
              id="points"
              name="points"
              value={formData.points}
              onChange={handleInputChange}
              placeholder="Enter points amount"
              min="1"
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--text)] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[var(--text)] mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter reason for bonus (optional)"
              rows="3"
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--text)] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Awarding...' : 'Award Bonus Points'}
          </button>
        </form>

        {/* Success/Error Messages */}
        {message && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <p className="text-green-800 dark:text-green-200">{message}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}
      </div>

      {/* Recent Bonus Transactions */}
      <div className="bg-[var(--background-secondary)] p-6 rounded-lg border border-[var(--border)]">
        <h3 className="text-xl font-semibold text-[var(--text)] mb-4">
          Recent FamPoints Bonus Transactions
        </h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full border border-[var(--border)] rounded-lg">
            <thead className="bg-[var(--background-tertiary)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text)] uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text)] uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text)] uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text)] uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text)] uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {recentBonuses.length > 0 ? (
                recentBonuses.map((bonus) => (
                  <tr key={bonus.id} className="hover:bg-[var(--background-tertiary)]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-[var(--text)]">
                          {bonus.user.username}
                        </div>
                        <div className="text-sm text-[var(--text-secondary)]">
                          {bonus.user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        +{bonus.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[var(--text)]">
                        {bonus.description || 'Admin bonus points awarded'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                      {new Date(bonus.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {bonus.expired ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200">
                          Expired
                        </span>
                      ) : bonus.used ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          Used
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200">
                          Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-[var(--text-secondary)]">
                    No bonus transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
