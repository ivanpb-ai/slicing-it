
import { Node } from '@xyflow/react';

/**
 * Sort sibling nodes (nodes with the same parent) to minimize edge crossings
 */
export function sortSiblingNodes(
  siblings: Node[],
  getNodeWeight: (node: Node) => number = () => 0,
  getNodeType: (node: Node) => string = (node) => node.data?.type as string || ''
): Node[] {
  if (!siblings || siblings.length <= 1) return siblings;
  
  // Create a copy to avoid mutating the input
  const sortedSiblings = [...siblings];
  
  // First sort by node type for hierarchical consistency
  sortedSiblings.sort((a, b) => {
    const typeA = getNodeType(a);
    const typeB = getNodeType(b);
    
    // Primary sort by type
    if (typeA !== typeB) {
      return typeA.localeCompare(typeB);
    }
    
    // Secondary sort by weight (could be based on children)
    const weightA = getNodeWeight(a);
    const weightB = getNodeWeight(b);
    
    if (weightA !== weightB) {
      return weightA - weightB;
    }
    
    // Tertiary sort by ID for stability
    return a.id.localeCompare(b.id);
  });
  
  return sortedSiblings;
}
