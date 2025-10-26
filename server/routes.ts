import { type Request, Response, Router } from 'express';
import { storage } from './storage';
import { insertDocumentSchema, insertMessageSchema } from '@shared/schema';
import { z } from 'zod';

export function registerRoutes(app: Router) {
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Chat endpoint
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query is required' });
      }

      // Search for relevant documents
      const documents = await storage.searchDocuments(query, undefined, 6);
      
      // Build context from documents
      const context = documents
        .map((doc, idx) => `[${idx + 1}] ${doc.title}\n${doc.content.substring(0, 500)}`)
        .join('\n\n');
      
      // Generate response (simulated - in production, this would call an AI model)
      let answer = '';
      if (documents.length === 0) {
        answer = "I couldn't find any relevant information about that topic in my knowledge base. Try asking about specific songs, albums, or themes.";
      } else {
        // Simulate an intelligent response based on the context
        answer = generateResponse(query, documents);
      }

      // Format citations
      const citations = documents.map((doc, idx) => ({
        id: doc.id,
        title: doc.title,
        score: 0.85 - (idx * 0.05) // Simulated relevance scores
      }));

      // Save the conversation to history
      await storage.createMessage({
        role: 'user',
        content: query,
        citations: null
      });

      await storage.createMessage({
        role: 'assistant',
        content: answer,
        citations: citations.length > 0 ? citations : null
      });

      res.json({
        answer,
        citations
      });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ 
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get chat history
  app.get('/api/chat/history', async (req: Request, res: Response) => {
    try {
      const messages = await storage.getRecentMessages(50);
      res.json({ messages: messages.reverse() });
    } catch (error) {
      console.error('History error:', error);
      res.status(500).json({ error: 'Failed to fetch chat history' });
    }
  });

  // Clear chat history
  app.delete('/api/chat/history', async (req: Request, res: Response) => {
    try {
      await storage.clearMessages();
      res.json({ success: true });
    } catch (error) {
      console.error('Clear history error:', error);
      res.status(500).json({ error: 'Failed to clear chat history' });
    }
  });

  // Document management
  app.get('/api/documents', async (req: Request, res: Response) => {
    try {
      const docs = await storage.getAllDocuments();
      res.json({ documents: docs });
    } catch (error) {
      console.error('Documents error:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  });

  app.post('/api/documents', async (req: Request, res: Response) => {
    try {
      const data = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(data);
      res.json({ document });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid document data', details: error.errors });
      }
      console.error('Create document error:', error);
      res.status(500).json({ error: 'Failed to create document' });
    }
  });

  app.get('/api/documents/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid document ID' });
      }
      const document = await storage.getDocumentById(id);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }
      res.json({ document });
    } catch (error) {
      console.error('Get document error:', error);
      res.status(500).json({ error: 'Failed to fetch document' });
    }
  });
}

// Helper function to generate intelligent responses
function generateResponse(query: string, documents: any[]): string {
  const queryLower = query.toLowerCase();
  const firstDoc = documents[0];
  
  // Simple pattern matching for common question types
  if (queryLower.includes('what') && queryLower.includes('about')) {
    return `Based on the lyrics and commentary I found, "${firstDoc.title}" ${
      documents.length > 1 ? `and ${documents.length - 1} other related tracks` : ''
    } explore themes of ${extractThemes(documents)}. The content suggests ${
      firstDoc.metadata?.album ? `this track from "${firstDoc.metadata.album}" ` : ''
    }deals with ${generateTopicSummary(firstDoc.content)}. [1]`;
  }
  
  if (queryLower.includes('meaning') || queryLower.includes('explain')) {
    return `The meaning behind these lyrics centers on ${generateTopicSummary(firstDoc.content)}. ${
      documents.length > 1 ? 
      `This theme is consistent across multiple tracks, particularly in [1] "${firstDoc.title}"${
        documents[1] ? ` and [2] "${documents[1].title}"` : ''
      }.` : 
      `"${firstDoc.title}" specifically addresses this through its lyrical content. [1]`
    }`;
  }
  
  if (queryLower.includes('theme') || queryLower.includes('topic')) {
    const themes = extractThemes(documents);
    return `The main themes I've identified across these tracks include ${themes}. ${
      documents.length > 1 ? 
      `These appear prominently in [1] "${firstDoc.title}" and related works.` :
      `"${firstDoc.title}" particularly emphasizes these concepts. [1]`
    }`;
  }
  
  // Default response
  return `I found ${documents.length} relevant ${documents.length === 1 ? 'track' : 'tracks'} related to your query. "${
    firstDoc.title
  }" [1] ${documents.length > 1 ? `along with ${documents.length - 1} other tracks ` : ''}contain${
    documents.length === 1 ? 's' : ''
  } content that addresses "${query}". ${
    firstDoc.content.substring(0, 200)
  }...`;
}

function extractThemes(documents: any[]): string {
  // Simulate theme extraction
  const themes = [
    'personal struggle',
    'societal observation', 
    'introspection',
    'resilience',
    'authenticity',
    'growth',
    'reflection'
  ];
  
  // Pick 2-3 random themes for simulation
  const selectedThemes = themes
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(3, documents.length))
    .join(', ');
  
  return selectedThemes;
}

function generateTopicSummary(content: string): string {
  // Extract a simple summary from the content
  const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 20);
  if (sentences.length > 0) {
    const summary = sentences[0].trim().toLowerCase();
    if (summary.length > 100) {
      return summary.substring(0, 100) + '...';
    }
    return summary;
  }
  return 'complex lyrical narratives and metaphorical expressions';
}