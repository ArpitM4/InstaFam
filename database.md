# Sygil Database Schemas

This document explains all MongoDB schemas used in Sygil, their fields, and the purpose of each field.

---

## 1. User
Represents a platform user (creator or fan).

**Fields:**
- `_id`: Unique user ID (ObjectId)
- `username`: Unique username for profile URLs
- `email`: User's email address
- `password`: Hashed password (if not using OAuth)
- `avatar`: Profile image URL
- `role`: 'creator', 'fan', or 'admin'
- `followers`: Array of user IDs following this user
- `following`: Array of user IDs this user follows
- `bio`: Profile bio
- `createdAt`: Account creation date
- `updatedAt`: Last profile update

**Purpose:** Stores user identity, authentication, and social connections.

---

## 2. Notification
Represents a notification sent to a user.

**Fields:**
- `_id`: Unique notification ID
- `recipient`: User ID receiving the notification
- `sender`: User ID who triggered the notification
- `type`: Notification type (e.g., 'follow', 'event', 'vault', 'bonus')
- `message`: Notification text
- `read`: Boolean, whether notification is read
- `createdAt`: When notification was created

**Purpose:** Delivers real-time updates and alerts to users.

---

## 3. Payment
Represents a payment transaction (donation, support, etc.).

**Fields:**
- `_id`: Unique payment ID
- `from_user`: User ID who made the payment
- `to_user`: User ID receiving the payment (creator)
- `amount`: Payment amount (number)
- `currency`: Payment currency (e.g., 'USD')
- `method`: Payment method (PayPal, Razorpay, etc.)
- `status`: 'pending', 'completed', 'failed', etc.
- `createdAt`: Payment date

**Purpose:** Tracks all monetary transactions between users.

---

## 4. VaultItem
Represents a perk or reward offered by a creator.

**Fields:**
- `_id`: Unique vault item ID
- `creator`: User ID of the creator
- `title`: Name of the perk
- `description`: Details about the perk
- `fileType`: Type of reward ('digital', 'physical', 'text-reward', 'promise')
- `fileUrl`: URL to digital file (if applicable)
- `pointCost`: FamPoints required to redeem
- `createdAt`: When the item was added

**Purpose:** Defines redeemable rewards for fans.

---

## 5. Redemption
Represents a fan redeeming a vault item.

**Fields:**
- `_id`: Unique redemption ID
- `fan`: User ID of the fan
- `vaultItemId`: VaultItem ID being redeemed
- `creatorId`: Creator's user ID
- `pointCost`: Points spent
- `redeemedAt`: Date of redemption
- `status`: 'Pending', 'Fulfilled', 'Unfulfilled'
- `fanInput`: Q&A question (if applicable)
- `creatorResponse`: Creator's answer (if applicable)

**Purpose:** Tracks redemptions and Q&A interactions.

---

## 6. PointTransaction
Represents all FamPoints activity (earned, spent, expired, refunded, bonus).

**Fields:**
- `_id`: Unique transaction ID
- `user`: User ID
- `type`: 'Earned', 'Spent', 'Expired', 'Refund', 'Bonus'
- `amount`: Points amount (positive or negative)
- `description`: Reason for transaction
- `expiresAt`: Expiry date (if applicable)
- `used`: Boolean, whether points were spent
- `expired`: Boolean, whether points have expired
- `payment_id`: Payment ID (if earned via donation)
- `createdAt`: Transaction date

**Purpose:** Central ledger for all points activity, expiry, and refunds.

---

## 7. Bonus
Represents monthly bonuses awarded to creators.

**Fields:**
- `_id`: Unique bonus ID
- `creator`: User ID of the creator
- `amount`: Bonus points awarded
- `month`: Month/year of bonus (e.g., '2025-09')
- `reason`: Reason for bonus (activity, engagement, admin award)
- `createdAt`: Date bonus was credited

**Purpose:** Tracks all bonus points given to creators, including admin-awarded bonuses.

---

## 8. Event
Represents donation events run by creators.

**Fields:**
- `_id`: Unique event ID
- `creator`: User ID of the creator
- `title`: Event name
- `description`: Event details
- `startTime`: Event start date/time
- `endTime`: Event end date/time
- `topDonors`: Array of user IDs eligible for perks
- `createdAt`: Event creation date

**Purpose:** Manages time-based donation events and perk eligibility.

---

## 9. ExpiredPoints
Represents points that have expired for a user.

**Fields:**
- `_id`: Unique expired points ID
- `user`: User ID
- `amount`: Number of points expired
- `expiredAt`: Date of expiry

**Purpose:** Records expired points for audit and user notification.

---

## Schema Relationships

- **User** is referenced by Notification, Payment, VaultItem, Redemption, PointTransaction, Bonus, Event, ExpiredPoints.
- **VaultItem** is referenced by Redemption.
- **Payment** is referenced by PointTransaction.
- **Redemption** links User (fan) to VaultItem and Creator.
- **Bonus** links to User (creator).
- **Event** links to User (creator) and top donors.
- **ExpiredPoints** links to User.

---

This schema design supports Sygil's features: social following, donations, vault perks, points economy, expiry, admin bonuses, and real-time notifications.
