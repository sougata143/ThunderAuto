import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import cron from 'node-cron';
import dotenv from 'dotenv';
import { Car } from '../models/Car';

// Load environment variables
dotenv.config();

// Secure configuration loading
const s3Config = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
  bucket: process.env.AWS_S3_BUCKET_NAME || 'thunderauto-images',
  cloudFrontDomain: process.env.AWS_CLOUDFRONT_DOMAIN,
  maxImageUploadSize: parseInt(process.env.MAX_IMAGE_UPLOAD_SIZE || '10485760', 10), // 10MB default
  allowedImageTypes: (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp,image/gif').split(',')
};

// Initialize S3 and CloudFront clients
const s3 = new AWS.S3({
  accessKeyId: s3Config.accessKeyId,
  secretAccessKey: s3Config.secretAccessKey,
  region: s3Config.region
});

export interface ImageUploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxFileSize?: number; // in bytes
}

// Enhanced image validation
const validateImage = (base64Image: string): void => {
  // Check file type
  const base64Prefix = base64Image.match(/^data:(image\/\w+);base64,/);
  if (!base64Prefix) {
    throw new Error('Invalid image format');
  }

  const mimeType = base64Prefix[1];
  if (!s3Config.allowedImageTypes.includes(`image/${mimeType}`)) {
    throw new Error(`Unsupported image type: ${mimeType}`);
  }

  // Remove data URI prefix
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  // Check file size
  if (buffer.byteLength > s3Config.maxImageUploadSize) {
    throw new Error(`Image exceeds maximum file size of ${s3Config.maxImageUploadSize} bytes`);
  }
};

export const uploadImageToS3 = async (
  base64Image: string, 
  prefix: string = 'cars',
  options: ImageUploadOptions = {}
): Promise<string> => {
  // Validate image before processing
  validateImage(base64Image);

  // Remove data URI prefix
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  // Image processing with sharp
  const processedImage = await sharp(buffer)
    .resize({
      width: options.maxWidth || 1920,
      height: options.maxHeight || 1080,
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ 
      quality: options.quality || 80,
      lossless: false,
      nearLossless: true
    })
    .toBuffer();

  // Generate unique filename
  const filename = `${prefix}/${uuidv4()}.webp`;

  // S3 upload parameters
  const uploadParams: AWS.S3.PutObjectRequest = {
    Bucket: s3Config.bucket,
    Key: filename,
    Body: processedImage,
    ContentType: 'image/webp',
    ACL: 'public-read',
    CacheControl: 'public, max-age=31536000, immutable'
  };

  try {
    const uploadResult = await s3.upload(uploadParams).promise();
    
    // Use CloudFront URL if configured
    return s3Config.cloudFrontDomain 
      ? `https://${s3Config.cloudFrontDomain}/${filename}`
      : uploadResult.Location;
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error('Image upload failed');
  }
};

export const deleteImageFromS3 = async (imageUrl: string): Promise<void> => {
  try {
    // Extract key from URL (works with both S3 and CloudFront URLs)
    const parsedUrl = new URL(imageUrl);
    const key = decodeURIComponent(
      s3Config.cloudFrontDomain 
        ? parsedUrl.pathname.substring(1) 
        : parsedUrl.pathname.split(`/${s3Config.bucket}/`)[1]
    );

    const deleteParams: AWS.S3.DeleteObjectRequest = {
      Bucket: s3Config.bucket,
      Key: key
    };

    await s3.deleteObject(deleteParams).promise();
  } catch (error) {
    console.error('S3 Delete Error:', error);
    throw new Error('Image deletion failed');
  }
};

// Background job to clean orphaned images
export const cleanOrphanedImages = async (): Promise<void> => {
  try {
    // List all objects in the S3 bucket
    const s3Objects = await s3.listObjectsV2({ 
      Bucket: s3Config.bucket,
      Prefix: 'cars/' 
    }).promise();

    if (!s3Objects.Contents) return;

    // Fetch all car image URLs from the database
    const cars = await Car.find({}, 'images');
    const validImageUrls = cars.flatMap(car => 
      car.images?.map(img => img.url) || []
    );

    // Find and delete orphaned images
    const orphanedImages = s3Objects.Contents
      .filter(obj => 
        obj.Key && 
        obj.Key.startsWith('cars/') && 
        !validImageUrls.some(url => url.includes(obj.Key || ''))
      );

    for (const orphanedImage of orphanedImages) {
      if (orphanedImage.Key) {
        await s3.deleteObject({
          Bucket: s3Config.bucket,
          Key: orphanedImage.Key
        }).promise();
        console.log(`Deleted orphaned image: ${orphanedImage.Key}`);
      }
    }
  } catch (error) {
    console.error('Orphaned Image Cleanup Error:', error);
  }
};

// Schedule daily cleanup job
cron.schedule('0 0 * * *', () => {
  console.log('Running orphaned image cleanup job');
  cleanOrphanedImages();
});

export const getImageCompressionOptions = (fileSize: number): ImageUploadOptions => {
  // Dynamic compression based on file size
  if (fileSize > 5 * 1024 * 1024) { // > 5MB
    return {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 60,
      maxFileSize: 5 * 1024 * 1024 // 5MB max
    };
  } else if (fileSize > 2 * 1024 * 1024) { // > 2MB
    return {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 75,
      maxFileSize: 2 * 1024 * 1024 // 2MB max
    };
  }
  
  // Default compression
  return {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 85,
    maxFileSize: 10 * 1024 * 1024 // 10MB max
  };
};
