"use client"

import { useState, useCallback } from "react"
import { Upload, X, Image as ImageIcon, Trash2, RotateCcw } from "lucide-react"
import { useDropzone } from "react-dropzone"

interface VehiclePhoto {
  id: string
  url: string
  alt: string
  isPrimary: boolean
  order: number
}

interface VehiclePhotoManagerProps {
  vehicleId: string
  photos: VehiclePhoto[]
  onPhotosChange: (photos: VehiclePhoto[]) => void
  maxPhotos?: number
}

export default function VehiclePhotoManager({ 
  vehicleId, 
  photos, 
  onPhotosChange, 
  maxPhotos = 10 
}: VehiclePhotoManagerProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (photos.length + acceptedFiles.length > maxPhotos) {
      alert(`Maximum ${maxPhotos} photos allowed`)
      return
    }

    setUploading(true)
    try {
      // Simulate file upload - replace with actual Supabase storage upload
      const newPhotos: VehiclePhoto[] = acceptedFiles.map((file, index) => ({
        id: `temp-${Date.now()}-${index}`,
        url: URL.createObjectURL(file),
        alt: file.name,
        isPrimary: photos.length === 0 && index === 0,
        order: photos.length + index
      }))

      onPhotosChange([...photos, ...newPhotos])
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [photos, maxPhotos, onPhotosChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true
  })

  const removePhoto = (photoId: string) => {
    const updatedPhotos = photos.filter(p => p.id !== photoId)
    // If removing primary photo, make first remaining photo primary
    if (photos.find(p => p.id === photoId)?.isPrimary && updatedPhotos.length > 0) {
      updatedPhotos[0].isPrimary = true
    }
    onPhotosChange(updatedPhotos)
  }

  const setPrimaryPhoto = (photoId: string) => {
    const updatedPhotos = photos.map(p => ({
      ...p,
      isPrimary: p.id === photoId
    }))
    onPhotosChange(updatedPhotos)
  }

  const reorderPhotos = (fromIndex: number, toIndex: number) => {
    const updatedPhotos = [...photos]
    const [movedPhoto] = updatedPhotos.splice(fromIndex, 1)
    updatedPhotos.splice(toIndex, 0, movedPhoto)
    // Update order numbers
    updatedPhotos.forEach((photo, index) => {
      photo.order = index
    })
    onPhotosChange(updatedPhotos)
  }

  const rotatePhoto = (photoId: string) => {
    // Simulate rotation - in real app, you'd rotate the actual image
    console.log('Rotating photo:', photoId)
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive || dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            {isDragActive 
              ? 'Drop the files here...' 
              : 'Drag & drop photos here, or click to select files'
            }
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG, WEBP up to 5MB. Max {maxPhotos} photos.
          </p>
        </div>
        {uploading && (
          <div className="mt-2 text-sm text-blue-600">
            Uploading...
          </div>
        )}
      </div>

      {/* Photos Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <div key={photo.id} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={photo.url}
                  alt={photo.alt}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                    <button
                      onClick={() => setPrimaryPhoto(photo.id)}
                      className={`p-2 rounded-full ${
                        photo.isPrimary 
                          ? 'bg-green-500 text-white' 
                          : 'bg-white text-gray-700 hover:bg-green-500 hover:text-white'
                      } transition-colors`}
                      title={photo.isPrimary ? 'Primary Photo' : 'Set as Primary'}
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => rotatePhoto(photo.id)}
                      className="p-2 rounded-full bg-white text-gray-700 hover:bg-blue-500 hover:text-white transition-colors"
                      title="Rotate Photo"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="p-2 rounded-full bg-white text-gray-700 hover:bg-red-500 hover:text-white transition-colors"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Primary Badge */}
                {photo.isPrimary && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Primary
                  </div>
                )}

                {/* Order Number */}
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                  {photo.order + 1}
                </div>
              </div>

              {/* Drag Handle */}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full cursor-move">
                ⋮⋮
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Count */}
      <div className="text-sm text-gray-600 text-center">
        {photos.length} of {maxPhotos} photos uploaded
      </div>

      {/* Reorder Instructions */}
      {photos.length > 1 && (
        <div className="text-xs text-gray-500 text-center">
          Drag photos to reorder. First photo will be the primary image.
        </div>
      )}
    </div>
  )
}
