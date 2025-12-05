# Sygil - Creator Monetization Platform

![Sygil Logo](public/Text.png)

Sygil is a comprehensive creator monetization platform built with Next.js 14, enabling creators to connect with their audience, receive donations, and offer exclusive perks through a vault system. The platform features real-time notifications, event management, and a points-based reward system.


## 🌟 **Key Features**

### **� FamPoints Expiry System**
- **Automatic Expiry:** FamPoints expire 60 days after earning if not used, encouraging active participation.
- **Expiry Warnings:** Users receive warnings 7 days before points expire.
- **Expiry Dashboard:** Users can view detailed expiry breakdowns, including points expiring soon, recently expired, and total spent.

### **�🔐 Authentication & Security**
- **Multi-Provider OAuth**: Google and GitHub social login integration
- **NextAuth.js**: Secure session management with JWT tokens
- **Password Security**: Enhanced login forms with password visibility toggles
- **Protected Routes**: Role-based access control for creators and fans

### **💰 Payment & Monetization**
- **PayPal Integration**: Production-ready payment processing with error handling
- **Real-time Donations**: Live leaderboard updates during events
- **Fam Points System**: Reward system for user engagement (1 point per $1 donated)
- **Event Management**: Time-based donation events with custom durations
- **Flexible Perk System**: Creators can set custom top N donors (1-100) for perk eligibility


- **Admin Bonus Capability:** Admins can award monthly bonuses to creators based on vault activity and engagement, with full tracking and analytics.
- **Bonus System**: Creators receive monthly bonuses based on vault activity and engagement
- **Creator Vaults**: Digital and physical perk offerings
- **Smart Redemption**: Points-based redemption with Q&A system
- **Perk Leaderboard**: Visual indicators for perk-eligible donors with golden styling
- **Creator Responses**: Direct communication for redemption fulfillment

### **🔔 Notification System**
- **Real-time Updates**: 30-second polling for instant notifications
- **Smart Grouping**: Multiple similar notifications grouped intelligently
- **Follow Notifications**: Automatic alerts for new followers
- **Event Alerts**: Followers notified when creators start events
- **Vault Updates**: Notifications for new vault items

### **👥 Social Features**
- **Follow System**: Bi-directional following with privacy controls
- **Creator Profiles**: Dynamic username-based profile pages
- **Explore Page**: Discover new creators with search functionality
- **Privacy First**: Follower counts hidden from public view

- **Admin FamPoints Dashboard:** Admins have access to a dedicated dashboard to monitor all FamPoints activity across the platform, including expiry stats, bonus distributions, and user engagement.
- **Modular Dashboard**: Route-based navigation (/dashboard, /dashboard/payment, etc.)
- **Earnings Tracking**: Comprehensive payment history and analytics
- **Vault Management**: Easy creation and management of digital/physical perks
- **Request Handling**: Q&A system for vault redemptions

### **🎨 Enhanced User Experience**
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Loading States**: Smooth loading indicators and skeleton screens
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Accessibility**: ARIA labels and keyboard navigation support
- **Theme Support**: Light/dark mode ready architecture

## 📁 **Latest Folder Structure**

```
Sygil/
├── app/                          # Next.js 14 App Router
│   ├── admin/                    # Admin dashboard & analytics
│   │   └── dashboard/
│   │       ├── analytics/
│   │       ├── bonus/
│   │       ├── google-analytics/
│   │       ├── search/
│   │       ├── verification/
│   │       └── page.js
│   ├── dashboard/                # Creator dashboard
│   │   ├── payment/
│   │   ├── requests/
│   │   ├── vault/
│   │   ├── vault-payouts/
│   │   └── page.js
│   ├── api/                      # API routes (auth, vault, payments, etc.)
│   ├── blogs/
│   ├── explore/
│   ├── login/
│   ├── signup/
│   ├── [username]/               # Dynamic creator profiles
│   └── ...                       # Other pages (about, contact, etc.)
├── components/                   # React Components
│   ├── admin/
│   ├── dashboard/
│   ├── Account.js
│   ├── Dashboard.js
│   ├── DashboardLayout.js
│   ├── FollowButton.js
# InstaFam (Sygil) — Creator Monetization Platform

![Logo](public/Text.png)

This repository contains InstaFam (internal name Sygil), a creator monetization platform built with Next.js (App Router) and MongoDB. The app enables creators to accept contributions, offer perks via a vault, and manage fan engagement with a points-based economy.

This README has been updated to reflect the current state of the codebase and recent changes.

## What’s New / Current State

- Added per-page visibility customization for creator profile sections. Creators can enable/disable sections (contribute, vault, links, subscription, courses, giveaway, community, merchandise) and the site prevents direct URL access to disabled sections.
- Created standalone pages for `subscription`, `courses`, and `giveaway` under `app/[username]/`.
- Payment page (`PaymentPage`) now supports dynamic visible sections, owner-only controls, and a responsive customize modal.
- Leaderboard amounts are blurred for non-owners; owners see full amounts.
- Fixed serialization issues: all APIs and server actions serialize Mongo ObjectIds and Dates to plain objects to avoid Next.js client component warnings.
- Database migration scripts added and executed to remove `merchandise` from defaults and update existing users' `visibleSections`:
	- `scripts/remove-merchandise-section.mjs`
	- `scripts/set-default-sections.mjs`
- Default `visibleSections` changed to `['contribute','vault','links']` (merchandise removed from default).

## Key Features (short)

- Creator pages with modular sections (contribute, vault, links, community, subscription, courses, giveaway).
- Customizable visible sections stored per-user in `User.visibleSections`.
- PayPal integration for donations with server-side capture handling and ranking (ranked vs unranked donations).
- FamPoints economy with point awards and expiry system.
- Vault system for digital/physical perks, requests, and automated refunds for expired requests.
- Admin capabilities: bonus distribution, analytics, verification workflows.
- Notifications (polling-based), follow system, and explore/search pages.

## Important Implementation Notes

- Authentication: NextAuth with JWT strategy; session callback now uses JWT claims for user data (optimized - no DB query on every session check). User data is refreshed periodically every 5 minutes.
- APIs: Many API routes are dynamic and return serialized plain objects (ObjectId.toString and ISO date strings) to be safe for client components.
- Images: Components now use Next.js `Image` component for optimized loading with automatic resizing and lazy loading.

## Performance Optimizations (Implemented)

The following optimizations have been applied to improve page load times and reduce server load:

### Database Layer
- **Indexes**: Added compound indexes to `User` (email, username), `Payment` (to_user + createdAt, from_user + createdAt), and `PointTransaction` (userId + type + createdAt, userId + used + expired).
- **Connection Pooling**: MongoDB connections now use optimized pool settings (minPoolSize: 5, maxPoolSize: 10) to reduce connection overhead.
- **Run index sync**: Execute `node scripts/sync-indexes.mjs` to ensure all indexes are created in MongoDB.

### NextAuth Session
- Removed DB query from session callback - now uses JWT claims directly.
- User data stored in JWT token and refreshed every 5 minutes instead of on every request.
- Eliminates "slow session detection" issue.

### Image Optimization
- Migrated from raw `<img>` tags to Next.js `Image` component across:
  - `PaymentProfileSection.js` (profile pictures)
  - `Navbar.js` (logo)
  - `LinksSection.js` (social icons, product images)
  - `app/explore/page.js` (creator avatars)
  - `app/search/[query]/page.js` (user avatars)
- Added image domain patterns to `next.config.mjs` for external images.

### Component Optimization
- **Dynamic Imports**: Heavy components (PaymentInteractionSection, VaultSection, LinksSection, etc.) are now dynamically imported with loading states.
- **Memoization**: Added `useCallback` for event handlers and `useMemo` for computed values (isOwner, isEventActive) in PaymentPage.
- **UserContext**: Consolidated duplicate useEffect calls, added parallel data fetching with Promise.all, increased throttle to 5 seconds.

### API Response Caching
- `/api/explore`: 5 minute cache (s-maxage=300, stale-while-revalidate=600)
- `/api/search`: 1 minute cache (s-maxage=60, stale-while-revalidate=120)
- `/api/customize-sections` (GET): 2 minute cache
- `/api/links` (GET): 2 minute cache

### Resource Hints
- Added preconnect/dns-prefetch for external domains (picsum.photos, api.dicebear.com, cdn.simpleicons.org, res.cloudinary.com, paypal.com) in layout.js.

## Code Structure (high-level)

Key folders:

- `app/` — Next.js App Router pages and API routes (including `app/[username]/` for creator pages).
- `components/` — UI components (PaymentPage, DashboardLayout, Navbar, etc.).
- `models/` — Mongoose schemas (`User`, `Payment`, `PointTransaction`, etc.).
- `actions/` — Server actions and helpers (`useractions.js`, `vaultActions.js`).
- `db/` — `ConnectDb.js` for MongoDB connection.
- `scripts/` — migration/maintenance scripts (e.g., updating `visibleSections`).

## Developer Setup

1. Clone and install:

```powershell
git clone <repo-url>
cd InstaFam
npm install
```

2. Environment variables — create `.env.local` with the required values (MongoDB URI, NextAuth secrets, OAuth credentials, PayPal keys).

3. Run dev server:

```powershell
npm run dev
# or
pnpm dev
```

## Notable Files / Routes

- `app/[username]/page.js` — Main creator payment/profile page (uses `PaymentPage` component).
- `app/[username]/subscription/page.js` — Subscription section page.
- `app/[username]/courses/page.js` — Courses section page.
- `app/[username]/giveaway/page.js` — Giveaway section page.
- `app/api/customize-sections/route.js` — GET/POST API to read/update `visibleSections`.
- `components/PaymentPage.js` — Main page for creator profile; implements section toggles, customize modal, event/payment logic.
- `actions/useractions.js` — Server-side data helpers (`fetchuser`, `fetchpayments`, `updateProfile`, etc.) with `.lean()` and serialization.
- `models/User.js` — User schema contains `visibleSections` (default updated to `['contribute','vault','links']`).

## Database & Migration

- `visibleSections` stored on `User` documents (array of strings). Valid values: `contribute`, `vault`, `links`, `merchandise`, `community`, `subscription`, `courses`, `giveaway`.
- Migration scripts included to update existing users and remove `merchandise` from defaults. If you run into pages appearing unexpectedly, re-run `scripts/set-default-sections.mjs`.

## Developer Commands

```powershell
# Sync database indexes (run after deployment or when adding new indexes)
node scripts/sync-indexes.mjs

# Update default visible sections for existing users
node scripts/set-default-sections.mjs
```

## Troubleshooting

- If a disabled section is still accessible: verify `visibleSections` in the user's document and ensure migration scripts were run.
- If Next.js complains about serialization: look for any remaining Mongoose ObjectIds/Dates being sent directly to client components.

---

If you want, I can:

- Apply the suggested performance improvements (indexes, session optimization, image migration) in small, testable PRs.
- Generate a concise developer-debt checklist and prioritized implementation plan.

— End of README update
```

