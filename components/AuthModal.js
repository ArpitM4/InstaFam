"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { FaGoogle, FaEye, FaEyeSlash, FaCheck, FaTimes, FaMagic, FaPen, FaArrowRight } from 'react-icons/fa';
import { emitProfileUpdate } from "@/utils/eventBus";
import { trackEvent, GA_EVENTS } from "@/utils/analytics";

export default function AuthModal({ isOpen, onClose, initialView = "AUTH", defaultAccountType = "User" }) {
    const router = useRouter();
    const { data: session, update } = useSession();
    const [view, setView] = useState(initialView); // "AUTH" or "SETUP"

    // -- AUTH STATES --
    const [authView, setAuthView] = useState("LOGIN"); // "LOGIN", "SIGNUP", "FORGOT_PASSWORD"
    // const [isLogin, setIsLogin] = useState(true); // Deprecated in favor of authView
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);

    // Forgot Password / Resend OTP states
    const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [timer, setTimer] = useState(0);

    // Timer Logic
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const startTimer = () => setTimer(60);

    const handleResendOtp = async () => {
        if (timer > 0) return;
        setLoading(true);
        try {
            let endpoint = '/api/auth/signup';
            if (authView === 'FORGOT_PASSWORD') endpoint = '/api/auth/forgot-password';

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: authView === 'SIGNUP' ? password : undefined })
            });

            if (!res.ok) throw new Error('Failed to resend OTP');
            startTimer();
        } catch (err) {
            setError(err.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    // Forgot Password Handlers
    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (forgotStep === 1) {
                const res = await fetch('/api/auth/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Something went wrong');

                setForgotStep(2);
                startTimer();
            } else if (forgotStep === 2) {
                const res = await fetch('/api/auth/verify-reset-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, otp })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Invalid OTP');

                setForgotStep(3);
            } else if (forgotStep === 3) {
                const res = await fetch('/api/auth/reset-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, otp, newPassword: password })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to reset password');

                setAuthView('LOGIN'); // Go back to login
                setPassword('');
                setError('Password reset successful! Please login.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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
            // Skip setup if user has completed it OR already has a username
            if (session?.user && !session.user.setupCompleted && !session.user.hasUsername) {
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

        if (authView === "LOGIN") {
            trackEvent(GA_EVENTS.EMAIL_LOGIN_START, { email });
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false
            });

            if (result?.error) {
                trackEvent(GA_EVENTS.EMAIL_LOGIN_FAIL, { email, error: result.error });
                if (result.error === 'CredentialsSignin') {
                    setError('Invalid email or password');
                } else {
                    setError(result.error);
                }
                setLoading(false);
            } else {
                trackEvent(GA_EVENTS.EMAIL_LOGIN_SUCCESS, { email });
                // Login success - check setup
                const sessionRes = await fetch('/api/auth/session');
                const sessionData = await sessionRes.json();

                // Skip setup if user already completed it OR has a username
                if (sessionData?.user?.setupCompleted || sessionData?.user?.hasUsername) {
                    onClose();
                    // Redirect to user's page
                    const userUsername = sessionData?.user?.username || sessionData?.user?.name;
                    if (userUsername) {
                        router.push(`/${userUsername}`);
                    }
                    router.refresh();
                } else {
                    setView("SETUP");
                    setLoading(false);
                }
            }
        } else if (authView === "SIGNUP") {
            // Signup Flow
            if (!showOtpInput) {
                // Send OTP
                trackEvent(GA_EVENTS.EMAIL_SIGNUP_START, { email });
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
                    startTimer();
                    trackEvent(GA_EVENTS.EMAIL_SIGNUP_OTP_SENT, { email });
                } catch (err) {
                    setError('Something went wrong');
                }
                setLoading(false);
            } else {
                // Verify OTP
                trackEvent(GA_EVENTS.EMAIL_SIGNUP_OTP_VERIFY, { email });
                try {
                    const res = await fetch('/api/auth/verify-otp', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, otp })
                    });
                    const data = await res.json();

                    if (!res.ok) {
                        trackEvent(GA_EVENTS.EMAIL_SIGNUP_FAIL, { email, error: data.error });
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
                        setAuthView("LOGIN");
                    } else {
                        trackEvent(GA_EVENTS.EMAIL_SIGNUP_SUCCESS, { email });
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
        trackEvent(GA_EVENTS.GOOGLE_SIGNIN_CLICK, { page: window.location.pathname });
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
                    accountType: defaultAccountType, // Uses prop - "User" or "Creator"
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

            trackEvent(GA_EVENTS.SETUP_COMPLETE, { username, hasCustomAvatar: !avatarUrl.includes('dicebear'), accountType: defaultAccountType });
            emitProfileUpdate({ name, username, profilepic: avatarUrl, accountType: defaultAccountType });

            onClose();
            // Redirect to user's new page
            router.push(`/${username}`);
            router.refresh();
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md max-h-[90vh] bg-[#0a0a0f] rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-y-auto custom-scrollbar">
                <button
                    onClick={() => {
                        trackEvent(GA_EVENTS.AUTH_MODAL_CLOSE, { view, authView });
                        onClose();
                    }}
                    className="absolute top-4 right-4 text-white/50 hover:text-white z-50 p-2"
                >
                    <FaTimes />
                </button>

                <div className="p-5 sm:p-6">
                    {view === "AUTH" ? (
                        <div className="flex flex-col items-center">
                            {/* Header Content */}
                            <div className="text-center mb-4">
                                <h1 className="text-xl sm:text-2xl font-bold gradient-text tracking-wide mb-1">
                                    {defaultAccountType === "Creator"
                                        ? "Start Earning From Your Content!"
                                        : "Ask More From Your Favourite Creators !"}
                                </h1>
                                <h2 className="text-base sm:text-lg font-semibold text-white mb-1">
                                    {defaultAccountType === "Creator"
                                        ? "Turn followers into superfans."
                                        : "Be more than just a follower."}
                                </h2>
                                <p className="text-white/50 text-xs mb-3">
                                    {defaultAccountType === "Creator"
                                        ? "Create your Sygil page and start monetizing today."
                                        : "Unlock exclusive drops from your favourite creators."}
                                </p>
                                <div className="flex justify-center mb-3">
                                    <Image
                                        src="/Illustration.png"
                                        alt="Sygil Characters"
                                        width={180}
                                        height={120}
                                        className="w-36 sm:w-44 h-auto object-contain"
                                    />
                                </div>
                            </div>

                            {/* Auth Form */}
                            <div className="w-full">
                                <button
                                    onClick={handleGoogleSignIn}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium mb-4"
                                >
                                    <FaGoogle className="text-lg" />
                                    Continue with Google
                                </button>

                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex-1 h-px bg-white/10"></div>
                                    <span className="text-white/40 text-sm">or</span>
                                    <div className="flex-1 h-px bg-white/10"></div>
                                </div>

                                <form onSubmit={authView === 'FORGOT_PASSWORD' ? handleForgotPasswordSubmit : handleCredentialsAuth} className="space-y-3">
                                    <div>
                                        <label className="block text-white text-sm font-medium mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Email Address"
                                            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary/50"
                                            required
                                            disabled={authView === 'FORGOT_PASSWORD' && forgotStep > 1}
                                        />
                                    </div>

                                    {authView === 'FORGOT_PASSWORD' && forgotStep === 3 && (
                                        <div className="relative">
                                            <label className="block text-white text-sm font-medium mb-1">New Password</label>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="New Password"
                                                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary/50"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-8 text-white/50 hover:text-white"
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    )}

                                    {authView !== 'FORGOT_PASSWORD' && (
                                        <div className="relative">
                                            <label className="block text-white text-sm font-medium mb-1">{authView === 'LOGIN' ? "Password" : "Set Password"}</label>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder={authView === 'LOGIN' ? "Password" : "Set Password"}
                                                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary/50"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-8 text-white/50 hover:text-white"
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    )}

                                    {((showOtpInput && authView === 'SIGNUP') || (authView === 'FORGOT_PASSWORD' && forgotStep >= 2)) && (
                                        <div>
                                            <label className="block text-white text-sm font-medium mb-2">Verification Code</label>
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                placeholder="Enter 6-digit OTP"
                                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 tracking-widest text-center"
                                                required
                                                maxLength={6}
                                            />
                                            <div className="flex justify-between items-center mt-2">
                                                <p className="text-xs text-white/50">
                                                    Check your email for the code
                                                </p>
                                                {timer > 0 ? (
                                                    <span className="text-xs text-white/50">Resend in {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
                                                ) : (
                                                    <button type="button" onClick={handleResendOtp} className="text-xs text-primary hover:underline">
                                                        Resend OTP
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {error && (
                                        <p className="text-red-400 text-sm text-center">{error}</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Please wait...' : (
                                            authView === 'LOGIN' ? 'Login' :
                                                authView === 'SIGNUP' ? (showOtpInput ? 'Verify & Signup' : 'Sign Up') :
                                                    (forgotStep === 1 ? 'Send Reset Code' : forgotStep === 2 ? 'Verify Code' : 'Reset Password')
                                        )}
                                    </button>
                                </form>

                                {authView === 'LOGIN' && (
                                    <div className="text-right mt-2">
                                        <button onClick={() => {
                                            trackEvent(GA_EVENTS.FORGOT_PASSWORD_START, { email });
                                            setAuthView('FORGOT_PASSWORD');
                                            setForgotStep(1);
                                            setError('');
                                            setOtp('');
                                            setPassword('');
                                        }}
                                            className="text-white/40 hover:text-white text-sm transition-colors"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                )}

                                {authView === 'FORGOT_PASSWORD' && (
                                    <div className="text-center mt-3">
                                        <button onClick={() => setAuthView('LOGIN')} className="text-white/40 hover:text-white text-sm transition-colors">
                                            Back to Login
                                        </button>
                                    </div>
                                )}

                                {authView !== 'FORGOT_PASSWORD' && (
                                    <p className="text-center mt-6 text-white/80">
                                        {authView === 'LOGIN' ? "New User? " : "Already have an account? "}
                                        <button
                                            onClick={() => {
                                                const newView = authView === 'LOGIN' ? 'SIGNUP' : 'LOGIN';
                                                trackEvent(newView === 'LOGIN' ? GA_EVENTS.AUTH_SWITCH_TO_LOGIN : GA_EVENTS.AUTH_SWITCH_TO_SIGNUP, {});
                                                setAuthView(newView);
                                                setShowOtpInput(false);
                                                setError('');
                                                setOtp('');
                                            }}
                                            className="text-primary hover:text-primary-light font-semibold"
                                        >
                                            {authView === 'LOGIN' ? 'Sign Up' : 'Login'}
                                        </button>
                                    </p>
                                )}

                                {/* Join as Creator Link - only show for User signup */}
                                {defaultAccountType !== "Creator" && (
                                    <div className="text-center mt-4 pt-4 border-t border-white/10">
                                        <button
                                            onClick={() => {
                                                onClose();
                                                router.push('/creators');
                                            }}
                                            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-primary transition-colors group"
                                        >
                                            Join as a Creator
                                            <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                )}
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
                                    <div className="relative w-24 h-24 group cursor-pointer hover:scale-105 transition-transform">
                                        <div className="w-full h-full rounded-full overflow-hidden border-2 border-primary relative">
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
                                        </div>

                                        {/* Edit Icon - Bottom Right */}
                                        <div className="absolute bottom-0 right-0 z-30 pointer-events-none">
                                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-[#0a0a0f] shadow-lg">
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
                                            trackEvent(GA_EVENTS.SETUP_AVATAR_RANDOMIZE, {});
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
