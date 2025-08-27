import { Edge, Node } from '@xyflow/react';

/**
 * Removes orphaned edges that don't connect to existing nodes
 */
export const removeOrphanedEdges = (edges: Edge[], nodes: Node[]): Edge[] => {
  const nodeIds = new Set(nodes.map(node => node.id));
  
  const validEdges = edges.filter(edge => {
    const hasValidSource = nodeIds.has(edge.source);
    const hasValidTarget = nodeIds.has(edge.target);
    
    if (!hasValidSource || !hasValidTarget) {
      console.log(`Removing orphaned edge ${edge.id}: source=${edge.source} (exists: ${hasValidSource}), target=${edge.target} (exists: ${hasValidTarget})`);
      return false;
    }
    
    return true;
  });
  
  const removedCount = edges.length - validEdges.length;
  if (removedCount > 0) {
    console.log(`Removed ${removedCount} orphaned edges`);
  }
  
  return validEdges;
};

/**
 * Clean up all orphaned edges in the current flow state
 */
export const cleanupOrphanedEdges = (
  nodes: Node[], 
  edges: Edge[], 
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
) => {
  const cleanEdges = removeOrphanedEdges(edges, nodes);
  if (cleanEdges.length !== edges.length) {
    setEdges(cleanEdges);
    return edges.length - cleanEdges.length;
  }
  return 0;
};