"use client"
import React from 'react'
import "../app/globals.css";
import { useSession } from 'next-auth/react'

const Footer = ({ forceShow = false }) => {
  const { data: session } = useSession();

  // Hide footer when user is logged in (they use the Sidebar layout)
  // Unless forceShow is true (used on marketing pages like /creators)
  if (session && !forceShow) {
    return null;
  }

  return (
    <footer className="relative z-20 text-white py-12 border-t border-gray-800/50">
      <div className="max-w-screen-xl mx-auto px-6 relative z-10 flex flex-col items-center justify-center space-y-6">

        {/* Navigation Links */}
        <nav>
          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-gray-400">
            <li><a href="/" className="hover:text-white transition-colors duration-200">Home</a></li>
            <li><a href="/about" className="hover:text-white transition-colors duration-200">About Us</a></li>
            <li><a href="/blogs" className="hover:text-white transition-colors duration-200">Creator School</a></li>
            <li><a href="/contact" className="hover:text-white transition-colors duration-200">Contact</a></li>
            <li><a href="/terms" className="hover:text-white transition-colors duration-200">Terms of Service</a></li>
            <li><a href="/privacypolicy" className="hover:text-white transition-colors duration-200">Privacy Policy</a></li>
            <li><a href="/faqs" className="hover:text-white transition-colors duration-200">FAQ</a></li>
            <li><a href="/creators" className="hover:text-white transition-colors duration-200">Become a Creator</a></li>
          </ul>
        </nav>

        {/* Copyright Section */}
        <div className="text-center">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Sygil. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
