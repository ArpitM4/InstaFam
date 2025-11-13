"use client";

export default function About() {
  return (
    <div className="min-h-screen bg-background text-text pt-20 pb-10 px-6 flex flex-col items-center">
      <div className="max-w-4xl text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary tracking-tight">
          About <span className="text-accent">Sygil</span>
        </h1>
        <p className="text-base md:text-lg text-text/80 max-w-2xl mx-auto leading-relaxed">
          <span className="font-semibold text-accent">Sygil</span> is a platform built to bridge creators and their biggest supporters.
          We make it effortless for fans to contribute directly to their favorite creators — fueling
          the art, energy, and passion that make the internet alive.
        </p>

        <div className="mt-12 space-y-8 text-left">
          {/* Mission Section */}
          <section className="bg-secondary/10 p-6 rounded-xl shadow-sm backdrop-blur-sm hover:shadow-md transition">
            <h2 className="text-xl font-semibold mb-3 text-secondary text-center">🎯 Our Mission</h2>
            <p className="text-text/80 text-base leading-relaxed text-center max-w-2xl mx-auto">
              To empower every digital creator with independence. 
              Sygil helps them turn creativity into sustainability — transforming followers into 
              real community, and appreciation into meaningful support.
            </p>
          </section>

          {/* Why Sygil Section */}
          <section className="bg-secondary/10 p-6 rounded-xl shadow-sm backdrop-blur-sm hover:shadow-md transition">
            <h2 className="text-xl font-semibold mb-4 text-secondary text-center">🚀 Why Choose Sygil?</h2>
            <ul className="text-text/80 text-base list-disc list-inside space-y-3 max-w-2xl mx-auto">
              <li>
                <span className="text-primary font-semibold">Transparent & Fair:</span> Creators receive their full support amount — no hidden cuts.
              </li>
              <li>
                <span className="text-primary font-semibold">Instant Support:</span> Fans can send love (and funds) in seconds, not forms.
              </li>
              <li>
                <span className="text-primary font-semibold">Trusted Payments:</span> Built on secure, verified payment systems for peace of mind.
              </li>
              <li>
                <span className="text-primary font-semibold">Interactive Events:</span> Leaderboards, campaigns, and milestones that bring fans together.
              </li>
            </ul>
          </section>

          {/* Vision Section */}
          <section className="bg-secondary/10 p-6 rounded-xl shadow-sm backdrop-blur-sm hover:shadow-md transition">
            <h2 className="text-xl font-semibold mb-3 text-secondary text-center">🌌 Our Vision</h2>
            <p className="text-text/80 text-base text-center max-w-2xl mx-auto leading-relaxed">
              A world where creativity is valued and rewarded directly. 
              Where creators own their work, fans fuel their journey, 
              and every contribution — big or small — builds something meaningful.
            </p>
          </section>

          {/* Contact Section */}
          <section className="text-center">
            <h2 className="text-xl font-semibold mb-3 text-secondary">📬 Get in Touch</h2>
            <p className="text-text/80 text-base max-w-2xl mx-auto leading-relaxed">
              Have feedback, ideas, or partnership queries? 
              We’d love to hear from you! Visit our{" "}
              <a
                href="/contact"
                className="text-accent underline hover:text-primary transition"
              >
                Contact Page
              </a>{" "}
              and drop us a message.
            </p>
          </section>
        </div>

        <footer className="mt-12 text-center">
          <p className="text-sm text-text/40">
            © {new Date().getFullYear()} <span className="text-accent font-semibold">Sygil</span> — 
            built for creators, powered by community.
          </p>
        </footer>
      </div>
    </div>
  );
}
