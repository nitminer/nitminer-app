import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

/**
 * POST /api/downloads/verify
 * Verify that download links are accessible
 */
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Verify the URL is a valid release URL
    if (!url.startsWith('https://releases.nitminer.com/')) {
      return NextResponse.json(
        { error: 'Invalid release domain' },
        { status: 400 }
      );
    }

    // Check if file exists by making HEAD request
    return await new Promise<Response>((resolve) => {
      https.request(url, { method: 'HEAD' }, (res) => {
        const isValid = res.statusCode === 200 || res.statusCode === 302;
        
        resolve(
          NextResponse.json({
            available: isValid,
            statusCode: res.statusCode,
            url: url,
          })
        );
      }).on('error', (err) => {
        console.error('Error checking download:', err);
        resolve(
          NextResponse.json(
            {
              available: false,
              error: err.message,
              url: url,
            },
            { status: 503 }
          )
        );
      }).end();
    });
  } catch (error) {
    console.error('Download verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify downloads' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/downloads/verify
 * Get list of all available downloads
 */
export async function GET(request: NextRequest) {
  const releases = [
    {
      os: 'windows',
      version: '1.0.0',
      url: 'https://releases.nitminer.com/nitminer-1.0.0-win-x64.exe',
      type: 'exe',
      size: '125 MB',
    },
    {
      os: 'mac',
      version: '1.0.0',
      url: 'https://releases.nitminer.com/nitminer-1.0.0-mac-universal.dmg',
      type: 'dmg',
      size: '130 MB',
    },
  ];

  // Check each release
  const results = await Promise.all(
    releases.map(
      (release) =>
        new Promise((resolve) => {
          https.request(release.url, { method: 'HEAD' }, (res) => {
            resolve({
              ...release,
              available: res.statusCode === 200 || res.statusCode === 302,
              statusCode: res.statusCode,
            });
          }).on('error', () => {
            resolve({
              ...release,
              available: false,
              statusCode: 0,
            });
          }).end();
        })
    )
  );

  return NextResponse.json({
    releases: results,
    timestamp: new Date().toISOString(),
  });
}
