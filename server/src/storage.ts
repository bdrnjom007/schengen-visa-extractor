import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = process.env.S3_ENDPOINT ? new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
}) : null;

export async function storagePut(key: string, buffer: Buffer, contentType: string) {
  if (!s3Client || !process.env.S3_BUCKET) {
    // Fallback: return a data URL
    const base64 = buffer.toString('base64');
    return {
      url: `data:${contentType};base64,${base64}`,
      key,
    };
  }

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  const url = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${key}`;
  return { url, key };
}
