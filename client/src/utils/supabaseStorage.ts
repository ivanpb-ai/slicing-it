
// File storage utility using server-side API

import { toast } from 'sonner';

export const createBucketIfNotExists = async (): Promise<boolean> => {
  // No longer needed - files are handled server-side
  return true;
};

export const uploadFileToStorage = async (
  file: File | Blob,
  fileName: string
): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append('file', file, fileName);

    const response = await fetch('/api/files/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const fileRecord = await response.json();
    return fileRecord.url;
  } catch (error: any) {
    console.error('Error uploading file:', error);
    toast.error(`Upload failed: ${error.message}`);
    throw error;
  }
};

export const listStoredFiles = async () => {
  try {
    const response = await fetch('/api/files');
    
    if (!response.ok) {
      throw new Error('Failed to fetch files');
    }

    const files = await response.json();
    return files.map((file: any) => ({
      name: file.name,
      url: file.url,
      id: file.id,
      size: file.size,
      contentType: file.contentType,
      uploadedAt: file.uploadedAt,
    }));
  } catch (error: any) {
    console.error('Error fetching files:', error);
    toast.error(`Failed to fetch files: ${error.message}`);
    return [];
  }
};

export const loadGraphFileContent = async (fileUrl: string) => {
  try {
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      throw new Error('Failed to load file');
    }

    const content = await response.text();
    
    // Try to parse as JSON for graph data
    try {
      return JSON.parse(content);
    } catch {
      // If not JSON, return as text
      return { content };
    }
  } catch (error: any) {
    console.error('Error loading file content:', error);
    toast.error(`Failed to load file: ${error.message}`);
    throw error;
  }
};
