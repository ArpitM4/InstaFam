import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/db/mongodb";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs';
import connectDB from '@/db/ConnectDb';
import User from '@/models/User';

export const authOptions = {
  // 1. THE ADAPTER: This is the engine for all database operations.
  adapter: MongoDBAdapter(clientPromise),

  // 2. SESSION STRATEGY: Use 'database' for robust, secure sessions.
  session: {
    strategy: "database",
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
          name: user.username,
        };
      }
    }),
  ],

  // 4. CALLBACKS: Use callbacks only to add extra data or run security checks.
  // Do NOT manually create users here. The adapter handles that.
  callbacks: {
    async signIn({ user, account, profile }) {
      // Security check: Block OAuth linking for unverified email/password accounts
      if (account.provider === 'google' || account.provider === 'github') {
        await connectDB();
        const existingUser = await User.findOne({ email: user.email });
        if (existingUser && existingUser.password && !existingUser.emailVerified) {
          // Block linking if the original account is unverified
          return '/login?error=Please verify your original account email first.';
        }
      }
      return true;
    },

    async session({ session, user }) {
      // Add the user's unique database ID to the session object.
      session.user.id = user.id;
      
      // Fetch username from our custom User model and update session
      try {
        await connectDB();
        const dbUser = await User.findOne({ email: session.user.email });
        if (dbUser && dbUser.username) {
          session.user.name = dbUser.username;
        }
      } catch (error) {
        console.error('Error fetching username in session callback:', error);
      }
      
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  // This flag is essential for the adapter to link accounts.
  allowDangerousEmailAccountLinking: true,
};

const handler = NextAuth(authOptions);

// Export the config for other files that need it
export const nextAuthConfig = authOptions;

export { handler as GET, handler as POST };
