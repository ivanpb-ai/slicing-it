
import React, { useCallback } from 'react';
import { toast } from 'sonner';
import type { GraphData } from '@/services/storage/GraphLocalStorageService';

/**
 * Component for handling graph persistence operations
 */
const GraphPersistenceHandler = ({
  saveGraph,
  loadGraph,
  deleteGraph,
  exportGraph,
  getSavedGraphs
}) => {
  // Handler for saving graphs
  const handleSave = useCallback(() => {
    const name = window.prompt('Enter a name for the graph:');
    if (!name || name.trim() === '') {
      toast.error('Please enter a valid graph name');
      return false;
    }
    return saveGraph(name);
  }, [saveGraph]);

  // Handler for loading graphs with improved error handling
  const handleLoad = useCallback(() => {
    try {
      // Get all saved graphs
      const savedGraphs = getSavedGraphs();
      
      console.log('GraphPersistenceHandler: Retrieved saved graphs:', savedGraphs.length);
      
      if (!savedGraphs || savedGraphs.length === 0) {
        toast.error('No saved graphs found', {
          description: 'Create and save a graph first'
        });
        return false;
      }
    
      // Handle different data structures that might be returned by getSavedGraphs
      const graphNames = savedGraphs.map(g => g.name).join(', ');
      
      // Prompt user for graph name
      const name = window.prompt(`Enter the name of the graph to load.\nAvailable graphs: ${graphNames}`);
      
      if (!name || name.trim() === '') {
        toast.info('Load cancelled');
        return false;
      }
      
      // Check if the graph exists
      const graphExists = savedGraphs.some(g => g.name === name);
      
      if (!graphExists) {
        toast.error(`Graph "${name}" not found`, {
          description: `Available graphs: ${graphNames}`
        });
        return false;
      }
      
      // Load the graph
      const success = loadGraph(name);
      
      if (!success) {
        toast.error(`Failed to load graph "${name}"`);
      }
      
      return success;
    } catch (error) {
      console.error('Error in handleLoad:', error);
      toast.error('Failed to load graph');
      return false;
    }
  }, [loadGraph, getSavedGraphs]);

  // Handler for exporting graphs
  const handleExport = useCallback(() => {
    const name = window.prompt('Enter a name for the exported file (optional):');
    return exportGraph(name || undefined);
  }, [exportGraph]);

  return {
    handleSave,
    handleLoad,
    handleExport,
    deleteGraph,
    getSavedGraphs
  };
};

export default GraphPersistenceHandler;

