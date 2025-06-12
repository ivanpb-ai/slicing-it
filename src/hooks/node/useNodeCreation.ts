
import { useCallback } from 'react';
import { Node, XYPosition } from '@xyflow/react';
import { NodeType } from '@/types/nodeTypes';
import { getNodeId } from '@/utils/flowData/idGenerator';
import { getNextCellAreaId, getNextDnnId, getNextSnssaiId } from '@/utils/flowData/idCounters';

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
      const cellAreaId = getNextCellAreaId();
      id = `cell-area-${cellAreaId}`;
      extraData = { 
        cellAreaId,
        cellAreaDescription: `TAC ${cellAreaId}`,
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
      
      if (type === '5qi') {
        extraData = { fiveQIId };
      } else if (type === 'rrp') {
        extraData = { rrpPercentage: 100 };
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

    setNodes(prevNodes => [...prevNodes, newNode]);
    return newNode;
  }, [setNodes]);

  return { createNode };
};
