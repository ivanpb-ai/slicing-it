
import { Node } from '@xyflow/react';
import { NodeRelationships } from '../types';

/**
 * Group nodes by their parent node
 * Used for improved sorting to prevent edge crossings
 */
export function groupNodesByParent(
  nodes: Node[],
  relationships: NodeRelationships
): Record<string, Node[]> {
  const { parentMap } = relationships;
  const nodesByParent: Record<string, Node[]> = {};
  
  // Group nodes by their parent
  nodes.forEach(node => {
    const parentId = parentMap[node.id] || 'orphan';
    
    if (!nodesByParent[parentId]) {
      nodesByParent[parentId] = [];
    }
    
    nodesByParent[parentId].push(node);
  });
  
  return nodesByParent;
}
