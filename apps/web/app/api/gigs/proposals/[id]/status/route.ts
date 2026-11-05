import { NextResponse } from 'next/server';
import { updateProposal } from '@/lib/freelancer-data';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const updated = updateProposal(id, {
      status: body.status,
      coverLetter: body.coverLetter,
      notes: body.notes,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update proposal status' }, { status: 400 });
  }
}
