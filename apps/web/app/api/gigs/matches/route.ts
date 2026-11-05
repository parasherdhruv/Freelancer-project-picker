import { NextResponse } from 'next/server';
import { getGigs, getProfile, scoreGig } from '@/lib/freelancer-data';

export async function GET(req: Request) {
  const profile = getProfile();
  const gigs = getGigs();

  const url = new URL(req.url);
  const rateParam = url.searchParams.get('simulatedRate');
  const simulatedRate = rateParam ? Number(rateParam) : undefined;

  const scoredMatches = gigs.map((gig) => {
    const evaluation = scoreGig(profile, gig, simulatedRate);
    return {
      gig: {
        ...gig,
        winnabilityScore: evaluation.score,
        scoringBreakdown: evaluation.breakdown,
      },
      score: evaluation.score,
      breakdown: evaluation.breakdown,
      matchedSkills: evaluation.matchedSkills,
      missingSkills: evaluation.missingSkills,
      keyStrengths: evaluation.keyStrengths,
      riskFactors: evaluation.riskFactors,
    };
  });

  scoredMatches.sort((a, b) => b.score - a.score);

  return NextResponse.json({
    freelancer: profile,
    simulatedRate,
    totalGigs: gigs.length,
    matches: scoredMatches,
  });
}
