"use client";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-text pt-20 pb-10 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-primary mb-4">
          Privacy Policy
        </h1>
        <p className="text-center text-text/60 text-sm max-w-2xl mx-auto mb-8">
          Last updated: <span className="text-text">November 13, 2025</span>
        </p>

        <p className="text-base text-text/80 mb-8 text-center max-w-2xl mx-auto">
          At <span className="font-bold text-text">Sygil</span>, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and protect data across our platform (sygil.app).
        </p>

        {/* Section 1 */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-secondary mb-3">1. Information We Collect</h2>
          <p className="text-text/80 mb-3">We collect:</p>
          <ul className="list-disc list-inside text-text/90 space-y-3 pl-4">
            <li>
              <strong>Account Information:</strong> Name, username, and contact details (if provided).
            </li>
            <li>
              <strong>Donation Data:</strong> Transaction amount, date/time, and payment status.
            </li>
            <li>
              <strong>Technical Data:</strong> IP address, browser type, and cookies for analytics and security.
            </li>
            <li>
              <strong>Affiliate & Link Data:</strong> Clicks on affiliate links (for transparency and commissions).
            </li>
          </ul>
          <p className="text-text/80 mt-4">
            We <strong>do not store</strong> payment card, UPI, or banking credentials — those are handled by secure third-party gateways (like Razorpay or PayPal).
          </p>
        </div>

        {/* Section 2 */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-secondary mb-3">2. How We Use Information</h2>
          <p className="text-text/80 mb-3">We use your data to:</p>
          <ul className="list-disc list-inside text-text/90 space-y-3 pl-4">
            <li>Process donations and payouts.</li>
            <li>Display fan leaderboards and activity logs.</li>
            <li>Improve platform features and analytics.</li>
            <li>Comply with legal obligations (fraud prevention, audits, etc.).</li>
          </ul>
          <p className="text-text/80 mt-4">
            We never sell your personal data.
          </p>
        </div>

        {/* Section 3 */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-secondary mb-3">3. Cookies</h2>
          <p className="text-text/80 mb-3">We use cookies to:</p>
          <ul className="list-disc list-inside text-text/90 space-y-2 pl-4">
            <li>Keep you logged in.</li>
            <li>Measure engagement and performance.</li>
          </ul>
          <p className="text-text/80 mt-4">
            You can disable cookies in your browser settings, but some features may stop working.
          </p>
        </div>

        {/* Section 4 */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-secondary mb-3">4. Data Sharing</h2>
          <p className="text-text/80 mb-3">We may share limited data with:</p>
          <ul className="list-disc list-inside text-text/90 space-y-2 pl-4">
            <li><strong>Payment Processors</strong> (to complete transactions).</li>
            <li><strong>Analytics Providers</strong> (to improve performance).</li>
            <li><strong>Regulators or Law Enforcement</strong>, if legally required.</li>
          </ul>
          <p className="text-text/80 mt-4">
            We do <strong>not</strong> sell, rent, or trade user data with third parties.
          </p>
        </div>

        {/* Section 5 */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-secondary mb-3">5. Data Retention</h2>
          <p className="text-text/80">
            We retain data as long as your account is active or required by law. Users may request data deletion by emailing <a href="mailto:contact@sygil.app" className="underline text-secondary">contact@sygil.app</a>.
          </p>
        </div>

        {/* Section 6 */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-secondary mb-3">6. Security</h2>
          <p className="text-text/80">
            We use encryption, HTTPS, and access controls to secure your information. However, no online system is 100% secure — users are encouraged to use strong passwords and protect their accounts.
          </p>
        </div>

        {/* Section 7 */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-secondary mb-3">7. Your Rights</h2>
          <p className="text-text/80 mb-3">You can:</p>
          <ul className="list-disc list-inside text-text/90 pl-4 space-y-2">
            <li>Access and correct your personal data.</li>
            <li>Request data deletion.</li>
            <li>Opt out of promotional communications.</li>
          </ul>
          <p className="text-text/80 mt-4">
            Requests can be made to <a href="mailto:contact@sygil.app" className="underline text-secondary">contact@sygil.app</a>.
          </p>
        </div>

        {/* Section 8 */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-secondary mb-3">8. Third-Party Links</h2>
          <p className="text-text/80">
            Creator pages may include links to external sites (e.g., Instagram, YouTube, or affiliate stores). We are <strong>not responsible</strong> for the privacy practices of those sites.
          </p>
        </div>

        {/* Section 9 */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-secondary mb-3">9. Changes to This Policy</h2>
          <p className="text-text/80">
            We may update this policy periodically. Updates will be posted on this page with the revised "Last Updated" date.
          </p>
        </div>

        {/* Section 10 */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-secondary mb-3">10. Contact Us</h2>
          <p className="text-text/80 mb-3">
            If you have questions about privacy, contact:
          </p>
          <ul className="list-none text-text/90 space-y-1 pl-4">
            <li>Email: <a href="mailto:contact@sygil.app" className="underline text-secondary">contact@sygil.app</a></li>
            <li>Location: New Delhi, India</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
