"use client"
import React from 'react'
import "../app/globals.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram } from '@fortawesome/free-brands-svg-icons'
import { useSession } from 'next-auth/react'



const Footer = () => {
  const { data: session } = useSession();
  
  // Hide footer when user is logged in (they use the Sidebar layout)
  if (session) {
    return null;
  }

  return (
<footer className="relative z-20 bg-transparent text-white py-10">
  <div className="max-w-screen-xl mx-auto px-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      
      {/* Column 1: Brand/Logo Section */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold gradient-text">Sygil</h2>
        <p className="text-lg text-gray-300">
Designed for creators. Built for connection.        </p>
      </div>

      {/* Column 2: Links Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Quick Links</h3>
        <ul className="space-y-2 text-gray-300">
          <li><a href="/" className="hover:underline hover:text-white">Home</a></li>
          <li><a href="/about" className="hover:underline hover:text-white">About Us</a></li>
          <li><a href="/blogs" className="hover:underline hover:text-white">Creator School</a></li>
          <li><a href="/contact" className="hover:underline hover:text-white">Contact</a></li>
          <li><a href="/terms" className="hover:underline hover:text-white">Terms of Service</a></li>
          <li><a href="/privacypolicy" className="hover:underline hover:text-white">Privacy Policy</a></li>
          <li><a href="/faqs" className="hover:underline hover:text-white">FAQ</a></li>
        </ul>
      </div>

      {/* Column 3: Social Media Links */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Follow Us</h3>
        <div className="flex space-x-6">
          {/* <a href="#" className="text-2xl hover:underline">
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="#" className="text-2xl hover:underline">
            <i className="fab fa-twitter"></i>
          </a> */}
         <a target='_blank' href="https://www.instagram.com/sygil_official/" className="text-2xl hover:underline flex items-center space-x-2 text-gray-300 hover:text-white">
            <FontAwesomeIcon icon={faInstagram} />
            <span>Instagram</span>
          </a>
          {/* <a href="#" className="text-2xl hover:underline">
            <i className="fab fa-linkedin-in"></i>
          </a> */}
        </div>
      </div>
    </div>

    {/* Copyright Section */}
    <div className="mt-10 border-t border-gray-700 pt-6 text-center">
      <p className="text-sm text-gray-400">
        &copy; {new Date().getFullYear()} Sygil. All rights reserved.
      </p>
    </div>
  </div>
</footer>

)
}

export default Footer
