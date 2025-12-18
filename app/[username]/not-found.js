"use client";

import Link from "next/link";
import SEO from "@/components/SEO";
import { FaArrowLeft, FaSearch } from "react-icons/fa";

export default function CreatorNotFound() {
    return (
        <>
            <SEO
                title="Creator Not Found"
                description="The creator profile you are looking for does not exist."
                url="https://www.sygil.app/404"
            />

            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-text text-center px-6">
                <div className="bg-dropdown-hover rounded-xl p-12 max-w-lg mx-auto border border-text/10 shadow-2xl">
                    <div className="text-6xl mb-6 animate-pulse" role="img" aria-label="Not found">👻</div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">Creator Not Found</h1>
                    <p className="text-text/60 mb-8 leading-relaxed text-lg">
                        We couldn't find a page with that username. They might have changed their name or the page doesn't exist.
                    </p>

                    <div className="flex flex-col gap-4">
                        <Link
                            href="/explore"
                            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-primary/20"
                        >
                            <FaSearch /> Explore Creators
                        </Link>

                        <Link
                            href="/"
                            className="flex items-center justify-center gap-2 text-text/60 hover:text-white transition-colors py-2"
                        >
                            <FaArrowLeft className="text-xs" /> Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
