
import { Node } from '@xyflow/react';

/**
 * Verifies that all nodes are properly arranged and accounted for
 */
export function verifyNodeArrangement(
  originalNodes: Node[],
  arrangedNodes: Node[]
): boolean {
  if (!arrangedNodes || arrangedNodes.length === 0) {
    console.error('Tree layout error: No arranged nodes returned');
    return false;
  }
  
  if (arrangedNodes.length !== originalNodes.length) {
    console.error(`Tree layout error: Node count mismatch! Original: ${originalNodes.length}, Arranged: ${arrangedNodes.length}`);
    return false;
  }
  
  // Verify that all original nodes are still present by ID
  const originalIds = new Set(originalNodes.map(n => n.id));
  const arrangedIds = new Set(arrangedNodes.map(n => n.id));
  
  let allNodesPresent = true;
  
  for (const id of originalIds) {
    if (!arrangedIds.has(id)) {
      console.error(`Tree layout error: Node ${id} is missing after arrangement`);
      allNodesPresent = false;
    }
  }
  
  return originalIds.size === arrangedIds.size && allNodesPresent;
}
