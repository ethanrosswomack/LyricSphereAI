import { pgTable, text, integer, json, timestamp, real } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Lyrics documents table
export const documents = pgTable('documents', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  metadata: json('metadata').$type<{
    track?: string;
    album?: string;
    url?: string;
    category?: string;
  }>(),
  createdAt: timestamp('created_at').defaultNow()
});

// Chat messages table for history
export const messages = pgTable('messages', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  role: text('role').notNull().$type<'user' | 'assistant'>(),
  content: text('content').notNull(),
  citations: json('citations').$type<Array<{
    id: number;
    title: string;
    score: number;
  }>>(),
  createdAt: timestamp('created_at').defaultNow()
});

// Schemas for validation
export const insertDocumentSchema = createInsertSchema(documents).omit({ 
  id: true, 
  createdAt: true 
});
export const insertMessageSchema = createInsertSchema(messages).omit({ 
  id: true, 
  createdAt: true 
});

// Types
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;