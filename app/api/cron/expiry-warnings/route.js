import { NextResponse } from 'next/server';
import connectDB from '@/db/ConnectDb';
import { sendExpiryWarnings } from '@/utils/pointsHelpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Verify cron secret to prevent unauthorized access
const verifyCronSecret = (request) => {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // If no secret is set, allow in development
    if (!cronSecret && process.env.NODE_ENV === 'development') {
        return true;
    }

    return authHeader === `Bearer ${cronSecret}`;
};

export async function GET(request) {
    try {
        // Verify this is a legitimate cron request
        if (!verifyCronSecret(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Get days parameter from query string, default to 7
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days')) || 7;

        console.log(`Sending expiry warnings for points expiring in ${days} days...`);
        const result = await sendExpiryWarnings(days);

        return NextResponse.json({
            success: true,
            message: `Expiry warnings sent for ${days} day window`,
            result
        });

    } catch (error) {
        console.error('Error sending expiry warnings:', error);
        return NextResponse.json(
            { error: 'Failed to send expiry warnings', details: error.message },
            { status: 500 }
        );
    }
}
