
import { useCallback } from 'react';
import { Node } from '@xyflow/react';
import { toast } from "sonner";
import { NodeType } from '@/types/nodeTypes';

/**
 * Custom hook to handle node relationship validations
 */
export const useNodeRelationships = () => {
  /**
   * Validates if a parent-child relationship is valid based on node types
   */
  const validateParentChildRelationship = useCallback(
    (parentNode: Node | undefined, childType: NodeType): boolean => {
      if (!parentNode) {
        console.error('Parent node not found');
        toast.error("Cannot create connection", { 
          description: "Parent node not found" 
        });
        return false;
      }

      // Get the parent node type - ensure we're getting it from the correct location
      const parentType = parentNode.data?.type as NodeType;
      
      if (!parentType) {
        console.error('Parent node type not found in node data');
        toast.error("Cannot create connection", { 
          description: "Invalid parent node" 
        });
        return false;
      }
      
      console.log(`Validating relationship: ${parentType} -> ${childType}`);
      
      // Map of valid parent-child relationships - updated to include QoS Flow layer
      const validRelationships: Record<string, string[]> = {
        'network': ['cell-area'],     
        'cell-area': ['rrp'],         
        'rrp': ['rrpmember'],         
        'rrpmember': ['s-nssai'],     
        's-nssai': ['dnn'],           
        'dnn': ['qosflow'],           
        'qosflow': ['fiveqi'],        
        'fiveqi': [],                    
      };
      
      const allowedChildren = validRelationships[parentType] || [];
      const isValid = allowedChildren.includes(childType);
      
      // Special case: Allow multiple S-NSSAI nodes to connect to the same DNN
      if (parentType === 's-nssai' && childType === 'dnn') {
        console.log(`Valid relationship confirmed: ${parentType} -> ${childType} (multiple allowed)`);
        return true;
      }
      
      if (!isValid) {
        console.error(`Invalid relationship: ${parentType} cannot have ${childType} as children`);
        console.log(`Allowed children for ${parentType}:`, allowedChildren);
        toast.error("Invalid connection", {
          description: `${parentType.toUpperCase()} nodes cannot connect to ${childType.toUpperCase()} nodes.`
        });
      } else {
        console.log(`Valid relationship confirmed: ${parentType} -> ${childType}`);
      }
      
      return isValid;
    },
    []
  );

  /**
   * Identifies what types of nodes can be children of a specific node type
   */
  const getValidChildTypes = useCallback((parentType: NodeType): NodeType[] => {
    const validChildrenTypes: Record<string, NodeType[]> = {
      'network': ['cell-area'],
      'cell-area': ['rrp'],
      'rrp': ['rrpmember'],
      'rrpmember': ['s-nssai'],
      's-nssai': ['dnn'],
      'dnn': ['qosflow'],
      'qosflow': ['fiveqi'],
      'fiveqi': [],
    };
    
    return validChildrenTypes[parentType] || [];
  }, []);

  return {
    validateParentChildRelationship,
    getValidChildTypes
  };
};
