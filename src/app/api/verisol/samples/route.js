import { readFile } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const body = await request.json();
    const { fileName } = body;

    if (!fileName) {
      return new Response(JSON.stringify({ error: 'No fileName provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Only allow specific sample files for security
    const allowedSamples = ['Sample.txt', 'EContract.txt'];
    if (!allowedSamples.includes(fileName)) {
      return new Response(JSON.stringify({ error: 'Invalid sample file' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const solcProjPath = '/root/SOLC_PROJ';
    const filePath = path.join(solcProjPath, fileName);

    try {
      const content = await readFile(filePath);

      return new Response(content, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="${fileName}"`
        }
      });
    } catch (fileError) {
      return new Response(JSON.stringify({ 
        error: 'Failed to read file',
        details: fileError.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Sample load error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to load sample',
      details: error.toString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
