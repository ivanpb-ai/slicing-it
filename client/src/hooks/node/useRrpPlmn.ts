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
      setPLMN(e.target.value);
    },
    []
  );

  // Handle blur (when PLMN editing ends)
  const handlePLMNBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const currentValue = e.target.value;
    setIsEditingPLMN(false);

    // Create child node when PLMN is present, and parent nodeId exists
    if (currentValue && currentValue.trim() !== '' && data.nodeId) {
      if (reactFlowInstance) {
        const existingNodes = reactFlowInstance.getNodes();
        const parentNode = existingNodes.find(n => n.id === data.nodeId);
        
        if (parentNode) {
          console.log(`Creating RRP member child for parent ${data.nodeId} with PLMN: ${currentValue}`);
          
          // Position RRP-member directly below RRP with proper spacing
          // For multiple children, we need to calculate positions to avoid overlap
          const existingRrpMembers = existingNodes.filter(n => 
            n.data.type === 'rrpmember' && n.data.parentId === data.nodeId
          );
          
          const childPosition = {
            x: parentNode.position.x + (existingRrpMembers.length * 200), // Spread horizontally
            y: parentNode.position.y + 400  // Increased to 400 to match new layout spacing
          };
          
          if (createChildNode) {
            createChildNode('rrpmember', childPosition, data.nodeId, currentValue);
            // Clear the PLMN field after creating child so user can enter another
            setPLMN('');
          }
        }
      }
    }
  }, [data.nodeId, createChildNode, reactFlowInstance]);

  // Enter PLMN edit mode (on click)
  const handlePLMNClick = useCallback(() => {
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
