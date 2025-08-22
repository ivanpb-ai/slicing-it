
import { Node } from "@xyflow/react";
import { NodeVisibilityProps, VisibilityEnforcementData } from "./types";

/**
 * Applies visibility properties to network and cell-area nodes
 */
export function enforceNodeVisibility(node: Node, nodeType: string): Node {
  // Create a deep copy of the node to avoid mutating the input
  const updatedNode = {...node};
  
  // Different styling based on node type
  const visibilityStyle: NodeVisibilityProps = {
    visibility: 'visible',
    display: 'flex',
    opacity: 1,
    zIndex: nodeType === 'network' ? 1900 : 1800
  };
  
  // Apply visibility styles
  updatedNode.style = {
    ...updatedNode.style,
    ...visibilityStyle
  };
  
  // Add data attributes to help with DOM selection
  const visibilityData: VisibilityEnforcementData = {
    ensureVisible: true,
    forceVisible: true,
    visibilityEnforced: true,
    preventHiding: true
  };
  
  updatedNode.data = {
    ...updatedNode.data,
    ...visibilityData
  };
  
  return updatedNode;
}
