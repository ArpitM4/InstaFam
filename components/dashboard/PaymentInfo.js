"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { fetchuser, updatePaymentInfo, fetchpayments } from "@/actions/useractions";
import { toast } from 'react-toastify';

const PaymentInfo = () => {
  const { data: session } = useSession();
  const [form, setForm] = useState(null);
  const [userId, setUserId] = useState(null);
  const [payments, setPayments] = useState([]);
  const [totalEarning, setTotalEarning] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session]);

  const loadData = async () => {
    try {
      const user = await fetchuser(session.user.name);
      setForm(user);
      setUserId(user?._id);
      
      if (user?._id) {
        const payments = await fetchpayments(user._id);
        setPayments(payments);
        const total = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        setTotalEarning(total);
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
      toast.error('Error loading payment information');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      paymentInfo: {
        ...prev.paymentInfo,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const phone = form.paymentInfo?.phone || "";
    const upi = form.paymentInfo?.upi || "";

    try {
      await updatePaymentInfo(session.user.name, phone, upi);
      toast.success("Payment information updated successfully!");
    } catch (error) {
      toast.error("Failed to update payment information");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="pb-8">
        <h1 className="text-2xl font-semibold text-text mb-3">Payment Information</h1>
        <p className="text-text/60 text-sm">Manage your earnings and payment details</p>
      </div>

      {/* Earnings Section */}
      <section className="space-y-6">
        <h3 className="text-lg font-medium text-text/90">Total Earnings</h3>
        <div className="bg-dropdown-hover rounded-xl p-8">
          <div className="text-center">
            <p className="text-4xl font-light text-text mb-2">${totalEarning}</p>
            <p className="text-text/60 text-sm">Total amount earned from donations</p>
          </div>
        </div>
      </section>

      {/* Payment History Section */}
      <section className="space-y-6">
        <h3 className="text-lg font-medium text-text/90">Payment History</h3>
        <div className="bg-dropdown-hover rounded-xl p-6">
          <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-3">
            {payments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-text/60 text-sm">No payments yet</p>
              </div>
            ) : (
              payments
                .filter((p) => p.to_user === userId)
                .map((p, index) => (
                  <div
                    key={p.oid}
                    className="flex justify-between items-start p-4 bg-background/30 rounded-lg hover:bg-background/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-text/90 text-sm">{p.name}</p>
                      <p className="text-xs text-text/60 mt-1">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </p>
                      {p.message && (
                        <p className="text-xs text-text/60 mt-2 italic bg-background/50 rounded px-2 py-1">
                          "{p.message}"
                        </p>
                      )}
                    </div>
                    <span className="text-lg font-medium text-success ml-4">${p.amount}</span>
                  </div>
                ))
            )}
          </div>
        </div>
      </section>

      {/* Payment Info Update Section */}
      <section className="space-y-6">
        <h3 className="text-lg font-medium text-text/90">Update Payment Details</h3>
        <div className="bg-dropdown-hover rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
            <div className="space-y-2">
              <label className="text-xs text-text/60 uppercase tracking-wide">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={form?.paymentInfo?.phone || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-background/50 text-background border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Enter your phone number"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-text/60 uppercase tracking-wide">UPI ID</label>
              <input
                type="text"
                name="upi"
                value={form?.paymentInfo?.upi || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-background/50 text-background border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="you@bank"
              />
            </div>
            <button
              type="submit"
              disabled={!form?.instagram?.isVerified}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                form?.instagram?.isVerified
                  ? "bg-primary hover:bg-primary/90 text-white"
                  : "bg-text/20 cursor-not-allowed text-text/50"
              }`}
            >
              Save Payment Details
            </button>

            {!form?.instagram?.isVerified && (
              <p className="text-sm text-text/60 bg-background/30 rounded-lg p-3">
                Verify your Instagram account first to update payment information
              </p>
            )}
          </form>
        </div>
      </section>
    </div>
  );
};

export default PaymentInfo;
