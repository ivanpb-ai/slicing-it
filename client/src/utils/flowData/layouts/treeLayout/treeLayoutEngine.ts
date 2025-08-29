
// Main tree layout algorithm orchestrator
import { Node } from "@xyflow/react";
import { assignNodeLevels } from "./levelAssignment";
import { buildNodeRelationships } from "./nodeRelationships";
import { sortNodesWithinLevels } from "./sorting";
import { calculateSubtreeSizes } from "./subtreeCalculator";
import { separatePreservedNodes, mergePreservedNodes } from "./nodePreserver";
import { verifyNodeArrangement } from "./layoutVerifier";
import { positionAllNodes } from "./nodeLayoutManager";
import { processNodesAfterLayout } from "./nodePreprocessor";
import { handleLayoutError } from "./errorHandler";
import type { TreeLayoutOptions } from "./treeLayoutOptions";

/**
 * Node with bounds interface
 */
export interface NodeWithBounds extends Node {
  bounds?: {
    width: number;
    height: number;
  };
}

export type { TreeLayoutOptions };

export const arrangeNodesInTreeLayout = (
  nodes: Node[],
  edges: any[],
  options: TreeLayoutOptions = {}
): Node[] => {
  // BALANCED: Use optimal spacing for hierarchical tree layout
  const {
    horizontalSpacing = 650,   // Increased horizontal spacing to prevent overlap
    verticalSpacing = 500,     // Increased vertical spacing for better hierarchy separation
    levelHeight = 500,         // Increased level height to match vertical spacing
    preservePositions = false,
    centerWidth = 1400,
    edgeCrossingReduction = true,
    edgeShortenFactor = 0.9
  } = options;

  try {
    // Skip if there are no nodes
    if (!nodes.length) {
      console.warn("No nodes to arrange in tree layout");
      return nodes;
    }

    console.log(`🌳 BALANCED TREE: Starting optimized hierarchical layout with ${nodes.length} nodes`);
    const startTime = performance.now();
    
    // 1. Create a fresh copy of nodes without preserving positions
    const initialNodes = JSON.parse(JSON.stringify(nodes));

    // 2. Identify parent-child relationships
    const relationships = buildNodeRelationships(initialNodes, edges);
    const { rootNodes } = relationships;
    
    console.log(`Tree layout: Found ${rootNodes.length} root nodes - applying proper spacing`);

    // 3. Assign levels to all nodes for proper hierarchy
    const levelData = assignNodeLevels(initialNodes, relationships);

    // 4. Calculate subtree sizes for balanced positioning
    const subtreeData = calculateSubtreeSizes(relationships);

    // 5. Enhanced sorting for edge crossing minimization
    for (let pass = 0; pass < 4; pass++) {
      sortNodesWithinLevels(levelData, relationships, subtreeData, initialNodes);
    }

    // 6. Position all nodes with proper spacing
    const positionedNodes = positionAllNodes(
      initialNodes,
      relationships,
      levelData,
      subtreeData,
      {
        ...options,
        horizontalSpacing,
        verticalSpacing: verticalSpacing,    // Use the actual verticalSpacing parameter
        levelHeight: levelHeight,            // Use the actual levelHeight parameter
        edgeCrossingReduction,
        edgeShortenFactor,
        minNodeDistance: 80
      }
    );
    
    // 7. Skip post-processing to avoid overriding balanced tree positions
    // const finalNodes = processNodesAfterLayout(
    //   positionedNodes,
    //   relationships,
    //   verticalSpacing
    // );
    const finalNodes = positionedNodes;
    console.log(`finalNodes ${finalNodes}`);

    // 8. Verify the arrangement is valid
    if (!verifyNodeArrangement(nodes, finalNodes)) {
      console.warn("Tree layout verification failed, using fallback layout");
      return handleLayoutError(new Error("Layout verification failed"), nodes);
    }

  /**
 * Moves every parent node horizontally to the center of its children.
 * Should be called after children positions are computed for each parent.
 */

  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  // For every parent in the graph
  for (const [parentId, childIds] of Object.entries(relationships.childrenMap)) {
    if (!childIds || childIds.length === 0) continue;

    // Gather all children's center x positions
    const childXs = childIds
      .map(id => nodeMap.get(id))
      .filter(Boolean)
      .map(child => child.position.x);

    if (childXs.length === 0) continue;
    console.log(`childXs ${childXs}`);

    // Center above children's x-span
    const minX = Math.min(...childXs);
    const maxX = Math.max(...childXs);
    const parentNode = nodeMap.get(parentId);
    console.log(`parentNode pos x ${parentNode.position.x}`);
    if (parentNode) {
      parentNode.position.x = (minX + maxX) / 2;
    }
  }


    const endTime = performance.now();
    console.log(`Tree layout completed in ${(endTime - startTime).toFixed(1)}ms with MINIMUM: 1px max edge constraint`);

    return finalNodes;
  } catch (error) {
    return handleLayoutError(error, nodes);
  }
};
