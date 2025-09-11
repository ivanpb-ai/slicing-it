import { Node, Edge } from '@xyflow/react';
import { useUnifiedEdgeManager } from '../edge/useUnifiedEdgeManager';

/**
 * Simplified hook for creating edges between nodes with consistent visibility
 * Now uses the unified edge manager to prevent duplicates
 */
export const useNodeEdgeCreation = (
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
  nodes?: Node[]
) => {
  const { addEdge } = useUnifiedEdgeManager(setEdges, nodes);
  
  const createEdgeBetweenNodes = (sourceId: string, targetId: string) => {
    console.log(`useNodeEdgeCreation: Creating edge from ${sourceId} to ${targetId}`);
    return addEdge(sourceId, targetId);
  };

  return {
    createEdgeBetweenNodes
  };
};
