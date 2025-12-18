"use client";

import React from 'react';
import Link from 'next/link';
import Footer from '../../components/Footer';

export default function About() {
  return (
    <>
      <div className="min-h-screen bg-background text-text pt-8 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <h1 className="text-3xl md:text-5xl font-extrabold text-center text-primary mb-4 tracking-tight">
            About Sygil
          </h1>
          <p className="text-base md:text-lg text-text/80 mb-12 text-center max-w-3xl mx-auto leading-relaxed">
            Sygil is a creator support and engagement platform built to simplify how creators connect with their audience and receive support.
          </p>

          <div className="space-y-12">

            {/* 1. Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">1. Our Goal</h2>
              <p className="text-text/80 leading-relaxed mb-4">
                Today, creators are spread across multiple platforms — subscriptions, memberships, links, donation tools, and social media — making it difficult to manage their community in one place. Sygil exists to solve this fragmentation.
              </p>
              <p className="text-text/80 leading-relaxed font-medium">
                Our mission is to give creators one unified space to engage their audience and receive voluntary support, without complexity.
              </p>
            </section>

            {/* 2. What We Do */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">2. What We Do</h2>
              <p className="text-text/80 leading-relaxed mb-4">
                Sygil enables fans to voluntarily contribute to creators they appreciate, similar to tipping or fan support on major creator platforms. Creators use Sygil to host engagement events, interact with their supporters, and build a closer relationship with their community.
              </p>
              <p className="text-text/80 mb-2 font-medium">Contributions are:</p>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed">
                <li>Completely voluntary</li>
                <li>Not mandatory</li>
                <li>Not tied to the purchase of any product or service</li>
              </ul>
            </section>

            {/* 3. How Sygil Works */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">3. How Sygil Works</h2>
              <ul className="space-y-3 pl-5 list-disc text-text/80 leading-relaxed">
                <li>
                  <strong>Fans Contribute:</strong> Fans choose to contribute money to support a creator.
                </li>
                <li>
                  <strong>Platform Facilitates:</strong> Sygil provides the technology that facilitates this interaction.
                </li>
                <li>
                  <strong>Creator Receives:</strong> The creator is the primary beneficiary of the contribution.
                </li>
                <li>
                  <strong>Small Fee:</strong> Sygil charges a small platform service fee for providing hosting, tools, and infrastructure.
                </li>
                <li>
                  <strong>Settlement:</strong> The remaining amount is settled to the creator.
                </li>
                <li>
                  <strong>No Gambling:</strong> Sygil does not sell products, run lotteries, or offer any chance-based rewards.
                </li>
              </ul>
            </section>

            {/* 4. FamPoints */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">4. FamPoints</h2>
              <p className="text-text/80 leading-relaxed mb-4">
                To recognize supporter participation, Sygil uses FamPoints. They are simply a symbolic way to acknowledge support and participation within a creator’s community.
              </p>

              <p className="text-text/80 mb-2 font-medium">FamPoints are:</p>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed mb-4">
                <li>Non-monetary</li>
                <li>Non-transferable</li>
                <li>Not redeemable for cash</li>
                <li>Not a financial instrument</li>
                <li>Not guaranteed to unlock any benefit</li>
              </ul>
              <p className="text-text/80 italic">
                "FamPoints do not represent a purchase, investment, or entitlement."
              </p>
            </section>

            {/* 5. Clarification: What Sygil Is Not */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">5. What Sygil Is Not</h2>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed">
                <li>Sygil is <strong>not</strong> a charity or donation platform.</li>
                <li>Sygil is <strong>not</strong> a marketplace selling digital goods.</li>
                <li>Sygil does <strong>not</strong> operate wallets, stored value systems, or financial instruments.</li>
                <li>Sygil does <strong>not</strong> offer gambling, lotteries, contests, or games of chance.</li>
                <li>All contributions are voluntary, without expectation of returns.</li>
              </ul>
            </section>

            {/* 6. Philosophy & Values */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">6. Philosophy & Values</h2>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed mb-6">
                <li>Creators should not need multiple platforms to manage one audience.</li>
                <li>Fans should be able to support creators in a simple, transparent way.</li>
                <li>Engagement should feel human, not transactional.</li>
                <li>Simplicity and clarity matter more than complexity.</li>
              </ul>

              <h3 className="text-xl font-semibold text-text mb-3">Built for the Long Term</h3>
              <p className="text-text/80 leading-relaxed mb-4">
                Sygil is built as a long-term platform for creators, with a strong focus on Transparency, Compliance, Sustainability, and Trust. As we grow, we aim to continuously improve the tools creators use to engage their audience — without compromising legal or ethical standards.
              </p>
            </section>

            {/* Footer Statement */}
            <section className="bg-secondary/10 p-6 rounded-xl border border-secondary/20 mt-8">
              <p className="text-lg md:text-xl font-medium text-text/90 italic text-center leading-relaxed mb-4">
                "Sygil is a platform where fans voluntarily support creators, and creators build stronger communities — all in one place."
              </p>
              <p className="text-sm text-text/60 text-center">
                For detailed terms governing platform use, please refer to our{' '}
                <Link href="/terms" className="hover:text-primary transition-colors underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacypolicy" className="hover:text-primary transition-colors underline">Privacy Policy</Link>.
              </p>
            </section>

          </div>
        </div>
      </div>
      <Footer forceShow={true} />
    </>
  );
}
