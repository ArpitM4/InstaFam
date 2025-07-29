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
  return (
    <div className="w-full max-w-5xl mt-12 flex flex-col md:flex-row gap-8 px-2">
      {/* Leaderboard */}
      <div className={`flex-1 bg-text/10 border border-text/20 text-text rounded-lg shadow-md p-6 mx-2 md:mx-0 ${!isEventActive ? "opacity-40 pointer-events-none" : ""} ${!session ? "blur-sm" : ""}`}> 
        <h2 className="text-2xl font-bold mb-4 text-secondary">Leaderboard</h2>
        {payments.length === 0 ? (<p className="text-text/60">No payments yet</p>) : (
          <ol className="list-decimal list-inside text-text/80 space-y-2">
            {Object.entries(
              payments.reduce((acc, p) => {
                acc[p.name] = (acc[p.name] || 0) + p.amount;
                return acc;
              }, {})
            ).sort(([, a], [, b]) => b - a)
            .map(([name, total], i) => (
              <li key={i} className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <FaUserCircle className="text-accent text-2xl" />
                  <span>{name}</span>
                </div>
                <span className="text-text font-medium">${total}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Donation Form */}
      <div className={`flex-1 bg-text/10 border border-text/20 text-text rounded-lg shadow-md p-6 mx-2 md:mx-0 ${!isEventActive ? "opacity-100" : ""}`}>
        <h2 className="text-2xl font-bold mb-4 text-secondary">Contribute</h2>
        {isPaying && (
          <div className="flex justify-center items-center mb-4">
            <FaSpinner className="animate-spin text-primary text-3xl mr-2" />
            <span className="text-primary font-semibold">Processing payment...</span>
          </div>
        )}
        <div className={`space-y-4 transition duration-200 ${isPaying ? 'pointer-events-none opacity-60 blur-sm' : ''}`}> 
          <div>
            <label className="block text-sm font-medium mb-1">Your Name</label>
            <input type="text" name="name" value={session?.user?.name || ""} readOnly className="w-full px-4 py-2 rounded bg-background/80 text-text border border-text/20 cursor-not-allowed" disabled/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea name="message" onChange={handleChange} value={paymentform.message} placeholder="Write a message..." rows="3" className="w-full px-4 py-2 rounded bg-background border border-text/20 text-text focus:ring-2 focus:ring-primary outline-none" disabled={isPaying}/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input type="number" name="amount" value={paymentform.amount} onChange={handleChange} placeholder="Enter amount" className="w-full px-4 py-2 rounded bg-background border border-text/20 text-text focus:ring-2 focus:ring-primary outline-none" disabled={isPaying}/>
          </div>
          {/* PayPal Button Logic */}
          {session ? (
            (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? (
              <PayPalScriptProvider options={{ "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID, currency: "USD", components: "buttons" }}>
                <PayPalButtons
                  style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                  createOrder={createOrder}
                  onApprove={onApprove}
                  disabled={!paymentform.amount || Number(paymentform.amount) <= 0 || isPaying}
                />
              </PayPalScriptProvider>
            ) : (
              <div className="text-center p-2 bg-red-900/50 text-white rounded-md">PayPal is not configured.</div>
            ))
          ) : (
            <button className="w-full bg-primary hover:bg-primary/80 transition text-text font-semibold py-2 rounded-md" onClick={() => router.push('/login')}>
              Login to Donate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentInteractionSection;
