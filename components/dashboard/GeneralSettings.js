"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { generateInstagramOTP } from "@/actions/useractions";
import { toast } from 'react-toastify';

const GeneralSettings = ({ user, onUserUpdate }) => {
  const { data: session } = useSession();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="space-y-8">
      <div className="border-b border-text/20 pb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">General Settings</h1>
        <p className="text-text/70">Manage your account verification and basic settings</p>
      </div>

      {/* Account Stats Section */}
      <section className="bg-text/5 border border-text/10 rounded-lg p-6 space-y-4">
        <h3 className="text-2xl font-semibold">Account Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-text/10 border border-text/20 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {user?.followersArray?.length || user?.followers || 0}
            </p>
            <p className="text-sm text-text/70">Total Followers</p>
          </div>
          <div className="bg-text/10 border border-text/20 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {user?.points || 0}
            </p>
            <p className="text-sm text-text/70">Total Points</p>
          </div>
        </div>
      </section>

      <section className="bg-text/5 border border-text/10 rounded-lg p-6 space-y-4">
        <h3 className="text-2xl font-semibold">Instagram Verification</h3>
        <p className="text-text/80">
          Status:{" "}
          <span className={user?.instagram?.isVerified ? "text-success" : "text-error"}>
            {user?.instagram?.isVerified ? "✅ Verified" : "❌ Not Verified"}
          </span>
        </p>

        <div className="space-y-1">
          <label className="text-sm text-text/70">Your Username:</label>
          <input
            type="text"
            readOnly
            value={session?.user?.name}
            className="px-4 py-2 rounded bg-text text-background cursor-not-allowed w-full max-w-xs"
          />
        </div>

        {!user?.instagram?.isVerified && (
          <div className="space-y-4">
            <button
              className="px-5 py-2 bg-primary rounded hover:bg-primary/80 text-sm font-medium"
              onClick={handleGenerateOTP}
              disabled={loading}
            >
              {otp ? "Regenerate OTP" : "Verify Now"}
            </button>

            {otp && (
              <div className="bg-text/10 border border-text/20 p-4 rounded space-y-3">
                <p className="text-sm text-text/80">
                  DM the following OTP to our official Instagram handle to verify:
                </p>

                <div className="flex items-center space-x-3">
                  <span className="text-xl font-bold text-success tracking-widest">{otp}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(otp)}
                    className="px-3 py-1 bg-primary text-text text-sm rounded hover:bg-primary/80"
                  >
                    Copy
                  </button>
                </div>

                <a
                  href="https://www.instagram.com/_instafam_official/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm text-primary underline hover:text-primary/80"
                >
                  → Go to @_instafam_official on Instagram
                </a>
                <p className="text-secondary">Your account will be verified within 24 hours after your DM.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default GeneralSettings;
