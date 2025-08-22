
import { Node } from '@xyflow/react';
import { NodeRelationships, NodeLevelData } from './types';

/**
 * Assigns levels to nodes based on their position in the hierarchy
 * for horizontal layout (levels are columns instead of rows)
 */
export function assignNodeLevels(nodes: Node[], relationships: NodeRelationships): NodeLevelData {
  const { childrenMap, rootNodes } = relationships;
  
  // Initialize level tracking
  const levelNodes: Record<number, Node[]> = {};
  const nodeLevels: Record<string, number> = {};
  
  // Assign levels starting from root nodes
  const assignLevels = (nodeId: string, level: number, visited = new Set<string>()) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    // Store the node's level
    nodeLevels[nodeId] = level;
    
    // Add node to this level's collection
    if (!levelNodes[level]) {
      levelNodes[level] = [];
    }
    levelNodes[level].push(node);
    
    // Process children
    const children = childrenMap[nodeId] || [];
    children.forEach(childId => {
      assignLevels(childId, level + 1, visited);
    });
  };
  
  // Start building hierarchy from root nodes
  rootNodes.forEach(rootNode => {
    assignLevels(rootNode.id, 0);
  });
  
  return { levelNodes, nodeLevels };
}
