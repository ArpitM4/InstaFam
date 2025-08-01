"use client"
import "../app/globals.css";
import { SessionProvider } from "next-auth/react"

export default function SessionWrapper({children}) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      {children}
    </SessionProvider>
  )
}

