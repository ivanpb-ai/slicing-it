
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
 * Creates a balanced symmetrical tree layout using a recursive approach.
 * This implementation is a simplified version of a symmetrical tree layout algorithm.
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
    horizontalSpacing = 50,
    verticalSpacing = 150,
    marginX = 0,
    marginY = 0
  } = options;

  const childrenMap: Record<string, string[]> = {};
  const parentMap: Record<string, string> = {};
  
  edges.forEach(edge => {
    if (!childrenMap[edge.source]) {
      childrenMap[edge.source] = [];
    }
    childrenMap[edge.source].push(edge.target);
    parentMap[edge.target] = edge.source;
  });

  const rootNodes = nodes.filter(node => !parentMap[node.id]);
  if (rootNodes.length === 0 && nodes.length > 0) {
    rootNodes.push(nodes[0]);
  }

  const nodeMap = new Map(nodes.map(n => [n.id, { ...n }]));
  const positions: Record<string, { x: number; y: number }> = {};

  // This function performs a post-order traversal to calculate subtree widths and positions.
  const layoutSubtree = (nodeId: string, level: number): { width: number, positions: Record<string, { x: number; y: number }> } => {
    const children = childrenMap[nodeId] || [];
    const localPositions: Record<string, { x: number; y: number }> = {};

    if (children.length === 0) {
      // Leaf node
      localPositions[nodeId] = { x: 0, y: level * verticalSpacing };
      return { width: nodeWidth, positions: localPositions };
    }

    const childrenLayouts = children.map(childId => layoutSubtree(childId, level + 1));
    
    let totalWidth = 0;
    childrenLayouts.forEach(layout => {
      totalWidth += layout.width;
    });
    totalWidth += (children.length - 1) * horizontalSpacing;

    let currentX = -totalWidth / 2;
    for (const layout of childrenLayouts) {
      for (const [id, pos] of Object.entries(layout.positions)) {
        localPositions[id] = { x: currentX + pos.x + layout.width / 2, y: pos.y };
      }
      currentX += layout.width + horizontalSpacing;
    }

    // Position the parent node in the center of its children
    const childrenXCoords = Object.entries(localPositions)
      .filter(([id]) => children.includes(id))
      .map(([, pos]) => pos.x);

    const minX = Math.min(...childrenXCoords);
    const maxX = Math.max(...childrenXCoords);
    const parentX = minX + (maxX - minX) / 2;

    localPositions[nodeId] = { x: parentX, y: level * verticalSpacing };

    return { width: totalWidth, positions: localPositions };
  };

  let totalLayoutWidth = 0;
  const allTreeLayouts = rootNodes.map(root => {
    const layout = layoutSubtree(root.id, 0);
    totalLayoutWidth += layout.width;
    return layout;
  });
  totalLayoutWidth += (rootNodes.length - 1) * horizontalSpacing * 2;

  let currentX = -totalLayoutWidth / 2;
  for (const layout of allTreeLayouts) {
    for (const [id, pos] of Object.entries(layout.positions)) {
      positions[id] = { x: currentX + pos.x + layout.width / 2 + marginX, y: pos.y + marginY };
    }
    currentX += layout.width + horizontalSpacing * 2;
  }

  const updatedNodes = Array.from(nodeMap.values()).map(node => {
    if (positions[node.id]) {
      return { ...node, position: positions[node.id] };
    }
    return node;
  });

  return updatedNodes;
};
