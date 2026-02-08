import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * GET /api/downloads/windows
 * Download Windows installer
 */
export async function GET(request: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'dist', 'NitMiner Setup 0.1.0.exe');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Windows installer not found' },
        { status: 404 }
      );
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    const fileBuffer = fs.readFileSync(filePath);

    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="NitMiner Setup 0.1.0.exe"`,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error downloading Windows installer:', error);
    return NextResponse.json(
      { error: 'Failed to download installer' },
      { status: 500 }
    );
  }
}
