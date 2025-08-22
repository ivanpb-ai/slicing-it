import { Node } from "@xyflow/react";
import { CellAreaPositioningResult } from "./types";

/**
 * Standard positioning for cell-area nodes - no special treatment
 */
export function positionCellAreaNodes(nodes: Node[]): CellAreaPositioningResult {
  // Return unchanged nodes - cell areas are treated like any other node
  return { nodes, changed: false };
}
