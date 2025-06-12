
import { Node } from '@xyflow/react';
import { TreeLayoutOptions } from '../treeLayoutOptions';
import { NodeLevelData, NodeRelationships } from '../types';
import { NodeSpacingData } from './types';

/**
 * Calculate horizontal spaces needed for nodes and levels with standard spacing for hierarchical tree
 */
export function calculateNodeSpacing(
  nodes: Node[],
  levelData: NodeLevelData,
  relationships: NodeRelationships,
  options: TreeLayoutOptions
): NodeSpacingData {
  const { childrenMap } = relationships;
  const { levelNodes, nodeLevels } = levelData;
  const { 
    nodeWidth = 180, 
    spacing = 200, 
    minNodeDistance = 50 // Standard minimum distance
  } = options;
  
  // Calculate total width for each level
  const levelWidths = new Map<number, number>();
  
  // Calculate total horizontal space needed for each node based on its subtree
  const nodeHorizontalSpace: Record<string, number> = {};
  
  // Calculate horizontal spaces for leaf nodes first (nodes with no children)
  Object.keys(nodeLevels).forEach(nodeId => {
    if (!childrenMap[nodeId] || childrenMap[nodeId].length === 0) {
      // Standard space for leaf nodes
      nodeHorizontalSpace[nodeId] = nodeWidth * 1.2;
    }
  });
  
  // Calculate horizontal spaces for parent nodes bottom-up (from leaves to roots)
  // This ensures we allocate proper space for entire subtrees
  const maxLevel = Math.max(...Object.keys(levelNodes).map(Number));
  
  for (let level = maxLevel; level >= 0; level--) {
    const nodesInLevel = levelNodes[level] || [];
    
    nodesInLevel.forEach(node => {
      const children = childrenMap[node.id] || [];
      
      if (children.length > 0) {
        // Sum of all children's spaces plus spacing between them
        let totalChildSpace = children.reduce((sum, childId) => {
          return sum + (nodeHorizontalSpace[childId] || nodeWidth * 1.2);
        }, 0);
        
        // Add spacing between children - standard spacing
        const calculatedSpacing = Math.max(spacing, minNodeDistance || 50);
        
        totalChildSpace += (Math.max(0, children.length - 1)) * calculatedSpacing;
        
        // Ensure minimum width for parent node - standard sizing
        const minParentWidth = Math.max(
          nodeWidth * 1.2,
          nodeWidth * (1 + (0.1 * children.length))
        );
        
        nodeHorizontalSpace[node.id] = Math.max(minParentWidth, totalChildSpace);
      } else if (!nodeHorizontalSpace[node.id]) {
        // Set default space for nodes without children that weren't processed as leaves
        nodeHorizontalSpace[node.id] = nodeWidth * 1.2;
      }
    });
  }
  
  // Calculate total width needed for each level
  Object.keys(levelNodes).forEach(levelStr => {
    const level = parseInt(levelStr, 10);
    const nodesInLevel = levelNodes[level];
    
    if (nodesInLevel && nodesInLevel.length > 0) {
      // Calculate width needed for each node plus spacing
      const levelWidth = nodesInLevel.reduce((total, node, index) => {
        const nodeSpace = nodeHorizontalSpace[node.id] || nodeWidth * 1.2;
        // Add standard spacing between nodes except for the last node
        const calculatedSpacing = Math.max(spacing, minNodeDistance || 50);
        const spacingToAdd = index < nodesInLevel.length - 1 ? calculatedSpacing : 0;
        return total + nodeSpace + spacingToAdd;
      }, 0);
      
      levelWidths.set(level, levelWidth);
    } else {
      levelWidths.set(level, 0);
    }
  });
  
  return { nodeHorizontalSpace, levelWidths };
}
