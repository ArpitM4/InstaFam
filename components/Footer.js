"use client"
import React from 'react'
import "../app/globals.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram } from '@fortawesome/free-brands-svg-icons'



const Footer = () => {
  return (
<footer className="bg-background text-text py-10 border-t border-dropdown-border">
  <div className="max-w-screen-xl mx-auto px-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      
      {/* Column 1: Brand/Logo Section */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-gradient">Sygil</h2>
        <p className="text-lg opacity-80">
Designed for creators. Built for connection.        </p>
      </div>

      {/* Column 2: Links Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Quick Links</h3>
        <ul className="space-y-2 opacity-85">
          <li><a href="/" className="hover:underline">Home</a></li>
          <li><a href="/about" className="hover:underline">About Us</a></li>
          <li><a href="/blogs" className="hover:underline">Creator School</a></li>
          <li><a href="/contact" className="hover:underline">Contact</a></li>
          <li><a href="/terms" className="hover:underline">Terms of Service</a></li>
          <li><a href="/privacypolicy" className="hover:underline">Privacy Policy</a></li>
          <li><a href="/faqs" className="hover:underline">FAQ</a></li>
        </ul>
      </div>

      {/* Column 3: Social Media Links */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Follow Us</h3>
        <div className="flex space-x-6">
          {/* <a href="#" className="text-2xl hover:underline">
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="#" className="text-2xl hover:underline">
            <i className="fab fa-twitter"></i>
          </a> */}
         <a target='_blank' href="https://www.instagram.com/_sygil_official/" className="text-2xl hover:underline flex items-center space-x-2">
            <FontAwesomeIcon icon={faInstagram} className="opacity-80" />
            <span>Instagram</span>
          </a>
          {/* <a href="#" className="text-2xl hover:underline">
            <i className="fab fa-linkedin-in"></i>
          </a> */}
        </div>
      </div>
    </div>

    {/* Copyright Section */}
    <div className="mt-10 border-t border-dropdown-border pt-6 text-center">
      <p className="text-sm text-text/60">
        &copy; {new Date().getFullYear()} Sygil. All rights reserved.
      </p>
    </div>
  </div>
</footer>

)
}

export default Footer
