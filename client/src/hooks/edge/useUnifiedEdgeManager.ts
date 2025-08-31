import { useCallback } from 'react';
import { Edge, Connection, MarkerType } from '@xyflow/react';

/**
 * Unified edge manager to prevent duplicate edge creation from multiple managers
 * This replaces useEdgeCreation, useEdgeManager, and useSimpleEdgeManager
 */
export const useUnifiedEdgeManager = (setEdges: React.Dispatch<React.SetStateAction<Edge[]>>) => {
  const createEdge = useCallback((
    sourceId: string,
    targetId: string,
    sourceHandle?: string,
    targetHandle?: string
  ): Edge => {
    // Use a standardized unique ID format
    const edgeId = `unified-${sourceId}-${targetId}`;
    
    console.log(`UnifiedEdgeManager: Creating edge ${edgeId}`);
    
    return {
      id: edgeId,
      source: sourceId,
      target: targetId,
      sourceHandle: sourceHandle || 'bottom-source',
      targetHandle: targetHandle || 'top-target',
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
  }, []);

  const addEdge = useCallback((
    sourceId: string,
    targetId: string,
    sourceHandle?: string,
    targetHandle?: string
  ) => {
    const newEdge = createEdge(sourceId, targetId, sourceHandle, targetHandle);
    
    console.log(`UnifiedEdgeManager: Adding edge to state:`, newEdge);
    
    setEdges(prevEdges => {
      // Check for existing edge by source/target combination (not just ID)
      const edgeExists = prevEdges.some(e => 
        e.source === sourceId && e.target === targetId
      );
      
      if (edgeExists) {
        console.log(`UnifiedEdgeManager: Edge ${sourceId}->${targetId} already exists`);
        return prevEdges;
      }
      
      // Also check for any edge with the same ID to be extra safe
      const idExists = prevEdges.some(e => e.id === newEdge.id);
      if (idExists) {
        console.log(`UnifiedEdgeManager: Edge ID ${newEdge.id} already exists`);
        return prevEdges;
      }
      
      const updatedEdges = [...prevEdges, newEdge];
      console.log(`UnifiedEdgeManager: Total edges after addition: ${updatedEdges.length}`);
      return updatedEdges;
    });
    
    return newEdge;
  }, [createEdge, setEdges]);

  const addEdgeWithHandles = useCallback((
    sourceId: string,
    targetId: string,
    sourceHandle?: string,
    targetHandle?: string
  ) => {
    return addEdge(sourceId, targetId, sourceHandle, targetHandle);
  }, [addEdge]);

  // Handle manual connections (when user drags between handles)
  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) {
      console.error('UnifiedEdgeManager: Invalid connection - missing source or target');
      return;
    }
    
    console.log('UnifiedEdgeManager: Manual connection:', connection);
    addEdgeWithHandles(
      connection.source, 
      connection.target, 
      connection.sourceHandle || 'bottom-source', 
      connection.targetHandle || 'top-target'
    );
  }, [addEdgeWithHandles]);

  return { 
    addEdge, 
    addEdgeWithHandles,
    onConnect,
    createEdge 
  };
};