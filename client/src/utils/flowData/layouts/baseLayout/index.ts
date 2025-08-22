
import { Node, Edge } from '@xyflow/react';
import { processNodesWithLayout } from './LayoutProcessor';
import { LayoutOptions, LayoutType } from './LayoutTypes';

/**
 * Main arrange nodes function that supports multiple layout types
 * with improved vertical tree layout with balanced nodes
 */
export const arrangeNodes = (
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {},
  viewportWidth?: number,
  viewportHeight?: number
): Node[] => {
  // Create a deep copy of nodes to avoid mutation issues
  const nodesCopy = nodes.map(node => ({...node, position: {...node.position}}));
  
  // Process the nodes with the selected layout algorithm
  return processNodesWithLayout(nodesCopy, edges, options);
};

// Export types and utilities
export type { LayoutOptions, LayoutType };
export { getDefaultLayoutOptions } from './DefaultLayoutOptions';
