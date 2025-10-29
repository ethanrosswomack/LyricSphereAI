/**
 * List all objects in R2 bucket using aws4 for authentication
 * This is a lightweight alternative to the full AWS SDK
 */

import https from 'https';
import aws4 from 'aws4';
import { parseStringPromise } from 'xml2js';

// Configuration
const R2_ACCOUNT_ID = '74b94b7ffc15701b77e53f81bea03813';
const R2_BUCKET_NAME = 'omniversal-s3';
const R2_PUBLIC_URL = 'https://pub-c5a0232bd1bb4662939e8ae45342ba65.r2.dev';

interface R2Object {
  Key: string[];
  Size: string[];
  LastModified: string[];
}

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
 * List objects in R2 bucket with prefix
 */
async function listR2Objects(prefix = '', continuationToken?: string): Promise<{
  objects: R2Object[];
  nextToken?: string;
  isTruncated: boolean;
}> {
  return new Promise((resolve, reject) => {
    const path = `/${R2_BUCKET_NAME}/?list-type=2&prefix=${encodeURIComponent(prefix)}${
      continuationToken ? `&continuation-token=${encodeURIComponent(continuationToken)}` : ''
    }`;

    const opts = {
      host: `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      path,
      service: 's3',
      region: 'auto',
    };

    // Sign the request with AWS Signature V4
    aws4.sign(opts, {
      accessKeyId: process.env.CLOUDFLARE_ACCESS_ID || '',
      secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || '',
    });

    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', async () => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          return;
        }

        try {
          // Parse XML response
          const parsed = await parseStringPromise(data);
          const result = parsed.ListBucketResult;

          const objects = result.Contents || [];
          const isTruncated = result.IsTruncated?.[0] === 'true';
          const nextToken = result.NextContinuationToken?.[0];

          resolve({ objects, nextToken, isTruncated });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
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

  return {
    project,
    album,
    trackNumber,
    trackTitle,
    fileName,
  };
}

/**
 * Convert folder slug to display name
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
 * Parse filename to get track number and title
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
 * Discover all tracks in R2 bucket
 */
export async function discoverAllTracks(): Promise<DiscoveredTrack[]> {
  console.log('🎵 === Discovering All Albums ===\n');
  console.log(`🪣 Bucket: ${R2_BUCKET_NAME}`);
  console.log(`🌐 Public URL: ${R2_PUBLIC_URL}`);
  console.log(`📂 Prefix: src/data/HAWK-ARS-00/\n`);

  const allTracks: DiscoveredTrack[] = [];
  let continuationToken: string | undefined;
  let pageCount = 0;

  try {
    do {
      pageCount++;
      console.log(`📄 Fetching page ${pageCount}...`);

      const result = await listR2Objects('src/data/HAWK-ARS-00/', continuationToken);

      for (const obj of result.objects) {
        const key = obj.Key[0];
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

      continuationToken = result.nextToken;
    } while (continuationToken);

    console.log(`✅ Found ${allTracks.length} total tracks\n`);

    // Group by album for summary
    const byAlbum = allTracks.reduce((acc, track) => {
      const key = `${track.project} / ${track.album}`;
      if (!acc[key]) acc[key] = 0;
      acc[key]++;
      return acc;
    }, {} as Record<string, number>);

    console.log('📊 Albums Found:');
    Object.entries(byAlbum)
      .sort()
      .forEach(([album, count]) => {
        console.log(`   ${album}: ${count} tracks`);
      });
    console.log('');

    return allTracks;
  } catch (error) {
    console.error('❌ Discovery failed:', error);
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  discoverAllTracks()
    .then((tracks) => {
      console.log(`🎉 Discovery complete! Total: ${tracks.length} tracks`);
      console.log('\n📝 Sample tracks:');
      tracks.slice(0, 10).forEach((track) => {
        console.log(`   [${track.trackNumber || '?'}] ${track.trackTitle} (${track.album})`);
      });
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}
