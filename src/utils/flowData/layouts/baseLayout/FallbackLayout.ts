
import { Node, Edge } from '@xyflow/react';

/**
 * Simple fallback layout when other layout algorithms fail
 */
export const applyFallbackLayout = (nodes: Node[]): Node[] => {
  console.warn('Using fallback layout due to layout algorithm failure');
  
  return nodes.map((node, index) => ({
    ...node,
    position: {
      x: 100 + (index % 3) * 250,
      y: 100 + Math.floor(index / 3) * 200
    }
  }));
};
