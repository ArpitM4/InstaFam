"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import AuthModal from "./AuthModal";

export default function PublicNavbar({ isPreviewMode = false }) {
    const [showAuthModal, setShowAuthModal] = useState(false);

    useEffect(() => {
        const handleOpenAuth = () => {
            if (isPreviewMode) {
                toast.info("Disabled in preview mode");
                return;
            }
            setShowAuthModal(true);
        };
        window.addEventListener('open-auth-modal', handleOpenAuth);
        return () => window.removeEventListener('open-auth-modal', handleOpenAuth);
    }, [isPreviewMode]);

    const handleLoginClick = () => {
        if (isPreviewMode) {
            toast.info("Disabled in preview mode");
            return;
        }
        setShowAuthModal(true);
    };

    return (
        <>
            {/* Extra top margin for preview banner */}
            <header className={`fixed left-0 right-0 z-50 transition-colors duration-300 bg-black md:bg-transparent ${isPreviewMode ? 'top-12' : 'top-0'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex-shrink-0" onClick={(e) => {
                            if (isPreviewMode) {
                                e.preventDefault();
                                toast.info("Disabled in preview mode");
                            }
                        }}>
                            <Image
                                src="/Text.png"
                                alt="Sygil"
                                width={100}
                                height={32}
                                className="h-8 w-auto"
                                priority
                            />
                        </Link>

                        {/* Login/Signup Button */}
                        <button
                            onClick={handleLoginClick}
                            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium backdrop-blur-md border border-white/10 transition-all hover:scale-105"
                        >
                            Login / Sign Up
                        </button>
                    </div>
                </div>
            </header>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                initialView="AUTH"
            />
        </>
    );
}
