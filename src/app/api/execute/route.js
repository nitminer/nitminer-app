import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

export const maxDuration = 600;

function safePreview(value) {
  return String(value || '').slice(0, 200);
}

function getToolDirFromCommand(command, type, toolName) {
  if (type === 'java') return 'JAVA';
  if (type === 'python') return 'python';
  if (type === 'solidity') return 'Solc';

  if (command.includes('cbmc_script')) return 'CBMC';
  if (command.includes('kleema')) return 'KLEEMA';
  if (command.includes('klee')) return 'KLEE';
  if (command.includes('tracerx')) return 'TX';
  if (command.includes('main-gProfiler')) {
    return String(toolName || '').includes('Coverage') ? 'gMCov' : 'gMutant';
  }
  return null;
}

async function listRecentFiles(dir, filenameHint) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const now = Date.now();
    const files = [];

    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (filenameHint && !entry.name.includes(filenameHint)) continue;
      const p = path.join(dir, entry.name);
      const st = await fs.stat(p);
      if (now - st.mtimeMs > 1000 * 60 * 30) continue;
      files.push({
        name: entry.name,
        displayName: entry.name,
        size: st.size,
        downloadUrl: `#`,
      });
    }

    return files.slice(0, 25);
  } catch {
    return [];
  }
}

export async function POST(request) {
  let uploadedPath = '';
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const command = formData.get('command');
    const type = formData.get('type');
    const tool = formData.get('tool');

    if (!(file instanceof File) || !command || !type) {
      return NextResponse.json({ error: 'File, type, and command are required' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const storedName = `${Date.now()}-${file.name}`;
    uploadedPath = path.join(uploadsDir, storedName);
    await fs.writeFile(uploadedPath, Buffer.from(await file.arrayBuffer()));

    const toolDir = getToolDirFromCommand(String(command), String(type), tool);
    const projectRoot = path.join(process.cwd(), '..');
    let workingDir = process.cwd();
    let commandToRun = String(command).replace('[FILE]', uploadedPath);
    let resultHint = file.name.replace(/\.[^/.]+$/, '');

    if (toolDir) {
      const targetDir = path.join(projectRoot, toolDir);
      await fs.mkdir(targetDir, { recursive: true });

      const targetFilePath = path.join(targetDir, file.name);
      await fs.copyFile(uploadedPath, targetFilePath);

      workingDir = targetDir;

      // gMCov/gMutant expect file base name without extension in command.
      if ((toolDir === 'gMCov' || toolDir === 'gMutant') && file.name.endsWith('.c')) {
        commandToRun = String(command).replace('[FILE]', file.name.replace(/\.c$/i, ''));
      } else {
        commandToRun = String(command).replace('[FILE]', file.name);
      }
    }

    const { stdout, stderr } = await execAsync(commandToRun, {
      cwd: workingDir,
      timeout: 1000 * 60 * 10,
      maxBuffer: 1024 * 1024 * 20,
      shell: '/bin/bash',
    });

    const output = [stdout, stderr].filter(Boolean).join('\n').trim();
    const files = await listRecentFiles(workingDir, resultHint);

    return NextResponse.json({
      success: true,
      output: output || 'Execution completed.',
      files,
      meta: {
        type,
        toolDir,
        workingDir: safePreview(workingDir),
        command: safePreview(commandToRun),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Execution failed' },
      { status: 500 }
    );
  } finally {
    if (uploadedPath && existsSync(uploadedPath)) {
      try {
        await fs.unlink(uploadedPath);
      } catch {}
    }
  }
}
