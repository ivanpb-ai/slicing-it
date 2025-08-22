
import { useCallback } from 'react';
import { Connection, Edge, MarkerType } from '@xyflow/react';

export const useConnectionHandling = (
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
) => {
  const onConnect = useCallback(
    (connection: Connection) => {
      console.log('Creating manual connection:', connection);
      
      if (!connection.source || !connection.target) {
        console.error('Invalid connection - missing source or target');
        return;
      }
      
      const newEdge: Edge = {
        id: `e-${connection.source}-${connection.target}`,
        source: connection.source,
        target: connection.target,
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
      
      console.log('Adding new manual edge with style:', newEdge.style);
      setEdges(prevEdges => {
        // Check if edge already exists
        const edgeExists = prevEdges.some(e => 
          (e.source === connection.source && e.target === connection.target) ||
          e.id === newEdge.id
        );
        
        if (edgeExists) {
          console.log('Edge already exists, not adding duplicate');
          return prevEdges;
        }
        
        const updatedEdges = [...prevEdges, newEdge];
        console.log(`Added manual edge, total edges: ${updatedEdges.length}`);
        return updatedEdges;
      });
    },
    [setEdges]
  );

  return { onConnect };
};
