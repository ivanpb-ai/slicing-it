
import { Node } from '@xyflow/react';
import { NodeRelationships, NodeLevelData } from './types';

/**
 * Assign levels to nodes based on their depth in the tree
 */
export function assignNodeLevels(nodes: Node[], relationships: NodeRelationships): NodeLevelData {
  const { childrenMap, parentMap, rootNodes } = relationships;
  
  // Initialize node levels data structure
  const levelNodes: Record<number, Node[]> = {};
  const nodeLevels: Record<string, number> = {};
  
  // Helper function to assign level to a node and its children
  const assignLevel = (node: Node, level: number) => {
    const nodeId = node.id;
    
    // If node already has a level assigned, use the minimum level
    if (nodeLevels[nodeId] !== undefined) {
      nodeLevels[nodeId] = Math.min(nodeLevels[nodeId], level);
    } else {
      nodeLevels[nodeId] = level;
    }
    
    // Ensure levelNodes[level] exists
    if (!levelNodes[level]) {
      levelNodes[level] = [];
    }
    
    // Add node to its level if not already there
    if (!levelNodes[level].some(n => n.id === nodeId)) {
      levelNodes[level].push(node);
    }
    
    // Recursively assign levels to children
    const children = childrenMap[nodeId] || [];
    children.forEach(childId => {
      const childNode = nodes.find(n => n.id === childId);
      if (childNode) {
        assignLevel(childNode, level + 1);
      }
    });
  };
  
  // Start by assigning level 0 to all root nodes
  rootNodes.forEach(rootNode => {
    assignLevel(rootNode, 0);
  });
  
  // Handle any orphaned nodes (assign them level 0)
  nodes.forEach(node => {
    if (nodeLevels[node.id] === undefined) {
      console.warn(`Node ${node.id} not connected to root, assigning level 0`);
      assignLevel(node, 0);
    }
  });
  
  return { levelNodes, nodeLevels };
}
