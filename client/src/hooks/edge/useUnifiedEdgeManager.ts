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
    targetHandle?: string,
    isManualConnection = false
  ): Edge => {
    // Use a standardized unique ID format
    const edgeId = `unified-${sourceId}-${targetId}`;
    
    console.log(`UnifiedEdgeManager: Creating edge ${edgeId} (${isManualConnection ? 'manual' : 'auto'})`);
    
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
      },
      data: {
        createdBy: isManualConnection ? 'manual' : 'auto'
      }
    };
  }, []);

  const addEdge = useCallback((
    sourceId: string,
    targetId: string,
    sourceHandle?: string,
    targetHandle?: string,
    isManualConnection = false
  ) => {
    const newEdge = createEdge(sourceId, targetId, sourceHandle, targetHandle, isManualConnection);
    
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
      
      // UNIVERSAL SINGLE-PARENT VALIDATION: Only enforce during automatic child creation, not manual connections
      const targetNode = nodes?.find(n => n.id === targetId);
      const sourceNode = nodes?.find(n => n.id === sourceId);
      
      let cleanedEdges = prevEdges;
      
      if (targetNode && sourceNode && !isManualConnection) {
        // Only validate for automatic connections (child node creation) - applies to ALL node types
        // Allow manual connections to create multiple parents for any node type
        const expectedParentId = targetNode.data?.parentId;
        
        if (expectedParentId && expectedParentId !== sourceId) {
          console.warn(`UnifiedEdgeManager: Rejecting automatic edge from ${sourceId} to ${targetId}. Expected parent: ${expectedParentId}`);
          return prevEdges; // Reject this edge
        }
        
        // Remove any existing AUTOMATIC edges to this target (preserve manual connections)
        // Only remove edges marked as 'auto' from nodes of the same type as the source
        const existingAutoEdges = prevEdges.filter(e => {
          const existingSourceNode = nodes?.find(n => n.id === e.source);
          return e.target === targetId && 
                 existingSourceNode?.data?.type === sourceNode.data?.type &&
                 e.data?.createdBy === 'auto'; // Only remove automatic edges
        });
        
        if (existingAutoEdges.length > 0) {
          console.log(`UnifiedEdgeManager: Removing ${existingAutoEdges.length} existing automatic ${sourceNode.data?.type}→${targetNode.data?.type} edges to ${targetId} (preserving manual connections)`);
          cleanedEdges = prevEdges.filter(e => !existingAutoEdges.includes(e));
        }
      } else if (isManualConnection && targetNode && sourceNode) {
        console.log(`UnifiedEdgeManager: Allowing manual ${sourceNode.data?.type}→${targetNode.data?.type} connection from ${sourceId} to ${targetId} (multi-parent allowed)`);
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
    targetHandle?: string,
    isManualConnection = false
  ) => {
    return addEdge(sourceId, targetId, sourceHandle, targetHandle, isManualConnection);
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
      connection.targetHandle || 'top-target',
      true // Mark as manual connection
    );
  }, [addEdgeWithHandles]);

  return { 
    addEdge, 
    addEdgeWithHandles,
    onConnect,
    createEdge 
  };
};