"use client";

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-900 text-white py-10">
      <div className="container mt-10 mx-auto px-6 lg:px-20">
        <h1 className="text-4xl lg:text-6xl font-extrabold text-center mb-8">
          Contact Us
        </h1>
        <p className="text-lg lg:text-xl text-center max-w-4xl mx-auto leading-relaxed">
          We’d love to hear from you! Whether you have questions, feedback, or just want to say hi, 
          feel free to get in touch with us.
        </p>
        <div className="mt-12 text-center">
          <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
          <p className="text-lg lg:text-xl mb-4">
            <span className="font-bold text-blue-200">Email:</span> 
            <a href="mailto:arpitmaurya1506@gmail.com" className="underline text-blue-300 hover:text-blue-400 ml-2">
              support@instafam.com
            </a>
          </p>
          <p className="text-lg lg:text-xl mb-4">
            <span className="font-bold text-blue-200">Phone:</span> 
            <a href="tel:7982432872" className="underline text-blue-300 hover:text-blue-400 ml-2">
              +91 7982432872
            </a>
          </p>
        </div>
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Send Us a Message</h2>
          <form className="max-w-3xl mx-auto space-y-6">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-gray-300 font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Enter your name"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-gray-300 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Message Input */}
            <div>
              <label htmlFor="message" className="block text-gray-300 font-medium mb-2">
                Message
              </label>
              <textarea
                id="message"
                rows="4"
                placeholder="Write your message"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition"
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
