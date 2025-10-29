/**
 * Discover and seed ALL albums from R2 bucket
 * Uses public listing endpoint to discover all tracks
 */

import { db } from '../server/db';
import { documents } from '../shared/schema';
import { generateEmbedding } from '../server/embeddings';

const R2_PUBLIC_URL = 'https://pub-c5a0232bd1bb4662939e8ae45342ba65.r2.dev';

interface DiscoveredTrack {
  project: string;
  album: string;
  trackNumber: number | null;
  trackTitle: string;
  fileName: string;
  s3Key: string;
  url: string;
}

/**
 * Fetch XML from public listing endpoint
 */
async function fetchPublicListing(prefix = '', marker = ''): Promise<string> {
  const url = `${R2_PUBLIC_URL}/?prefix=${encodeURIComponent(prefix)}${marker ? `&marker=${encodeURIComponent(marker)}` : ''}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  return await response.text();
}

/**
 * Parse XML listing response
 */
function parseListingXML(xml: string): { keys: string[]; isTruncated: boolean; lastKey?: string } {
  const keys: string[] = [];
  
  // Extract all <Key> elements
  const keyMatches = xml.matchAll(/<Key>([^<]+)<\/Key>/g);
  for (const match of keyMatches) {
    keys.push(match[1]);
  }
  
  // Check if more results exist
  const isTruncated = xml.includes('<IsTruncated>true</IsTruncated>');
  
  // Get last key for pagination
  const lastKey = keys.length > 0 ? keys[keys.length - 1] : undefined;
  
  return { keys, isTruncated, lastKey };
}

/**
 * Parse track metadata from S3 key
 */
function parseTrackMetadata(s3Key: string): Omit<DiscoveredTrack, 's3Key' | 'url'> | null {
  const parts = s3Key.split('/');

  // Expected: src/data/HAWK-ARS-00/[project]/[album]/[track].md
  if (parts.length < 6 || !s3Key.endsWith('.md')) {
    return null;
  }

  const projectFolder = parts[3];
  const albumFolder = parts[4];
  const fileName = parts[5];

  const project = parseDisplayName(projectFolder);
  const album = parseDisplayName(albumFolder);
  const { trackNumber, trackTitle } = parseFileName(fileName);

  return { project, album, trackNumber, trackTitle, fileName };
}

/**
 * Convert folder name to display name
 */
function parseDisplayName(slug: string): string {
  let name = slug.replace(/^\d+_/, '');
  name = name.replace(/_/g, ' ');
  name = name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  if (name.toLowerCase().includes('mixtape sessions')) {
    return 'The Mixtape Sessions';
  }

  return name;
}

/**
 * Parse filename to extract track info
 */
function parseFileName(fileName: string): { trackNumber: number | null; trackTitle: string } {
  const nameWithoutExt = fileName.replace(/\.md$/, '');
  const match = nameWithoutExt.match(/^(\d+)_(.+)$/);

  if (match) {
    const trackNumber = parseInt(match[1], 10);
    const titleSlug = match[2];
    const trackTitle = titleSlug
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return { trackNumber, trackTitle };
  }

  const trackTitle = nameWithoutExt
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return { trackNumber: null, trackTitle };
}

/**
 * Discover all tracks using public listing
 */
async function discoverAllTracks(): Promise<DiscoveredTrack[]> {
  console.log('🔍 Discovering tracks via public listing...\n');
  console.log(`🌐 URL: ${R2_PUBLIC_URL}`);
  console.log(`📂 Prefix: src/data/HAWK-ARS-00/\n`);

  const allTracks: DiscoveredTrack[] = [];
  let marker: string | undefined;
  let pageCount = 0;

  try {
    do {
      pageCount++;
      console.log(`📄 Fetching page ${pageCount}...`);

      const xml = await fetchPublicListing('src/data/HAWK-ARS-00/', marker);
      const result = parseListingXML(xml);

      for (const key of result.keys) {
        if (!key.endsWith('.md')) continue;

        const metadata = parseTrackMetadata(key);
        if (metadata) {
          allTracks.push({
            ...metadata,
            s3Key: key,
            url: `${R2_PUBLIC_URL}/${key}`,
          });
        }
      }

      marker = result.isTruncated ? result.lastKey : undefined;
      
      // Small delay to avoid rate limiting
      if (marker) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } while (marker);

    console.log(`✅ Found ${allTracks.length} total tracks\n`);

    return allTracks;
  } catch (error) {
    console.error('❌ Discovery failed:', error);
    throw error;
  }
}

/**
 * Fetch track content from R2
 */
async function fetchTrackContent(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

/**
 * Seed all discovered tracks
 */
async function seedAllTracks() {
  console.log('🎵 === Discover & Seed All Albums ===\n');

  // Step 1: Discover all tracks
  const tracks = await discoverAllTracks();

  if (tracks.length === 0) {
    console.log('⚠️  No tracks found!');
    console.log('💡 Make sure public listing is enabled on your R2 bucket\n');
    return;
  }

  // Show summary
  const byAlbum = tracks.reduce((acc, track) => {
    const key = `${track.project} / ${track.album}`;
    if (!acc[key]) acc[key] = 0;
    acc[key]++;
    return acc;
  }, {} as Record<string, number>);

  console.log('📊 Albums to be loaded:');
  Object.entries(byAlbum)
    .sort()
    .forEach(([album, count]) => {
      console.log(`   ${album}: ${count} tracks`);
    });
  console.log('');

  // Step 2: Clear existing data
  console.log('🗑️  Clearing existing documents...');
  await db.delete(documents);
  console.log('✅ Cleared\n');

  // Step 3: Seed tracks
  console.log(`📥 Fetching and inserting ${tracks.length} tracks:\n`);

  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    const trackNum = track.trackNumber?.toString().padStart(2, '0') || '??';
    
    console.log(`[${i + 1}/${tracks.length}] ${trackNum}. ${track.trackTitle} (${track.album})`);

    // Fetch content
    const content = await fetchTrackContent(track.url);
    
    if (!content) {
      console.log(`   ❌ Failed to fetch`);
      failureCount++;
      continue;
    }

    // Generate embedding
    const embedding = await generateEmbedding(content);

    // Insert into database
    try {
      await db.insert(documents).values({
        title: track.trackTitle,
        content,
        metadata: {
          track: track.trackTitle,
          album: track.album,
          project: track.project,
          trackNumber: track.trackNumber,
          url: track.url,
        },
        embedding,
      });

      console.log(`   ✅ Inserted (${content.length} chars)`);
      successCount++;
    } catch (error) {
      console.log(`   ❌ Insert failed: ${error instanceof Error ? error.message : 'Unknown'}`);
      failureCount++;
    }

    // Small delay to avoid overwhelming the system
    if (i < tracks.length - 1 && i % 10 === 9) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Seeding Complete!\n');
  console.log(`✅ Successfully inserted: ${successCount} tracks`);
  console.log(`❌ Failed to insert: ${failureCount} tracks`);
  console.log(`📈 Success rate: ${Math.round((successCount / tracks.length) * 100)}%`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (successCount > 0) {
    console.log('🎉 All albums are now available in the database!');
    console.log('💡 Your chatbot can now answer questions about:');
    Object.keys(byAlbum)
      .sort()
      .slice(0, 5)
      .forEach((album) => {
        console.log(`   - ${album}`);
      });
    if (Object.keys(byAlbum).length > 5) {
      console.log(`   ... and ${Object.keys(byAlbum).length - 5} more!`);
    }
  }

  console.log('\n✨ Script completed!');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAllTracks()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('\n❌ Fatal error:', error);
      process.exit(1);
    });
}
