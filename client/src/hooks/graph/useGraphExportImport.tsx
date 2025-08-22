
import React from 'react';
import { Node, Edge } from '@xyflow/react';
import { toast } from '@/components/ui/use-toast';
import { GraphPersistenceService } from '@/services/graphPersistenceService';
import type { GraphData } from '@/services/storage/GraphLocalStorageService';

// Export the hook with the name matching what's imported in useGraphOperations.tsx
export const useExportImportGraph = (nodes?: Node[], edges?: Edge[]) => {
  // Export graph to file
  const exportGraph = (name?: string): string | null => {
    return GraphPersistenceService.exportGraphToFile(name, nodes || [], edges || []);
  };
  
  // Import graph from file
  const importGraph = async (file: File): Promise<GraphData | null> => {
    return GraphPersistenceService.importGraphFromFile(file);
  };
  
  return {
    exportGraph,
    importGraph
  };
};
