import { NextResponse } from 'next/server';
import {
  addProposal,
  generateDeterministicProposal,
  getGigs,
  getProfile,
  ProposalStrategy,
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

  let strategy: ProposalStrategy = 'TECHNICAL';
  try {
    const body = await req.json();
    if (body.strategy && ['TECHNICAL', 'RAPID_DELIVERY', 'CONSULTING'].includes(body.strategy)) {
      strategy = body.strategy;
    }
  } catch {
    // default to technical
  }

  const profile = getProfile();
  const proposal = generateDeterministicProposal(profile, gig, strategy);

  // Safety: Proposal is marked READY_FOR_REVIEW. Never submitted automatically.
  addProposal(proposal);
  updateGigStatus(gig.id, 'PROPOSAL_GENERATED');

  return NextResponse.json(proposal);
}
