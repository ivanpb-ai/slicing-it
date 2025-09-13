
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
    
    // Add the node first
    setNodes(prevNodes => {
      console.log(`useChildNodeCreationCore: Adding child node ${id} to nodes list`);
      const updatedNodes = [...prevNodes, newNode];
      
      // CRITICAL: Also update ReactFlow instance to ensure state sync
      try {
        // @ts-ignore - Access global ReactFlow instance registry
        const globalReactFlowInstances = window.__REACTFLOW_INSTANCES__;
        if (globalReactFlowInstances && globalReactFlowInstances.length > 0) {
          const reactFlowInstance = globalReactFlowInstances[0];
          console.log(`useChildNodeCreationCore: Syncing ${updatedNodes.length} nodes to ReactFlow instance`);
          reactFlowInstance.setNodes(updatedNodes);
        }
      } catch (e) {
        console.warn('useChildNodeCreationCore: Failed to sync with ReactFlow instance:', e);
      }
      
      return updatedNodes;
    });
    
    // Create edge using the provided addEdge function
    console.log(`useChildNodeCreationCore: Creating edge from parent ${parentId} to child ${id}`);
    addEdge(parentId, id);
    
    return newNode;
  }, [setNodes, addEdge]);

  return { createChildNodeCore };
};
