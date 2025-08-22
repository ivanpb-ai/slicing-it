
import { Node, Edge } from '@xyflow/react';

interface BalancedTreeOptions {
  nodeWidth?: number;
  nodeHeight?: number;
  horizontalSpacing?: number;
  verticalSpacing?: number;
  marginX?: number;
  marginY?: number;
}

/**
 * Creates a perfectly balanced symmetrical tree layout
 */
export const arrangeNodesInBalancedTree = (
  nodes: Node[],
  edges: Edge[],
  options: BalancedTreeOptions = {}
): Node[] => {
  if (nodes.length === 0) return nodes;

  const {
    nodeWidth = 180,
    nodeHeight = 120,
    horizontalSpacing = 200,
    verticalSpacing = 150,
    marginX = 300,
    marginY = 100
  } = options;

  // Build parent-child relationships
  const childrenMap: Record<string, string[]> = {};
  const parentMap: Record<string, string> = {};
  
  edges.forEach(edge => {
    if (!childrenMap[edge.source]) {
      childrenMap[edge.source] = [];
    }
    childrenMap[edge.source].push(edge.target);
    parentMap[edge.target] = edge.source;
  });

  // Find root nodes (nodes with no parents)
  const rootNodes = nodes.filter(node => !parentMap[node.id]);
  
  // If no root nodes found, treat the first node as root
  if (rootNodes.length === 0 && nodes.length > 0) {
    rootNodes.push(nodes[0]);
  }

  // Calculate subtree sizes for balanced positioning
  const subtreeSizes: Record<string, number> = {};
  
  const calculateSubtreeSize = (nodeId: string): number => {
    if (subtreeSizes[nodeId] !== undefined) {
      return subtreeSizes[nodeId];
    }
    
    const children = childrenMap[nodeId] || [];
    if (children.length === 0) {
      subtreeSizes[nodeId] = 1;
      return 1;
    }
    
    const totalChildrenSize = children.reduce((sum, childId) => 
      sum + calculateSubtreeSize(childId), 0
    );
    
    subtreeSizes[nodeId] = Math.max(totalChildrenSize, 1);
    return subtreeSizes[nodeId];
  };

  // Calculate subtree sizes for all nodes
  nodes.forEach(node => calculateSubtreeSize(node.id));

  // Position nodes level by level
  const positioned: Record<string, boolean> = {};
  const levels: Record<number, Node[]> = {};
  
  // Assign levels
  const assignLevel = (nodeId: string, level: number) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || positioned[nodeId]) return;
    
    if (!levels[level]) levels[level] = [];
    levels[level].push(node);
    positioned[nodeId] = true;
    
    const children = childrenMap[nodeId] || [];
    children.forEach(childId => assignLevel(childId, level + 1));
  };

  // Start from root nodes
  rootNodes.forEach(rootNode => assignLevel(rootNode.id, 0));

  // Position nodes by level
  const updatedNodes = nodes.map(node => ({ ...node }));
  
  Object.keys(levels).forEach(levelStr => {
    const level = parseInt(levelStr);
    const nodesInLevel = levels[level];
    
    if (nodesInLevel.length === 0) return;
    
    // Sort nodes by subtree size for balanced appearance
    nodesInLevel.sort((a, b) => (subtreeSizes[b.id] || 1) - (subtreeSizes[a.id] || 1));
    
    // Calculate total width needed for this level
    const totalWidth = nodesInLevel.length * nodeWidth + (nodesInLevel.length - 1) * horizontalSpacing;
    const startX = marginX - totalWidth / 2;
    
    // For perfect symmetry, arrange largest subtrees in center
    const arrangedNodes: Node[] = [];
    
    if (nodesInLevel.length === 1) {
      arrangedNodes.push(nodesInLevel[0]);
    } else {
      // Place largest in center, then alternate left and right
      arrangedNodes.push(nodesInLevel[0]); // Largest goes to center
      
      for (let i = 1; i < nodesInLevel.length; i++) {
        if (i % 2 === 1) {
          arrangedNodes.unshift(nodesInLevel[i]); // Add to left
        } else {
          arrangedNodes.push(nodesInLevel[i]); // Add to right
        }
      }
    }
    
    // Position the arranged nodes
    arrangedNodes.forEach((node, index) => {
      const nodeToUpdate = updatedNodes.find(n => n.id === node.id);
      if (nodeToUpdate) {
        nodeToUpdate.position = {
          x: startX + index * (nodeWidth + horizontalSpacing) + nodeWidth / 2,
          y: marginY + level * (nodeHeight + verticalSpacing)
        };
      console.log(`nodeToUpdate: ${JSON.stringify(nodeToUpdate.position)}`);
      }
    });
  });

  return updatedNodes;
};
