
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
  // MINIMUM: All vertical spacing must be exactly 1px
  const {
    horizontalSpacing = 280,
    verticalSpacing = 1,     // Minimum: 1px edge length
    levelHeight = 1,         // Minimum: 1px edge length
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

    console.log(`Tree layout starting with ${nodes.length} nodes - ENFORCING MINIMUM: 1px max edge length`);
    const startTime = performance.now();
    
    // 1. Create a fresh copy of nodes without preserving positions
    const initialNodes = JSON.parse(JSON.stringify(nodes));

    // 2. Identify parent-child relationships
    const relationships = buildNodeRelationships(initialNodes, edges);
    const { rootNodes } = relationships;
    
    console.log(`Tree layout: Found ${rootNodes.length} root nodes - applying 1px edge constraint`);

    // 3. Assign levels to all nodes for proper hierarchy
    const levelData = assignNodeLevels(initialNodes, relationships);

    // 4. Calculate subtree sizes for balanced positioning
    const subtreeData = calculateSubtreeSizes(relationships);

    // 5. Enhanced sorting for edge crossing minimization
    for (let pass = 0; pass < 4; pass++) {
      sortNodesWithinLevels(levelData, relationships, subtreeData, initialNodes);
    }

    // 6. Position all nodes with MINIMUM 1px spacing
    const positionedNodes = positionAllNodes(
      initialNodes,
      relationships,
      levelData,
      subtreeData,
      {
        ...options,
        horizontalSpacing,
        verticalSpacing: 1,     // Minimum: Exactly 1px
        levelHeight: 1,         // Minimum: Exactly 1px
        edgeCrossingReduction,
        edgeShortenFactor,
        minNodeDistance: 80
      }
    );
    
    // 7. Apply post-processing with MINIMUM 1px vertical spacing
    const finalNodes = processNodesAfterLayout(
      positionedNodes,
      relationships,
      1 // Minimum: 1px vertical spacing
    );
    
    // 8. Verify the arrangement is valid
    if (!verifyNodeArrangement(nodes, finalNodes)) {
      console.warn("Tree layout verification failed, using fallback layout");
      return handleLayoutError(new Error("Layout verification failed"), nodes);
    }

    const endTime = performance.now();
    console.log(`Tree layout completed in ${(endTime - startTime).toFixed(1)}ms with MINIMUM: 1px max edge constraint`);

    return finalNodes;
  } catch (error) {
    return handleLayoutError(error, nodes);
  }
};
