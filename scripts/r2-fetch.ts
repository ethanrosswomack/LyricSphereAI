import { createHmac } from 'crypto';

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

function createSignature(
  secretKey: string,
  dateStamp: string,
  region: string,
  service: string,
  stringToSign: string
): string {
  const kDate = createHmac('sha256', `AWS4${secretKey}`).update(dateStamp).digest();
  const kRegion = createHmac('sha256', kDate).update(region).digest();
  const kService = createHmac('sha256', kRegion).update(service).digest();
  const kSigning = createHmac('sha256', kService).update('aws4_request').digest();
  return createHmac('sha256', kSigning).update(stringToSign).digest('hex');
}

export async function fetchFromR2(
  config: R2Config,
  objectKey: string
): Promise<string> {
  const { accountId, accessKeyId, secretAccessKey, bucketName } = config;
  
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  const url = `${endpoint}/${bucketName}/${objectKey}`;
  const host = `${accountId}.r2.cloudflarestorage.com`;
  
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);
  
  const region = 'auto';
  const service = 's3';
  
  // Create canonical request
  const method = 'GET';
  const canonicalUri = `/${bucketName}/${objectKey}`;
  const canonicalQuerystring = '';
  const canonicalHeaders = `host:${host}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'host;x-amz-date';
  const payloadHash = 'UNSIGNED-PAYLOAD';
  
  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQuerystring,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');
  
  // Create string to sign
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const canonicalRequestHash = createHmac('sha256', canonicalRequest).digest('hex');
  
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    canonicalRequestHash
  ].join('\n');
  
  // Calculate signature
  const signature = createSignature(secretAccessKey, dateStamp, region, service, stringToSign);
  
  // Create authorization header
  const authorizationHeader = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  
  // Make request
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Host': host,
      'x-amz-date': amzDate,
      'Authorization': authorizationHeader
    }
  });
  
  if (!response.ok) {
    throw new Error(`R2 fetch failed: ${response.status} ${response.statusText}`);
  }
  
  return await response.text();
}
