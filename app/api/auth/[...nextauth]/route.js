import NextAuth from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import mongoose, { connect } from 'mongoose'
import FacebookProvider from 'next-auth/providers/facebook'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import connectDB from '@/db/ConnectDb'
import Payment from '@/models/Payment'
import User  from '@/models/User'

export const authoptions = NextAuth({
  providers: [
    // GitHub Provider
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    // Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (account.provider === 'github' || account.provider === 'google') {
        await connectDB();

        // Check if the user already exists
        const currentUser = await User.findOne({ email: user.email });

        if (!currentUser) {
          // Create a new user
          await User.create({
            email: user.email,
            username: user.email.split('@')[0],
          });
        }

        return true;
        
      }
      return false;
    },
    async session({ session }) {
      // Fetch user details from the database
      const dbUser = await User.findOne({ email: session.user.email });
      session.user.name = dbUser?.username || session.user.name;
      return session;
    },
  },
});

export { authoptions as GET, authoptions as POST };