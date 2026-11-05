import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    mode: 'freelancer-autonomous-agent',
    timestamp: new Date().toISOString(),
  });
}
