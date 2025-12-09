"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AuthModal from "./AuthModal";

export default function PublicNavbar() {
    const [showAuthModal, setShowAuthModal] = useState(false);

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300 bg-black md:bg-transparent">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex-shrink-0">
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
                            onClick={() => setShowAuthModal(true)}
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
