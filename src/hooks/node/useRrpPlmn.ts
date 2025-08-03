import { useState, useCallback } from "react";
import { NodeData } from "../../types/nodeTypes";
import { findNonOverlappingPosition, getNodeDimensions } from '../../utils/flowData/positioning/nodeCollisionDetection';
import { XYPosition, useReactFlow } from '@xyflow/react';
import { NodeType } from '../../types/nodeTypes';



export const useRrpPlmn = (data: NodeData, createChildNode: (type: NodeType, position: any, parentId: string, fiveQIId?: string) => any) => {
  const [isEditingPLMN, setIsEditingPLMN] = useState(false);
  const [plmn, setPLMN] = useState(data.plmn || '');

  const createRrpMemberNode = useCallback((plmnValue: string, parentId: string, type: string) => {
    console.log(`useRrpPlmn: createRrpMemberNode called with plmnValue="${plmnValue}", parentId="${parentId}"`);
    
    if (plmnValue && plmnValue.trim() !== '') {
      console.log(`useRrpPlmn: Creating RRPmember node for PLMN: ${plmnValue}`);
      
      const reactFlowInstance = useReactFlow();
      const existingNodes = reactFlowInstance.getNodes();
      const dimensions = getNodeDimensions(type);
      const parentNode = existingNodes.find(n => n.id === parentId);
        
      // Position will be calculated in the createChildNode function to be below parent
                    const position = findNonOverlappingPosition(
                      {
                        x: parentNode.position.x + 20,
                        y: parentNode.position.y + 100
                      },
                      existingNodes,
                      dimensions.width,
                      dimensions.height
                    );
      
      try {
        // Pass the PLMN value as the fiveQIId parameter so it gets stored as plmnValue
        const newNode = createChildNode('rrpmember', position, parentId, plmnValue);
        console.log(`useRrpPlmn: Successfully created RRPmember child node:`, newNode);
        
        // Clear the PLMN field from the parent RRP node and local state after successful creation
        setPLMN('');
        data.plmn = '';
        console.log(`useRrpPlmn: Cleared PLMN field from parent RRP node`);
      } catch (error) {
        console.error('useRrpPlmn: Failed to create RRPmember child node:', error);
      }
    } else {
      console.log(`useRrpPlmn: Skipping RRPmember creation - empty or invalid plmnValue: "${plmnValue}"`);
    }
  }, [createChildNode, data]);

  const handlePLMNChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log(`useRrpPlmn: PLMN changed to: "${newValue}"`);
    setPLMN(newValue);
    data.plmn = newValue;
  }, [data]);

  const handlePLMNBlur = useCallback(() => {
    console.log(`useRrpPlmn: PLMN blur event - value: "${plmn}", nodeId: "${data.nodeId}"`);
    setIsEditingPLMN(false);
    // Create child node when PLMN gets a value
    if (plmn && plmn.trim() !== '' && data.nodeId) {
      console.log(`useRrpPlmn: Calling createRrpMemberNode for PLMN`);
      createRrpMemberNode(plmn, data.nodeId, data.type);
    } else {
      console.log(`useRrpPlmn: Not creating RRPmember for PLMN - plmn: "${plmn}", nodeId: "${data.nodeId}"`);
    }
  }, [plmn, data.nodeId, createRrpMemberNode]);

  const handlePLMNClick = useCallback(() => {
    console.log(`useRrpPlmn: PLMN clicked - entering edit mode`);
    setIsEditingPLMN(true);
  }, []);

  return {
    isEditingPLMN,
    plmn,
    handlePLMNChange,
    handlePLMNBlur,
    handlePLMNClick
  };
};

