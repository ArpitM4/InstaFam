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
      <div className="min-h-screen bg-gradient-to-r from-purple-500 via-blue-900 to-pink-500 flex flex-col items-center  py-12">
        {/* Banner Section */}
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
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>

          <div className="absolute bottom-0 left-0 right-0 flex items-center z-10 justify-center transform translate-y-1/3">
            <div className="w-32 h-32 z-10 bg-white rounded-full shadow-lg border-4 border-white">
              <img
                src={currentUser?.profilepic || "https://picsum.photos/200"}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
        </div>

        <div className="relative mt-8 w-full max-w-md mx-auto p-6 bg-white/30 backdrop-blur-md shadow-lg rounded-lg">
          <h1 className="text-xl font-bold text-white text-center">
            @{username}
          </h1>
          <p className="text-sm text-gray-300 text-center mt-2">
            Creating amazing content for the community
          </p>
          <div className="text-center mt-4">
            <p className="text-sm text-white">
              <span className="font-semibold text-white">9,719</span> membersㅤ
              <span className="font-semibold text-white"> 82</span> posts ㅤ
              <span className="font-semibold text-white">₹15,450</span>
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full max-w-5xl mt-20 flex flex-col md:flex-row gap-8">
          {/* Leaderboard */}
          <div className="flex-1 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Top Donations
            </h2>
            {payments.length == 0 && (
              <li className="list-none">No payments yet</li>
            )}
            <ol className="list-decimal list-inside text-lg text-gray-700">
              {Object.entries(
                payments.reduce((acc, p) => {
                  acc[p.name] = (acc[p.name] || 0) + p.amount;
                  return acc;
                }, {})
              ).map(([name, total], i) => (
                <li key={i} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2">
                    <FaUserCircle className="text-blue-500 text-2xl" />
                    <span>{name}</span>
                  </div>
                  <span>₹{total}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Form Section */}
          <div className="flex-1 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Donate</h2>
            <form className="space-y-4">
              {/* Name Input */}
<div>
  <label
    htmlFor="name"
    className="block text-gray-700 font-medium mb-1"
  >
    UserName
  </label>
  <input
    type="text"
    id="name"
    name="name"
    value={session?.user?.name || ""}
    readOnly
    className="w-full px-4 py-2 border rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
  />
</div>


              {/* Message Input */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-gray-700 font-medium mb-1"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  onChange={handleChange}
                  value={paymentform.message}
                  placeholder="Write a message"
                  name="message"
                  rows="4"
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              {/* Amount Input */}
              <div>
                <label
                  htmlFor="amount"
                  className="block text-gray-700 font-medium mb-1"
                >
                  Amount
                </label>
                <input
                  type="number"
                  onChange={handleChange}
                  name="amount"
                  value={paymentform.amount}
                  id="amount"
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Pay Button */}
              <div>
                <button
                  onClick={(e) => {
                    e.preventDefault(); // ✅ prevent form submission
                    pay(Number.parseInt(paymentform.amount));
                  }}
                  type="button" // ✅ important
                  className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition"
                >
                  Pay
                </button>
              </div>
            </form>

            {/* Quick Amount Buttons */}
            {/* <div className="mt-4 flex justify-center space-x-4">
           <button
             onClick={() => pay(10000)}
             className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition"
           >
             $10
           </button>
           <button
             onClick={() => pay(20000)}
             className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition"
           >
             $20
           </button>
           <button
             onClick={() => pay(30000)}
             className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition"
           >
             $30
           </button>
         </div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentPage;
