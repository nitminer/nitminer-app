import { readdir, readFile } from 'fs/promises';
import path from 'path';
import archiver from 'archiver';

export async function POST(request) {
  try {
    const body = await request.json();
    const { fileName, mode } = body;

    if (!fileName || !mode) {
      return new Response(JSON.stringify({ error: 'Missing fileName or mode' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const solcProjPath = '/root/SOLC_PROJ';
    
    // Extract base filename without extension
    const baseFileName = fileName.replace(/\.[^/.]+$/, '');
    // Use lowercase mode to match what convert.sh creates
    const resultDirName = `${baseFileName}-${mode.toLowerCase()}`;
    const resultDir = path.join(solcProjPath, 'Result', resultDirName);

    try {
      // Create archive stream
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });

      // Collect the zip data
      const chunks = [];
      
      archive.on('data', (chunk) => {
        chunks.push(chunk);
      });

      archive.on('error', (err) => {
        console.error('Archive error:', err);
        throw err;
      });

      // Return a Promise that resolves to the buffer
      const zipPromise = new Promise((resolve, reject) => {
        archive.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve(buffer);
        });
        archive.on('error', reject);
      });

      // Try to add files from Result directory
      try {
        const files = await readdir(resultDir);
        
        // Create results folder in zip
        for (const file of files) {
          const filePath = path.join(resultDir, file);
          try {
            const content = await readFile(filePath);
            archive.append(content, { name: `results/${file}` });
          } catch (e) {
            console.error(`Failed to read file ${file}:`, e);
          }
        }
      } catch (dirError) {
        console.log(`Result directory not found or empty: ${resultDir}`);
      }

      // Add metadata file
      const metadata = {
        fileName: fileName,
        mode: mode.toUpperCase(),
        executionTime: new Date().toLocaleString(),
        generatedAt: new Date().toISOString()
      };
      archive.append(JSON.stringify(metadata, null, 2), { name: 'METADATA.json' });

      // Finalize and get buffer
      archive.finalize();
      const buffer = await zipPromise;

      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="verisol_results_${Date.now()}.zip"`,
          'Content-Length': buffer.length.toString()
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Failed to create zip',
        details: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Download error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Download failed',
      details: error.toString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
