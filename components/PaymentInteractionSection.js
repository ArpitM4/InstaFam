import React, { useState, useEffect } from "react";
import { FaUserCircle, FaSpinner } from "react-icons/fa";
import dynamic from "next/dynamic";

// Dynamically import PayPal components to prevent SSR issues
const PayPalScriptProvider = dynamic(
  () => import("@paypal/react-paypal-js").then((mod) => mod.PayPalScriptProvider),
  { ssr: false }
);

const PayPalButtons = dynamic(
  () => import("@paypal/react-paypal-js").then((mod) => mod.PayPalButtons),
  { ssr: false }
);

const PaymentInteractionSection = ({
  session,
  isEventActive,
  payments,
  isPaying,
  paymentform,
  handleChange,
  createOrder,
  onApprove,
  router,
  currentUser, // Add currentUser to get perkRank
}) => {
  const [paypalClientId, setPaypalClientId] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
    const timer = setTimeout(() => {
      setIsClient(true);
      setPaypalClientId(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID);
    }, 100); // Small delay to ensure proper hydration
    
    return () => clearTimeout(timer);
  }, []);
  return (<>
    <div className="w-full max-w-5xl mt-8 flex flex-col md:flex-row gap-6 px-2">
      {/* Leaderboard Disclaimer */}
     

      {/* Leaderboard */}
      <div className={`flex-1 bg-dropdown-hover rounded-lg shadow-sm p-4 mx-2 md:mx-0 ${!isEventActive ? "opacity-40 pointer-events-none" : ""} ${!session ? "blur-sm" : ""}`}> 
        {/* Desktop Disclaimer */}

        <h2 className="text-2xl font-semibold text-primary mb-4">Leaderboard</h2>
        {payments.length === 0 ? (<p className="text-text/60">No payments yet</p>) : (
          <ol className="list-decimal list-inside text-text/80 space-y-2">
            {Object.entries(
              payments.reduce((acc, p) => {
                acc[p.name] = (acc[p.name] || 0) + p.amount;
                return acc;
              }, {})
            ).sort(([, a], [, b]) => b - a)
            .map(([name, total], i) => {
              const isPerkEligible = i < (currentUser?.perkRank || 5);
              return (
                <li key={i} className={`flex justify-between items-center p-2 rounded-lg transition-all duration-200 ${
                  isPerkEligible 
                    ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20' 
                    : 'bg-background/30'
                }`}>
                  <div className="flex items-center space-x-2">
                    <FaUserCircle className={`text-xl ${isPerkEligible ? 'text-yellow-400' : 'text-yellow-500'}`}/>
                    <span className={`font-medium ${isPerkEligible ? 'text-yellow-100' : ''}`}>{name}</span>
                    {isPerkEligible && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">🎁 Perk Eligible</span>}
                  </div>
                  <span className={`font-medium ${isPerkEligible ? 'text-yellow-100' : 'text-text'}`}>${total}</span>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Donation Form */}
      <div className={`flex-1 bg-dropdown-hover rounded-lg shadow-sm p-4 mx-2 md:mx-0 ${!isEventActive ? "opacity-40 pointer-events-none" : ""}`}>
        <h2 className="text-2xl font-semibold text-primary mb-4">Contribute</h2>
        {!isEventActive && (
          <div className="text-center p-3 bg-background/30 rounded-lg mb-4">
            <p className="text-text/60 text-sm">💤 No live events at the moment. Check back later!</p>
          </div>
        )}
        {isPaying && (
          <div className="flex justify-center items-center mb-4">
            <FaSpinner className="animate-spin text-primary text-3xl mr-2" />
            <span className="text-primary font-semibold">Processing payment...</span>
          </div>
        )}
        <div className={`space-y-3 transition duration-200 ${isPaying || !isEventActive ? 'pointer-events-none opacity-60 blur-sm' : ''}`}> 
          <div>
            <label className="block text-sm font-medium text-text/70 mb-1">Your Name</label>
            <input 
              type="text" 
              name="name" 
              value={session?.user?.name || ""} 
              readOnly 
              className="w-full px-3 py-2 rounded-lg bg-background text-text placeholder-text/40 focus:outline-none transition-all duration-200 border-0 cursor-not-allowed" 
              disabled
            />
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
              disabled={isPaying || !isEventActive}
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
              disabled={isPaying || !isEventActive}
            />
          </div>
          {/* PayPal Button Logic */}
          {session ? (
            isClient && paypalClientId ? (
              <div className="paypal-container">
                <PayPalScriptProvider 
                  options={{ 
                    "client-id": paypalClientId, 
                    currency: "USD", 
                    components: "buttons",
                    "disable-funding": "credit,card"
                  }}
                  deferLoading={false}
                >
                  <PayPalButtons
                    style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={(err) => {
                      console.error('PayPal Button Error:', err);
                      // Don't show error to user as it might be temporary
                    }}
                    disabled={!paymentform.amount || Number(paymentform.amount) <= 0 || isPaying || !isEventActive}
                  />
                </PayPalScriptProvider>
              </div>
            ) : isClient ? (
              <div className="text-center p-3 bg-red-500/10 text-red-400 rounded-lg">PayPal is not configured.</div>
            ) : (
              <div className="text-center p-3 bg-gray-500/10 text-gray-400 rounded-lg">Loading payment options...</div>
            )
          ) : (
            <button className="w-full bg-primary hover:bg-primary/90 transition-all duration-200 text-white font-medium py-2 rounded-lg shadow-sm hover:shadow-md" onClick={() => router.push('/login')}>
              Login to Donate
            </button>
          )}
        </div>
      </div>
             
    </div>
    </>
  );
};

export default PaymentInteractionSection;
