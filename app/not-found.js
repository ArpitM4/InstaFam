// app/not-found.js
"use client";

import Link from "next/link";
import SEO from "@/components/SEO";
import { FaArrowLeft } from "react-icons/fa";

export default function NotFound() {
  return (
    <>
      <SEO
        title="Page Not Found"
        description="The page you're looking for doesn't exist."
        url="https://www.sygil.app/404"
      />
      
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-text text-center px-6">
        <div className="bg-dropdown-hover rounded-xl p-12 max-w-lg mx-auto">
          <div className="text-6xl mb-6" role="img" aria-label="Page not found">🔍</div>
          <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
          <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
          <p className="text-text/60 mb-6 leading-relaxed">
            Oops! The page you're looking for doesn't exist or has been moved.
            Let's get you back to discovering amazing creators!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/"
              className="flex items-center justify-center text-white px-6 py-3 bg-primary rounded-xl hover:bg-primary/80 transition font-medium"
            >
              <FaArrowLeft className="mr-2" /> Back to Home
            </Link>
            <Link
              href="/explore"
              className="bg-text/10 hover:bg-text/20 text-text px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Explore Creators
            </Link>
          </div>
          
          {/* Helpful links */}
          <div className="pt-6 border-t border-text/20">
            <p className="text-sm text-text/60 mb-4">Quick links:</p>
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <Link href="/blogs" className="text-primary hover:text-primary/80 transition-colors">
                Creator School
              </Link>
              <Link href="/about" className="text-primary hover:text-primary/80 transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="text-primary hover:text-primary/80 transition-colors">
                Contact
              </Link>
              <Link href="/faqs" className="text-primary hover:text-primary/80 transition-colors">
                FAQs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
