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

import { fetchuser, fetchpayments, updateProfile, createEvent, endEvent, fetchEvents } from "@/actions/useractions";
import { useUser } from "@/context/UserContext";
import { emitPaymentSuccess } from "@/utils/eventBus";
import PaymentProfileSection from "./PaymentProfileSection";
import PaymentInteractionSection from "./PaymentInteractionSection";
import VaultSection from "./VaultSection";
import LinksSection from "./LinksSection";
import MerchandiseSection from "./MerchandiseSection";
import GiveawaySection from "./GiveawaySection";
import CommunitySection from "./CommunitySection";
import ErrorBoundary from "./ErrorBoundary";

// Save payment after capture (send captureDetails to backend)
const savePayment = async (paymentDetails, captureDetails, currentEvent = null, donorName = null) => {
  try {
    /**
     * Determine if this is a RANKED or UNRANKED donation:
     * - RANKED: Event is active (currentEvent exists)
     * - UNRANKED: No event active (currentEvent is null)
     */
    const isRanked = currentEvent !== null;
    
    const paymentData = {
      orderID: paymentDetails.orderID,
      amount: paymentDetails.amount,
      to_user: paymentDetails.to_user,
      message: paymentDetails.message,
      captureOnly: true,
      captureDetails,
      isRanked: isRanked, // Flag to indicate ranked vs unranked
      donorName: donorName // Name provided by donor (for unranked or editable ranked)
    };

    // Include eventId only for RANKED donations (when event is active)
    if (isRanked && currentEvent._id) {
      paymentData.eventId = currentEvent._id;
    }

    const res = await fetch('/api/paypal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log('PayPal API response:', data); // Debug log
      
      // Check if payment was successful (either data.success or capture status COMPLETED)
      if (data.success || (data.capture && data.capture.status === "COMPLETED")) {
        // Show appropriate success message based on donation type
        if (data.type === 'ranked') {
          toast.success("Thank you for your support! ❤️ You're on the leaderboard! 🏆", {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
            transition: Bounce,
          });
        } else {
          toast.success("Contribution successful! Thank you for your support! ❤️", {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
            transition: Bounce,
          });
        }
        return { success: true, paymentId: data.paymentId, type: data.type, pointsAwarded: data.pointsAwarded || 0 };
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
    } else {
      throw new Error(`HTTP error! status: ${res.status}`);
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
  
  // Safe access to UserContext with fallback
  let updatePoints;
  try {
    const userContext = useUser();
    updatePoints = userContext?.updatePoints;
  } catch (error) {
    console.warn('UserContext not available:', error);
    updatePoints = null;
  }

  // --- State Management ---
  const [currentUser, setcurrentUser] = useState({});
  const [userId, setUserId] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentform, setPaymentform] = useState({ name: "", message: "", amount: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [eventDuration, setEventDuration] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const [activeTab, setActiveTab] = useState('contribute');

  // Sync activeTab with ?section= in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const section = params.get('section');
    if (section && [
      'contribute',
      'vault',
      'community',
      'links',
      'merchandise'
    ].includes(section)) {
      setActiveTab(section);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('section', tab);
    window.history.replaceState({}, '', url);
  };
  const [hasError, setHasError] = useState(false);
  const [showBetaPopup, setShowBetaPopup] = useState(false);
  const [showFamPointsPopup, setShowFamPointsPopup] = useState(false);
  const [earnedFamPoints, setEarnedFamPoints] = useState(0);

  const isOwner = session?.user?.name === username;

  // --- Data Fetching and Effects ---
  const fetchActiveEvent = async (userId) => {
    try {
      // Use public endpoint to fetch event by username (works for all visitors)
      const response = await fetch(`/api/events/public?username=${username}`);
      if (response.ok) {
        const data = await response.json();
        if (data.event) {
          console.log('Active event found:', data.event);
          setCurrentEvent(data.event); // Get the current active event
          
          // Sync user fields with event data if they don't match
          // This ensures UI consistency on reload
          const eventStart = new Date(data.event.startTime);
          const eventEnd = new Date(data.event.endTime);
          
          setcurrentUser(prev => {
            if (prev && (!prev.eventStart || !prev.eventEnd ||
                new Date(prev.eventStart).getTime() !== eventStart.getTime() ||
                new Date(prev.eventEnd).getTime() !== eventEnd.getTime())) {
              console.log('Syncing user event fields with active event');
              return {
                ...prev,
                eventStart: eventStart,
                eventEnd: eventEnd
              };
            }
            return prev;
          });
        } else {
          console.log('No active event found');
          setCurrentEvent(null);
        }
      }
    } catch (error) {
      console.error("Error fetching active event:", error);
      setCurrentEvent(null);
    }
  };

  const getData = useCallback(async () => {
    setPaymentsLoading(true);
    try {
      const user = await fetchuser(username);
      if (user) {
        setUserId(user._id);
        setcurrentUser(user);
        
        // Parallel fetch: event and payments at the same time
        const eventPromise = fetchActiveEvent(user._id);
        
        // Determine payment fetch based on event status
        let paymentsPromise;
        if (user.eventStart && user.eventEnd && new Date(user.eventEnd) > new Date()) {
          // Active event - fetch payments from event start
          paymentsPromise = fetchpayments(user._id, user.eventStart);
        } else {
          // No active event - try last completed event
          paymentsPromise = fetchEvents(user._id, 'history')
            .then(eventData => {
              if (eventData?.events?.length > 0) {
                const lastEvent = eventData.events[0];
                return lastEvent.startTime ? fetchpayments(user._id, lastEvent.startTime) : [];
              }
              return [];
            })
            .catch(() => []);
        }
        
        // Wait for both to complete in parallel
        const [_, userPayments] = await Promise.all([eventPromise, paymentsPromise]);
        
        setPayments(userPayments || []);
      } else {
        console.error("User not found");
        setPayments([]);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Could not load profile data.");
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
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

  // Auto-close FamPoints popup after 3 seconds
  useEffect(() => {
    if (showFamPointsPopup) {
      const timer = setTimeout(() => {
        setShowFamPointsPopup(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showFamPointsPopup]);


  
  // Countdown timer effect - watch both currentUser.eventEnd and currentEvent
  useEffect(() => {
    // Use currentEvent.endTime as fallback if currentUser.eventEnd not set yet
    const eventEndTime = currentUser?.eventEnd || currentEvent?.endTime;
    
    if (eventEndTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const end = new Date(eventEndTime);
        const diff = end - now;

        if (diff <= 0) {
          clearInterval(interval);
          setTimeLeft(null);
          setCurrentEvent(null); // Clear current event state
          
          // Event has expired - automatically end it
          console.log('Event expired, automatically ending...');
          
          // Update the backend first
          updateProfile({ 
            eventStart: null, 
            eventEnd: null 
          }, username).then(() => {
            // Clear the user's event fields after successful backend update
            setcurrentUser(prevUser => ({ 
              ...prevUser, 
              eventStart: null, 
              eventEnd: null 
            }));
          }).catch(error => {
            console.error('Error clearing expired event fields:', error);
          });
          
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(null);
    }
  }, [currentUser?.eventEnd, currentEvent, username]);

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
    const res = await updateProfile({ 
      email: currentUser.email, 
      perk: currentUser.perk,
      perkRank: currentUser.perkRank || 5
    }, username);
    if (!res?.error) toast.success("Perk saved!");
  };

  const handleStartEvent = async () => {
    // Show beta popup first
    setShowBetaPopup(true);
  };

  const proceedWithEventStart = async () => {
    try {
      const durationMs = Number(eventDuration) * 24 * 60 * 60 * 1000;
      const start = new Date();
      const end = new Date(start.getTime() + durationMs);
      
      // First, create the event in the database
      const eventData = {
        title: 'Event', // Default title since you don't use titles
        perkDescription: currentUser.perk || 'No perk description',
        startTime: start,
        endTime: end
      };
      
      console.log('Creating event with data:', eventData);
      const createdEvent = await createEvent(eventData);
      console.log('Event created successfully:', createdEvent._id);
      
      // Set currentEvent state immediately
      setCurrentEvent(createdEvent);
      
      // Then update the user profile with event times
      const res = await updateProfile(
        { eventStart: start, eventEnd: end },
        username
      );
      
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Event started!");
        // Use functional update to avoid stale closure issues
        setcurrentUser(prevUser => ({ ...prevUser, eventStart: start, eventEnd: end }));
        
        // Clear previous event's payments when starting a new event
        setPayments([]);
        
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
    } catch (error) {
      console.error('Error starting event:', error);
      toast.error(error.message || 'Failed to start event');
    } finally {
      // Close the popup regardless of success or failure
      setShowBetaPopup(false);
    }
  };

  const handleEndEvent = async () => {
    try {
      console.log('=== STARTING END EVENT PROCESS ===');
      console.log('Current user ID:', currentUser._id);
      
      // First, find and end the active event in the database
      try {
        // Get the current active event for this user using the server action
        console.log('Fetching current active event...');
        const activeEvent = await fetchEvents(currentUser._id, 'current');
        console.log('Found active event:', activeEvent);
        
        if (activeEvent && activeEvent._id) {
          console.log('Ending event with ID:', activeEvent._id);
          const endedEvent = await endEvent(activeEvent._id);
          console.log('Event ended successfully:', endedEvent);
          setCurrentEvent(null); // Clear current event state
          toast.success("Event ended successfully!");
        } else {
          console.log('No active event found in database');
          toast.warn("No active event found to end.");
        }
      } catch (error) {
        console.error('Error ending event in database:', error);
        toast.error(`Failed to end event: ${error.message}`);
        // Don't continue if database update fails
        return;
      }
      
      // Then clear the user profile event fields
      console.log('Clearing user profile event fields...');
      const res = await updateProfile({ eventStart: null, eventEnd: null }, username);
      if (res?.error) {
        toast.error(res.error);
      } else {
        console.log('User profile updated successfully');
        setcurrentUser(prevUser => ({ ...prevUser, eventStart: null, eventEnd: null }));
        // Keep showing the leaderboard from the ended event
        // Don't clear payments - they'll remain from the last event
      }
    } catch (error) {
      console.error('Error ending event:', error);
      toast.error(error.message || 'Failed to end event');
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
    try {
      if (!paymentform.amount || Number(paymentform.amount) <= 0) {
        toast.error("Please enter a valid amount to donate.");
        throw new Error("Invalid amount");
      }
      if (!userId) {
        toast.error("User not loaded.");
        throw new Error("User not loaded");
      }
      
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
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
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
      setHasError(true);
      toast.error("Failed to create payment order.");
      throw error;
    }
  };

  const onApprove = async (data, actions) => {
    setIsPaying(true);
    try {
      return actions.order.capture().then(async (details) => {
        try {
          const paymentDetails = {
            payerName: paymentform.name,
            message: paymentform.message,
            amount: details.purchase_units[0].amount.value,
            orderID: data.orderID,
            timestamp: new Date().toISOString(),
            to_user: userId,
          };

          // Send capture details to backend for saving
          // Pass the donor name from the form for both ranked and unranked
          const res = await savePayment(paymentDetails, details, currentEvent, paymentform.name);

          if (res.success) {
            // Emit global payment success event for navbar updates
            emitPaymentSuccess({ pointsAwarded: res.pointsAwarded });

            // Update points in the navbar immediately (legacy support)
            if (updatePoints) {
              updatePoints();
            }

            // Refetch payments and update leaderboard in real-time for RANKED donations only
            if (res.type === 'ranked' && currentUser.eventStart) {
              setPaymentsLoading(true);
              try {
                const updatedPayments = await fetchpayments(userId, currentUser.eventStart);
                setPayments(updatedPayments || []);
              } catch (error) {
                console.error('Error refreshing payments:', error);
              } finally {
                setPaymentsLoading(false);
              }
            }
            
            // Show FamPoints popup ONLY if points >= 1 (payment >= $10)
            if (res.pointsAwarded && res.pointsAwarded >= 1) {
              setEarnedFamPoints(res.pointsAwarded);
              setShowFamPointsPopup(true);
            }
            
            // Reset payment form for next contribution
            setPaymentform({
              name: session?.user?.name || "",
              message: "",
              amount: ""
            });
            
            // Don't redirect - stay on payment page to show updated leaderboard
          } else {
            toast.error("Payment failed. Please contact support.");
          }
        } catch (error) {
          console.error('Error processing payment completion:', error);
          setHasError(true);
          toast.error("Payment processing failed. Please contact support.");
        }
      });
    } catch (error) {
      console.error('Error in onApprove:', error);
      setHasError(true);
      toast.error("Payment processing failed. Please try again.");
    } finally {
      setIsPaying(false);
    }
  };
    
  // Check if event is active - use currentEvent as primary source of truth
  const isEventActive = currentEvent !== null || (currentUser?.eventStart && currentUser?.eventEnd && new Date(currentUser.eventEnd) > new Date());

  // FamPoints Celebration Popup Component
  const FamPointsPopup = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10000] flex items-center justify-center p-4" style={{ animation: 'fadeIn 0.3s ease-out forwards' }}>
      <div className="bg-gradient-to-br from-background to-dropdown-hover rounded-2xl border-2 border-primary/30 shadow-2xl max-w-md w-full mx-4 overflow-hidden" style={{ animation: 'scaleIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards' }}>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary/20 to-yellow-500/20 p-8 text-center border-b border-primary/10">
          <div className="text-6xl mb-3">🎉</div>
          <h2 className="text-2xl font-bold text-primary mb-1">Congratulations!</h2>
        </div>
        
        {/* Content */}
        <div className="relative p-8 text-center">
          <p className="text-text/80 text-lg mb-6">
            You have received
          </p>
          
          {/* FamPoints Display */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center gap-3">
              <span className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {earnedFamPoints}
              </span>
              <div className="flex flex-col items-start">
                <span className="text-3xl">🪙</span>
                <span className="text-sm text-text/60 font-medium">FamPoints</span>
              </div>
            </div>
          </div>
          
          <p className="text-text/70 text-sm leading-relaxed">
            Keep earning FamPoints with every contribution to unlock exclusive perks and rewards!
          </p>
        </div>
        
        {/* Auto-close indicator */}
        <div className="px-8 pb-6 text-center">
          <div className="h-1 bg-text/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-yellow-500" style={{ animation: 'progressBar 3s linear forwards' }}></div>
          </div>
          <p className="text-text/40 text-xs mt-2">Redirecting...</p>
        </div>
      </div>
    </div>
  );

  // Beta Popup Component
  const BetaPopup = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl border border-text/10 shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 p-6 text-center border-b border-text/5">
          <div className="text-3xl mb-2">🚧</div>
          <h2 className="text-xl font-bold text-text mb-1">We're Currently in Beta</h2>
          <p className="text-primary text-sm font-medium">Thank you for checking out Sygil! 🎉</p>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-text/80 text-sm leading-relaxed">
            Right now, we're in the development & testing phase. Our payment gateway is still in test mode, which means transactions will not be processed for real earnings yet.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-orange-400 text-sm mt-0.5">👉</span>
              <p className="text-text/70 text-sm leading-relaxed">
                Please do not start creating or sharing your Sygil page with fans at this stage, as it is not live or active for public use.
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-orange-400 text-sm mt-0.5">👉</span>
              <p className="text-text/70 text-sm leading-relaxed">
                We're actively onboarding creators and gathering feedback to make the platform stronger before launch.
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-orange-400 text-sm mt-0.5">👉</span>
              <p className="text-text/70 text-sm leading-relaxed">
                Once we go live, you'll be the first to know and can start hosting events, earning instantly, and sharing your page with your community.
              </p>
            </div>
          </div>
          
          <div className="bg-primary/5 rounded-lg p-4 mt-4">
            <p className="text-text/80 text-sm leading-relaxed">
              We truly appreciate your patience and support as an early creator — your feedback will help shape Sygil into the go-to platform for fan-powered growth. 💜
            </p>
          </div>
          
          <div className="text-center pt-2">
            <p className="text-text/60 text-xs font-medium">— Team Sygil</p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="bg-background/50 p-4 flex gap-3">
          <button
            onClick={() => setShowBetaPopup(false)}
            className="flex-1 px-4 py-2.5 rounded-lg border border-text/20 text-text/70 hover:bg-text/5 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={proceedWithEventStart}
            className="flex-1 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white transition-colors text-sm font-medium"
          >
            Continue Testing
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* FamPoints Celebration Popup */}
      {showFamPointsPopup && <FamPointsPopup />}
      
      {/* Beta Popup */}
      {showBetaPopup && <BetaPopup />}
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
          setShowBetaPopup={setShowBetaPopup}
        />
        
        {/* NEW TAB NAVIGATION UI - Replaces the old InteractionSection placement */}
        <div className="w-full max-w-5xl mt-8 border-b border-text/10">
          <div className="flex justify-center items-center gap-6">
            <button
              onClick={() => handleTabChange('contribute')}
              className={`px-4 py-3 text-lg font-medium tracking-wide transition-all duration-200 ${
                activeTab === 'contribute'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text/60 hover:text-text border-b-2 border-transparent'
              }`}
            >
              Contribute
            </button>
            <button
              onClick={() => handleTabChange('vault')}
              className={`px-4 py-3 text-lg font-medium tracking-wide transition-all duration-200 ${
                activeTab === 'vault'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text/60 hover:text-text border-b-2 border-transparent'
              }`}
            >
               Vault
            </button>
             {/* Links */}
            <button
              onClick={() => handleTabChange('links')}
              className={`px-4 py-3 text-lg font-medium tracking-wide transition-all duration-200 ${
                activeTab === 'links'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text/60 hover:text-text border-b-2 border-transparent'
              }`}
            >
              Links
            </button>
            {/* Community */}
            <button
              onClick={() => handleTabChange('community')}
              className={`px-4 py-3 text-lg font-medium tracking-wide transition-all duration-200 ${
                activeTab === 'community'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text/60 hover:text-text border-b-2 border-transparent'
              }`}
            >
              Community
            </button>
           
            <button
              onClick={() => handleTabChange('merchandise')}
              className={`px-4 py-3 text-lg font-medium tracking-wide transition-all duration-200 ${
                activeTab === 'merchandise'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text/60 hover:text-text border-b-2 border-transparent'
              }`}
            >
              Merchandise
            </button>
            {/* COMMENTED OUT - Giveaway section temporarily hidden */}
            {/* <button
              onClick={() => setActiveTab('giveaway')}
              className={`px-4 py-3 text-lg font-medium tracking-wide transition-all duration-200 ${
                activeTab === 'giveaway'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text/60 hover:text-text border-b-2 border-transparent'
              }`}
            >
              Giveaway
            </button> */}
          </div>
        </div>

        {/* Conditionally Rendered Content */}
        <div className="w-full flex justify-center">
          {activeTab === 'contribute' && (
            <>
              {!hasError ? (
                <ErrorBoundary>
                  <PaymentInteractionSection
                    session={session}
                    isEventActive={isEventActive}
                    payments={payments}
                    paymentsLoading={paymentsLoading}
                    isPaying={isPaying}
                    paymentform={paymentform}
                    handleChange={handleChange}
                    createOrder={createOrder}
                    onApprove={onApprove}
                    router={router}
                    currentUser={currentUser}
                    setPaymentform={setPaymentform}
                  />
                </ErrorBoundary>
              ) : (
                <div className="w-full max-w-5xl mt-8 flex justify-center">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-medium text-red-400 mb-2">Payment System Unavailable</h3>
                    <p className="text-red-300 mb-4">We're experiencing technical difficulties with our payment system. Please try again later.</p>
                    <button 
                      onClick={() => {
                        setHasError(false);
                        window.location.reload();
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'vault' && (
            <VaultSection currentUser={currentUser} />
          )}

          {activeTab === 'community' && (
            <CommunitySection />
          )}

          {activeTab === 'links' && (
            <LinksSection currentUser={currentUser} />
          )}

          {activeTab === 'merchandise' && (
            <MerchandiseSection />
          )}

          {/* COMMENTED OUT - Giveaway section temporarily hidden */}
          {/* {activeTab === 'giveaway' && (
            <GiveawaySection />
          )} */}
        </div>

                  {activeTab === 'contribute' && (
 <div className="mt-6 text-center p-4 bg-dropdown-hover rounded-lg">
      
       
          <p className="text-success text-sm font-medium">
            💡 Multiple donations stack up! Keep contributing to climb higher on the leaderboard.
          </p>
                </div>   )}


      </div>
    </>
  );
};

export default PaymentPage;
