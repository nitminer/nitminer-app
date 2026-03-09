import * as fs from 'fs';
import * as path from 'path';

// Types
interface RAGDocument {
  [key: string]: string;
}

interface SearchResult {
  source: string;
  content: string;
  snippet: string;
  relevance: number;
}

interface PerplexityResponse {
  citations: string[];
  content: string;
}

// Load RAG documents
let cachedDocuments: RAGDocument | null = null;

function loadDocuments(): RAGDocument {
  if (cachedDocuments) {
    console.log(`[RAG] Using cached documents (${Object.keys(cachedDocuments).length} documents)`);
    return cachedDocuments;
  }
  
  try {
    const dataPath = path.join(process.cwd(), 'public/data/extracted_data.json');
    console.log(`[RAG] Loading documents from: ${dataPath}`);
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    cachedDocuments = JSON.parse(rawData);
    console.log(`[RAG] Successfully loaded ${Object.keys(cachedDocuments).length} documents`);
    return cachedDocuments;
  } catch (error) {
    console.error('[RAG] Error loading documents:', error);
    console.error('[RAG] Returning empty document set - search will not work');
    return {};
  }
}

// Calculate relevance score based on keyword matching
function calculateRelevance(query: string, text: string): number {
  const queryLower = query.toLowerCase().trim();
  const textLower = text.toLowerCase();
  
  // For very short queries (like "jbmc" or "hy"), do exact substring matching
  if (queryLower.length <= 5) {
    // Check if the query appears as-is in the text or documents
    if (textLower.includes(queryLower)) {
      return 1.0; // Perfect match
    }
    // Check in file names / context
    if (textLower.match(new RegExp(`\\b${queryLower}\\b`, 'i'))) {
      return 0.8; // Word match
    }
  }
  
  // For longer queries, use word-based matching
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
  if (queryWords.length === 0) {
    // If no words > 2 chars, try all words
    const allWords = queryLower.split(/\s+/).filter(w => w.length > 0);
    if (allWords.length === 0) return 0;
    
    let matches = 0;
    for (const word of allWords) {
      if (textLower.includes(word)) matches++;
    }
    return Math.min(matches / allWords.length, 1.0);
  }
  
  let matches = 0;
  for (const word of queryWords) {
    if (textLower.includes(word)) {
      matches++;
    }
  }
  
  const relevance = queryWords.length > 0 ? matches / queryWords.length : 0;
  return Math.min(relevance, 1.0); // Clamp between 0 and 1
}

// Find most relevant documents
function findRelevantDocuments(query: string, minRelevance: number = 0.3): SearchResult[] {
  const documents = loadDocuments();
  const results: SearchResult[] = [];
  
  // For very short queries, be more lenient
  const isShortQuery = query.trim().length <= 5;
  const adjustedMinRelevance = isShortQuery ? 0.1 : minRelevance;
  
  for (const [source, content] of Object.entries(documents)) {
    const relevance = calculateRelevance(query, content);
    
    if (relevance >= adjustedMinRelevance) {
      let snippet = content;
      if (snippet.length > 500) {
        snippet = snippet.substring(0, 500) + '...';
      }
      
      results.push({
        source,
        content,
        snippet,
        relevance
      });
    }
  }
  
  // Sort by relevance
  results.sort((a, b) => b.relevance - a.relevance);
  return results;
}

// Query Perplexity API for enhanced accuracy
export async function searchRAGWithPerplexity(query: string): Promise<{
  answer: string;
  sources: string[];
  success: boolean;
}> {
  try {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    
    // First, find relevant documents
    const relevantDocs = findRelevantDocuments(query, 0.2);
    
    console.log(`[RAG] Found ${relevantDocs.length} relevant documents for query: "${query.substring(0, 50)}..."`);
    
    // If no relevant documents found, return early
    if (relevantDocs.length === 0) {
      console.log('[RAG] No relevant documents found');
      return {
        answer: `I couldn't find specific information about "${query}" in the knowledge base. Please try a different question or connect with our support team.`,
        sources: [],
        success: false
      };
    }
    
    if (!apiKey) {
      console.warn('[RAG] PERPLEXITY_API_KEY not found, using fallback local search');
      return buildLocalResponse(relevantDocs, query);
    }

    // Build context from only the most relevant documents (top 3)
    const topDocs = relevantDocs.slice(0, 3);
    let knowledgeContext = '';
    
    for (const doc of topDocs) {
      knowledgeContext += `\n--- Source: ${doc.source} ---\n${doc.snippet}\n`;
    }
    
    const systemPrompt = `You are a helpful assistant for TrustInn - a software verification and testing tool.
You have access to the following knowledge base about TrustInn:

${knowledgeContext}

When answering questions:
1. Answer ONLY if the question is about TrustInn and the knowledge base
2. Be concise and specific - keep answers to 2-3 sentences maximum
3. If asking about something not in the knowledge base, clearly state "Not found in knowledge base"
4. Always cite the source document
5. Do NOT repeat or list all the information unnecessarily`;

    try {
      const response = await fetch('https://api.perplexity.ai/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'pplx-70b-online',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: `Question: ${query}`
            }
          ],
          temperature: 0.3,
          top_p: 0.9,
          max_tokens: 300,
        })
      });

      if (!response.ok) {
        console.error('[RAG] Perplexity API error:', response.status, await response.text());
        return buildLocalResponse(relevantDocs, query);
      }

      const data = await response.json();
      let answer = data.choices[0]?.message?.content || '';
      
      // Check if answer is "not found"
      if (answer.toLowerCase().includes('not found') || answer.toLowerCase().includes('not in') || answer.length < 20) {
        console.log('[RAG] API returned empty/not found response');
        return {
          answer: `I couldn't find specific information about "${query}" in the knowledge base. Please try a different question or connect with our support team.`,
          sources: [],
          success: false
        };
      }
      
      // Extract sources
      const sources = topDocs.map(doc => doc.source);

      console.log('[RAG] Successfully got response from Perplexity API');
      return {
        answer,
        sources,
        success: true
      };
    } catch (perplexityError) {
      console.error('[RAG] Error calling Perplexity API:', perplexityError);
      return buildLocalResponse(relevantDocs, query);
    }
  } catch (error) {
    console.error('[RAG] Unexpected error in searchRAGWithPerplexity:', error);
    const relevantDocs = findRelevantDocuments(query, 0.2);
    return buildLocalResponse(relevantDocs, query);
  }
}

// Build response from local documents
function buildLocalResponse(docs: SearchResult[], query: string): {
  answer: string;
  sources: string[];
  success: boolean;
} {
  if (docs.length === 0) {
    return {
      answer: `I couldn't find specific information about "${query}" in the knowledge base. Please try a different question or connect with our support team.`,
      sources: [],
      success: false
    };
  }

  const topDoc = docs[0];
  return {
    answer: topDoc.snippet,
    sources: [topDoc.source],
    success: true
  };
}

// Get all available topics
export function getAvailableTopics(): string[] {
  const documents = loadDocuments();
  return Object.keys(documents);
}
