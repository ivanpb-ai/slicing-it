import { useCallback } from 'react';
import { Node, XYPosition } from '@xyflow/react';
import { NodeType } from '../../types/nodeTypes';
import { getNodeId } from '../../utils/flowData/idGenerator';
import { getNextCellAreaId, getNextDnnId, getNextRrpId, getNextSnssaiId } from '../../utils/flowData/idCounters';

export const useSimpleChildNodeCreation = (
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  addEdgeWithHandles: (sourceId: string, targetId: string, sourceHandle?: string, targetHandle?: string) => void
) => {
  const createChildNode = useCallback((
    type: NodeType,
    position: XYPosition,
    parentId: string,
    fiveQIId?: string
  ): Node => {
    let id: string;
    let extraData = {};
    
    // Handle specific node types that need sequential IDs
    if (type === 'cell-area') {
      const cellAreaId = getNextCellAreaId();
      id = `cell-area-${cellAreaId}`;
      extraData = { 
        cellAreaId,
        cellAreaDescription: `TAC ${cellAreaId}`,
        nodeId: id
      };
      console.log(`Creating child cell-area with ID: ${cellAreaId}`);
    } else if (type === 'dnn') {
      const dnnId = getNextDnnId();
      id = `dnn-${dnnId}`;
      extraData = { 
        dnnId,
        nodeId: id
      };
      console.log(`Creating child DNN with ID: ${dnnId}`);
    } else if (type === 's-nssai') {
      const snssaiId = getNextSnssaiId();
      id = `s-nssai-${snssaiId}`;
      extraData = { 
        snssaiId,
        nodeId: id
      };
      console.log(`Creating child S-NSSAI with ID: ${snssaiId}`);
    } else if (type === 'rrp') {
      const rrpId = getNextRrpId();
      id = `rrp-${rrpId}`;
      extraData = { 
        rrpId,
        extraData : { rrpPercentage: 100 },
        nodeId: id
      };
      console.log(`Creating RRP with ID: ${rrpId}`);
    } else if (type === 'rrpmember') {
      // For RRPmember nodes, use the fiveQIId as the PLMN value
      id = getNodeId(type);
      extraData = { 
        plmnValue: fiveQIId || 'Unknown',
        nodeId: id
      };
      console.log(`Creating RRPmember child with PLMN: ${fiveQIId || 'Unknown'}`);
    } else {
      id = getNodeId(type, fiveQIId);
      if (type === 'fiveqi') {
        extraData = { fiveQIId };
      } 
    }

    console.log(`Creating child ${type} node with ID: ${id} under parent: ${parentId}`);

    // Calculate position based on node type and parent
    let childPosition = position;
    
    // Get the parent node to calculate proper positioning
    setNodes(prevNodes => {
      const parentNode = prevNodes.find(n => n.id === parentId);
      
      if (type === 'rrpmember' && parentNode) {
        // Position RRPmember nodes directly below the parent RRP node with proper spacing
        childPosition = {
          x: parentNode.position.x,
          y: parentNode.position.y + 150  // 150px spacing for balanced tree layout
        };
        console.log(`✅ Positioning RRPmember node below parent RRP at:`, childPosition);
      }
      
      const newNode: Node = {
        id,
        type: 'customNode',
        position: childPosition,
        data: {
          type,
          label: `${type.toUpperCase()} Node`,
          parentId,
          nodeId: id,
          ...extraData
        }
      };

      // Add the new node to the existing nodes
      const updatedNodes = [...prevNodes, newNode];
      
      // Create edge connection from parent to child after a short delay
      setTimeout(() => {
        console.log(`useSimpleChildNodeCreation: Creating edge from ${parentId} to ${id}`);
        addEdgeWithHandles(parentId, id, 'bottom-source', 'top-target');
      }, 50);

      return updatedNodes;
    });

    // Return a placeholder node for the function signature
    const newNode: Node = {
      id,
      type: 'customNode',
      position: childPosition,
      data: {
        type,
        label: `${type.toUpperCase()} Node`,
        parentId,
        nodeId: id,
        ...extraData
      }
    };

    return newNode;
  }, [setNodes, addEdgeWithHandles]);

  return { createChildNode };
};
