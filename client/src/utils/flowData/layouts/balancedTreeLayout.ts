
import { Node, Edge } from '@xyflow/react';

interface BalancedTreeOptions {
  nodeWidth?: number;
  nodeHeight?: number;
  horizontalSpacing?: number;
  verticalSpacing?: number;
  marginX?: number;
  marginY?: number;
}

interface TreeNode {
  id: string;
  node: Node;
  children: TreeNode[];
  parent?: TreeNode;
  level: number;
  subtreeWidth: number;
  position: { x: number; y: number };
}

/**
 * Creates a perfectly balanced symmetrical hierarchical tree layout
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
    horizontalSpacing = 250,
    verticalSpacing = 180,
    marginX = 400,
    marginY = 100
  } = options;

  console.log('✅ BALANCED TREE LAYOUT: Starting balanced hierarchical arrangement with', nodes.length, 'nodes');

  // Build parent-child relationships with multiple parent support
  const childrenMap: Record<string, string[]> = {};
  const allParentsMap: Record<string, string[]> = {};
  const primaryParentMap: Record<string, string> = {};
  
  edges.forEach(edge => {
    // Track all children
    if (!childrenMap[edge.source]) {
      childrenMap[edge.source] = [];
    }
    childrenMap[edge.source].push(edge.target);
    
    // Track all parents
    if (!allParentsMap[edge.target]) {
      allParentsMap[edge.target] = [];
    }
    allParentsMap[edge.target].push(edge.source);
    
    // Set primary parent (first one encountered, or prefer based on node type)
    if (!primaryParentMap[edge.target]) {
      primaryParentMap[edge.target] = edge.source;
    }
  });

  // Find root nodes (nodes with no parents)
  const rootNodes = nodes.filter(node => !allParentsMap[node.id] || allParentsMap[node.id].length === 0);
  
  // If no root nodes found, treat the first node as root
  if (rootNodes.length === 0 && nodes.length > 0) {
    rootNodes.push(nodes[0]);
  }

  console.log('Found', rootNodes.length, 'root nodes');

  // Build tree structure
  const buildTreeNode = (nodeId: string, level: number, parent?: TreeNode): TreeNode => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    const treeNode: TreeNode = {
      id: nodeId,
      node,
      children: [],
      parent,
      level,
      subtreeWidth: 0,
      position: { x: 0, y: 0 }
    };

    // Add children
    const children = childrenMap[nodeId] || [];
    treeNode.children = children.map(childId => buildTreeNode(childId, level + 1, treeNode));

    return treeNode;
  };

  // Create tree structures from each root
  const trees = rootNodes.map(rootNode => buildTreeNode(rootNode.id, 0));

  // Calculate subtree widths (bottom-up)
  const calculateSubtreeWidth = (treeNode: TreeNode): number => {
    if (treeNode.children.length === 0) {
      treeNode.subtreeWidth = nodeWidth;
      return nodeWidth;
    }

    const childrenWidth = treeNode.children.reduce((sum, child) => 
      sum + calculateSubtreeWidth(child), 0
    );
    const spacingWidth = (treeNode.children.length - 1) * horizontalSpacing;
    
    treeNode.subtreeWidth = Math.max(nodeWidth, childrenWidth + spacingWidth);
    return treeNode.subtreeWidth;
  };

  // Calculate subtree widths for all trees
  trees.forEach(tree => calculateSubtreeWidth(tree));

  // Position nodes (top-down)
  const positionSubtree = (treeNode: TreeNode, centerX: number) => {
    // Position current node at center
    treeNode.position = {
      x: centerX,
      y: marginY + treeNode.level * (nodeHeight + verticalSpacing)
    };

    if (treeNode.children.length === 0) return;

    // Sort children by subtree width for better balance
    const sortedChildren = [...treeNode.children].sort((a, b) => b.subtreeWidth - a.subtreeWidth);

    // Calculate positions for children
    const totalChildrenWidth = treeNode.children.reduce((sum, child) => sum + child.subtreeWidth, 0);
    const totalSpacing = (treeNode.children.length - 1) * horizontalSpacing;
    const totalWidth = totalChildrenWidth + totalSpacing;
    
    let currentX = centerX - totalWidth / 2;

    // For perfect symmetry, use center-out placement
    const arrangedChildren: TreeNode[] = [];
    
    if (sortedChildren.length === 1) {
      arrangedChildren.push(sortedChildren[0]);
    } else if (sortedChildren.length === 2) {
      // For 2 children, place symmetrically
      arrangedChildren.push(sortedChildren[0], sortedChildren[1]);
    } else {
      // For more children, place largest in center, then alternate
      const center = Math.floor(sortedChildren.length / 2);
      arrangedChildren[center] = sortedChildren[0]; // Largest in center
      
      let leftIndex = center - 1;
      let rightIndex = center + 1;
      
      for (let i = 1; i < sortedChildren.length; i++) {
        if (i % 2 === 1 && leftIndex >= 0) {
          arrangedChildren[leftIndex] = sortedChildren[i];
          leftIndex--;
        } else if (rightIndex < sortedChildren.length) {
          arrangedChildren[rightIndex] = sortedChildren[i];
          rightIndex++;
        } else if (leftIndex >= 0) {
          arrangedChildren[leftIndex] = sortedChildren[i];
          leftIndex--;
        }
      }
    }

    // Position children from left to right
    arrangedChildren.forEach(child => {
      const childCenterX = currentX + child.subtreeWidth / 2;
      positionSubtree(child, childCenterX);
      currentX += child.subtreeWidth + horizontalSpacing;
    });
  };

  // Calculate overall layout bounds
  const totalTreesWidth = trees.reduce((sum, tree) => sum + tree.subtreeWidth, 0);
  const totalSpacing = (trees.length - 1) * horizontalSpacing * 2;
  const totalWidth = totalTreesWidth + totalSpacing;
  
  // Position each tree
  let currentTreeX = marginX - totalWidth / 2;
  trees.forEach(tree => {
    const treeCenterX = currentTreeX + tree.subtreeWidth / 2;
    positionSubtree(tree, treeCenterX);
    currentTreeX += tree.subtreeWidth + horizontalSpacing * 2;
  });

  // Collect all positioned nodes
  const positionedNodes: { id: string; position: { x: number; y: number } }[] = [];
  
  const collectNodes = (treeNode: TreeNode) => {
    positionedNodes.push({
      id: treeNode.id,
      position: treeNode.position
    });
    treeNode.children.forEach(child => collectNodes(child));
  };

  trees.forEach(tree => collectNodes(tree));

  // Update original nodes with new positions
  const updatedNodes = nodes.map(node => {
    const positioned = positionedNodes.find(p => p.id === node.id);
    if (positioned) {
      return {
        ...node,
        position: positioned.position
      };
    }
    return node;
  });

  console.log('Balanced tree layout completed. Positioned', positionedNodes.length, 'nodes');

  return updatedNodes;
};
