import { v2 as cloudinary } from 'cloudinary'
import { Stream } from 'stream'
import * as streamifier from 'streamifier'

// Explicit type definitions for Cloudinary
interface CloudinaryUploadOptions {
  folder: string
  public_id: string
  allowed_formats: string[]
  transformation: Array<{
    width?: number
    height?: number
    crop?: string
    quality?: string
  }>
}

// Use Cloudinary's native types
import { 
  UploadApiResponse, 
  UploadApiErrorResponse, 
  UploadResponseCallback 
} from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export const uploadToCloudinary = (
  stream: Stream,
  options: CloudinaryUploadOptions
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream: UploadResponseCallback = (
      err: UploadApiErrorResponse | null | undefined, 
      result?: UploadApiResponse
    ) => {
      if (err) return reject(err)
      if (!result) return reject(new Error('No upload result'))
      resolve(result)
    }

    const uploadStreamInstance = cloudinary.uploader.upload_stream(
      options,
      uploadStream
    )

    stream.pipe(uploadStreamInstance)
  })
}

export const uploadBufferToCloudinary = (
  buffer: Buffer,
  options: CloudinaryUploadOptions
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream: UploadResponseCallback = (
      err: UploadApiErrorResponse | null | undefined, 
      result?: UploadApiResponse
    ) => {
      if (err) return reject(err)
      if (!result) return reject(new Error('No upload result'))
      resolve(result)
    }

    const uploadStreamInstance = cloudinary.uploader.upload_stream(
      options,
      uploadStream
    )

    streamifier.createReadStream(buffer).pipe(uploadStreamInstance)
  })
}

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId)
}
