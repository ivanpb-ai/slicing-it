
import { XYPosition } from '@xyflow/react';
import { NodeType } from '@/types/nodeTypes';

/**
 * Creates a child node with standard positioning and fixed edge length
 */
export const createChildNodeWithEdge = (
  createChildNode: (type: NodeType, position: XYPosition, parentId: string, fiveQIId?: string) => void,
  nodeType: NodeType,
  position: XYPosition,
  parentId: string,
  fiveQIId?: string
): void => {
  console.log(`Creating child node of type ${nodeType} for parent ${parentId} at position:`, position);
  
  // Create the child node immediately
  try {
    // Create the child node with position as provided
    createChildNode(nodeType, position, parentId, fiveQIId);
    console.log(`Added ${nodeType} child node for parent ${parentId}`);
    
    // Dispatch events to ensure visibility
    window.dispatchEvent(new CustomEvent('edge-created'));
    window.dispatchEvent(new CustomEvent('node-added'));
  } catch (err) {
    console.error("Error creating child node:", err);
  }
};
