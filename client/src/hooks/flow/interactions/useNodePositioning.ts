
import { useCallback } from 'react';

/**
 * Custom hook for calculating optimal positions for child nodes
 */
export const useNodePositioning = () => {
  /**
   * Calculates the optimal position for a child node based on parent position and type
   * @param parentNode The parent node
   * @param parentType The type of the parent node
   * @returns The calculated position for the child node
   */
  const calculateChildNodePosition = useCallback((parentNode: any, parentType?: string) => {
    // Determine vertical spacing based on node types
    let verticalSpacing = 300; // Default vertical spacing updated for 200px + margin
    
    // Special case for network->cell-area: closer spacing
    if (parentType === 'network') {
      verticalSpacing = 250; // Closer vertical spacing for cell-area nodes
    }
    
    // Always position child nodes directly below parent (same X coordinate)
    return {
      x: parentNode.position.x,   // Keep same X coordinate for direct alignment
      y: parentNode.position.y + verticalSpacing
    };
  }, []);

  return { calculateChildNodePosition };
};
