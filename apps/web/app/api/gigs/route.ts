import { NextResponse } from 'next/server';
import { addGig, getGigs } from '@/lib/freelancer-data';

export async function GET() {
  return NextResponse.json(getGigs());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const now = new Date().toISOString();
    const newGig = {
      id: `gig_manual_${Date.now()}`,
      title: body.title || 'Untitled Gig',
      clientName: body.clientName || 'Client',
      clientLocation: body.clientLocation || 'Remote',
      clientRating: body.clientRating !== undefined ? Number(body.clientRating) : 4.9,
      clientReviewCount: body.clientReviewCount !== undefined ? Number(body.clientReviewCount) : 5,
      clientTotalSpent: body.clientTotalSpent !== undefined ? Number(body.clientTotalSpent) : 5000,
      paymentVerified: body.paymentVerified !== undefined ? Boolean(body.paymentVerified) : true,
      pricingType: body.pricingType || 'FIXED_PRICE',
      budgetMin: body.budgetMin ? Number(body.budgetMin) : undefined,
      budgetMax: body.budgetMax ? Number(body.budgetMax) : undefined,
      hourlyRateMin: body.hourlyRateMin ? Number(body.hourlyRateMin) : undefined,
      hourlyRateMax: body.hourlyRateMax ? Number(body.hourlyRateMax) : undefined,
      currency: body.currency || 'USD',
      workMode: body.workMode || 'REMOTE',
      scope: body.scope || 'MEDIUM',
      estimatedDuration: body.estimatedDuration || '2-4 weeks',
      description: body.description || '',
      skills: Array.isArray(body.skills) ? body.skills : [],
      source: 'MANUAL' as const,
      sourceUrl: body.sourceUrl || `https://manual.intake/${Date.now()}`,
      status: 'DISCOVERED',
      postedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const saved = addGig(newGig);
    return NextResponse.json(saved, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create gig' }, { status: 400 });
  }
}
