"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSpinner } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { FaPen } from "react-icons/fa";
import "../app/globals.css"; // Assuming your global styles are here

import { fetchuser, fetchpayments, updateProfile } from "@/actions/useractions";
import PaymentProfileSection from "./PaymentProfileSection";
import PaymentInteractionSection from "./PaymentInteractionSection";
import VaultSection from "./VaultSection";

// Save payment after capture (send captureDetails to backend)
const savePayment = async (paymentDetails, captureDetails) => {
  try {
    const res = await fetch('/api/paypal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderID: paymentDetails.orderID,
        amount: paymentDetails.amount,
        to_user: paymentDetails.to_user,
        message: paymentDetails.message,
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
      return { success: true, paymentId: data.paymentId };
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
  // --- Image Upload Refs ---
  const profileInputRef = useRef();
  const coverInputRef = useRef();
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
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
  const [activeTab, setActiveTab] = useState('contribute');

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
    const end = new Date(start.getTime() + durationMs);
    const res = await updateProfile(
      { ...currentUser, eventStart: start, eventEnd: end },
      username
    );
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Event started!");
      setcurrentUser({ ...currentUser, eventStart: start, eventEnd: end });
      
      // Notify followers about the new event
      try {
        await fetch('/api/notifications/followers/event', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            creatorId: currentUser._id,
            creatorName: username
          }),
        });
      } catch (error) {
        console.error('Error notifying followers about event:', error);
        // Don't show error to user as the event started successfully
      }
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
  
  // --- Image Upload Handlers ---
  const handleProfileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingProfile(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "profilepic");
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setcurrentUser((prev) => ({ ...prev, profilepic: data.url }));
        toast.success("Profile picture updated!");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (err) {
      toast.error(err?.message || "Upload error");
    } finally {
      setIsUploadingProfile(false);
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingCover(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "coverpic");
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setcurrentUser((prev) => ({ ...prev, coverpic: data.url }));
        toast.success("Cover banner updated!");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (err) {
      toast.error(err?.message || "Upload error");
    } finally {
      setIsUploadingCover(false);
    }
  };

  // --- PayPal Functions ---
  // Create order on backend, return orderID to PayPal
  const createOrder = async (data, actions) => {
    if (!paymentform.amount || Number(paymentform.amount) <= 0) {
      toast.error("Please enter a valid amount to donate.");
      throw new Error("Invalid amount");
    }
    if (!userId) {
      toast.error("User not loaded.");
      throw new Error("User not loaded");
    }
    
    try {
      // Call backend to create order
      const res = await fetch('/api/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: paymentform.amount,
          to_user: userId,
          message: paymentform.message
        })
      });
      
      const dataRes = await res.json();
      console.log('PayPal order creation response:', dataRes); // Debug log
      
      if (dataRes.id) {
        return dataRes.id;
      } else {
        console.error('PayPal order creation failed:', dataRes);
        toast.error("Could not create PayPal order.");
        throw new Error("Order creation failed");
      }
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      toast.error("Failed to create payment order.");
      throw error;
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
        // Points are already awarded in the PayPal route
        if (res.pointsAwarded) {
          toast.success(`Payment successful! You earned ${res.pointsAwarded} Fam Points! 🎉`);
        } else {
          toast.success('Payment successful!');
        }

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
        style={{ top: 72 }}
      />
      <div id="thisone" className="min-h-screen bg-background text-text flex flex-col items-center py-12 px-2">
        <PaymentProfileSection
          username={username}
          currentUser={currentUser}
          isOwner={isOwner}
          isUploadingProfile={isUploadingProfile}
          isUploadingCover={isUploadingCover}
          profileInputRef={profileInputRef}
          coverInputRef={coverInputRef}
          handleProfileChange={handleProfileChange}
          handleCoverChange={handleCoverChange}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          handleSaveDescription={handleSaveDescription}
          eventDuration={eventDuration}
          setEventDuration={setEventDuration}
          handleStartEvent={handleStartEvent}
          handleEndEvent={handleEndEvent}
          timeLeft={timeLeft}
          handleSavePerk={handleSavePerk}
          setcurrentUser={setcurrentUser}
          isEventActive={isEventActive}
        />
        
        {/* NEW TAB NAVIGATION UI - Replaces the old InteractionSection placement */}
        <div className="w-full max-w-5xl mt-12 border-b border-text/20">
          <div className="flex justify-center items-center gap-8">
            <button
              onClick={() => setActiveTab('contribute')}
              className={`px-4 py-3 text-lg font-semibold uppercase tracking-wider transition-colors duration-200 ${
                activeTab === 'contribute'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text/60 hover:text-text border-b-2 border-transparent'
              }`}
            >
              Contribute
            </button>
            <button
              onClick={() => setActiveTab('vault')}
              className={`px-4 py-3 text-lg font-semibold uppercase tracking-wider transition-colors duration-200 ${
                activeTab === 'vault'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text/60 hover:text-text border-b-2 border-transparent'
              }`}
            >
              {currentUser.username}'s Vault
            </button>
          </div>
        </div>

        {/* Conditionally Rendered Content */}
        <div className="w-full flex justify-center">
          {activeTab === 'contribute' && (
            <PaymentInteractionSection
              session={session}
              isEventActive={isEventActive}
              payments={payments}
              isPaying={isPaying}
              paymentform={paymentform}
              handleChange={handleChange}
              createOrder={createOrder}
              onApprove={onApprove}
              router={router}
            />
          )}

          {activeTab === 'vault' && (
            <VaultSection currentUser={currentUser} />
          )}
        </div>
      </div>
    </>
  );
};

export default PaymentPage;
