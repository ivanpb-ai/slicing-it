
import { Node } from "@xyflow/react";
import { NodeRelationships } from "./types";
import { enforceParentChildPositioning } from "./hierarchyEnforcement/parentChildEnforcer";
import { positionCellAreaNodes } from "./hierarchyEnforcement/cellAreaPositioner";
import { assignHierarchicalPositions } from "./hierarchyEnforcement/hierarchyAssigner";

/**
 * Strictly enforces hierarchy in the tree layout
 */
export function enforceStrictHierarchy(
  nodes: Node[], 
  relationships: NodeRelationships,
  verticalSpacing: number = 150
): Node[] {
  // Get a fresh copy of nodes
  let updatedNodes = nodes.map(node => ({...node, position: {...node.position}}));
  
  // 1. Position nodes based on their type in distinct horizontal layers
  updatedNodes = assignHierarchicalPositions(updatedNodes, verticalSpacing);
  
  // 2. Within each layer, handle horizontal positioning
  updatedNodes = enforceParentChildPositioning(updatedNodes, relationships, verticalSpacing);
  
  // 3. Special handling for cell area nodes relative to network nodes
  const { nodes: cellAreaAdjustedNodes } = positionCellAreaNodes(updatedNodes);
  updatedNodes = cellAreaAdjustedNodes;
  
  return updatedNodes;
}
