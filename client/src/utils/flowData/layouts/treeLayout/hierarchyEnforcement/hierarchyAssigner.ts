
import { Node } from "@xyflow/react";
import { HIERARCHY_LEVELS } from "../../constants";

/**
 * Assigns strict Y positions based on node type tier
 * This ensures each node type is in its own horizontal layer
 */
export function assignHierarchicalPositions(nodes: Node[], verticalSpacing: number): Node[] {
  // Group nodes by their type
  const nodesByType: Record<string, Node[]> = {};
  
  // First pass: group nodes by type
  nodes.forEach(node => {
    const nodeType = node.data?.type as string;
    if (!nodeType) return;
    
    if (!nodesByType[nodeType]) {
      nodesByType[nodeType] = [];
    }
    nodesByType[nodeType].push(node);
  });
  
  // Second pass: position each node in its respective layer
  return nodes.map(node => {
    // Create a deep copy to avoid mutation
    const updatedNode = {...node, position: {...node.position}};
    
    // Get the node type
    const nodeType = updatedNode.data?.type as string;
    if (!nodeType || !HIERARCHY_LEVELS.hasOwnProperty(nodeType)) {
      console.warn(`Node ${updatedNode.id} has unknown type: ${nodeType}`);
      return updatedNode;
    }
    
    // Calculate Y position based on hierarchy level with updated spacing
    const hierarchyLevel = HIERARCHY_LEVELS[nodeType];
    const baseYPosition = 50 + (hierarchyLevel * 100); // Much shorter for compact edges
    
    // Get all nodes of this type to calculate horizontal position
    const nodesOfThisType = nodesByType[nodeType] || [];
    const nodeIndex = nodesOfThisType.findIndex(n => n.id === updatedNode.id);
    
    // Calculate horizontal spacing based on number of nodes in this layer
    const totalNodesInType = nodesOfThisType.length;
    const horizontalSpacing = 800; // Use consistent horizontal spacing
    const totalWidth = totalNodesInType * horizontalSpacing;
    const startX = 150 - (totalWidth / 2) + (horizontalSpacing / 2);
    
    // Set the position
    updatedNode.position = {
      x: startX + (nodeIndex * horizontalSpacing),
      y: baseYPosition
    };
    
    return updatedNode;
  });
}
