import { useCallback } from 'react';
import { Edge, MarkerType } from '@xyflow/react';

export const useEdgeCreation = (setEdges: React.Dispatch<React.SetStateAction<Edge[]>>) => {
  const addEdgeWithHandles = useCallback((
    sourceId: string,
    targetId: string,
    sourceHandle: string = 'bottom-source',
    targetHandle: string = 'top-target'
  ) => {
    const edgeId = `${sourceId}-${targetId}`;
    
    const newEdge: Edge = {
      id: edgeId,
      source: sourceId,
      target: targetId,
      sourceHandle,
      targetHandle,
      type: 'default',
      animated: false,
      style: { 
        stroke: '#2563eb',
        strokeWidth: 3,
        opacity: 1
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#2563eb',
        width: 12,
        height: 12
      }
    };

    setEdges(prevEdges => [...prevEdges, newEdge]);
  }, [setEdges]);

  return { addEdgeWithHandles };
};
