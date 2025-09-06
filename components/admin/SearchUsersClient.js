'use client';

import { useState } from 'react';
import { Search, Edit2, Save, X } from 'lucide-react';

export default function SearchUsersClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editData, setEditData] = useState({});

  const searchUsers = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/search-users?q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (user) => {
    setEditingUser(user._id);
    setEditData({
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      accountType: user.accountType || 'User',
      points: user.points || 0,
      vaultEarningsBalance: user.vaultEarningsBalance || 0,
      instagramVerified: user.instagram?.isVerified || false,
      paymentPhone: user.paymentInfo?.phone || '',
      paymentUpi: user.paymentInfo?.upi || '',
    });
  };

  const saveUser = async (userId) => {
    try {
      const response = await fetch(`/api/admin/update-user/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      
      if (response.ok) {
        // Refresh the user data
        searchUsers();
        setEditingUser(null);
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditData({});
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-[var(--background)] border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by username, email, or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
              className="w-full px-4 py-2 bg-[var(--background)] border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-[var(--text)]"
            />
          </div>
          <button
            onClick={searchUsers}
            disabled={loading}
            className="px-6 py-2 bg-[var(--primary)] text-white rounded-md hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Results */}
      {users.length > 0 && (
        <div className="bg-[var(--background)] border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-[var(--text)]">
              Search Results ({users.length} found)
            </h2>
          </div>
          
          <div className="divide-y">
            {users.map((user) => (
              <div key={user._id} className="p-6">
                {editingUser === user._id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-[var(--text)]">Editing User</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveUser(user._id)}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-md"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-2 text-[var(--text)] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--text)] mb-1">Name</label>
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData({...editData, name: e.target.value})}
                          className="w-full px-3 py-2 bg-[var(--background)] border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[var(--primary)] text-[var(--text)]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-[var(--text)] mb-1">Username</label>
                        <input
                          type="text"
                          value={editData.username}
                          onChange={(e) => setEditData({...editData, username: e.target.value})}
                          className="w-full px-3 py-2 bg-[var(--background)] border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[var(--primary)] text-[var(--text)]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-[var(--text)] mb-1">Email</label>
                        <input
                          type="email"
                          value={editData.email}
                          onChange={(e) => setEditData({...editData, email: e.target.value})}
                          className="w-full px-3 py-2 bg-[var(--background)] border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[var(--primary)] text-[var(--text)]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-[var(--text)] mb-1">Account Type</label>
                        <select
                          value={editData.accountType}
                          onChange={(e) => setEditData({...editData, accountType: e.target.value})}
                          className="w-full px-3 py-2 bg-[var(--background)] border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[var(--primary)] text-[var(--text)]"
                        >
                          <option value="User">User</option>
                          <option value="Creator">Creator</option>
                          <option value="VCreator">VCreator</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-[var(--text)] mb-1">Points</label>
                        <input
                          type="number"
                          value={editData.points}
                          onChange={(e) => setEditData({...editData, points: parseInt(e.target.value) || 0})}
                          className="w-full px-3 py-2 bg-[var(--background)] border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[var(--primary)] text-[var(--text)]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-[var(--text)] mb-1">Vault Balance</label>
                        <input
                          type="number"
                          value={editData.vaultEarningsBalance}
                          onChange={(e) => setEditData({...editData, vaultEarningsBalance: parseInt(e.target.value) || 0})}
                          className="w-full px-3 py-2 bg-[var(--background)] border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[var(--primary)] text-[var(--text)]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-[var(--text)] mb-1">Instagram Verified</label>
                        <select
                          value={editData.instagramVerified}
                          onChange={(e) => setEditData({...editData, instagramVerified: e.target.value === 'true'})}
                          className="w-full px-3 py-2 bg-[var(--background)] border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[var(--primary)] text-[var(--text)]"
                        >
                          <option value="false">No</option>
                          <option value="true">Yes</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-[var(--text)] mb-1">Phone</label>
                        <input
                          type="text"
                          value={editData.paymentPhone}
                          onChange={(e) => setEditData({...editData, paymentPhone: e.target.value})}
                          className="w-full px-3 py-2 bg-[var(--background)] border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[var(--primary)] text-[var(--text)]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-[var(--text)] mb-1">UPI</label>
                        <input
                          type="text"
                          value={editData.paymentUpi}
                          onChange={(e) => setEditData({...editData, paymentUpi: e.target.value})}
                          className="w-full px-3 py-2 bg-[var(--background)] border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[var(--primary)] text-[var(--text)]"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-[var(--text)]">{user.name || 'No Name'}</h3>
                        <p className="text-sm text-[var(--text)] opacity-70">@{user.username || 'No Username'}</p>
                      </div>
                      <button
                        onClick={() => startEditing(user)}
                        className="p-2 text-[var(--text)] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-[var(--text)]">Email:</span>
                        <p className="text-[var(--text)] opacity-70">{user.email}</p>
                      </div>
                      <div>
                        <span className="font-medium text-[var(--text)]">Account Type:</span>
                        <p className="text-[var(--text)] opacity-70">{user.accountType}</p>
                      </div>
                      <div>
                        <span className="font-medium text-[var(--text)]">Points:</span>
                        <p className="text-[var(--text)] opacity-70">{user.points || 0}</p>
                      </div>
                      <div>
                        <span className="font-medium text-[var(--text)]">Vault Balance:</span>
                        <p className="text-[var(--text)] opacity-70">{user.vaultEarningsBalance || 0}</p>
                      </div>
                      <div>
                        <span className="font-medium text-[var(--text)]">Instagram Verified:</span>
                        <p className="text-[var(--text)] opacity-70">{user.instagram?.isVerified ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-[var(--text)]">Followers:</span>
                        <p className="text-[var(--text)] opacity-70">{user.followersArray?.length || 0}</p>
                      </div>
                      <div>
                        <span className="font-medium text-[var(--text)]">Phone:</span>
                        <p className="text-[var(--text)] opacity-70">{user.paymentInfo?.phone || 'Not set'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-[var(--text)]">UPI:</span>
                        <p className="text-[var(--text)] opacity-70">{user.paymentInfo?.upi || 'Not set'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-[var(--text)]">Created:</span>
                        <p className="text-[var(--text)] opacity-70">{new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
