import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return NextResponse.json({ isLive: false, error: 'Invalid URL provided' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: controller.signal,
        redirect: 'follow',
      });
      clearTimeout(timeout);

      const isLive = res.status >= 200 && res.status < 400;
      return NextResponse.json({
        url,
        finalUrl: res.url,
        isLive,
        statusCode: res.status,
        message: isLive ? 'Vacancy is active and reachable' : `Server responded with status ${res.status}`,
        checkedAt: new Date().toISOString(),
      });
    } catch (fetchErr: any) {
      clearTimeout(timeout);
      return NextResponse.json({
        url,
        isLive: false,
        statusCode: 0,
        message: fetchErr?.name === 'AbortError' ? 'URL check timed out' : 'Unable to connect to host',
        checkedAt: new Date().toISOString(),
      });
    }
  } catch {
    return NextResponse.json({ isLive: false, error: 'Failed to verify URL' }, { status: 500 });
  }
}
