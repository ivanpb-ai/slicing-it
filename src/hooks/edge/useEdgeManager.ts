
import { useCallback } from 'react';
import { Edge, Connection, MarkerType } from '@xyflow/react';

export const useEdgeManager = (
  edges: Edge[],
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
) => {
  // Create a simple, visible edge with standard ReactFlow styling
  const createEdge = useCallback(
    (sourceId: string, targetId: string, sourceHandle?: string, targetHandle?: string): Edge => {
      const edgeId = `e-${sourceId}-${targetId}`;
      
      console.log(`useEdgeManager: Creating edge ${edgeId}`);
      
      const newEdge: Edge = {
        id: edgeId,
        source: sourceId,
        target: targetId,
        sourceHandle: sourceHandle || null,
        targetHandle: targetHandle || null,
        type: 'smoothstep',
        animated: false,
        style: { 
          stroke: '#2563eb',
          strokeWidth: 2
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#2563eb'
        }
      };
      
      console.log('useEdgeManager: Created edge:', newEdge);
      return newEdge;
    },
    []
  );

  // Add an edge to the state
  const addEdge = useCallback(
    (sourceId: string, targetId: string, sourceHandle?: string, targetHandle?: string) => {
      const newEdge = createEdge(sourceId, targetId, sourceHandle, targetHandle);
      
      console.log(`useEdgeManager: Adding edge ${newEdge.id} to state`);
      
      setEdges(prevEdges => {
        const edgeExists = prevEdges.some(e => e.id === newEdge.id);
        if (edgeExists) {
          console.log(`useEdgeManager: Edge ${newEdge.id} already exists`);
          return prevEdges;
        }
        
        const updatedEdges = [...prevEdges, newEdge];
        console.log(`useEdgeManager: Total edges after addition: ${updatedEdges.length}`, updatedEdges);
        return updatedEdges;
      });
      
      return newEdge;
    },
    [createEdge, setEdges]
  );

  // Handle manual connections (when user drags between handles)
  const handleConnection = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) {
        console.error('useEdgeManager: Invalid connection - missing source or target');
        return;
      }
      
      console.log('useEdgeManager: Manual connection:', connection);
      addEdge(
        connection.source, 
        connection.target, 
        connection.sourceHandle || undefined, 
        connection.targetHandle || undefined
      );
    },
    [addEdge]
  );

  return {
    createEdge,
    addEdge,
    handleConnection
  };
};
