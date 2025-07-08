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

// In your return JSX:

const PaymentPage = ({ username }) => {
  const { data: session } = useSession()

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

  const getData = async () => {
    let u = await fetchuser(username);
    setcurrentUser(u);
    let dbpayments = await fetchpayments(username);
    setPayments(dbpayments);
    // console.log("here",dbpayments,u)
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

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="beforeInteractive"
      />
     <div className="min-h-screen bg-black flex flex-col items-center py-12 px-2">
  {/* Banner */}
  <div
    className="relative mt-3 w-full max-w-full h-64 shadow-md"
    style={{
      backgroundImage: `url(${
        currentUser?.coverpic || "https://picsum.photos/1600/400"
      })`,
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
    <p className="text-sm text-white/70 text-center mt-2">Creating amazing content for the community</p>
    <div className="text-center mt-4">
      <p className="text-sm text-white">
        {/* <span className="font-semibold text-[#fb0582]">9,719</span> membersㅤ
        <span className="font-semibold text-[#fb0582]">82</span> postsㅤ
        <span className="font-semibold text-[#fdcc03]">₹15,450</span> */}
      </p>
    </div>
  </div>

  {/* Content Section */}
  <div className="w-full max-w-5xl mt-12 flex flex-col md:flex-row gap-8 px-2">
    {/* Leaderboard */}
    <div className="flex-1 bg-white/10 border border-white/20 text-white rounded-lg shadow-md p-6 mx-2 md:mx-0">
      <h2 className="text-2xl font-bold mb-4 text-[#dddbff]">Top Donations</h2>
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
    <div className="flex-1 bg-white/10 border border-white/20 text-white rounded-lg shadow-md p-6 mx-2 md:mx-0">
      <h2 className="text-2xl font-bold mb-4 text-[#dddbff]">Donate</h2>
      <form className="space-y-4">
        {/* Username */}
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

        {/* Message */}
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

        {/* Amount */}
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

        {/* Pay Button */}
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
