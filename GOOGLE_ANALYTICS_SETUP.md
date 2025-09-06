# Google Analytics Integration Setup Guide

## Overview
This guide will help you integrate real Google Analytics data into your admin dashboard.

## Prerequisites
1. A Google Analytics 4 (GA4) property set up for your website
2. A Google Cloud Project with the Google Analytics Reporting API enabled
3. A service account with appropriate permissions

## Step 1: Set up Google Analytics 4

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property for your website
3. Install the GA4 tracking code on your website
4. Note down your **Property ID** (format: 123456789)

## Step 2: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Analytics Reporting API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Analytics Reporting API"
   - Click "Enable"

## Step 3: Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details
4. Download the JSON key file
5. Store the key file securely (don't commit to git!)

## Step 4: Grant Analytics Access

1. Go to your Google Analytics property
2. Navigate to "Admin" > "Property" > "Property Access Management"
3. Click "+" to add users
4. Add your service account email (from the JSON file)
5. Grant "Viewer" role

## Step 5: Install Dependencies

```bash
npm install @google-analytics/data
```

## Step 6: Environment Variables

Add these to your `.env.local`:

```bash
# Google Analytics
GOOGLE_ANALYTICS_PROPERTY_ID=123456789
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SERVICE_ACCOUNT_CLIENT_ID=123456789012345678901
```

## Step 7: Update API Route

Replace the mock data in `/app/api/admin/google-analytics/route.js` with the actual Google Analytics API implementation (commented code is provided as reference).

## Step 8: Install GA4 Tracking

Add the Google Analytics tracking code to your website. In Next.js, you can add it to `app/layout.js`:

```javascript
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

## Features Available

Once set up, your Google Analytics dashboard will show:

- **Real-time metrics**: Current active users
- **Overview stats**: Total users, sessions, page views, bounce rate
- **Trend analysis**: Period-over-period comparisons
- **Top pages**: Most visited pages with view counts
- **Device breakdown**: Desktop, mobile, tablet usage
- **Geographic data**: Top countries by user count
- **Time-based filtering**: Last 24 hours, 7 days, 30 days, 90 days

## Troubleshooting

### Common Issues:

1. **"Insufficient permissions"**: Make sure the service account has Viewer access to your GA property
2. **"Property not found"**: Verify the Property ID is correct
3. **"Invalid credentials"**: Check that the service account JSON is properly formatted in environment variables
4. **"No data"**: Ensure GA4 is properly installed and has been collecting data for at least 24 hours

### Testing:

You can test the integration by:
1. Checking the browser's Network tab for API calls
2. Looking at the console for any error messages
3. Verifying data matches what you see in the Google Analytics dashboard

## Security Notes

- Never commit service account keys to version control
- Use environment variables for all sensitive credentials
- Restrict service account permissions to minimum required (Viewer role)
- Consider using Google Cloud Secret Manager for production deployments

## Further Reading

- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/reporting/data/v1)
- [Google Analytics Data API](https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart-client-libraries)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
