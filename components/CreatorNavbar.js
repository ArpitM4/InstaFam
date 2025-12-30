"use client";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useUser } from "@/context/UserContext";
import { trackEvent, GA_EVENTS } from "@/utils/analytics";

export default function CreatorNavbar({ onOpenAuth }) {
    const { data: session } = useSession();
    const { userData } = useUser();

    const getStartedHref = session
        ? (userData?.accountType === 'Creator' || userData?.accountType === 'VCreator'
            ? `/${session.user.name}`
            : '/setup')
        : null;

    const handleGetStartedClick = () => {
        trackEvent(GA_EVENTS.NAVBAR_GET_STARTED_CLICK, { page: 'creators', isLoggedIn: !!session });
        if (!session && onOpenAuth) {
            onOpenAuth();
        }
    };

    return (
        <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center pointer-events-none bg-black md:bg-transparent">
            {/* Logo */}
            <Link
                href="/"
                className="pointer-events-auto transition-transform hover:scale-105"
                onClick={() => trackEvent(GA_EVENTS.NAVBAR_LOGO_CLICK, { page: 'creators' })}
            >
                <Image src="/Text.png" alt="Sygil" width={100} height={32} className="h-8 w-auto" priority />
            </Link>

            {/* Get Started Button */}
            {session ? (
                <Link
                    href={getStartedHref}
                    className="pointer-events-auto"
                    onClick={handleGetStartedClick}
                >
                    <button className="bg-white text-black px-5 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-lg hover:shadow-xl">
                        Get Started for Free
                    </button>
                </Link>
            ) : (
                <button
                    onClick={handleGetStartedClick}
                    className="pointer-events-auto bg-white text-black px-5 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
                >
                    Get Started for Free
                </button>
            )}
        </nav>
    );
}
