"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchuser, updatePaymentInfo } from "@/actions/useractions";
import { Bounce } from "react-toastify";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { generateInstagramOTP } from "@/actions/useractions";


const Dashboard = () => {

const [otp, setOtp] = useState("");
const [loading, setLoading] = useState(false);

const handleGenerateOTP = async () => {
  setLoading(true);
  try {
    const generated = await generateInstagramOTP(session.user.name);
    setOtp(generated);
    toast("OTP generated! DM it to @instafam_official.");
  } catch (error) {
    toast.error("Failed to generate OTP");
  } finally {
    setLoading(false);
  }
};




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
        <section id="verify" className="pb-8 border-b border-white/20 space-y-4">
          <h3 className="text-2xl font-semibold">Instagram Verification</h3>
          <p className="text-white/80">
            Status:{" "}
            <span className={form?.instagram?.isVerified ? "text-green-400" : "text-red-400"}>
              {form?.instagram?.isVerified ? "✅ Verified" : "❌ Not Verified"}
            </span>
          </p>

          {/* Username Display */}
          <div className="space-y-1">
            <label className="text-sm text-white/70">Your Username ㅤ:ㅤㅤ </label>
            <input
              type="text"
              readOnly
              value={session?.user?.name}
              className="px-4 py-2 rounded bg-gray-200 text-black cursor-not-allowed w-fit"
            />
          </div>

          {/* Generate or Regenerate OTP Button */}
          {!form?.instagram?.isVerified && (
            <div className="space-y-4">
              <button
                className="px-5 py-2 bg-pink-600 rounded hover:bg-pink-700 text-sm font-medium"
                onClick={handleGenerateOTP}
                disabled={loading}
              >
                {otp ? "Regenerate OTP" : "Verify Now"}
              </button>

              {otp && (
                <div className="bg-white/10 border border-white/20 p-4 rounded space-y-3">
                  <p className="text-sm text-white/80">
                    DM the following OTP to our official Instagram handle to verify:
                  </p>

                  <div className="flex items-center space-x-3">
                    <span className="text-xl font-bold text-green-400 tracking-widest">{otp}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(otp)}
                      className="px-3 py-1 bg-pink-600 text-white text-sm rounded hover:bg-pink-700"
                    >
                      Copy
                    </button>
                  </div>

                  <a
                    href="https://www.instagram.com/_instafam_official/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm text-pink-400 underline hover:text-pink-500"
                  >
                    → Go to @_instafam_official on Instagram
                  </a>
                  <p>
                    Your Account Will be verified within the next 24 hours after your dm.
                  </p>
                </div>
              )}
            </div>
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
