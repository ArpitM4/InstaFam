"use client";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background text-text pt-20 pb-10 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-primary mb-4">
          Contact Us
        </h1>
        <p className="text-center text-text/60 text-sm max-w-2xl mx-auto mb-8">
          Last updated: <span className="text-text">November 13, 2025</span>
        </p>

        <p className="text-base text-text/80 mb-12 text-center max-w-2xl mx-auto">
          Have questions, feedback, or partnership inquiries? We'd love to hear from you.
        </p>

        {/* Contact Information */}
        <div className="mt-12 mb-16">
          <h2 className="text-xl font-semibold text-secondary mb-6 text-center">Get In Touch</h2>
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary/5 border border-text/5">
              <div className="text-primary mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-text mb-1">Email</p>
                <a href="mailto:contact@sygil.app" className="text-secondary hover:text-primary transition">
                  contact@sygil.app
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary/5 border border-text/5">
              <div className="text-primary mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-text mb-1">Phone</p>
                <a href="tel:+917982432872" className="text-secondary hover:text-primary transition">
                  +91 7982432872
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary/5 border border-text/5">
              <div className="text-primary mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-text mb-1">Location</p>
                <p className="text-text/80 text-sm">New Delhi, India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="mt-16">
          <h2 className="text-xl font-semibold text-secondary mb-6 text-center">Send a Message</h2>
          <form className="max-w-2xl mx-auto space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2 text-text/90">
                Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Your name"
                className="w-full px-4 py-3 bg-background border border-text/10 rounded-lg text-text placeholder-text/40 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-text/90">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 bg-background border border-text/10 rounded-lg text-text placeholder-text/40 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2 text-text/90">
                Message
              </label>
              <textarea
                id="message"
                rows="5"
                placeholder="How can we help you?"
                className="w-full px-4 py-3 bg-background border border-text/10 rounded-lg text-text placeholder-text/40 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none"
              ></textarea>
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition shadow-sm hover:shadow-md"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>

        {/* Legal Entity Info */}
        <div className="mt-16 pt-8 border-t border-text/5">
          <p className="text-center text-sm text-text/60">
            <span className="font-semibold text-text/80">Legal Entity:</span> ARPIT MAURYA
            <br />
            <span className="font-semibold text-text/80">Registered Address:</span> Bawana Rd, Delhi Technological University,
            <br />
            Shahbad Daulatpur Village, Rohini, New Delhi, Delhi 110042
          </p>
        </div>
      </div>
    </div>
  );
}
