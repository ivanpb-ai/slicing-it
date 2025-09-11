import { useCallback } from 'react';
import { Edge, Connection, MarkerType, Node } from '@xyflow/react';

/**
 * Unified edge manager to prevent duplicate edge creation from multiple managers
 * This replaces useEdgeCreation, useEdgeManager, and useSimpleEdgeManager
 */
export const useUnifiedEdgeManager = (
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
  nodes?: Node[]
) => {
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
      
      // SINGLE-PARENT DNN VALIDATION: Enforce one S-NSSAI parent per DNN
      const targetNode = nodes?.find(n => n.id === targetId);
      const sourceNode = nodes?.find(n => n.id === sourceId);
      
      let cleanedEdges = prevEdges;
      
      if (targetNode?.data?.type === 'dnn' && sourceNode?.data?.type === 's-nssai') {
        // Check if DNN has expected parent relationship
        const expectedParentId = targetNode.data.parentId;
        
        if (expectedParentId && expectedParentId !== sourceId) {
          console.warn(`UnifiedEdgeManager: Rejecting S-NSSAI→DNN edge from ${sourceId} to ${targetId}. Expected parent: ${expectedParentId}`);
          return prevEdges; // Reject this edge
        }
        
        // Remove any existing S-NSSAI→DNN edges to this target (defensive cleanup)
        const existingDnnEdges = prevEdges.filter(e => 
          e.target === targetId && 
          nodes?.find(n => n.id === e.source)?.data?.type === 's-nssai'
        );
        
        if (existingDnnEdges.length > 0) {
          console.log(`UnifiedEdgeManager: Removing ${existingDnnEdges.length} existing S-NSSAI→DNN edges to ${targetId}`);
          cleanedEdges = prevEdges.filter(e => !existingDnnEdges.includes(e));
        }
      }
      
      const updatedEdges = [...cleanedEdges, newEdge];
      console.log(`UnifiedEdgeManager: Total edges after addition: ${updatedEdges.length}`);
      return updatedEdges;
    });
    
    return newEdge;
  }, [createEdge, setEdges, nodes]);

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