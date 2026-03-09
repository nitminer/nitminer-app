import { NextRequest, NextResponse } from 'next/server';
import { searchRAGWithPerplexity, getAvailableTopics } from '@/lib/rag';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * OPTIONS /api/rag/query
 * Handle CORS preflight requests
 */
export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * POST /api/rag/query
 * 
 * Retrieves answers from knowledge base using Perplexity API for accuracy
 * 
 * Request body:
 * {
 *   "query": "What is TrustInn?"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "query": "What is TrustInn?",
 *   "answer": "Based on knowledge base...",
 *   "sources": ["file1.docx", "file2.docx"],
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    // Validate input
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      console.warn('[RAG Query] Invalid query parameter:', { query });
      return NextResponse.json(
        {
          success: false,
          error: 'Query parameter is required and must be a non-empty string',
        },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('[RAG Query] Processing query:', query.substring(0, 100));

    // Perform RAG search with Perplexity API
    const result = await searchRAGWithPerplexity(query.trim());

    console.log('[RAG Query] Result:', {
      success: result.success,
      answerLength: result.answer?.length || 0,
      sourcesCount: result.sources?.length || 0,
    });

    return NextResponse.json(
      {
        success: result.success,
        query: query.trim(),
        answer: result.answer,
        sources: result.sources,
        timestamp: new Date().toISOString(),
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[RAG Query Error]:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: `Failed to process query: ${errorMessage}`,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * GET /api/rag/query
 * 
 * Returns available topics in the knowledge base
 * 
 * Response:
 * {
 *   "success": true,
 *   "topics": ["CC Dynamic Symbolic Execution With Pruning.docx", ...]
 * }
 */
export async function GET(req: NextRequest) {
  try {
    const topics = getAvailableTopics();
    
    console.log(`[RAG Topics] Found ${topics.length} topics in knowledge base`);

    return NextResponse.json(
      {
        success: true,
        topics,
        count: topics.length,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[RAG Topics Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve topics.',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
