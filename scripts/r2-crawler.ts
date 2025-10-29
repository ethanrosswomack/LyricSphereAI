import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

// Cloudflare R2 configuration
const R2_ACCOUNT_ID = '74b94b7ffc15701b77e53f81bea03813';
const R2_BUCKET_NAME = 'omniversal-s3';
const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const R2_PUBLIC_URL = 'https://pub-c5a0232bd1bb4662939e8ae45342ba65.r2.dev';

// Track metadata interface
export interface DiscoveredTrack {
  project: string;
  album: string;
  trackNumber: number | null;
  trackTitle: string;
  fileName: string;
  s3Key: string;
  url: string;
}

// Initialize S3 client for R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || '',
  },
});

/**
 * Parse a file path to extract metadata
 * Example: src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/01_swordfish.md
 * Returns: { project: 'The Mixtape Sessions', album: 'Full Disclosure', trackNumber: 1, trackTitle: 'Swordfish' }
 */
function parseTrackMetadata(s3Key: string): Omit<DiscoveredTrack, 's3Key' | 'url'> | null {
  const parts = s3Key.split('/');
  
  // Expected structure: src/data/HAWK-ARS-00/[project]/[album]/[track].md
  if (parts.length < 5 || !s3Key.endsWith('.md')) {
    return null;
  }

  const projectFolder = parts[3];
  const albumFolder = parts[4];
  const fileName = parts[5];

  // Parse project name (e.g., "02_mixtape_sessions" -> "The Mixtape Sessions")
  const project = parseDisplayName(projectFolder);

  // Parse album name (e.g., "01_full_disclosure" -> "Full Disclosure")
  const album = parseDisplayName(albumFolder);

  // Parse track number and title from filename (e.g., "01_swordfish.md" -> 1, "Swordfish")
  const { trackNumber, trackTitle } = parseFileName(fileName);

  return {
    project,
    album,
    trackNumber,
    trackTitle,
    fileName,
  };
}

/**
 * Convert folder name to display name
 * Examples:
 * - "02_mixtape_sessions" -> "The Mixtape Sessions"
 * - "01_full_disclosure" -> "Full Disclosure"
 */
function parseDisplayName(folderName: string): string {
  // Remove leading numbers and underscores
  let name = folderName.replace(/^\d+_/, '');
  
  // Convert underscores to spaces
  name = name.replace(/_/g, ' ');
  
  // Capitalize each word
  name = name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Special case handling
  if (name.toLowerCase().includes('mixtape sessions')) {
    name = 'The Mixtape Sessions';
  }

  return name;
}

/**
 * Parse filename to extract track number and title
 * Examples:
 * - "01_swordfish.md" -> { trackNumber: 1, trackTitle: "Swordfish" }
 * - "14_stay_real.md" -> { trackNumber: 14, trackTitle: "Stay Real" }
 */
function parseFileName(fileName: string): { trackNumber: number | null; trackTitle: string } {
  // Remove .md extension
  const nameWithoutExt = fileName.replace(/\.md$/, '');

  // Try to extract track number (e.g., "01_swordfish" -> 1)
  const match = nameWithoutExt.match(/^(\d+)_(.+)$/);
  
  if (match) {
    const trackNumber = parseInt(match[1], 10);
    const titleSlug = match[2];
    
    // Convert slug to title (e.g., "swordfish" -> "Swordfish")
    const trackTitle = titleSlug
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return { trackNumber, trackTitle };
  }

  // Fallback: no track number found
  const trackTitle = nameWithoutExt
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return { trackNumber: null, trackTitle };
}

/**
 * Discover all tracks in the R2 bucket
 */
export async function discoverAllTracks(): Promise<DiscoveredTrack[]> {
  console.log('🔍 Discovering tracks in R2 bucket...\n');
  console.log(`🪣 Bucket: ${R2_BUCKET_NAME}`);
  console.log(`🌐 Endpoint: ${R2_ENDPOINT}`);
  console.log(`📂 Prefix: src/data/HAWK-ARS-00/\n`);

  const tracks: DiscoveredTrack[] = [];
  let continuationToken: string | undefined;
  let pageCount = 0;

  try {
    do {
      pageCount++;
      console.log(`📄 Fetching page ${pageCount}...`);

      const command = new ListObjectsV2Command({
        Bucket: R2_BUCKET_NAME,
        Prefix: 'src/data/HAWK-ARS-00/',
        ContinuationToken: continuationToken,
      });

      const response = await s3Client.send(command);

      if (response.Contents) {
        for (const object of response.Contents) {
          if (!object.Key || !object.Key.endsWith('.md')) {
            continue;
          }

          const metadata = parseTrackMetadata(object.Key);
          if (metadata) {
            tracks.push({
              ...metadata,
              s3Key: object.Key,
              url: `${R2_PUBLIC_URL}/${object.Key}`,
            });
          }
        }
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    console.log(`✅ Discovery complete! Found ${tracks.length} tracks\n`);

    // Group by project and album for summary
    const summary = tracks.reduce((acc, track) => {
      const key = `${track.project} - ${track.album}`;
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key]++;
      return acc;
    }, {} as Record<string, number>);

    console.log('📊 Summary by Album:');
    Object.entries(summary).forEach(([key, count]) => {
      console.log(`   ${key}: ${count} tracks`);
    });
    console.log('');

    return tracks;
  } catch (error) {
    console.error('❌ Failed to discover tracks:', error);
    throw error;
  }
}

// Run discovery if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  discoverAllTracks()
    .then(tracks => {
      console.log('🎵 Sample tracks:');
      tracks.slice(0, 5).forEach(track => {
        console.log(`   [${track.trackNumber || '?'}] ${track.project} - ${track.album} - ${track.trackTitle}`);
      });
    })
    .catch(error => {
      console.error('Failed:', error);
      process.exit(1);
    });
}
