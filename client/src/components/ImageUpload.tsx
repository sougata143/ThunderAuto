import { useState, useRef } from 'react'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface ImageUploadProps {
  images: Array<{
    url: string
    isFeatured: boolean
    caption: string
  }>
  onImagesChange: (images: Array<{ url: string; isFeatured: boolean; caption: string }>) => void
}

export default function ImageUpload({ images, onImagesChange }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      await handleFiles(e.target.files)
    }
  }

  const handleFiles = async (files: FileList) => {
    const newImages = [...images]
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          newImages.push({
            url: reader.result as string,
            isFeatured: newImages.length === 0, // First image is featured by default
            caption: ''
          })
          onImagesChange(newImages)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    // If we removed the featured image, make the first image featured
    if (newImages.length > 0 && !newImages.some(img => img.isFeatured)) {
      newImages[0].isFeatured = true
    }
    onImagesChange(newImages)
  }

  const handleSetFeatured = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isFeatured: i === index
    }))
    onImagesChange(newImages)
  }

  const handleCaptionChange = (index: number, caption: string) => {
    const newImages = [...images]
    newImages[index].caption = caption
    onImagesChange(newImages)
  }

  const handleUrlAdd = (url: string) => {
    if (url) {
      const newImages = [...images]
      newImages.push({
        url,
        isFeatured: newImages.length === 0,
        caption: ''
      })
      onImagesChange(newImages)
    }
  }

  return (
    <div className="space-y-4">
      {/* URL Input */}
      <div className="flex gap-2">
        <input
          type="url"
          placeholder="Enter image URL"
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleUrlAdd((e.target as HTMLInputElement).value)
              ;(e.target as HTMLInputElement).value = ''
            }
          }}
        />
        <span className="text-sm text-gray-500">Press Enter to add URL</span>
      </div>

      {/* Drag & Drop Zone */}
      <div
        className={`relative flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors ${
          dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
        <div className="text-center">
          <PlusIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Click to upload or drag and drop images
          </p>
        </div>
      </div>

      {/* Image Preview Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image.url}
              alt={`Preview ${index + 1}`}
              className={`h-40 w-full rounded-lg object-cover ${
                image.isFeatured ? 'ring-2 ring-indigo-500' : ''
              }`}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-lg">
              <div className="flex flex-col items-center space-y-2">
                <button
                  type="button"
                  onClick={() => handleSetFeatured(index)}
                  className="px-2 py-1 text-xs text-white bg-indigo-500 rounded hover:bg-indigo-600"
                >
                  {image.isFeatured ? 'Featured' : 'Set Featured'}
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="p-1 text-white bg-red-500 rounded-full hover:bg-red-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            <input
              type="text"
              value={image.caption}
              onChange={(e) => handleCaptionChange(index, e.target.value)}
              placeholder="Add caption"
              className="absolute bottom-0 left-0 right-0 w-full px-2 py-1 text-sm bg-black bg-opacity-50 text-white placeholder-gray-300 border-none focus:ring-0"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
