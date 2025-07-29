"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchuser, updatePaymentInfo } from "@/actions/useractions";
import { Bounce } from "react-toastify";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { generateInstagramOTP } from "@/actions/useractions";
import { fetchpayments } from "@/actions/useractions";

const Dashboard = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalEarning, setTotalEarning] = useState(0);

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

  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState(null);
  const [userId, setUserId] = useState(null);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (status === "loading") return; // Wait until session is loaded
    
    if (!session) {
      router.push("/login");
    } else {
      getData();
    }
  }, [session, status]);

  const getData = async () => {
    const user = await fetchuser(session.user.name);
    setForm(user);
    setUserId(user?._id);
    if (user?._id) {
      const payments = await fetchpayments(user._id);
      setPayments(payments);
      const total = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      setTotalEarning(total);
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
    console.log("Form Submit Triggered"); // Debug check

    const phone = form.paymentInfo?.phone || "";
    const upi = form.paymentInfo?.upi || "";

    try {
      const res = await updatePaymentInfo({ phone, upi }, session.user.name);
      // console.log("DB Update Response:", res); // Debug DB result

      toast('Profile Updated', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });

    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Something went wrong!");
    }
  };

  if (!form) return(<div className="min-h-screen flex items-center justify-center bg-background text-text">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 rounded-full border-4 border-primary border-t-transparent mb-4"></div>
        <p className="text-lg font-semibold">Loading InstaFam...</p>
      </div>
    </div>)

  return (<>
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      style={{ top: 72 }} // Adjust this value to match your navbar height
    />
    <div className="min-h-screen pt-20 bg-background text-text">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-0 top-20 w-64 h-full bg-background/30 backdrop-blur-lg border-r border-text/10 p-6 space-y-4">
        <h2 className="text-xl font-bold mb-6">Creator Dashboard</h2>
        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`block w-full text-left p-3 rounded-md transition-colors ${
              activeTab === 'general'
                ? 'bg-primary/20 text-primary border-l-4 border-primary'
                : 'hover:bg-text/10 hover:text-primary'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`block w-full text-left p-3 rounded-md transition-colors ${
              activeTab === 'payment'
                ? 'bg-primary/20 text-primary border-l-4 border-primary'
                : 'hover:bg-text/10 hover:text-primary'
            }`}
          >
            Payment Info
          </button>
        </nav>
      </aside>

      {/* Mobile Navigation - Top Tabs */}
      <div className="md:hidden bg-background/30 backdrop-blur-lg border-b border-text/10 px-4 py-3">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-3 px-4 text-center rounded-lg font-medium transition-colors ${
              activeTab === 'general'
                ? 'bg-primary text-text'
                : 'bg-text/10 text-text/70 hover:bg-text/20'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`flex-1 py-3 px-4 text-center rounded-lg font-medium transition-colors ${
              activeTab === 'payment'
                ? 'bg-primary text-text' 
                : 'bg-text/10 text-text/70 hover:bg-text/20'
            }`}
          >
            Payment Info
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="md:ml-64 p-4 md:p-8">
        {/* General Tab Content */}
        {activeTab === 'general' && (
          <div className="space-y-8">
            <div className="border-b border-text/20 pb-6">
              <h1 className="text-3xl font-bold text-primary mb-2">General Settings</h1>
              <p className="text-text/70">Manage your account verification and basic settings</p>
            </div>

            {/* Instagram Verification Section */}
            <section className="bg-text/5 border border-text/10 rounded-lg p-6 space-y-4">
              <h3 className="text-2xl font-semibold">Instagram Verification</h3>
              <p className="text-text/80">
                Status:{" "}
                <span className={form?.instagram?.isVerified ? "text-success" : "text-error"}>
                  {form?.instagram?.isVerified ? "✅ Verified" : "❌ Not Verified"}
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

              {!form?.instagram?.isVerified && (
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
        )}

        {/* Payment Info Tab Content */}
        {activeTab === 'payment' && (
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
              
              <div className="max-h-64 overflow-y-auto pr-2 space-y-2">
                {payments.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="text-text/60">No payments yet.</p>
                  </div>
                ) : (
                  payments
                    .filter((p) => p.to_user === userId)
                    .map((p) => (
                      <div
                        key={p.oid}
                        className="flex justify-between items-center p-3 bg-background/50 border border-text/10 rounded-md"
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
                    value={form.paymentInfo?.phone || ""}
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
                    value={form.paymentInfo?.upi || ""}
                    onChange={handleChange}
                    className="w-full p-3 rounded-md bg-text text-background border border-text/20 focus:ring-2 focus:ring-primary outline-none"
                    placeholder="you@bank"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!form.instagram?.isVerified}
                  className={`px-6 py-3 rounded-md text-text font-medium transition ${
                    form.instagram?.isVerified
                      ? "bg-primary hover:bg-primary/80"
                      : "bg-text/30 cursor-not-allowed"
                  }`}
                >
                  Save Payment Details
                </button>

                {!form.instagram?.isVerified && (
                  <p className="mt-2 text-sm text-accent">
                    ⚠️ Verify your Instagram account first to update payment information.
                  </p>
                )}
              </form>
            </section>
          </div>
        )}
      </main>
    </div>

</>
  );
}

export default Dashboard;
