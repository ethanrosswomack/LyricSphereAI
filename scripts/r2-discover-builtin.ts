/**
 * Discover all albums using only built-in Node.js modules
 * Signs R2 requests with AWS Signature V4 using native crypto
 */

import crypto from 'crypto';
import https from 'https';

// Configuration
const R2_ACCOUNT_ID = '74b94b7ffc15701b77e53f81bea03813';
const R2_BUCKET_NAME = 'omniversal-s3';
const R2_PUBLIC_URL = 'https://pub-c5a0232bd1bb4662939e8ae45342ba65.r2.dev';
const HOST = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const REGION = 'auto';
const SERVICE = 's3';

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
 * Create AWS Signature V4
 */
function signRequest(
  method: string,
  path: string,
  headers: Record<string, string>,
  accessKeyId: string,
  secretAccessKey: string
): string {
  const now = new Date();
  const dateStamp = now.toISOString().split('T')[0].replace(/-/g, '');
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');

  // Canonical request
  const canonicalHeaders = Object.entries(headers)
    .map(([k, v]) => `${k.toLowerCase()}:${v.trim()}`)
    .sort()
    .join('\n');
  
  const signedHeaders = Object.keys(headers)
    .map(k => k.toLowerCase())
    .sort()
    .join(';');

  const payloadHash = crypto.createHash('sha256').update('').digest('hex');
  
  const canonicalRequest = [
    method,
    path,
    '',  // query string
    canonicalHeaders,
    '',  // blank line
    signedHeaders,
    payloadHash
  ].join('\n');

  // String to sign
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const canonicalRequestHash = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
  
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    canonicalRequestHash
  ].join('\n');

  // Signing key
  const kDate = crypto.createHmac('sha256', `AWS4${secretAccessKey}`).update(dateStamp).digest();
  const kRegion = crypto.createHmac('sha256', kDate).update(REGION).digest();
  const kService = crypto.createHmac('sha256', kRegion).update(SERVICE).digest();
  const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
  
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  return `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

/**
 * List objects in R2
 */
async function listR2Objects(prefix = '', continuationToken?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const accessKeyId = process.env.CLOUDFLARE_ACCESS_ID || '';
    const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY || '';

    if (!accessKeyId || !secretAccessKey) {
      reject(new Error('Missing R2 credentials'));
      return;
    }

    const path = `/${R2_BUCKET_NAME}/?list-type=2&prefix=${encodeURIComponent(prefix)}${
      continuationToken ? `&continuation-token=${encodeURIComponent(continuationToken)}` : ''
    }`;

    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    
    const headers = {
      'Host': HOST,
      'x-amz-content-sha256': crypto.createHash('sha256').update('').digest('hex'),
      'x-amz-date': amzDate,
    };

    const authorization = signRequest('GET', path, headers, accessKeyId, secretAccessKey);

    const options = {
      hostname: HOST,
      path,
      method: 'GET',
      headers: {
        ...headers,
        'Authorization': authorization,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        } else {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Parse XML manually (simple approach for ListBucketResult)
 */
function parseListResponse(xml: string): {
  keys: string[];
  isTruncated: boolean;
  nextToken?: string;
} {
  const keys: string[] = [];
  
  // Extract all <Key> values
  const keyMatches = xml.matchAll(/<Key>(.+?)<\/Key>/g);
  for (const match of keyMatches) {
    keys.push(match[1]);
  }

  // Check if truncated
  const isTruncated = xml.includes('<IsTruncated>true</IsTruncated>');
  
  // Extract continuation token
  const tokenMatch = xml.match(/<NextContinuationToken>(.+?)<\/NextContinuationToken>/);
  const nextToken = tokenMatch ? tokenMatch[1] : undefined;

  return { keys, isTruncated, nextToken };
}

/**
 * Parse track metadata
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
 * Discover all tracks
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

      const xml = await listR2Objects('src/data/HAWK-ARS-00/', continuationToken);
      const result = parseListResponse(xml);

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

      continuationToken = result.nextToken;
    } while (continuationToken);

    console.log(`✅ Found ${allTracks.length} total tracks\n`);

    // Group by album
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
      tracks.slice(0, 15).forEach((track) => {
        console.log(`   [${(track.trackNumber || 0).toString().padStart(2, '0')}] ${track.trackTitle} - ${track.album}`);
      });
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}
