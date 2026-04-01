import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

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

function getScriptNameFromCommand(command) {
  const firstPart = String(command || '').trim().split(/\s+/)[0] || '';
  if (firstPart.startsWith('./')) return firstPart.slice(2);
  if (firstPart.endsWith('.sh')) return path.basename(firstPart);
  return null;
}

async function resolveToolsRoot(toolDir, scriptName) {
  const candidates = [
    process.env.TRUSTINN_TOOLS_ROOT,
    '/root/trustinn',
    '/root/Desktop/trustinn-website',
    path.join(process.cwd(), '..', 'trustinn'),
  ].filter(Boolean);

  for (const base of candidates) {
    const targetDir = path.join(base, toolDir);
    if (!existsSync(targetDir)) continue;
    if (!scriptName) return base;
    const scriptPath = path.join(targetDir, scriptName);
    if (existsSync(scriptPath)) return base;
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

function runCommand(command, options) {
  return new Promise((resolve) => {
    exec(command, options, (error, stdout, stderr) => {
      resolve({
        error,
        stdout: stdout || '',
        stderr: stderr || '',
        exitCode: error && typeof error.code === 'number' ? error.code : 0,
      });
    });
  });
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
    const scriptName = getScriptNameFromCommand(String(command));
    let workingDir = process.cwd();
    let commandToRun = String(command).replace('[FILE]', uploadedPath);
    let resultHint = file.name.replace(/\.[^/.]+$/, '');

    if (toolDir) {
      const toolsRoot = await resolveToolsRoot(toolDir, scriptName);
      if (!toolsRoot) {
        return NextResponse.json(
          {
            success: false,
            error: `Tool environment not found for ${toolDir}. Missing script ${scriptName || '(unknown)'} in configured tools root.`,
          },
          { status: 500 }
        );
      }

      const targetDir = path.join(toolsRoot, toolDir);
      if (!existsSync(targetDir)) {
        return NextResponse.json(
          { success: false, error: `Tool directory not found: ${targetDir}` },
          { status: 500 }
        );
      }

      const targetFilePath = path.join(targetDir, file.name);
      await fs.copyFile(uploadedPath, targetFilePath);

      // gMCov/gMutant scripts expect files inside Programs/GCOV and Programs/CBMC.
      if ((toolDir === 'gMCov' || toolDir === 'gMutant') && file.name.endsWith('.c')) {
        const gcovPrograms = path.join(targetDir, 'Programs', 'GCOV');
        const cbmcPrograms = path.join(targetDir, 'Programs', 'CBMC');
        await fs.mkdir(gcovPrograms, { recursive: true });
        await fs.mkdir(cbmcPrograms, { recursive: true });
        await fs.copyFile(uploadedPath, path.join(gcovPrograms, file.name));
        await fs.copyFile(uploadedPath, path.join(cbmcPrograms, file.name));
      }

      workingDir = targetDir;

      // gMCov/gMutant expect file base name without extension in command.
      if ((toolDir === 'gMCov' || toolDir === 'gMutant') && file.name.endsWith('.c')) {
        commandToRun = String(command).replace('[FILE]', file.name.replace(/\.c$/i, ''));
      } else {
        commandToRun = String(command).replace('[FILE]', file.name);
      }

      // Execute scripts through bash so missing +x permission does not break execution.
      if (scriptName && commandToRun.trim().startsWith('./')) {
        commandToRun = `bash ${commandToRun}`;
      }
    }

    const execResult = await runCommand(commandToRun, {
      cwd: workingDir,
      timeout: 1000 * 60 * 10,
      maxBuffer: 1024 * 1024 * 20,
      shell: '/bin/bash',
    });

    const output = [execResult.stdout, execResult.stderr].filter(Boolean).join('\n').trim();
    const hasHardFailure =
      execResult.exitCode !== 0 &&
      /command not found|no such file or directory|permission denied/i.test(output);
    const files = await listRecentFiles(workingDir, resultHint);

    if (hasHardFailure) {
      return NextResponse.json(
        {
          success: false,
          error: output || `Command failed with exit code ${execResult.exitCode}`,
          meta: {
            type,
            toolDir,
            workingDir: safePreview(workingDir),
            command: safePreview(commandToRun),
            exitCode: execResult.exitCode,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      output:
        output ||
        (execResult.exitCode === 0
          ? 'Execution completed.'
          : `Execution finished with exit code ${execResult.exitCode}.`),
      files,
      meta: {
        type,
        toolDir,
        workingDir: safePreview(workingDir),
        command: safePreview(commandToRun),
        exitCode: execResult.exitCode,
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
