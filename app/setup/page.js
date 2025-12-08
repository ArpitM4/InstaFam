"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { FaUser, FaMagic, FaCheck, FaTimes, FaPen } from "react-icons/fa";

export default function SetupPage() {
    const router = useRouter();
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form State
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [accountType, setAccountType] = useState("User"); // "User" or "Creator"
    const [avatarUrl, setAvatarUrl] = useState(""); // Stores the final URL (DiceBear or Uploaded)
    const [isUploading, setIsUploading] = useState(false);

    // Username check
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState(null);

    useEffect(() => {
        if (session?.user?.name) setName(session.user.name);
        // Generate random seed initially
        const seed = Math.random().toString(36).substring(7);
        setAvatarUrl(`https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`);
    }, [session]);

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
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            const uploadedUrl = data.url || data.secure_url;

            if (data.success && uploadedUrl) {
                setAvatarUrl(uploadedUrl);
            } else {
                setError(data.error || "Upload failed");
            }
        } catch (err) {
            setError("Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!usernameAvailable) return;

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/setup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    username,
                    accountType,
                    profilepic: avatarUrl // Send the final URL
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Setup failed");
            }

            // Update session to reflect changes
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

            // Redirect based on account type
            if (accountType === "Creator") {
                router.push(`/${username}`);
            } else {
                router.push("/");
            }
            router.refresh();

        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>

            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[120px] -z-10" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)' }} />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[100px] -z-10" style={{ backgroundColor: 'rgba(255, 47, 114, 0.1)' }} />

            <div className="max-w-md w-full p-8 rounded-3xl border shadow-2xl relative z-10 backdrop-blur-xl"
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2 text-white">Welcome to Sygil</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Let's get your profile ready</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar Selection */}
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 group cursor-pointer transition-all duration-300 hover:scale-105 shadow-lg"
                            style={{ borderColor: 'var(--primary)' }}>
                            {isUploading ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
                                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

                            {/* Always visible edit icon */}
                            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center border border-white/20 transition-all group-hover:bg-black/50">
                                    <FaPen className="text-white w-4 h-4" />
                                </div>
                            </div>

                            {/* Overlay for upload hint (clickable) */}
                            <label className="absolute inset-0 flex flex-col items-center justify-center bg-transparent cursor-pointer z-20">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </label>
                        </div>

                        <div className="flex gap-3 text-sm">
                            <button
                                type="button"
                                onClick={() => {
                                    const seed = Math.random().toString(36).substring(7);
                                    setAvatarUrl(`https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`);
                                }}
                                className="px-4 py-2 rounded-full border transition-colors flex items-center gap-2 hover:bg-white/5"
                                style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--primary)' }}
                            >
                                <FaMagic /> Randomize
                            </button>
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-xl px-4 py-3.5 font-medium transition-all focus:ring-2 focus:ring-primary/50 outline-none"
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'var(--text)'
                            }}
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Username</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                className="w-full rounded-xl px-4 py-3.5 font-medium transition-all focus:ring-2 focus:ring-primary/50 outline-none"
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${usernameAvailable === true ? 'var(--success)' :
                                        usernameAvailable === false ? 'var(--error)' :
                                            'rgba(255,255,255,0.1)'
                                        }`,
                                    color: 'var(--text)'
                                }}
                                placeholder="johndoe"
                                required
                                minLength={3}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                {isCheckingUsername && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                                {!isCheckingUsername && username.length >= 3 && (
                                    usernameAvailable ? <FaCheck style={{ color: 'var(--success)' }} /> : <FaTimes style={{ color: 'var(--error)' }} />
                                )}
                            </div>
                        </div>
                        {usernameAvailable === false && (
                            <p className="text-xs mt-2 font-medium" style={{ color: 'var(--error)' }}>Username is taken</p>
                        )}
                    </div>

                    {/* Account Type */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>I want to be a...</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setAccountType("User")}
                                className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left relative overflow-hidden group ${accountType === "User"
                                    ? "bg-primary/10 border-primary"
                                    : "bg-transparent border-white/10 hover:border-white/20 hover:bg-white/5"
                                    }`}
                            >
                                <div className={`text-lg font-bold mb-1 ${accountType === "User" ? "text-primary" : "text-white"}`}>User</div>
                                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Explore & Support</div>
                                {accountType === "User" && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />}
                            </button>

                            <button
                                type="button"
                                onClick={() => setAccountType("Creator")}
                                className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left relative overflow-hidden group ${accountType === "Creator"
                                    ? "bg-secondary/10 border-secondary"
                                    : "bg-transparent border-white/10 hover:border-white/20 hover:bg-white/5"
                                    }`}
                            >
                                <div className={`text-lg font-bold mb-1 ${accountType === "Creator" ? "text-secondary" : "text-white"}`}>Creator</div>
                                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Create & Earn</div>
                                {accountType === "Creator" && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-secondary shadow-[0_0_10px_var(--secondary)]" />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                            <p className="text-sm font-medium" style={{ color: 'var(--error)' }}>{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !usernameAvailable || !name}
                        className="w-full btn-gradient py-4 rounded-xl font-bold text-lg text-white shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Setting up...</span>
                            </div>
                        ) : "Complete Setup"}
                    </button>
                </form>
            </div>
        </div>
    );
}
