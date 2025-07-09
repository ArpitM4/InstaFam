"use client";

export default function Contact() {
  return (
    <div className="min-h-screen bg-black text-white py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold text-center mb-8 text-[#fb0582]">
          Contact Us
        </h1>

        <p className="text-lg md:text-xl text-center text-white/80 max-w-4xl mx-auto leading-relaxed mb-12">
          Last updated on 06-02-2025 11:03:26
          <br /><br />
          You may contact us using the information below:
          <br /><br />
          <span className="text-[#fdcc03] font-bold">Merchant Legal Entity Name:</span> ARPIT MAURYA
          <br />
          <span className="text-[#fdcc03] font-bold">Registered Address:</span> Bawana Rd, Delhi Technological University, Shahbad Daulatpur Village, Rohini, New Delhi, Delhi, 110042
          <br />
          <span className="text-[#fdcc03] font-bold">Operational Address:</span> Same as above
          <br />
          <span className="text-[#fdcc03] font-bold">Phone:</span> <a href="tel:7982432872" className="text-[#dddbff] underline hover:text-[#fb0582]">+91 7982432872</a>
          <br />
          <span className="text-[#fdcc03] font-bold">Email:</span> <a href="mailto:support@instafam.social" className="text-[#dddbff] underline hover:text-[#fb0582]">support@instafam.social</a>
        </p>

        <div className="text-center mt-10">
          <h2 className="text-3xl font-bold mb-6 text-[#dddbff]">Send Us a Message</h2>
          <form className="max-w-3xl mx-auto space-y-6">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block font-medium mb-1 text-white/70">
                Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-[#fb0582] outline-none"
              />
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block font-medium mb-1 text-white/70">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-[#fb0582] outline-none"
              />
            </div>

            {/* Message Input */}
            <div>
              <label htmlFor="message" className="block font-medium mb-1 text-white/70">
                Message
              </label>
              <textarea
                id="message"
                rows="4"
                placeholder="Write your message"
                className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-[#fb0582] outline-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full bg-[#fb0582] hover:bg-[#e10475] text-white font-bold py-3 px-4 rounded-lg transition"
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
