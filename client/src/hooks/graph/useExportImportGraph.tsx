
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
    // Add debugging to see what nodes we have
    console.log('🔍 Export Debug: nodes =', nodes?.length || 0, 'edges =', edges?.length || 0);
    
    if (!nodes || nodes.length === 0) {
      console.warn('Export: No nodes found in state');
      // Try to get nodes from global debug state as fallback
      try {
        // @ts-ignore - This is for debugging only
        const debugNodes = window.__DEBUG_NODE_EDITOR_NODES;
        if (debugNodes && debugNodes.length > 0) {
          console.log('Export: Found', debugNodes.length, 'nodes in global debug state');
          const exportedData = GraphPersistenceService.exportGraphToFile(name, debugNodes, edges || []);
          if (exportedData) {
            toast.success('Graph exported successfully');
            return exportedData;
          }
        }
      } catch (e) {
        console.error('Export: Failed to access debug nodes:', e);
      }
      
      toast.warning('Cannot export an empty graph - no nodes found');
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
      const graphData = await GraphPersistenceService.importGraphFromFile(file);
      
      if (!graphData) {
        toast.error('Failed to import graph');
        return null;
      }
      
      console.log(`useExportImportGraph: Successfully imported graph with ${graphData.nodes?.length || 0} nodes and ${graphData.edges?.length || 0} edges`);
      toast.success('Graph imported successfully');
      return graphData;
    } catch (error) {
      console.error('Error importing graph:', error);
      toast.error('Failed to import graph');
      return null;
    }
  };
  
  return {
    exportGraph,
    importGraph
  };
};
