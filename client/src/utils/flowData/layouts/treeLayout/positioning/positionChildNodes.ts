
import { Node } from '@xyflow/react';
import { TreeLayoutOptions } from '../treeLayoutOptions';
import { NodeSpacingData } from './types';
import { NodeLevelData } from '../types';

/**
 * Position child nodes with PERFECT centering for equal edge lengths
 */
export function positionChildNodes(
  nodes: Node[],
  nodesWithChildren: Node[],
  levelData: NodeLevelData,
  spacingData: NodeSpacingData,
  levelPositions: Record<number, Record<string, number>>,
  options: TreeLayoutOptions
): void {
  const { nodeHorizontalSpace } = spacingData;
  const { nodeLevels } = levelData;
  
  // Extract relationships from nodes
  const childrenMap: Record<string, string[]> = {};
  const parentMap: Record<string, string> = {};
  
  // Rebuild relationships from node data
  nodes.forEach(node => {
    if (node.data?.parentId) {
      const parentId = node.data.parentId as string;
      if (!childrenMap[parentId]) {
        childrenMap[parentId] = [];
      }
      childrenMap[parentId].push(node.id);
      parentMap[node.id] = parentId;
    }
  });
  
  const {
    marginY = 50,
    spacing = 100,
    nodeHeight = 180,
    nodeWidth = 180,
    verticalSpacing = 1,
    minNodeDistance = 20
  } = options;

  // Sort the parent nodes by level for proper positioning
  const sortedParentNodes = [...nodesWithChildren].sort((a, b) => {
    const levelA = nodeLevels[a.id] || 0;
    const levelB = nodeLevels[b.id] || 0;
    return levelA - levelB;
  });

  // Position each parent's children with PERFECT centering
  sortedParentNodes.forEach((parentNode) => {
    const parentId = parentNode.id;
    const parentLevel = nodeLevels[parentId] || 0;
    const children = childrenMap[parentId] || [];
    
    if (children.length === 0) return;

    // ULTRA COMPACT: 5px vertical offset for maximum compactness
    const childY = parentNode.position.y + 180;
    console.log(`🌳 BALANCED TREE: Positioning children of ${parentId} with optimized spacing`);
    
    // Get parent's EXACT center X position (center of the node)
    //const parentCenterX = parentNode.position.x + (nodeWidth / 2);
    const parentCenterX = parentNode.position.x;

    
    if (children.length === 1) {
      // Single child: position EXACTLY centered under parent
      const childNode = nodes.find(n => n.id === children[0]);
      if (childNode) {
        // Position child so its center aligns with parent's center
        childNode.position = { 
          //x: parentCenterX - (nodeWidth / 2), // EXACT center alignment
          x: parentCenterX,
          y: childY
        };
        console.log(`🌳 BALANCED TREE: Single child ${children[0]} centered under parent at:`, childNode.position);
        console.log(`🌳 BALANCED TREE: Parent center: ${parentCenterX}, Child center: ${childNode.position.x}`);
      }
    } else {
      // Multiple children: PERFECT distribution for equal edge lengths
      const minSpacing = 10; // Minimal spacing between children
      const totalChildrenWidth = children.length * nodeWidth;
      const totalSpacing = minSpacing * (children.length - 1);
      const totalWidth = totalChildrenWidth + totalSpacing;
      
      // Start position to EXACTLY center all children under parent
      //const startX = parentCenterX - (totalWidth / 2);
      const startX = parentCenterX;

      
      children.forEach((childId, index) => {
        const childNode = nodes.find(n => n.id === childId);
        if (!childNode) return;
        
        // Calculate child's center position
        // const childCenterX = startX + (index * (nodeWidth + minSpacing)) + (nodeWidth / 2);
        const childCenterX = parentNode.position.x;

        // Position child based on its center
        childNode.position = { 
          //x: childCenterX - (nodeWidth / 2), // Position based on center calculation
          x: childCenterX, 
          y: childY
        };
        
        console.log(`🌳 BALANCED TREE: Child ${childId} positioned at:`, childNode.position);
        console.log(`🌳 BALANCED TREE: Child center: ${childCenterX}, Parent center: ${parentCenterX}`);
        
        // Calculate and verify edge length (for debugging)
        //const parentCenterY = parentNode.position.y + (nodeHeight / 2);
        //const childCenterY = childNode.position.y + (nodeHeight / 2);
        const parentCenterY = parentNode.position.y;
        const childCenterY = childNode.position.y;
        const edgeLength = Math.sqrt(
          Math.pow(childCenterX - parentCenterX, 2) + 
          Math.pow(childCenterY - parentCenterY, 2)
        );
        console.log(`🌳 BALANCED TREE: Edge length from ${parentId} to ${childId}:`, edgeLength);
      });
    }
  });
}
