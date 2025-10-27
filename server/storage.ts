import { db } from './db';
import { documents, messages, Document, Message, InsertDocument, InsertMessage } from '@shared/schema';
import { eq, sql, desc, or, ilike } from 'drizzle-orm';

export interface IStorage {
  // Document operations
  createDocument(data: InsertDocument): Promise<Document>;
  getAllDocuments(): Promise<Document[]>;
  getDocumentById(id: number): Promise<Document | null>;
  searchDocuments(query: string, limit?: number): Promise<Document[]>;
  
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
      // Get all documents from the database
      const allDocs = await db.select().from(documents);
      console.log('Total documents in database:', allDocs.length);
      
      if (allDocs.length === 0) {
        console.log('No documents found in database - need to seed data');
        return [];
      }
      
      // Filter documents that match the query
      const queryLower = query.toLowerCase();
      const filtered = allDocs.filter(doc => 
        doc.title.toLowerCase().includes(queryLower) ||
        doc.content.toLowerCase().includes(queryLower)
      );
      
      console.log(`Found ${filtered.length} documents matching query: "${query}"`);
      
      // Sort by createdAt (most recent first) and limit results
      const sorted = filtered.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      return sorted.slice(0, limit);
    } catch (error) {
      console.error('Search error:', error);
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
    // Simple text search for memory storage
    const queryLower = query.toLowerCase();
    const results = this.documentsStore
      .filter(doc => 
        doc.title.toLowerCase().includes(queryLower) ||
        doc.content.toLowerCase().includes(queryLower)
      )
      .slice(0, limit);
    
    return results;
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
}

// Use database storage by default
export const storage: IStorage = new DatabaseStorage();