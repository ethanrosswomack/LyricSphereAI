import { db } from './db';
import { documents, messages, Document, Message, InsertDocument, InsertMessage } from '@shared/schema';
import { eq, sql, desc, cosineDistance } from 'drizzle-orm';

export interface IStorage {
  // Document operations
  createDocument(data: InsertDocument): Promise<Document>;
  getAllDocuments(): Promise<Document[]>;
  getDocumentById(id: number): Promise<Document | null>;
  searchDocuments(query: string, embedding?: number[], limit?: number): Promise<Document[]>;
  
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

  async searchDocuments(query: string, embedding?: number[], limit = 6): Promise<Document[]> {
    // If we have an embedding, do vector similarity search
    if (embedding && embedding.length > 0) {
      return await db
        .select()
        .from(documents)
        .orderBy(cosineDistance(documents.embedding, embedding))
        .limit(limit);
    }
    
    // Otherwise do text search
    return await db
      .select()
      .from(documents)
      .where(sql`to_tsvector('english', ${documents.content}) @@ plainto_tsquery('english', ${query})`)
      .limit(limit);
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

  async searchDocuments(query: string, embedding?: number[], limit = 6): Promise<Document[]> {
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

// Use memory storage by default, switch to database when configured
export const storage: IStorage = process.env.USE_DATABASE === 'true' 
  ? new DatabaseStorage() 
  : new MemoryStorage();