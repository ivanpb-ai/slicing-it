
import { Node, Edge } from '@xyflow/react';
import { LayoutOptions } from './index';

/**
 * Arranges nodes in a circular layout with connected nodes placed adjacently to reduce edge crossings
 */
export const arrangeNodesInCircle = (
  nodes: Node[],
  edges: Edge[] = [], // Add edges parameter to optimize for crossings
  options: LayoutOptions = {}
): Node[] => {
  if (nodes.length === 0) return nodes;
  
  // Extract options with defaults
  const {
    spacing = 100,
    nodeWidth = 180,
    nodeHeight = 100,
    compactFactor = 1.0, // Default is no additional compaction
  } = options;
  
  // Clone the nodes to avoid modifying the originals
  const newNodes = [...nodes];
  
  // Build connection maps for optimization
  const connections: Record<string, Set<string>> = {};
  
  edges.forEach(edge => {
    if (!connections[edge.source]) {
      connections[edge.source] = new Set();
    }
    if (!connections[edge.target]) {
      connections[edge.target] = new Set();
    }
    
    connections[edge.source].add(edge.target);
    connections[edge.target].add(edge.source); // Bidirectional for layout purposes
  });
  
  // Calculate center point (average of all node positions)
  let centerX = 0;
  let centerY = 0;
  
  nodes.forEach(node => {
    centerX += node.position.x;
    centerY += node.position.y;
  });
  
  centerX /= nodes.length;
  centerY /= nodes.length;
  
  // Calculate radius based on node count and adjusted by compactFactor
  // More nodes require a larger radius to prevent overlap
  const baseRadius = Math.max(nodes.length * spacing / (2 * Math.PI), 250);
  const radius = baseRadius * compactFactor;
  
  // Optimize node ordering to minimize edge crossings
  const optimizedOrder: Node[] = [];
  const remaining = new Set(newNodes.map(node => node.id));
  
  // Start with a node that has the most connections (likely central to the graph)
  let startNodeId = newNodes[0].id;
  let maxConnections = 0;
  
  for (const node of newNodes) {
    const connectionCount = (connections[node.id]?.size || 0);
    if (connectionCount > maxConnections) {
      maxConnections = connectionCount;
      startNodeId = node.id;
    }
  }
  
  // Add the start node
  const startNode = newNodes.find(n => n.id === startNodeId);
  if (startNode) {
    optimizedOrder.push(startNode);
    remaining.delete(startNodeId);
  }
  
  // Add connected nodes in order of connection strength
  while (remaining.size > 0) {
    let nextNodeId: string | null = null;
    let highestConnectionScore = -1;
    
    // For each remaining node, calculate a score based on connections to already placed nodes
    for (const nodeId of remaining) {
      let connectionScore = 0;
      
      // Check connections to already placed nodes
      for (const placedNode of optimizedOrder) {
        if (connections[nodeId]?.has(placedNode.id)) {
          // Higher score for more recent additions to encourage clustering
          const placedIndex = optimizedOrder.findIndex(n => n.id === placedNode.id);
          const recencyBonus = optimizedOrder.length - placedIndex;
          connectionScore += 1 + (recencyBonus * 0.5);
        }
      }
      
      if (connectionScore > highestConnectionScore) {
        highestConnectionScore = connectionScore;
        nextNodeId = nodeId;
      }
    }
    
    // If no connections, take the first remaining node
    if (nextNodeId === null && remaining.size > 0) {
      nextNodeId = Array.from(remaining)[0];
    }
    
    if (nextNodeId) {
      const nextNode = newNodes.find(n => n.id === nextNodeId);
      if (nextNode) {
        optimizedOrder.push(nextNode);
        remaining.delete(nextNodeId);
      }
    }
  }
  
  // Position nodes in the optimized order
  const angleStep = (2 * Math.PI) / optimizedOrder.length;
  
  optimizedOrder.forEach((node, index) => {
    const angle = angleStep * index;
    const x = centerX + radius * Math.cos(angle) - nodeWidth / 2;
    const y = centerY + radius * Math.sin(angle) - nodeHeight / 2;
    
    node.position = { x, y };
  });
  
  return newNodes;
};
