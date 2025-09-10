
import { Node, Edge, MarkerType } from '@xyflow/react';

export class GraphNodeProcessor {
  // Process nodes before loading into ReactFlow
  static prepareNodesForLoading(nodes: Node[]): Node[] {
    if (!Array.isArray(nodes)) {
      console.error('Invalid nodes array provided to prepareNodesForLoading');
      return [];
    }
    
    return nodes.map(node => {
      const processedNode = {
        ...node,
        type: 'customNode', // Ensure consistent node type
        position: {
          x: typeof node.position?.x === 'number' ? node.position.x : 0,
          y: typeof node.position?.y === 'number' ? node.position.y : 0
        },
        // Ensure data field is properly structured while preserving all existing fields
        data: {
          ...(node.data || {}),
          // Only override these fields if they're missing, but preserve all other fields
          label: node.data?.label || node.id || 'Unnamed Node',
          type: node.data?.type || 'generic',
          description: node.data?.description || 'Node'
          // This preserves dnnCustomName, snssaiCustomName, etc.
        }
      };
      
      // Debug logging for DNN and 5QI nodes
      if (node.data?.type === 'dnn' || node.data?.type === 'fiveqi') {
        console.log(`🔍 GraphNodeProcessor: Processing ${node.data.type} node:`, {
          nodeId: node.id,
          originalType: node.data?.type,
          processedType: processedNode.data.type,
          hasPosition: !!(node.position?.x !== undefined && node.position?.y !== undefined),
          position: node.position,
          data: node.data
        });
      }
      
      return processedNode;
    });
  }
  
  // Process edges before loading into ReactFlow
  static prepareEdgesForLoading(edges: Edge[]): Edge[] {
    if (!Array.isArray(edges)) {
      console.error('Invalid edges array provided to prepareEdgesForLoading');
      return [];
    }
    
    return edges.map(edge => ({
      ...edge,
      id: edge.id || `e-${edge.source}-${edge.target}-${Date.now()}`,
      source: String(edge.source),
      target: String(edge.target),
      type: edge.type || 'smoothstep',
      style: edge.style || { stroke: '#94a3b8', strokeWidth: 2 },
      markerEnd: edge.markerEnd || {
        type: MarkerType.ArrowClosed,
        width: 15,
        height: 15,
        color: '#94a3b8',
      }
    }));
  }
  
  // Normalize handle IDs in edges
  static normalizeHandleIds(edges: Edge[]): Edge[] {
    if (!Array.isArray(edges)) {
      return [];
    }
    
    return edges.map(edge => {
      // Generate a unique ID if none exists
      const edgeId = edge.id || `e-${edge.source}-${edge.target}-${Date.now()}`;
      
      // Ensure source and target are strings
      const source = String(edge.source);
      const target = String(edge.target);
      
      // Try to determine node types from source and target IDs
      const sourceType = source.split('-')[0];
      const targetType = target.split('-')[0];
      
      // Determine the correct handles based on node relationship
      let sourceHandle = edge.sourceHandle;
      let targetHandle = edge.targetHandle;
      
      // If handles are not defined, set them based on the node types
      if (!sourceHandle || !targetHandle) {
        // For parent->child connections (downward)
        if ((sourceType === 'network' && targetType === 'cell-area') ||
            (sourceType === 'cell-area' && targetType === 'rrp') ||
            (sourceType === 'rrp' && targetType === 's-nssai') ||
            (sourceType === 's-nssai' && targetType === 'dnn') ||
            (sourceType === 'dnn' && targetType === '5qi')) {
          sourceHandle = 'bottom-source';
          targetHandle = 'top-target';
        } 
        // For child->parent connections (upward)
        else if ((sourceType === 'cell-area' && targetType === 'network') ||
                (sourceType === 'rrp' && targetType === 'cell-area') ||
                (sourceType === 's-nssai' && targetType === 'rrp') ||
                (sourceType === 'dnn' && targetType === 's-nssai') ||
                (sourceType === '5qi' && targetType === 'dnn')) {
          sourceHandle = 'top';
          targetHandle = 'bottom';
        }
      }
      
      return {
        ...edge,
        id: edgeId,
        source,
        target,
        sourceHandle,
        targetHandle
      };
    });
  }
}
