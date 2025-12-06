"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { fetchuser, updatePaymentInfo, fetchEvents } from "@/actions/useractions";
import { toast } from 'react-toastify';

const PaymentInfo = () => {
  const { data: session } = useSession();
  const [form, setForm] = useState(null);
  const [events, setEvents] = useState([]);
  const [totalEarning, setTotalEarning] = useState(0);
  const [totalPayments, setTotalPayments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedEvents, setExpandedEvents] = useState(new Set());

  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session]);

  const loadData = async () => {
    try {
      console.log('PaymentInfo: Starting to load data for session:', session?.user?.email);
      const user = await fetchuser(session.user.email);
      console.log('PaymentInfo: fetchuser returned:', user);
      setForm(user);

      if (user?._id) {
        console.log('PaymentInfo: About to call fetchEvents with userId:', user._id);
        // Fetch event history
        const eventData = await fetchEvents(user._id, 'history');
        console.log('PaymentInfo: fetchEvents returned:', eventData);

        if (eventData && typeof eventData === 'object' && eventData.events) {
          // New structure with events and totalEarnings
          setEvents(eventData.events || []);
          setTotalEarning(eventData.totalEarnings || 0);
          setTotalPayments(eventData.totalPayments || 0);
        } else {
          // Fallback for old structure
          setEvents(eventData || []);
          const total = (eventData || []).reduce((acc, event) => acc + (event.totalEarnings || 0), 0);
          setTotalEarning(total);
          setTotalPayments(eventData?.reduce((acc, event) => acc + (event.paymentCount || 0), 0) || 0);
        }

        console.log('PaymentInfo: final totalEarning:', eventData?.totalEarnings || 0);
        console.log('PaymentInfo: final totalPayments:', eventData?.totalPayments || 0);
      } else {
        console.log('PaymentInfo: No user._id found');
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
      toast.error('Error loading payout information');
    } finally {
      setLoading(false);
    }
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

    const phone = form.paymentInfo?.phone || "";
    const upi = form.paymentInfo?.upi || "";

    try {
      await updatePaymentInfo({ phone, upi }, session.user.email);
      toast.success("Payout information updated successfully!");
    } catch (error) {
      toast.error("Failed to update payout information");
      console.error(error);
    }
  };

  const toggleEventExpansion = (eventId) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startFormatted = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const endFormatted = end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return `${startFormatted} - ${endFormatted}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="pb-8">
        <h1 className="text-2xl font-semibold text-primary mb-3">Event-Based Payout  </h1>
        <p className="text-text/60 text-sm">Track your earnings from completed events and manage payouts</p>
      </div>

      {/* Earnings Overview */}
      <section className="space-y-6">
        <h3 className="text-lg font-medium text-text/90">Total Earnings</h3>
        <div className="bg-dropdown-hover rounded-xl p-8">
          <div className="text-center">
            <p className="text-4xl font-light text-text mb-2">₹{totalEarning.toLocaleString()}</p>
            <p className="text-text/60 text-sm">Total earnings from all completed events</p>
            <div className="mt-4 text-sm text-text/60">
              <span className="inline-block mx-2">•</span>
              {events.filter(event => event.status === 'completed').length} completed events
              <span className="inline-block mx-2">•</span>
              {totalPayments} total payments
            </div>
          </div>
        </div>
      </section>

      {/* Event History Accordion */}
      <section className="space-y-6">
        <h3 className="text-lg font-medium text-text/90">Event History</h3>
        <div className=" rounded-xl p-6">
          {events.length === 0 ? (
            <div className="text-center  py-12">
              <div className="text-text/50 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-text/80 mb-2">No completed events yet</h3>
              <p className="text-text/50 mb-4">Events you create and complete will appear here with their payment history</p>
              <p className="text-sm text-text/40">💡 Create events from your main dashboard to start tracking earnings</p>
            </div>
          ) : (
            <div className="space-y-4 ">
              {events.map((event) => {
                const isExpanded = expandedEvents.has(event._id);
                return (
                  <div key={event._id} className=" bg-dropdown-hover rounded-lg overflow-hidden">
                    {/* Accordion Header */}
                    <button
                      onClick={() => toggleEventExpansion(event._id)}
                      className="w-full p-4 bg-background/20 hover:bg-background/30 transition-colors text-left"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <h4 className="font-semibold text-primary mb-1">
                            Event #{events.length - events.indexOf(event)}
                          </h4>
                          <p className="text-sm text-text/60">{formatDateRange(event.startTime, event.endTime)}</p>
                          <p className="text-xs text-text/50 mt-1">
                            Status: <span className={`font-medium ${event.status === 'completed' ? 'text-success' : event.status === 'active' ? 'text-primary' : 'text-text/60'}`}>
                              {event.status === 'completed' ? 'Completed' : event.status === 'active' ? 'Active' : event.status}
                            </span>
                          </p>
                        </div>
                        <div className="text-right mr-4">
                          <p className="text-lg font-semibold text-success">₹{event.totalEarnings?.toLocaleString() || 0}</p>
                          <p className="text-xs text-text/60">{event.paymentCount || 0} payments</p>
                        </div>
                        <div className="text-text/40">
                          {isExpanded ? '−' : '+'}
                        </div>
                      </div>
                    </button>

                    {/* Accordion Content */}
                    {isExpanded && (
                      <div className="p-4 bg-background/10">
                        <div className="mb-4 p-3 bg-background/20 rounded-lg">
                          <p className="text-sm text-text/70 font-medium mb-1">Event's Perk:</p>
                          <p className="text-sm text-text/60">
                            {event.perkDescription || 'No description available'}
                          </p>
                          <div className="mt-2 text-xs text-text/50">
                            <p>Started: {formatDate(event.startTime)}</p>
                            <p>Ended: {formatDate(event.endTime)}</p>
                            {event.endedAt && new Date(event.endedAt).getTime() !== new Date(event.endTime).getTime() && (
                              <p className="text-primary/70 italic">Event was ended manually</p>
                            )}
                          </div>
                        </div>

                        {event.payments && event.payments.length > 0 ? (
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium text-yellow-500 mb-3">
                              Payments received during this event:
                            </h5>
                            {event.payments.map((payment, index) => (
                              <div
                                key={payment._id}
                                className="flex justify-between items-center p-3 bg-background rounded-lg"
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-text">
                                    {payment.from_user?.username || 'Anonymous'}
                                  </p>
                                  <p className="text-xs text-text/60">
                                    {formatDate(payment.createdAt)}
                                  </p>
                                  {payment.message && (
                                    <p className="text-xs text-text/50 italic mt-1">
                                      "{payment.message}"
                                    </p>
                                  )}
                                </div>
                                <span className="text-success font-semibold">₹{payment.amount}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-text/60 text-center py-4">
                            No payments received during this event period
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Payment Info Update Section */}
      <section className="space-y-6">
        <h3 className="text-lg font-medium text-text/90">Update Payout Details</h3>
        <div className="bg-dropdown-hover rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
            <div className="space-y-2">
              <label className="text-xs text-text/60 uppercase tracking-wide">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={form?.paymentInfo?.phone || ""}
                onChange={handleChange}
                className="w-full px-3 py-3 rounded-lg bg-background text-text placeholder-background focus:outline-none transition-all duration-200 border-0"
                placeholder="Enter your phone number"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-text/60 uppercase tracking-wide">UPI ID</label>
              <input
                type="text"
                name="upi"
                value={form?.paymentInfo?.upi || ""}
                onChange={handleChange}
                className="w-full px-3 py-3 rounded-lg bg-background text-text placeholder-background focus:outline-none transition-all duration-200 border-0"
                placeholder="you@bank"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-lg font-medium transition-colors bg-primary hover:bg-primary/90 text-white"
            >
              Save Payout Details
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default PaymentInfo;
