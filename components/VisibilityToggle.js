"use client";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "sonner";
import { emitAccountTypeChange } from "@/utils/eventBus";

export default function VisibilityToggle({ isVisible, onToggle, onShareModal }) {
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/toggle-visibility", {
                method: "POST",
            });
            const data = await res.json();

            if (res.ok) {
                onToggle(data.visibility);
                toast.success(`Page is now ${data.visibility}`);

                // If successfully set to public, emit account type change for instant UI update
                if (data.visibility === "public" && data.accountType) {
                    emitAccountTypeChange(data.accountType);
                }

                // If successfully set to public and onShareModal callback provided, open share modal
                if (data.visibility === "public" && onShareModal) {
                    onShareModal();
                }
            } else {
                // Show the specific error message (e.g., missing requirements)
                toast.error(data.error || "Failed to toggle visibility");
            }
        } catch (error) {
            console.error("Toggle error:", error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isVisible === "public"
                ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                : "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                }`}
            title={isVisible === "public" ? "Page is Public" : "Page is Hidden"}
        >
            {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isVisible === "public" ? (
                <FaEye />
            ) : (
                <FaEyeSlash />
            )}
            <span>{isVisible === "public" ? "Public" : "Hidden"}</span>
        </button>
    );
}
