"use client";

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white py-16 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-8 text-[#fb0582]">
          About InstaFam
        </h1>

        <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
          Welcome to <span className="text-[#fdcc03] font-bold">InstaFam</span> — where creators shine and fans empower. 
          We help fans support their favorite Instagram creators through quick, secure donations. 
          Whether it’s for a new camera, a dance shoot, or just appreciation — we make every rupee count.
        </p>

        <div className="mt-16">
          <h2 className="text-3xl font-semibold mb-4 text-[#dddbff]">🎯 Our Mission</h2>
          <p className="text-white/80 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            We empower Instagram creators by giving them the tools to build a direct support system. 
            Our goal is to turn passion into career, and fandom into fuel.
          </p>
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-semibold mb-6 text-[#dddbff]">🚀 Why InstaFam?</h2>
          <ul className="text-white/80 text-left list-disc list-inside space-y-4 text-lg md:text-xl max-w-3xl mx-auto">
            <li>
              <span className="text-[#fb0582] font-semibold">100% Transparent:</span> Every donation goes directly to the creator.
            </li>
            <li>
              <span className="text-[#fb0582] font-semibold">One-Tap Support:</span> Fans can donate in seconds — no hassle.
            </li>
            <li>
              <span className="text-[#fb0582] font-semibold">Safe & Secure:</span> Built with top-tier payment systems and encryption.
            </li>
            <li>
              <span className="text-[#fb0582] font-semibold">Real-Time Leaderboards:</span> Engage fans with time-bound support events.
            </li>
          </ul>
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-semibold mb-4 text-[#dddbff]">📬 Let’s Talk</h2>
          <p className="text-white/80 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Got feedback? A question? A crazy idea? We’re listening. Head over to our{" "}
            <a
              href="/contact"
              className="text-[#fdcc03] underline hover:text-[#fb0582] transition"
            >
              Contact Page
            </a>{" "}
            and let’s chat.
          </p>
        </div>

        <div className="mt-16">
          <p className="text-sm text-white/40">© {new Date().getFullYear()} InstaFam. Built for creators, loved by fans.</p>
        </div>
      </div>
    </div>
  );
}
