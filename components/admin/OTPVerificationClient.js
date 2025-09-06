'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Clock, RefreshCw } from 'lucide-react';

export default function OTPVerificationClient() {
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(null);

  const fetchPendingVerifications = async () => {
    try {
      const response = await fetch('/api/admin/pending-verifications');
      const data = await response.json();
      setPendingVerifications(data.users || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyUser = async (userId) => {
    setVerifying(userId);
    try {
      const response = await fetch(`/api/admin/verify-user/${userId}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Remove verified user from list
        setPendingVerifications(prev => prev.filter(user => user._id !== userId));
      }
    } catch (error) {
      console.error('Verify error:', error);
    } finally {
      setVerifying(null);
    }
  };

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[var(--background)] border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text)]">Pending Instagram Verifications</h2>
            <p className="text-sm text-[var(--text)] opacity-70 mt-1">
              Users who have generated OTP and are waiting for verification
            </p>
          </div>
          <button
            onClick={fetchPendingVerifications}
            className="p-2 text-[var(--text)] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Pending Verifications List */}
      {pendingVerifications.length === 0 ? (
        <div className="bg-[var(--background)] border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-12 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--text)] mb-2">All caught up!</h3>
          <p className="text-[var(--text)] opacity-70">No pending Instagram verifications at the moment.</p>
        </div>
      ) : (
        <div className="bg-[var(--background)] border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-[var(--text)]">
              {pendingVerifications.length} Pending Verification{pendingVerifications.length !== 1 ? 's' : ''}
            </h3>
          </div>
          
          <div className="divide-y">
            {pendingVerifications.map((user) => (
              <div key={user._id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      {/* User Info */}
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-[var(--text)]">
                          {user.name || 'Unknown User'}
                        </h4>
                        <p className="text-sm text-[var(--text)] opacity-70">
                          <a
                            href={`https://www.instagram.com/${user.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-[var(--primary)]"
                          >
                            @{user.username || 'No username'}
                          </a>
                        </p>
                        <p className="text-sm text-[var(--text)] opacity-60">{user.email}</p>
                      </div>
                      
                      {/* OTP Info */}
                      <div className="text-center">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 min-w-[120px]">
                          <p className="text-xs text-[var(--text)] opacity-60 mb-1">Instagram OTP</p>
                          <p className="text-lg font-mono font-bold text-[var(--text)]">
                            {user.instagram?.otp || 'No OTP'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Time Info */}
                      <div className="text-center">
                        <div className="flex items-center gap-2 text-sm text-[var(--text)] opacity-70">
                          <Clock className="h-4 w-4" />
                          <div>
                            <p>Generated</p>
                            <p className="font-medium">
                              {user.instagram?.otpGeneratedAt 
                                ? new Date(user.instagram.otpGeneratedAt).toLocaleString()
                                : 'Unknown'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional Info */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-[var(--text)]">Account Type:</span>
                        <p className="text-[var(--text)] opacity-70">{user.accountType}</p>
                      </div>
                      <div>
                        <span className="font-medium text-[var(--text)]">Followers:</span>
                        <p className="text-[var(--text)] opacity-70">{user.followersArray?.length || 0}</p>
                      </div>
                      <div>
                        <span className="font-medium text-[var(--text)]">Points:</span>
                        <p className="text-[var(--text)] opacity-70">{user.points || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <div className="ml-6">
                    <button
                      onClick={() => verifyUser(user._id)}
                      disabled={verifying === user._id}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {verifying === user._id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Verify
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
