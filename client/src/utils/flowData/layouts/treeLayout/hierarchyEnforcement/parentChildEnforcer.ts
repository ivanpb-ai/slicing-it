
import { Node } from "@xyflow/react";
import { NodeRelationships } from "../types";

/**
 * Ensures child nodes are positioned below their parent nodes
 */
export function enforceParentChildPositioning(
  nodes: Node[], 
  relationships: NodeRelationships,
  verticalSpacing: number
): Node[] {
  // Create a map for quick node lookups
  const nodeMap = new Map<string, number>();
  nodes.forEach((node, index) => {
    nodeMap.set(node.id, index);
  });
  
  // Create a deep copy of nodes to avoid mutating the input
  const nodesCopy = nodes.map(node => ({...node, position: {...node.position}}));
  
  // Process each parent-child relationship
  Object.keys(relationships.childrenMap).forEach(parentId => {
    const parentNodeIndex = nodeMap.get(parentId);
    if (parentNodeIndex === undefined) return;
    
    const parentNode = nodesCopy[parentNodeIndex];
    if (!parentNode) return;
    
    const childIds = relationships.childrenMap[parentId];
    if (!childIds || childIds.length === 0) return;
    
    // Process each child node
    childIds.forEach(childId => {
      const childNodeIndex = nodeMap.get(childId);
      if (childNodeIndex === undefined) return;
      
      const childNode = nodesCopy[childNodeIndex];
      if (!childNode) return;
      
      // Use updated vertical spacing of 200px
      const minVerticalOffset = 200; // Updated from 100px to 200px
      
      // Ensure child Y position is below parent node with appropriate spacing
      if (childNode.position.y <= parentNode.position.y + minVerticalOffset) {
        childNode.position.y = parentNode.position.y + minVerticalOffset;
      }
    });
  });
  
  return nodesCopy;
}
