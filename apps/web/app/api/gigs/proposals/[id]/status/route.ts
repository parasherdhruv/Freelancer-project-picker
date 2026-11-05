import { NextResponse } from 'next/server';
import { updateProposal } from '@/lib/freelancer-data';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const patch: any = {};
    if (body.status) patch.status = body.status;
    if (body.coverLetter !== undefined) patch.coverLetter = body.coverLetter;
    if (body.notes !== undefined) patch.notes = body.notes;
    if (body.proposedRate !== undefined) patch.proposedRate = Number(body.proposedRate);
    if (Array.isArray(body.milestones)) patch.milestones = body.milestones;

    const updated = updateProposal(id, patch);

    if (!updated) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update proposal status' }, { status: 400 });
  }
}
