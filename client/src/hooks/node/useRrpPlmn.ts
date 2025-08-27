import { useState, useCallback } from "react";
import { NodeData, NodeType } from "../../types/nodeTypes";
import { XYPosition, useReactFlow } from '@xyflow/react';

export const useRrpPlmn = (
  data: NodeData,
  createChildNode: (type: NodeType, position: XYPosition, parentId: string, fiveQIId?: string) => any
) => {
  const [isEditingPLMN, setIsEditingPLMN] = useState(false);
  const [plmn, setPLMN] = useState(data.plmn || '');

  // Get reactFlowInstance at the hook top-level
  const reactFlowInstance = useReactFlow();


  // Handle change in the PLMN input field
  const handlePLMNChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log('useRrpPlmn: PLMN value changed:', e.target.value);
      setPLMN(e.target.value);
    },
    []
  );

  // Handle blur (when PLMN editing ends)
  const handlePLMNBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const currentValue = e.target.value;
    console.log('useRrpPlmn: PLMN blur event for nodeId:', data.nodeId, 'value:', currentValue);
    setIsEditingPLMN(false);

    // Create child node when PLMN is present, and parent nodeId exists
    if (currentValue && currentValue.trim() !== '' && data.nodeId) {
      console.log('useRrpPlmn: Creating RRP-member node...');
      if (reactFlowInstance) {
        const existingNodes = reactFlowInstance.getNodes();
        const parentNode = existingNodes.find(n => n.id === data.nodeId);
        
        if (parentNode) {
          // Position RRP-member directly below RRP with proper spacing
          const childPosition = {
            x: parentNode.position.x,
            y: parentNode.position.y + 350
          };
          
          console.log('useRrpPlmn: Calling createChildNode with position:', childPosition);
          createChildNode('rrpmember', childPosition, data.nodeId, currentValue);
        } else {
          console.warn('useRrpPlmn: Parent node not found');
        }
      }
    } else {
      console.log('useRrpPlmn: Not creating node - empty value or missing nodeId');
    }
  }, [data.nodeId, createChildNode, reactFlowInstance]);

  // Enter PLMN edit mode (on click)
  const handlePLMNClick = useCallback(() => {
    console.log('useRrpPlmn: PLMN click handler called for nodeId:', data.nodeId);
    setIsEditingPLMN(true);
  }, [data.nodeId]);

  return {
    isEditingPLMN,
    plmn,
    handlePLMNChange,
    handlePLMNBlur,
    handlePLMNClick,
  };
};
