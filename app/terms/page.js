"use client";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-900 text-white py-10">
      <div className="container mt-10 mx-auto px-6 lg:px-20">
        <h1 className="text-4xl lg:text-6xl font-extrabold text-center mb-8">
          Terms of Service
        </h1>
        <div className="space-y-8 text-lg lg:text-xl leading-relaxed max-w-4xl mx-auto">
          <p>
            Welcome to <span className="font-bold text-blue-200">InstaSupport</span>. By using our platform, 
            you agree to the following terms and conditions. Please read them carefully.
          </p>

          <div>
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using our platform, you agree to comply with and be bound by these Terms 
              of Service. If you do not agree to these terms, you may not use our services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">2. User Responsibilities</h2>
            <p>
              Users must provide accurate and complete information when signing up or making donations. 
              Misrepresentation may result in suspension of services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">3. Donations</h2>
            <p>
              Donations made on our platform are final and non-refundable. It is the user’s responsibility 
              to ensure the accuracy of the donation amount and recipient.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">4. Prohibited Activities</h2>
            <p>
              Users may not use our platform for any unlawful or fraudulent activities, including 
              but not limited to money laundering or unauthorized transactions.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">5. Termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts at our sole discretion for 
              violation of these terms or misuse of our platform.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">6. Limitation of Liability</h2>
            <p>
              InstaSupport is not responsible for any damages resulting from the use or inability 
              to use our services. Donations are processed securely, but users assume all risks.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">7. Changes to Terms</h2>
            <p>
              We reserve the right to update or modify these Terms of Service at any time. Changes 
              will be effective immediately upon posting. Continued use of our services constitutes 
              acceptance of the updated terms.
            </p>
          </div>

          <p className="text-center mt-8">
            If you have any questions about these terms, please contact us via our 
            <a href="/contact" className="underline text-blue-300 hover:text-blue-400 ml-2">
              Contact Page
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
