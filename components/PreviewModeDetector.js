"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

/**
 * A small component that detects preview mode from URL search params.
 * Extracted to its own component so it can be wrapped in Suspense,
 * allowing the rest of the app to be statically generated.
 */
export default function PreviewModeDetector({ onPreviewModeChange }) {
    const searchParams = useSearchParams();
    const isPreviewMode = searchParams?.get('viewAs') === 'public';

    useEffect(() => {
        onPreviewModeChange(isPreviewMode);
    }, [isPreviewMode, onPreviewModeChange]);

    // This component doesn't render anything visible
    return null;
}
