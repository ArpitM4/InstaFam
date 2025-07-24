"use client";

import { useState } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "What is InstaSupport?",
      answer:
        "InstaSupport is a platform that allows fans to donate directly to their favorite Instagram creators, helping them sustain their passion and creativity.",
    },
    {
      question: "How can I make a donation?",
      answer:
        "To make a donation, navigate to the creator's page, enter your details, select the amount, and complete the payment using our secure gateway.",
    },
    {
      question: "Is my payment information secure?",
      answer:
        "Yes, all payments are processed securely using industry-standard encryption and payment protocols.",
    },
    {
      question: "Can I request a refund?",
      answer:
        "All donations are final and non-refundable. Please ensure you review all details before completing a donation.",
    },
    {
      question: "How can I contact customer support?",
      answer:
        "You can reach out to us via our Contact page or email us directly at support@instafam.social.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-text py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold text-center mb-10 text-primary">
          Frequently Asked Questions
        </h1>

        <div className="space-y-5">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-text/20 rounded-xl overflow-hidden shadow-md bg-text/5 backdrop-blur-md"
            >
              {/* Question */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center text-left px-6 py-4 text-lg md:text-xl font-semibold text-secondary hover:bg-text/10 transition"
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
