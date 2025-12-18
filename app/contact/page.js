"use client";

import { useState } from "react";
import Footer from "../../components/Footer";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to send');

      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background text-text pt-20 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-primary mb-4">
            Contact Us
          </h1>
          <p className="text-center text-text/60 text-sm max-w-2xl mx-auto mb-8">
            Last updated: <span className="text-text">November 13, 2025</span>
          </p>

          <p className="text-base text-text/80 mb-12 text-center max-w-2xl mx-auto">
            Have questions, feedback, or partnership inquiries? We'd love to hear from you.
          </p>

          {/* Contact Information */}
          <div className="mt-12 mb-16">
            <h2 className="text-xl font-semibold text-secondary mb-6 text-center">Get In Touch</h2>
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary/5 border border-text/5">
                <div className="text-primary mt-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-text mb-1">Email</p>
                  <a href="mailto:contact@sygil.app" className="text-secondary hover:text-primary transition">
                    contact@sygil.app
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary/5 border border-text/5">
                <div className="text-primary mt-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-text mb-1">Phone</p>
                  <a href="tel:+917982432872" className="text-secondary hover:text-primary transition">
                    +91 7982432872
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary/5 border border-text/5">
                <div className="text-primary mt-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-text mb-1">Location</p>
                  <p className="text-text/80 text-sm">New Delhi, India</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="mt-16">
            <h2 className="text-xl font-semibold text-secondary mb-6 text-center">Send a Message</h2>
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-text/90">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-background border border-text/10 rounded-lg text-text placeholder-text/40 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-text/90">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 bg-background border border-text/10 rounded-lg text-text placeholder-text/40 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2 text-text/90">
                  Message
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  placeholder="How can we help you?"
                  className="w-full px-4 py-3 bg-background border border-text/10 rounded-lg text-text placeholder-text/40 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none"
                  required
                ></textarea>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={status === 'loading' || status === 'success'}
                  className={`w-full font-semibold py-3 px-6 rounded-lg transition shadow-sm hover:shadow-md 
                    ${status === 'success'
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : status === 'loading'
                        ? 'bg-primary/70 text-white cursor-wait'
                        : 'bg-primary hover:bg-primary/90 text-white'
                    }`}
                >
                  {status === 'loading' ? 'Sending...' : status === 'success' ? 'Message Sent!' : 'Send Message'}
                </button>
                {status === 'error' && (
                  <p className="text-red-500 text-sm mt-2 text-center">Failed to send message. Please try again.</p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer forceShow={true} />
    </>
  );
}
