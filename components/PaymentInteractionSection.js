import React from "react";
import { FaUserCircle, FaSpinner } from "react-icons/fa";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

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
}) => {
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
            .map(([name, total], i) => (
              <li key={i} className="flex justify-between items-center bg-background/30 p-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FaUserCircle className="text-yellow-500 text-xl"/>
                  <span className="font-medium">{name}</span>
                </div>
                <span className="text-text font-medium">${total}</span>
              </li>
            ))}
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
            (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? (
              <PayPalScriptProvider options={{ "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID, currency: "USD", components: "buttons" }}>
                <PayPalButtons
                  style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                  createOrder={createOrder}
                  onApprove={onApprove}
                  disabled={!paymentform.amount || Number(paymentform.amount) <= 0 || isPaying || !isEventActive}
                />
              </PayPalScriptProvider>
            ) : (
              <div className="text-center p-3 bg-red-500/10 text-red-400 rounded-lg">PayPal is not configured.</div>
            ))
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
