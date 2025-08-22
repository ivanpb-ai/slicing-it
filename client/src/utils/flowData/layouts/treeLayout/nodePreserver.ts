
import { Node } from '@xyflow/react';

/**
 * Separates nodes that should preserve their positions from those that can be arranged
 */
export function separatePreservedNodes(
  nodes: Node[],
  preserveFlags: Array<keyof Node['data']> = [
    'recentlyCreated',
    'ensureVisible',
    'persistNode',
    'preserveInLayout',
    'positionLocked',
    'permanent'
  ]
): {
  nodesToPreserve: Node[],
  nodesToArrange: Node[]
} {
  // Preserve nodes that should not be rearranged (nodes with any persistence flags)
  const nodesToPreserve = nodes.filter(node => 
    preserveFlags.some(flag => node.data?.[flag as string])
  );
    
  // Only arrange nodes that are not marked for preservation
  const nodesToArrange = nodes.filter(node => 
    !preserveFlags.some(flag => node.data?.[flag as string])
  );
    
  console.log(`Tree layout: preserving ${nodesToPreserve.length} nodes, arranging ${nodesToArrange.length} nodes`);
  
  return { nodesToPreserve, nodesToArrange };
}

/**
 * Merges preserved nodes back with the arranged nodes
 */
export function mergePreservedNodes(
  arrangedNodes: Node[],
  nodesToPreserve: Node[]
): Node[] {
  if (nodesToPreserve.length === 0) {
    return arrangedNodes;
  }
  
  // Get the IDs of arranged nodes to avoid duplicates
  const arrangedNodeIds = new Set(arrangedNodes.map(node => node.id));
  
  // Add preserved nodes that aren't already in the arrangedNodes
  const mergedNodes = [...arrangedNodes];
  nodesToPreserve.forEach(node => {
    if (!arrangedNodeIds.has(node.id)) {
      mergedNodes.push(node);
    }
  });
  
  console.log(`Tree layout: merged in ${nodesToPreserve.length} preserved nodes`);
  return mergedNodes;
}
