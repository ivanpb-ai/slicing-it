
import { Node } from '@xyflow/react';
import { NodeRelationships, NodeWeightData } from './types';

/**
 * Calculates weights for nodes based on their descendants
 * Used for optimizing node placement and reducing edge crossings
 */
export function calculateNodeWeights(nodes: Node[], relationships: NodeRelationships): NodeWeightData {
  const { childrenMap } = relationships;
  const nodeWeight: Record<string, number> = {};
  
  // Calculate weight based on number of descendants
  const calculateWeight = (nodeId: string): number => {
    if (nodeWeight[nodeId] !== undefined) return nodeWeight[nodeId];
    
    const children = childrenMap[nodeId] || [];
    let weight = 1; // Start with self-weight
    
    for (const childId of children) {
      weight += calculateWeight(childId);
    }
    
    nodeWeight[nodeId] = weight;
    return weight;
  };
  
  // Calculate weights for all nodes
  nodes.forEach(node => {
    if (!nodeWeight[node.id]) {
      calculateWeight(node.id);
    }
  });
  
  return { nodeWeight };
}
