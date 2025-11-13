"use client";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background text-text py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold text-center mb-8 text-primary">
          Contact Us
        </h1>

        <p className="text-lg md:text-xl text-center text-text/80 max-w-4xl mx-auto leading-relaxed mb-12">
          Last updated on 06-02-2025 11:03:26
          <br /><br />
          You may contact us using the information below:
          <br /><br />
          <span className="text-accent font-bold">Merchant Legal Entity Name:</span> ARPIT MAURYA
          <br />
          <span className="text-accent font-bold">Registered Address:</span> Bawana Rd, Delhi Technological University, Shahbad Daulatpur Village, Rohini, New Delhi, Delhi, 110042
          <br />
          <span className="text-accent font-bold">Operational Address:</span> Same as above
          <br />
          <span className="text-accent font-bold">Phone:</span> <a href="tel:7982432872" className="text-secondary underline hover:text-primary">+91 7982432872</a>
          <br />
          <span className="text-accent font-bold">Email:</span> <a href="mailto:support@sygil.app" className="text-secondary underline hover:text-primary">support@sygil.app</a>
        </p>

        <div className="text-center mt-10">
          <h2 className="text-3xl font-bold mb-6 text-secondary">Send Us a Message</h2>
          <form className="max-w-3xl mx-auto space-y-6">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block font-medium mb-1 text-text/70">
                Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-background border border-secondary/20 rounded-lg text-text placeholder-text/40 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block font-medium mb-1 text-text/70">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-background border border-secondary/20 rounded-lg text-text placeholder-text/40 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            {/* Message Input */}
            <div>
              <label htmlFor="message" className="block font-medium mb-1 text-text/70">
                Message
              </label>
              <textarea
                id="message"
                rows="4"
                placeholder="Write your message"
                className="w-full px-4 py-3 bg-background border border-secondary/20 rounded-lg text-text placeholder-text/40 focus:ring-2 focus:ring-primary outline-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/80 text-text font-bold py-3 px-4 rounded-lg transition"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
