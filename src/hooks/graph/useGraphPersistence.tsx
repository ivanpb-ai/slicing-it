
import React from 'react';
import { Node, Edge } from '@xyflow/react';
import { useGraphOperations } from './useGraphOperations';

// Main hook that coordinates graph persistence functionality
export const useGraphPersistence = (
  nodes?: Node[],
  edges?: Edge[],
  setNodes?: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges?: React.Dispatch<React.SetStateAction<Edge[]>>
) => {
  // Use the graph operations hook to handle all operations
  const operations = useGraphOperations(nodes, edges, setNodes, setEdges);
  
  // Return all operations from the hook
  return operations;
};
