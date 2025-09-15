
import { Node, Edge } from '@xyflow/react';
import { LayoutOptions } from './LayoutTypes';
import { getDefaultLayoutOptions } from './DefaultLayoutOptions';
import { applyFallbackLayout } from './FallbackLayout';
import { arrangeNodesInBalancedTree } from '../balancedTreeLayout';
import { preventNodeOverlap } from '../preventOverlap';

/**
 * Process nodes with the selected layout algorithm
 */
export const processNodesWithLayout = (
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): Node[] => {
  if (!nodes || nodes.length === 0) {
    return [];
  }
  
  // Merge default options with provided options
  const defaultOptions = getDefaultLayoutOptions;
  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    // Choose layout based on type
    let arrangedNodes: Node[] = [];
    
    console.log(`LayoutProcessor: Using layout type '${mergedOptions.type}' from options:`, mergedOptions);
    
    // Only support balanced-tree layout
    console.log(`LayoutProcessor: Using balanced-tree layout with options:`, mergedOptions);
    
    const balancedResult = arrangeNodesInBalancedTree(nodes, edges, {
      nodeWidth: mergedOptions.nodeWidth,
      nodeHeight: mergedOptions.nodeHeight,
      horizontalSpacing: mergedOptions.horizontalSpacing || mergedOptions.spacing,
      verticalSpacing: mergedOptions.verticalSpacing || 500,
      marginX: mergedOptions.marginX,
      marginY: mergedOptions.marginY
    });
    arrangedNodes = balancedResult.nodes;
    // Store cleaned edges in global variable for use by the calling function
    (window as any).__CLEANED_EDGES__ = balancedResult.cleanedEdges;
    
    // Balanced-tree layout preserves symmetry, no overlap prevention needed
    
    return arrangedNodes;
  } catch (error) {
    console.error('Layout arrangement failed, using fallback:', error);
    // Use simple fallback layout
    return applyFallbackLayout(nodes);
  }
};
