
import { Node } from '@xyflow/react';
import { HorizontalLayoutOptions, NodeLevelData } from './types';

/**
 * Positions nodes in a horizontal layout based on their levels
 */
export function positionNodesHorizontally(
  nodes: Node[],
  levelData: NodeLevelData,
  options: HorizontalLayoutOptions
): Node[] {
  const { 
    spacing = 200, 
    nodeWidth = 150, 
    nodeHeight = 80, 
    marginX = 100, 
    marginY = 100, 
    compactFactor = 0.8 
  } = options;
  
  const { levelNodes } = levelData;
  
  // Position nodes by level
  Object.entries(levelNodes).forEach(([levelStr, nodes]) => {
    const level = parseInt(levelStr, 10);
    const totalNodesInLevel = nodes.length;
    
    // Center the nodes vertically with better symmetry
    const totalHeight = totalNodesInLevel * (nodeHeight + spacing * compactFactor);
    const startY = marginY - (totalHeight / 2) + (nodeHeight / 2);
    
    // Position nodes in this level with improved centering
    nodes.forEach((node, index) => {
      // Calculate horizontal position based on level with higher spacing
      const xPos = marginX + level * (nodeWidth + spacing);
      
      // Calculate vertical position to center the nodes
      const yPos = startY + index * (nodeHeight + spacing * compactFactor);
      
      node.position = {
        x: xPos,
        y: yPos
      };
    });
  });
  
  return nodes;
}
