"use client"
import { useSession, signIn, signOut } from "next-auth/react";
import { FaUser } from "react-icons/fa";
import Router from "next/navigation";
import { FaUserCircle } from "react-icons/fa";
import Link from "next/link";
import PaymentPage from "@/Components/PaymentPage";
import React from 'react'

const Username = ({params}) => {
  return (
   <PaymentPage username={params.username}/>
  )
}

export default Username
