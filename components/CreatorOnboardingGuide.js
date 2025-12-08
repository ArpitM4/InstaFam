"use client";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

/**
 * CreatorOnboardingGuide - A step-by-step visual guide for new creators
 * 
 * Steps:
 * 1. Add Profile Photo (optional)
 * 2. Add Banner (optional)
 * 3. Add Social Link (required)
 * 4. Set Page Public (opens share modal)
 */
const CreatorOnboardingGuide = ({
    onComplete,
    onSkip,
    currentStep = 0,
    hasProfilePic = false,
    hasCoverPic = false,
    hasSocialLinks = false,
    onProfileClick,
    onCoverClick,
    onLinksTabClick,
    onSetPublicClick,
}) => {
    const [step, setStep] = useState(currentStep);
    const [isClosing, setIsClosing] = useState(false);

    const steps = [
        {
            id: 0,
            title: "Add Profile Photo",
            description: "Let your fans recognize you! Upload a profile picture.",
            icon: "📸",
            isOptional: true,
            isComplete: hasProfilePic,
            action: onProfileClick,
            actionLabel: "Add Photo",
        },
        {
            id: 1,
            title: "Add Banner",
            description: "Make your page stand out with a custom banner image.",
            icon: "🎨",
            isOptional: true,
            isComplete: hasCoverPic,
            action: onCoverClick,
            actionLabel: "Add Banner",
        },
        {
            id: 2,
            title: "Add Social Link",
            description: "Connect your social media so fans can find you everywhere.",
            icon: "🔗",
            isOptional: false,
            isComplete: hasSocialLinks,
            action: onLinksTabClick,
            actionLabel: "Add Link",
        },
        {
            id: 3,
            title: "Go Public!",
            description: "Your page is ready! Share it with your community.",
            icon: "🚀",
            isOptional: false,
            isComplete: false,
            action: onSetPublicClick,
            actionLabel: "Set Public & Share",
            requiresPrevious: true, // Requires social link to be added
        },
    ];

    // Check if can proceed to final step
    const canProceedToPublic = hasSocialLinks;

    const handleNext = () => {
        if (step < steps.length - 1) {
            // If trying to go to the last step (Set Public), check requirements
            if (step === 2 && !hasSocialLinks) {
                toast.error("Please add at least one social link first!");
                return;
            }
            setStep(step + 1);
        }
    };

    const handleSkip = () => {
        if (step < steps.length - 1) {
            // Can't skip the social link step if trying to go public
            if (step === 2) {
                toast.info("Adding a social link is required to set your page public");
            }
            handleNext();
        }
    };

    const handleSkipAll = async () => {
        setIsClosing(true);
        try {
            await fetch("/api/onboarding", { method: "POST" });
            if (onSkip) onSkip();
        } catch (error) {
            console.error("Error skipping onboarding:", error);
        }
        setIsClosing(false);
    };

    const handleAction = () => {
        const currentStepData = steps[step];
        if (currentStepData.action) {
            currentStepData.action();
        }
    };

    const handleComplete = async () => {
        setIsClosing(true);
        try {
            await fetch("/api/onboarding", { method: "POST" });
            if (onComplete) onComplete();
        } catch (error) {
            console.error("Error completing onboarding:", error);
        }
        setIsClosing(false);
    };

    const currentStepData = steps[step];

    return (
        <div
            className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
            style={{
                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.95) 100%)',
                backdropFilter: 'blur(8px)'
            }}
        >
            {/* Onboarding Card */}
            <div
                className="relative w-full max-w-md animate-scaleIn"
                style={{
                    background: 'linear-gradient(135deg, rgba(20, 20, 35, 0.95) 0%, rgba(10, 10, 20, 0.98) 100%)',
                    borderRadius: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 100px rgba(255, 47, 114, 0.1)'
                }}
            >
                {/* Header */}
                <div className="p-6 pb-4 border-b border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">Set Up Your Page</h2>
                        <button
                            onClick={handleSkipAll}
                            disabled={isClosing}
                            className="text-sm text-white/40 hover:text-white/70 transition-colors"
                        >
                            Skip All
                        </button>
                    </div>

                    {/* Progress Dots */}
                    <div className="flex items-center gap-2">
                        {steps.map((s, i) => (
                            <div
                                key={s.id}
                                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < step
                                        ? 'bg-gradient-to-r from-primary to-secondary'
                                        : i === step
                                            ? 'bg-gradient-to-r from-primary to-secondary animate-pulse'
                                            : 'bg-white/10'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div className="p-6">
                    {/* Step Icon */}
                    <div className="flex justify-center mb-6">
                        <div
                            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255, 47, 114, 0.15) 0%, rgba(255, 106, 47, 0.15) 100%)',
                                border: '1px solid rgba(255, 47, 114, 0.2)'
                            }}
                        >
                            {currentStepData.icon}
                        </div>
                    </div>

                    {/* Step Info */}
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-white">{currentStepData.title}</h3>
                            {currentStepData.isOptional && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                                    Optional
                                </span>
                            )}
                            {!currentStepData.isOptional && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                                    Required
                                </span>
                            )}
                        </div>
                        <p className="text-white/60 text-sm">{currentStepData.description}</p>
                    </div>

                    {/* Completion Status */}
                    {currentStepData.isComplete && step < 3 && (
                        <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                            <span className="text-green-400 text-sm">✓ Already completed!</span>
                        </div>
                    )}

                    {/* Requirement Warning for Go Public step */}
                    {step === 3 && !canProceedToPublic && (
                        <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
                            <span className="text-yellow-400 text-sm">⚠️ Add a social link first</span>
                        </div>
                    )}

                    {/* Step Number */}
                    <p className="text-center text-white/30 text-xs mb-4">
                        Step {step + 1} of {steps.length}
                    </p>
                </div>

                {/* Actions */}
                <div className="p-6 pt-0 flex gap-3">
                    {step < steps.length - 1 ? (
                        <>
                            {/* Skip Button */}
                            <button
                                onClick={handleSkip}
                                className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all font-medium"
                            >
                                {currentStepData.isOptional ? "Skip" : "I'll do it later"}
                            </button>

                            {/* Action Button */}
                            <button
                                onClick={handleAction}
                                className="flex-1 px-4 py-3 rounded-xl font-medium text-white btn-gradient shadow-lg hover:scale-[1.02] transition-all"
                            >
                                {currentStepData.actionLabel}
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Final Step - Go Public */}
                            <button
                                onClick={handleComplete}
                                disabled={isClosing}
                                className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all font-medium"
                            >
                                Maybe Later
                            </button>
                            <button
                                onClick={() => {
                                    if (canProceedToPublic) {
                                        handleAction();
                                        handleComplete();
                                    } else {
                                        toast.error("Please add at least one social link first!");
                                        setStep(2); // Go back to social link step
                                    }
                                }}
                                disabled={!canProceedToPublic || isClosing}
                                className={`flex-1 px-4 py-3 rounded-xl font-medium text-white shadow-lg transition-all ${canProceedToPublic
                                        ? 'btn-gradient hover:scale-[1.02]'
                                        : 'bg-white/10 cursor-not-allowed opacity-50'
                                    }`}
                            >
                                {currentStepData.actionLabel}
                            </button>
                        </>
                    )}
                </div>

                {/* Bottom Decoration */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl overflow-hidden"
                    style={{
                        background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                        opacity: 0.5
                    }}
                />
            </div>
        </div>
    );
};

export default CreatorOnboardingGuide;
