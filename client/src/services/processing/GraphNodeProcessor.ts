
import { Node, Edge, MarkerType } from '@xyflow/react';

export class GraphNodeProcessor {
  // Process nodes before loading into ReactFlow
  static prepareNodesForLoading(nodes: Node[]): Node[] {
    if (!Array.isArray(nodes)) {
      console.error('Invalid nodes array provided to prepareNodesForLoading');
      return [];
    }
    
    console.log(`GraphNodeProcessor: Processing ${nodes.length} nodes for loading`);
    
    return nodes.map((node, index) => {
      // Ensure we have a valid node structure
      if (!node || !node.id) {
        console.error(`GraphNodeProcessor: Invalid node at index ${index}:`, node);
        return null;
      }
      
      // Robust position handling with NaN checks
      const originalPosition = node.position || { x: 0, y: 0 };
      const safeX = typeof originalPosition.x === 'number' && !isNaN(originalPosition.x) ? originalPosition.x : (index % 5) * 200;
      const safeY = typeof originalPosition.y === 'number' && !isNaN(originalPosition.y) ? originalPosition.y : Math.floor(index / 5) * 150;
      
      const processedNode = {
        ...node,
        type: 'customNode', // Ensure consistent node type
        position: {
          x: safeX,
          y: safeY
        },
        // Ensure data field is properly structured while preserving all existing fields
        data: {
          ...(node.data || {}),
          // Only override these fields if they're missing, but preserve all other fields
          label: node.data?.label || node.id || 'Unnamed Node',
          type: node.data?.type || 'generic',
          description: node.data?.description || 'Node'
          // This preserves dnnCustomName, snssaiCustomName, fiveQIId, etc.
        }
      };
      
      // Enhanced debug logging for DNN and 5QI nodes
      if (node.data?.type === 'dnn' || node.data?.type === 'fiveqi') {
        console.log(`✅ GraphNodeProcessor: Successfully processed ${node.data.type} node:`, {
          nodeId: node.id,
          originalType: node.data?.type,
          processedType: processedNode.data.type,
          originalPosition: originalPosition,
          processedPosition: processedNode.position,
          dataFields: Object.keys(node.data || {}),
          preservedData: {
            dnnCustomName: node.data?.dnnCustomName,
            dnnId: node.data?.dnnId,
            fiveQIId: node.data?.fiveQIId,
            qosValues: node.data?.qosValues
          }
        });
      }
      
      return processedNode;
    }).filter(node => node !== null); // Remove any null nodes
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
