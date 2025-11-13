"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaSpinner, FaHeart, FaCalendar, FaDollarSign } from "react-icons/fa";

/**
 * UnrankedDonations Component
 * Displays all-time list of unranked (non-event) donations received by the creator
 * These are contributions made when NO event was active
 */
const UnrankedDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    totalAmount: 0
  });

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/unranked-donations');
      
      if (!res.ok) {
        throw new Error('Failed to fetch donations');
      }
      
      const data = await res.json();
      
      if (data.success) {
        setDonations(data.donations);
        setStats({
          total: data.total,
          totalAmount: data.totalAmount
        });
      } else {
        toast.error(data.error || 'Failed to load donations');
      }
    } catch (error) {
      console.error('Error fetching unranked donations:', error);
      toast.error('Could not load donations');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FaSpinner className="animate-spin text-primary text-4xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text mb-2">Unranked Donations</h1>
        <p className="text-text/60">
          All-time contributions received outside of events
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-dropdown-hover rounded-xl p-6 border border-text/10">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FaHeart className="text-primary text-xl" />
            </div>
            <div>
              <p className="text-text/60 text-sm">Total Donations</p>
              <p className="text-2xl font-bold text-text">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-dropdown-hover rounded-xl p-6 border border-text/10">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <FaDollarSign className="text-green-400 text-xl" />
            </div>
            <div>
              <p className="text-text/60 text-sm">Total Amount</p>
              <p className="text-2xl font-bold text-text">${stats.totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Donations List */}
      <div className="bg-dropdown-hover rounded-xl border border-text/10 overflow-hidden">
        <div className="p-6 border-b border-text/10">
          <h2 className="text-xl font-semibold text-text">Contribution History</h2>
        </div>

        {donations.length === 0 ? (
          <div className="p-12 text-center">
            <FaHeart className="text-6xl text-text/20 mx-auto mb-4" />
            <p className="text-text/60 text-lg mb-2">No unranked donations yet</p>
            <p className="text-text/40 text-sm">
              Contributions made when no event is active will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-text/10">
            {donations.map((donation) => (
              <div 
                key={donation._id} 
                className="p-6 hover:bg-background/30 transition-colors duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                  {/* Donor Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <FaHeart className="text-pink-400 text-sm" />
                      <h3 className="text-lg font-medium text-text">
                        {donation.donorName}
                      </h3>
                    </div>
                    
                    {donation.message && (
                      <p className="text-text/70 text-sm italic ml-6">
                        "{donation.message}"
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-2 mt-2 ml-6">
                      <FaCalendar className="text-text/40 text-xs" />
                      <p className="text-text/50 text-xs">
                        {formatDate(donation.date)}
                      </p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center justify-end">
                    <div className="bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20">
                      <p className="text-green-400 font-bold text-xl">
                        ${donation.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <p className="text-blue-300 text-sm">
          💡 <strong>Note:</strong> These are contributions made when no event was active. 
          They don't appear on leaderboards but show genuine support from your fans!
        </p>
      </div>
    </div>
  );
};

export default UnrankedDonations;
