
import { Node } from "@xyflow/react";
import { NodeRelationships } from "./types";
import { enforceStrictHierarchy } from "./hierarchyEnforcer";

/**
 * Applies post-processing steps to nodes after layout calculation
 * including hierarchy enforcement for parent-child relationships
 */
export function processNodesAfterLayout(
  nodes: Node[],
  relationships: NodeRelationships,
  verticalSpacing: number
): Node[] {
  // Ensure strict hierarchical ordering based on node types
  return enforceStrictHierarchy(nodes, relationships, verticalSpacing);
}
