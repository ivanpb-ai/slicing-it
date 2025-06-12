
import { Node } from '@xyflow/react';
import { NodeRelationships, NodeLevelData, SubtreeData } from '../types';
import { sortRootNodes } from './sortRootNodes';
import { sortNonRootNodes } from './sortNonRootNodes';

/**
 * Enhanced sorting to minimize edge crossings with multiple optimization passes
 */
export function sortNodesWithinLevels(
  levelData: NodeLevelData,
  relationships: NodeRelationships,
  subtreeData: SubtreeData,
  allNodes: Node[] = []
): void {
  const { levelNodes } = levelData;
  const { childrenMap, parentMap, rootNodes } = relationships;
  const nodeOrder: Record<string, number> = {};
  
  // First sort the root nodes for perfect symmetry
  sortRootNodes(levelNodes, rootNodes, subtreeData.subtreeSize, nodeOrder);
  
  // Enhanced barycentric method with multiple passes for edge crossing reduction
  const maxPasses = 4; // Increased passes for better convergence
  
  for (let pass = 0; pass < maxPasses; pass++) {
    console.log(`Edge crossing reduction pass ${pass + 1}/${maxPasses}`);
    
    // Sort nodes in each level to minimize edge crossings
    const levels = Object.keys(levelNodes)
      .map(Number)
      .filter(level => level > 0)
      .sort((a, b) => a - b);
    
    for (const level of levels) {
      const nodesInLevel = levelNodes[level] || [];
      if (nodesInLevel.length <= 1) continue;
      
      // Calculate barycentric coordinates for each node based on parent positions
      const nodeBarycentric = new Map<string, number>();
      
      nodesInLevel.forEach(node => {
        const parentId = parentMap[node.id];
        if (parentId) {
          const parentNode = allNodes.find(n => n.id === parentId);
          if (parentNode && parentNode.position) {
            nodeBarycentric.set(node.id, parentNode.position.x);
          }
        }
      });
      
      // Sort by barycentric coordinates to minimize crossings
      nodesInLevel.sort((nodeA, nodeB) => {
        const baryA = nodeBarycentric.get(nodeA.id) ?? 0;
        const baryB = nodeBarycentric.get(nodeB.id) ?? 0;
        
        if (Math.abs(baryA - baryB) > 10) {
          return baryA - baryB;
        }
        
        // Secondary sort by node type for consistent grouping
        const typeA = nodeA.data?.type as string || '';
        const typeB = nodeB.data?.type as string || '';
        if (typeA !== typeB) {
          return typeA.localeCompare(typeB);
        }
        
        // Tertiary sort by ID for stability
        return nodeA.id.localeCompare(nodeB.id);
      });
      
      // Group siblings by parent to minimize crossings within families
      const nodesByParent: Record<string, Node[]> = {};
      nodesInLevel.forEach(node => {
        const parentId = parentMap[node.id] || 'orphan';
        if (!nodesByParent[parentId]) {
          nodesByParent[parentId] = [];
        }
        nodesByParent[parentId].push(node);
      });
      
      // Sort sibling groups by their parent's position
      const sortedParentIds = Object.keys(nodesByParent).sort((parentA, parentB) => {
        if (parentA === 'orphan') return 1;
        if (parentB === 'orphan') return -1;
        
        const nodeA = allNodes.find(n => n.id === parentA);
        const nodeB = allNodes.find(n => n.id === parentB);
        
        if (nodeA?.position && nodeB?.position) {
          return nodeA.position.x - nodeB.position.x;
        }
        return 0;
      });
      
      // Rebuild level with properly sorted sibling groups
      levelNodes[level] = sortedParentIds.flatMap(parentId => {
        const siblings = nodesByParent[parentId];
        
        // Sort siblings within each family by their children's future positions
        return siblings.sort((a, b) => {
          const childrenA = childrenMap[a.id] || [];
          const childrenB = childrenMap[b.id] || [];
          
          // Predict future position based on number of descendants
          const subtreeSizeA = subtreeData.subtreeSize[a.id] || 1;
          const subtreeSizeB = subtreeData.subtreeSize[b.id] || 1;
          
          // Place larger subtrees more centrally to reduce crossings
          return subtreeSizeB - subtreeSizeA;
        });
      });
    }
    
    // Bottom-up pass: adjust positions based on children's coordinates
    for (let level = Math.max(...levels); level > 0; level--) {
      const nodesInLevel = levelNodes[level] || [];
      
      // Calculate optimal positions based on children
      const nodeOptimalX = new Map<string, number>();
      
      nodesInLevel.forEach(node => {
        const children = childrenMap[node.id] || [];
        if (children.length > 0) {
          // Calculate average X position of children
          const childPositions = children
            .map(childId => {
              const childNode = allNodes.find(n => n.id === childId);
              return childNode?.position?.x;
            })
            .filter(x => x !== undefined) as number[];
          
          if (childPositions.length > 0) {
            const avgX = childPositions.reduce((sum, x) => sum + x, 0) / childPositions.length;
            nodeOptimalX.set(node.id, avgX);
          }
        }
      });
      
      // Re-sort nodes based on optimal positions to minimize crossings
      if (nodeOptimalX.size > 0) {
        levelNodes[level].sort((a, b) => {
          const optimalA = nodeOptimalX.get(a.id);
          const optimalB = nodeOptimalX.get(b.id);
          
          if (optimalA !== undefined && optimalB !== undefined) {
            return optimalA - optimalB;
          }
          
          return 0;
        });
      }
    }
  }
  
  // Final pass: Apply advanced non-root node sorting
  sortNonRootNodes(levelNodes, relationships, allNodes);
}
