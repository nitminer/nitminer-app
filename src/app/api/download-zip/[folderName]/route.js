import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import JSZip from 'jszip';

const TOOL_DIR_MAP = {
  CBMC: 'CBMC',
  KLEE: 'KLEE',
  TX: 'TX',
  KLEEMA: 'KLEEMA',
  gMCov: 'gMCov',
  gMutant: 'gMutant',
  Solc: 'Solc',
  JAVA: 'JAVA',
  python: 'python',
};

async function collectFilesRecursive(dir, out = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', '__pycache__'].includes(entry.name)) continue;
      await collectFilesRecursive(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

export async function GET(request, { params }) {
  try {
    const { folderName } = await params;
    const { searchParams } = new URL(request.url);
    const inputFileName = searchParams.get('fileName') || '';
    const baseName = inputFileName.replace(/\.[^/.]+$/, '');

    const root = path.join(process.cwd(), '..');
    const mapped = TOOL_DIR_MAP[folderName] || folderName;
    const folderPath = path.join(root, mapped);

    if (!existsSync(folderPath)) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    const allFiles = await collectFilesRecursive(folderPath);

    const filtered = allFiles.filter((absPath) => {
      if (!baseName) return true;
      const file = path.basename(absPath);
      const parent = path.basename(path.dirname(absPath));
      return file.startsWith(baseName) || parent.startsWith(baseName);
    });

    if (filtered.length === 0) {
      return NextResponse.json({ error: 'No output files found for the requested input' }, { status: 404 });
    }

    const zip = new JSZip();
    for (const absPath of filtered) {
      const relPath = path.relative(folderPath, absPath);
      const data = await fs.readFile(absPath);
      zip.file(relPath, data);
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    const outName = `${baseName || folderName}.zip`;

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${outName}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create zip' },
      { status: 500 }
    );
  }
}
