"use client";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";

export default function VisibilityToggle({ isVisible, onToggle }) {
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
            } else {
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
