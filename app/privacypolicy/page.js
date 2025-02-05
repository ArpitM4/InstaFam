"use client";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-900 text-white py-10">
      <div className="container mt-10 mx-auto px-6 lg:px-20">
        <h1 className="text-4xl lg:text-6xl font-extrabold text-center mb-8">
          Privacy Policy
        </h1>
        <p className="text-lg lg:text-xl text-center max-w-4xl mx-auto leading-relaxed">
          Your privacy is critically important to us at{" "}
          <span className="font-bold text-blue-200">InstaSupport</span>. This Privacy Policy explains how we collect, use, 
          and protect your personal information.
        </p>
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Information We Collect</h2>
          <ul className="list-disc list-inside text-lg lg:text-xl leading-relaxed max-w-4xl mx-auto space-y-4">
            <li>
              <span className="font-bold text-pink-200">Personal Information:</span> Name, email address, and other details 
              provided during registration or donation.
            </li>
            <li>
              <span className="font-bold text-pink-200">Payment Information:</span> Securely processed through trusted 
              payment gateways like Razorpay. We do not store sensitive payment details.
            </li>
            <li>
              <span className="font-bold text-pink-200">Usage Data:</span> Information about how you use our platform, 
              including pages visited, interactions, and preferences.
            </li>
          </ul>
        </div>
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6 text-center">How We Use Your Information</h2>
          <p className="text-lg lg:text-xl text-center max-w-3xl mx-auto leading-relaxed">
            We use the information collected to:
          </p>
          <ul className="list-disc list-inside text-lg lg:text-xl leading-relaxed max-w-4xl mx-auto space-y-4">
            <li>Provide and improve our services.</li>
            <li>Process donations and ensure they reach the intended creator.</li>
            <li>Communicate updates, promotions, or important information.</li>
          </ul>
        </div>
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Sharing Your Information</h2>
          <p className="text-lg lg:text-xl text-center max-w-3xl mx-auto leading-relaxed">
            We do not sell, trade, or rent your personal information to third parties. 
            We may share limited information with trusted partners to process payments or improve our platform.
          </p>
        </div>
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Your Rights</h2>
          <p className="text-lg lg:text-xl text-center max-w-3xl mx-auto leading-relaxed">
            You have the right to access, update, or delete your personal information. 
            For any requests, contact us at{" "}
            <a href="/contact" className="underline text-blue-300 hover:text-blue-400">our support page</a>.
          </p>
        </div>
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Changes to This Policy</h2>
          <p className="text-lg lg:text-xl text-center max-w-3xl mx-auto leading-relaxed">
            We may update this Privacy Policy from time to time. Any changes will be communicated 
            on this page with a revised date. Please review it periodically to stay informed.
          </p>
        </div>
        <div className="mt-12 text-center">
          <p className="text-lg lg:text-xl">
            If you have any questions or concerns about our Privacy Policy, reach out to us via 
            our <a href="/contact" className="underline text-blue-300 hover:text-blue-400">Contact Page</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
