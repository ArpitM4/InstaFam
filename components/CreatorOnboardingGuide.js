"use client";
import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaRegCircle, FaChevronUp, FaChevronDown } from "react-icons/fa";

/**
 * CreatorOnboardingGuide - Simple floating checklist widget
 * 
 * Shows progress:
 * ✓ Profile Photo (Optional)
 * ✓ Banner (Optional)  
 * ✓ Social Link (Required)
 * 
 * Auto-hides when all steps complete
 */
const CreatorOnboardingGuide = ({
    onComplete,
    hasProfilePic = false,
    hasCoverPic = false,
    hasSocialLinks = false,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    // Calculate completion
    const steps = [
        { id: 1, title: "Add Profile Photo", isOptional: true, isComplete: hasProfilePic },
        { id: 2, title: "Add Banner", isOptional: true, isComplete: hasCoverPic },
        { id: 3, title: "Add Social Link", isOptional: false, isComplete: hasSocialLinks },
    ];

    const completedCount = steps.filter(s => s.isComplete).length;
    const allRequiredComplete = hasSocialLinks; // Only social link is required
    const allComplete = completedCount === 3;

    // Auto-complete and hide when all done
    useEffect(() => {
        if (allComplete) {
            // Mark onboarding as complete after a brief delay
            const timer = setTimeout(async () => {
                try {
                    await fetch("/api/onboarding", { method: "POST" });
                    if (onComplete) onComplete();
                } catch (error) {
                    console.error("Error completing onboarding:", error);
                }
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [allComplete, onComplete]);

    // Collapsed state - just a pill button
    if (!isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-[9990] flex items-center gap-3 px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-transform"
                style={{
                    background: allComplete
                        ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                        : 'linear-gradient(135deg, #FF2F72 0%, #FF6A2F 100%)',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}
            >
                <span className="font-bold text-white text-sm">{completedCount}/3 Setup</span>
                <FaChevronUp className="text-white text-xs" />
            </button>
        );
    }

    // Expanded state - checklist
    return (
        <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-[9990] w-72 animate-fadeIn">
            <div
                className="rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                style={{
                    background: 'rgba(20, 20, 30, 0.95)',
                    backdropFilter: 'blur(20px)'
                }}
            >
                {/* Header */}
                <div
                    className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setIsExpanded(false)}
                    style={{
                        background: allComplete
                            ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.2) 100%)'
                            : 'linear-gradient(135deg, rgba(255, 47, 114, 0.15) 0%, rgba(255, 106, 47, 0.15) 100%)'
                    }}
                >
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-sm">Setup Checklist</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${allComplete ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/60'
                            }`}>
                            {completedCount}/3
                        </span>
                        <FaChevronDown className="text-white/40 text-xs" />
                    </div>
                </div>

                {/* Checklist */}
                <div className="p-4 space-y-3">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className={`flex items-center gap-3 p-2 rounded-lg transition-all ${step.isComplete ? 'bg-green-500/10' : 'bg-white/5'
                                }`}
                        >
                            {step.isComplete ? (
                                <FaCheckCircle className="text-green-400 text-lg flex-shrink-0" />
                            ) : (
                                <FaRegCircle className="text-white/30 text-lg flex-shrink-0" />
                            )}
                            <div className="flex-1">
                                <span className={`text-sm font-medium ${step.isComplete ? 'text-green-400' : 'text-white/80'
                                    }`}>
                                    {step.title}
                                </span>
                                {step.isOptional && (
                                    <span className="ml-2 text-xs text-white/40">(Optional)</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                {allComplete ? (
                    <div className="px-4 pb-4">
                        <div className="text-center py-2 bg-green-500/10 rounded-lg border border-green-500/20">
                            <span className="text-green-400 text-sm font-medium">✨ All done! Great job!</span>
                        </div>
                    </div>
                ) : (
                    <div className="px-4 pb-4">
                        <p className="text-white/40 text-xs text-center">
                            Complete these steps to set up your page
                        </p>
                    </div>
                )}

                {/* Progress Bar */}
                <div className="h-1 w-full bg-white/5">
                    <div
                        className="h-full transition-all duration-500"
                        style={{
                            width: `${(completedCount / 3) * 100}%`,
                            background: allComplete
                                ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
                                : 'linear-gradient(90deg, #FF2F72 0%, #FF6A2F 100%)'
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default CreatorOnboardingGuide;
