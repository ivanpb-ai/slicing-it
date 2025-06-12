
import { Node } from '@xyflow/react';
import { NodeRelationships } from '../types';

/**
 * Sort non-root nodes to minimize edge crossings
 * using a combination of methods
 */
export function sortNonRootNodes(
  levelNodes: Record<number, Node[]>,
  relationships: NodeRelationships,
  allNodes: Node[]
): void {
  const { parentMap, childrenMap } = relationships;
  
  // Process each level (except root level)
  const levels = Object.keys(levelNodes)
    .map(Number)
    .filter(l => l > 0)
    .sort((a, b) => a - b);
  
  for (const level of levels) {
    const nodesInLevel = levelNodes[level];
    if (!nodesInLevel || nodesInLevel.length <= 1) continue;
    
    // Group nodes by their parent
    const nodesByParent: Record<string, Node[]> = {};
    
    nodesInLevel.forEach(node => {
      const parentId = parentMap[node.id];
      if (!parentId) return; // Skip orphans
      
      if (!nodesByParent[parentId]) {
        nodesByParent[parentId] = [];
      }
      nodesByParent[parentId].push(node);
    });
    
    // Process each parent's children
    Object.entries(nodesByParent).forEach(([parentId, children]) => {
      if (children.length <= 1) return; // No need to sort single nodes
      
      // Sort siblings based on their types first (hierarchical ordering)
      children.sort((a, b) => {
        const typeA = a.data?.type as string || '';
        const typeB = b.data?.type as string || '';
        
        // Primary sort by type hierarchy
        if (typeA !== typeB) {
          // Define type hierarchy for consistent ordering
          const typeHierarchy: Record<string, number> = {
            'network': 0,
            'cell-area': 1,
            'rrp': 2,
            's-nssai': 3,
            'dnn': 4,
            '5qi': 5
          };
          
          return (typeHierarchy[typeA] || 999) - (typeHierarchy[typeB] || 999);
        }
        
        // Secondary sort by children's positions if they have children
        const childrenA = childrenMap[a.id] || [];
        const childrenB = childrenMap[b.id] || [];
        
        if (childrenA.length && childrenB.length) {
          // Calculate average X position of each node's children
          const avgXA = getAverageChildPosition(a.id, childrenMap, allNodes);
          const avgXB = getAverageChildPosition(b.id, childrenMap, allNodes);
          
          if (avgXA !== null && avgXB !== null) {
            return avgXA - avgXB;
          }
        }
        
        // Tertiary sort by ID for stable ordering
        return a.id.localeCompare(b.id);
      });
      
      // Update the level with the sorted children
      const parentIndex = levelNodes[level].findIndex(n => n.id === parentId);
      if (parentIndex >= 0) {
        // Replace the children in the level, maintaining the order of other nodes
        const updatedLevel = [...levelNodes[level]];
        let insertIndex = levelNodes[level].findIndex(n => n.id === children[0].id);
        
        // Remove all children from their current positions
        children.forEach(child => {
          const childIndex = updatedLevel.findIndex(n => n.id === child.id);
          if (childIndex >= 0) {
            updatedLevel.splice(childIndex, 1);
          }
        });
        
        // Reinsert children in their sorted order
        updatedLevel.splice(insertIndex, 0, ...children);
        levelNodes[level] = updatedLevel;
      }
    });
  }
}

/**
 * Helper function to calculate average X position of a node's children
 */
function getAverageChildPosition(
  nodeId: string, 
  childrenMap: Record<string, string[]>,
  allNodes: Node[]
): number | null {
  const children = childrenMap[nodeId] || [];
  if (!children.length) return null;
  
  const childPositions = children
    .map(childId => {
      const childNode = allNodes.find(n => n.id === childId);
      return childNode ? childNode.position.x : null;
    })
    .filter(pos => pos !== null) as number[];
  
  if (!childPositions.length) return null;
  
  return childPositions.reduce((sum, x) => sum + x, 0) / childPositions.length;
}
