import React from "react";
import { FaUserCircle, FaSpinner } from "react-icons/fa";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// Get PayPal client ID directly from environment
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

const PaymentInteractionSection = ({
  session,
  isEventActive,
  payments,
  paymentsLoading,
  isPaying,
  paymentform,
  handleChange,
  createOrder,
  onApprove,
  router,
  currentUser, // Add currentUser to get perkRank
  setPaymentform, // Add setPaymentform to allow editing name
  isOwner,
  eventDuration,
  setEventDuration,
  handleStartEvent,
  handleEndEvent,
}) => {

  // Memoize leaderboard calculation to avoid re-computing on every render
  const leaderboardData = React.useMemo(() => {
    if (!payments || payments.length === 0) return [];

    const aggregated = payments.reduce((acc, p) => {
      acc[p.name] = (acc[p.name] || 0) + p.amount;
      return acc;
    }, {});

    return Object.entries(aggregated)
      .sort(([, a], [, b]) => b - a)
      .map(([name, total], i) => ({
        name,
        total,
        rank: i,
        isTop3: i < 3,
        rankEmoji: i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ''
      }));
  }, [payments]);

  /**
   * Handle name change
   * - For RANKED donations (event active): Allow editing username
   * - For UNRANKED donations (no event): Allow anyone (guest or logged in) to edit name
   */
  const handleNameChange = (e) => {
    setPaymentform(prev => ({ ...prev, name: e.target.value }));
  };

  return (
    <>
      <div className="w-full max-w-5xl mt-8 flex flex-col items-center px-2">
        {/* Owner-only Event Controls - Shifted from Header */}
        {isOwner && (
          <div className="w-full mb-6 p-5 rounded-2xl border border-white/10 shadow-lg" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', backdropFilter: 'blur(10px)' }}>
            <h3 className="text-lg font-semibold text-text mb-4">Manage Event (Leaderboard) </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
              <input
                type="number"
                placeholder={isEventActive ? "Event is running" : "Duration in days"}
                value={eventDuration}
                onChange={(e) => !isEventActive && setEventDuration(e.target.value)}
                className={`w-full sm:min-w-[160px] sm:flex-1 px-4 py-3 bg-background text-text rounded-xl focus:outline-none transition-all duration-200 border border-white/5 placeholder-text/40 ${isEventActive ? 'opacity-50 cursor-not-allowed' : 'focus:border-primary/50'}`}
                disabled={isEventActive}
                readOnly={isEventActive}
              />
              <button
                onClick={handleStartEvent}
                disabled={isEventActive || !eventDuration}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg ${isEventActive || !eventDuration
                  ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white hover:scale-[1.02]'
                  }`}
              >
                {isEventActive ? 'Event Active' : 'Start'}
              </button>
              <button
                onClick={handleEndEvent}
                disabled={!isEventActive}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg ${!isEventActive
                  ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600 text-white hover:scale-[1.02]'
                  }`}
              >
                End
              </button>
            </div>
            {isEventActive && (
              <p className="mt-3 text-center sm:text-left text-xs text-text/50">⚠️ Event settings are locked while event is running</p>
            )}
          </div>
        )}

        <div className="w-full flex flex-col md:flex-row gap-6">
          {/* Leaderboard - ONLY show when event is active - Visible to ALL users */}
          {isEventActive && (
            <div className="flex-1 rounded-2xl shadow-lg p-5 mx-2 md:mx-0 border border-white/10" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', backdropFilter: 'blur(10px)' }}>
              <h2 className="text-2xl font-semibold text-gradient-primary mb-4">Leaderboard</h2>
              {leaderboardData.length === 0 ? (
                paymentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <FaSpinner className="animate-spin text-primary text-2xl" />
                    <span className="ml-2 text-text/60">Loading leaderboard...</span>
                  </div>
                ) : (
                  <p className="text-text/60">No payments yet</p>
                )
              ) : (
                <div className="relative">
                  {paymentsLoading && (
                    <div className="absolute inset-0 bg-dropdown-hover/50 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
                      <FaSpinner className="animate-spin text-primary text-xl" />
                    </div>
                  )}
                  <ol className="list-decimal list-inside text-text/80 space-y-2">
                    {leaderboardData.map((entry, i) => (
                      <li key={`${entry.name}-${i}`} className={`flex justify-between items-center p-2 rounded-lg transition-all duration-200 ${entry.isTop3
                        ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20'
                        : 'bg-background/30'
                        }`}>
                        <div className="flex items-center space-x-2">
                          <FaUserCircle className={`text-xl ${entry.isTop3 ? 'text-yellow-400' : 'text-yellow-500'}`} />
                          <span className={`font-medium ${entry.isTop3 ? 'text-yellow-100' : ''}`}>
                            {entry.rankEmoji && <span className="mr-1">{entry.rankEmoji}</span>}
                            {entry.name}
                          </span>
                        </div>
                        <span className={`font-medium ${entry.isTop3 ? 'text-yellow-100' : 'text-text'}${!isOwner ? ' blur-sm select-none' : ''}`}>${entry.total.toFixed(2)}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Donation Form - ALWAYS ACTIVE */}
          {/* When no event: centered with max-width, When event active: flex-1 */}
          <div className={`rounded-2xl shadow-lg p-5 mx-2 md:mx-0 border border-white/10 ${isEventActive ? 'flex-1' : 'w-full md:max-w-md md:mx-auto'}`} style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', backdropFilter: 'blur(10px)' }}>
            <h2 className="text-2xl font-bold text-text mb-4">
              Support {currentUser?.name || "Creator"}
            </h2>

            {/* Info banner for contribution type */}
            {!isEventActive && (
              <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-300 text-xs">
                  ❤️ Make a contribution to show your support! (No event currently active)
                </p>
              </div>
            )}

            {isEventActive && (
              <div className="mb-4 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-300 text-sm">
                  🏆 Event is live! Your contribution will be ranked on the leaderboard!
                </p>
              </div>
            )}

            {isPaying && (
              <div className="flex justify-center items-center mb-4">
                <FaSpinner className="animate-spin text-primary text-3xl mr-2" />
                <span className="text-primary font-semibold">Processing payment...</span>
              </div>
            )}

            <div className={`space-y-3 transition duration-200 ${isPaying ? 'pointer-events-none opacity-60 blur-sm' : ''}`}>
              <div>
                <label className="block text-sm font-medium text-text/70 mb-1">
                  Your Name {!session && '(Required)'}
                </label>
                <input
                  type="text"
                  name="name"
                  value={paymentform.name || ""}
                  onChange={handleNameChange}
                  placeholder={session ? "Your name" : "Enter your name"}
                  className="w-full px-3 py-2 rounded-lg bg-background text-text placeholder-text/40 focus:outline-none transition-all duration-200 border-0"
                  disabled={isPaying}
                  required
                />
                {!session && (
                  <p className="text-xs text-text/50 mt-1">
                    💡 You can contribute as a guest! Just enter your name.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text/70 mb-1">Message</label>
                <textarea
                  name="message"
                  onChange={handleChange}
                  value={paymentform.message}
                  placeholder="Write a message..."
                  rows="3"
                  className="w-full px-3 py-2 rounded-lg bg-background text-text placeholder-text/40 focus:outline-none transition-all duration-200 border-0"
                  disabled={isPaying}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text/70 mb-1">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={paymentform.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 rounded-lg bg-background text-text placeholder-text/40 focus:outline-none transition-all duration-200 border-0"
                  disabled={isPaying}
                />
              </div>

              {/* Razorpay Button - UI Only (Coming Soon) */}
              <div className="mt-2">
                <button
                  disabled
                  className="w-full py-3 bg-[#072654] text-white rounded-lg font-bold flex items-center justify-center gap-2 opacity-70 cursor-not-allowed"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 10H21M7 15H8M12 15H13M6 19H18C19.1046 19 20 18.1046 20 17V7C20 5.89543 19.1046 5 18 5H6C4.89543 5 4 5.89543 4 7V17C4 18.1046 4.89543 19 6 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Pay with Razorpay
                  <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">Coming Soon</span>
                </button>
                <p className="text-xs text-center text-white/40 mt-2">
                  UPI, Cards, NetBanking & more - launching soon!
                </p>
              </div>

              {/* PayPal Button - Only for Admin Users */}
              {(() => {
                const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim());
                const isAdmin = session?.user?.email && adminEmails.includes(session.user.email);

                if (!isAdmin) return null;

                return (
                  <div className="min-h-[55px] mt-4">
                    <p className="text-xs text-yellow-400 mb-2 text-center">Admin Only: PayPal Testing</p>
                    <div className="w-full paypal-container">
                      <PayPalScriptProvider
                        options={{
                          "client-id": PAYPAL_CLIENT_ID,
                          currency: "USD",
                          components: "buttons",
                          "disable-funding": "credit,card"
                        }}
                      >
                        <PayPalButtons
                          style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                          createOrder={createOrder}
                          onApprove={onApprove}
                          onError={(err) => {
                            console.error('PayPal Button Error:', err);
                          }}
                          disabled={!paymentform.amount || Number(paymentform.amount) <= 0 || isPaying || !paymentform.name}
                          className="w-full"
                        />
                      </PayPalScriptProvider>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentInteractionSection;
