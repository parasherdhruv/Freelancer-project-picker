import { NextResponse } from 'next/server';
import { getGigs, getProfile, scoreGig } from '@/lib/freelancer-data';

export async function GET(req: Request) {
  // Can be called by Vercel Cron, GitHub Actions, or Railway scheduled worker
  const profile = getProfile();
  const gigs = getGigs();

  const scoredMatches = gigs.map((gig) => {
    const evaluation = scoreGig(profile, gig);
    return {
      title: gig.title,
      client: gig.clientName,
      winnabilityScore: evaluation.score,
      matchedSkills: evaluation.matchedSkills,
      url: gig.sourceUrl,
    };
  });

  return NextResponse.json({
    status: 'success',
    message: 'Automated daily discovery check completed successfully.',
    totalOpportunitiesScanned: gigs.length,
    highWinnabilityCount: scoredMatches.filter((m) => m.winnabilityScore >= 80).length,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  return GET(req);
}
