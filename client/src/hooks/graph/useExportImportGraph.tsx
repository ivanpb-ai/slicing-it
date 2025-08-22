
import React from 'react';
import { Node, Edge } from '@xyflow/react';
import { toast } from '@/components/ui/use-toast';
import { GraphPersistenceService } from '@/services/graphPersistenceService';
import type { GraphData } from '@/services/storage/GraphLocalStorageService';

export const useExportImportGraph = (
  nodes?: Node[],
  edges?: Edge[]
) => {
  // Export graph to file
  const exportGraph = (name?: string): string | null => {
    if (!nodes || nodes.length === 0) {
      toast.warning('Cannot export an empty graph');
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
