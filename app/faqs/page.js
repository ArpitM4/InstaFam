"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "../../components/Footer";
import { FaChevronDown, FaChevronUp, FaSearch } from "react-icons/fa";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFAQ = (index) => {
    // If clicking same item, close it. Otherwise open new one.
    // Using simple string IDs like "category-index" to track open state globally if needed, 
    // or just flattening the list. 
    // Actually, distinct open states per category or one global state? 
    // Let's use a unique ID for each question.
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqCategories = [
    {
      title: "General",
      items: [
        {
          q: "What is Sygil?",
          a: "Sygil is a creator support and engagement platform where fans can voluntarily support creators they appreciate, and creators can engage their community from one unified space."
        },
        {
          q: "Is Sygil a charity or donation platform?",
          a: "No. Sygil is not a charity or NGO. Contributions on Sygil are voluntary fan support, similar to tipping on creator platforms."
        },
        {
          q: "Is Sygil free to use?",
          a: "Creating an account and exploring creators is free. When fans choose to contribute, a payment is involved."
        }
      ]
    },
    {
      title: "For Fans / Supporters",
      items: [
        {
          q: "What does it mean to “contribute” on Sygil?",
          a: "Contributing means voluntarily supporting a creator you appreciate. It is optional and not required to access the platform."
        },
        {
          q: "Am I buying something when I contribute?",
          a: "No. A contribution is not a purchase of a product or service, and it does not guarantee anything in return."
        },
        {
          q: "Do I get anything in return for contributing?",
          a: "You may receive FamPoints, which are a symbolic acknowledgment of support. FamPoints do not represent a product, service, or entitlement."
        },
        {
          q: "What are FamPoints?",
          a: "FamPoints are non-monetary loyalty acknowledgment points used to recognize supporter participation within a creator’s community."
        },
        {
          q: "Do FamPoints have monetary value?",
          a: (
            <>
              No. FamPoints:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Have no monetary value</li>
                <li>Are not redeemable for cash</li>
                <li>Are not transferable</li>
                <li>Are not a financial instrument</li>
              </ul>
            </>
          )
        },
        {
          q: "Can I refund a contribution?",
          a: "Contributions are generally non-refundable because they are voluntary. Refunds, if any, depend on payment gateway policies and applicable laws."
        },
        {
          q: "Do I need to pay GST on my contribution?",
          a: "No. Fans do not pay GST on voluntary contributions made on Sygil."
        }
      ]
    },
    {
      title: "For Creators",
      items: [
        {
          q: "Who can become a creator on Sygil?",
          a: "Any eligible individual or entity that complies with Sygil’s Terms of Service can become a creator."
        },
        {
          q: "How do creators earn money on Sygil?",
          a: "Creators receive voluntary contributions from fans. Sygil deducts a small platform service fee, and the remaining amount is settled to the creator."
        },
        {
          q: "Does Sygil take a commission?",
          a: "Yes. Sygil charges a small platform service fee for providing hosting, tools, and infrastructure."
        },
        {
          q: "How and when do creators receive payouts?",
          a: "Payouts are processed through the payment gateway and settled to the creator’s registered bank account, subject to standard settlement timelines."
        },
        {
          q: "Is Sygil responsible for my taxes as a creator?",
          a: "No. Creators are responsible for managing and paying their own income tax or other applicable taxes on earnings received through Sygil."
        },
        {
          q: "Can creators promise rewards or guaranteed benefits?",
          a: "No. Creators must not promise guaranteed rewards, returns, or benefits in exchange for contributions."
        }
      ]
    },
    {
      title: "Payments & Security",
      items: [
        {
          q: "How are payments processed?",
          a: "Payments are processed securely through third-party payment gateways such as Razorpay."
        },
        {
          q: "Does Sygil store my card or bank details?",
          a: "No. Sygil does not store card, UPI, or bank account details. All sensitive payment data is handled by the payment gateway."
        },
        {
          q: "Is Sygil safe to use?",
          a: "Sygil uses reasonable security measures and trusted payment partners to protect users and transactions. However, no online platform can guarantee absolute security."
        }
      ]
    },
    {
      title: "Legal & Compliance",
      items: [
        {
          q: "Is Sygil legal in India?",
          a: "Yes. Sygil operates as a commission-based platform facilitating voluntary creator support and complies with applicable Indian laws."
        },
        {
          q: "Is there any gambling, lottery, or chance-based system on Sygil?",
          a: "No. Sygil does not offer gambling, lotteries, contests, or games of chance."
        },
        {
          q: "Is Sygil a marketplace selling digital goods?",
          a: "No. Sygil does not sell digital goods or services to fans."
        },
        {
          q: "Does Sygil operate wallets or stored-value systems?",
          a: "No. Sygil does not operate wallets, prepaid instruments, or stored-value systems."
        }
      ]
    },
    {
      title: "Account & Data",
      items: [
        {
          q: "What data does Sygil collect?",
          a: "Sygil collects only the information necessary to operate the platform, such as account details and basic usage data. For more details, please refer to our Privacy Policy."
        },
        {
          q: "Can I delete my account?",
          a: "Yes. You can request account deletion by contacting Sygil support."
        }
      ]
    },
    {
      title: "Support",
      items: [
        {
          q: "How can I contact Sygil?",
          a: (
            <span>
              You can reach us at: <a href="mailto:support@sygil.app" className="text-primary hover:underline">support@sygil.app</a>
            </span>
          )
        }
      ]
    }
  ];

  // Logic to flatten categories for rendering if needed, or map directly.
  // Rendering logic will map categories, then items.

  return (
    <>
      <div className="min-h-screen bg-background text-text pt-8 pb-32 px-6 font-sans">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Frequently Asked <span className="text-primary">Questions</span>
            </h1>
            <p className="text-text/60 text-lg">
              Everything you need to know about Sygil.
            </p>
          </div>

          {/* Search (Optional but professional) */}
          <div className="relative max-w-xl mx-auto mb-16 hidden">
            {/* Can implement filter logic if desired, but user didn't explicitly ask for functionality, just UI. */}
          </div>

          <div className="space-y-12">
            {faqCategories.map((category, catIndex) => (
              <div key={catIndex}>
                <h2 className="text-xl font-bold text-secondary mb-6 border-b border-white/5 pb-2">
                  {category.title}
                </h2>
                <div className="space-y-4">
                  {category.items.map((item, itemIndex) => {
                    const uniqueId = `${catIndex}-${itemIndex}`;
                    const isOpen = openIndex === uniqueId;

                    return (
                      <div
                        key={itemIndex}
                        className="group border border-white/5 rounded-xl bg-white/5 hover:border-white/10 transition-colors overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFAQ(uniqueId)}
                          className="w-full flex justify-between items-center p-5 text-left transition-all"
                          aria-expanded={isOpen}
                        >
                          <span className={`font-medium text-lg ${isOpen ? 'text-primary' : 'text-text/90'}`}>
                            {item.q}
                          </span>
                          {isOpen ? (
                            <FaChevronUp className="text-primary w-4 h-4 shrink-0 ml-4" />
                          ) : (
                            <FaChevronDown className="text-text/40 group-hover:text-text/60 w-4 h-4 shrink-0 ml-4" />
                          )}
                        </button>

                        <div
                          className={`
                            px-5 text-text/70 leading-relaxed overflow-hidden transition-all duration-300 ease-in-out
                            ${isOpen ? 'max-h-96 opacity-100 pb-5 pt-0' : 'max-h-0 opacity-0'}
                          `}
                        >
                          <div className="pt-2 border-t border-white/5">
                            {item.a}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* One-Line Summary */}
          <section className="bg-secondary/10 p-6 rounded-xl border border-secondary/20 mt-16 text-center">
            <h2 className="text-sm font-bold text-secondary uppercase tracking-wider mb-2">Summary</h2>
            <p className="text-text/90 italic text-lg leading-relaxed">
              "Sygil is a platform where fans voluntarily support creators, without purchases, gambling, or financial products involved."
            </p>
          </section>

          {/* Still have questions? */}
          <div className="mt-16 text-center pt-8 border-t border-white/5">
            <p className="text-text/60 mb-4">Still have questions?</p>
            <Link href="/contact" className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">
              Contact Support
            </Link>
          </div>

        </div>
      </div>
      <Footer forceShow={true} />
    </>
  );
}
