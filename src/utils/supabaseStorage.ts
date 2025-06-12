
// This file is now just a proxy to our GraphPersistenceService

import { GraphPersistenceService } from '@/services/graphPersistenceService';
import { toast } from 'sonner';

// Re-export functions from our GraphPersistenceService
export const createBucketIfNotExists = async (): Promise<boolean> => {
  return GraphPersistenceService.ensureStorageBucketExists();
};

export const uploadFileToStorage = async (
  file: File | Blob,
  fileName: string
): Promise<string | null> => {
  try {
    // For file uploads, we need to create a temporary wrapper since our service expects nodes and edges
    // We'll read the file content, parse it if JSON, and then save it
    
    if (file.type === 'application/json') {
      // Try to parse JSON file to extract nodes and edges
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        return GraphPersistenceService.saveToCloudStorage(
          fileName.replace(/\.json$/, ''), 
          data.nodes || [], 
          data.edges || []
        );
      } catch (error) {
        console.error('Error parsing JSON file:', error);
      }
    }
    
    // If we can't parse or it's not JSON, use a different approach
    // Create a bucket first
    await GraphPersistenceService.ensureStorageBucketExists();
    
    // Then use supabase client directly from within the service
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from('files')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('Supabase upload error:', error);
      if (error.message.includes('JWT') || error.message.includes('fetch')) {
        toast.error('Authentication required for uploading files');
      } else {
        toast.error(`Upload failed: ${error.message}`);
      }
      throw error;
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('files')
      .getPublicUrl(fileName);
    
    return publicUrl;
  } catch (error: any) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const listStoredFiles = async () => {
  return GraphPersistenceService.getCloudGraphs();
};

export const loadGraphFileContent = async (fileUrl: string) => {
  const graphData = await GraphPersistenceService.loadFromCloudStorage(fileUrl);
  return graphData;
};
