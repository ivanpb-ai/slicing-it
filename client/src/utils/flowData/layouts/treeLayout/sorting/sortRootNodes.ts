
import { Node } from '@xyflow/react';
import { SubtreeData } from '../types';

/**
 * Sort root level nodes (level 0) for perfect symmetry
 * Places larger trees in the center for visual balance
 */
export function sortRootNodes(
  levelNodes: Record<number, Node[]>,
  rootNodes: Node[],
  subtreeSizes: Record<string, number>,
  nodeOrder: Record<string, number> = {}
): void {
  const nodesInLevel = levelNodes[0];
  
  if (!nodesInLevel || nodesInLevel.length === 0) {
    return;
  }
  
  // For root level, place larger trees in the center for perfect symmetry
  const rootNodesBySize = [...nodesInLevel].sort((a, b) => {
    return (subtreeSizes[b.id] || 1) - (subtreeSizes[a.id] || 1);
  });
  
  // Perfect alternating placement from center out for balanced appearance
  const orderedRoots: Node[] = [];
  
  // Place largest root at center
  if (rootNodesBySize.length > 0) {
    orderedRoots.push(rootNodesBySize[0]);
    
    // Place remaining roots alternating left and right
    for (let i = 1; i < rootNodesBySize.length; i++) {
      if (i % 2 === 1) {
        // Place on left
        orderedRoots.unshift(rootNodesBySize[i]);
      } else {
        // Place on right
        orderedRoots.push(rootNodesBySize[i]);
      }
    }
  }
  
  // Apply order
  orderedRoots.forEach((node, index) => {
    nodeOrder[node.id] = index;
  });
  
  // Update the level nodes array with the new order
  levelNodes[0] = orderedRoots;
}
