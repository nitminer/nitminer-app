import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

function isAllowedPath(targetPath) {
  const resolved = path.resolve(targetPath);
  const base = path.resolve(path.join(process.cwd(), '..'));

  const allowedRoots = [
    path.resolve(path.join(base, 'CBMC')),
    path.resolve(path.join(base, 'KLEE')),
    path.resolve(path.join(base, 'KLEEMA')),
    path.resolve(path.join(base, 'TX')),
    path.resolve(path.join(base, 'gMCov')),
    path.resolve(path.join(base, 'gMutant')),
    path.resolve(path.join(base, 'Solc')),
    path.resolve(path.join(base, 'JAVA')),
    path.resolve(path.join(base, 'python')),
    path.resolve(path.join(process.cwd(), 'uploads')),
    path.resolve(path.join(process.cwd(), 'results')),
  ];

  return allowedRoots.some((root) => resolved.startsWith(root));
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('filepath');

    if (!filePath) {
      return NextResponse.json({ error: 'filepath is required' }, { status: 400 });
    }

    if (!isAllowedPath(filePath)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const content = await fs.readFile(filePath, 'utf8');
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to read file' },
      { status: 500 }
    );
  }
}
