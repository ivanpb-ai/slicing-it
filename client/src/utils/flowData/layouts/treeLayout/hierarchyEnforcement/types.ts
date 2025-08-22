
import { Node } from "@xyflow/react";
import { NodeRelationships } from "../types";

export interface NodeVisibilityProps {
  visibility: 'visible';
  display: 'flex';
  opacity: number;
  zIndex: number;
}

export interface VisibilityEnforcementData {
  ensureVisible: boolean;
  forceVisible: boolean;
  visibilityEnforced: boolean;
  preventHiding: boolean;
}

export interface CellAreaPositioningResult {
  nodes: Node[];
  changed: boolean;
}
