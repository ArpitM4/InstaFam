"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { generateInstagramOTP } from "@/actions/useractions";
import { fetchMyVaultItems, fetchVaultHistory } from "@/actions/vaultActions";
import { toast } from 'react-toastify';

const GeneralSettings = ({ user, onUserUpdate }) => {
  const { data: session } = useSession();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalRedemptions, setTotalRedemptions] = useState(0);

  useEffect(() => {
    if (user?.instagram?.isVerified) {
      calculateTotalRedemptions();
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

  const handleGenerateOTP = async () => {
    setLoading(true);
    try {
      const generated = await generateInstagramOTP(session.user.name);
      setOtp(generated);
      toast("OTP generated! DM it to @instafam_official.");
    } catch (error) {
      toast.error("Failed to generate OTP");
    } finally {
      setLoading(false);
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

      <section className="space-y-6">
        <h3 className="text-lg font-medium text-text/90">Instagram Verification</h3>
        <div className="bg-dropdown-hover rounded-xl p-6 space-y-6">
          <div className="flex items-center space-x-3">
            <span className="text-sm text-text/70">Status:</span>
            <span className={`text-sm font-medium ${user?.instagram?.isVerified ? "text-success" : "text-error"}`}>
              {user?.instagram?.isVerified ? "Verified" : "Not Verified"}
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-text/60 uppercase tracking-wide">Your Username : </label>
            <input
              type="text"
              readOnly
              value={session?.user?.name}
              className="px-4 py-3 rounded-lg bg-background/50 text-black/80 cursor-not-allowed w-full max-w-xs text-sm border-0 focus:outline-none"
            />
          </div>

          {!user?.instagram?.isVerified && (
            <div className="space-y-5">
              <button
                className="px-6 py-3 bg-primary rounded-lg hover:bg-primary/90 text-sm font-medium text-white transition-colors"
                onClick={handleGenerateOTP}
                disabled={loading}
              >
                {otp ? "Regenerate OTP" : "Verify Now"}
              </button>

              {otp && (
                <div className="bg-background/30 rounded-lg p-6 space-y-4">
                  <p className="text-sm text-text/70">
                    DM the following OTP to our official Instagram handle to verify:
                  </p>

                  <div className="flex items-center space-x-4">
                    <span className="text-xl font-mono font-semibold text-text tracking-widest bg-background/50 px-4 py-2 rounded-lg">{otp}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(otp)}
                      className="px-4 py-2 bg-text/10 text-text text-sm rounded-lg hover:bg-text/20 transition-colors"
                    >
                      Copy
                    </button>
                  </div>

                  <a
                    href="https://www.instagram.com/_instafam_official/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Go to @_instafam_official on Instagram
                  </a>
                  <p className="text-text/60 text-xs">Your account will be verified within 24 hours after your DM.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default GeneralSettings;
