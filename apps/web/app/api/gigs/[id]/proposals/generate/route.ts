import { NextResponse } from 'next/server';
import {
  addProposal,
  generateDeterministicProposal,
  getGigs,
  getProfile,
  updateGigStatus,
} from '@/lib/freelancer-data';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const gigs = getGigs();
  const gig = gigs.find((g) => g.id === id);

  if (!gig) {
    return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
  }

  const profile = getProfile();
  const proposal = generateDeterministicProposal(profile, gig);

  // Safety: Proposal is marked READY_FOR_REVIEW. Never submitted automatically.
  addProposal(proposal);
  updateGigStatus(gig.id, 'PROPOSAL_GENERATED');

  return NextResponse.json(proposal);
}
