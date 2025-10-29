/**
 * Automatic Album Discovery Script
 * Probes R2 bucket structure to find all albums and tracks
 */

const R2_PUBLIC_URL = 'https://pub-c5a0232bd1bb4662939e8ae45342ba65.r2.dev';
const BASE_PATH = 'src/data/HAWK-ARS-00';

interface TrackInfo {
  project: string;
  album: string;
  trackNumber: number;
  trackTitle: string;
  fileName: string;
  s3Key: string;
  url: string;
}

/**
 * Test if a URL exists
 */
async function urlExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch content from URL
 */
async function fetchContent(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

/**
 * Parse display name from folder slug
 */
function parseDisplayName(slug: string): string {
  // Remove leading numbers and underscores
  let name = slug.replace(/^\d+_/, '');
  
  // Convert underscores to spaces and capitalize
  name = name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Special cases
  if (name.toLowerCase().includes('mixtape sessions')) {
    return 'The Mixtape Sessions';
  }

  return name;
}

/**
 * Parse filename to extract track info
 */
function parseFileName(fileName: string): { trackNumber: number; trackTitle: string } {
  const nameWithoutExt = fileName.replace(/\.md$/, '');
  const match = nameWithoutExt.match(/^(\d+)_(.+)$/);
  
  if (match) {
    const trackNumber = parseInt(match[1], 10);
    const titleSlug = match[2];
    const trackTitle = titleSlug
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return { trackNumber, trackTitle };
  }

  return { trackNumber: 0, trackTitle: nameWithoutExt };
}

/**
 * Try to discover tracks in an album
 */
async function discoverAlbumTracks(
  projectSlug: string,
  albumSlug: string,
  maxTracks = 30
): Promise<TrackInfo[]> {
  const tracks: TrackInfo[] = [];
  const project = parseDisplayName(projectSlug);
  const album = parseDisplayName(albumSlug);

  console.log(`  📀 Scanning album: ${album}...`);

  // Try tracks numbered 01-30
  for (let i = 1; i <= maxTracks; i++) {
    const trackNumStr = i.toString().padStart(2, '0');
    
    // Try different common filename patterns
    const patterns = [
      `${trackNumStr}_*.md`,
    ];

    // Since we can't wildcard, we need to try common track name patterns
    // Let's just try sequential numbers and break when we hit misses
    let foundInThisSlot = false;
    
    // Try to fetch a test URL to see if this track number exists
    // We'll use a common pattern and if it fails, try to be smarter
    const testPatterns = [
      'intro', 'swordfish', 'mic_check', 'shakur', 'last_one_left',
      'full_disclosure', 'lifted', 'fuck_society', 'ashes', 'haunted',
      'monumental', 'trafficked_web', 'hocus_pocus', 'syntax', 'stay_real',
      'the_story_of_our_former_glory', 'outro', 'interlude', 'warning_shots',
      'title_track', 'freestyle', 'remix', 'bonus', 'hidden', 'untitled'
    ];

    // For now, let's just probe sequentially and break on first miss
    // This is a simplified approach - we'll break after 3 consecutive misses
    let consecutiveMisses = 0;
    
    // We need a smarter approach - let's just return empty for now
    // and rely on a different method
    break;
  }

  return tracks;
}

/**
 * Discover all projects (numbered folders like 01_*, 02_*, etc.)
 */
async function discoverProjects(maxProjects = 10): Promise<string[]> {
  const projects: string[] = [];
  
  console.log('🔍 Discovering projects...\n');

  for (let i = 1; i <= maxProjects; i++) {
    const projectNum = i.toString().padStart(2, '0');
    
    // Try common project patterns
    const testPatterns = [
      `${projectNum}_mixtape_sessions`,
      `${projectNum}_album`,
      `${projectNum}_ep`,
      `${projectNum}_singles`,
      `${projectNum}_demos`,
    ];

    for (const pattern of testPatterns) {
      // Test if this project exists by trying album 01
      const testUrl = `${R2_PUBLIC_URL}/${BASE_PATH}/${pattern}/01_album/01_track.md`;
      
      // This won't work well without knowing actual filenames
      // Let's use the known structure instead
      break;
    }
  }

  return projects;
}

/**
 * Main discovery function - uses a smarter approach
 * Since we know one album works, let's systematically explore from there
 */
async function discoverAllAlbumsSystematic(): Promise<TrackInfo[]> {
  console.log('🎵 === Systematic Album Discovery ===\n');
  console.log('🌐 Public URL:', R2_PUBLIC_URL);
  console.log('📂 Base Path:', BASE_PATH);
  console.log('\n🔍 Starting systematic scan...\n');

  const allTracks: TrackInfo[] = [];
  
  // Known structure patterns to try
  const projectPatterns = [
    '01_singles',
    '02_mixtape_sessions', // We know this one works
    '03_eps',
    '04_albums',
    '05_collaborations',
  ];

  const albumPatterns = [
    '01_full_disclosure', // We know this one works
    '02_second_album',
    '03_third_album',
  ];

  // For each project pattern
  for (const projectSlug of projectPatterns) {
    const project = parseDisplayName(projectSlug);
    console.log(`📦 Project: ${project}`);

    // For each album pattern within this project
    for (const albumSlug of albumPatterns) {
      const album = parseDisplayName(albumSlug);
      
      // Try first track to see if this album exists
      const testUrl = `${R2_PUBLIC_URL}/${BASE_PATH}/${projectSlug}/${albumSlug}/01_test.md`;
      
      // Since we can't probe efficiently without actual filenames,
      // let's take a different approach
    }
  }

  return allTracks;
}

/**
 * BETTER APPROACH: Use known working album as template
 * and systematically expand from there
 */
async function smartDiscover(): Promise<void> {
  console.log('🎵 === Smart Album Discovery ===\n');
  console.log('Strategy: Expanding from known working paths\n');

  // We know this works: 02_mixtape_sessions/01_full_disclosure
  // Let's try variations:
  
  const tests = [
    // Try other albums in same project
    { project: '02_mixtape_sessions', album: '02_*', test: 'second album in Mixtape Sessions' },
    { project: '02_mixtape_sessions', album: '00_*', test: 'prequel album' },
    
    // Try other projects  
    { project: '01_*', album: '01_*', test: 'first project' },
    { project: '03_*', album: '01_*', test: 'third project' },
  ];

  console.log('This requires knowing actual album names.');
  console.log('Recommendation: Provide album list or use AWS SDK with credentials.\n');
  
  console.log('📋 Manual approach needed:');
  console.log('1. List your album folders');
  console.log('2. Or enable R2 bucket listing API');
  console.log('3. Or use AWS SDK with proper credentials\n');
}

// Run discovery
smartDiscover().catch(console.error);
