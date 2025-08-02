/**
 * NextAuth Configuration for InstaFam
 * 
 * Architecture:
 * - JWT session strategy for stability and performance
 * - Direct database queries for fresh user data in sessions
 * - Supports email/password, Google, and GitHub authentication
 * - Automatic OAuth user creation with email verification
 * - Custom User model integration with username flexibility
 */

import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/db/mongodb";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';
import connectDB from '@/db/ConnectDb';
import User from '@/models/User';

export const authOptions = {
  // Use JWT strategy but with database user lookup for robust session management
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // 3. PROVIDERS: Configure all your login methods here.
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectDB();
          const user = await User.findOne({ email: credentials.email });
          
          if (!user || !user.password) {
            return null;
          }

          // Check if email is verified
          if (!user.emailVerified) {
            throw new Error("Please verify your email before logging in. Check your inbox for the verification code.");
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.username || user.email.split('@')[0],
          };
        } catch (error) {
          console.error('Authorization error:', error);
          throw error;
        }
      }
    }),
    
    // Google One Tap Provider with detailed logging
    CredentialsProvider({
      id: 'googleonetap',
      name: 'Google One Tap',
      credentials: {
        credential: { label: "Credential", type: "text" }
      },
      async authorize(credentials) {
        console.log("--- [One Tap Authorize] 1: Process Started ---");

        if (!credentials?.credential) {
          console.error("--- [One Tap Authorize] ❌ ERROR: No credential token received from frontend.");
          return null;
        }

        try {
          console.log("--- [One Tap Authorize] 2: Verifying token with Google...");
          const client = new OAuth2Client(process.env.GOOGLE_ID);
          const ticket = await client.verifyIdToken({
            idToken: credentials.credential,
            audience: process.env.GOOGLE_ID,
          });
          const payload = ticket.getPayload();
          console.log("--- [One Tap Authorize] 3: Token verified. Payload received:", payload);

          if (!payload?.email) {
            console.error("--- [One Tap Authorize] ❌ ERROR: Email not found in Google payload.");
            return null;
          }

          console.log("--- [One Tap Authorize] 4: Connecting to database...");
          await connectDB();
          console.log("--- [One Tap Authorize] 5: Database connected. Looking for user...");

          let user = await User.findOne({ email: payload.email });

          if (user) {
            console.log("--- [One Tap Authorize] 6: Existing user found:", user._id);
          } else {
            console.log("--- [One Tap Authorize] 6a: User not found. Creating new user...");
            user = await User.create({
              email: payload.email,
              name: payload.name,
              profilepic: payload.picture,
              emailVerified: new Date(), // New users from Google are verified by default
            });
            console.log("--- [One Tap Authorize] 6b: New user created:", user._id);
          }

          console.log("--- [One Tap Authorize] 7: Success! Returning user object.");
          return { id: user._id, name: user.name, email: user.email, image: user.profilepic };

        } catch (error) {
          console.error("--- [One Tap Authorize] ❌ CRITICAL ERROR:", error);
          return null; // Return null on any error
        }
      }
    }),
  ],

  // 4. CALLBACKS: Enhanced JWT strategy with database user validation
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'credentials') {
        // Credentials are already validated in authorize()
        return true;
      }
      
      // For OAuth providers, ensure user exists or create them
      if (account?.provider === 'google' || account?.provider === 'github') {
        try {
          await connectDB();
          let existingUser = await User.findOne({ email: user.email });
          
          if (existingUser) {
            // Check if this is an unverified email/password account
            if (existingUser.password && !existingUser.emailVerified) {
              return '/login?error=Please verify your original account email first.';
            }
          } else {
            // Create new user for OAuth login
            existingUser = new User({
              email: user.email,
              name: user.name,
              username: null, // Will be set later by user
              emailVerified: new Date(),
              profilepic: user.image || "https://picsum.photos/200",
            });
            await existingUser.save();
          }
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      
      return true;
    },

    async jwt({ token, user, account }) {
      // Add user data to JWT token on first login
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        
        // For credentials login, we have the user ID from authorize
        if (account?.provider === 'credentials') {
          token.userId = user.id;
        } else {
          // For OAuth, find the user ID from database
          try {
            await connectDB();
            const dbUser = await User.findOne({ email: user.email });
            if (dbUser) {
              token.userId = dbUser._id.toString();
            }
          } catch (error) {
            console.error('Error finding user ID in JWT callback:', error);
          }
        }
      }
      
      return token;
    },

    async session({ session, token }) {
      // Add user ID from token to session
      if (token) {
        session.user.id = token.userId || token.id;
      }
      
      // Always fetch fresh user data from database for session
      try {
        await connectDB();
        const dbUser = await User.findOne({ email: session.user.email });
        
        if (dbUser) {
          // Update session with current database values
          session.user.id = dbUser._id.toString();
          session.user.name = dbUser.username || dbUser.name || session.user.email?.split('@')[0];
          session.user.accountType = dbUser.accountType;
          session.user.points = dbUser.points || 0;
          session.user.profilepic = dbUser.profilepic;
          session.user.hasUsername = !!dbUser.username;
        }
      } catch (error) {
        console.error('Error fetching user in session callback:', error);
        // Don't break the session, just use token data
        session.user.name = token.name || session.user.email?.split('@')[0];
      }
      
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  // Remove adapter-specific settings for JWT strategy
};

const handler = NextAuth(authOptions);

// Export the config for other files that need it
export const nextAuthConfig = authOptions;

export { handler as GET, handler as POST };
