
import { useCallback } from 'react';
import { Edge, MarkerType } from '@xyflow/react';

export const useNodeEdgeCreation = (
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
) => {
  const createEdgeBetweenNodes = useCallback(
    (sourceId: string, targetId: string) => {
      console.log(`Creating edge from ${sourceId} to ${targetId}`);
      
      const edgeId = `e-${sourceId}-${targetId}`;
      
      const newEdge: Edge = {
        id: edgeId,
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
          color: '#2563eb', // Blue color
          width: 12,
          height: 12
        }
      };
      
      setEdges(prevEdges => {
        // Check if edge already exists
        const edgeExists = prevEdges.some(e => e.id === edgeId);
        if (edgeExists) {
          console.log(`Edge ${edgeId} already exists`);
          return prevEdges;
        }
        
        console.log(`Adding edge: ${edgeId} with style:`, newEdge.style);
        const updatedEdges = [...prevEdges, newEdge];
        console.log(`Total edges after addition: ${updatedEdges.length}`);
        return updatedEdges;
      });
      
      return newEdge;
    },
    [setEdges]
  );

  return { createEdgeBetweenNodes };
};
