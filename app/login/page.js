"use client";
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { useSession, signIn } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const Login = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (session) {
      router.push('/account');
    }
  }, [session, router]);

  const handleEmailLogin = async () => {
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res.error) {
      setError(res.error);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="relative min-h-screen bg-black">
  {/* Blur overlay */}
  <div className="absolute top-0 left-0 w-full h-full bg-white/5 backdrop-blur-lg z-0" />

  <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12 space-y-8">
    <h1 className="text-4xl font-bold text-white">Login</h1>

    {/* Email/Password Card */}
    <div className="bg-white/10 border border-white/20 backdrop-blur-lg rounded-lg p-6 w-full max-w-md space-y-4 shadow-md">
      {error && <p className="text-red-400 text-sm">Incorrect Credentials</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full px-4 py-2 rounded bg-black text-white border border-white/20 focus:ring-2 focus:ring-[#fb0582] outline-none"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full px-4 py-2 rounded bg-black text-white border border-white/20 focus:ring-2 focus:ring-[#fb0582] outline-none"
      />
      <button
        onClick={handleEmailLogin}
        className="w-full bg-[#fb0582] hover:bg-[#e10475] text-white py-2 font-semibold rounded-md transition"
      >
        Login with Email
      </button>
    </div>

    {/* Divider */}
    <div className="text-white opacity-70 font-medium">OR</div>

    {/* OAuth Buttons */}
    <div className="w-full max-w-md space-y-3">
      <button
        onClick={() => signIn("google")}
        className="w-full flex items-center justify-center bg-white text-black font-medium rounded-md py-2 shadow hover:shadow-lg"
      >
        <FaGoogle className="mr-2 text-lg" /> Continue with Google
      </button>
      <button
        onClick={() => signIn("github")}
        className="w-full flex items-center justify-center bg-white text-black font-medium rounded-md py-2 shadow hover:shadow-lg"
      >
        <FaGithub className="mr-2 text-lg" /> Continue with GitHub
      </button>
    </div>
  </div>
</div>

  );
};

export default Login;