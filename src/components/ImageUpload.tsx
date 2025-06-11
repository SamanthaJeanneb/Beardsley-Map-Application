import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import { validateImageFile, resizeLargeImage } from '../utils/imageUpload';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  images, 
  onImagesChange, 
  maxImages = 10 
}) => {
  const [uploading, setUploading] = useState(false);
  const [processingCount, setProcessingCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList) => {
    if (images.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    setProcessingCount(files.length);
    const newImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (validateImageFile(file)) {
        try {
          // Use the enhanced resizing function for large images
          const resizedImage = await resizeLargeImage(file);
          newImages.push(resizedImage);
          setProcessingCount(prev => prev - 1);
        } catch (error) {
          console.error('Error processing image:', error);
          setProcessingCount(prev => prev - 1);
        }
      } else {
        setProcessingCount(prev => prev - 1);
      }
    }

    onImagesChange([...images, ...newImages]);
    setUploading(false);
    setProcessingCount(0);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <div className="space-y-2">
          {uploading ? (
            <Loader className="h-8 w-8 text-[#6d0020] mx-auto animate-spin" />
          ) : (
            <Upload className="h-8 w-8 text-gray-400 mx-auto" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">
              {uploading ? `Processing ${processingCount} image(s)...` : 'Upload project images'}
            </p>
            <p className="text-xs text-gray-500">
              Drag and drop or click to select • JPEG, PNG, WebP • Up to 50MB each
            </p>
            {uploading && (
              <p className="text-xs text-[#6d0020] mt-1">
                Large images are automatically resized for optimal performance
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          
          {/* Add more button */}
          {images.length < maxImages && !uploading && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center transition-colors"
            >
              <div className="text-center">
                <ImageIcon className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                <span className="text-xs text-gray-500">Add More</span>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;