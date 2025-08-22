
import { useState } from 'react';
import { Node, Edge } from '@xyflow/react';
import { GraphPersistenceService } from '@/services/graphPersistenceService';

export const useCloudStorage = (
  nodes?: Node[], 
  edges?: Edge[]
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<Array<{ name: string, url: string }>>([]);

  // Save current graph to cloud storage
  const saveToCloud = async (graphName: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!nodes || nodes.length === 0) {
        throw new Error('No nodes to save');
      }
      
      const result = await GraphPersistenceService.saveToCloudStorage(graphName, nodes, edges || []);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error saving to cloud');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Load graph from cloud storage
  const loadFromCloud = async (fileUrl: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await GraphPersistenceService.loadFromCloudStorage(fileUrl);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error loading from cloud');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all files from cloud storage
  const fetchCloudFiles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await GraphPersistenceService.getCloudGraphs();
      setFiles(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error fetching cloud files');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveToCloud,
    loadFromCloud,
    fetchCloudFiles,
    files,
    isLoading,
    error
  };
};
