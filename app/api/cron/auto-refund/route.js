import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Call the process expired redemptions endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/process-expired-redemptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();

    if (result.success) {
      console.log(`Auto-refund cron job completed: ${result.totalProcessed} redemptions processed`);
      return NextResponse.json({
        success: true,
        message: 'Auto-refund process completed successfully',
        ...result
      });
    } else {
      throw new Error(result.error || 'Failed to process auto-refunds');
    }

  } catch (error) {
    console.error('Auto-refund cron job failed:', error);
    return NextResponse.json(
      { success: false, error: 'Auto-refund cron job failed' },
      { status: 500 }
    );
  }
}
