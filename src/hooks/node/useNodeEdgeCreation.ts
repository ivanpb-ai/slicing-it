
import { useCallback } from 'react';
import { Edge, MarkerType } from '@xyflow/react';

/**
 * Simplified hook for creating edges between nodes with consistent visibility
 */
export const useNodeEdgeCreation = (
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
) => {
  const createEdgeBetweenNodes = useCallback(
    (sourceId: string, targetId: string) => {
      console.log(`Creating edge from ${sourceId} to ${targetId}`);
      
      const newEdge: Edge = {
        id: `e-${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        type: 'default',
        animated: false,
        style: { 
          stroke: '#2563eb', // Blue color
          strokeWidth: 3,
          opacity: 1
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 12,
          height: 12,
          color: '#2563eb', // Blue color
        },
      };
      
      setEdges(prevEdges => {
        const edgeExists = prevEdges.some(e => e.id === newEdge.id);
        if (edgeExists) {
          console.log(`Edge ${newEdge.id} already exists`);
          return prevEdges;
        }
        
        console.log(`Added edge: ${newEdge.id} with style:`, newEdge.style);
        const updatedEdges = [...prevEdges, newEdge];
        console.log(`Total edges after addition: ${updatedEdges.length}`);
        return updatedEdges;
      });
      
      return newEdge;
    },
    [setEdges]
  );

  return {
    createEdgeBetweenNodes
  };
};
