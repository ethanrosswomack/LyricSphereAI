# Hawk Eye autoRAG Chat System

## Overview

This project is a music-focused chatbot system that enables conversational exploration of Hawk Eye's lyrics, commentary, and music catalog. The system uses Retrieval-Augmented Generation (RAG) to provide accurate, context-aware responses about songs, meanings, and backstories.

The architecture is split into two main components:
1. **Cloudflare Worker Backend**: A serverless RAG system using Vectorize for semantic search, R2 for document storage, and Workers AI for embeddings and language generation
2. **React Frontend**: A modern chat interface that can be embedded in Astro sites or run standalone

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**:
- React with TypeScript for UI components
- Astro framework for static site integration
- Tailwind CSS with shadcn/ui component library for styling
- Vite for development and bundling

**Design Patterns**:
- Component-based architecture with reusable chat components (`ChatInterface`, `ChatMessage`, `ChatContainer`, `ChatInput`)
- Dark/light theme support with theme context provider
- Responsive design with mobile-first approach
- Client-side state management using React hooks

**Key Components**:
- `ChatInterface`: Main chat container that manages message state and API communication
- `ChatMessage`: Individual message rendering with citation support
- `SuggestedQuestions`: Quick-start prompts for users
- `WelcomeHero`: Branding and introduction section

**Integration Strategy**:
- Designed to work both as standalone application and embedded in Astro sites
- Uses `client:load` directive for Astro integration
- Configurable worker endpoint via props

### Backend Architecture (Cloudflare Worker)

**Technology Stack**:
- Cloudflare Workers for serverless compute
- Workers AI for embeddings (`@cf/baai/bge-base-en-v1.5`) and chat completion (`@cf/meta/llama-3-8b-instruct`)
- Vectorize for semantic vector search
- R2 for document storage

**RAG Pipeline**:
1. **Query Embedding**: User question is converted to 768-dimension vector using BGE model
2. **Semantic Search**: Vectorize index returns top-k most relevant document chunks
3. **Context Retrieval**: Full documents fetched from R2 using metadata keys
4. **Prompt Construction**: Retrieved context combined with user query
5. **Response Generation**: Llama 3 generates answer with inline citations
6. **Citation Formatting**: Returns answer with references to source documents

**API Design**:
- `GET /` - Serves standalone HTML chat interface
- `POST /chat` - Main RAG endpoint accepting JSON `{query: string}` and returning `{answer: string, citations: Array}`

**Data Flow**:
```
User Query → Embed → Vectorize Search → R2 Fetch → LLM Prompt → Response + Citations
```

**Document Metadata Schema**:
Each vectorized entry includes:
- `r2_key`: Object path in R2 bucket
- `title`: Display name for citations
- `track`: Song/track name
- `album`: Album name (optional)
- `url`: Public URL for citation links
- `category`: Content classification (optional)

### Database Schema

**Mock Database Implementation**:
The current implementation uses a mock database layer for development. The schema is defined using Drizzle ORM with the following tables:

**documents**:
- `id`: Auto-incrementing integer primary key
- `title`: Text (song/track title)
- `content`: Text (lyrics or commentary)
- `metadata`: JSON object containing track, album, url, category
- `embedding`: Vector (384 dimensions) - Note: Production uses 768 dimensions with BGE model
- `createdAt`: Timestamp

**messages**:
- `id`: Auto-incrementing integer primary key
- `role`: Text enum ('user' | 'assistant')
- `content`: Text (message content)
- `citations`: JSON array of citation objects
- `createdAt`: Timestamp

**Note on Database**: The codebase includes PostgreSQL schema definitions and configuration, but the actual backend uses Cloudflare's native storage (Vectorize + R2) rather than a traditional database. The Drizzle schema serves as a reference for the data model.

## External Dependencies

### Cloudflare Services

**Vectorize** (Vector Database):
- Purpose: Semantic search over embedded lyrics and commentary
- Configuration: 768-dimension vectors, cosine similarity metric
- Index name: `lyrics-index`
- Data: Song lyrics and commentary embedded using BGE model

**R2** (Object Storage):
- Purpose: Store full-text documents (markdown files)
- Bucket name: `omniversal-s3`
- Content: Lyrics, commentary, and metadata files
- Access pattern: Retrieved via keys stored in Vectorize metadata

**Workers AI**:
- Embedding model: `@cf/baai/bge-base-en-v1.5` (768-dimension vectors)
- Chat model: `@cf/meta/llama-3-8b-instruct`
- Purpose: Generate embeddings for search and produce conversational responses

**KV Namespace** (Optional):
- Purpose: Session storage for future multi-turn conversation support
- Name: `SESSIONS`
- Current status: Configured but not actively used

### Third-Party Packages

**UI/Component Libraries**:
- `@radix-ui/*`: Headless UI components (dialogs, dropdowns, tooltips, etc.)
- `lucide-react`: Icon library
- `class-variance-authority`: Component variant management
- `tailwind-merge` + `clsx`: CSS class composition utilities
- `cmdk`: Command palette component

**State Management**:
- `@tanstack/react-query`: Server state management and caching
- React hooks: Local state management

**Form Handling**:
- `react-hook-form`: Form state and validation
- `@hookform/resolvers` + `zod`: Schema validation
- `drizzle-zod`: Database schema to Zod converter

**Development Tools**:
- `wrangler`: Cloudflare Workers CLI
- `drizzle-kit`: Database migrations and schema management
- `tsx`: TypeScript execution for Node.js
- `vite`: Build tool and dev server
- `@vitejs/plugin-react`: React integration for Vite

### Deployment Configuration

**Wrangler (Cloudflare Workers)**:
- Configuration file: `wrangler.toml`
- Bindings required: Vectorize index, R2 bucket, Workers AI, optional KV namespace
- Environment variables: `ALLOWED_ORIGIN`, `MAX_CONTEXT_DOCS`, `EMBED_MODEL`, `MODEL`

**Frontend Deployment**:
- Build output: `dist/public`
- Can be deployed to any static host (Cloudflare Pages, Vercel, Netlify)
- Requires environment variable for worker endpoint URL

**Database** (Future/Optional):
- Provider: Neon (PostgreSQL)
- ORM: Drizzle
- Connection: Via `@neondatabase/serverless`
- Note: Currently using mock implementation