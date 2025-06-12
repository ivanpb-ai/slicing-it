
import { useCallback } from 'react';
import { Node, Edge, XYPosition } from '@xyflow/react';
import { NodeType } from '@/types/nodeTypes';
import { getNodeId } from '@/utils/flowData/idGenerator';
import { getNextCellAreaId } from '@/utils/flowData/idCounters';
import { useSimpleChildNodeCreation } from './node/useSimpleChildNodeCreation';
import { findNonOverlappingPosition, getNodeDimensions } from '@/utils/flowData/positioning/nodeCollisionDetection';

export const useNodeOperations = (
  nodes: Node[],
  edges: Edge[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
  addEdgeWithHandles: (sourceId: string, targetId: string, sourceHandle?: string, targetHandle?: string) => void
) => {
  // Use the simple child node creation hook with the proper addEdgeWithHandles function
  const { createChildNode } = useSimpleChildNodeCreation(setNodes, addEdgeWithHandles);

  const addNode = useCallback((
    type: NodeType,
    position: XYPosition,
    fiveQIId?: string
  ): Node => {
    let id: string;
    let extraData = {};
    
    if (type === 'cell-area') {
      // Get the next sequential cell area ID
      const cellAreaId = getNextCellAreaId();
      id = `cell-area-${cellAreaId}`;
      extraData = { 
        cellAreaId,
        cellAreaDescription: `TAC ${cellAreaId}`,
        nodeId: id
      };
      console.log(`useNodeOperations: Creating cell-area with ID: ${cellAreaId}`);
    } else {
      id = getNodeId(type, fiveQIId);
      
      if (type === '5qi') {
        extraData = { fiveQIId };
      } else if (type === 'rrp') {
        extraData = { rrpPercentage: 100 };
      }
    }

    console.log(`useNodeOperations: Adding standalone ${type} node with ID: ${id} at requested position:`, position);

    // Get node dimensions for collision detection
    const dimensions = getNodeDimensions(type);
    
    // Find a non-overlapping position
    const safePosition = findNonOverlappingPosition(
      position, 
      nodes, 
      dimensions.width, 
      dimensions.height
    );
    
    if (safePosition.x !== position.x || safePosition.y !== position.y) {
      console.log(`useNodeOperations: Adjusted position to prevent overlap:`, safePosition);
    }

    const newNode: Node = {
      id,
      type: 'customNode',
      position: safePosition,
      data: {
        type,
        label: `${type.toUpperCase()} Node`,
        nodeId: id,
        ...extraData
      }
    };

    setNodes(prevNodes => [...prevNodes, newNode]);
    return newNode;
  }, [setNodes, nodes]);

  const getValidChildTypes = useCallback((parentType: NodeType): NodeType[] => {
    const childTypeMap: Record<NodeType, NodeType[]> = {
      'network': ['cell-area'],
      'cell-area': ['rrp'],
      'rrp': ['rrpmember'],
      'rrpmember': ['s-nssai'],
      's-nssai': ['dnn'],
      'dnn': ['5qi'],
      '5qi': []
    };
    
    return childTypeMap[parentType] || [];
  }, []);

  return {
    addNode,
    createChildNode,
    getValidChildTypes
  };
};
