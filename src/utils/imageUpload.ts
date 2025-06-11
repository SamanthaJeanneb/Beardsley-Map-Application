// Utility functions for handling image uploads
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const validateImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 50 * 1024 * 1024; // 50MB - increased from 5MB

  if (!validTypes.includes(file.type)) {
    alert('Please upload only JPEG, PNG, or WebP images.');
    return false;
  }

  if (file.size > maxSize) {
    alert('Image size must be less than 50MB.');
    return false;
  }

  return true;
};

export const resizeImage = (file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      // Only resize if image is larger than maxWidth
      if (width > maxWidth || height > maxWidth) {
        const ratio = Math.min(maxWidth / width, maxWidth / height);
        width = width * ratio;
        height = height * ratio;
      }
      
      canvas.width = width;
      canvas.height = height;

      // Use better image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Use higher quality for larger images
      const finalQuality = file.size > 10 * 1024 * 1024 ? 0.7 : quality;
      resolve(canvas.toDataURL('image/jpeg', finalQuality));
    };

    img.src = URL.createObjectURL(file);
  });
};

// New function to handle very large images with progressive resizing
export const resizeLargeImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;
      
      // For very large images, use more aggressive resizing
      const maxDimension = file.size > 20 * 1024 * 1024 ? 800 : 1200;
      
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = width * ratio;
        height = height * ratio;
      }
      
      canvas.width = width;
      canvas.height = height;

      // Enhanced rendering for better quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Adjust quality based on file size
      let quality = 0.8;
      if (file.size > 30 * 1024 * 1024) quality = 0.6;
      else if (file.size > 20 * 1024 * 1024) quality = 0.7;
      else if (file.size > 10 * 1024 * 1024) quality = 0.75;
      
      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.src = URL.createObjectURL(file);
  });
};