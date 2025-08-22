
import { Node } from '@xyflow/react';

/**
 * Optimized node renderer utility for improved performance and visual clarity
 */
export const optimizeNodeRendering = (nodes: Node[]): Node[] => {
  if (!nodes || nodes.length === 0) return nodes;
  
  console.log(`Optimizing ${nodes.length} nodes for better performance and visual clarity`);
  
  return nodes.map(node => {
    // Ensure all nodes have consistent data structure and rendering properties
    return {
      ...node,
      data: {
        ...node.data,
        // Add performance optimization flags to reduce unnecessary re-renders
        optimized: true,
        renderLabel: true,
        renderIcon: true,
      }
    };
  });
};

/**
 * Identifies nodes that are visually important (e.g., roots, selected, or focal points)
 */
export const identifyFocalNodes = (nodes: Node[], selectedNodeIds: string[] = []): Set<string> => {
  const focalNodeIds = new Set<string>();
  
  // Add selected nodes
  selectedNodeIds.forEach(id => focalNodeIds.add(id));
  
  // Add root nodes
  nodes.forEach(node => {
    // Nodes without parents are root nodes
    if (!node.parentId) {
      focalNodeIds.add(node.id);
    }
    
    // Nodes marked as important
    if (node.data?.important || node.data?.ensureVisible) {
      focalNodeIds.add(node.id);
    }
  });
  
  return focalNodeIds;
};

/**
 * Prioritize rendering of focal nodes and their immediate connections
 */
export const prioritizeNodeRendering = (
  nodes: Node[], 
  focalNodeIds: Set<string>
): Node[] => {
  if (!nodes || nodes.length === 0 || focalNodeIds.size === 0) return nodes;
  
  // Calculate rendering priority for each node
  return nodes.map(node => {
    // High priority for focal nodes
    const isFocal = focalNodeIds.has(node.id);
    
    // Medium priority for direct connections to focal nodes
    const isDirectConnection = 
      node.parentId && focalNodeIds.has(node.parentId);
    
    const renderPriority = isFocal ? 'high' : 
                          isDirectConnection ? 'medium' : 'normal';
    
    return {
      ...node,
      data: {
        ...node.data,
        renderPriority,
        // Enable detailed rendering for high and medium priority nodes
        detailedRendering: renderPriority !== 'normal'
      }
    };
  });
};

/**
 * Batch process nodes for optimal rendering performance
 */
export const batchProcessNodes = (
  nodes: Node[], 
  processingFn: (node: Node) => Node
): Node[] => {
  if (!nodes || nodes.length === 0) return nodes;
  
  // For large numbers of nodes, process in smaller batches for better performance
  const BATCH_SIZE = 50;
  const nodeCount = nodes.length;
  
  if (nodeCount <= BATCH_SIZE) {
    // For small numbers of nodes, process all at once
    return nodes.map(processingFn);
  }
  
  // For large numbers of nodes, batch process
  console.log(`Batch processing ${nodeCount} nodes in chunks of ${BATCH_SIZE}`);
  
  const resultNodes: Node[] = [];
  
  // Process nodes in batches
  for (let i = 0; i < nodeCount; i += BATCH_SIZE) {
    const batch = nodes.slice(i, Math.min(i + BATCH_SIZE, nodeCount));
    const processedBatch = batch.map(processingFn);
    resultNodes.push(...processedBatch);
  }
  
  return resultNodes;
};
