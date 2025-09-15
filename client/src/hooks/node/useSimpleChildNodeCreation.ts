import { useCallback } from 'react';
import { Node, XYPosition } from '@xyflow/react';
import { NodeType } from '../../types/nodeTypes';
import { getNodeId } from '../../utils/flowData/idGenerator';
import { getNextCellAreaId, getNextDnnId, getNextRrpId, getNextSnssaiId, getNextQoSFlowId } from '../../utils/flowData/idCounters';

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
      
      if (type === 'rrpmember' && parentNode) {
        // Let the balanced tree layout handle positioning - just use a default position
        childPosition = {
          x: parentNode.position.x,
          y: parentNode.position.y + 50  // Temporary - layout will override
        };
        console.log(`✅ Creating RRPmember (balanced tree layout will position it)`, childPosition);
      } else if (type === 'rrp' && parentNode) {
        // Position RRP nodes with horizontal spacing for siblings
        const existingRrpChildren = prevNodes.filter(node => 
          node.data?.parentId === parentId && node.data?.type === 'rrp'
        );
        
        const spacing = 250; // Horizontal spacing between RRP siblings
        const totalNodes = existingRrpChildren.length + 1; // Include the new node
        
        // Start from left of parent and space horizontally
        const baseStartX = parentNode.position.x - ((totalNodes - 1) * spacing / 2);
        
        // Position the new node
        childPosition = {
          x: baseStartX + (existingRrpChildren.length * spacing),
          y: parentNode.position.y + 200  // Position vertically below with spacing
        };
        
        console.log(`✅ Creating RRP node #${totalNodes} at x=${childPosition.x}, y=${childPosition.y} (${existingRrpChildren.length} existing siblings)`);
        
        // IMPORTANT: Reposition existing RRP siblings to maintain symmetry
        existingRrpChildren.forEach((siblingNode, index) => {
          const newSiblingX = baseStartX + (index * spacing);
          siblingNode.position = {
            x: newSiblingX,
            y: parentNode.position.y + 200
          };
          console.log(`📍 Repositioned RRP sibling #${index + 1} to x=${newSiblingX}`);
        });
      } else if (type === 'dnn' && parentNode) {
        // Check if position is already calculated (from drag-and-drop system)
        if (position.x !== 0 || position.y !== 0) {
          // Position already calculated by drag-and-drop system, use it directly
          childPosition = position;
          console.log(`✅ Using pre-calculated DNN position from drag-and-drop: x=${childPosition.x}, y=${childPosition.y}`);
        } else {
          // Position DNN nodes vertically below their S-NSSAI parent with horizontal spacing
          const existingDnnChildren = prevNodes.filter(node => 
            node.data?.parentId === parentId && node.data?.type === 'dnn'
          );
          
          const spacing = 300; // Much larger spacing between DNN nodes to ensure no overlap
          const totalNodes = existingDnnChildren.length + 1; // Include the new node
          
          // Simple approach: Start from a fixed offset to the left of parent, then space out
          const baseStartX = parentNode.position.x - 200; // Start further left of parent
          
          // Position the new node at the end of the sequence
          childPosition = {
            x: baseStartX + (existingDnnChildren.length * spacing),
            y: parentNode.position.y + 200  // Position vertically below with spacing
          };
          
          console.log(`✅ Creating DNN node #${totalNodes} at x=${childPosition.x}, y=${childPosition.y} (${existingDnnChildren.length} existing siblings)`);
          
          // IMPORTANT: Reposition existing DNN siblings to maintain symmetry
          existingDnnChildren.forEach((siblingNode, index) => {
            const newSiblingX = baseStartX + (index * spacing);
            siblingNode.position = {
              x: newSiblingX,
              y: parentNode.position.y + 200
            };
            console.log(`📍 Repositioned DNN sibling #${index + 1} to x=${newSiblingX}`);
          });
        }
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
