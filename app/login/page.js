"use client"
import { FaGoogle, FaGithub, FaFacebookF, FaReddit, FaLinkedinIn } from 'react-icons/fa';
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';




const Login = () => {
    const { data: session } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (session) {
      router.push('/dashboard'); // Redirect to home page if session exists
    }
  }, [session, router]); // Dependency array ensures effect runs when session changes
  return (
    <div className="relative min-h-screen bg-gradient-to-r from-blue-500  via-pink-500 to-blue-500">
      {/* Blurred Background */}
      <div className="absolute top-0 left-0 w-full h-full bg-opacity-50 backdrop-blur-lg z-0"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        <h1 className="text-4xl font-bold text-white mb-12 text-shadow">
          Login
        </h1>

        {/* Social Media Login Buttons */}
        <div className="space-y-6">
          <button onClick={() => {signIn("google")}} className="w-full max-w-lg flex items-center justify-center bg-white text-blue-600 rounded-md px-28 py-5 text-xl shadow-md hover:shadow-xl transition">
            <FaGoogle className="mr-3 text-2xl" /> Google
          </button>
          <button   onClick={() => {
                signIn("github");
              }}  className="w-full max-w-lg flex items-center justify-center bg-white text-gray-800 rounded-md px-10 py-5 text-xl shadow-md hover:shadow-xl transition">
            <FaGithub className="mr-3 text-2xl" /> GitHub
          </button>
          {/* <button className="w-full max-w-lg flex items-center justify-center bg-blue-700 text-white rounded-md px-10 py-5 text-xl shadow-md hover:shadow-xl transition">
            <FaFacebookF className="mr-3 text-2xl" /> Facebook
          </button>
          <button className="w-full max-w-lg flex items-center justify-center bg-orange-500 text-white rounded-md px-10 py-5 text-xl shadow-md hover:shadow-xl transition">
            <FaReddit className="mr-3 text-2xl" /> Reddit
          </button>
          <button className="w-full max-w-lg flex items-center justify-center bg-blue-800 text-white rounded-md px-10 py-5 text-xl shadow-md hover:shadow-xl transition">
            <FaLinkedinIn className="mr-3 text-2xl" /> LinkedIn
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default Login;
