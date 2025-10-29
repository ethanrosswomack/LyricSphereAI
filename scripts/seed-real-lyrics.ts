import { storage } from '../server/storage';
import { fetchFromR2 } from './r2-fetch';

// Cloudflare R2 configuration
const R2_ACCOUNT_ID = '74b94b7ffc15701b77e53f81bea03813';
const R2_BUCKET_NAME = 'omniversal-s3';
const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

const r2Config = {
  accountId: R2_ACCOUNT_ID,
  accessKeyId: process.env.CLOUDFLARE_ACCESS_ID || '',
  secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || '',
  bucketName: R2_BUCKET_NAME,
};

// Track information from "The Mixtape Sessions - Full Disclosure"
interface TrackInfo {
  project: string;
  album: string;
  trackNumber: number;
  trackTitle: string;
  fileName: string;
  s3Key: string;
  url: string;
}

const tracks: TrackInfo[] = [
  {
    project: 'The Mixtape Sessions',
    album: 'Full Disclosure',
    trackNumber: 1,
    trackTitle: 'Swordfish',
    fileName: '01_swordfish.md',
    s3Key: 'src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/01_swordfish.md',
    url: `${R2_ENDPOINT}/${R2_BUCKET_NAME}/src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/01_swordfish.md`
  },
  {
    project: 'The Mixtape Sessions',
    album: 'Full Disclosure',
    trackNumber: 2,
    trackTitle: 'Mic Check',
    fileName: '02_mic_check.md',
    s3Key: 'src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/02_mic_check.md',
    url: `${R2_ENDPOINT}/${R2_BUCKET_NAME}/src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/02_mic_check.md`
  },
  {
    project: 'The Mixtape Sessions',
    album: 'Full Disclosure',
    trackNumber: 3,
    trackTitle: 'Shakur',
    fileName: '03_shakur.md',
    s3Key: 'src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/03_shakur.md',
    url: `${R2_ENDPOINT}/${R2_BUCKET_NAME}/src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/03_shakur.md`
  },
  {
    project: 'The Mixtape Sessions',
    album: 'Full Disclosure',
    trackNumber: 4,
    trackTitle: 'Last One Left',
    fileName: '04_last_one_left.md',
    s3Key: 'src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/04_last_one_left.md',
    url: `${R2_ENDPOINT}/${R2_BUCKET_NAME}/src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/04_last_one_left.md`
  },
  {
    project: 'The Mixtape Sessions',
    album: 'Full Disclosure',
    trackNumber: 5,
    trackTitle: 'Full Disclosure',
    fileName: '05_full_disclosure.md',
    s3Key: 'src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/05_full_disclosure.md',
    url: `${R2_ENDPOINT}/${R2_BUCKET_NAME}/src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/05_full_disclosure.md`
  },
  {
    project: 'The Mixtape Sessions',
    album: 'Full Disclosure',
    trackNumber: 6,
    trackTitle: 'Lifted',
    fileName: '06_lifted.md',
    s3Key: 'src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/06_lifted.md',
    url: `${R2_ENDPOINT}/${R2_BUCKET_NAME}/src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/06_lifted.md`
  },
  {
    project: 'The Mixtape Sessions',
    album: 'Full Disclosure',
    trackNumber: 7,
    trackTitle: 'Fuck Society',
    fileName: '07_fuck_society.md',
    s3Key: 'src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/07_fuck_society.md',
    url: `${R2_ENDPOINT}/${R2_BUCKET_NAME}/src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/07_fuck_society.md`
  },
  {
    project: 'The Mixtape Sessions',
    album: 'Full Disclosure',
    trackNumber: 8,
    trackTitle: 'Ashes',
    fileName: '08_ashes.md',
    s3Key: 'src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/08_ashes.md',
    url: `${R2_ENDPOINT}/${R2_BUCKET_NAME}/src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/08_ashes.md`
  },
  {
    project: 'The Mixtape Sessions',
    album: 'Full Disclosure',
    trackNumber: 9,
    trackTitle: 'Haunted',
    fileName: '09_haunted.md',
    s3Key: 'src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/09_haunted.md',
    url: `${R2_ENDPOINT}/${R2_BUCKET_NAME}/src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/09_haunted.md`
  },
  {
    project: 'The Mixtape Sessions',
    album: 'Full Disclosure',
    trackNumber: 10,
    trackTitle: 'Monumental',
    fileName: '10_monumental.md',
    s3Key: 'src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/10_monumental.md',
    url: `${R2_ENDPOINT}/${R2_BUCKET_NAME}/src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/10_monumental.md`
  },
  {
    project: 'The Mixtape Sessions',
    album: 'Full Disclosure',
    trackNumber: 11,
    trackTitle: 'Trafficked',
    fileName: '11_trafficked_web.md',
    s3Key: 'src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/11_trafficked_web.md',
    url: `${R2_ENDPOINT}/${R2_BUCKET_NAME}/src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/11_trafficked_web.md`
  },
  {
    project: 'The Mixtape Sessions',
    album: 'Full Disclosure',
    trackNumber: 12,
    trackTitle: 'Hocus Pocus',
    fileName: '12_hocus_pocus.md',
    s3Key: 'src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/12_hocus_pocus.md',
    url: `${R2_ENDPOINT}/${R2_BUCKET_NAME}/src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/12_hocus_pocus.md`
  },
  {
    project: 'The Mixtape Sessions',
    album: 'Full Disclosure',
    trackNumber: 13,
    trackTitle: 'Syntax',
    fileName: '13_syntax.md',
    s3Key: 'src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/13_syntax.md',
    url: `${R2_ENDPOINT}/${R2_BUCKET_NAME}/src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/13_syntax.md`
  },
  {
    project: 'The Mixtape Sessions',
    album: 'Full Disclosure',
    trackNumber: 14,
    trackTitle: 'Stay Real',
    fileName: '14_stay_real.md',
    s3Key: 'src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/14_stay_real.md',
    url: `${R2_ENDPOINT}/${R2_BUCKET_NAME}/src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/14_stay_real.md`
  },
  {
    project: 'The Mixtape Sessions',
    album: 'Full Disclosure',
    trackNumber: 15,
    trackTitle: 'The Story of Our Former Glory',
    fileName: '15_the_story_of_our_former_glory.md',
    s3Key: 'src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/15_the_story_of_our_former_glory.md',
    url: `${R2_ENDPOINT}/${R2_BUCKET_NAME}/src/data/HAWK-ARS-00/02_mixtape_sessions/01_full_disclosure/15_the_story_of_our_former_glory.md`
  }
];

// Helper function to fetch content from R2 using custom authentication
async function fetchTrackContent(s3Key: string): Promise<string | null> {
  try {
    const content = await fetchFromR2(r2Config, s3Key);
    return content;
  } catch (error) {
    console.error(`   ❌ Failed to fetch: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

// Helper function to add delay between requests
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main seeding function
async function seedRealLyrics() {
  console.log('🎵 === Seeding Real Lyrics from Cloudflare R2 ===\n');
  console.log(`🔐 Using authenticated S3 access`);
  console.log(`🪣 Bucket: ${R2_BUCKET_NAME}`);
  console.log(`🌐 Endpoint: ${R2_ENDPOINT}`);
  console.log(`📦 Project: ${tracks[0].project}`);
  console.log(`💿 Album: ${tracks[0].album}`);
  console.log(`🎼 Total tracks: ${tracks.length}\n`);
  
  // Verify credentials are available
  if (!process.env.CLOUDFLARE_ACCESS_ID || !process.env.CLOUDFLARE_SECRET_ACCESS_KEY) {
    console.error('❌ Missing Cloudflare R2 credentials!');
    console.error('   Please ensure CLOUDFLARE_ACCESS_ID and CLOUDFLARE_SECRET_ACCESS_KEY are set');
    process.exit(1);
  }
  
  let successCount = 0;
  let failureCount = 0;
  
  try {
    // Step 1: Clear existing sample data
    console.log('🗑️  Clearing existing documents...');
    await storage.clearDocuments();
    console.log('✅ Existing documents cleared\n');
    
    // Step 2: Fetch and insert each track sequentially
    console.log('📥 Fetching and inserting tracks from R2:\n');
    
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      const trackNum = `${track.trackNumber}`.padStart(2, '0');
      
      console.log(`[${i + 1}/${tracks.length}] Track ${trackNum}: "${track.trackTitle}"`);
      console.log(`   🔑 S3 Key: ${track.s3Key}`);
      
      // Fetch content from R2 using authenticated S3 client
      const content = await fetchTrackContent(track.s3Key);
      
      if (content === null) {
        failureCount++;
        console.log(`   ⚠️  Skipping due to fetch failure\n`);
        
        // Add delay even on failure to avoid overwhelming the server
        if (i < tracks.length - 1) {
          await delay(500);
        }
        continue;
      }
      
      // Insert document with proper metadata including R2 URL
      try {
        await storage.createDocument({
          title: track.trackTitle,
          content: content.trim(),
          metadata: {
            project: track.project,
            album: track.album,
            trackNumber: track.trackNumber,
            trackTitle: track.trackTitle,
            url: track.url
          }
        });
        
        successCount++;
        console.log(`   ✅ Successfully inserted (${content.length} characters)\n`);
      } catch (insertError) {
        failureCount++;
        console.error(`   ❌ Failed to insert: ${insertError instanceof Error ? insertError.message : 'Unknown error'}\n`);
      }
      
      // Add delay between requests to be respectful to the server
      // Skip delay after the last track
      if (i < tracks.length - 1) {
        await delay(500); // 500ms delay between requests
      }
    }
    
    // Step 3: Report results
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Seeding Complete!\n');
    console.log(`✅ Successfully inserted: ${successCount} tracks`);
    console.log(`❌ Failed to insert: ${failureCount} tracks`);
    console.log(`📈 Success rate: ${Math.round((successCount / tracks.length) * 100)}%`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (successCount > 0) {
      console.log('🎉 Real lyrics are now available in the database!');
      console.log('💡 Try asking about:');
      tracks.slice(0, 3).forEach(t => {
        console.log(`   - "${t.trackTitle}"`);
      });
    }
    
  } catch (error) {
    console.error('\n💥 Fatal error during seeding:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedRealLyrics()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n💥 Script failed:', err);
    process.exit(1);
  });

export { seedRealLyrics, tracks };
