"use client";
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FaEye, FaTimes } from 'react-icons/fa';

/**
 * PreviewBanner - Shows a fixed banner at the top when creator is in preview mode
 * Allows exiting preview mode with a single click
 */
const PreviewBanner = ({ username }) => {
    const router = useRouter();
    const pathname = usePathname();

    const handleExitPreview = () => {
        // Remove the viewAs query param and navigate back to normal view
        const cleanPath = pathname.split('?')[0];
        router.push(cleanPath);
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-[10000] bg-gradient-to-r from-primary via-purple-600 to-primary animate-gradient-x">
            <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
                {/* Left: Icon + Message */}
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-1.5 rounded-full">
                        <FaEye className="text-white text-sm" />
                    </div>
                    <div className="text-white">
                        <span className="font-bold text-sm md:text-base">Preview Mode</span>
                        <span className="hidden sm:inline text-white/80 text-sm ml-2">
                            — This is how visitors see your page
                        </span>
                    </div>
                </div>

                {/* Right: Exit Button */}
                <button
                    onClick={handleExitPreview}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200 hover:scale-105"
                >
                    <FaTimes className="text-xs" />
                    <span>Exit Preview</span>
                </button>
            </div>
        </div>
    );
};

export default PreviewBanner;
