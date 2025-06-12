import { Node } from '@xyflow/react';

/**
 * Creates a simple grid fallback layout when the tree layout fails
 */
export function createFallbackGridLayout(
  nodes: Node[],
  preserveFlags: Array<keyof Node['data']> = [
    'recentlyCreated',
    'ensureVisible',
    'persistNode',
    'preserveInLayout',
    'positionLocked',
    'permanent'
  ]
): Node[] {
  console.warn('Using fallback grid arrangement');
  
  return nodes.map((node, index) => {
    // Check if the node should preserve its position
    const shouldPreserve = preserveFlags.some(flag => 
      node.data?.[flag as string]
    );
    
    // If the node should be preserved, return it unchanged
    if (shouldPreserve) {
      return node;
    }
    
    // Otherwise, arrange in a grid
    const row = Math.floor(index / 5);
    const col = index % 5;
    return {
      ...node,
      position: {
        x: col * 300 + 100,  // Horizontal spacing
        y: row * 200 + 100   // Vertical spacing
      }
    };
  });
}
