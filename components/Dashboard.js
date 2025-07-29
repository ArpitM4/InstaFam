"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchuser, updatePaymentInfo } from "@/actions/useractions";
import { fetchMyVaultItems, addVaultItem, deleteVaultItem, fetchVaultHistory, fetchPendingRedemptions, fulfillRedemption, submitCreatorAnswer, fetchFulfilledRedemptions } from "@/actions/vaultActions";
import { Bounce } from "react-toastify";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { generateInstagramOTP } from "@/actions/useractions";
import { fetchpayments } from "@/actions/useractions";

const Dashboard = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalEarning, setTotalEarning] = useState(0);
  const [vaultItems, setVaultItems] = useState([]);
  const [vaultLoading, setVaultLoading] = useState(false);
  const [vaultHistoryItems, setVaultHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeVaultTab, setActiveVaultTab] = useState('active'); // 'active' or 'history'
  const [pendingRedemptions, setPendingRedemptions] = useState([]);
  const [fulfilledRedemptions, setFulfilledRedemptions] = useState([]);
  const [redemptionsLoading, setRedemptionsLoading] = useState(false);
  const [activeRequestsTab, setActiveRequestsTab] = useState('pending'); // 'pending' or 'fulfilled'
  const [creatorResponses, setCreatorResponses] = useState({}); // Track responses for each redemption
  const [submittingAnswers, setSubmittingAnswers] = useState({}); // Track loading state for submissions
  const [newVaultItem, setNewVaultItem] = useState({
    title: '',
    description: '',
    pointCost: '',
    fileUrl: '',
    fileType: 'image',
    perkType: 'DigitalFile',
    requiresFanInput: false
  });
  const [uploadMethod, setUploadMethod] = useState('upload'); // 'upload' or 'url'
  const [selectedFile, setSelectedFile] = useState(null);

  const handleUploadMethodChange = (method) => {
    setUploadMethod(method);
    
    // Automatically set perkType and fileType based on upload method
    let perkType = 'DigitalFile'; // Default for upload and url
    let fileType = newVaultItem.fileType; // Keep current fileType for files
    
    if (method === 'none') {
      perkType = 'Recognition'; // Default for text-based rewards
      fileType = 'text-reward'; // Special fileType for text-based rewards
    }
    
    setNewVaultItem(prev => ({
      ...prev,
      perkType,
      fileType,
      requiresFanInput: method === 'none' // Auto-enable fan input for text-based rewards
    }));
  };

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
  const [userId, setUserId] = useState(null);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('general');

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
    setUserId(user?._id);
    if (user?._id) {
      const payments = await fetchpayments(user._id);
      setPayments(payments);
      const total = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      setTotalEarning(total);
      
      // Fetch vault items if user is verified
      if (user.instagram?.isVerified) {
        await loadVaultItems();
      }
    }
  };

  const loadVaultItems = async () => {
    try {
      setVaultLoading(true);
      const result = await fetchMyVaultItems();
      if (result.success) {
        setVaultItems(result.items);
      }
    } catch (error) {
      console.error('Error loading vault items:', error);
    } finally {
      setVaultLoading(false);
    }
  };

  const loadVaultHistory = async () => {
    try {
      setHistoryLoading(true);
      const result = await fetchVaultHistory();
      if (result.success) {
        setVaultHistoryItems(result.items);
      }
    } catch (error) {
      console.error('Error loading vault history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadPendingRedemptions = async () => {
    try {
      setRedemptionsLoading(true);
      const result = await fetchPendingRedemptions();
      if (result.success) {
        setPendingRedemptions(result.redemptions);
      }
    } catch (error) {
      console.error('Error loading pending redemptions:', error);
    } finally {
      setRedemptionsLoading(false);
    }
  };

  const loadFulfilledRedemptions = async () => {
    try {
      setRedemptionsLoading(true);
      const result = await fetchFulfilledRedemptions();
      if (result.success) {
        setFulfilledRedemptions(result.redemptions);
      }
    } catch (error) {
      console.error('Error loading fulfilled redemptions:', error);
    } finally {
      setRedemptionsLoading(false);
    }
  };

  const loadRedemptions = async () => {
    if (activeRequestsTab === 'pending') {
      await loadPendingRedemptions();
    } else {
      await loadFulfilledRedemptions();
    }
  };

  const handleFulfillRedemption = async (redemptionId) => {
    if (!confirm('Are you sure you want to mark this redemption as fulfilled?')) {
      return;
    }

    try {
      const result = await fulfillRedemption(redemptionId);
      
      if (result.success) {
        toast.success('Redemption marked as fulfilled!');
        // Move the fulfilled redemption from pending to fulfilled list
        const fulfilledRedemption = pendingRedemptions.find(r => r._id === redemptionId);
        if (fulfilledRedemption) {
          setPendingRedemptions(prev => prev.filter(r => r._id !== redemptionId));
          setFulfilledRedemptions(prev => [{ ...fulfilledRedemption, status: 'Fulfilled', fulfilledAt: new Date() }, ...prev]);
        }
      } else {
        toast.error(result.error || 'Failed to fulfill redemption');
      }
    } catch (error) {
      toast.error('Error fulfilling redemption');
      console.error(error);
    }
  };

  const handleSubmitAnswer = async (redemptionId) => {
    const response = creatorResponses[redemptionId];
    
    if (!response || !response.trim()) {
      toast.error('Please write an answer before submitting');
      return;
    }

    setSubmittingAnswers(prev => ({ ...prev, [redemptionId]: true }));

    try {
      const result = await submitCreatorAnswer(redemptionId, response.trim());
      
      if (result.success) {
        toast.success('Answer sent successfully!');
        // Move the answered redemption from pending to fulfilled list
        const answeredRedemption = pendingRedemptions.find(r => r._id === redemptionId);
        if (answeredRedemption) {
          setPendingRedemptions(prev => prev.filter(r => r._id !== redemptionId));
          setFulfilledRedemptions(prev => [{ 
            ...answeredRedemption, 
            status: 'Fulfilled', 
            creatorResponse: response.trim(),
            fulfilledAt: new Date() 
          }, ...prev]);
        }
        // Clear the response from state
        setCreatorResponses(prev => {
          const updated = { ...prev };
          delete updated[redemptionId];
          return updated;
        });
      } else {
        toast.error(result.error || 'Failed to submit answer');
      }
    } catch (error) {
      toast.error('Error submitting answer');
      console.error(error);
    } finally {
      setSubmittingAnswers(prev => ({ ...prev, [redemptionId]: false }));
    }
  };

  const handleResponseChange = (redemptionId, value) => {
    setCreatorResponses(prev => ({
      ...prev,
      [redemptionId]: value
    }));
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

  const handleVaultItemChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewVaultItem(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddVaultItem = async (e) => {
    e.preventDefault();
    
    if (!newVaultItem.title || !newVaultItem.description || !newVaultItem.pointCost) {
      toast.error('Please fill in all required fields');
      return;
    }

    let finalFileUrl = newVaultItem.fileUrl; // Get URL if method is 'url'
    let finalFileType = newVaultItem.fileType;

    try {
      setVaultLoading(true);

      if (uploadMethod === 'none') {
        // For text-based rewards, no file is needed
        finalFileUrl = null;
        finalFileType = 'text-reward';
      } else if (uploadMethod === 'upload' && selectedFile) {
        // Handle file upload
        const fileData = new FormData();
        fileData.append("file", selectedFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: fileData
        });

        if (!uploadRes.ok) {
          throw new Error('File upload failed');
        }

        const uploadData = await uploadRes.json();

        if (!uploadData.success) {
          toast.error(uploadData.error || 'File upload failed!');
          return;
        }

        finalFileUrl = uploadData.url;
      } else if (uploadMethod !== 'none' && !finalFileUrl) {
        // Only require file/URL if not a text-based reward
        toast.error('Please provide a file or a valid URL.');
        return;
      }

      // Save the Vault Item
      const vaultItemData = {
        title: newVaultItem.title,
        description: newVaultItem.description,
        pointCost: newVaultItem.pointCost,
        fileUrl: finalFileUrl,
        fileType: finalFileType,
        perkType: newVaultItem.perkType,
        requiresFanInput: newVaultItem.requiresFanInput,
      };

      const result = await addVaultItem(vaultItemData);
      
      if (result.success) {
        toast.success('Vault item added successfully!');
        setNewVaultItem({
          title: '',
          description: '',
          pointCost: '',
          fileUrl: '',
          fileType: 'image',
          perkType: 'DigitalFile',
          requiresFanInput: false
        });
        setSelectedFile(null);
        setUploadMethod('upload');
        await loadVaultItems();
      } else {
        toast.error(result.error || 'Failed to add vault item');
      }
    } catch (error) {
      toast.error('Error adding vault item');
      console.error(error);
    } finally {
      setVaultLoading(false);
    }
  };

  const handleDeleteVaultItem = async (itemId) => {
    if (!confirm('Are you sure you want to expire this vault item? It will be moved to your vault history and no longer visible to fans.')) {
      return;
    }

    try {
      const result = await deleteVaultItem(itemId);
      
      if (result.success) {
        toast.success('Vault item expired successfully!');
        await loadVaultItems();
        // Refresh history if it's currently being viewed
        if (activeVaultTab === 'history') {
          await loadVaultHistory();
        }
      } else {
        toast.error(result.error || 'Failed to expire vault item');
      }
    } catch (error) {
      toast.error('Error expiring vault item');
      console.error(error);
    }
  };

  if (!form) return(<div className="min-h-screen flex items-center justify-center bg-background text-text">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 rounded-full border-4 border-primary border-t-transparent mb-4"></div>
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
      style={{ top: 72 }} // Adjust this value to match your navbar height
    />
    <div className="min-h-screen pt-20 bg-background text-text">
      {/* Desktop Layout */}
      <div className="hidden md:flex">
        {/* Desktop Sidebar */}
        <aside className="w-64 bg-background/30 backdrop-blur-lg border-r border-text/10 p-6 space-y-4 min-h-screen">
          <h2 className="text-xl font-bold mb-6">Creator Dashboard</h2>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('general')}
              className={`block w-full text-left p-3 rounded-md transition-colors ${
                activeTab === 'general'
                  ? 'bg-primary/20 text-primary border-l-4 border-primary'
                  : 'hover:bg-text/10 hover:text-primary'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`block w-full text-left p-3 rounded-md transition-colors ${
                activeTab === 'payment'
                  ? 'bg-primary/20 text-primary border-l-4 border-primary'
                  : 'hover:bg-text/10 hover:text-primary'
              }`}
            >
              Payment Info
            </button>
            {form?.instagram?.isVerified && (
              <>
                <button
                  onClick={() => setActiveTab('vault')}
                  className={`block w-full text-left p-3 rounded-md transition-colors ${
                    activeTab === 'vault'
                      ? 'bg-primary/20 text-primary border-l-4 border-primary'
                      : 'hover:bg-text/10 hover:text-primary'
                  }`}
                >
                  My Vault
                </button>
                <button
                  onClick={() => {
                    setActiveTab('requests');
                    if (activeTab !== 'requests') loadRedemptions();
                  }}
                  className={`block w-full text-left p-3 rounded-md transition-colors ${
                    activeTab === 'requests'
                      ? 'bg-primary/20 text-primary border-l-4 border-primary'
                      : 'hover:bg-text/10 hover:text-primary'
                  }`}
                >
                  Vault Requests
                  {pendingRedemptions.length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {pendingRedemptions.length}
                    </span>
                  )}
                </button>
              </>
            )}
          </nav>
        </aside>

        {/* Desktop Main Content */}
        <main className="flex-1 p-4 md:p-8 pb-20">
          {/* General Tab Content */}
          {activeTab === 'general' && (
            <div className="space-y-8">
              <div className="border-b border-text/20 pb-6">
                <h1 className="text-3xl font-bold text-primary mb-2">General Settings</h1>
                <p className="text-text/70">Manage your account verification and basic settings</p>
              </div>

              {/* Instagram Verification Section */}
              <section className="bg-text/5 border border-text/10 rounded-lg p-6 space-y-4">
                <h3 className="text-2xl font-semibold">Instagram Verification</h3>
                <p className="text-text/80">
                  Status:{" "}
                  <span className={form?.instagram?.isVerified ? "text-success" : "text-error"}>
                    {form?.instagram?.isVerified ? "✅ Verified" : "❌ Not Verified"}
                  </span>
                </p>

                <div className="space-y-1">
                  <label className="text-sm text-text/70">Your Username:</label>
                  <input
                    type="text"
                    readOnly
                    value={session?.user?.name}
                    className="px-4 py-2 rounded bg-text text-background cursor-not-allowed w-full max-w-xs"
                  />
                </div>

                {!form?.instagram?.isVerified && (
                  <div className="space-y-4">
                    <button
                      className="px-5 py-2 bg-primary rounded hover:bg-primary/80 text-sm font-medium"
                      onClick={handleGenerateOTP}
                      disabled={loading}
                    >
                      {otp ? "Regenerate OTP" : "Verify Now"}
                    </button>

                    {otp && (
                      <div className="bg-text/10 border border-text/20 p-4 rounded space-y-3">
                        <p className="text-sm text-text/80">
                          DM the following OTP to our official Instagram handle to verify:
                        </p>

                        <div className="flex items-center space-x-3">
                          <span className="text-xl font-bold text-success tracking-widest">{otp}</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(otp)}
                            className="px-3 py-1 bg-primary text-text text-sm rounded hover:bg-primary/80"
                          >
                            Copy
                          </button>
                        </div>

                        <a
                          href="https://www.instagram.com/_instafam_official/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-sm text-primary underline hover:text-primary/80"
                        >
                          → Go to @_instafam_official on Instagram
                        </a>
                        <p className="text-secondary">Your account will be verified within 24 hours after your DM.</p>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* Payment Info Tab Content */}
          {activeTab === 'payment' && (
            <div className="space-y-8">
              <div className="border-b border-text/20 pb-6">
                <h1 className="text-3xl font-bold text-primary mb-2">Payment Information</h1>
                <p className="text-text/70">Manage your earnings and payment details</p>
              </div>

              {/* Earnings Section */}
              <section className="bg-text/5 border border-text/10 rounded-lg p-6">
                <h3 className="text-2xl font-semibold mb-4">Total Earnings</h3>
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">💰</div>
                  <div>
                    <p className="text-3xl font-bold text-success">${totalEarning}</p>
                    <p className="text-text/60 text-sm">Total amount earned from donations</p>
                  </div>
                </div>
              </section>

              {/* Payment History Section */}
              <section className="bg-text/5 border border-text/10 rounded-lg p-6">
                <h3 className="text-2xl font-semibold mb-4">Payment History</h3>
                
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {payments.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📋</div>
                      <p className="text-text/60">No payments yet.</p>
                    </div>
                  ) : (
                    payments
                      .filter((p) => p.to_user === userId)
                      .map((p, index) => (
                        <div
                          key={p.oid}
                          className={`flex justify-between items-center p-3 hover:bg-text/5 transition-colors ${
                            index !== payments.filter((p) => p.to_user === userId).length - 1 
                              ? 'border-b border-text/10' 
                              : ''
                          }`}
                        >
                          <div>
                            <p className="text-sm text-text/80">
                              <span className="font-semibold">{p.name}</span>
                              {" • "}
                              <span className="text-xs text-text/60">
                                {new Date(p.createdAt).toLocaleDateString()}
                              </span>
                            </p>
                            {p.message && (
                              <p className="text-xs text-text/60 mt-1 italic">"{p.message}"</p>
                            )}
                          </div>
                          <span className="text-lg font-bold text-success">${p.amount}</span>
                        </div>
                      ))
                  )}
                </div>
              </section>

              {/* Payment Info Update Section */}
              <section className="bg-text/5 border border-text/10 rounded-lg p-6">
                <h3 className="text-2xl font-semibold mb-4">Update Payment Details</h3>
                <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                  <div>
                    <label className="block mb-2 text-text/80 font-medium">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={form.paymentInfo?.phone || ""}
                      onChange={handleChange}
                      className="w-full p-3 rounded-md bg-text text-background border border-text/20 focus:ring-2 focus:ring-primary outline-none"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-text/80 font-medium">UPI ID</label>
                    <input
                      type="text"
                      name="upi"
                      value={form.paymentInfo?.upi || ""}
                      onChange={handleChange}
                      className="w-full p-3 rounded-md bg-text text-background border border-text/20 focus:ring-2 focus:ring-primary outline-none"
                      placeholder="you@bank"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!form.instagram?.isVerified}
                    className={`px-6 py-3 rounded-md text-text font-medium transition ${
                      form.instagram?.isVerified
                        ? "bg-primary hover:bg-primary/80"
                        : "bg-text/30 cursor-not-allowed"
                    }`}
                  >
                    Save Payment Details
                  </button>

                  {!form.instagram?.isVerified && (
                    <p className="mt-2 text-sm text-accent">
                      ⚠️ Verify your Instagram account first to update payment information.
                    </p>
                  )}
                </form>
              </section>
            </div>
          )}

          {/* My Vault Tab Content */}
          {activeTab === 'vault' && form?.instagram?.isVerified && (
            <div className="space-y-8">
              <div className="border-b border-text/20 pb-6">
                <h1 className="text-3xl font-bold text-primary mb-2">My Vault</h1>
                <p className="text-text/70">Manage exclusive content for your fans to unlock with Fam Points</p>
              </div>

              {/* Add New Item Form */}
              <section className="bg-text/5 border border-text/10 rounded-lg p-6">
                <h3 className="text-2xl font-semibold mb-4">Add New Vault Item</h3>
                <form onSubmit={handleAddVaultItem} className="space-y-4 max-w-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-text/80 font-medium">Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={newVaultItem.title}
                        onChange={handleVaultItemChange}
                        className="w-full p-3 rounded-md bg-text text-background border border-text/20 focus:ring-2 focus:ring-primary outline-none"
                        placeholder="e.g., Exclusive Wallpaper Pack"
                        maxLength="100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-text/80 font-medium">Point Cost *</label>
                      <input
                        type="number"
                        name="pointCost"
                        value={newVaultItem.pointCost}
                        onChange={handleVaultItemChange}
                        className="w-full p-3 rounded-md bg-text text-background border border-text/20 focus:ring-2 focus:ring-primary outline-none"
                        placeholder="500"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-text/80 font-medium">Description *</label>
                    <textarea
                      name="description"
                      value={newVaultItem.description}
                      onChange={handleVaultItemChange}
                      className="w-full p-3 rounded-md bg-text text-background border border-text/20 focus:ring-2 focus:ring-primary outline-none"
                      placeholder={uploadMethod === 'none' 
                        ? "Describe the reward/perk fans will receive (e.g., 'Your name will be featured in my next video credits')" 
                        : "Describe what fans will get when they unlock this item..."
                      }
                      rows="3"
                      maxLength="500"
                      required
                    />
                  </div>

                  {/* Upload Method Choice */}
                  <div className="mb-4">
                    <label className="block mb-3 text-text/80 font-medium">Content Source</label>
                    <div className="flex items-center gap-6 mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="uploadMethod"
                          value="upload"
                          checked={uploadMethod === 'upload'}
                          onChange={() => handleUploadMethodChange('upload')}
                          className="w-4 h-4 text-primary bg-text border-text/30 focus:ring-primary focus:ring-2"
                        />
                        <span className="text-text/80">📁 Upload File</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="uploadMethod"
                          value="url"
                          checked={uploadMethod === 'url'}
                          onChange={() => handleUploadMethodChange('url')}
                          className="w-4 h-4 text-primary bg-text border-text/30 focus:ring-primary focus:ring-2"
                        />
                        <span className="text-text/80">🔗 Link from URL</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="uploadMethod"
                          value="none"
                          checked={uploadMethod === 'none'}
                          onChange={() => handleUploadMethodChange('none')}
                          className="w-4 h-4 text-primary bg-text border-text/30 focus:ring-primary focus:ring-2"
                        />
                        <span className="text-text/80">⭐ Text-Based Reward</span>
                      </label>
                    </div>

                    {/* Conditionally Rendered Input */}
                    {uploadMethod === 'upload' ? (
                      <div>
                        <label className="block mb-2 text-text/80 font-medium">Select File</label>
                        <input
                          type="file"
                          onChange={(e) => setSelectedFile(e.target.files[0])}
                          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                          className="w-full text-sm text-text/70 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-text hover:file:bg-primary/80 file:cursor-pointer cursor-pointer"
                        />
                        {selectedFile && (
                          <div className="mt-2 p-2 bg-primary/10 rounded-md text-sm">
                            <span className="text-primary font-medium">Selected: </span>
                            <span className="text-text/70">{selectedFile.name}</span>
                            <span className="text-text/50 ml-2">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                        )}
                      </div>
                    ) : uploadMethod === 'url' ? (
                      <div>
                        <label className="block mb-2 text-text/80 font-medium">File URL</label>
                        <input
                          type="url"
                          name="fileUrl"
                          value={newVaultItem.fileUrl}
                          onChange={handleVaultItemChange}
                          className="w-full p-3 rounded-md bg-text text-background border border-text/20 focus:ring-2 focus:ring-primary outline-none"
                          placeholder="https://res.cloudinary.com/..."
                        />
                      </div>
                    ) : (
                      <div className="p-4 bg-primary/10 rounded-md border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">⭐</span>
                          <span className="font-medium text-primary">Text-Based Reward</span>
                        </div>
                        <p className="text-text/70 text-sm mb-3">
                          Perfect for recognition, influence, or access rewards that don't require file attachments.
                        </p>
                        <div className="text-xs text-text/60 space-y-1 mb-4">
                          <div><strong>Recognition:</strong> "Your name in my next video credits", "Personal shout-out on Instagram"</div>
                          <div><strong>Influence:</strong> "Vote on my next content topic", "Submit a Q&A question"</div>
                          <div><strong>Access:</strong> "Early access link", "Join my private Discord channel"</div>
                        </div>
                        
                        {/* Perk Type Selector for Text-Based Rewards */}
                        <div>
                          <label className="block mb-2 text-text/80 font-medium">Reward Type</label>
                          <select
                            name="perkType"
                            value={newVaultItem.perkType}
                            onChange={handleVaultItemChange}
                            className="w-full p-3 rounded-md bg-text text-background border border-text/20 focus:ring-2 focus:ring-primary outline-none"
                          >
                            <option value="Recognition">🏆 Recognition</option>
                            <option value="Influence">🗳️ Influence</option>
                            <option value="AccessLink">🔗 Access Link</option>
                          </select>
                          <p className="text-xs text-text/60 mt-1">
                            {newVaultItem.perkType === 'Recognition' && 'Shout-outs, credits, mentions, etc.'}
                            {newVaultItem.perkType === 'Influence' && 'Voting on content, Q&A submissions, etc.'}
                            {newVaultItem.perkType === 'AccessLink' && 'Private Discord, early access links, etc.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {uploadMethod !== 'none' && (
                      <div>
                        <label className="block mb-2 text-text/80 font-medium">File Type</label>
                        <select
                          name="fileType"
                          value={newVaultItem.fileType}
                          onChange={handleVaultItemChange}
                          className="w-full p-3 rounded-md bg-text text-background border border-text/20 focus:ring-2 focus:ring-primary outline-none"
                        >
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                          <option value="pdf">PDF</option>
                          <option value="audio">Audio</option>
                          <option value="document">Document</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Fan Input Required Checkbox - Only for Text-Based Rewards */}
                  {uploadMethod === 'none' && (
                    <div className="p-4 bg-text/5 border border-text/10 rounded-lg">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="requiresFanInput"
                          checked={newVaultItem.requiresFanInput}
                          onChange={handleVaultItemChange}
                          className="mt-1 w-4 h-4 text-primary bg-text border-text/30 rounded focus:ring-primary focus:ring-2"
                        />
                        <div>
                          <span className="text-text/80 font-medium">This perk requires input from the fan</span>
                          <p className="text-text/60 text-sm mt-1">
                            Check this if fans need to provide information (like their name for credits, question for Q&A, etc.)
                          </p>
                        </div>
                      </label>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={vaultLoading}
                    className={`px-6 py-3 rounded-md text-text font-medium transition ${
                      vaultLoading
                        ? "bg-text/30 cursor-not-allowed"
                        : "bg-primary hover:bg-primary/80"
                    }`}
                  >
                    {vaultLoading ? "Adding..." : "Add to Vault"}
                  </button>
                </form>
              </section>

              {/* Vault Items with Tabs */}
              <section className="bg-text/5 border border-text/10 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold">Your Vault Management</h3>
                  
                  {/* Tab Navigation */}
                  <div className="flex bg-text/10 rounded-lg p-1">
                    <button
                      onClick={() => {
                        setActiveVaultTab('active');
                        if (activeVaultTab !== 'active') loadVaultItems();
                      }}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeVaultTab === 'active'
                          ? 'bg-primary text-text shadow-sm'
                          : 'text-text/70 hover:text-text hover:bg-text/5'
                      }`}
                    >
                      Active Items ({vaultItems.length})
                    </button>
                    <button
                      onClick={() => {
                        setActiveVaultTab('history');
                        if (activeVaultTab !== 'history') loadVaultHistory();
                      }}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeVaultTab === 'history'
                          ? 'bg-primary text-text shadow-sm'
                          : 'text-text/70 hover:text-text hover:bg-text/5'
                      }`}
                    >
                      Vault History ({vaultHistoryItems.length})
                    </button>
                  </div>
                </div>

                {/* Active Items Tab */}
                {activeVaultTab === 'active' && (
                  <>
                    {vaultLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent mx-auto mb-2"></div>
                        <p className="text-text/60">Loading active vault items...</p>
                      </div>
                    ) : vaultItems.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">🗃️</div>
                        <p className="text-text/60">No active vault items yet. Add your first exclusive content above!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {vaultItems.map((item) => (
                          <div key={item._id} className="bg-background/50 border border-text/10 rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold text-lg truncate flex-1 mr-2">{item.title}</h4>
                              <button
                                onClick={() => handleDeleteVaultItem(item._id)}
                                className="text-orange-500 hover:text-orange-400 text-sm px-2 py-1 rounded"
                                title="Expire item (move to history)"
                              >
                                ⏰
                              </button>
                            </div>
                            
                            <p className="text-text/70 text-sm line-clamp-2">{item.description}</p>
                            
                            <div className="flex items-center justify-between text-sm">
                              <span className="bg-primary/20 text-primary px-2 py-1 rounded">
                                {item.pointCost} points
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-text/60">
                                  {item.fileType.toUpperCase()}
                                </span>
                                {item.requiresFanInput && (
                                  <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs" title="Requires fan input">
                                    📝
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-xs text-text/60 flex justify-between">
                              <span>{item.unlockCount} unlocks</span>
                              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* History Tab */}
                {activeVaultTab === 'history' && (
                  <>
                    {historyLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent mx-auto mb-2"></div>
                        <p className="text-text/60">Loading vault history...</p>
                      </div>
                    ) : vaultHistoryItems.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">📚</div>
                        <p className="text-text/60">No expired vault items yet. Items you expire will appear here.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {vaultHistoryItems.map((item) => (
                          <div key={item._id} className="bg-background/30 border border-text/10 rounded-lg p-4 space-y-3 opacity-75">
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold text-lg truncate flex-1 mr-2">{item.title}</h4>
                              <span className="text-red-400 text-sm px-2 py-1 rounded" title="Expired">
                                ❌
                              </span>
                            </div>
                            
                            <p className="text-text/70 text-sm line-clamp-2">{item.description}</p>
                            
                            <div className="flex items-center justify-between text-sm">
                              <span className="bg-text/20 text-text/60 px-2 py-1 rounded">
                                {item.pointCost} points
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-text/60">
                                  {item.fileType.toUpperCase()}
                                </span>
                                {item.requiresFanInput && (
                                  <span className="bg-text/20 text-text/60 px-2 py-1 rounded text-xs" title="Required fan input">
                                    📝
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-xs text-text/60 flex justify-between">
                              <span>{item.unlockCount} total unlocks</span>
                              <div className="text-right">
                                <div>Created: {new Date(item.createdAt).toLocaleDateString()}</div>
                                <div>Expired: {item.expiredAt ? new Date(item.expiredAt).toLocaleDateString() : 'N/A'}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </section>
            </div>
          )}

          {/* Vault Requests Tab Content */}
          {activeTab === 'requests' && form?.instagram?.isVerified && (
            <div className="space-y-8">
              <div className="border-b border-text/20 pb-6">
                <h1 className="text-3xl font-bold text-primary mb-2">Vault Requests</h1>
                <p className="text-text/70">Manage fan redemptions that require your action</p>
              </div>

              {/* Requests Tab Navigation */}
              <div className="flex bg-text/10 rounded-lg p-1">
                <button
                  onClick={() => {
                    setActiveRequestsTab('pending');
                    if (activeRequestsTab !== 'pending') loadPendingRedemptions();
                  }}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeRequestsTab === 'pending'
                      ? 'bg-primary text-text shadow-sm'
                      : 'text-text/70 hover:text-text hover:bg-text/5'
                  }`}
                >
                  Pending Requests
                  {pendingRedemptions.length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {pendingRedemptions.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setActiveRequestsTab('fulfilled');
                    if (activeRequestsTab !== 'fulfilled') loadFulfilledRedemptions();
                  }}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeRequestsTab === 'fulfilled'
                      ? 'bg-primary text-text shadow-sm'
                      : 'text-text/70 hover:text-text hover:bg-text/5'
                  }`}
                >
                  Fulfilled Requests
                  {fulfilledRedemptions.length > 0 && (
                    <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      {fulfilledRedemptions.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Pending Redemptions */}
              {activeRequestsTab === 'pending' && (
                <section className="bg-text/5 border border-text/10 rounded-lg p-6">
                  <h3 className="text-2xl font-semibold mb-4">
                    Pending Fulfillments 
                    {pendingRedemptions.length > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                        {pendingRedemptions.length}
                      </span>
                    )}
                  </h3>
                  
                  {redemptionsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent mx-auto mb-2"></div>
                      <p className="text-text/60">Loading pending requests...</p>
                    </div>
                  ) : pendingRedemptions.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">✅</div>
                      <p className="text-text/60">No pending requests! All your fans' redemptions are up to date.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                    {pendingRedemptions.map((redemption) => (
                      <div key={redemption._id} className="bg-background/50 border border-text/10 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-primary mb-2">
                              {redemption.vaultItemId.title}
                            </h4>
                            <p className="text-text/70 text-sm mb-3">
                              {redemption.vaultItemId.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-text/60">
                              <span className="flex items-center gap-1">
                                👤 <strong>{redemption.fanId.username}</strong>
                              </span>
                              <span className="flex items-center gap-1">
                                💰 {redemption.pointsSpent} points
                              </span>
                              <span className="flex items-center gap-1">
                                📅 {new Date(redemption.redeemedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Perk Type Badge */}
                        <div className="flex items-center gap-2 mb-4">
                          <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-medium">
                            {redemption.vaultItemId.perkType}
                          </span>
                          {redemption.vaultItemId.requiresFanInput && redemption.fanInput && (
                            <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-medium">
                              Q&A Required
                            </span>
                          )}
                        </div>

                        {/* Fan Input Section - Q&A Interface */}
                        {redemption.vaultItemId.requiresFanInput && redemption.fanInput ? (
                          <div className="space-y-4">
                            {/* Fan's Question */}
                            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                              <h5 className="font-medium text-primary mb-2 flex items-center gap-2">
                                <span className="text-lg">❓</span>
                                {redemption.fanId.username}'s Question:
                              </h5>
                              <p className="text-text/90 italic bg-background/30 p-3 rounded border-l-4 border-primary/50">
                                "{redemption.fanInput}"
                              </p>
                            </div>

                            {/* Creator's Answer Interface */}
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                              <h5 className="font-medium text-green-400 mb-3 flex items-center gap-2">
                                <span className="text-lg">💬</span>
                                Your Answer:
                              </h5>
                              <textarea
                                value={creatorResponses[redemption._id] || ''}
                                onChange={(e) => handleResponseChange(redemption._id, e.target.value)}
                                placeholder="Write your exclusive answer to this fan's question..."
                                className="w-full bg-background/50 border border-text/20 rounded-lg p-4 text-text resize-none focus:border-primary/50 focus:outline-none min-h-[120px]"
                                maxLength={2000}
                              />
                              <div className="flex items-center justify-between mt-3">
                                <span className="text-xs text-text/60">
                                  {(creatorResponses[redemption._id] || '').length}/2000 characters
                                </span>
                                <button
                                  onClick={() => handleSubmitAnswer(redemption._id)}
                                  disabled={submittingAnswers[redemption._id] || !(creatorResponses[redemption._id] || '').trim()}
                                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                  {submittingAnswers[redemption._id] ? (
                                    <>
                                      <div className="animate-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent"></div>
                                      Sending...
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-lg">✨</span>
                                      Send Answer
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Non-Q&A redemptions (simple fulfillment)
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleFulfillRedemption(redemption._id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                              Mark as Fulfilled
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
              )}

              {/* Fulfilled Redemptions */}
              {activeRequestsTab === 'fulfilled' && (
                <section className="bg-text/5 border border-text/10 rounded-lg p-6">
                  <h3 className="text-2xl font-semibold mb-4">
                    Fulfilled Requests History
                    {fulfilledRedemptions.length > 0 && (
                      <span className="ml-2 bg-green-500 text-white text-sm px-3 py-1 rounded-full">
                        {fulfilledRedemptions.length}
                      </span>
                    )}
                  </h3>
                  
                  {redemptionsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent mx-auto mb-2"></div>
                      <p className="text-text/60">Loading fulfilled requests...</p>
                    </div>
                  ) : fulfilledRedemptions.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📋</div>
                      <p className="text-text/60">No fulfilled requests yet. Completed requests will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {fulfilledRedemptions.map((redemption) => (
                        <div key={redemption._id} className="bg-background/50 border border-green-500/20 rounded-lg p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-lg font-semibold text-primary">
                                  {redemption.vaultItemId.title}
                                </h4>
                                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                                  ✅ Completed
                                </span>
                              </div>
                              <p className="text-text/70 text-sm mb-3">
                                {redemption.vaultItemId.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-text/60">
                                <span className="flex items-center gap-1">
                                  👤 <strong>{redemption.fanId.username}</strong>
                                </span>
                                <span className="flex items-center gap-1">
                                  💰 {redemption.pointsSpent} points
                                </span>
                                <span className="flex items-center gap-1">
                                  📅 Redeemed: {new Date(redemption.redeemedAt).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  ✅ Fulfilled: {new Date(redemption.fulfilledAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Perk Type Badge */}
                          <div className="flex items-center gap-2 mb-4">
                            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-medium">
                              {redemption.vaultItemId.perkType}
                            </span>
                            {redemption.vaultItemId.requiresFanInput && redemption.fanInput && (
                              <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs font-medium">
                                Q&A Completed
                              </span>
                            )}
                          </div>

                          {/* Show Q&A History if applicable */}
                          {redemption.vaultItemId.requiresFanInput && redemption.fanInput && (
                            <div className="space-y-4">
                              {/* Fan's Question */}
                              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                                <h5 className="font-medium text-primary mb-2 flex items-center gap-2">
                                  <span className="text-lg">❓</span>
                                  {redemption.fanId.username}'s Question:
                                </h5>
                                <p className="text-text/90 italic bg-background/30 p-3 rounded border-l-4 border-primary/50">
                                  "{redemption.fanInput}"
                                </p>
                              </div>

                              {/* Creator's Answer (if available) */}
                              {redemption.creatorResponse && (
                                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                                  <h5 className="font-medium text-green-400 mb-2 flex items-center gap-2">
                                    <span className="text-lg">✨</span>
                                    Your Answer:
                                  </h5>
                                  <div className="bg-background/30 p-3 rounded border-l-4 border-green-500/50">
                                    <p className="text-text/90 whitespace-pre-wrap">{redemption.creatorResponse}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Navigation - Top Tabs */}
      <div className="md:hidden bg-background/30 backdrop-blur-lg border-b border-text/10 px-4 py-3">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-3 px-4 text-center rounded-lg font-medium transition-colors ${
              activeTab === 'general'
                ? 'bg-primary text-text'
                : 'bg-text/10 text-text/70 hover:bg-text/20'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`flex-1 py-3 px-4 text-center rounded-lg font-medium transition-colors ${
              activeTab === 'payment'
                ? 'bg-primary text-text' 
                : 'bg-text/10 text-text/70 hover:bg-text/20'
            }`}
          >
            Payment Info
          </button>
        </div>
      </div>

      {/* Mobile Main Content */}
      <main className="md:hidden p-4 pb-20">
        {/* General Tab Content */}
        {activeTab === 'general' && (
          <div className="space-y-8">
            <div className="border-b border-text/20 pb-6">
              <h1 className="text-3xl font-bold text-primary mb-2">General Settings</h1>
              <p className="text-text/70">Manage your account verification and basic settings</p>
            </div>

            {/* Instagram Verification Section */}
            <section className="bg-text/5 border border-text/10 rounded-lg p-6 space-y-4">
              <h3 className="text-2xl font-semibold">Instagram Verification</h3>
              <p className="text-text/80">
                Status:{" "}
                <span className={form?.instagram?.isVerified ? "text-success" : "text-error"}>
                  {form?.instagram?.isVerified ? "✅ Verified" : "❌ Not Verified"}
                </span>
              </p>

              <div className="space-y-1">
                <label className="text-sm text-text/70">Your Username:</label>
                <input
                  type="text"
                  readOnly
                  value={session?.user?.name}
                  className="px-4 py-2 rounded bg-text text-background cursor-not-allowed w-full max-w-xs"
                />
              </div>

              {!form?.instagram?.isVerified && (
                <div className="space-y-4">
                  <button
                    className="px-5 py-2 bg-primary rounded hover:bg-primary/80 text-sm font-medium"
                    onClick={handleGenerateOTP}
                    disabled={loading}
                  >
                    {otp ? "Regenerate OTP" : "Verify Now"}
                  </button>

                  {otp && (
                    <div className="bg-text/10 border border-text/20 p-4 rounded space-y-3">
                      <p className="text-sm text-text/80">
                        DM the following OTP to our official Instagram handle to verify:
                      </p>

                      <div className="flex items-center space-x-3">
                        <span className="text-xl font-bold text-success tracking-widest">{otp}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(otp)}
                          className="px-3 py-1 bg-primary text-text text-sm rounded hover:bg-primary/80"
                        >
                          Copy
                        </button>
                      </div>

                      <a
                        href="https://www.instagram.com/_instafam_official/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-sm text-primary underline hover:text-primary/80"
                      >
                        → Go to @_instafam_official on Instagram
                      </a>
                      <p className="text-secondary">Your account will be verified within 24 hours after your DM.</p>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Payment Info Tab Content */}
        {activeTab === 'payment' && (
          <div className="space-y-8">
            <div className="border-b border-text/20 pb-6">
              <h1 className="text-3xl font-bold text-primary mb-2">Payment Information</h1>
              <p className="text-text/70">Manage your earnings and payment details</p>
            </div>

            {/* Earnings Section */}
            <section className="bg-text/5 border border-text/10 rounded-lg p-6">
              <h3 className="text-2xl font-semibold mb-4">Total Earnings</h3>
              <div className="flex items-center space-x-4">
                <div className="text-4xl">💰</div>
                <div>
                  <p className="text-3xl font-bold text-success">${totalEarning}</p>
                  <p className="text-text/60 text-sm">Total amount earned from donations</p>
                </div>
              </div>
            </section>

            {/* Payment History Section */}
            <section className="bg-text/5 border border-text/10 rounded-lg p-6">
              <h3 className="text-2xl font-semibold mb-4">Payment History</h3>
              
              <div className="max-h-64 overflow-y-auto space-y-1">
                {payments.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="text-text/60">No payments yet.</p>
                  </div>
                ) : (
                  payments
                    .filter((p) => p.to_user === userId)
                    .map((p, index) => (
                      <div
                        key={p.oid}
                        className={`flex justify-between items-center p-3 hover:bg-text/5 transition-colors ${
                          index !== payments.filter((p) => p.to_user === userId).length - 1 
                            ? 'border-b border-text/10' 
                            : ''
                        }`}
                      >
                        <div>
                          <p className="text-sm text-text/80">
                            <span className="font-semibold">{p.name}</span>
                            {" • "}
                            <span className="text-xs text-text/60">
                              {new Date(p.createdAt).toLocaleDateString()}
                            </span>
                          </p>
                          {p.message && (
                            <p className="text-xs text-text/60 mt-1 italic">"{p.message}"</p>
                          )}
                        </div>
                        <span className="text-lg font-bold text-success">${p.amount}</span>
                      </div>
                    ))
                )}
              </div>
            </section>

            {/* Payment Info Update Section */}
            <section className="bg-text/5 border border-text/10 rounded-lg p-6">
              <h3 className="text-2xl font-semibold mb-4">Update Payment Details</h3>
              <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                <div>
                  <label className="block mb-2 text-text/80 font-medium">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.paymentInfo?.phone || ""}
                    onChange={handleChange}
                    className="w-full p-3 rounded-md bg-text text-background border border-text/20 focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-text/80 font-medium">UPI ID</label>
                  <input
                    type="text"
                    name="upi"
                    value={form.paymentInfo?.upi || ""}
                    onChange={handleChange}
                    className="w-full p-3 rounded-md bg-text text-background border border-text/20 focus:ring-2 focus:ring-primary outline-none"
                    placeholder="you@bank"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!form.instagram?.isVerified}
                  className={`px-6 py-3 rounded-md text-text font-medium transition ${
                    form.instagram?.isVerified
                      ? "bg-primary hover:bg-primary/80"
                      : "bg-text/30 cursor-not-allowed"
                  }`}
                >
                  Save Payment Details
                </button>

                {!form.instagram?.isVerified && (
                  <p className="mt-2 text-sm text-accent">
                    ⚠️ Verify your Instagram account first to update payment information.
                  </p>
                )}
              </form>
            </section>
          </div>
        )}
      </main>
    </div>

</>
  );
}

export default Dashboard;
