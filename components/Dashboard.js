"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchuser, updatePaymentInfo } from "@/actions/useractions";
import { Bounce } from "react-toastify";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { generateInstagramOTP } from "@/actions/useractions";
import { fetchpayments } from "@/actions/useractions";



const Dashboard = () => {

const [otp, setOtp] = useState("");
const [loading, setLoading] = useState(false);
const [totalEarning, setTotalEarning] = useState(0);


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
const [payments, setPayments] = useState([]);


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
    const payments = await fetchpayments(session.user.name);
const total = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
setTotalEarning(total);

  };


useEffect(() => {
  if (!session?.user?.name) return;

  fetchpayments(session.user.name).then(setPayments);
}, [session?.user?.name]);



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


  if (!form) return(<div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 rounded-full border-4 border-pink-500 border-t-transparent mb-4"></div>
        <p className="text-lg font-semibold">Loading InstaFam...</p>
      </div>
    </div>)

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
    <div className="min-h-screen pt-20 bg-black text-white flex flex-col md:flex-row">
  {/* Sidebar */}
<aside className="hidden md:block w-64 bg-black/30 backdrop-blur-lg border-r border-white/10 p-6 space-y-4">
  <h2 className="text-xl font-bold">Creator Dashboard</h2>
  <nav className="space-y-2">
    <a href="#verify" className="block hover:text-[#fb0582]">Verification</a>
    <a href="#earnings" className="block hover:text-[#fb0582]">Earnings</a>
    <a href="#history" className="block hover:text-[#fb0582]">History</a>
    <a href="#payment" className="block hover:text-[#fb0582]">Payment Info</a>
  </nav>
</aside>


  {/* Main Content */}
  <main className="flex-1 p-4 md:p-8 space-y-12">
    {/* Verification Section */}
    <section id="verify" className="pb-8 border-b border-white/20 space-y-4">
      <h3 className="text-2xl font-semibold">Instagram Verification</h3>
      <p className="text-white/80">
        Status:{" "}
        <span className={form?.instagram?.isVerified ? "text-green-400" : "text-red-400"}>
          {form?.instagram?.isVerified ? "✅ Verified" : "❌ Not Verified"}
        </span>
      </p>

      <div className="space-y-1">
        <label className="text-sm text-white/70">Your Username:</label>
        <input
          type="text"
          readOnly
          value={session?.user?.name}
          className="px-4 py-2 rounded bg-white text-black cursor-not-allowed w-full max-w-xs"
        />
      </div>

      {!form?.instagram?.isVerified && (
        <div className="space-y-4">
          <button
            className="px-5 py-2 bg-[#fb0582] rounded hover:bg-pink-700 text-sm font-medium"
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
                  className="px-3 py-1 bg-[#fb0582] text-white text-sm rounded hover:bg-pink-700"
                >
                  Copy
                </button>
              </div>

              <a
                href="https://www.instagram.com/_instafam_official/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm text-[#fb0582] underline hover:text-pink-500"
              >
                → Go to @_instafam_official on Instagram
              </a>
              <p className="text-[#dddbff]">Your account will be verified within 24 hours after your DM.</p>
            </div>
          )}
        </div>
      )}
    </section>

    {/* Earnings */}
    <section id="earnings" className="pb-4 border-b border-white/30">
      <h3 className="text-2xl font-semibold mb-2">Total Earnings</h3>
      <p className="text-3xl font-bold text-green-400">₹{totalEarning}</p>
    </section>

    {/* History */}
    <section id="history" className="pb-4 border-b border-white/30">
      <h3 className="text-2xl font-semibold mb-4">Payment History</h3>

      <div className="max-h-64 overflow-y-auto pr-2 space-y-2">
        {payments.length === 0 ? (
          <p className="text-gray-300">No payments yet.</p>
        ) : (
          payments
            .filter((p) => p.to_user === session.user.name)
            .map((p) => (
              <div
                key={p.oid}
                className="flex justify-between items-center p-3 bg-white/10 rounded-md"
              >
                <div>
                  <p className="text-sm text-gray-200">
                    <span className="font-semibold">{p.name}</span>
                    {" • "}
                    <span className="text-xs text-gray-400">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  </p>
                  {p.message && (
                    <p className="text-xs text-gray-300 mt-1 italic">“{p.message}”</p>
                  )}
                </div>
                <span className="text-lg font-bold text-green-400">₹{p.amount}</span>
              </div>
            ))
        )}
      </div>
    </section>

    {/* Payment Info */}
    <section id="payment" className="pb-8 border-t border-white/20">
      <h3 className="text-2xl font-semibold mb-4">Update Payment Info</h3>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1 text-gray-200">Phone Number</label>
          <input
            type="text"
            name="phone"
            value={form.paymentInfo?.phone || ""}
            onChange={handleChange}
            className="w-full p-2 rounded bg-white text-black"
            placeholder="Enter your phone"
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-200">UPI ID</label>
          <input
            type="text"
            name="upi"
            value={form.paymentInfo?.upi || ""}
            onChange={handleChange}
            className="w-full p-2 rounded bg-white text-black"
            placeholder="you@bank"
          />
        </div>
        <button
          type="submit"
          disabled={!form.instagram?.isVerified}
          className={`px-6 py-2 rounded text-white transition ${
            form.instagram?.isVerified
              ? "bg-[#fb0582] hover:bg-pink-700"
              : "bg-gray-500 cursor-not-allowed"
          }`}
        >
          Save
        </button>

        {!form.instagram?.isVerified && (
          <p className="mt-2 text-sm text-[#fdcc03]">
            Verify your Instagram username to update payment info.
          </p>
        )}
      </form>
    </section>
  </main>
</div>
</>
  );
};

export default Dashboard;
