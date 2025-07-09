"use client";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold text-center text-[#fb0582] mb-10">
          Privacy Policy
        </h1>
        <p className="text-center text-gray-300 text-lg max-w-3xl mx-auto mb-8">
          Last updated on <span className="text-white">06-02-2025</span>
        </p>

        <p className="text-lg text-white/80 mb-8 text-center max-w-3xl mx-auto">
          Your privacy is critically important to us at <span className="font-bold text-white">InstaFam</span>. This Privacy Policy outlines how we collect, use, and protect your personal information when you use our platform.
        </p>

        {/* Section 1 */}
        <div className="mt-12">
          <h2 className="text-3xl font-semibold text-[#fdcc03] mb-4">1. Information We Collect</h2>
          <ul className="list-disc list-inside text-white/90 space-y-4 pl-4">
            <li>
              <strong>Personal Information:</strong> Your name, email address, and any optional data shared while signing up or donating.
            </li>
            <li>
              <strong>Payment Information:</strong> Processed securely via trusted gateways like Razorpay or PayU. We do not store card or UPI details.
            </li>
            <li>
              <strong>Usage Data:</strong> Device/browser info, pages visited, search terms, IP address — to improve your experience.
            </li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="mt-12">
          <h2 className="text-3xl font-semibold text-[#fdcc03] mb-4">2. How We Use Your Information</h2>
          <ul className="list-disc list-inside text-white/90 space-y-4 pl-4">
            <li>To provide and maintain our platform and features.</li>
            <li>To process and confirm donations.</li>
            <li>To send updates, promotional content, or transaction confirmations.</li>
            <li>To improve user experience and ensure security.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="mt-12">
          <h2 className="text-3xl font-semibold text-[#fdcc03] mb-4">3. Sharing Your Information</h2>
          <p className="text-white/80">
            We do <strong>not</strong> sell or rent your personal information. We only share limited data with trusted third parties involved in:
          </p>
          <ul className="list-disc list-inside text-white/90 mt-2 space-y-2 pl-4">
            <li>Payment processing (e.g., PayU, Razorpay)</li>
            <li>Hosting or analytics (e.g., Vercel, Google)</li>
            <li>Compliance with legal requirements</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="mt-12">
          <h2 className="text-3xl font-semibold text-[#fdcc03] mb-4">4. Data Security</h2>
          <p className="text-white/80">
            We take your data seriously. All data is stored on secure, access-controlled servers with SSL encryption. Payment gateways used by us are PCI-DSS compliant.
          </p>
        </div>

        {/* Section 5 */}
        <div className="mt-12">
          <h2 className="text-3xl font-semibold text-[#fdcc03] mb-4">5. Your Rights</h2>
          <p className="text-white/80 mb-2">
            You have the right to:
          </p>
          <ul className="list-disc list-inside text-white/90 pl-4 space-y-2">
            <li>Request a copy of your stored personal data</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your account and associated data</li>
          </ul>
          <p className="text-white/80 mt-4">
            Email us at <a href="mailto:support@instafam.social" className="underline text-blue-400">support@instafam.social</a> for any requests.
          </p>
        </div>

        {/* Section 6 */}
        <div className="mt-12">
          <h2 className="text-3xl font-semibold text-[#fdcc03] mb-4">6. Cookies</h2>
          <p className="text-white/80">
            We use cookies for authentication, analytics, and improving user experience. You may disable cookies in your browser, but some features may not work as expected.
          </p>
        </div>

        {/* Section 7 */}
        <div className="mt-12">
          <h2 className="text-3xl font-semibold text-[#fdcc03] mb-4">7. Policy Updates</h2>
          <p className="text-white/80">
            We may revise this policy as needed. Changes will be posted here with a new date. Continued use of the platform indicates your acceptance of the updated policy.
          </p>
        </div>

        {/* Section 8 */}
        <div className="mt-12">
          <h2 className="text-3xl font-semibold text-[#fdcc03] mb-4">8. Contact Us</h2>
          <p className="text-white/80">
            Legal Entity: <strong>ARPIT MAURYA</strong><br />
            Email: <a href="mailto:support@instafam.social" className="underline text-blue-400">support@instafam.social</a><br />
            Phone: <a href="tel:+917982432872" className="underline text-blue-400">+91 7982432872</a><br />
            Address: Bawana Rd, Delhi Technological University, Shahbad Daulatpur Village, Rohini, New Delhi, Delhi 110042
          </p>
        </div>
      </div>
    </div>
  );
}
