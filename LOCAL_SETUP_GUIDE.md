# 🎵 Hawk Eye Chat - Local Setup Guide

This guide will help you run the Hawk Eye music chatbot on your local machine.

## 📋 Prerequisites

- **Node.js** 20.x or later
- **PostgreSQL** database (or use Neon serverless)
- **Cloudflare R2** account with access to your music files

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
PGHOST=[your-neon-host]
PGDATABASE=[your-database]
PGUSER=[your-user]
PGPASSWORD=[your-password]
PGPORT=5432

# Cloudflare R2 Credentials
CLOUDFLARE_ACCESS_ID=[your-r2-access-key-id]
CLOUDFLARE_SECRET_ACCESS_KEY=[your-r2-secret-key]

# Session Secret (generate a random string)
SESSION_SECRET=[random-string-here]
```

### 3. Push Database Schema

```bash
npm run db:push
```

This creates the necessary tables in your PostgreSQL database.

### 4. Seed Your Music Data

#### Option A: Load Full Disclosure Album (15 tracks)

```bash
tsx scripts/seed-real-lyrics.ts
```

#### Option B: Load ALL Albums (requires public listing or manual paths)

If you have public listing enabled on R2:
```bash
tsx scripts/discover-and-seed-all.ts
```

Or edit the script to add your album paths manually.

### 5. Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## 📂 Project Structure

```
├── client/              # React frontend
│   └── src/
│       ├── pages/       # Page components
│       ├── components/  # Reusable UI components
│       └── lib/         # Utilities and query client
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Database abstraction
│   └── db.ts            # Drizzle database client
├── shared/              # Shared types
│   └── schema.ts        # Database schema & types
└── scripts/             # Utility scripts
    ├── seed-real-lyrics.ts        # Load Full Disclosure
    └── discover-and-seed-all.ts   # Auto-discover all albums
```

## 🎯 How It Works

### Database

The app uses PostgreSQL with two main tables:

- **`documents`**: Stores song lyrics, metadata, and embeddings for semantic search
- **`messages`**: Stores chat history

### RAG (Retrieval-Augmented Generation)

1. **Query Processing**: User questions are parsed to extract keywords
2. **Search**: Database is searched using:
   - Keyword matching
   - Cosine similarity on embeddings
3. **Context Retrieval**: Relevant lyrics are retrieved
4. **Response**: A simple answer is generated with citations

### Embeddings

Embeddings are generated using a simple TF-IDF approach:
- Converts lyrics to 384-dimension vectors
- Stored in PostgreSQL as `vector` type
- Used for semantic similarity search

## 🔧 Available Scripts

- `npm run dev` - Start development server (frontend + backend)
- `npm run build` - Build for production
- `npm run start` - Run production build
- `npm run check` - TypeScript type checking
- `npm run db:push` - Sync database schema

## 📝 Seeding Your Music

### Current Status

The database contains **15 tracks** from "The Mixtape Sessions - Full Disclosure":

1. Swordfish
2. Mic Check
3. Shakur
4. Last One Left
5. Full Disclosure
6. Lifted
7. Fuck Society
8. Ashes
9. Haunted
10. Monumental
11. Trafficked
12. Hocus Pocus
13. Syntax
14. Stay Real
15. The Story of Our Former Glory

### Loading More Albums

To load additional albums:

1. **Edit `scripts/seed-real-lyrics.ts`** and add your album track information
2. **Or use the discovery script** if you enable public listing on R2
3. **Or provide album paths** manually in the script

The seed script will:
- Fetch lyrics from R2
- Generate embeddings
- Store in database with metadata

## 🌐 R2 Configuration

Your lyrics are stored in Cloudflare R2:
- **Bucket**: `omniversal-s3`
- **Public URL**: `https://pub-c5a0232bd1bb4662939e8ae45342ba65.r2.dev`
- **Path Structure**: `src/data/HAWK-ARS-00/[project]/[album]/[track].md`

### File Format

Lyrics files should be in Markdown format with metadata:

```markdown
# 🎵 Track Title

**Album:** Album Name
**Performed by:** Hawk Eye
**Release Date:** 2020-03-01

## Lyrics

[Your lyrics here...]
```

## 🐛 Troubleshooting

### Database Connection Issues

If you can't connect to the database:
1. Check your `DATABASE_URL` is correct
2. Ensure your Neon database allows connections from your IP
3. Verify SSL mode is set to `require`

### R2 Access Issues

If lyrics won't load:
1. Check your R2 credentials are correct
2. Verify the bucket name and paths
3. Ensure files exist at the expected paths

### Build Errors

If you get dependency errors:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🚢 Deployment

### Option 1: Replit (Current)

The app is already configured for Replit deployment.

### Option 2: Vercel/Netlify

1. Build the frontend: `npm run build`
2. Deploy `dist/public` to your static host
3. Deploy the API separately or use serverless functions

### Option 3: VPS/Cloud

1. Build: `npm run build`
2. Start: `npm run start`
3. Use PM2 or similar for process management
4. Set up nginx as reverse proxy

## 📞 Support

For issues or questions:
- Check the TypeScript errors: `npm run check`
- Review the console logs
- Check database connection and R2 access

## 🎉 Next Steps

1. Load more of your music albums
2. Customize the UI in `client/src/pages/chat.tsx`
3. Improve the search algorithm in `server/storage.ts`
4. Add more features like playlist generation, lyric analysis, etc.

---

**Built with:**
- React + TypeScript
- Express.js
- PostgreSQL (Neon)
- Drizzle ORM
- Cloudflare R2
- TailwindCSS + shadcn/ui
