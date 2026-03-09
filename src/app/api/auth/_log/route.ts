import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

/**
 * POST /api/auth/_log
 * Logs application events and debug information for NitMiner backend
 * 
 * This endpoint is used by both NitMiner and TrustInn applications
 * Logs are stored centrally for monitoring and debugging
 * 
 * Request body:
 * {
 *   "level": "info|warn|error|debug",
 *   "message": "log message",
 *   "userId": "optional_user_id",
 *   "source": "nitminer|trustinn|other",
 *   "context": { optional context data }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { level = 'info', message, userId, source = 'nitminer', context = {} } = body;

    // Validate required fields
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Sanitize log level
    const validLevels = ['debug', 'info', 'warn', 'error'];
    const logLevel = validLevels.includes(level) ? level : 'info';

    // Create log entry
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: logLevel,
      message,
      source,
      ...(userId && { userId }),
      ...(Object.keys(context).length > 0 && { context })
    };

    // Log to console (visible in server logs)
    console.log(`[${source.toUpperCase()}][${logLevel.toUpperCase()}] ${message}`, {
      timestamp,
      userId,
      context
    });

    // Log to file for persistence
    if (process.env.NODE_ENV === 'development' || logLevel === 'error' || logLevel === 'warn') {
      try {
        const logsDir = path.join(process.cwd(), 'logs');
        
        // Create logs directory if it doesn't exist
        try {
          await fs.mkdir(logsDir, { recursive: true });
        } catch (e) {
          // Directory might already exist or already created
        }

        // Use date-based log files
        const dateStr = new Date().toISOString().split('T')[0];
        const logFilePath = path.join(logsDir, `nitminer-${source}-${dateStr}.log`);
        
        // Append log entry to file
        await fs.appendFile(
          logFilePath,
          JSON.stringify(logEntry) + '\n',
          { flag: 'a' }
        );
      } catch (fileError) {
        console.error('[/api/auth/_log] Failed to write log file:', fileError);
        // Don't fail the request if file logging fails
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Log entry recorded',
        timestamp
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[POST /api/auth/_log] Error:', error);
    
    // Still return success to avoid client errors
    return NextResponse.json(
      {
        success: true,
        message: 'Log entry recorded'
      },
      { status: 200 }
    );
  }
}

/**
 * GET /api/auth/_log
 * Returns recent log entries (debugging only, development mode)
 */
export async function GET(request: NextRequest) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Not available in production' },
        { status: 403 }
      );
    }

    const source = request.nextUrl.searchParams.get('source') || 'nitminer';
    const logsDir = path.join(process.cwd(), 'logs');
    
    try {
      const files = await fs.readdir(logsDir);
      const logFiles = files.filter(f => f.includes(source) && f.endsWith('.log'));
      
      if (logFiles.length === 0) {
        return NextResponse.json(
          { logs: [], message: 'No log files found', source },
          { status: 200 }
        );
      }

      // Get the most recent log file
      const latestLogFile = logFiles.sort().reverse()[0];
      const logPath = path.join(logsDir, latestLogFile);
      const content = await fs.readFile(logPath, 'utf-8');
      
      const logs = content
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return { raw: line };
          }
        });

      return NextResponse.json(
        {
          file: latestLogFile,
          source,
          logs: logs.slice(-100), // Return last 100 entries
          total: logs.length
        },
        { status: 200 }
      );
    } catch (readError) {
      console.error('[GET /api/auth/_log] Error reading logs:', readError);
      return NextResponse.json(
        { logs: [], error: 'Failed to read logs', source },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[GET /api/auth/_log] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
