
import { Node, Edge } from '@xyflow/react';
import { NodeRelationships } from './types';

/**
 * Build node relationships from nodes and edges with enhanced parent-child tracking
 * and better root node identification for hierarchical structures
 */
export function buildNodeRelationships(nodes: Node[], edges: Edge[]): NodeRelationships {
  // Clone the nodes to avoid modifying the originals
  const nodesCopy = [...nodes];
  
  // Track incoming and outgoing edges for each node
  const incoming: Record<string, number> = {};
  const outgoing: Record<string, number> = {};
  
  // Initialize counts
  nodesCopy.forEach(node => {
    incoming[node.id] = 0;
    outgoing[node.id] = 0;
  });
  
  // Count edges per node
  edges.forEach(edge => {
    incoming[edge.target] = (incoming[edge.target] || 0) + 1;
    outgoing[edge.source] = (outgoing[edge.source] || 0) + 1;
  });
  
  // Identify root nodes (nodes with no incoming edges)
  let rootNodes = nodesCopy.filter(node => incoming[node.id] === 0);
  
  // If no clear root nodes, use nodes that have outgoing edges but minimal incoming edges
  if (rootNodes.length === 0 && nodesCopy.length > 0) {
    // Find the minimum number of incoming edges any node has
    const minIncoming = Math.min(...Object.values(incoming).filter(count => count > 0));
    
    // Among nodes with minimum incoming edges, prioritize those with most outgoing edges
    let maxOutgoing = 0;
    let potentialRoots: Node[] = [];
    
    nodesCopy.forEach(node => {
      if (incoming[node.id] === minIncoming) {
        if (outgoing[node.id] > maxOutgoing) {
          maxOutgoing = outgoing[node.id];
          potentialRoots = [node];
        } else if (outgoing[node.id] === maxOutgoing) {
          potentialRoots.push(node);
        }
      }
    });
    
    if (potentialRoots.length > 0) {
      rootNodes = potentialRoots;
    } else {
      // Last resort: use the first node as root
      rootNodes = [nodesCopy[0]];
    }
  }
  
  // Build node hierarchy maps
  const childrenMap: Record<string, string[]> = {};
  const parentMap: Record<string, string> = {};
  
  // First build the parent map
  edges.forEach(edge => {
    parentMap[edge.target] = edge.source;
  });
  
  // Then build the children map
  edges.forEach(edge => {
    if (!childrenMap[edge.source]) {
      childrenMap[edge.source] = [];
    }
    childrenMap[edge.source].push(edge.target);
  });
  
  // Sort children arrays to ensure consistent ordering
  Object.keys(childrenMap).forEach(parentId => {
    childrenMap[parentId].sort((a, b) => {
      // Try to order based on node type if available
      const nodeA = nodes.find(n => n.id === a);
      const nodeB = nodes.find(n => n.id === b);
      
      if (nodeA?.data?.type && nodeB?.data?.type) {
        // Type assertion to ensure TypeScript knows these are strings
        const typeA = nodeA.data.type as string;
        const typeB = nodeB.data.type as string;
        return typeA.localeCompare(typeB);
      }
      
      // Fall back to ID-based sorting
      return a.localeCompare(b);
    });
  });

  return {
    childrenMap,
    parentMap,
    rootNodes
  };
}
