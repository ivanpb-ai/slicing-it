import { useCallback } from 'react';
import { Node, XYPosition } from '@xyflow/react';
import { NodeType } from '../../types/nodeTypes';
import { getNodeId } from '../../utils/flowData/idGenerator';
import { getNextCellAreaId, getNextDnnId, getNextRrpId, getNextSnssaiId, getNextQoSFlowId } from '../../utils/flowData/idCounters';

export const useSimpleChildNodeCreation = (
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  addEdgeWithHandles: (sourceId: string, targetId: string, sourceHandle?: string, targetHandle?: string) => void,
  arrangeNodesInLayout?: () => void
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
    } else if (type === 'qosflow') {
      const qosFlowId = getNextQoSFlowId();
      id = `qosflow-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      extraData = { 
        qosFlowId,
        qosFlowName: `QoS Flow ${qosFlowId}`,
        nodeId: id
      };
      console.log(`Creating child QoS Flow with ID: ${qosFlowId}`);
    } else {
      id = getNodeId(type); // Remove fiveQIId parameter to ensure unique IDs
      if (type === 'fiveqi') {
        extraData = { fiveQIId }; // Keep fiveQIId in data for display
      } 
    }

    console.log(`Creating child ${type} node with ID: ${id} under parent: ${parentId}`);
    
    // Trigger tooltips for specific node types
    if (type === 'cell-area') {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('show-cell-area-tooltip', {
          detail: { position }
        }));
      }, 100);
    } else if (type === 'rrp') {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('show-rrp-tooltip', {
          detail: { position }
        }));
      }, 100);
    } else if (type === 'rrpmember') {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('show-rrpmember-tooltip', {
          detail: { position }
        }));
      }, 100);
    }

    // Calculate position based on node type and parent
    let childPosition = position;
    
    // Get the parent node to calculate proper positioning
    setNodes(prevNodes => {
      const parentNode = prevNodes.find(n => n.id === parentId);
      
      if (parentNode) {
        // Use simple placeholder position - balanced tree layout will handle final positioning
        childPosition = {
          x: parentNode.position.x,
          y: parentNode.position.y + 40  // Simple offset - layout will override
        };
        console.log(`✅ Creating ${type} node with placeholder position (balanced tree layout will position it)`, childPosition);
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
      
      // Trigger S-NSSAI tooltip after node is created
      if (type === 's-nssai') {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('show-snssai-tooltip', {
            detail: { position: childPosition }
          }));
        }, 100);
      }
      
      return updatedNodes;
    });

    // Create edge connection from parent to child OUTSIDE the setNodes updater
    // This prevents double execution in React StrictMode
    setTimeout(() => {
      console.log(`useSimpleChildNodeCreation: Creating edge from ${parentId} to ${id}`);
      addEdgeWithHandles(parentId, id, 'bottom-source', 'top-target');
      
      // Auto-trigger balanced tree layout after node and edge creation
      if (arrangeNodesInLayout) {
        // Use double requestAnimationFrame to ensure both node and edge are in state and measured
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            console.log(`🎯 Auto-triggering balanced tree layout after creating ${type} node`);
            arrangeNodesInLayout();
          });
        });
      }
    }, 50);

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
