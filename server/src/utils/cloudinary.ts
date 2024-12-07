import { v2 as cloudinary } from 'cloudinary'
import { Stream } from 'stream'
import streamifier from 'streamifier'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export const uploadToCloudinary = (
  stream: Stream,
  options: {
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
): Promise<{ secure_url: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error)
        resolve(result!)
      }
    )

    stream.pipe(uploadStream)
  })
}

export const uploadBufferToCloudinary = (
  buffer: Buffer,
  options: {
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
): Promise<{ secure_url: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error)
        resolve(result!)
      }
    )

    streamifier.createReadStream(buffer).pipe(uploadStream)
  })
}

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId)
}
