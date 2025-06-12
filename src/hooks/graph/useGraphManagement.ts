
import { useCallback } from 'react';
import { toast } from 'sonner';
import { SavedGraph } from '../types';

export const useGraphManagement = () => {
  // Get all saved graphs
  const getSavedGraphs = useCallback((): SavedGraph[] => {
    try {
      const savedGraphsStr = localStorage.getItem('savedGraphs');
      
      if (!savedGraphsStr) {
        console.log('No saved graphs found in localStorage');
        return [];
      }
      
      let savedGraphs;
      try {
        savedGraphs = JSON.parse(savedGraphsStr);
      } catch (parseError) {
        console.error('Failed to parse savedGraphs:', parseError);
        return [];
      }
      
      if (typeof savedGraphs !== 'object' || savedGraphs === null) {
        console.error('Invalid savedGraphs format:', savedGraphs);
        return [];
      }
      
      // Convert the object to an array of SavedGraph objects
      const graphsArray = Object.entries(savedGraphs).map(([name, data]: [string, any]) => ({
        id: name, // Use name as the id
        name,
        createdAt: data.timestamp || Date.now(),
        nodes: data.nodes || [],
        edges: data.edges || []
      }));
      
      console.log(`Retrieved ${graphsArray.length} graphs from localStorage`);
      return graphsArray;
    } catch (error) {
      console.error('Error retrieving saved graphs:', error);
      toast.error('Failed to retrieve saved graphs');
      return [] as SavedGraph[];
    }
  }, []);

  // Delete a saved graph
  const deleteGraph = useCallback((graphName: string): boolean => {
    try {
      const savedGraphsStr = localStorage.getItem('savedGraphs');
      if (!savedGraphsStr) {
        toast.error('No saved graphs found');
        return false;
      }
      
      const savedGraphs = JSON.parse(savedGraphsStr);
      if (savedGraphs[graphName]) {
        delete savedGraphs[graphName];
        localStorage.setItem('savedGraphs', JSON.stringify(savedGraphs));
        toast.success(`Graph "${graphName}" deleted successfully`);
        return true;
      }
      toast.error(`Graph "${graphName}" not found`);
      return false;
    } catch (error) {
      console.error('Error deleting graph:', error);
      toast.error('Failed to delete graph');
      return false;
    }
  }, []);

  return {
    getSavedGraphs,
    deleteGraph,
  };
};
