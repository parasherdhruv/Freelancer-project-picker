import { NextResponse } from 'next/server';
import { getGigs, getProfile, scoreGig } from '@/lib/freelancer-data';

export async function GET() {
  const profile = getProfile();
  const gigs = getGigs();

  const scoredMatches = gigs.map((gig) => {
    const evaluation = scoreGig(profile, gig);
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
    totalGigs: gigs.length,
    matches: scoredMatches,
  });
}
