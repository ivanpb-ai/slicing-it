import { useCallback } from 'react';
import { Edge, Connection, MarkerType } from '@xyflow/react';

export const useSimpleEdgeManager = (
  edges: Edge[],
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
) => {
  // Simple edge creation with guaranteed visibility and specific handles
  const createEdge = useCallback((sourceId: string, targetId: string, sourceHandle?: string, targetHandle?: string): Edge => {
    const edgeId = `edge-${sourceId}-${targetId}`;
    
    console.log(`useSimpleEdgeManager: Creating edge ${edgeId} with handles: ${sourceHandle} -> ${targetHandle}`);
    
    return {
      id: edgeId,
      source: sourceId,
      target: targetId,
      sourceHandle: sourceHandle || null,
      targetHandle: targetHandle || null,
      type: 'default',
      style: { 
        stroke: '#3b82f6',
        strokeWidth: 3
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#3b82f6'
      }
    };
  }, []);

  // Add edge directly to state with specific handles
  const addEdgeWithHandles = useCallback((sourceId: string, targetId: string, sourceHandle?: string, targetHandle?: string) => {
    const newEdge = createEdge(sourceId, targetId, sourceHandle, targetHandle);
    
    console.log(`useSimpleEdgeManager: Adding edge to state with handles:`, newEdge);
    
    setEdges(prevEdges => {
      // Check if edge already exists
      const exists = prevEdges.some(e => 
        (e.source === sourceId && e.target === targetId) || e.id === newEdge.id
      );
      
      if (exists) {
        console.log(`useSimpleEdgeManager: Edge already exists`);
        return prevEdges;
      }
      
      const updatedEdges = [...prevEdges, newEdge];
      console.log(`useSimpleEdgeManager: Updated edges count: ${updatedEdges.length}`);
      return updatedEdges;
    });
    
    return newEdge;
  }, [createEdge, setEdges]);

  // Add edge directly to state (legacy method)
  const addEdge = useCallback((sourceId: string, targetId: string) => {
    return addEdgeWithHandles(sourceId, targetId, 'bottom-source', 'top-target');
  }, [addEdgeWithHandles]);

  // Handle manual connections
  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) {
      console.error('useSimpleEdgeManager: Invalid connection');
      return;
    }
    
    console.log('useSimpleEdgeManager: Manual connection:', connection);
    addEdgeWithHandles(
      connection.source, 
      connection.target, 
      connection.sourceHandle || 'bottom-source', 
      connection.targetHandle || 'top-target'
    );
  }, [addEdgeWithHandles]);

  return {
    createEdge,
    addEdge,
    addEdgeWithHandles,
    onConnect
  };
};
