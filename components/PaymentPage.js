"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSpinner } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import "../app/globals.css"; // Assuming your global styles are here

import { fetchuser, fetchpayments, updateProfile } from "@/actions/useractions";

// Save payment after capture (send captureDetails to backend)
const savePayment = async (paymentDetails, captureDetails) => {
  try {
    const res = await fetch('/api/paypal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderID: paymentDetails.orderID,
        amount: paymentDetails.amount,
        username: paymentDetails.to_user,
        paymentform: {
          name: paymentDetails.payerName,
          message: paymentDetails.message,
        },
        captureOnly: true,
        captureDetails
      })
    });
    const data = await res.json();
    console.log('PayPal API response:', data); // Debug log
    if (data.capture && data.capture.status === "COMPLETED") {
      toast.success("Payment successful!", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
        transition: Bounce,
      });
      return { success: true };
    } else {
      const errorMsg = data.capture && data.capture.status ? `Payment status: ${data.capture.status}` : (data.error || "Payment failed.");
      toast.error(`Payment error: ${errorMsg}`, {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
        transition: Bounce,
      });
      return { success: false, message: errorMsg };
    }
  } catch (err) {
    console.error('Error saving payment:', err);
    toast.error('Error saving payment.', {
      position: "top-right",
      autoClose: 5000,
      theme: "light",
      transition: Bounce,
    });
    return { success: false, message: 'Error saving payment.' };
  }
}
// --- End Mock Action Functions ---


const PaymentPage = ({ username }) => {
  // --- Hooks Initialization ---
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  // --- State Management ---
  const [currentUser, setcurrentUser] = useState({});
  const [userId, setUserId] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentform, setPaymentform] = useState({ name: "", message: "", amount: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [eventDuration, setEventDuration] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const [isPaying, setIsPaying] = useState(false);

  const isOwner = session?.user?.name === username;

  // --- Data Fetching and Effects ---
  const getData = useCallback(async () => {
    try {
      const user = await fetchuser(username);
      if (user) {
        setcurrentUser(user);
        setUserId(user._id);
        const userPayments = await fetchpayments(user._id, user.eventStart);
        setPayments(userPayments);
      } else {
        console.error("User not found");
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Could not load profile data.");
    }
  }, [username]);

  useEffect(() => {
    getData();
  }, [getData]);

  useEffect(() => {
    if (session?.user?.name) {
      setPaymentform((prev) => ({ ...prev, name: session.user.name }));
    }
  }, [session]);


  
  // Countdown timer effect
  useEffect(() => {
    if (currentUser.eventEnd) {
      const interval = setInterval(() => {
        const now = new Date();
        const end = new Date(currentUser.eventEnd);
        const diff = end - now;

        if (diff <= 0) {
          clearInterval(interval);
          setTimeLeft(null);
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentUser.eventEnd]);

  // --- Event Handlers ---
  const handleChange = (e) => {
    setPaymentform({ ...paymentform, [e.target.name]: e.target.value });
  };
  
    const handleSaveDescription = async () => {
        const res = await updateProfile(
            { email: currentUser.email, description: currentUser.description },
            username
        );
        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Description updated successfully!");
            setIsEditing(false);
        }
    };

  const handleSavePerk = async () => {
    const res = await updateProfile({ email: currentUser.email, perk: currentUser.perk }, username);
    if (!res?.error) toast.success("Perk saved!");
  };

  const handleStartEvent = async () => {
    const durationMs = Number(eventDuration) * 24 * 60 * 60 * 1000;
    const start = new Date();
    const end = new Date(Date.now() + durationMs);

    const res = await updateProfile({ ...currentUser, eventStart: start, eventEnd: end }, username);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Event started!");
      setcurrentUser({ ...currentUser, eventStart: start, eventEnd: end });
    }
  };

  const handleEndEvent = async () => {
    const res = await updateProfile({ ...currentUser, eventStart: null, eventEnd: null }, username);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Event ended!");
      setcurrentUser({ ...currentUser, eventStart: null, eventEnd: null });
    }
  };
  
  // --- PayPal Functions ---
  // Create order on backend, return orderID to PayPal
  const createOrder = async (data, actions) => {
    if (!paymentform.amount || Number(paymentform.amount) <= 0) {
      toast.error("Please enter a valid amount to donate.");
      return;
    }
    if (!userId) {
      toast.error("User not loaded.");
      return;
    }
    // Call backend to create order
    const res = await fetch('/api/paypal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: paymentform.amount,
        userId,
        paymentform: {
          name: paymentform.name,
          message: paymentform.message,
        }
      })
    });
    const dataRes = await res.json();
    if (dataRes.id) {
      return dataRes.id;
    } else {
      toast.error("Could not create PayPal order.");
      return;
    }
  };

  const onApprove = async (data, actions) => {
    setIsPaying(true);
    return actions.order.capture().then(async (details) => {
      const paymentDetails = {
        payerName: paymentform.name,
        message: paymentform.message,
        amount: details.purchase_units[0].amount.value,
        orderID: data.orderID,
        timestamp: new Date().toISOString(),
        to_user: userId,
      };

      // Send capture details to backend for saving
      const res = await savePayment(paymentDetails, details);
      setIsPaying(false);

      if (res.success) {
        // Refetch payments and update leaderboard
        const updatedPayments = await fetchpayments(userId);
        setPayments(updatedPayments);
        router.push(`/${username}?paymentdone=true`);
      } else {
        toast.error("Payment failed. Please contact support.");
      }
    });
  };
    
  const isEventActive = currentUser?.eventEnd && new Date(currentUser.eventEnd) > new Date();

  return (
    <>
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
      <div className="min-h-screen bg-background text-text flex flex-col items-center py-12 px-2">
        
        {/* Banner */}

        {/* Banner with full width and profile image overlapping bottom edge */}
        <div className="relative w-full  mx-auto">
          {/* Background image */}
          <div
            className="w-full h-64 md:h-72 lg:h-80 bg-cover bg-center shadow-md"
            style={{
              backgroundImage: `url(${currentUser?.coverpic || "https://picsum.photos/1600/400"})`,
            }}
          >
            <div className="absolute inset-0 bg-background/40" />
          </div>
          {/* Profile image, centered and overlapping bottom edge */}
          <div className="absolute left-1/2 bottom-0 translate-x-[-50%] translate-y-1/2 flex justify-center items-center w-full pointer-events-none">
            <div className="w-36 h-36 md:w-40 md:h-40 bg-text rounded-full shadow-lg border-4 border-text overflow-hidden flex items-center justify-center">
              <img
                src={currentUser?.profilepic || "https://picsum.photos/200"}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
        </div>
        {/* Add margin below the banner to account for the overlapping profile image */}
        <div className="h-20" />

        {/* Profile Info Box */}
        <div className="relative mt-20 w-full max-w-md mx-auto p-6 bg-text/10 border border-text/20 backdrop-blur-md shadow-md rounded-lg">
          <h1 className="text-xl font-bold text-text text-center">@{username}</h1>
          {/* Description */}
          {isOwner ? (
            <>
              <textarea
                className="w-full mt-2 bg-background border border-text/20 text-text text-sm text-center rounded p-2 resize-none focus:ring-2 focus:ring-primary outline-none"
                value={currentUser.description || ""}
                onFocus={() => setIsEditing(true)}
                onChange={(e) => setcurrentUser({ ...currentUser, description: e.target.value })}
              />
              {isEditing && (
                <button onClick={handleSaveDescription} className="w-full mt-2 bg-primary hover:bg-primary/80 text-text px-4 py-2 rounded text-sm font-semibold">
                  Save Description
                </button>
              )}
            </>
          ) : (
            <p className="text-sm text-text/70 text-center mt-2">{currentUser.description}</p>
          )}

          {/* Perk Display */}
          {(currentUser.perk || payments.length > 0) && (
            <div className="mt-6 bg-text/5 border border-text/20 p-4 rounded-lg">
              {currentUser.perk && (
                <div className="text-text/90 text-sm text-center mb-3">
                  🎁 <span className="font-semibold text-accent">Top 5 Donor Perk:</span> {currentUser.perk}
                </div>
              )}
            </div>
          )}

          {/* Owner-only controls */}
          {isOwner && (
            <div className="mt-4 space-y-2">
              <input
                type="text"
                value={currentUser.perk || ""}
                onChange={(e) => setcurrentUser({ ...currentUser, perk: e.target.value })}
                onBlur={handleSavePerk}
                placeholder="Set your perk for top donors"
                className="w-full px-3 py-2 bg-background border border-text/20 text-text rounded focus:ring-2 focus:ring-primary outline-none"
              />
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                <input type="number" placeholder="Duration in days" value={eventDuration} onChange={(e) => setEventDuration(e.target.value)}
                  className="w-full sm:min-w-[180px] sm:flex-1 px-3 py-2 bg-background border border-text/20 text-text rounded focus:ring-2 focus:ring-primary outline-none"
                />
                <button onClick={handleStartEvent} className="w-full sm:w-auto bg-success hover:bg-success/80 text-text px-4 py-2 rounded text-sm font-semibold">
                  Start Event
                </button>
                <button onClick={handleEndEvent} className="w-full sm:w-auto bg-error hover:bg-error/80 text-text px-4 py-2 rounded text-sm font-semibold">
                  End Event
                </button>
              </div>
            </div>
          )}

          {/* Event Timer */}
          {currentUser.eventEnd && timeLeft && (
            <div className="mt-4 text-center bg-background/80 border border-primary/30 text-text/80 text-sm py-2 px-3 rounded-md shadow-sm">
              ⏳ <span className="font-semibold text-primary">Event is live!</span> Ends in: <span className="font-semibold">{timeLeft}</span>
            </div>
          )}
        </div>

        <div className="w-full max-w-5xl mt-12 flex flex-col md:flex-row gap-8 px-2">
            {/* Leaderboard */}
<div className={`flex-1 bg-text/10 border border-text/20 text-text rounded-lg shadow-md p-6 mx-2 md:mx-0 ${!isEventActive ? "opacity-40 pointer-events-none" : ""}`}>
                <h2 className="text-2xl font-bold mb-4 text-secondary">Leaderboard</h2>
                {payments.length === 0 ? (<p className="text-text/60">No payments yet</p>) : (
                <ol className="list-decimal list-inside text-text/80 space-y-2">
                    {Object.entries(
                        payments.reduce((acc, p) => {
                            acc[p.name] = (acc[p.name] || 0) + p.amount;
                            return acc;
                        }, {})
                    ).sort(([, a], [, b]) => b - a) // Sort by total amount descending
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
            <div className={`flex-1 bg-text/10 border border-text/20 text-text rounded-lg shadow-md p-6 mx-2 md:mx-0 ${!isEventActive ? "opacity-40 pointer-events-none" : ""}`}>
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
                        <textarea name="message" onChange={handleChange} value={paymentform.message} placeholder="Write a message..." rows="3" className="w-full px-4 py-2 rounded bg-background border border-text/20 text-text focus:ring-2 focus:ring-primary outline-none" disabled={!session || isPaying}/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Amount</label>
                        <input type="number" name="amount" value={paymentform.amount} onChange={handleChange} placeholder="Enter amount" className="w-full px-4 py-2 rounded bg-background border border-text/20 text-text focus:ring-2 focus:ring-primary outline-none" disabled={!session || isPaying}/>
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
      </div>
    </>
  );
};

export default PaymentPage;
