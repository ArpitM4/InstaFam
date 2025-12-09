"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { FaGoogle, FaEye, FaEyeSlash, FaCheck, FaTimes, FaMagic, FaPen } from 'react-icons/fa';
import { emitProfileUpdate } from "@/utils/eventBus";

export default function AuthModal({ isOpen, onClose, initialView = "AUTH" }) {
    const router = useRouter();
    const { data: session, update } = useSession();
    const [view, setView] = useState(initialView); // "AUTH" or "SETUP"

    // -- AUTH STATES --
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);

    // -- SETUP STATES --
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState(null);

    // Reset view when opening
    useEffect(() => {
        if (isOpen) {
            if (session?.user && !session.user.setupCompleted) {
                setView("SETUP");
            } else {
                setView("AUTH");
            }
        }
    }, [isOpen, session]);

    // Handle Setup Initialization
    useEffect(() => {
        if (view === "SETUP" && session?.user) {
            if (session.user.name) setName(session.user.name);
            // Generate random avatar
            const seed = Math.random().toString(36).substring(7);
            setAvatarUrl(`https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`);
        }
    }, [view, session]);

    // -- AUTH HANDLERS --
    const handleCredentialsAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (isLogin) {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false
            });

            if (result?.error) {
                setError(result.error);
                setLoading(false);
            } else {
                // Login success - check setup
                const sessionRes = await fetch('/api/auth/session');
                const sessionData = await sessionRes.json();

                if (sessionData?.user?.setupCompleted) {
                    onClose();
                    router.refresh();
                } else {
                    setView("SETUP");
                    setLoading(false);
                }
            }
        } else {
            // Signup Flow
            if (!showOtpInput) {
                // Send OTP
                try {
                    const res = await fetch('/api/auth/signup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });
                    const data = await res.json();

                    if (!res.ok) {
                        setError(data.error || 'Failed to create account');
                        setLoading(false);
                        return;
                    }

                    setShowOtpInput(true);
                    setError('');
                } catch (err) {
                    setError('Something went wrong');
                }
                setLoading(false);
            } else {
                // Verify OTP
                try {
                    const res = await fetch('/api/auth/verify-otp', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, otp })
                    });
                    const data = await res.json();

                    if (!res.ok) {
                        setError(data.error || 'Invalid OTP');
                        setLoading(false);
                        return;
                    }

                    // Auto login
                    const result = await signIn('credentials', {
                        email,
                        password,
                        redirect: false
                    });

                    if (result?.error) {
                        setError('Account verified! Please login.');
                        setIsLogin(true);
                    } else {
                        // New user -> Setup
                        setView("SETUP");
                    }
                } catch (err) {
                    setError('Verification failed');
                }
                setLoading(false);
            }
        }
    };

    const handleGoogleSignIn = () => {
        // Redirect to current page after login to allow "in-place" feel
        // AppLayout will intercept !setupCompleted and re-open this modal in SETUP mode
        signIn('google', { callbackUrl: window.location.href });
    };

    // -- SETUP HANDLERS --
    // Debounce username check
    useEffect(() => {
        const checkUsername = async () => {
            if (username.length < 3) {
                setUsernameAvailable(null);
                return;
            }
            setIsCheckingUsername(true);
            try {
                const res = await fetch(`/api/check-username?username=${username}`);
                const data = await res.json();
                setUsernameAvailable(data.available);
            } catch (err) {
                console.error(err);
            }
            setIsCheckingUsername(false);
        };
        const timeoutId = setTimeout(checkUsername, 500);
        return () => clearTimeout(timeoutId);
    }, [username]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "profilepic");

        try {
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const data = await res.json();
            if (data.success && (data.url || data.secure_url)) {
                setAvatarUrl(data.url || data.secure_url);
            } else {
                setError(data.error || "Upload failed");
            }
        } catch (err) {
            setError("Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSetupSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/setup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    username,
                    accountType: "User", // Forced as requested
                    profilepic: avatarUrl
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Setup failed");
            }

            await update({
                ...session,
                user: {
                    ...session?.user,
                    name,
                    username,
                    profilepic: avatarUrl,
                    setupCompleted: true
                }
            });

            emitProfileUpdate({ name, username, profilepic: avatarUrl, accountType: "User" });

            onClose();
            router.refresh();
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-[#0a0a0f] rounded-2xl shadow-2xl overflow-hidden border border-white/10">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white z-50 p-2"
                >
                    <FaTimes />
                </button>

                <div className="p-6 sm:p-8">
                    {view === "AUTH" ? (
                        <div className="flex flex-col items-center">
                            {/* Header Content */}
                            <div className="text-center mb-6">
                                <h1 className="text-2xl font-bold gradient-text tracking-wide mb-2">
                                    Ask More From Your Favourite Creators !
                                </h1>
                                <h2 className="text-lg font-semibold text-white mb-1">
                                    Connect. Create. Ascend.
                                </h2>
                                <p className="text-white/50 text-xs mb-4">
                                    The Ultimate Fan & Creator Nexus.
                                </p>
                                <div className="flex justify-center mb-6">
                                    <Image
                                        src="/Illustration.png"
                                        alt="Sygil Characters"
                                        width={280}
                                        height={186}
                                        className="w-64 h-auto object-contain"
                                    />
                                </div>
                            </div>

                            {/* Auth Form */}
                            <div className="w-full">
                                <button
                                    onClick={handleGoogleSignIn}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium mb-6"
                                >
                                    <FaGoogle className="text-lg" />
                                    Continue with Google
                                </button>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex-1 h-px bg-white/10"></div>
                                    <span className="text-white/40 text-sm">or</span>
                                    <div className="flex-1 h-px bg-white/10"></div>
                                </div>

                                <form onSubmit={handleCredentialsAuth} className="space-y-4">
                                    <div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Email Address"
                                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary/50"
                                            required
                                        />
                                    </div>

                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Password"
                                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary/50"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>

                                    {showOtpInput && !isLogin && (
                                        <div>
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                placeholder="Enter 6-digit OTP"
                                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 tracking-widest text-center"
                                                required={showOtpInput}
                                                maxLength={6}
                                            />
                                            <p className="text-xs text-white/50 mt-2 text-center">
                                                Check your email for the code
                                            </p>
                                        </div>
                                    )}

                                    {error && (
                                        <p className="text-red-400 text-sm text-center">{error}</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Please wait...' : (isLogin ? 'Login' : (showOtpInput ? 'Verify & Signup' : 'Sign Up'))}
                                    </button>
                                </form>

                                {isLogin && (
                                    <div className="text-right mt-3">
                                        <a href="/forgot-password" className="text-white/40 hover:text-white text-sm transition-colors">
                                            Forgot Password?
                                        </a>
                                    </div>
                                )}

                                <p className="text-center mt-6 text-white/80">
                                    {isLogin ? "New User? " : "Already have an account? "}
                                    <button
                                        onClick={() => {
                                            setIsLogin(!isLogin);
                                            setShowOtpInput(false);
                                            setError('');
                                            setOtp('');
                                        }}
                                        className="text-primary hover:text-primary-light font-semibold"
                                    >
                                        {isLogin ? 'Sign Up' : 'Login'}
                                    </button>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            {/* SETUP VIEW */}
                            <h1 className="text-2xl font-bold text-white mb-2">Welcome to Sygil</h1>
                            <p className="text-white/50 mb-8">Let's get your profile ready</p>

                            <form onSubmit={handleSetupSubmit} className="space-y-6 w-full">
                                {/* Avatar Selection */}
                                <div className="flex flex-col items-center gap-6">
                                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary group cursor-pointer hover:scale-105 transition-transform">
                                        {isUploading ? (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
                                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        ) : (
                                            <Image
                                                src={avatarUrl}
                                                alt="Avatar"
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                            <div className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                                <FaPen className="text-white w-3 h-3" />
                                            </div>
                                        </div>
                                        <label className="absolute inset-0 cursor-pointer z-20">
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                        </label>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const seed = Math.random().toString(36).substring(7);
                                            setAvatarUrl(`https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`);
                                        }}
                                        className="text-xs text-primary flex items-center gap-1 hover:text-white transition-colors"
                                    >
                                        <FaMagic /> Randomize
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Display Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary/50"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Username</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary/50"
                                            style={{
                                                borderColor: usernameAvailable === true ? '#22c55e' : usernameAvailable === false ? '#ef4444' : 'rgba(255,255,255,0.1)'
                                            }}
                                            placeholder="johndoe"
                                            required
                                            minLength={3}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            {isCheckingUsername && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                                            {!isCheckingUsername && username.length >= 3 && (
                                                usernameAvailable ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />
                                            )}
                                        </div>
                                    </div>
                                    {usernameAvailable === false && (
                                        <p className="text-xs mt-1 text-red-500">Username is taken</p>
                                    )}
                                </div>

                                {error && (
                                    <p className="text-red-400 text-sm text-center">{error}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || !usernameAvailable || !name}
                                    className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Setting up...' : 'Complete Setup'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
