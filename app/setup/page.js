"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { FaUser, FaMagic, FaCheck, FaTimes } from "react-icons/fa";

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

            if (data.success && data.url) {
                setAvatarUrl(data.url);
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
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a15] text-white p-4">
            <div className="max-w-md w-full glass-card p-8 rounded-2xl">
                <h1 className="text-3xl font-bold text-center mb-2 gradient-text">Complete Setup</h1>
                <p className="text-center text-gray-400 mb-8">Tell us a bit about yourself</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar Selection */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary/50 group cursor-pointer">
                            {isUploading ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : (
                                <Image
                                    src={avatarUrl}
                                    alt="Avatar"
                                    fill
                                    className="object-cover"
                                    unoptimized // Fix for external images
                                />
                            )}

                            {/* Overlay for upload hint */}
                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <span className="text-xs font-medium">Upload</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </label>
                        </div>

                        <div className="flex gap-4 text-sm">
                            <button
                                type="button"
                                onClick={() => {
                                    const seed = Math.random().toString(36).substring(7);
                                    setAvatarUrl(`https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`);
                                }}
                                className="text-primary hover:text-primary-light flex items-center gap-2"
                            >
                                <FaMagic /> Randomize
                            </button>
                            <label className="text-gray-400 hover:text-white cursor-pointer flex items-center gap-2">
                                <FaUser /> Upload Photo
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:border-primary focus:outline-none transition-colors"
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Username</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                className={`w-full bg-white/5 border rounded-lg px-4 py-3 focus:outline-none transition-colors ${usernameAvailable === true ? 'border-green-500/50' :
                                    usernameAvailable === false ? 'border-red-500/50' :
                                        'border-white/10 focus:border-primary'
                                    }`}
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
                            <p className="text-xs text-red-500 mt-1">Username is taken</p>
                        )}
                    </div>

                    {/* Account Type */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">I want to be a...</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setAccountType("User")}
                                className={`p-4 rounded-xl border transition-all duration-200 ${accountType === "User"
                                    ? "bg-primary/20 border-primary text-white"
                                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                    }`}
                            >
                                <div className="text-lg font-bold mb-1">User</div>
                                <div className="text-xs opacity-70">Explore & Support</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setAccountType("Creator")}
                                className={`p-4 rounded-xl border transition-all duration-200 ${accountType === "Creator"
                                    ? "bg-secondary/20 border-secondary text-white"
                                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                    }`}
                            >
                                <div className="text-lg font-bold mb-1">Creator</div>
                                <div className="text-xs opacity-70">Create & Earn</div>
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm text-center bg-red-500/10 py-2 rounded-lg">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !usernameAvailable || !name}
                        className="w-full btn-gradient py-3 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all"
                    >
                        {loading ? "Setting up..." : "Complete Setup"}
                    </button>
                </form>
            </div>
        </div>
    );
}
