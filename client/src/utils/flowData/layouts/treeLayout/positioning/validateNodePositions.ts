
import { Node } from '@xyflow/react';

/**
 * Validate and ensure all nodes have valid positions
 */
export function validateNodePositions(nodes: Node[]): Node[] {
  return nodes.map(node => {
    if (!node.position || (node.position.x === undefined || node.position.y === undefined)) {
      // Assign a default position for any node that might have been missed
      return {
        ...node,
        position: { x: 100, y: 100 }
      };
    }
    return node;
  });
}
