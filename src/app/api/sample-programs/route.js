import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const toolFolderMap = {
  CBMC: 'CBMC',
  KLEE: 'KLEE',
  KLEEMA: 'KLEEMA',
  TX: 'TX',
  gMCov: 'gMCov',
  gMutant: 'gMutant',
  JBMC: 'JAVA',
  VeriSol: 'SOLIDITY',
  'Condition Coverage Fuzzing': 'PYTHON',
};

const extensionMap = {
  CBMC: ['.c'],
  KLEE: ['.c'],
  KLEEMA: ['.c'],
  TX: ['.c'],
  gMCov: ['.c'],
  gMutant: ['.c'],
  JBMC: ['.java'],
  VeriSol: ['.sol'],
  'Condition Coverage Fuzzing': ['.py'],
};

async function findExistingPath(paths) {
  for (const p of paths) {
    try {
      await fs.access(p);
      return p;
    } catch {}
  }
  return null;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tool = searchParams.get('tool');
    const language = searchParams.get('language') || '';

    if (!tool) {
      return NextResponse.json({ error: 'Tool parameter is required' }, { status: 400 });
    }

    const folderName = toolFolderMap[tool];
    if (!folderName) {
      return NextResponse.json({ error: `Unknown tool: ${tool}` }, { status: 400 });
    }

    let possiblePaths = [];

    if (tool === 'gMCov' || tool === 'gMutant') {
      possiblePaths = [
        path.join('/root/Executable programs', folderName, 'Programs', 'CBMC'),
        path.join('/root/Executable programs', folderName),
      ];
    } else if (tool === 'CBMC' || tool === 'KLEE' || tool === 'KLEEMA' || tool === 'TX') {
      possiblePaths = [
        path.join('/root/Executable programs', folderName),
        path.join('/root/trustinn', folderName, 'Programs', 'CBMC'),
      ];
    } else {
      possiblePaths = [
        path.join('/root/Executable programs', folderName),
        path.join('/root/trustinn', folderName),
      ];
    }

    const samplePath = await findExistingPath(possiblePaths);
    if (!samplePath) {
      return NextResponse.json({
        samples: {},
        message: `Sample programs folder not found for ${tool}`,
        requestedTool: tool,
        language,
      });
    }

    const files = await fs.readdir(samplePath, { withFileTypes: true });
    const validExtensions = extensionMap[tool] || [];
    const samples = {};

    for (const file of files) {
      if (!file.isFile()) continue;
      const ext = path.extname(file.name).toLowerCase();
      if (!validExtensions.includes(ext)) continue;
      const filePath = path.join(samplePath, file.name);
      try {
        const content = await fs.readFile(filePath, 'utf8');
        samples[file.name] = content;
      } catch {}
    }

    return NextResponse.json({
      samples,
      filesCount: Object.keys(samples).length,
      sourcePath: samplePath,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
