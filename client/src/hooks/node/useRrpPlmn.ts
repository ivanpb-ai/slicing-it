import { useState, useCallback } from "react";
import { NodeData, NodeType } from "../../types/nodeTypes";
import { findNonOverlappingPosition, getNodeDimensions } from '../../utils/flowData/positioning/nodeCollisionDetection';
import { XYPosition, useReactFlow } from '@xyflow/react';

export const useRrpPlmn = (
  data: NodeData,
  createChildNode: (type: NodeType, position: XYPosition, parentId: string, fiveQIId?: string) => any
) => {
  const [isEditingPLMN, setIsEditingPLMN] = useState(false);
  const [plmn, setPLMN] = useState(data.plmn || '');

  // Get reactFlowInstance at the hook top-level
  const reactFlowInstance = useReactFlow();

  // Create a new RrpMember node (child) for a given PLMN
  const createRrpMemberNode = useCallback(
    (plmnValue: string, parentId: string, type: string) => {
      console.log(`useRrpPlmn: createRrpMemberNode called with plmnValue="${plmnValue}", parentId="${parentId}"`);
      if (plmnValue && plmnValue.trim() !== '') {
        console.log(`useRrpPlmn: Creating RRPmember node for PLMN: ${plmnValue}`);

        const existingNodes = reactFlowInstance.getNodes();
        const dimensions = getNodeDimensions(type);
        const parentNode = existingNodes.find(n => n.id === parentId);

        // Fallback: if parent not found, abort
        if (!parentNode) {
          console.warn(`useRrpPlmn: Parent node not found for id: ${parentId}`);
          return;
        }

const parentNodeElement = document.querySelector(`[data-id="${parentNode.id}"]`) as HTMLElement | null;
const parentNodeHeight = parentNodeElement?.offsetHeight || 100; // Safe default

const position = findNonOverlappingPosition(
  {
    x: parentNode.position.x + 20,
    y: parentNode.position.y + parentNodeHeight + 30,
  },
  existingNodes,
  dimensions.width,
  dimensions.height
);

        try {
          // Pass the PLMN value as the fiveQIId parameter so it gets stored as plmnValue
          const newNode = createChildNode('rrpmember', position, parentId, plmnValue);
          console.log(`useRrpPlmn: Successfully created RRPmember child node:`, newNode);

          // Clear the PLMN input after successful creation
          setPLMN('');

          // If you really must update data.plmn, do it via a callback or prop update—NOT direct mutation.
          // Example: if you have an onUpdate callback, call it here instead.
        } catch (error) {
          console.error('useRrpPlmn: Failed to create RRPmember child node:', error);
        }
      } else {
        console.log(`useRrpPlmn: Skipping RRPmember creation - empty or invalid plmnValue: "${plmnValue}"`);
      }
    },
    [createChildNode, reactFlowInstance]
  );

  // Handle change in the PLMN input field
  const handlePLMNChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      console.log(`useRrpPlmn: PLMN changed to: "${newValue}"`);
      setPLMN(newValue);

      // Again, if there's a callback or state setter for propagating upward, use it here.
      // For now, data.plmn is not mutated directly.
    },
    []
  );

  // Handle blur (when PLMN editing ends)
  const handlePLMNBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const currentValue = e.target.value;
    console.log(`useRrpPlmn: PLMN blur event - value: "${currentValue}", nodeId: "${data.nodeId}"`);
    setIsEditingPLMN(false);

    // Create child node when PLMN is present, and parent nodeId exists
    if (currentValue && currentValue.trim() !== '' && data.nodeId) {
      console.log(`useRrpPlmn: Creating RRPmember node using context createChildNode`);
      
      // Use context's createChildNode function directly
      if (reactFlowInstance) {
        const existingNodes = reactFlowInstance.getNodes();
        const parentNode = existingNodes.find(n => n.id === data.nodeId);
        
        if (parentNode) {
          const position = {
            x: parentNode.position.x,
            y: parentNode.position.y + 200
          };
          
          console.log(`useRrpPlmn: Calling createChildNode with PLMN: "${currentValue}"`);
          createChildNode('rrpmember', position, data.nodeId, currentValue);
        } else {
          console.warn(`useRrpPlmn: Parent node not found for id: ${data.nodeId}`);
        }
      }
    } else {
      console.log(
        `useRrpPlmn: Not creating RRPmember for PLMN - plmn: "${currentValue}", nodeId: "${data.nodeId}"`
      );
    }
  }, [data.nodeId, createChildNode, reactFlowInstance]);

  // Enter PLMN edit mode (on click)
  const handlePLMNClick = useCallback(() => {
    console.log(`useRrpPlmn: PLMN clicked - entering edit mode`);
    setIsEditingPLMN(true);
  }, []);

  return {
    isEditingPLMN,
    plmn,
    handlePLMNChange,
    handlePLMNBlur,
    handlePLMNClick,
  };
};
