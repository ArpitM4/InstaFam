import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import path from 'path';

// Check if user is admin
async function isAdminUser(email) {
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',');
  return adminEmails.includes(email);
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await isAdminUser(session.user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get date range parameter
    const { searchParams } = new URL(req.url);
    const dateRange = searchParams.get('dateRange') || '7days';

    const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
    if (!propertyId) {
      return NextResponse.json({ error: 'Missing Google Analytics Property ID' }, { status: 500 });
    }
    const keyFilePath = path.join(process.cwd(), 'google-service-account.json');
    const analyticsDataClient = new BetaAnalyticsDataClient({
      keyFilename: keyFilePath,
      timeout: 30000,
    });

    // Helper function to format duration
    const formatDuration = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}m ${remainingSeconds}s`;
    };

    // Calculate start date based on date range
    const getStartDate = (range) => {
      switch (range) {
        case '24hours':
        case '1day':
          return '1daysAgo';
        case '7days':
          return '7daysAgo';
        case '30days':
          return '30daysAgo';
        case '90days':
          return '90daysAgo';
        default:
          return '7daysAgo';
      }
    };

    // Fetch analytics data
    const [overviewResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: getStartDate(dateRange),
          endDate: 'today',
        },
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
        { name: 'newUsers' },
      ],
    });

    const [pagesResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: getStartDate(dateRange),
          endDate: 'today',
        },
      ],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 5,
    });

    const [deviceResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: getStartDate(dateRange),
          endDate: 'today',
        },
      ],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [{ name: 'activeUsers' }],
    });

    const [countryResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: getStartDate(dateRange),
          endDate: 'today',
        },
      ],
      dimensions: [{ name: 'country' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 5,
    });

    const [realtimeResponse] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [{ name: 'activeUsers' }],
    });

    // Extract overview metrics
    const overviewRow = overviewResponse.rows?.[0];
    const overview = {
      users: parseInt(overviewRow?.metricValues?.[0]?.value || '0'),
      sessions: parseInt(overviewRow?.metricValues?.[1]?.value || '0'),
      pageviews: parseInt(overviewRow?.metricValues?.[2]?.value || '0'),
      avgSessionDuration: formatDuration(parseFloat(overviewRow?.metricValues?.[3]?.value || '0')),
      bounceRate: `${(parseFloat(overviewRow?.metricValues?.[4]?.value || '0') * 100).toFixed(1)}%`,
      newUsers: parseInt(overviewRow?.metricValues?.[5]?.value || '0'),
    };

    // Extract top pages
    const topPages = pagesResponse.rows?.map(row => ({
      page: row.dimensionValues[0].value,
      views: parseInt(row.metricValues[0].value),
      percentage: `${((parseInt(row.metricValues[0].value) / overview.pageviews) * 100).toFixed(1)}%`
    })) || [];

    // Extract device breakdown
    const deviceData = {};
    deviceResponse.rows?.forEach(row => {
      const device = row.dimensionValues[0].value.toLowerCase();
      deviceData[device] = parseInt(row.metricValues[0].value);
    });

    const totalDeviceUsers = Object.values(deviceData).reduce((sum, val) => sum + val, 0);
    const deviceBreakdown = {
      desktop: totalDeviceUsers ? Math.round((deviceData.desktop || 0) / totalDeviceUsers * 100) : 0,
      mobile: totalDeviceUsers ? Math.round((deviceData.mobile || 0) / totalDeviceUsers * 100) : 0,
      tablet: totalDeviceUsers ? Math.round((deviceData.tablet || 0) / totalDeviceUsers * 100) : 0,
    };

    // Extract top countries
    const topCountries = countryResponse.rows?.map(row => ({
      country: row.dimensionValues[0].value,
      users: parseInt(row.metricValues[0].value)
    })) || [];

    // Extract real-time users
    const realtimeUsers = parseInt(realtimeResponse.rows?.[0]?.metricValues?.[0]?.value || '0');

    return NextResponse.json({
      realtimeUsers,
      overview,
      topPages,
      deviceBreakdown,
      topCountries,
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
  }
}

function generateMockAnalyticsData(dateRange) {
  // Adjust mock data based on date range
  const multiplier = dateRange === '24hours' ? 1 :
    dateRange === '7days' ? 7 :
      dateRange === '30days' ? 30 : 90;

  // Generate consistent but random-looking data
  const baseUsers = 42;
  const users = Math.floor(baseUsers * multiplier * (0.9 + Math.random() * 0.2));
  const sessions = Math.floor(users * (1.3 + Math.random() * 0.4));
  const pageviews = Math.floor(sessions * (3.2 + Math.random() * 0.6));
  const newUsers = Math.floor(users * (0.35 + Math.random() * 0.1));

  // Calculate trends (showing growth)
  const usersTrend = Math.floor(Math.random() * 12) + 3;
  const sessionsTrend = Math.floor(Math.random() * 15) + 1;
  const pageviewsTrend = Math.floor(Math.random() * 10) + 5;
  const durationTrend = Math.floor(Math.random() * 8) - 2;
  const bounceTrend = -1 * (Math.floor(Math.random() * 6) + 1); // Negative is good for bounce rate
  const newUsersTrend = Math.floor(Math.random() * 14) + 6;

  // Top pages data with realistic distribution
  const totalViews = pageviews;
  const homeViews = Math.floor(totalViews * (0.32 + Math.random() * 0.05));
  const blogViews = Math.floor(totalViews * (0.18 + Math.random() * 0.03));
  const vaultViews = Math.floor(totalViews * (0.15 + Math.random() * 0.02));
  const storeViews = Math.floor(totalViews * (0.09 + Math.random() * 0.02));
  const pointsViews = Math.floor(totalViews * (0.06 + Math.random() * 0.01));

  // Device breakdown (desktop-heavy for admin sites)
  const desktop = 65 + Math.floor(Math.random() * 10);
  const mobile = 100 - desktop - (5 + Math.floor(Math.random() * 5));
  const tablet = 100 - desktop - mobile;

  return {
    // Note indicating mock data
    mockData: true,

    // Live users count
    realtimeUsers: Math.floor(Math.random() * (multiplier > 30 ? 25 : 12)) + 3,

    // Overview stats with trends
    overview: {
      users: users,
      usersTrend: usersTrend,
      sessions: sessions,
      sessionsTrend: sessionsTrend,
      pageviews: pageviews,
      pageviewsTrend: pageviewsTrend,
      avgSessionDuration: `${Math.floor(2 + Math.random())}m ${Math.floor(Math.random() * 60)}s`,
      durationTrend: durationTrend,
      bounceRate: `${Math.floor(35 + Math.random() * 15)}%`,
      bounceTrend: bounceTrend,
      newUsers: newUsers,
      newUsersTrend: newUsersTrend
    },

    // Top pages with realistic percentages
    topPages: [
      {
        page: '/',
        views: homeViews,
        percentage: `${Math.round((homeViews / totalViews) * 100)}%`
      },
      {
        page: '/blogs',
        views: blogViews,
        percentage: `${Math.round((blogViews / totalViews) * 100)}%`
      },
      {
        page: '/vault',
        views: vaultViews,
        percentage: `${Math.round((vaultViews / totalViews) * 100)}%`
      },
      {
        page: '/fam-store',
        views: storeViews,
        percentage: `${Math.round((storeViews / totalViews) * 100)}%`
      },
      {
        page: '/my-fam-points',
        views: pointsViews,
        percentage: `${Math.round((pointsViews / totalViews) * 100)}%`
      }
    ],

    // Device breakdown
    deviceBreakdown: {
      desktop: desktop,
      mobile: mobile,
      tablet: tablet
    },

    // Geographic data
    topCountries: [
      { country: 'India', users: Math.floor(users * 0.45) },
      { country: 'United States', users: Math.floor(users * 0.25) },
      { country: 'United Kingdom', users: Math.floor(users * 0.10) },
      { country: 'Canada', users: Math.floor(users * 0.05) },
      { country: 'Germany', users: Math.floor(users * 0.03) }
    ]
  };
}