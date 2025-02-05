"use client";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-900 text-white py-10">
      <div className="container mt-10 mx-auto px-6 lg:px-20">
        <h1 className="text-4xl lg:text-6xl font-extrabold text-center mb-8">
          About Us
        </h1>
        <p className="text-lg lg:text-xl text-center max-w-4xl mx-auto leading-relaxed">
          Welcome to <span className="font-bold text-blue-200">InstaSupport</span>! 
          We are a platform designed to help fans support their favorite Instagram creators through 
          seamless and secure donations. Whether it’s funding a creator’s next project or showing 
          your appreciation, we make it simple and impactful.
        </p>
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Our Mission</h2>
          <p className="text-lg lg:text-xl text-center max-w-3xl mx-auto leading-relaxed">
            Our mission is to empower creators by providing a dedicated space where their fans 
            can support them directly. We believe in fostering connections and helping creators 
            turn their passion into sustainable careers.
          </p>
        </div>
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Why Choose Us?</h2>
          <ul className="list-disc list-inside text-lg lg:text-xl leading-relaxed max-w-4xl mx-auto space-y-4">
            <li>
              <span className="font-bold text-pink-200">Transparency:</span> 100% of your donations reach the creators.
            </li>
            <li>
              <span className="font-bold text-pink-200">Ease of Use:</span> A simple and intuitive donation process.
            </li>
            <li>
              <span className="font-bold text-pink-200">Secure Payments:</span> State-of-the-art payment processing ensures 
              your transactions are safe.
            </li>
          </ul>
        </div>
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Get in Touch</h2>
          <p className="text-lg lg:text-xl text-center max-w-3xl mx-auto leading-relaxed">
            If you have any questions or feedback, we’d love to hear from you. Reach out to us via 
            our <a href="/contact" className="underline text-blue-300 hover:text-blue-400">Contact Page</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
