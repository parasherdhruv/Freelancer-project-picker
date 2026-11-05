import { NextResponse } from 'next/server';
import { syncLiveRemoteGigs, getGigs } from '@/lib/freelancer-data';

export async function POST() {
  try {
    const result = await syncLiveRemoteGigs();
    return NextResponse.json({
      success: true,
      message: `Discovered and synced ${result.newCount} fresh live gigs from real web feeds.`,
      newCount: result.newCount,
      totalGigs: getGigs().length,
      syncedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Sync failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
