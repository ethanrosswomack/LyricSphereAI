const fs = require('fs');
const https = require('https');
const crypto = require('crypto');

// Your R2 credentials
const R2_CONFIG = {
    accountId: '74b94b7ffc15701b77e53f81bea03813',
    bucketName: 'clean-omniversal',
    accessKeyId: '64bd1df0ebad515e5f3c3496026a5808',
    secretAccessKey: '2a07d41c2522702d5b2d2fecdcb44f16a4ef44578adba3a6f03efbfca78edcef'
};

function createSignature(secretKey, dateStamp, region, service, stringToSign) {
    const kDate = crypto.createHmac('sha256', `AWS4${secretKey}`).update(dateStamp).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(service).digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    return crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');
}

async function listR2Objects() {
    return new Promise((resolve, reject) => {
        const host = `${R2_CONFIG.accountId}.r2.cloudflarestorage.com`;
        const path = `/${R2_CONFIG.bucketName}/?list-type=2&prefix=__r2_data_catalog/`;
        
        const now = new Date();
        const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
        const dateStamp = amzDate.substring(0, 8);
        
        const canonicalRequest = [
            'GET',
            path,
            '',
            `host:${host}\nx-amz-date:${amzDate}\n`,
            'host;x-amz-date',
            'UNSIGNED-PAYLOAD'
        ].join('\n');
        
        const credentialScope = `${dateStamp}/auto/s3/aws4_request`;
        const stringToSign = [
            'AWS4-HMAC-SHA256',
            amzDate,
            credentialScope,
            crypto.createHash('sha256').update(canonicalRequest).digest('hex')
        ].join('\n');
        
        const signature = createSignature(R2_CONFIG.secretAccessKey, dateStamp, 'auto', 's3', stringToSign);
        const authHeader = `AWS4-HMAC-SHA256 Credential=${R2_CONFIG.accessKeyId}/${credentialScope}, SignedHeaders=host;x-amz-date, Signature=${signature}`;
        
        const options = {
            hostname: host,
            path: path,
            method: 'GET',
            headers: {
                'Host': host,
                'x-amz-date': amzDate,
                'Authorization': authHeader
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(data);
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });
        
        req.on('error', reject);
        req.end();
    });
}

async function generateCatalog() {
    console.log('🎵 Discovering tracks from R2...');
    
    try {
        const xmlData = await listR2Objects();
        console.log('✅ Got R2 response, parsing...');
        
        // Simple XML parsing for Contents
        const keys = [];
        const contentMatches = xmlData.match(/<Contents>[\s\S]*?<\/Contents>/g) || [];
        
        contentMatches.forEach(content => {
            const keyMatch = content.match(/<Key>(.*?)<\/Key>/);
            if (keyMatch && keyMatch[1].endsWith('.md')) {
                keys.push(keyMatch[1]);
            }
        });
        
        console.log(`📝 Found ${keys.length} markdown files`);
        
        // Group by album using clean catalog structure
        const albums = {};
        keys.forEach(key => {
            // Expected: __r2_data_catalog/SKU/metadata.json or similar
            const parts = key.split('/');
            if (parts.length >= 3) {
                const sku = parts[1]; // SKU folder name
                const fileName = parts[parts.length - 1];
                
                // Parse SKU for album info (you can customize this)
                const albumName = sku.replace(/_/g, ' ').replace(/^\d+\s*/, '');
                
                if (!albums[sku]) {
                    albums[sku] = {
                        album: albumName,
                        project: "Hawk Eye",
                        year: "2020",
                        cover: `https://${R2_CONFIG.accountId}.r2.cloudflarestorage.com/${R2_CONFIG.bucketName}/album_art/${sku}/cover.jpg`,
                        tracks: [],
                        sku: sku
                    };
                }
                
                // Add track info (customize based on your file structure)
                if (fileName.includes('metadata') || fileName.includes('track')) {
                    const trackTitle = fileName.replace(/\.(json|md)$/, '').replace(/_/g, ' ');
                    albums[sku].tracks.push({
                        title: trackTitle,
                        file: `https://${R2_CONFIG.accountId}.r2.cloudflarestorage.com/${R2_CONFIG.bucketName}/audio/${sku}/${trackTitle.toLowerCase().replace(/\s+/g, '_')}.mp3`,
                        lyrics: "Lyrics will be loaded from R2",
                        analysis: "Prophetic analysis from your existing data",
                        r2Key: key,
                        sku: sku
                    });
                }
            }
        });
        
        const catalog = Object.values(albums);
        
        // Write to lyrical-miracles folder
        fs.writeFileSync('./lyrical-miracles/catalog.json', JSON.stringify(catalog, null, 2));
        
        console.log(`🎉 Generated catalog with ${catalog.length} albums`);
        catalog.forEach(album => {
            console.log(`   ${album.album}: ${album.tracks.length} tracks`);
        });
        
    } catch (error) {
        console.error('❌ Failed to generate catalog:', error.message);
        
        // Create sample catalog as fallback
        const sampleCatalog = [{
            album: "Full Disclosure",
            project: "Hawk Eye",
            year: "2020",
            cover: "https://via.placeholder.com/300x300/8b5cf6/ffffff?text=Full+Disclosure",
            tracks: [{
                title: "Swordfish",
                file: `https://${R2_CONFIG.accountId}.r2.cloudflarestorage.com/${R2_CONFIG.bucketName}/audio/swordfish.mp3`,
                lyrics: "Hacking the matrix, blowing the whistle\\nFull disclosure, solving the riddle...",
                analysis: "Prophetic track about exposing truth through technology."
            }]
        }];
        
        fs.writeFileSync('./lyrical-miracles/catalog.json', JSON.stringify(sampleCatalog, null, 2));
        console.log('📝 Created sample catalog.json');
    }
}

generateCatalog();