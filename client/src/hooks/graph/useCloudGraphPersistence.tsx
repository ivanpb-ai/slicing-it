
import React from 'react';
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';
import { GraphPersistenceService } from '@/services/graphPersistenceService';

export const useCloudGraphPersistence = () => {
  // Save graph to cloud storage
  const saveGraphToCloud = async (name: string, nodes: Node[], edges: Edge[]): Promise<string | null> => {
    try {
      return await GraphPersistenceService.saveToCloudStorage(name, nodes, edges);
    } catch (error) {
      console.error('Error saving graph to cloud:', error);
      toast.error('Failed to save graph to cloud');
      return null;
    }
  };
  
  // Get all saved graphs from cloud
  const getCloudGraphs = async (): Promise<Array<{ name: string, url: string }>> => {
    try {
      return await GraphPersistenceService.getCloudGraphs();
    } catch (error) {
      console.error('Error getting cloud graphs:', error);
      toast.error('Failed to get cloud graphs');
      return [];
    }
  };
  
  // Load graph from cloud - adding alternate name for compatibility
  const loadFromCloud = async (fileUrl: string) => {
    try {
      return await GraphPersistenceService.loadFromCloudStorage(fileUrl);
    } catch (error) {
      console.error('Error loading graph from cloud:', error);
      toast.error('Failed to load graph from cloud');
      return null;
    }
  };
  
  // Alias for loadFromCloud - to match expected method name
  const loadGraphFromCloud = async (fileUrl: string) => {
    return loadFromCloud(fileUrl);
  };
  
  // Delete graph from cloud
  const deleteFromCloud = async (fileName: string): Promise<boolean> => {
    try {
      return await GraphPersistenceService.deleteFromCloudStorage(fileName);
    } catch (error) {
      console.error('Error deleting graph from cloud:', error);
      toast.error('Failed to delete graph from cloud');
      return false;
    }
  };
  
  // Alias for getCloudGraphs - to match expected method name
  const getCloudFiles = async () => {
    return getCloudGraphs();
  };
  
  return {
    saveGraphToCloud,
    getCloudGraphs,
    loadFromCloud,
    deleteFromCloud,
    // Adding aliases to match expected method names
    loadGraphFromCloud,
    getCloudFiles
  };
};
