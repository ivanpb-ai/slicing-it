
import { Node, Edge } from '@xyflow/react';
import { LayoutOptions } from './index';
import { arrangeNodesInHorizontalLayout } from './horizontalLayout/horizontalLayoutEngine';

/**
 * Arranges nodes in a horizontal tree layout with minimized edge crossings
 * and improved symmetry
 */
export const arrangeNodesHorizontally = (
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): Node[] => {
  if (nodes.length === 0) return nodes;
  
  const {
    spacing = 200,
    nodeWidth = 150,
    nodeHeight = 80,
    marginX = 100,
    marginY = 100,
    compactFactor = 0.8 // Adjusted for better spread
  } = options;

  // Use the refactored horizontal layout engine
  return arrangeNodesInHorizontalLayout(nodes, edges, {
    spacing,
    nodeWidth,
    nodeHeight,
    marginX,
    marginY,
    compactFactor
  });
};
