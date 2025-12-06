"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import { fetchMyVaultItems, fetchVaultHistory } from "@/actions/vaultActions";
import { toast } from 'react-toastify';
import DiscountCodeModal from '@/components/DiscountCodeModal';
import { Gift, Tag } from 'lucide-react';

const GeneralSettings = ({ user, onUserUpdate }) => {
  const { data: session } = useSession();

  const [totalRedemptions, setTotalRedemptions] = useState(0);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(null);

  useEffect(() => {

    // Load applied discount code
    if (user?.creatorOnboarding?.discountCode) {
      setAppliedDiscount(user.creatorOnboarding.discountCode);
    }
  }, [user]);

  const calculateTotalRedemptions = async () => {
    try {
      // Fetch both active and expired vault items
      const [activeResult, historyResult] = await Promise.all([
        fetchMyVaultItems(),
        fetchVaultHistory()
      ]);

      let total = 0;

      // Sum unlock counts from active items
      if (activeResult.success && activeResult.items) {
        total += activeResult.items.reduce((sum, item) => sum + (item.unlockCount || 0), 0);
      }

      // Sum unlock counts from expired items
      if (historyResult.success && historyResult.items) {
        total += historyResult.items.reduce((sum, item) => sum + (item.unlockCount || 0), 0);
      }

      setTotalRedemptions(total);
    } catch (error) {
      console.error('Error calculating total redemptions:', error);
      setTotalRedemptions(0);
    }
  };



  const handleDiscountSuccess = (data) => {
    setAppliedDiscount(data.code);
    toast.success(`Discount code ${data.code} applied successfully!`);
    // Refresh user data
    if (onUserUpdate) {
      onUserUpdate();
    }
  };

  return (
    <>
      <div className="space-y-12">{/* ... existing content ... */}
        <div className="pb-8">
          <h1 className="text-2xl font-semibold text-primary mb-3">General Settings</h1>
          <p className="text-text/60 text-sm">Manage your account verification and basic settings</p>
        </div>

        {/* Account Stats Section */}
        <section className="space-y-6">
          <h3 className="text-lg font-medium text-text/90">Account Statistics</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-dropdown-hover rounded-xl p-6 text-center">
              <p className="text-3xl font-light text-text mb-1">
                {user?.followersArray?.length || user?.followers || 0}
              </p>
              <p className="text-sm text-text/60">Total Followers</p>
            </div>
            <div className="bg-dropdown-hover rounded-xl p-6 text-center">
              <p className="text-3xl font-light text-text mb-1">
                {totalRedemptions}
              </p>
              <p className="text-sm text-text/60">Total Vault Redemptions</p>
            </div>
          </div>
        </section>



        {/* Discount Codes Section */}
        <section className="bg-background/20 rounded-xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Gift className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Discount Codes</h2>
          </div>

          <div className="space-y-4">
            {appliedDiscount ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Tag className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Applied Code</p>
                    <p className="text-green-600 font-mono text-lg">{appliedDiscount}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-text/70 text-sm">
                  Have a discount code? Apply it here to unlock exclusive rewards.
                </p>
                <button
                  onClick={() => setShowDiscountModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                >
                  <Gift className="w-5 h-5" />
                  <span>Apply Discount Code</span>
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Discount Code Modal */}
      <DiscountCodeModal
        isOpen={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
        onSuccess={handleDiscountSuccess}
      />
    </>
  );
};

export default GeneralSettings;
