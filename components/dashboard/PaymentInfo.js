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
    <div className="space-y-8">
      <div className="border-b border-text/20 pb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">Payment Information</h1>
        <p className="text-text/70">Manage your earnings and payment details</p>
      </div>

      {/* Earnings Section */}
      <section className="bg-text/5 border border-text/10 rounded-lg p-6">
        <h3 className="text-2xl font-semibold mb-4">Total Earnings</h3>
        <div className="flex items-center space-x-4">
          <div className="text-4xl">💰</div>
          <div>
            <p className="text-3xl font-bold text-success">${totalEarning}</p>
            <p className="text-text/60 text-sm">Total amount earned from donations</p>
          </div>
        </div>
      </section>

      {/* Payment History Section */}
      <section className="bg-text/5 border border-text/10 rounded-lg p-6">
        <h3 className="text-2xl font-semibold mb-4">Payment History</h3>
        
        <div className="max-h-64 overflow-y-auto space-y-1">
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-text/60">No payments yet.</p>
            </div>
          ) : (
            payments
              .filter((p) => p.to_user === userId)
              .map((p, index) => (
                <div
                  key={p.oid}
                  className={`flex justify-between items-center p-3 hover:bg-text/5 transition-colors ${
                    index !== payments.filter((p) => p.to_user === userId).length - 1 
                      ? 'border-b border-text/10' 
                      : ''
                  }`}
                >
                  <div>
                    <p className="text-sm text-text/80">
                      <span className="font-semibold">{p.name}</span>
                      {" • "}
                      <span className="text-xs text-text/60">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                    </p>
                    {p.message && (
                      <p className="text-xs text-text/60 mt-1 italic">"{p.message}"</p>
                    )}
                  </div>
                  <span className="text-lg font-bold text-success">${p.amount}</span>
                </div>
              ))
          )}
        </div>
      </section>

      {/* Payment Info Update Section */}
      <section className="bg-text/5 border border-text/10 rounded-lg p-6">
        <h3 className="text-2xl font-semibold mb-4">Update Payment Details</h3>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block mb-2 text-text/80 font-medium">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={form?.paymentInfo?.phone || ""}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-text text-background border border-text/20 focus:ring-2 focus:ring-primary outline-none"
              placeholder="Enter your phone number"
            />
          </div>
          <div>
            <label className="block mb-2 text-text/80 font-medium">UPI ID</label>
            <input
              type="text"
              name="upi"
              value={form?.paymentInfo?.upi || ""}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-text text-background border border-text/20 focus:ring-2 focus:ring-primary outline-none"
              placeholder="you@bank"
            />
          </div>
          <button
            type="submit"
            disabled={!form?.instagram?.isVerified}
            className={`px-6 py-3 rounded-md text-text font-medium transition ${
              form?.instagram?.isVerified
                ? "bg-primary hover:bg-primary/80"
                : "bg-text/30 cursor-not-allowed"
            }`}
          >
            Save Payment Details
          </button>

          {!form?.instagram?.isVerified && (
            <p className="mt-2 text-sm text-accent">
              ⚠️ Verify your Instagram account first to update payment information.
            </p>
          )}
        </form>
      </section>
    </div>
  );
};

export default PaymentInfo;
