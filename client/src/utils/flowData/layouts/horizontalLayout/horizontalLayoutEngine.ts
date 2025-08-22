
import { Node, Edge } from '@xyflow/react';
import { HorizontalLayoutOptions } from './types';
import { buildNodeRelationships } from './nodeRelationships';
import { assignNodeLevels } from './levelAssignment';
import { calculateNodeWeights } from './nodeWeights';
import { sortNodesWithinLevels } from './nodeSorter';
import { positionNodesHorizontally } from './nodePositioner';

/**
 * Main horizontal layout engine that coordinates the layout process
 */
export function arrangeNodesInHorizontalLayout(
  nodes: Node[],
  edges: Edge[],
  options: HorizontalLayoutOptions = {}
): Node[] {
  if (nodes.length === 0) return nodes;
  
  // Clone the nodes to avoid modifying the originals
  const newNodes = [...nodes];
  
  // Step 1: Build node relationships
  const relationships = buildNodeRelationships(newNodes, edges);
  
  // Step 2: Assign levels to nodes
  const levelData = assignNodeLevels(newNodes, relationships);
  
  // Step 3: Calculate node weights for optimized positioning
  const weightData = calculateNodeWeights(newNodes, relationships);
  
  // Step 4: Sort nodes within levels to minimize edge crossings
  sortNodesWithinLevels(levelData, relationships, weightData);
  
  // Step 5: Position nodes in the horizontal layout
  return positionNodesHorizontally(newNodes, levelData, options);
}
