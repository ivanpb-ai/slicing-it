
import { useCallback } from 'react';
import { XYPosition, Node } from '@xyflow/react';
import { toast } from "sonner";
import { NodeType } from '../../types/nodeTypes';

/**
 * Custom hook for node creation operations
 */
export const useNodeCreationOperations = (
  addNode: (type: NodeType, position: XYPosition, fiveQIId?: string) => Node | null,
  createChildNode: (type: NodeType, position: XYPosition, parentId: string, fiveQIId?: string) => Node | null
) => {
  /**
   * Wrapper function to add a node with error handling
   */
  const handleAddNode = useCallback(
    (type: NodeType, position: XYPosition, fiveQIId?: string) => {
      console.log(`useNodeCreationOperations: Adding node of type ${type} at position:`, position);
      
      try {
        // Call the provided addNode function
        return addNode(type, position, fiveQIId);
      } catch (error) {
        console.error(`Error creating ${type} node:`, error);
        toast.error(`Failed to create ${type} node`);
        return null;
      }
    },
    [addNode]
  );

  /**
   * Wrapper function to create a child node with error handling
   */
  const handleCreateChildNode = useCallback(
    (type: NodeType, position: XYPosition, parentId: string, fiveQIId?: string) => {
      console.log(`useNodeCreationOperations: Creating child node of type ${type} under parent ${parentId}`);
      
      try {
        // Call the provided createChildNode function
        return createChildNode(type, position, parentId, fiveQIId);
      } catch (error) {
        console.error(`Error creating child ${type} node:`, error);
        toast.error(`Failed to create ${type} node`);
        return null;
      }
    },
    [createChildNode]
  );

  return {
    handleAddNode,
    handleCreateChildNode
  };
};
