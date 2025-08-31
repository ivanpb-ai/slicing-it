
import { Node, XYPosition } from '@xyflow/react';

const DEFAULT_NODE_WIDTH = 180;
const DEFAULT_NODE_HEIGHT = 120;
const MIN_NODE_SPACING = 50;

/**
 * Check if two positions would cause nodes to overlap
 */
export const wouldNodesOverlap = (
  pos1: XYPosition,
  pos2: XYPosition,
  node1Width = DEFAULT_NODE_WIDTH,
  node1Height = DEFAULT_NODE_HEIGHT,
  node2Width = DEFAULT_NODE_WIDTH,
  node2Height = DEFAULT_NODE_HEIGHT,
  spacing = MIN_NODE_SPACING
): boolean => {
  const distance = Math.sqrt(
    Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2)
  );
  
  const minDistance = Math.max(node1Width, node1Height, node2Width, node2Height) + spacing;
  
  return distance < minDistance;
};

/**
 * Find a non-overlapping position for a new node
 */
export const findNonOverlappingPosition = (
  desiredPosition: XYPosition,
  existingNodes: Node[],
  nodeWidth = DEFAULT_NODE_WIDTH,
  nodeHeight = DEFAULT_NODE_HEIGHT
): XYPosition => {
  if (existingNodes.length === 0) {
    return desiredPosition;
  }

  let position = { ...desiredPosition };
  let attempts = 0;
  const maxAttempts = 20; // REDUCED to prevent infinite loops
  const spiralIncrement = 100; // Larger increment for faster spacing

  while (attempts < maxAttempts) {
    // Check if current position overlaps with any existing node
    const hasOverlap = existingNodes.some(node => 
      wouldNodesOverlap(position, node.position, nodeWidth, nodeHeight)
    );

    if (!hasOverlap) {
      return position;
    }

    // FIXED: Use simpler grid-based positioning to avoid infinite spirals
    const gridSize = 200;
    const row = Math.floor(attempts / 4);
    const col = attempts % 4;
    
    position = {
      x: desiredPosition.x + (col - 1.5) * gridSize,
      y: desiredPosition.y + row * gridSize
    };

    attempts++;
  }

  // FIXED: Guaranteed fallback position that won't cause loops
  const safeX = existingNodes.length > 0 
    ? Math.max(...existingNodes.map(n => n.position.x)) + nodeWidth + MIN_NODE_SPACING
    : desiredPosition.x + 200;
    
  return {
    x: safeX,
    y: desiredPosition.y
  };
};

/**
 * Get node dimensions based on type
 */
export const getNodeDimensions = (nodeType: string): { width: number; height: number } => {
  switch (nodeType) {
    case 'rrp':
      return { width: 180, height: 200 };
    case 'cell-area':
      return { width: 150, height: 140 };
    case 'network':
      return { width: 200, height: 120 };
    default:
      return { width: DEFAULT_NODE_WIDTH, height: DEFAULT_NODE_HEIGHT };
  }
};
