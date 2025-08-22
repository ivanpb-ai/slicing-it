
import { Node } from '@xyflow/react';
import { LayoutOptions } from './index';

/**
 * Arranges nodes in a grid layout with special handling for cell-area nodes
 */
export const arrangeNodesInGrid = (
  nodes: Node[],
  options: LayoutOptions = {}
): Node[] => {
  if (nodes.length === 0) return [];
  
  const {
    spacing = 140, // Reduced from 150 for more compactness
    nodeWidth = 150,
    nodeHeight = 80,
    marginX = 50,
    marginY = 50,
    compactFactor = 0.8, // Compact factor (lower = more compact)
    minNodeDistance = 90 // Minimum distance between nodes (reduced from 100)
  } = options;

  // Use the greater of spacing and minNodeDistance
  const effectiveSpacing = Math.max(spacing, minNodeDistance || 0);

  // Clone the nodes to avoid modifying the originals
  const newNodes = [...nodes];
  
  // Count different node types to arrange them by type
  const nodeTypeGroups: Record<string, Node[]> = {};
  
  newNodes.forEach(node => {
    const type = node.data?.type as string || 'default';
    if (!nodeTypeGroups[type]) {
      nodeTypeGroups[type] = [];
    }
    nodeTypeGroups[type].push(node);
  });
  
  // Arrange each type group
  let currentY = marginY;
  
  Object.entries(nodeTypeGroups).forEach(([type, groupNodes]) => {
    // Sort nodes within each type by their ID to maintain consistent ordering
    groupNodes.sort((a, b) => a.id.localeCompare(b.id));
    
    // Special handling for cell-area nodes - fewer nodes per row to prevent overlap
    const isSpecialType = type === 'cell-area';
    const baseFactor = isSpecialType ? 0.45 : 0.6; // Increased from 0.4 to 0.45 for cell-areas
    
    // Calculate nodes per row - make row width depend on number of nodes for more space
    const nodesPerRow = Math.ceil(Math.sqrt(groupNodes.length) * baseFactor);
    
    // Calculate proper horizontal spacing based on node type
    const typeSpacing = isSpecialType ? effectiveSpacing * 1.3 : effectiveSpacing; // Reduced from 1.5 to 1.3 for more compactness
    
    groupNodes.forEach((node, index) => {
      const row = Math.floor(index / nodesPerRow);
      const col = index % nodesPerRow;
      
      node.position = {
        x: marginX + col * (nodeWidth + typeSpacing),
        y: currentY + row * (nodeHeight + effectiveSpacing)
      };
    });
    
    // Update Y position for the next group with more spacing between groups
    const rows = Math.ceil(groupNodes.length / nodesPerRow);
    const typeVerticalSpacing = isSpecialType ? effectiveSpacing * 1.1 : effectiveSpacing * 0.8; // Reduced from 1.2 to 1.1
    currentY += rows * (nodeHeight + effectiveSpacing) + typeVerticalSpacing;
  });
  
  return newNodes;
};
