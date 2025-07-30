# InstaFam - Next.js Web Application Folder Structure

## 📁 **Root Directory Structure**

```
InstaFam/
├── app/                          # Next.js 14 App Router
├── components/                   # React Components
├── models/                       # MongoDB Models
├── actions/                      # Server Actions
├── utils/                        # Utility Functions
├── db/                          # Database Configuration
├── public/                      # Static Assets
├── styles/                      # CSS/Styling
└── scripts/                     # Database Migration Scripts
```

## 🚀 **App Directory (Next.js 14 App Router)**

```
app/
├── api/                         # API Routes
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.js         # NextAuth Configuration
│   ├── notifications/
│   │   ├── route.js            # Main notifications API
│   │   ├── [id]/route.js       # Mark notification as read
│   │   ├── mark-all-read/route.js
│   │   └── followers/
│   │       ├── event/route.js   # Notify followers of events
│   │       └── vault/route.js   # Notify followers of vault items
│   ├── users/
│   │   └── [id]/
│   │       └── follow/route.js  # Follow/Unfollow API
│   ├── vault/
│   │   ├── add/route.js        # Add vault items
│   │   └── redeem/route.js     # Redeem vault items
│   ├── explore/route.js        # Explore creators
│   ├── search/route.js         # Search functionality
│   └── payments/route.js       # Payment processing
├── dashboard/                   # Dashboard Routes
│   ├── page.js                 # General dashboard
│   ├── payment/page.js         # Payment info
│   ├── vault/page.js           # My vault
│   └── requests/page.js        # Vault requests
├── test-notifications/
│   └── page.js                 # Notification testing
├── test-follow/
│   └── page.js                 # Follow system testing
├── [username]/
│   └── page.js                 # Creator profile pages
├── login/page.js               # Login page
├── my-fam-points/page.js       # User points page
├── explore/page.js             # Explore creators
├── search/page.js              # Search page
├── layout.js                   # Root layout
├── page.js                     # Home page
└── globals.css                 # Global styles
```

## 🧩 **Components Directory**

```
components/
├── dashboard/                   # Dashboard Components
│   ├── GeneralSettings.js      # Instagram verification
│   ├── PaymentInfo.js          # Earnings & payment details
│   ├── MyVault.js              # Vault items management
│   └── VaultRequests.js        # Q&A system & redemptions
├── Account.js                   # User account management
├── Dashboard.js                 # Legacy dashboard (redirects)
├── DashboardLayout.js          # Shared dashboard layout
├── FollowButton.js             # Follow/unfollow functionality
├── Footer.js                   # Site footer
├── Navbar.js                   # Main navigation
├── NotificationBell.js         # Notification dropdown
├── PaymentInteractionSection.js # Payment UI components
├── PaymentPage.js              # Creator profile/payment page
├── PaymentProfileSection.js    # Profile display section
├── SessionWrapper.js           # NextAuth session wrapper
└── VaultSection.js             # Vault items display
```

## 🗃️ **Models Directory (MongoDB Schemas)**

```
models/
├── User.js                     # User schema with follow system
├── Notification.js             # Notification system
├── Payment.js                  # Payment transactions
├── VaultItem.js               # Vault items/perks
└── Redemption.js              # Vault redemptions
```

## ⚡ **Actions Directory (Server Actions)**

```
actions/
├── useractions.js             # User-related server actions
└── notificationActions.js     # Notification server actions
```

## 🛠️ **Utils Directory**

```
utils/
├── notificationHelpers.js     # Notification creation helpers
└── notificationHelpers.js     # Follow system notifications
```

## 🗄️ **Database Configuration**

```
db/
└── ConnectDb.js               # MongoDB connection setup
```

## 📋 **Key Features Implemented**

### **Authentication System**
- NextAuth with Google OAuth
- Session management across app
- Protected routes and API endpoints

### **Notification System**
- Real-time notification bell with unread counts
- Creator-fan interaction notifications
- Event and vault item notifications for followers
- System/admin message capability

### **Follow System**
- Follow/unfollow functionality
- Bi-directional following (followers/following arrays)
- Privacy controls (follower counts hidden from public)
- Automatic notifications for followers

### **Dashboard System**
- Route-based dashboard (/dashboard, /dashboard/payment, etc.)
- Modular components (broken down from 1500+ lines)
- Creator analytics and settings
- Payment information management

### **Vault System**
- Vault item creation and management
- Redemption system with Q&A functionality
- Creator response system
- Points-based economy

### **Creator Profile System**
- Dynamic creator pages (/{username})
- Payment integration
- Event management
- Vault display and redemption

## � **Technical Stack**

- **Framework**: Next.js 14 with App Router
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS (configured in globals.css)
- **Notifications**: Custom real-time system with 30s polling
- **Payment**: Razorpay integration
- **Session Management**: NextAuth with custom callbacks

## 📊 **Current Database Relations**

- **Users** have followers/following arrays
- **Notifications** reference Users (recipient/sender)
- **VaultItems** belong to Users (creators)
- **Redemptions** link Users (fans) to VaultItems
- **Payments** track transactions between Users

This structure supports a full social media platform with creator monetization, fan engagement, and real-time notifications.
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
