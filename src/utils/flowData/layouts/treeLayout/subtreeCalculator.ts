
import { NodeRelationships, SubtreeData } from './types';

/**
 * Calculate subtree sizes with enhanced balancing for better tree layouts
 */
export function calculateSubtreeSizes(relationships: NodeRelationships): SubtreeData {
  const { childrenMap, rootNodes } = relationships;
  
  // Calculate size of subtree for each node
  const subtreeSize: Record<string, number> = {};
  
  // Node weights for special node types
  const nodeWeights: Record<string, number> = {};
  
  // Helper function to calculate subtree size with enhanced balance
  const calculateSubtreeSize = (nodeId: string, depth: number = 0): number => {
    // Return cached value if already calculated
    if (subtreeSize[nodeId] !== undefined) {
      return subtreeSize[nodeId];
    }
    
    const children = childrenMap[nodeId] || [];
    
    // Assign base weights for leaf nodes
    if (children.length === 0) {
      // Give slightly more weight to lower-level leaf nodes for better spread
      const leafSize = 1.5 + (depth * 0.15);
      subtreeSize[nodeId] = leafSize;
      return leafSize;
    }
    
    // Calculate children subtree sizes
    const childrenSizes = children.map(childId => 
      calculateSubtreeSize(childId, depth + 1)
    );
    
    // Calculate total size of all children
    const totalChildrenSize = childrenSizes.reduce((sum, size) => sum + size, 0);
    
    // Add a balancing factor based on number of children
    // This creates more space for nodes with many children
    // Use sqrt to provide diminishing returns for very large numbers of children
    const balancingFactor = Math.max(
      1.0, 
      Math.sqrt(children.length) * 1.2
    );
    
    // Calculate the final weighted size
    // For better balance, incorporate depth into the calculation
    const depthFactor = Math.max(0.8, 1.0 - (depth * 0.03));
    const weightedSize = (totalChildrenSize + balancingFactor) * depthFactor;
    
    // Cache and return the result
    subtreeSize[nodeId] = weightedSize;
    return weightedSize;
  };
  
  // Calculate subtree sizes starting from each root node
  rootNodes.forEach(node => {
    const nodeId = node.id;
    calculateSubtreeSize(nodeId);
  });
  
  return { subtreeSize, nodeWeights };
}
