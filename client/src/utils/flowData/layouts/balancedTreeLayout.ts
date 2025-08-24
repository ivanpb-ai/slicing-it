
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

  // Create node ID set for validation
  const nodeIds = new Set(nodes.map(node => node.id));
  console.log('Available node IDs:', Array.from(nodeIds));

  // Filter edges to only include those with valid nodes
  const validEdges = edges.filter(edge => {
    const sourceExists = nodeIds.has(edge.source);
    const targetExists = nodeIds.has(edge.target);
    
    if (!sourceExists || !targetExists) {
      console.warn(`Skipping invalid edge: ${edge.source} -> ${edge.target} (source exists: ${sourceExists}, target exists: ${targetExists})`);
    }
    
    return sourceExists && targetExists;
  });

  console.log(`Filtered edges: ${edges.length} -> ${validEdges.length} valid edges`);

  // Build parent-child relationships with multiple parent support using only valid edges
  const childrenMap: Record<string, string[]> = {};
  const allParentsMap: Record<string, string[]> = {};
  const primaryParentMap: Record<string, string> = {};
  
  validEdges.forEach(edge => {
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

  // Build tree structure with cycle detection
  const buildTreeNode = (nodeId: string, level: number, visited: Set<string> = new Set(), parent?: TreeNode): TreeNode => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) {
      console.error(`Node ${nodeId} not found`);
      throw new Error(`Node ${nodeId} not found`);
    }

    // Prevent infinite cycles
    if (visited.has(nodeId)) {
      console.warn(`Cycle detected at node ${nodeId}, skipping children`);
      return {
        id: nodeId,
        node,
        children: [],
        parent,
        level,
        subtreeWidth: 0,
        position: { x: 0, y: 0 }
      };
    }

    visited.add(nodeId);

    const treeNode: TreeNode = {
      id: nodeId,
      node,
      children: [],
      parent,
      level,
      subtreeWidth: 0,
      position: { x: 0, y: 0 }
    };

    // Add children with cycle protection
    const children = childrenMap[nodeId] || [];
    treeNode.children = children.map(childId => 
      buildTreeNode(childId, level + 1, new Set(visited), treeNode)
    );

    return treeNode;
  };

  // Create tree structures from each root with error handling
  const trees: TreeNode[] = [];
  try {
    for (const rootNode of rootNodes) {
      const tree = buildTreeNode(rootNode.id, 0);
      trees.push(tree);
    }
  } catch (error) {
    console.error('Error building tree structure:', error);
    throw error;
  }

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

  // Position nodes (top-down) with perfect symmetry
  const positionSubtree = (treeNode: TreeNode, centerX: number) => {
    // Position current node at center
    treeNode.position = {
      x: centerX,
      y: marginY + treeNode.level * (nodeHeight + verticalSpacing)
    };

    if (treeNode.children.length === 0) return;

    // For perfect symmetry, use consistent spacing and center alignment
    const childCount = treeNode.children.length;
    
    if (childCount === 1) {
      // Single child: center under parent
      positionSubtree(treeNode.children[0], centerX);
    } else {
      // Multiple children: distribute symmetrically around center
      const totalChildrenSpacing = (childCount - 1) * horizontalSpacing;
      const startX = centerX - totalChildrenSpacing / 2;
      
      // Sort children by their original order for consistency
      const orderedChildren = [...treeNode.children];
      
      // For even number of children, place symmetrically around center
      // For odd number, place one at center
      orderedChildren.forEach((child, index) => {
        const childX = startX + index * horizontalSpacing;
        positionSubtree(child, childX);
      });
    }
  };

  // Calculate overall layout bounds and center the entire graph
  const totalTrees = trees.length;
  
  if (totalTrees === 1) {
    // Single tree: center it perfectly
    positionSubtree(trees[0], 0);
  } else {
    // Multiple trees: distribute symmetrically around center
    const treeSpacing = horizontalSpacing * 3; // Larger spacing between separate trees
    const totalTreesSpacing = (totalTrees - 1) * treeSpacing;
    const startX = -totalTreesSpacing / 2;
    
    trees.forEach((tree, index) => {
      const treeCenterX = startX + index * treeSpacing;
      positionSubtree(tree, treeCenterX);
    });
  }

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
