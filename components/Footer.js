"use client"
import React from 'react'
import "../app/globals.css";



const Footer = () => {
  return (
<footer className="bg-background text-text py-10 border-t border-secondary/30">
  <div className="max-w-screen-xl mx-auto px-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      
      {/* Column 1: Brand/Logo Section */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-gradient">InstaFam</h2>
        <p className="text-lg opacity-80">
          Support your favorite Instagram creators and empower them to succeed by joining our community. Get exclusive content and interact directly with creators.
        </p>
      </div>

      {/* Column 2: Links Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Quick Links</h3>
        <ul className="space-y-2">
          <li><a href="/" className="hover:text-primary">Home</a></li>
          <li><a href="/about" className="hover:text-primary">About Us</a></li>
          <li><a href="/contact" className="hover:text-primary">Contact</a></li>
          <li><a href="/terms" className="hover:text-primary">Terms of Service</a></li>
          <li><a href="/privacypolicy" className="hover:text-primary">Privacy Policy</a></li>
          <li><a href="/faqs" className="hover:text-primary">FAQ</a></li>
        </ul>
      </div>

      {/* Column 3: Social Media Links */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Follow Us</h3>
        <div className="flex space-x-6">
          <a href="#" className="text-2xl hover:text-primary">
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="#" className="text-2xl hover:text-primary">
            <i className="fab fa-twitter"></i>
          </a>
          <a target='blank' href="https://www.instagram.com/_instafam_official/" className="text-2xl hover:text-primary">
            <i className="fab fa-instagram">Instagram</i>
          </a>
          <a href="#" className="text-2xl hover:text-primary">
            <i className="fab fa-linkedin-in"></i>
          </a>
        </div>
      </div>
    </div>

    {/* Copyright Section */}
    <div className="mt-10 border-t border-secondary/30 pt-6 text-center">
      <p className="text-sm text-text/60">
        &copy; {new Date().getFullYear()} Insta_Support. All rights reserved.
      </p>
    </div>
  </div>
</footer>

)
}

export default Footer
