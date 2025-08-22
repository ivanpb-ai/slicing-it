
import { useCallback, useState, useRef } from 'react';
import { Node, Edge, useReactFlow } from '@xyflow/react';
import { toast } from 'sonner';
import { useGraphPersistence } from './graph/useGraphPersistence';
import { useFileOperations } from './flow/useFileOperations';
import { SavedGraph } from './types';
import type { GraphData } from '@/services/storage/GraphLocalStorageService';

export const useSaveLoadGraph = (
  nodes: Node[],
  edges: Edge[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
  isLoading?: boolean,
  setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Get the react flow instance
  const reactFlowInstance = useReactFlow();
  
  // Use a ref to track loading state internally
  const isLoadingRef = useRef(false);
  
  // Use our refactored hooks for graph persistence and file operations
  const { 
    saveGraph,
    loadGraph,
    getSavedGraphs,
    deleteGraph,
    exportGraph,
    importGraph
  } = useGraphPersistence(nodes, edges, setNodes, setEdges);
  
  // Create a consistent function signature for loading a graph by name
  const handleLoadGraphFromStorage = useCallback((name: string): boolean => {
    // Implement loading graph from storage by name
    console.log(`Loading graph from storage: ${name}`);
    return loadGraph(name);
  }, [loadGraph]);

  return {
    saveGraph,
    loadGraph,
    deleteGraph,
    getSavedGraphs,
    exportGraph,
    importGraph,
    isLoadingRef,
    handleLoadGraphFromStorage
  };
};
