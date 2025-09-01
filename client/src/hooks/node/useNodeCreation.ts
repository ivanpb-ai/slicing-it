import { useCallback } from 'react';
import { Node, XYPosition } from '@xyflow/react';
import { NodeType } from '../../types/nodeTypes';
import { getNodeId } from '../../utils/flowData/idGenerator';
import { getNextCellAreaId, getNextRrpId, getNextDnnId, getNextSnssaiId } from '../../utils/flowData/idCounters';

export const useNodeCreation = (setNodes: React.Dispatch<React.SetStateAction<Node[]>>) => {
  const createNode = useCallback((
    type: NodeType,
    position: XYPosition,
    fiveQIId?: string
  ): Node => {
    let id: string;
    let extraData = {};
    
    // Handle specific node types that need sequential IDs
    if (type === 'cell-area') {
      console.log('🔍 useNodeCreation: About to create Cell Area node...');
      const cellAreaId = getNextCellAreaId();
      console.log(`🔍 useNodeCreation: Generated Cell Area ID: ${cellAreaId}`);
      id = `cell-area-${cellAreaId}`;
      extraData = { 
        cellAreaId,
        cellAreaDescription: `TAC ${cellAreaId}`,
        nodeId: id
      };
      console.log(`🔍 useNodeCreation: Cell Area node data prepared: id=${id}, extraData=`, extraData);
    } else if (type === 'rrp') {
      const rrpId = getNextRrpId();
      id = `rrp-${rrpId}`;
      extraData = { 
        rrpId,
        rrpDescription: `RRP ${rrpId}`,
        rrpPercentage: 100,
        nodeId: id
      };
    } else if (type === 'dnn') {
      const dnnId = getNextDnnId();
      id = `dnn-${dnnId}`;
      extraData = { 
        dnnId,
        nodeId: id
      };
    } else if (type === 's-nssai') {
      const snssaiId = getNextSnssaiId();
      id = `s-nssai-${snssaiId}`;
      extraData = { 
        snssaiId,
        nodeId: id
      };
    } else {
      id = getNodeId(type, fiveQIId);
      if (type === 'fiveqi') {
        extraData = { fiveQIId };
      } 
    }

    const newNode: Node = {
      id,
      type: 'customNode',
      position,
      data: {
        type,
        label: `${type.toUpperCase()} Node`,
        nodeId: id,
        ...extraData
      }
    };

    console.log(`🔍 useNodeCreation: About to add node to state: ${newNode.id}, type: ${type}`);
    setNodes(prevNodes => {
      console.log(`🔍 useNodeCreation: Adding node to ${prevNodes.length} existing nodes`);
      return [...prevNodes, newNode];
    });
    console.log(`🔍 useNodeCreation: Node creation completed for ${newNode.id}`);
    return newNode;
  }, [setNodes]);

  return { createNode };
};
