"use client";
import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { FaUser } from "react-icons/fa";

// const [sign, setsign] = useState("false")

import Link from "next/link";
// import Login from "@/app/login/page";

const Navbar = () => {
  let sign = "false"
  const { data: session } = useSession();
  if (session) {sign = "true"  }

  {console.log(sign)}
     return (
      <nav className="absolute bg-white bg-opacity-30 backdrop-blur-lg shadow-md py-4 z-30 w-full">
      <div className=" container mx-auto pl-4 flex items-center justify-between">
        <Link href={"/"}>
        {" "}
        <span
          className="text-3xl rubik-vinyl-regula font-extrabold bg-gradient-to-r from-pink-600 via-purple-700 to-pink-600 bg-clip-text text-transparent"
          style={{"fontFamily": '"Playwrite AU SA", sans-serif' , }}>
          InstaFam
        </span>
        </Link>
    
        {/* Navigation Links */}
        <ul className="hidden md:flex space-x-8">
          <li>
            <a href="#features" className="text-white hover:text-blue-500 transition">
              Features
            </a>
          </li>
          <li>
            <a href="#pricing" className="text-white hover:text-blue-500 transition">
              Pricing
            </a>
          </li>
          <li>
            <a href="#community" className="text-white hover:text-blue-500 transition">
              Community
            </a>
          </li>
        </ul>
    
        {/* Call-to-Action Buttons */}
        {/* Hide if a = Signout */}
    
        <div className="hidden md:flex space-x-4">
          {sign === "false" ? (
          <div>
            <Link href="/login"
              className="px-4 py-2 text-white hover:text-white border border-gray-300 rounded-md hover:bg-gray-800 transition">
            <button>Log In</button>
            </Link>
            <Link href="/signup"
              className="px-4 py-2 text-white bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 rounded-md hover:from-pink-600 hover:via-purple-600 hover:to-orange-600 transition">
            Sign Up
            </Link>
          </div>) : ( <>
            <div className="relative inline-block text-left group ">
  {/* Main Dropdown Button */}
  <button className="px-4 py-2 flex items-center text-white hover:text-white border border-none rounded-md transition">
  <FaUser className="mr-2 text-xl" />
  {session.user.name}
</button>

  {/* Dropdown Menu */}
  <div className="absolute right-0 w-48 bg-black/20 backdrop-blur-md border border-gray-300 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200 z-10">
  <button className="block px-6 py-3 text-white border border-none rounded-md hover:bg-gray-800 transition duration-300 w-full text-left">
    <Link href={'/earnings'}>    Earnings</Link>
  </button>
  <Link href={'/dashboard'}>
  <button className="block px-6 py-3 text-white border border-none rounded-md hover:bg-gray-800 transition duration-300 w-full text-left">
   
    Dashboard
  </button>
    </Link>
  <Link href={`/${session.user.name}`}>
  <button className="block px-6 py-3 text-white border border-none rounded-md hover:bg-gray-800 transition duration-300 w-full text-left">
   
    Your Page
  </button>
    </Link>
  <button onClick={()=> {
              signOut()
              }
              }  className="block px-6 py-3 text-white border border-none rounded-md hover:bg-gray-800 transition duration-300 w-full text-left">
    Logout
  </button>
</div>



</div>


          </> )}
        </div>
    
        {/* Mobile Menu Button */}
        <button className="md:hidden text-white hover:text-blue-500 focus:outline-none" aria-label="Toggle Menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
    
    </nav>
    );
  

};

export default Navbar;
