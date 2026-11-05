import { NextResponse } from 'next/server';
import { getProfile, saveProfile } from '@/lib/freelancer-data';

export async function GET() {
  return NextResponse.json(getProfile());
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const updated = saveProfile(body);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Invalid profile data' }, { status: 400 });
  }
}
