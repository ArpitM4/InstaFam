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
      answer: "InstaSupport is a platform that allows fans to donate directly to their favorite Instagram creators, helping them sustain their passion and creativity.",
    },
    {
      question: "How can I make a donation?",
      answer: "To make a donation, navigate to the creator's page, enter your details, select the amount, and complete the payment using our secure gateway.",
    },
    {
      question: "Is my payment information secure?",
      answer: "Yes, all payments are processed securely using industry-standard encryption and payment protocols.",
    },
    {
      question: "Can I request a refund?",
      answer: "All donations are final and non-refundable. Please ensure you review all details before completing a donation.",
    },
    {
      question: "How can I contact customer support?",
      answer: "You can reach out to us via our Contact Us page or email us directly at arpitmaurya1506@gmail.com.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-900 text-white py-10">
      <div className="container mt-10 mx-auto px-6 lg:px-20">
        <h1 className="text-4xl lg:text-6xl font-extrabold text-center mb-8">
          Frequently Asked Questions
        </h1>
        <div className="space-y-4 max-w-4xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white bg-opacity-20 rounded-lg shadow-md overflow-hidden"
            >
              {/* Question */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left px-6 py-4 text-lg lg:text-xl font-bold flex justify-between items-center text-white"
              >
                <span>{faq.question}</span>
                <svg
                  className={`w-6 h-6 transform ${
                    openIndex === index ? "rotate-180" : ""
                  } transition-transform`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Answer */}
              {openIndex === index && (
                <div className="px-6 py-4 bg-white bg-opacity-10 text-white">
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
