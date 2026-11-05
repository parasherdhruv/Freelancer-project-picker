import { NextResponse } from 'next/server';
import { getProposals } from '@/lib/freelancer-data';

export async function GET() {
  return NextResponse.json(getProposals());
}
