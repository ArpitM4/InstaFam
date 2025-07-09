"use client";
import React, { useEffect, useState } from "react";
import Script from "next/script";
import { useSession } from "next-auth/react";
import Razorpay from "razorpay";
import "../app/globals.css";
import { FaUserCircle } from "react-icons/fa";
import { fetchuser, fetchpayments, initiate } from "@/actions/useractions";
import { useSearchParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Bounce } from "react-toastify";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { updateProfile } from "@/actions/useractions";



// In your return JSX:

const PaymentPage = ({ username }) => {
  const { data: session } = useSession()
  const isOwner = session?.user?.name === username;
  
  
  const [paymentform, setPaymentform] = useState({
    name: "",
    message: "",
    amount: "",
  });
  const [currentUser, setcurrentUser] = useState({});
  const [payments, setPayments] = useState([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  useEffect(() => {
    getData();
  }, []);
  
  useEffect(() => {
    if (session?.user?.name) {
      setPaymentform((prev) => ({
        ...prev,
        name: session.user.name,
      }));
    }
  }, [session]);
  // console.log("hey",)
  
  useEffect(() => {
    if (searchParams.get("paymentdone") == "true") {
      toast("Thanks for your donation!", {
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
    }
    router.push(`/${username}`);
  }, []);
  
  const handleChange = (e) => {
    setPaymentform({ ...paymentform, [e.target.name]: e.target.value });
  };
  
  const [isEditing, setIsEditing] = useState(false);

const getData = async () => {
  let u = await fetchuser(username);
  setcurrentUser(u);

  const payments = await fetchpayments(username, u?.eventStart);
  setPayments(payments);
};


  const pay = async (amount) => {
    if (
      typeof window === "undefined" ||
      typeof window.Razorpay === "undefined"
    ) {
      toast.error("Razorpay SDK not loaded yet.");
      return;
    }

    let a = await initiate(amount, username, paymentform);
    let orderId = a.id;

    const options = {
      key_id: process.env.NEXT_PUBLIC_KEY_ID,
      key: process.env.NEXT_PUBLIC_KEY_ID,
      amount: amount,
      currency: "INR",
      name: "InstaFam",
      description: "Test Transaction",
      image: "https://example.com/your_logo",
      order_id: orderId,
      callback_url: `${process.env.NEXT_PUBLIC_URL}/api/razorpay`,
      prefill: {
        name: "Arpit Maurya",
        email: "gaurav.kumar@example.com",
        contact: "9000090000",
      },
      notes: {
        address: "Razorpay Corporate Office",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };

// TIMER 
const [timeLeft, setTimeLeft] = useState(null);

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

        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0 || days > 0) parts.push(`${hours}h`);
        if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
        parts.push(`${seconds}s`);

        setTimeLeft(parts.join(" "));
      }
    }, 1000);

    return () => clearInterval(interval);
  }
}, [currentUser.eventEnd]);


//EVENT


const [eventDuration, setEventDuration] = useState(""); // ← Fixes the error
const handleStartEvent = async () => {
const durationMs = Number(eventDuration) * 24 * 60 * 60 * 1000; // days → ms
  const start = new Date();
  const end = new Date(Date.now() + durationMs);

  const res = await updateProfile(
    {
      email: currentUser.email,
      eventStart: start,
      eventEnd: end,
      perk: currentUser.perk,
    },
    username
  );

  if (res?.error) {
    toast.error(res.error);
  } else {
    toast.success("Event started!");
    setcurrentUser({ ...currentUser, eventStart: start, eventEnd: end });
  }
};

const handleEndEvent = async () => {
  const res = await updateProfile(
    {
      email: currentUser.email,
      eventStart: null,
      eventEnd: null,
    },
    username
  );

  if (res?.error) {
    toast.error(res.error);
  } else {
    toast.success("Event ended!");
    setcurrentUser({ ...currentUser, eventStart: null, eventEnd: null });
  }
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
    />

    <Script
      src="https://checkout.razorpay.com/v1/checkout.js"
      strategy="beforeInteractive"
    />

    <div className="min-h-screen bg-black flex flex-col items-center py-12 px-2">
      {/* Banner */}
      <div
        className="relative mt-3 w-full max-w-full h-64 shadow-md"
        style={{
          backgroundImage: `url(${currentUser?.coverpic || "https://picsum.photos/1600/400"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center transform translate-y-1/3">
          <div className="w-32 h-32 bg-white rounded-full shadow-lg border-4 border-white">
            <img
              src={currentUser?.profilepic || "https://picsum.photos/200"}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Profile Info Box */}
      <div className="relative mt-20 w-full max-w-md mx-auto p-6 bg-white/10 border border-white/20 backdrop-blur-md shadow-md rounded-lg">
  <h1 className="text-xl font-bold text-white text-center">@{username}</h1>

  {/* Description */}
  {isOwner ? (
    <>
      <textarea
        className="w-full mt-2 bg-black border border-white/20 text-white text-sm text-center rounded p-2 resize-none focus:ring-2 focus:ring-[#fb0582] outline-none"
        value={currentUser.description || ""}
        onFocus={() => setIsEditing(true)}
        onChange={(e) =>
          setcurrentUser({ ...currentUser, description: e.target.value })
        }
      />
      {isEditing && (
        <button
          onClick={async () => {
            const res = await updateProfile(
              { email: currentUser.email, description: currentUser.description },
              username
            );
            if (res?.error) toast.error(res.error);
            else {
              toast.success("Description updated successfully!");
              setIsEditing(false);
            }
          }}
          className="mt-2 bg-[#fb0582] hover:bg-[#e10475] text-white px-4 py-2 rounded text-sm font-semibold"
        >
          Save Description
        </button>
      )}
    </>
  ) : (
    <p className="text-sm text-white/70 text-center mt-2">
      {currentUser.description}
    </p>
  )}

  {/* Perk + Leaderboard */}
  {(currentUser.perk || payments.length > 0) && (
    <div className="mt-6 bg-white/5 border border-white/20 p-4 rounded-lg">
      {currentUser.perk && (
        <div className="text-white/90 text-sm text-center mb-3">
          🎁 <span className="font-semibold text-[#fcca03]">Top 5 Donor Perk:</span> {currentUser.perk}
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
        onChange={(e) =>
          setcurrentUser({ ...currentUser, perk: e.target.value })
        }
        onBlur={async () => {
          const res = await updateProfile(
            { email: currentUser.email, perk: currentUser.perk },
            username
          );
          if (!res?.error) toast.success("Perk saved!");
        }}
        placeholder="Set your perk for top donors"
        className="w-full px-3 py-2 bg-black border border-white/20 text-white rounded focus:ring-2 focus:ring-[#fb0582] outline-none"
      />

     <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
  <input
    type="number"
    placeholder="Duration in days"
    value={eventDuration}
    onChange={(e) => setEventDuration(e.target.value)}
    className="w-full sm:min-w-[180px] sm:flex-1 px-3 py-2 bg-black border border-white/20 text-white rounded focus:ring-2 focus:ring-[#fb0582] outline-none"
  />

  <button
    onClick={handleStartEvent}
    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-semibold"
  >
    Start Event
  </button>

  <button
    onClick={handleEndEvent}
    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-semibold"
  >
    End Event
  </button>
</div>


    </div>
  )}

  {/* Event Timer */}
  {currentUser.eventEnd && timeLeft && (
    <div className="mt-4 text-center bg-[#1f1f1f] border border-[#fb0582]/30 text-white/80 text-sm py-2 px-3 rounded-md shadow-sm">
      ⏳ <span className="font-semibold text-[#fb0582]">Event is live!</span> Ends in: <span className="font-semibold">{timeLeft}</span>
    </div>
  )}
</div>





    <div className="w-full max-w-5xl mt-12 flex flex-col md:flex-row gap-8 px-2">
      {/* Leaderboard */}
<div className={`flex-1 bg-white/10 border border-white/20 text-white rounded-lg shadow-md p-6 mx-2 md:mx-0 ${!isEventActive ? "opacity-40 pointer-events-none" : ""}`}>
  <h2 className="text-2xl font-bold mb-4 text-[#dddbff]">Leaderboard</h2>
  {payments.length === 0 ? (
    <p className="text-gray-300">No payments yet</p>
  ) : (
    <ol className="list-decimal list-inside text-white/80 space-y-2">
      {Object.entries(
        payments.reduce((acc, p) => {
          acc[p.name] = (acc[p.name] || 0) + p.amount;
          return acc;
        }, {})
      ).map(([name, total], i) => (
        <li key={i} className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaUserCircle className="text-[#fcca03] text-2xl" />
            <span>{name}</span>
          </div>
          <span className="text-white font-medium">₹{total}</span>
        </li>
      ))}
    </ol>
  )}
</div>

{/* Donation Form */}
<div className={`flex-1 bg-white/10 border border-white/20 text-white rounded-lg shadow-md p-6 mx-2 md:mx-0 ${!isEventActive ? "opacity-40 pointer-events-none" : ""}`}>
  <h2 className="text-2xl font-bold mb-4 text-[#dddbff]">Donate</h2>
  <form className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-1">Your Name</label>
      <input
        type="text"
        name="name"
        value={session?.user?.name || ""}
        readOnly
        className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-white/20 cursor-not-allowed"
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Message</label>
      <textarea
        name="message"
        onChange={handleChange}
        value={paymentform.message}
        placeholder="Write a message..."
        rows="3"
        className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:ring-2 focus:ring-[#fb0582] outline-none"
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Amount</label>
      <input
        type="number"
        name="amount"
        value={paymentform.amount}
        onChange={handleChange}
        placeholder="Enter amount"
        className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:ring-2 focus:ring-[#fb0582] outline-none"
      />
    </div>

    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        pay(Number.parseInt(paymentform.amount));
      }}
      className="w-full bg-[#fb0582] hover:bg-[#e10475] transition text-white font-semibold py-2 rounded-md"
    >
      Pay
    </button>
  </form>
</div>


      </div>
    </div>
  </>
);

};

export default PaymentPage;
