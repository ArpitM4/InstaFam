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
      router.push('/dashboard');
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
    <div className="relative min-h-screen bg-gradient-to-r from-blue-500 via-pink-500 to-blue-500">
      <div className="absolute top-0 left-0 w-full h-full bg-opacity-50 backdrop-blur-lg z-0"></div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12 space-y-6">
        <h1 className="text-4xl font-bold text-white mb-6">Login</h1>

        {/* Email/Password Login */}
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-4">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <input
            className="w-full p-3 border rounded-md"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            className="w-full p-3 border rounded-md"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            onClick={handleEmailLogin}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700"
          >
            Login with Email
          </button>
        </div>

        {/* OR divider */}
        <div className="text-white">OR</div>

        {/* OAuth Buttons */}
        <div className="space-y-4 w-full max-w-md">
          <button
            onClick={() => signIn("google")}
            className="w-full flex items-center justify-center bg-white text-blue-600 rounded-md py-3 text-xl shadow-md hover:shadow-xl"
          >
            <FaGoogle className="mr-3 text-2xl" /> Google
          </button>
          <button
            onClick={() => signIn("github")}
            className="w-full flex items-center justify-center bg-white text-gray-800 rounded-md py-3 text-xl shadow-md hover:shadow-xl"
          >
            <FaGithub className="mr-3 text-2xl" /> GitHub
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;