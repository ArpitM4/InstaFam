# FamPoints Expiry System

## Overview
The FamPoints expiry system automatically expires unused points after 60 days to maintain an active and engaging community. This ensures that points are used for their intended purpose of supporting creators.

## Key Features

### 🕒 60-Day Expiration Period
- All earned FamPoints automatically expire 60 days after being earned
- Points are tracked individually with their own expiration dates
- FIFO (First In, First Out) spending ensures oldest points are used first

### 📊 Comprehensive Tracking
- **Active Points**: Available for use, not expired
- **Expiring Soon**: Points expiring within 30 days
- **Recently Expired**: Points that expired in the last 30 days
- **Total Spent**: All-time points used for redemptions

### 🔔 Notification System
- **7-day warnings**: Notifications sent when points will expire in 7 days
- **Expiry notifications**: Alerts when points have expired
- **Visual indicators**: UI badges showing expiry status

### 📈 Smart Point Management
- FIFO spending algorithm uses oldest points first
- Automatic expiry processing via cron jobs
- Detailed expiry breakdown for users

## Implementation Details

### Database Schema Updates

#### PointTransaction Model
```javascript
{
  type: 'Earned' | 'Spent' | 'Refund' | 'Expired',
  expiresAt: Date, // 60 days from creation for 'Earned' type
  expired: Boolean,
  used: Boolean,
  relatedTransactions: [ObjectId] // For tracking relationships
}
```

#### ExpiredPoints Model
```javascript
{
  userId: ObjectId,
  pointsExpired: Number,
  expiredAt: Date,
  originalTransactions: [ObjectId]
}
```

### API Endpoints

#### Points Information
- `GET /api/points` - Enhanced with expiry information
- `GET /api/points/expiring?days=30` - Get points expiring soon
- `GET /api/points/breakdown` - Detailed points breakdown

#### Expiry Processing
- `POST /api/points/process-expiry` - Manual expiry processing (for cron)
- `GET /api/points/process-expiry?action=warn` - Send expiry warnings

### Utility Functions

#### Point Management (`/utils/pointsHelpers.js`)
- `spendPoints(userId, amount)` - FIFO point spending
- `getAvailablePoints(userId)` - Get unexpired points
- `getExpiringPoints(userId, days)` - Get points expiring soon
- `processExpiredPoints()` - Process all expired points
- `sendExpiryWarnings(days)` - Send warning notifications

### Cron Jobs (`/utils/cronJobs.js`)
- **Daily Midnight**: Process expired points
- **Weekly Sunday 10 AM**: Send 7-day expiry warnings
- **Development**: Hourly checks for testing

## User Experience

### My FamPoints Page Updates
1. **Expiry Information Banner**: Explains the 60-day policy
2. **Expiry Warning Banner**: Shows points expiring soon
3. **Enhanced Transaction Display**: Shows expiry dates and status badges
4. **New Expiry Details Tab**: Comprehensive breakdown of all points

### Visual Indicators
- **🟢 Safe**: Points with 30+ days remaining
- **🟡 Warning**: Points expiring in 7-30 days
- **🔴 Critical**: Points expiring in ≤7 days (animated)
- **⚫ Expired**: Points that have expired

## Setup Instructions

### 1. Install Dependencies
```bash
npm install node-cron
```

### 2. Run Migration Script
```bash
node scripts/migratePointsExpiry.js
```
This adds expiry dates to existing points (60 days from creation date).

### 3. Environment Variables (Optional)
```env
CRON_API_KEY=your_secure_api_key_for_cron_endpoints
```

### 4. Verify Installation
```bash
node scripts/testExpirySystem.js
```

## Testing

### Manual API Testing
```bash
# Test expiry processing
curl -X GET "http://localhost:3000/api/points/process-expiry?action=expire"

# Test warning system
curl -X GET "http://localhost:3000/api/points/process-expiry?action=warn"

# Get expiring points
curl -X GET "http://localhost:3000/api/points/expiring?days=30"

# Get points breakdown
curl -X GET "http://localhost:3000/api/points/breakdown"
```

### Database Testing
Create test points with custom expiry dates:
```javascript
const testTransaction = new PointTransaction({
  userId: testUserId,
  type: 'Earned',
  amount: 100,
  expiresAt: new Date(Date.now() + 2 * 60 * 1000) // Expires in 2 minutes
});
```

## Monitoring

### Key Metrics to Track
- Daily expired points count
- User engagement with expiry warnings
- Average time before points are used
- Redemption pattern changes

### Logs to Monitor
- Cron job execution logs
- Point expiry processing results
- Failed notification attempts
- Database migration results

## Deployment Considerations

### Staging Rollout
1. **Phase 1**: Deploy without enabling actual expiration (testing only)
2. **Phase 2**: Enable UI warnings and expiry display
3. **Phase 3**: Begin expiry processing with 90-day grace period
4. **Phase 4**: Switch to 60-day expiration

### Production Monitoring
- Set up alerts for cron job failures
- Monitor expired points volume
- Track user complaints/support requests
- Monitor redemption rate changes

## Troubleshooting

### Common Issues

#### Cron Jobs Not Running
- Check server logs for initialization errors
- Verify timezone settings in cron configuration
- Ensure database connections are stable

#### Points Not Expiring
- Check `processExpiredPoints()` function logs
- Verify expiry dates are correctly set
- Check for database connection issues

#### Missing Expiry Dates
- Run migration script: `node scripts/migratePointsExpiry.js`
- Check PointTransaction schema default values
- Verify new points have expiry dates

### Support Commands
```bash
# Check points without expiry dates
db.pointtransactions.find({type: "Earned", expiresAt: {$exists: false}})

# Manual expiry processing
node -e "import('./utils/pointsHelpers.js').then(h => h.processExpiredPoints())"

# Check cron job status
# (View server logs for cron execution messages)
```

## Future Enhancements

### Potential Features
- User-configurable expiry preferences (premium feature)
- Point transfer between users before expiry
- Charity donation of expiring points
- Bulk point purchase with extended expiry
- Creator-specific point bonuses

### Analytics Integration
- Track expiry patterns by user demographics
- A/B test different expiry periods
- Measure impact on creator earnings
- Monitor user retention vs. expiry rates

---

**Note**: This system is designed to encourage active participation while providing clear communication about point expiration. Always test thoroughly in staging before deploying to production.
