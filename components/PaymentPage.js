"use client";

import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { FaSpinner } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { FaPen, FaEye } from "react-icons/fa";
import "../app/globals.css"; // Assuming your global styles are here

import { fetchuser, fetchpayments, updateProfile, createEvent, endEvent, fetchEvents } from "@/actions/useractions";
import { getCreatorPoints } from "@/actions/pointsActions";
import { useUser } from "@/context/UserContext";
import { emitPaymentSuccess } from "@/utils/eventBus";
import PaymentProfileSection from "./PaymentProfileSection";
import ErrorBoundary from "./ErrorBoundary";
import VisibilityToggle from "./VisibilityToggle";
import CreatorOnboardingGuide from "./CreatorOnboardingGuide";

import PaymentInteractionSection from "./PaymentInteractionSection";
import ShareModal from "./ShareModal";

const VaultSection = dynamic(() => import("./VaultSection"), {
  loading: () => <div className="w-full max-w-5xl mt-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
});

const LinksSection = dynamic(() => import("./LinksSection"), {
  loading: () => <div className="w-full max-w-5xl mt-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
});

const MerchandiseSection = dynamic(() => import("./MerchandiseSection"), {
  loading: () => <div className="w-full max-w-5xl mt-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
});

const GiveawaySection = dynamic(() => import("./GiveawaySection"), {
  loading: () => <div className="w-full max-w-5xl mt-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
});

const CommunitySection = dynamic(() => import("./CommunitySection"), {
  loading: () => <div className="w-full max-w-5xl mt-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
});

// PayPal imports moved to PaymentInteractionSection to avoid loading on non-payment tabs
// PayPal imports moved to PaymentInteractionSection to avoid loading on non-payment tabs

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
          toast.success("Thank you for your support! ❤️ You're on the leaderboard! 🏆");
        } else {
          toast.success("Contribution successful! Thank you for your support! ❤️");
        }
        return { success: true, paymentId: data.paymentId, type: data.type, pointsAwarded: data.pointsAwarded || 0 };
      } else {
        const errorMsg = data.capture && data.capture.status ? `Payment status: ${data.capture.status}` : (data.error || "Payment failed.");
        toast.error(`Payment error: ${errorMsg}`);
        return { success: false, message: errorMsg };
      }
    } else {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
  } catch (err) {
    console.error('Error saving payment:', err);
    toast.error('Error saving payment.');
    return { success: false, message: 'Error saving payment.' };
  }
}
// --- End Mock Action Functions ---


const PaymentPage = ({ username, initialUser, initialVaultItems, initialTab = 'links' }) => {
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
  const [currentUser, setcurrentUser] = useState(initialUser || {});
  const [userId, setUserId] = useState(initialUser?._id || null);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentform, setPaymentform] = useState({ name: "", message: "", amount: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [eventDuration, setEventDuration] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);

  // Memoize computed values for performance
  const isActualOwner = useMemo(() => session?.user?.name === username, [session?.user?.name, username]);

  const isOwner = useMemo(() => {
    const isPreviewMode = searchParams?.get('viewAs') === 'public';
    return isActualOwner && !isPreviewMode;
  }, [isActualOwner, searchParams]);

  // Sync activeTab with URL path
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const section = pathParts[pathParts.length - 1];

    const validSections = ['contribute', 'vault', 'community', 'links', 'merchandise', 'subscription', 'courses', 'giveaway'];

    if (validSections.includes(section)) {
      // Force 'links' tab if user is not owner and trying to access restricted sections
      // We check isActualOwner first to avoid hydration mismatch, but effect runs on client
      if (!isOwner && section !== 'links') {
        setActiveTab('links');
      } else {
        setActiveTab(section);
      }
    } else if (pathParts.length === 2 || section === username) {
      // Default to 'links' when on base username page
      setActiveTab('links');
    }
  }, [searchParams, username, isOwner]);

  // Update URL when tab changes - use replaceState to avoid page reload
  const handleTabChange = (tab) => {
    // Set active tab FIRST for immediate UI feedback
    setActiveTab(tab);

    // Update URL in browser without navigation (no page reload)
    const newUrl = tab === 'links' ? `/${username}` : `/${username}/${tab}`;
    window.history.replaceState(null, '', newUrl);
  };

  const handleOpenCustomize = () => {
    setTempVisibleSections([...visibleSections]);
    setShowCustomizeModal(true);
  };

  const handleToggleSection = (section) => {
    setTempVisibleSections(prev => {
      if (prev.includes(section)) {
        // If disabling vault, also remove contribute
        if (section === 'vault') {
          return prev.filter(s => s !== section && s !== 'contribute');
        }
        return prev.filter(s => s !== section);
      } else {
        // If enabling contribute, also enable vault
        if (section === 'contribute') {
          const newSections = [...prev, section];
          if (!newSections.includes('vault')) {
            newSections.push('vault');
          }
          return newSections;
        }
        return [...prev, section];
      }
    });
  };

  const handleSaveCustomization = async () => {
    try {
      const response = await fetch('/api/customize-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibleSections: tempVisibleSections })
      });

      if (response.ok) {
        const data = await response.json();
        setVisibleSections(data.visibleSections);
        setShowCustomizeModal(false);
        toast.success('Page customization saved!');
      } else {
        toast.error('Failed to save customization');
      }
    } catch (error) {
      console.error('Error saving customization:', error);
      toast.error('Failed to save customization');
    }
  };
  const [hasError, setHasError] = useState(false);
  const [showBetaPopup, setShowBetaPopup] = useState(false);
  const [showFamPointsPopup, setShowFamPointsPopup] = useState(false);
  const [earnedFamPoints, setEarnedFamPoints] = useState(0);
  const [fanPoints, setFanPoints] = useState(0); // Points for current logged-in fan for this creator
  const [canEarnBonus, setCanEarnBonus] = useState(false);
  const [visibleSections, setVisibleSections] = useState(['contribute', 'vault', 'links']);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [tempVisibleSections, setTempVisibleSections] = useState([]);

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);



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

          // Return the event so caller can use it immediately
          return data.event;
        } else {
          console.log('No active event found');
          setCurrentEvent(null);
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error("Error fetching active event:", error);
      setCurrentEvent(null);
      return null;
    }
  };

  const fetchVisibleSections = useCallback(async () => {
    try {
      const response = await fetch(`/api/customize-sections?username=${username}`);
      if (response.ok) {
        const data = await response.json();
        setVisibleSections(data.visibleSections || ['contribute', 'vault', 'links']);
      }
    } catch (error) {
      console.error('Error fetching visible sections:', error);
    }
  }, [username]);

  const getData = useCallback(async () => {
    setPaymentsLoading(true);
    try {
      // Fetch user, event, and visible sections in parallel
      // Use initialUser if available to match current username, otherwise fetch
      const userPromise = (initialUser && initialUser.username === username)
        ? Promise.resolve(initialUser)
        : fetchuser(username);
      const eventPromise = fetchActiveEvent();
      const sectionsPromise = fetchVisibleSections();

      const [user, activeEvent] = await Promise.all([userPromise, eventPromise, sectionsPromise]);

      if (user) {
        setUserId(user._id);

        // Sync user state with event data if active event exists
        if (activeEvent) {
          const eventStart = new Date(activeEvent.startTime);
          const eventEnd = new Date(activeEvent.endTime);

          setcurrentUser({
            ...user,
            eventStart: eventStart,
            eventEnd: eventEnd
          });

          // Fetch payments based on ACTIVE EVENT data
          if (eventEnd > new Date()) {
            console.log('Fetching payments for active event:', activeEvent._id);
            const paymentsData = await fetchpayments(user._id, eventStart);
            setPayments(paymentsData || []);
          } else {
            console.log('Event has ended');
            setPayments([]);
          }
        } else {
          // No active event - set user and check for past events
          setcurrentUser(user);

          if (user.eventStart && user.eventEnd && new Date(user.eventEnd) > new Date()) {
            // User has valid event fields (shouldn't happen without active event, but handle it)
            console.log('Fetching payments based on user event fields');
            const paymentsData = await fetchpayments(user._id, new Date(user.eventStart));
            setPayments(paymentsData || []);
          } else {
            // Try to fetch last completed event's payments
            try {
              const eventData = await fetchEvents(user._id, 'history');
              if (eventData?.events?.length > 0) {
                const lastEvent = eventData.events[0];
                if (lastEvent.startTime) {
                  const paymentsData = await fetchpayments(user._id, lastEvent.startTime);
                  setPayments(paymentsData || []);
                } else {
                  setPayments([]);
                }
              } else {
                setPayments([]);
              }
            } catch {
              setPayments([]);
            }
          }
        }
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

  // Fetch fan's FamPoints for this creator
  // Fetch fan's FamPoints for this creator
  const loadFanPoints = useCallback(async () => {
    if (currentUser?._id && !isOwner) {
      try {
        const res = await getCreatorPoints(currentUser._id);
        if (res.success) {
          setFanPoints(res.points);
          setCanEarnBonus(res.canEarnBonus);
        }
      } catch (error) {
        console.error('Error fetching fan points:', error);
      }
    }
  }, [currentUser?._id, isOwner]);

  useEffect(() => {
    loadFanPoints();
  }, [loadFanPoints, session]); // Re-fetch on session change

  // Check onboarding status for page owner
  useEffect(() => {
    const checkOnboarding = async () => {
      // Only check for owner with hidden page who hasn't completed onboarding
      if (isOwner && currentUser?.visibility === "hidden") {
        try {
          const response = await fetch("/api/onboarding");
          if (response.ok) {
            const data = await response.json();
            // Show onboarding only if not completed
            if (!data.onboardingCompleted) {
              setShowOnboarding(true);
            }
          }
        } catch (error) {
          console.error("Error checking onboarding status:", error);
        }
      }
    };
    if (currentUser?._id) {
      checkOnboarding();
    }
  }, [isOwner, currentUser?.visibility, currentUser?._id]);

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

  // --- Event Handlers (memoized with useCallback for performance) ---
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setPaymentform(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSaveDescription = useCallback(async () => {
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
  }, [currentUser?.email, currentUser?.description, username]);

  const handleSavePerk = useCallback(async () => {
    const res = await updateProfile({
      email: currentUser.email,
      perk: currentUser.perk,
      perkRank: currentUser.perkRank || 5
    }, username);
    if (!res?.error) toast.success("Perk saved!");
  }, [currentUser?.email, currentUser?.perk, currentUser?.perkRank, username]);

  const handleStartEvent = useCallback(async () => {
    // Show beta popup first
    setShowBetaPopup(true);
  }, []);

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
      const uploadedUrl = data.url || data.secure_url;
      if (data.success && uploadedUrl) {
        setcurrentUser((prev) => ({ ...prev, profilepic: uploadedUrl }));
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
      const uploadedUrl = data.url || data.secure_url;
      if (data.success && uploadedUrl) {
        setcurrentUser((prev) => ({ ...prev, coverpic: uploadedUrl }));
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

  // Check if event is active - use currentEvent as primary source of truth (memoized)
  const isEventActive = useMemo(() => {
    return currentEvent !== null || (currentUser?.eventStart && currentUser?.eventEnd && new Date(currentUser.eventEnd) > new Date());
  }, [currentEvent, currentUser?.eventStart, currentUser?.eventEnd]);

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
            className="btn-gradient flex-1 px-4 py-2.5 rounded-lg text-white transition-all text-sm font-medium shadow-md hover:scale-[1.04] hover:brightness-110 border-0"
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

      {/* Creator Onboarding Guide */}
      {showOnboarding && isOwner && (
        <CreatorOnboardingGuide
          hasProfilePic={!!currentUser?.profilepic}
          hasCoverPic={!!currentUser?.coverpic}
          hasSocialLinks={currentUser?.socials && currentUser.socials.length > 0}
          onComplete={() => {
            setShowOnboarding(false);
            setShowShareModal(true);
          }}
        />
      )}
      <div id="thisone" className="min-h-screen text-text flex flex-col items-center pb-36 relative overflow-x-hidden" style={{ backgroundColor: 'var(--background-creator)' }}>
        {/* Radial gradient background overlay */}
        <div className="absolute inset-0 -z-10 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(225,29,72,0.4) 0%, rgba(99,102,241,0.3) 40%, #14141f 100%)' }} />
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
          fanPoints={fanPoints}
          canEarnBonus={canEarnBonus}
          onPointsUpdate={loadFanPoints}
        />

        {/* NEW TAB NAVIGATION UI - Replaces the old InteractionSection placement */}
        <div className="w-full max-w-5xl mt-12 border-b border-text/10">
          <div className="flex justify-center items-center gap-8 flex-wrap">
            {/* Dynamically render navigation buttons based on visibleSections */}
            {visibleSections.includes('links') && (
              <button
                onClick={() => handleTabChange('links')}
                className={`px-4 py-3 text-lg font-medium tracking-wide transition-all duration-200 ${activeTab === 'links'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text/60 hover:text-text border-b-2 border-transparent'
                  }`}
              >
                Links
              </button>
            )}

            {isOwner && visibleSections.includes('contribute') && (
              <button
                onClick={() => handleTabChange('contribute')}
                className={`px-4 py-3 text-lg font-medium tracking-wide transition-all duration-200 ${activeTab === 'contribute'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text/60 hover:text-text border-b-2 border-transparent'
                  }`}
              >
                Contribute
              </button>
            )}

            {isOwner && visibleSections.includes('vault') && (
              <button
                onClick={() => handleTabChange('vault')}
                className={`px-4 py-3 text-lg font-medium tracking-wide transition-all duration-200 ${activeTab === 'vault'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text/60 hover:text-text border-b-2 border-transparent'
                  }`}
              >
                Vault
              </button>
            )}



            {isOwner && visibleSections.includes('community') && (
              <button
                onClick={() => handleTabChange('community')}
                className={`px-4 py-3 text-lg font-medium tracking-wide transition-all duration-200 ${activeTab === 'community'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text/60 hover:text-text border-b-2 border-transparent'
                  }`}
              >
                Community
              </button>
            )}

            {isOwner && visibleSections.includes('merchandise') && (
              <button
                onClick={() => handleTabChange('merchandise')}
                className={`px-4 py-3 text-lg font-medium tracking-wide transition-all duration-200 ${activeTab === 'merchandise'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text/60 hover:text-text border-b-2 border-transparent'
                  }`}
              >
                Merchandise
              </button>
            )}

            {isOwner && visibleSections.includes('subscription') && (
              <button
                onClick={() => handleTabChange('subscription')}
                className={`px-4 py-3 text-lg font-medium tracking-wide transition-all duration-200 ${activeTab === 'subscription'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text/60 hover:text-text border-b-2 border-transparent'
                  }`}
              >
                Subscription
              </button>
            )}

            {isOwner && visibleSections.includes('courses') && (
              <button
                onClick={() => handleTabChange('courses')}
                className={`px-4 py-3 text-lg font-medium tracking-wide transition-all duration-200 ${activeTab === 'courses'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text/60 hover:text-text border-b-2 border-transparent'
                  }`}
              >
                Courses
              </button>
            )}

            {isOwner && visibleSections.includes('giveaway') && (
              <button
                onClick={() => handleTabChange('giveaway')}
                className={`px-4 py-3 text-lg font-medium tracking-wide transition-all duration-200 ${activeTab === 'giveaway'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text/60 hover:text-text border-b-2 border-transparent'
                  }`}
              >
                Giveaway
              </button>
            )}

            {/* Customizable button - only visible to page owner */}
            {isOwner && (
              <>
                <VisibilityToggle
                  isVisible={currentUser.visibility || "hidden"}
                  onToggle={(newVisibility) => setcurrentUser(prev => ({ ...prev, visibility: newVisibility }))}
                  onShareModal={() => setShowShareModal(true)}
                />
                <button
                  onClick={handleOpenCustomize}
                  className="px-4 py-3 text-lg font-medium tracking-wide transition-all duration-200 text-text/60 hover:text-primary border-b-2 border-transparent flex items-center gap-2"
                  title="Customize visible sections"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Conditionally Rendered Content */}
        <div className="w-full flex flex-col items-center">
          {/* Beta Mode Warning for Creators */}
          {isOwner && activeTab !== 'links' && (
            <div className="w-full max-w-5xl mb-6 px-4">
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center justify-center gap-3 backdrop-blur-sm">
                <span className="text-xl">🚧</span>
                <p className="text-yellow-200/90 text-sm font-medium text-center">
                  <strong className="text-yellow-400">Beta Mode:</strong> This tab is currently visible only to you. Public users cannot see this section yet.
                </p>
              </div>
            </div>
          )}

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
                    isOwner={isOwner}
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
            <div className="w-full max-w-5xl">
              {/* FamPoints Balance Box for fans (not owners) */}
              {session && !isOwner && fanPoints !== null && (
                <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🪙</span>
                    <div>
                      <p className="text-sm text-text/60">Your FamPoints Balance</p>
                      <p className="text-2xl font-bold text-yellow-400">{fanPoints} points</p>
                    </div>
                  </div>
                  <p className="text-xs text-text/50">Use these points to redeem vault items</p>
                </div>
              )}
              {/* Prompt to login for guests */}
              {!session && (
                <div className="mb-6 p-4 bg-white/5 border border-text/10 rounded-xl text-center">
                  <p className="text-text/60 text-sm">🔒 Login to see your FamPoints and redeem vault items</p>
                </div>
              )}
              <VaultSection currentUser={currentUser} initialItems={initialVaultItems} isOwner={isOwner} />
            </div>
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

          {activeTab === 'subscription' && (
            <div className="w-full max-w-5xl mt-8 flex justify-center">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-12 text-center border border-white/10 shadow-lg" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(225,29,72,0.10) 100%)' }}>
                <h2 className="text-2xl font-bold text-gradient-primary mb-2">Subscription</h2>
                <p className="text-primary text-lg font-semibold">Coming Soon</p>
                <p className="text-text/40 text-sm mt-2">Exclusive subscription tiers with special perks and content</p>
                <p className="text-text/40 text-sm mt-2">Get Discounts using FamPoints.</p>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="w-full max-w-5xl mt-8 flex justify-center">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-12 text-center border border-white/10 shadow-lg" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(225,29,72,0.10) 100%)' }}>
                <h2 className="text-2xl font-bold text-gradient-primary mb-2">Courses</h2>
                <p className="text-primary text-lg font-semibold">Coming Soon</p>
                <p className="text-text/40 text-sm mt-2">Educational courses and tutorials from your favorite creators</p>
                <p className="text-text/40 text-sm mt-2">Get Discounts using FamPoints.</p>
              </div>
            </div>
          )}

          {activeTab === 'giveaway' && (
            <div className="w-full max-w-5xl mt-8 flex justify-center">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-12 text-center border border-white/10 shadow-lg" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(225,29,72,0.10) 100%)' }}>
                <h2 className="text-2xl font-bold text-gradient-primary mb-2">Giveaway Picker</h2>
                <p className="text-primary text-lg font-semibold">Coming Soon</p>
                <p className="text-text/40 text-sm mt-2">Host giveaways and pick winners fairly using our picker tool</p>
                <p className="text-text/40 text-sm mt-2">Engage your community with exciting giveaways.</p>
              </div>
            </div>
          )}
        </div>

        {activeTab === 'contribute' && (
          <div className="mt-6 text-center p-4 bg-white/5 backdrop-blur-md rounded-lg shadow border border-white/10" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(225,29,72,0.10) 100%)' }}>


            <p className="text-success text-sm font-medium">
              💡 Multiple donations stack up! Keep contributing to climb higher on the leaderboard.
            </p>
          </div>)}


      </div>

      {/* Customization Modal */}
      {showCustomizeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 sm:p-6 md:p-8 max-w-md sm:max-w-lg md:max-w-2xl w-full border border-white/10 shadow-2xl my-8" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(225,29,72,0.10) 100%)' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-text flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">Customize Your Page</span>
                <span className="sm:hidden">Customize</span>
              </h2>
              <button
                onClick={() => setShowCustomizeModal(false)}
                className="text-text/60 hover:text-text transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-text/60 text-xs sm:text-sm mb-4">Select sections to display on your page.</p>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
              {/* Section checkboxes */}
              {[
                { id: 'contribute', name: 'Contribute', desc: 'Donations & leaderboard' },
                { id: 'vault', name: 'Vault', desc: 'Exclusive content' },
                { id: 'links', name: 'Links', desc: 'Social & products' },
                { id: 'merchandise', name: 'Merchandise', desc: 'Your merch' },
                { id: 'community', name: 'Community', desc: 'Engagement' },
                { id: 'subscription', name: 'Subscription', desc: 'Tiers & perks' },
                { id: 'courses', name: 'Courses', desc: 'Tutorials' },
                { id: 'giveaway', name: 'Giveaway', desc: 'Host giveaways' }
              ].map(section => (
                <label
                  key={section.id}
                  className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-background/50 rounded-lg hover:bg-background/70 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={tempVisibleSections.includes(section.id)}
                    onChange={() => handleToggleSection(section.id)}
                    className="mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5 rounded border-text/20 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-text text-sm sm:text-base">{section.name}</div>
                    <div className="text-xs sm:text-sm text-text/60 truncate">{section.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                onClick={() => setShowCustomizeModal(false)}
                className="flex-1 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-background text-text rounded-lg hover:bg-background/80 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomization}
                className="btn-gradient flex-1 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-white rounded-lg shadow-md hover:scale-[1.04] hover:brightness-110 transition-all font-medium border-0"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        username={username}
        title="Your Page is Ready!"
      />

      {/* Preview Button for Owners */}
      {isOwner && !showOnboarding && (
        <a
          href={`${typeof window !== 'undefined' ? window.location.pathname : ''}?viewAs=public`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-24 right-6 z-[9990] bg-black text-white px-6 py-3 rounded-full font-bold shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2 border border-white/10 hover:shadow-primary/20"
          title="See how your page looks to others"
        >
          <FaEye className="text-xl" />
          <span>Preview</span>
        </a>
      )}
    </>
  );
};

export default PaymentPage;
