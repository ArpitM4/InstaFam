"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchuser, updatePaymentInfo } from "@/actions/useractions";
import { Bounce } from "react-toastify";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



const Dashboard = () => {
const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState(null);

useEffect(() => {
  if (status === "loading") return; // Wait until session is loaded

  if (!session) {
    router.push("/login");
  } else {
    getData();
  }
}, [session, status]);

  const getData = async () => {
    const user = await fetchuser(session.user.name);
    setForm(user);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      paymentInfo: {
        ...prev.paymentInfo,
        [name]: value,
      },
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("Form Submit Triggered"); // Debug check

  const phone = form.paymentInfo?.phone || "";
  const upi = form.paymentInfo?.upi || "";

  try {
    const res = await updatePaymentInfo({ phone, upi }, session.user.name);
    // console.log("DB Update Response:", res); // Debug DB result

   toast('Profile Updated', {
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

  } catch (err) {
    console.error("Update failed:", err);
    toast.error("Something went wrong!");
  }
};


  if (!form) return <div className="text-white p-10">Loading...</div>;

  return (<>
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
    <div className="min-h-screen flex text-white bg-black py-20">
       
      <aside className="w-64 bg-black/30 backdrop-blur-lg border-r border-white/10 p-6 space-y-4">
        <h2 className="text-xl font-bold">Creator Dashboard</h2>
        <nav className="space-y-2">
          <a href="#verify" className="block hover:text-pink-400">Verification</a>
          <a href="#earnings" className="block hover:text-pink-400">Earnings</a>
          <a href="#history" className="block hover:text-pink-400">History</a>
          <a href="#payment" className="block hover:text-pink-400">Payment Info</a>
        </nav>
      </aside>

      <main className="flex-1 p-8 space-y-12">
        {/* Sections */}
        <section id="verify" className="pb-4 border-b border-white/30">
          <h3 className="text-2xl font-semibold mb-2">Instagram Verification</h3>
          <p>Status: {form.verified ? "✅ Verified" : "❌ Not Verified"}</p>
          {!form.verified && (
            <button className="mt-2 px-4 py-2 bg-pink-600 rounded hover:bg-pink-700">
              Verify Now
            </button>
          )}
        </section>

        <section id="earnings" className="pb-4 border-b border-white/30">
          <h3 className="text-2xl font-semibold mb-2">This Month’s Earnings</h3>
          <p className="text-3xl font-bold text-green-400">₹{form.earnings || 0}</p>
        </section>

        <section id="history" className="pb-4 border-b border-white/30">
          <h3 className="text-2xl font-semibold mb-4">Payment History</h3>
          <ul className="space-y-2">
            {(form.history || []).map((item, index) => (
              <li key={index} className="border border-white/20 rounded p-4">
                <span className="font-semibold">{item.month}</span> — ₹{item.amount}
              </li>
            ))}
          </ul>
        </section>

        <section id="payment">
          <h3 className="text-2xl font-semibold mb-4">Update Payment Info</h3>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block mb-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={form.paymentInfo?.phone || ""}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-black"
              />
            </div>
            <div>
              <label className="block mb-1">UPI ID</label>
              <input
                type="text"
                name="upi"
                value={form.paymentInfo?.upi || ""}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-black"
              />
            </div>
            <button type="submit" className="bg-pink-600 px-6 py-2 rounded hover:bg-pink-700">
              Save
            </button>
          </form>
        </section>
      </main>
    </div></>
  );
};

export default Dashboard;
