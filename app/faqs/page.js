"use client";

import { useState } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    // General
    {
      question: "What is Sygil?",
      answer:
        "Sygil is a creator support platform that lets fans directly contribute to their favorite Instagram creators through quick, secure donations. It helps creators build a sustainable income while fans get recognized for their support.",
    },
    {
      question: "Who can use Sygil?",
      answer:
        "Any Instagram creator — whether you’re a dancer, artist, gamer, or photographer. If you create, you belong here.",
    },
    {
      question: "Is Sygil free to use?",
      answer:
        "Yes! Signing up and creating your page is completely free. We only take a small service fee per transaction to cover payment processing and platform maintenance.",
    },
    // Donations & Payments
    {
      question: "How do fans donate?",
      answer:
        "Fans can support creators instantly using secure payment methods like UPI or PayPal. No account or complicated setup required — just name, amount, and send.",
    },
    {
      question: "Where does my money go when I donate?",
      answer:
        "100% of your donation (minus processing fees) goes directly to the creator you choose. We’re fully transparent about all transactions.",
    },
    {
      question: "Can I donate anonymously?",
      answer:
        "Yes! You can choose to donate as a guest without displaying your name publicly.",
    },
    {
      question: "Are donations refundable?",
      answer:
        "Once a donation is processed, it cannot be refunded — since it goes directly to the creator. If you made a mistake, please contact us, and we’ll try to help where possible.",
    },
    // Creators
    {
      question: "How do I become a creator on Sygil?",
      answer:
        "Simply sign up with your Instagram profile and set up your Sygil page. You can customize your bio, add links, and start receiving support instantly.",
    },
    {
      question: "Can I host donation events or campaigns?",
      answer:
        "Yes! You can create limited-time events, goals, or milestones that appear on your profile — perfect for launches, upgrades, or challenges.",
    },
    {
      question: "Can I add affiliate or favorite links?",
      answer:
        "Absolutely. You can showcase your social handles and favorite products — and we’ll help manage affiliate tracking transparently.",
    },
    {
      question: "How do I withdraw my earnings?",
      answer:
        "Creators can link their payment account and withdraw funds anytime once the minimum threshold is reached. Payouts are processed quickly and securely.",
    },
    // Security & Transparency
    {
      question: "Is Sygil secure?",
      answer:
        "Completely. We use encrypted transactions and trusted payment gateways to keep both creators and supporters safe.",
    },
    {
      question: "Does Sygil store my payment data?",
      answer:
        "No — all payments are handled by trusted third-party gateways. We never store sensitive payment information.",
    },
    {
      question: "How does Sygil make money?",
      answer:
        "We take a small service fee per transaction and earn from affiliate partnerships when applicable. This keeps Sygil running without charging creators subscription fees.",
    },
    // Other
    {
      question: "Can I contact the Sygil team for partnerships or support?",
      answer:
        "Yes! Head to our Contact Page for collaborations, feedback, or questions. We love hearing from creators and supporters alike.",
    },
    {
      question: "Will Sygil expand beyond Instagram?",
      answer:
        "Definitely. While we’re starting with Instagram creators, our long-term vision is to support creators across multiple platforms — from YouTube to X to emerging creator ecosystems.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-text pt-20 pb-10 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-primary">
          Frequently Asked Questions
        </h1>

        <div className="mt-12 space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-text/10 rounded-xl overflow-hidden shadow-sm bg-secondary/10 backdrop-blur-sm"
            >
              {/* Question */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center text-left px-6 py-4 text-base md:text-lg font-semibold text-text hover:bg-text/5 transition"
              >
                <span>{faq.question}</span>
                <svg
                  className={`w-6 h-6 text-accent transform ${
                    openIndex === index ? "rotate-180" : ""
                  } transition-transform duration-200`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Answer */}
              {openIndex === index && (
                <div className="px-6 py-4 bg-background/40 text-text/90 border-t border-text/10 transition-all duration-300 ease-in-out">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
