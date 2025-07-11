"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async () => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Signup failed");
    } else {
      router.push("/login"); // redirect to login after successful signup
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg max-w-md w-full p-6 space-y-5">
    <h2 className="text-2xl font-bold text-white text-center">Create an Account</h2>

    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

    <input
      type="email"
      placeholder="Email"
      className="w-full px-4 py-2 rounded bg-black text-white border border-white/20 focus:ring-2 focus:ring-[#fb0582] outline-none"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
    <input
      type="text"
      placeholder="Username"
      className="w-full px-4 py-2 rounded bg-black text-white border border-white/20 focus:ring-2 focus:ring-[#fb0582] outline-none"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
    />
    <input
      type="password"
      placeholder="Password"
      className="w-full px-4 py-2 rounded bg-black text-white border border-white/20 focus:ring-2 focus:ring-[#fb0582] outline-none"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />

    <button
      onClick={handleSignup}
      className="w-full bg-[#fb0582] text-white py-2 rounded-md font-semibold hover:bg-[#e10475] transition"
    >
      Sign Up
    </button>
  </div>
</div>

  );
};

export default Signup;
