import React from "react";
import Link from "next/link";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background pt-20 text-text flex items-center justify-center px-4">
      <div className="text-center bg-dropdown-hover rounded-xl p-12 max-w-lg mx-auto">
        <div className="text-6xl mb-6">📖</div>
        <h1 className="text-3xl font-bold text-primary mb-4">
          Blog Post Not Found
        </h1>
        <p className="text-text/70 mb-8 leading-relaxed">
          The blog post you're looking for doesn't exist or may have been moved. 
          Let's get you back to learning!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/blogs"
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Back to Creator School
          </Link>
          <Link
            href="/"
            className="bg-text/10 hover:bg-text/20 text-text px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
