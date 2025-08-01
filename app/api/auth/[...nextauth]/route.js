import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import connectDB from '@/db/ConnectDb';
import User from '@/models/User';

console.log("✅ [NextAuth] route.js file loaded.");
console.log(`✅ [NextAuth] GOOGLE_ID is: ${process.env.GOOGLE_ID}`);
console.log(`✅ [NextAuth] NEXTAUTH_SECRET is set: ${!!process.env.NEXTAUTH_SECRET}`);

const nextAuthConfig = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await connectDB();

        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return { id: user._id, email: user.email, name: user.username };
      }
    }),
    CredentialsProvider({
      name: 'googleonetap',
      credentials: {
        credential: { type: 'text' }
      },
      async authorize(credentials) {
        console.log("1. [Authorize Function] --- Started ---");

        if (!credentials || !credentials.credential) {
          console.error("❌ ERROR: No credential received.");
          return null;
        }

        try {
          const client = new OAuth2Client(process.env.GOOGLE_ID);
          console.log("2. [Authorize Function] Verifying token with Google...");
          
          const ticket = await client.verifyIdToken({
            idToken: credentials.credential,
            audience: process.env.GOOGLE_ID,
          });
          
          const payload = ticket.getPayload();
          console.log("3. [Authorize Function] Token verified successfully. Payload:", payload);

          if (!payload.email) {
            console.error("❌ ERROR: Email not found in Google payload.");
            throw new Error("Email not available from Google One Tap.");
          }

          console.log("4. [Authorize Function] Connecting to database...");
          await connectDB();
          console.log("5. [Authorize Function] Database connected. Finding user...");
          
          let user = await User.findOne({ email: payload.email });
          
          if (!user) {
            console.log("6a. [Authorize Function] User not found. Creating new user...");
            user = await User.create({
              email: payload.email,
              username: payload.name || payload.email.split('@')[0], // Use name or email prefix as username
              profilepic: payload.picture,
            });
            console.log("6b. [Authorize Function] New user created:", user);
          } else {
            console.log("6. [Authorize Function] Existing user found:", user);
          }
          
          console.log("7. [Authorize Function] --- Success! Returning user. ---");
          return { 
            id: user._id.toString(), 
            name: user.username, 
            email: user.email, 
            image: user.profilepic 
          };

        } catch (error) {
          console.error("❌ CRITICAL ERROR in authorize function:", error);
          return null; // Return null on any error to prevent login
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        await connectDB();
        const existing = await User.findOne({ email: user.email });
        if (!existing) {
          await User.create({
            email: user.email,
            username: "", // Start with blank username, user must set it after login
          });
        }
      }
      return true;
    },
    async session({ session }) {
      // Simplified session callback
      try {
        await connectDB();
        const dbUser = await User.findOne({ email: session.user.email });
        if (dbUser) {
          session.user.name = dbUser.username || session.user.name;
          session.user.id = dbUser._id?.toString();
        }
      } catch (error) {
        console.error('Session callback error:', error);
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Ensure NextAuth uses the correct URL based on environment
  url: process.env.NEXTAUTH_URL,
};

export { nextAuthConfig };

const authOptions = NextAuth(nextAuthConfig);

export { authOptions as GET, authOptions as POST };
