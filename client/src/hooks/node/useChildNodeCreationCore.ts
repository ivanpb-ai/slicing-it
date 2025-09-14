
import { useCallback } from 'react';
import { Node, XYPosition } from '@xyflow/react';
import { NodeType } from '../../types/nodeTypes';
import { getNodeId } from '../../utils/flowData/idGenerator';

export const useChildNodeCreationCore = (
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  addEdge: (sourceId: string, targetId: string) => void
) => {
  const createChildNodeCore = useCallback((
    type: NodeType, 
    position: XYPosition, 
    parentId: string,
    fiveQIId?: string
  ): Node => {
    const id = getNodeId(type, fiveQIId);
    console.log(`useChildNodeCreationCore: Creating child node ${id} with parent ${parentId}`);
    
    // Prepare extra data based on node type
    let extraData = {};
    
    if (type === 'cell-area') {
      let cellAreaId: number | undefined = undefined;
      
      if (fiveQIId) {
        cellAreaId = parseInt(fiveQIId);
        if (isNaN(cellAreaId)) {
          cellAreaId = undefined;
        }
      }
      
      if (cellAreaId !== undefined) {
        extraData = { 
          cellAreaId,
          cellAreaDescription: `Cell coverage area ${cellAreaId}`
        };
      }
    } else if (type === 'qosflow') {
      // For QoS Flow, we'll let the ID generator handle the ID
      // fiveQIId parameter can be reused for QoS Flow ID generation
      const qosFlowId = fiveQIId ? parseInt(fiveQIId) : 1;
      extraData = { 
        qosFlowId,
        qosFlowName: `QoS Flow ${qosFlowId}`
      };
    } else if (type === 'fiveqi') {
      extraData = { fiveQIId };
    } else if (type === 'rrp') {
      extraData = { rrpPercentage: 100 };
    }
    
    // Create the new node
    const newNode: Node = {
      id,
      type: 'customNode',
      position,
      data: {
        type,
        label: `${type.toUpperCase()} Node`,
        parentId,
        nodeId: id,
        ...extraData
      },
      parentId
    };
    
    // Add the node using React state - ReactFlow will automatically sync
    setNodes(prevNodes => {
      console.log(`useChildNodeCreationCore: Adding child node ${id} to nodes list`);
      return [...prevNodes, newNode];
    });
    
    // Create edge using the provided addEdge function
    console.log(`useChildNodeCreationCore: Creating edge from parent ${parentId} to child ${id}`);
    addEdge(parentId, id);
    
    return newNode;
  }, [setNodes, addEdge]);

  return { createChildNodeCore };
};
