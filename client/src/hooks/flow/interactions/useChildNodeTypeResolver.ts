
import { useCallback } from 'react';
import { NodeType } from '@/types/nodeTypes';

/**
 * Custom hook to resolve what type of child node should be created
 * based on the parent node type
 */
export const useChildNodeTypeResolver = () => {
  /**
   * Determines the appropriate child node type for a given parent node type
   * @param parentType The type of the parent node
   * @returns The appropriate child node type or undefined if none
   */
  const resolveChildNodeType = useCallback((parentType?: string): NodeType | undefined => {
    switch (parentType) {
      case 'network':
        return 'cell-area';
      case 'cell-area':
        return 'rrp';
      case 'rrp':
        return 'rrpmember';
      case 'rrpmember':
        return 's-nssai';
      case 's-nssai':
        return 'dnn';
      case 'dnn':
        return '5qi';
      default:
        return undefined;
    }
  }, []);

  return { resolveChildNodeType };
};
