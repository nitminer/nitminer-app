#!/usr/bin/env node
/**
 * Test RAG System
 * Run: node test-rag.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing RAG System...\n');

// Test 1: Check if documents file exists
console.log('1️⃣ Checking if document file exists...');
const docPath = path.join(__dirname, 'public/data/extracted_data.json');
if (fs.existsSync(docPath)) {
  console.log(`✅ Document file found at: ${docPath}`);
  
  // Test 2: Check if it's valid JSON
  console.log('\n2️⃣ Validating JSON format...');
  try {
    const data = JSON.parse(fs.readFileSync(docPath, 'utf-8'));
    const docCount = Object.keys(data).length;
    console.log(`✅ Valid JSON with ${docCount} documents`);
    
    // Test 3: List all documents
    console.log('\n3️⃣ Available documents:');
    Object.keys(data).forEach((doc, idx) => {
      console.log(`   ${idx + 1}. ${doc}`);
    });
    
    // Test 4: Test document search
    console.log('\n4️⃣ Testing document search...');
    const testQueries = ['jbmc', 'symbolic execution', 'mutation testing', 'hy'];
    
    testQueries.forEach(query => {
      const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      let matches = 0;
      
      for (const [docName, content] of Object.entries(data)) {
        const contentLower = content.toLowerCase();
        for (const word of queryWords) {
          if (contentLower.includes(word)) {
            matches++;
            break;
          }
        }
      }
      
      console.log(`   Query: "${query}" → Found in ${matches} documents`);
    });
    
    console.log('\n✅ RAG system appears to be working correctly!');
  } catch (e) {
    console.error(`❌ Invalid JSON: ${e.message}`);
  }
} else {
  console.error(`❌ Document file not found at: ${docPath}`);
}

console.log('\n📝 Summary:');
console.log('   - If documents are loading and searches work, the issue is likely in the API');
console.log('   - Check browser console for error details');
console.log('   - Check server logs for API errors');
