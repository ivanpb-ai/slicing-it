import { Node } from '@xyflow/react';

const DEFAULT_NODE_WIDTH = 180;
const DEFAULT_NODE_HEIGHT = 130;
const DEFAULT_PADDING = 100;
const MAX_ITERATIONS = 50;
const EDGE_SHORTEN_FACTOR = 0.9;

// Interface for the overlap prevention context
interface OverlapContext {
  nodes: Node[];
  nodeWidth: number;
  nodeHeight: number;
  padding: number;
  edgeShortenFactor: number;
}

/**
 * Returns the additional padding needed for a specific node type
 */
const getNodeTypePadding = (nodeType?: string): number => {
  if (!nodeType) return 0;

  switch (nodeType) {
    case 's-nssai': return 60;
    case 'dnn': return 55;
    case '5qi': return 70;
    case 'network': return 50;
    case 'cell-area': return 120;
    case 'rrp': return 80;
    default: return 30;
  }
};

/**
 * Get node dimensions based on type
 */
const getNodeDimensions = (node: Node, defaultWidth: number, defaultHeight: number): { width: number, height: number } => {
  const nodeType = typeof node.data?.type === 'string' ? node.data?.type : '';
  
  if (nodeType === 'rrp') {
    return { width: 180, height: 180 };
  }
  
  if (nodeType === 'cell-area') {
    return { width: 150, height: 120 };
  }
  
  return { width: defaultWidth, height: defaultHeight };
};

/**
 * Determines if two nodes are overlapping
 */
const isNodeOverlapping = (nodeA: Node, nodeB: Node, context: OverlapContext): boolean => {
  if (nodeA.id === nodeB.id) return false;
  if (nodeA.dragging || nodeB.dragging) return false;
  if (nodeA.data?.recentlyCreated || nodeB.data?.recentlyCreated) return false;

  // Get node types
  const aType = typeof nodeA.data?.type === 'string' ? nodeA.data?.type : '';
  const bType = typeof nodeB.data?.type === 'string' ? nodeB.data?.type : '';

  // Add padding based on node types
  const extraPaddingA = getNodeTypePadding(aType);
  const extraPaddingB = getNodeTypePadding(bType);
  
  const totalPadding = context.padding + extraPaddingA + extraPaddingB;

  // Get node dimensions
  const nodeADimensions = getNodeDimensions(nodeA, context.nodeWidth, context.nodeHeight);
  const nodeBDimensions = getNodeDimensions(nodeB, context.nodeWidth, context.nodeHeight);

  // Calculate boundaries
  const aLeft = nodeA.position.x;
  const aRight = nodeA.position.x + nodeADimensions.width;
  const aTop = nodeA.position.y;
  const aBottom = nodeA.position.y + nodeADimensions.height;

  const bLeft = nodeB.position.x;
  const bRight = nodeB.position.x + nodeBDimensions.width;
  const bTop = nodeB.position.y;
  const bBottom = nodeB.position.y + nodeBDimensions.height;

  // Check for overlap with padding
  return !(
    aLeft > bRight + totalPadding ||
    aRight + totalPadding < bLeft ||
    aTop > bBottom + totalPadding ||
    aBottom + totalPadding < bTop
  );
};

/**
 * Resolves overlap between two nodes with smart positioning
 */
const resolveOverlap = (nodeA: Node, nodeB: Node, context: OverlapContext): void => {
  // Get node types
  const aType = typeof nodeA.data?.type === 'string' ? nodeA.data?.type : '';
  const bType = typeof nodeB.data?.type === 'string' ? nodeB.data?.type : '';
  
  // Calculate centers
  const centerAX = nodeA.position.x + context.nodeWidth / 2;
  const centerBX = nodeB.position.x + context.nodeWidth / 2;
  const centerAY = nodeA.position.y + context.nodeHeight / 2;
  const centerBY = nodeB.position.y + context.nodeHeight / 2;

  // If nodes are in the same layer (same type), resolve horizontally
  if (aType === bType) {
    const moveDistanceX = context.nodeWidth + context.padding;
    const directionX = centerAX <= centerBX ? -1 : 1;
    
    nodeA.position.x += directionX * moveDistanceX * 0.5;
    nodeB.position.x -= directionX * moveDistanceX * 0.5;
  } 
  // For nodes in different layers, preserve vertical alignment but adjust spacing
  else {
    // Maintain X alignment if they're close horizontally
    if (Math.abs(centerAX - centerBX) < context.nodeWidth * 0.5) {
      // Keep X aligned, adjust Y if needed
      const isAAboveB = centerAY < centerBY;
      const idealVerticalSpacing = 200; // Match the 200px layer height
      
      if (isAAboveB) {
        const currentSpacing = centerBY - centerAY;
        if (currentSpacing < idealVerticalSpacing) {
          const adjustment = (idealVerticalSpacing - currentSpacing) / 2;
          nodeA.position.y -= adjustment;
          nodeB.position.y += adjustment;
        }
      } else {
        const currentSpacing = centerAY - centerBY;
        if (currentSpacing < idealVerticalSpacing) {
          const adjustment = (idealVerticalSpacing - currentSpacing) / 2;
          nodeB.position.y -= adjustment;
          nodeA.position.y += adjustment;
        }
      }
    } 
    // Otherwise move horizontally to avoid overlap
    else {
      const moveDistanceX = context.nodeWidth + context.padding;
      const directionX = centerAX <= centerBX ? -1 : 1;
      
      nodeA.position.x += directionX * moveDistanceX * 0.5;
      nodeB.position.x -= directionX * moveDistanceX * 0.5;
    }
  }
};

/**
 * Process a pair of nodes to resolve any overlap
 */
const processNodePair = (nodeA: Node, nodeB: Node, context: OverlapContext): boolean => {
  if (isNodeOverlapping(nodeA, nodeB, context)) {
    resolveOverlap(nodeA, nodeB, context);
    return true;
  }
  return false;
};

/**
 * Perform one iteration of overlap resolution across all node pairs
 */
const performOverlapIteration = (nodes: Node[], context: OverlapContext): boolean => {
  let hasOverlap = false;
  
  // Group nodes by type (layer)
  const nodesByType: Record<string, Node[]> = {};
  
  nodes.forEach(node => {
    const nodeType = node.data?.type as string;
    if (!nodeType) return;
    
    if (!nodesByType[nodeType]) {
      nodesByType[nodeType] = [];
    }
    nodesByType[nodeType].push(node);
  });
  
  // First process overlaps within the same layer (type)
  Object.values(nodesByType).forEach(nodesOfType => {
    for (let i = 0; i < nodesOfType.length; i++) {
      for (let j = i + 1; j < nodesOfType.length; j++) {
        if (processNodePair(nodesOfType[i], nodesOfType[j], context)) {
          hasOverlap = true;
        }
      }
    }
  });
  
  // Then process overlaps between different layers
  const nodeTypes = Object.keys(nodesByType);
  for (let i = 0; i < nodeTypes.length; i++) {
    for (let j = i + 1; j < nodeTypes.length; j++) {
      const typeA = nodeTypes[i];
      const typeB = nodeTypes[j];
      
      for (const nodeA of nodesByType[typeA]) {
        for (const nodeB of nodesByType[typeB]) {
          if (processNodePair(nodeA, nodeB, context)) {
            hasOverlap = true;
          }
        }
      }
    }
  }
  
  return hasOverlap;
};

/**
 * Main function to prevent node overlap
 */
export const preventNodeOverlap = (
  nodes: Node[],
  nodeWidth: number = DEFAULT_NODE_WIDTH,
  nodeHeight: number = DEFAULT_NODE_HEIGHT,
  padding: number = DEFAULT_PADDING,
  maxIterations: number = MAX_ITERATIONS,
  edgeShortenFactor: number = EDGE_SHORTEN_FACTOR
): Node[] => {
  if (nodes.length <= 1) return nodes;

  const newNodes = JSON.parse(JSON.stringify(nodes));

  const context: OverlapContext = {
    nodes: newNodes,
    nodeWidth,
    nodeHeight,
    padding,
    edgeShortenFactor
  };

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const hasOverlap = performOverlapIteration(newNodes, context);
    
    if (!hasOverlap) {
      console.log(`Overlap prevention completed in ${iteration + 1} iterations`);
      break;
    }
    
    // If we're on the last iteration and still have overlaps, log a warning
    if (iteration === maxIterations - 1) {
      console.warn(`Could not completely resolve all node overlaps after ${maxIterations} iterations`);
    }
  }

  return newNodes;
};
