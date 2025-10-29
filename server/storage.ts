import { db } from './db';
import { documents, messages, Document, Message, InsertDocument, InsertMessage } from '@shared/schema';
import { eq, sql, desc, or, ilike } from 'drizzle-orm';

// Helper function to extract keywords from natural language queries
function extractKeywordsFromQuery(query: string): { keywords: string[], isNaturalLanguage: boolean } {
  const originalQuery = query;
  const queryLower = query.toLowerCase().trim();
  
  // Common question patterns to remove
  const questionPatterns = [
    // Questions about content - Non-greedy capture before "about"
    // Properly handle "what is/are X about" patterns
    /^what\s+is\s+(.*?)\s+about\??$/i,
    /^what\s+are\s+(.*?)\s+about\??$/i,
    /^what(?:'s|s)\s+(.*?)\s+(?:about|mean|meaning|means|say|says|saying)\??$/i,
    /^(?:tell\s+me\s+about|show\s+me|find\s+me|give\s+me|search\s+for|look\s+for|find)\s+(.*?)$/i,
    /^(?:explain|describe|show)\s+(.*?)$/i,
    
    // Questions requesting specific content
    /^(.*?)\s+(?:lyrics?|words?|text)\??$/i,
    /^(?:lyrics?|words?|text)\s+(?:of|for|to)\s+(.*?)$/i,
    /^(?:get|show|display|find)\s+(.*?)\s+(?:lyrics?|words?|text)\??$/i,
    
    // Direct title questions
    /^(?:do\s+you\s+have|can\s+you\s+show|can\s+i\s+see|show\s+me)\s+(.*?)$/i,
    
    // Questions about meaning
    /^(?:what\s+does|what\s+do)\s+(.*?)\s+(?:mean|means|meant)\??$/i,
    /^(?:meaning\s+of|meanings?\s+of)\s+(.*?)$/i,
  ];
  
  let extractedKeywords: string | null = null;
  let isNaturalLanguage = false;
  
  // Try each pattern to extract the core subject
  for (let i = 0; i < questionPatterns.length; i++) {
    const pattern = questionPatterns[i];
    const match = query.match(pattern);
    if (match) {
      // Get the captured group (usually the song/album title)
      // The matched groups start from index 1
      if (match[1] && match[1].trim()) {
        extractedKeywords = match[1].trim();
        isNaturalLanguage = true;
        console.log(`   Pattern #${i + 1} matched, extracted: "${extractedKeywords}"`);
        break;
      }
    }
  }
  
  // Handle quoted strings (highest priority)
  const quotedMatch = query.match(/["']([^"']+)["']/);
  if (quotedMatch) {
    extractedKeywords = quotedMatch[1];
    isNaturalLanguage = true;
  }
  
  // If no pattern matched, look for potential song titles (capitalized phrases)
  if (!extractedKeywords) {
    // Look for sequences of capitalized words
    const capitalizedMatch = query.match(/[A-Z][a-z]*(?:\s+[A-Z][a-z]*)*/g);
    if (capitalizedMatch && capitalizedMatch.length > 0) {
      // Take the longest capitalized sequence
      extractedKeywords = capitalizedMatch.reduce((a, b) => a.length > b.length ? a : b);
      isNaturalLanguage = true;
      console.log(`   Using capitalized word extraction: "${extractedKeywords}"`);
    }
  }
  
  // Clean up extracted keywords
  if (extractedKeywords) {
    // Remove common filler words at the start/end
    extractedKeywords = extractedKeywords
      .replace(/^(the|a|an)\s+/i, '')
      .replace(/\s+(song|track|album|music|tune)\s*$/i, '')
      .trim();
  }
  
  // If we extracted keywords, use them; otherwise fall back to original query
  const finalKeywords = extractedKeywords || originalQuery;
  
  // Log the extraction process
  console.log('=== Keyword Extraction ===');
  console.log('Original query:', originalQuery);
  console.log('Detected as natural language:', isNaturalLanguage);
  console.log('Extracted keywords:', finalKeywords);
  if (extractedKeywords) {
    if (extractedKeywords !== originalQuery) {
      console.log('Extraction method: Pattern/Capitalization matched');
      console.log('Raw extracted:', extractedKeywords);
    } else {
      console.log('Extraction method: No pattern matched, using original');
    }
  } else {
    console.log('Extraction method: Using original query (no extraction)');
  }
  console.log('========================');
  
  // Return both exact keywords and potentially useful variations
  const keywords = [finalKeywords];
  
  // Add variations for better matching
  if (isNaturalLanguage && extractedKeywords) {
    // Add individual words for broader matching if exact match fails
    const words = finalKeywords.split(/\s+/).filter(w => w.length > 2);
    if (words.length > 1) {
      keywords.push(...words);
    }
  }
  
  return { keywords, isNaturalLanguage };
}

export interface IStorage {
  // Document operations
  createDocument(data: InsertDocument): Promise<Document>;
  getAllDocuments(): Promise<Document[]>;
  getDocumentById(id: number): Promise<Document | null>;
  searchDocuments(query: string, limit?: number): Promise<Document[]>;
  clearDocuments(): Promise<void>;
  
  // Message operations
  createMessage(data: InsertMessage): Promise<Message>;
  getRecentMessages(limit?: number): Promise<Message[]>;
  clearMessages(): Promise<void>;
}

class DatabaseStorage implements IStorage {
  async createDocument(data: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(data).returning();
    return document;
  }

  async getAllDocuments(): Promise<Document[]> {
    return await db.select().from(documents).orderBy(desc(documents.createdAt));
  }

  async getDocumentById(id: number): Promise<Document | null> {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    return doc || null;
  }

  async searchDocuments(query: string, limit = 6): Promise<Document[]> {
    try {
      console.log('\n🔍 === Starting Document Search ===');
      console.log(`Input query: "${query}"`);
      
      // Get all documents from the database
      const allDocs = await db.select().from(documents);
      console.log(`📚 Total documents in database: ${allDocs.length}`);
      
      if (allDocs.length === 0) {
        console.log('⚠️  No documents found in database - need to seed data');
        return [];
      }
      
      // Extract keywords from the query
      const { keywords, isNaturalLanguage } = extractKeywordsFromQuery(query);
      console.log(`🎯 Search strategy: ${isNaturalLanguage ? 'Natural language processing' : 'Direct search'}`);
      console.log(`🔑 Keywords to search: ${JSON.stringify(keywords)}`);
      
      // Perform search with extracted keywords
      let results: Document[] = [];
      let searchMethod = '';
      
      // First, try exact match with the primary keyword
      const primaryKeyword = keywords[0].toLowerCase();
      results = allDocs.filter(doc => 
        doc.title.toLowerCase().includes(primaryKeyword) ||
        doc.content.toLowerCase().includes(primaryKeyword)
      );
      searchMethod = 'Primary keyword search';
      
      // If no results and we have fallback keywords, try broader search
      if (results.length === 0 && keywords.length > 1) {
        console.log('📝 No exact matches, trying broader search with individual words...');
        
        // Try matching any of the individual words
        const fallbackResults = allDocs.filter(doc => {
          const docTitle = doc.title.toLowerCase();
          const docContent = doc.content.toLowerCase();
          
          // Check if any keyword matches
          return keywords.slice(1).some(keyword => {
            const keywordLower = keyword.toLowerCase();
            return docTitle.includes(keywordLower) || docContent.includes(keywordLower);
          });
        });
        
        if (fallbackResults.length > 0) {
          results = fallbackResults;
          searchMethod = 'Fallback word-by-word search';
        }
      }
      
      // If still no results and it was natural language, try the original query as last resort
      if (results.length === 0 && isNaturalLanguage) {
        console.log('🔄 No keyword matches, falling back to original query...');
        const originalLower = query.toLowerCase();
        results = allDocs.filter(doc => 
          doc.title.toLowerCase().includes(originalLower) ||
          doc.content.toLowerCase().includes(originalLower)
        );
        searchMethod = 'Original query fallback';
      }
      
      // Log search results
      console.log(`\n📊 Search Results:`);
      console.log(`   Method used: ${searchMethod}`);
      console.log(`   Documents found: ${results.length}`);
      
      if (results.length > 0) {
        console.log(`   Matching titles:`);
        results.slice(0, 3).forEach((doc, i) => {
          console.log(`     ${i + 1}. "${doc.title}"`);
        });
        if (results.length > 3) {
          console.log(`     ... and ${results.length - 3} more`);
        }
      } else {
        console.log('   ❌ No documents matched the search criteria');
      }
      
      // Sort by createdAt (most recent first) and limit results
      const sorted = results.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      const finalResults = sorted.slice(0, limit);
      console.log(`🎁 Returning top ${finalResults.length} results (limit: ${limit})`);
      console.log('=================================\n');
      
      return finalResults;
    } catch (error) {
      console.error('❌ Search error:', error);
      return [];
    }
  }

  async createMessage(data: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(data).returning();
    return message;
  }

  async getRecentMessages(limit = 50): Promise<Message[]> {
    return await db.select().from(messages).orderBy(desc(messages.createdAt)).limit(limit);
  }

  async clearMessages(): Promise<void> {
    await db.delete(messages);
  }

  async clearDocuments(): Promise<void> {
    await db.delete(documents);
  }
}

class MemoryStorage implements IStorage {
  private documentsStore: Document[] = [];
  private messagesStore: Message[] = [];
  private documentIdCounter = 1;
  private messageIdCounter = 1;

  async createDocument(data: InsertDocument): Promise<Document> {
    const document: Document = {
      id: this.documentIdCounter++,
      ...data,
      createdAt: new Date()
    };
    this.documentsStore.push(document);
    return document;
  }

  async getAllDocuments(): Promise<Document[]> {
    return this.documentsStore.sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getDocumentById(id: number): Promise<Document | null> {
    return this.documentsStore.find(d => d.id === id) || null;
  }

  async searchDocuments(query: string, limit = 6): Promise<Document[]> {
    console.log('\n🔍 === Starting Document Search (Memory) ===');
    console.log(`Input query: "${query}"`);
    console.log(`📚 Total documents in memory: ${this.documentsStore.length}`);
    
    if (this.documentsStore.length === 0) {
      console.log('⚠️  No documents in memory store');
      return [];
    }
    
    // Extract keywords from the query
    const { keywords, isNaturalLanguage } = extractKeywordsFromQuery(query);
    console.log(`🎯 Search strategy: ${isNaturalLanguage ? 'Natural language processing' : 'Direct search'}`);
    console.log(`🔑 Keywords to search: ${JSON.stringify(keywords)}`);
    
    // Perform search with extracted keywords
    let results: Document[] = [];
    let searchMethod = '';
    
    // First, try exact match with the primary keyword
    const primaryKeyword = keywords[0].toLowerCase();
    results = this.documentsStore.filter(doc => 
      doc.title.toLowerCase().includes(primaryKeyword) ||
      doc.content.toLowerCase().includes(primaryKeyword)
    );
    searchMethod = 'Primary keyword search';
    
    // If no results and we have fallback keywords, try broader search
    if (results.length === 0 && keywords.length > 1) {
      console.log('📝 No exact matches, trying broader search with individual words...');
      
      // Try matching any of the individual words
      const fallbackResults = this.documentsStore.filter(doc => {
        const docTitle = doc.title.toLowerCase();
        const docContent = doc.content.toLowerCase();
        
        // Check if any keyword matches
        return keywords.slice(1).some(keyword => {
          const keywordLower = keyword.toLowerCase();
          return docTitle.includes(keywordLower) || docContent.includes(keywordLower);
        });
      });
      
      if (fallbackResults.length > 0) {
        results = fallbackResults;
        searchMethod = 'Fallback word-by-word search';
      }
    }
    
    // If still no results and it was natural language, try the original query as last resort
    if (results.length === 0 && isNaturalLanguage) {
      console.log('🔄 No keyword matches, falling back to original query...');
      const originalLower = query.toLowerCase();
      results = this.documentsStore.filter(doc => 
        doc.title.toLowerCase().includes(originalLower) ||
        doc.content.toLowerCase().includes(originalLower)
      );
      searchMethod = 'Original query fallback';
    }
    
    // Log search results
    console.log(`\n📊 Search Results:`);
    console.log(`   Method used: ${searchMethod}`);
    console.log(`   Documents found: ${results.length}`);
    
    if (results.length > 0) {
      console.log(`   Matching titles:`);
      results.slice(0, 3).forEach((doc, i) => {
        console.log(`     ${i + 1}. "${doc.title}"`);
      });
      if (results.length > 3) {
        console.log(`     ... and ${results.length - 3} more`);
      }
    } else {
      console.log('   ❌ No documents matched the search criteria');
    }
    
    // Sort by createdAt (most recent first) and limit results
    const sorted = results.sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
    
    const finalResults = sorted.slice(0, limit);
    console.log(`🎁 Returning top ${finalResults.length} results (limit: ${limit})`);
    console.log('=================================\n');
    
    return finalResults;
  }

  async createMessage(data: InsertMessage): Promise<Message> {
    const message: Message = {
      id: this.messageIdCounter++,
      ...data,
      createdAt: new Date()
    };
    this.messagesStore.push(message);
    return message;
  }

  async getRecentMessages(limit = 50): Promise<Message[]> {
    return this.messagesStore
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async clearMessages(): Promise<void> {
    this.messagesStore = [];
  }

  async clearDocuments(): Promise<void> {
    this.documentsStore = [];
  }
}

// Use database storage by default
export const storage: IStorage = new DatabaseStorage();