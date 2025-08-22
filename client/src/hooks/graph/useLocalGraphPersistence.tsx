
import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';
import { GraphLocalStorageService, GraphData } from '@/services/storage/GraphLocalStorageService';
import { SavedGraph } from '@/hooks/types';

export const useLocalGraphPersistence = (
  nodes?: Node[],
  edges?: Edge[]
) => {
  // Save a graph to local storage
  const saveGraph = useCallback((name: string): boolean => {
    try {
      console.log(`useLocalGraphPersistence: Saving graph "${name}" with ${nodes?.length || 0} nodes and ${edges?.length || 0} edges`);
      
      if (!nodes || nodes.length === 0) {
        toast.warning('Cannot save an empty graph');
        return false;
      }
      
      if (nodes && nodes.length > 0) {
        console.log('useLocalGraphPersistence: Sample node before storage:', JSON.stringify(nodes[0]));
      }
      
      const result = GraphLocalStorageService.saveToLocalStorage(name, nodes || [], edges || []);
      
      if (result) {
        toast.success(`Graph "${name}" saved successfully`);
        return true;
      } else {
        toast.error(`Failed to save graph "${name}"`);
        return false;
      }
    } catch (error) {
      console.error('Error in saveGraph:', error);
      toast.error('Failed to save graph');
      return false;
    }
  }, [nodes, edges]);
  
  // Load a graph from local storage
  const loadGraph = useCallback((name: string): GraphData | null => {
    try {
      console.log(`useLocalGraphPersistence: Loading graph "${name}"`);
      
      const graphData = GraphLocalStorageService.loadFromLocalStorage(name);
      
      if (!graphData) {
        console.error(`Graph "${name}" not found or invalid`);
        return null;
      }
      
      console.log(`useLocalGraphPersistence: Loaded graph "${name}" with ${graphData.nodes?.length || 0} nodes and ${graphData.edges?.length || 0} edges`);
      
      return graphData;
    } catch (error) {
      console.error('Error in loadGraph:', error);
      toast.error('Failed to load graph');
      return null;
    }
  }, []);
  
  // Delete a graph from local storage
  const deleteGraph = useCallback((name: string): boolean => {
    try {
      console.log(`useLocalGraphPersistence: Deleting graph "${name}"`);
      
      const result = GraphLocalStorageService.deleteFromLocalStorage(name);
      
      if (result) {
        toast.success(`Graph "${name}" deleted successfully`);
        return true;
      } else {
        toast.error(`Failed to delete graph "${name}"`);
        return false;
      }
    } catch (error) {
      console.error('Error in deleteGraph:', error);
      toast.error('Failed to delete graph');
      return false;
    }
  }, []);
  
  // Get all saved graphs from local storage
  const getSavedGraphs = useCallback((): SavedGraph[] => {
    try {
      const savedGraphs = GraphLocalStorageService.getLocalGraphs();
      console.log(`useLocalGraphPersistence: Retrieved ${savedGraphs.length} saved graphs`);
      return savedGraphs;
    } catch (error) {
      console.error('Error in getSavedGraphs:', error);
      return [];
    }
  }, []);
  
  return {
    saveGraph,
    loadGraph,
    deleteGraph,
    getSavedGraphs
  };
};
