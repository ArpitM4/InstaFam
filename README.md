# InstaFam - Support Your Favorite Creators

InstaFam is a full-stack web application built with Next.js that empowers fans to support their favorite Instagram creators through secure donations. It provides a seamless experience for both creators and their supporters, featuring user authentication, dynamic creator profiles, a secure payment system with PayPal, and a dedicated creator dashboard.

---

## ✨ Features

### For Everyone
- **Explore Creators**: Discover a random selection of verified creators on the explore page.
- **Search**: Find specific creators using the search bar.
- **View Profiles**: Anyone can view a creator's public page, their description, and their donation leaderboard.
- **Light/Dark Mode**: A theme toggler for a comfortable viewing experience.

### For Fans (Logged-in Users)
- **Secure Authentication**: Sign up/in with email & password, or use OAuth with Google and GitHub.
- **Donate Securely**: Make donations to creators using PayPal.
- **Personalized Messages**: Leave a supportive message along with your donation.
- **Leaderboard Recognition**: Get featured on the creator's public leaderboard.

### For Creators
- **Creator Dashboard**: A central hub to manage your profile and finances.
- **Instagram Verification**: A unique OTP-based system. Creators DM a generated OTP to the official InstaFam Instagram page to get a "verified" status, which makes them discoverable.
- **Profile Customization**: Update your name, profile picture, cover photo, and a personal description.
- **Event Management**: Launch special time-bound "Events" to drive donations. A live countdown timer is displayed on your page.
- **Perk Management**: Set a custom "perk" to reward your top 5 donors.
- **Earnings & History**: View your total earnings and a detailed history of all donations received.
- **Payment Info**: Update your payment details (Phone/UPI) for payouts.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: MongoDB with Mongoose
- **Payments**: PayPal
- **State Management**: React Hooks (`useState`, `useEffect`) & React Context API
- **Deployment**: Vercel

---

## 🚀 Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

- Node.js (v18 or later)
- A MongoDB instance (local or cloud-based like MongoDB Atlas)
- A PayPal account to handle payments.
- Google & GitHub OAuth credentials for social logins.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/instafam.git
cd instafam
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

Create a file named `.env.local` in the root of the project and add the following variables.

```env
# MongoDB Connection String
MONGODB_URI=your_mongodb_connection_string

# NextAuth Configuration
NEXTAUTH_SECRET=a_super_secret_string_for_jwt_hashing
NEXT_PUBLIC_URL=http://localhost:3000

# NextAuth Providers (OAuth Credentials)
GOOGLE_ID=your_google_client_id
GOOGLE_SECRET=your_google_client_secret
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret

# PayPal API Keys
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Razorpay (Optional, if you wish to use it)
KEY_SECRET=your_razorpay_key_secret
```

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
