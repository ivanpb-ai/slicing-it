
import { Node, Edge } from '@xyflow/react';
import { NodeRelationships } from './types';

/**
 * Builds relationships between nodes based on edges
 */
export function buildNodeRelationships(nodes: Node[], edges: Edge[]): NodeRelationships {
  // Identify root nodes (nodes with no incoming edges)
  const targetIds = new Set(edges.map(edge => edge.target));
  const rootNodes = nodes.filter(node => !targetIds.has(node.id));
  
  // If no root nodes, use the first node as root
  const effectiveRootNodes = rootNodes.length > 0 ? rootNodes : nodes.length > 0 ? [nodes[0]] : [];
  
  // Build node hierarchy
  const childrenMap: Record<string, string[]> = {};
  const parentMap: Record<string, string> = {};
  
  edges.forEach(edge => {
    if (!childrenMap[edge.source]) {
      childrenMap[edge.source] = [];
    }
    childrenMap[edge.source].push(edge.target);
    parentMap[edge.target] = edge.source;
  });
  
  return {
    childrenMap,
    parentMap,
    rootNodes: effectiveRootNodes
  };
}
