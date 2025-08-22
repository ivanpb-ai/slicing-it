
import { useCallback } from 'react';
import { Node } from '@xyflow/react';
import { toast } from "sonner";
import { hasNetworkNode } from '../../utils/flowData/nodeCreation';
import { NodeType } from '../../types/nodeTypes';

/**
 * Custom hook for validating node creation
 */
export const useNodeValidation = (nodes: Node[]) => {
  /**
   * Validates if a node type can be added to the canvas
   */
  const validateNodeAddition = useCallback(
    (type: NodeType): boolean => {
      // Only do the network node check for network nodes
      if (type === 'network') {
        const networkExists = hasNetworkNode(nodes);
        if (networkExists) {
          toast.error("Only one Network node is allowed", {
            description: "Remove the existing Network node before adding a new one"
          });
          return false;
        }
      }
      
      return true;
    },
    [nodes]
  );

  return {
    validateNodeAddition
  };
};
