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
      
      if (type === 'rrpmember' && parentNode) {
        // Let the balanced tree layout handle positioning - just use a default position
        childPosition = {
          x: parentNode.position.x,
          y: parentNode.position.y + 50  // Temporary - layout will override
        };
        console.log(`✅ Creating RRPmember (balanced tree layout will position it)`, childPosition);
      } else if (type === 'rrp' && parentNode) {
        // Position RRP nodes vertically below their TAC parent
        childPosition = {
          x: parentNode.position.x, // Keep same horizontal position as parent
          y: parentNode.position.y + 200  // Position vertically below with spacing
        };
        console.log(`✅ Creating RRP node positioned below TAC parent:`, childPosition);
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
        console.log('🎯 Triggering S-NSSAI tooltip at position:', childPosition);
        setTimeout(() => {
          console.log('🎯 Dispatching show-snssai-tooltip event');
          window.dispatchEvent(new CustomEvent('show-snssai-tooltip', {
            detail: { position: childPosition }
          }));
        }, 100);
      }
      
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
