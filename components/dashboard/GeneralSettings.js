"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import { fetchMyVaultItems, fetchVaultHistory } from "@/actions/vaultActions";

const GeneralSettings = ({ user, onUserUpdate }) => {
  const { data: session } = useSession();

  const [totalRedemptions, setTotalRedemptions] = useState(0);

  useEffect(() => {
    calculateTotalRedemptions();
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

  return (
    <div className="space-y-12">
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
    </div>
  );
};

export default GeneralSettings;
