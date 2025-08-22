
import React from 'react';
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';
import { GraphPersistenceService } from '@/services/graphPersistenceService';
import type { GraphData } from '@/services/storage/GraphLocalStorageService';

export const useExportImportGraph = (
  nodes?: Node[],
  edges?: Edge[]
) => {
  // Export graph to file
  const exportGraph = (name?: string): string | null => {
    if (!nodes || nodes.length === 0) {
      toast.error('Cannot export an empty graph');
      return null;
    }
    
    try {
      const exportedData = GraphPersistenceService.exportGraphToFile(name, nodes, edges || []);
      
      if (!exportedData) {
        toast.error('Failed to export graph');
        return null;
      }
      
      toast.success('Graph exported successfully');
      return exportedData;
    } catch (error) {
      console.error('Error exporting graph:', error);
      toast.error('Failed to export graph');
      return null;
    }
  };
  
  // Import graph from file
  const importGraph = async (file: File): Promise<GraphData | null> => {
    if (!file) {
      toast.error('No file selected');
      return null;
    }
    
    try {
      console.log(`useExportImportGraph: Importing file ${file.name}, size: ${file.size} bytes`);
      
      // Show loading toast to indicate import is in progress
      toast.loading('Importing graph...', { id: 'graph-import', duration: 3000 });
      
      const graphData = await GraphPersistenceService.importGraphFromFile(file);
      
      if (!graphData) {
        toast.error('Failed to import graph', { id: 'graph-import' });
        return null;
      }
      
      console.log(`useExportImportGraph: Successfully imported graph with ${graphData.nodes?.length || 0} nodes and ${graphData.edges?.length || 0} edges`);
      
      // Ensure graphData is properly structured with default values if needed
      if (!graphData.edges) graphData.edges = [];
      if (!graphData.nodes) {
        toast.error('Invalid graph file: No nodes found', { id: 'graph-import' });
        return null;
      }
      
      // Add timestamps to help with debugging rendering issues
      console.log(`Import process completed at ${new Date().toISOString()}`);
      
      // Dispatch events to ensure visibility
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('force-node-visibility'));
        toast.success('Graph imported successfully', { id: 'graph-import' });
      }, 300);
      
      // Trigger multiple visibility checks to ensure rendering
      for (let i = 1; i <= 3; i++) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('force-node-visibility'));
        }, i * 300);
      }
      
      return graphData;
    } catch (error) {
      console.error('Error importing graph:', error);
      toast.error('Failed to import graph', { id: 'graph-import' });
      return null;
    }
  };
  
  return {
    exportGraph,
    importGraph
  };
};
