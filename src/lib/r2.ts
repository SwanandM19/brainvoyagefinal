import { S3Client } from '@aws-sdk/client-s3';

// Singleton R2 client — reused across requests
let r2Client: S3Client | null = null;

export function getR2Client(): S3Client {
  if (!r2Client) {
    r2Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT!,
      credentials: {
        accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return r2Client;
}

export const R2_BUCKET  = process.env.R2_BUCKET_NAME!;
export const R2_CDN_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!;

// Build full public CDN URL from R2 key
export function r2PublicUrl(key: string): string {
  return `${R2_CDN_URL.replace(/\/$/, '')}/${key}`;
}
