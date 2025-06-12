
import { useCallback } from 'react';

/**
 * Custom hook for calculating optimal positions for child nodes
 */
export const useNodePositioning = () => {
  /**
   * Calculates the optimal position for a child node based on parent position
   * with standard vertical spacing
   */
  const calculateChildNodePosition = useCallback((parentNode: any) => {
    // Standard vertical spacing for all child nodes
    const verticalSpacing = 280; // Updated for the 200px layer height plus some margin
    
    // Position child nodes below parent
    return {
      x: parentNode.position.x,
      y: parentNode.position.y + verticalSpacing
    };
  }, []);

  return { calculateChildNodePosition };
};
