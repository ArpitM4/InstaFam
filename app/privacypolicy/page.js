"use client";

import React from 'react';
import Link from 'next/link';
import Footer from '../../components/Footer';

export default function PrivacyPolicy() {
  return (
    <>
      <div className="min-h-screen bg-background text-text pt-8 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <h1 className="text-3xl md:text-5xl font-extrabold text-center text-primary mb-4 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-center text-text/60 text-sm max-w-2xl mx-auto mb-12">
            Last updated: <span className="text-text font-medium">18/12/2025</span>
          </p>

          <p className="text-base md:text-lg text-text/80 mb-8 text-center max-w-3xl mx-auto leading-relaxed">
            Welcome to <span className="font-bold text-text">Sygil</span> (“Platform”, “we”, “us”, “our”). This Privacy Policy explains how we collect, use, disclose, and protect your information when you access or use the Sygil website, applications, and services.
          </p>
          <p className="text-base md:text-lg text-text/80 mb-12 text-center max-w-3xl mx-auto leading-relaxed">
            By using Sygil, you agree to the practices described in this Privacy Policy.
          </p>

          <div className="space-y-12">

            {/* 1. Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">1. Information We Collect</h2>
              <p className="text-text/80 leading-relaxed mb-4">
                We collect information only to the extent necessary to operate and improve the Platform.
              </p>

              <h3 className="text-xl font-semibold text-text mb-3">1.1 Information You Provide</h3>
              <p className="text-text/80 mb-2 font-medium">When you create an account or use Sygil, we may collect:</p>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed mb-4">
                <li>Name or username</li>
                <li>Email address</li>
                <li>Profile information (for creators)</li>
                <li>Any information you voluntarily provide through the Platform</li>
              </ul>
              <p className="text-text/80 leading-relaxed font-medium">
                We do not require unnecessary personal information.
              </p>

              <h3 className="text-xl font-semibold text-text mt-6 mb-3">1.2 Payment Information</h3>
              <p className="text-text/80 leading-relaxed mb-2">
                Payments on Sygil are processed by third-party payment gateways (such as Razorpay).
              </p>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed">
                <li>We do <strong>not</strong> collect or store your card, UPI, or bank account details.</li>
                <li>Payment information is handled directly by the payment gateway in accordance with their privacy policies.</li>
              </ul>

              <h3 className="text-xl font-semibold text-text mt-6 mb-3">1.3 Automatically Collected Information</h3>
              <p className="text-text/80 mb-2 font-medium">We may automatically collect limited technical information, such as:</p>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed mb-4">
                <li>Device type and browser information</li>
                <li>IP address</li>
                <li>Log data (pages visited, timestamps)</li>
                <li>Cookies or similar technologies for functionality and security</li>
              </ul>
              <p className="text-text/80 mb-2 font-medium">This information is used for:</p>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed">
                <li>Security</li>
                <li>Analytics</li>
                <li>Improving platform performance</li>
              </ul>
            </section>

            {/* 2. How We Use Information */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">2. How We Use Information</h2>
              <p className="text-text/80 mb-2 font-medium">We use collected information to:</p>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed mb-4">
                <li>Provide and operate the Platform</li>
                <li>Create and manage user accounts</li>
                <li>Facilitate contributions and settlements</li>
                <li>Communicate important updates or support messages</li>
                <li>Improve platform functionality and user experience</li>
                <li>Comply with legal and regulatory requirements</li>
              </ul>
              <p className="text-text/80 font-medium">
                We do not use your data for selling or profiling purposes.
              </p>
            </section>

            {/* 3. FamPoints & Activity Data */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">3. FamPoints & Activity Data</h2>
              <p className="text-text/80 mb-2 font-medium">FamPoints and related activity data:</p>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed mb-4">
                <li>Are used only for internal platform functionality</li>
                <li>Do not represent financial data or value</li>
                <li>Are not shared externally as a product or asset</li>
              </ul>
              <p className="text-text/80 leading-relaxed">
                FamPoints activity may be displayed within a creator’s community for transparency and engagement.
              </p>
            </section>

            {/* 4. Information Sharing & Disclosure */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">4. Information Sharing & Disclosure</h2>
              <p className="text-text/80 mb-4 font-bold">We do not sell your personal data.</p>
              <p className="text-text/80 mb-4">We may share information only in the following cases:</p>

              <h3 className="text-xl font-semibold text-text mb-3">4.1 Service Providers</h3>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed mb-4">
                <li>Payment gateways</li>
                <li>Hosting providers</li>
                <li>Analytics or security services</li>
              </ul>
              <p className="text-text/80 mb-6 italic">Only the minimum data required is shared.</p>

              <h3 className="text-xl font-semibold text-text mb-3">4.2 Legal Requirements</h3>
              <p className="text-text/80 mb-2 font-medium">We may disclose information if required to:</p>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed mb-6">
                <li>Comply with applicable laws</li>
                <li>Respond to legal requests</li>
                <li>Enforce our Terms of Service</li>
                <li>Protect the rights, safety, or integrity of Sygil or users</li>
              </ul>

              <h3 className="text-xl font-semibold text-text mb-3">4.3 Business Transfers</h3>
              <p className="text-text/80 leading-relaxed">
                If Sygil undergoes a merger, acquisition, or asset transfer, user information may be transferred as part of that transaction, subject to this Privacy Policy.
              </p>
            </section>

            {/* 5. Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">5. Data Retention</h2>
              <p className="text-text/80 mb-2 font-medium">We retain personal information only for as long as:</p>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed mb-4">
                <li>Necessary to provide services</li>
                <li>Required to comply with legal obligations</li>
                <li>Needed for legitimate business purposes</li>
              </ul>
              <p className="text-text/80 leading-relaxed">
                When data is no longer required, it is securely deleted or anonymized.
              </p>
            </section>

            {/* 6. Cookies & Tracking Technologies */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">6. Cookies & Tracking Technologies</h2>
              <p className="text-text/80 mb-2 font-medium">Sygil may use cookies or similar technologies to:</p>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed mb-4">
                <li>Maintain user sessions</li>
                <li>Improve platform performance</li>
                <li>Enhance security</li>
              </ul>
              <p className="text-text/80 leading-relaxed">
                You can control cookie settings through your browser preferences. Disabling cookies may affect certain features.
              </p>
            </section>

            {/* 7. Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">7. Data Security</h2>
              <p className="text-text/80 mb-2 font-medium">We take reasonable and appropriate measures to protect your information, including:</p>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed mb-4">
                <li>Secure servers and access controls</li>
                <li>Encryption where applicable</li>
                <li>Restricted internal access to user data</li>
              </ul>
              <p className="text-text/80 leading-relaxed">
                However, no system is completely secure. You use the Platform at your own risk.
              </p>
            </section>

            {/* 8. User Rights */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">8. User Rights</h2>
              <p className="text-text/80 mb-2 font-medium">Depending on applicable laws, you may have the right to:</p>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed mb-4">
                <li>Access your personal information</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your account and associated data</li>
              </ul>
              <p className="text-text/80 leading-relaxed">
                You may exercise these rights by contacting us at the email provided below.
              </p>
            </section>

            {/* 9. Children’s Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">9. Children’s Privacy</h2>
              <p className="text-text/80 leading-relaxed mb-2">
                Sygil is not intended for children under the age of 18.
              </p>
              <p className="text-text/80 leading-relaxed">
                We do not knowingly collect personal information from minors. If we become aware that such data has been collected, we will take steps to delete it.
              </p>
            </section>

            {/* 10. Third-Party Links */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">10. Third-Party Links</h2>
              <p className="text-text/80 leading-relaxed mb-2">
                Sygil may contain links to third-party websites or services.
              </p>
              <p className="text-text/80 leading-relaxed">
                We are not responsible for the privacy practices of third parties. We encourage you to review their privacy policies separately.
              </p>
            </section>

            {/* 11. Changes to This Policy */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">11. Changes to This Policy</h2>
              <p className="text-text/80 mb-2 font-medium">We may update this Privacy Policy from time to time.</p>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed">
                <li>Updates will be posted on this page</li>
                <li>Continued use of the Platform constitutes acceptance of the revised policy</li>
              </ul>
            </section>

            {/* 12. Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">12. Governing Law</h2>
              <p className="text-text/80 leading-relaxed">
                This Privacy Policy is governed by the laws of <strong>India</strong>.
              </p>
            </section>

            {/* 13. Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">13. Contact Information</h2>
              <p className="text-text/80 mb-4 leading-relaxed">
                If you have questions or concerns about this Privacy Policy, contact us at:
              </p>
              <ul className="space-y-1 text-text/80 leading-relaxed">
                <li>
                  <span className="font-semibold">Email:</span> <a href="mailto:contact@sygil.app" className="underline hover:text-primary transition-colors">contact@sygil.app</a>
                </li>
                <li>
                  <span className="font-semibold">Company:</span> Sygil
                </li>
              </ul>
            </section>

            {/* One-Line Summary */}
            <section className="bg-secondary/10 p-6 rounded-xl border border-secondary/20 mt-8">
              <h2 className="text-lg font-semibold text-secondary mb-2">One-Line Summary</h2>
              <p className="text-text/90 italic leading-relaxed">
                "Sygil collects only what is necessary to operate the platform, does not sell user data, and processes payments through secure third-party gateways."
              </p>
            </section>

          </div>
        </div>
      </div>
      <Footer forceShow={true} />
    </>
  );
}
