import { writeFile, unlink } from 'fs/promises';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execFileAsync = promisify(execFile);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const mode = formData.get('mode') || 'bmc';

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Write file to SOLC_PROJ directory
    const solcProjPath = '/root/SOLC_PROJ';
    const filePath = path.join(solcProjPath, file.name);
    
    const buffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(buffer));

    try {
      // Execute the convert.sh script from SOLC_PROJ directory
      // Pass only the filename, not the full path
      const { stdout, stderr } = await execFileAsync('bash', ['./convert.sh', file.name, mode.toLowerCase()], {
        cwd: solcProjPath,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 30000 // 30 second timeout
      });

      // Parse the output into lines
      const output = (stdout || '') + (stderr || '');
      const lines = output.split('\n').filter(line => line.trim());

      const formattedLines = lines.map(line => ({
        type: 'output',
        text: line
      }));

      return new Response(JSON.stringify({ 
        success: true, 
        output: formattedLines,
        rawOutput: output 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } finally {
      // Clean up uploaded file
      try {
        await unlink(filePath);
      } catch (e) {
        console.error('Failed to delete file:', e);
      }
    }
  } catch (error) {
    console.error('Conversion error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Conversion failed',
      details: error.toString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
