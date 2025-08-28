
import { Node, Edge } from '@xyflow/react';
import { LayoutOptions } from './LayoutTypes';
import { getDefaultLayoutOptions } from './DefaultLayoutOptions';
import { applyFallbackLayout } from './FallbackLayout';
import { arrangeNodesInGrid } from '../gridLayout';
import { arrangeNodesInTreeLayout } from '../treeLayout/treeLayoutEngine';
import { arrangeNodesInGridRows } from '../gridRowLayout';
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
    
    switch (mergedOptions.type) {
      case 'balanced-tree':
        // Use the new balanced tree layout
        arrangedNodes = arrangeNodesInBalancedTree(nodes, edges, {
          nodeWidth: mergedOptions.nodeWidth,
          nodeHeight: mergedOptions.nodeHeight,
          horizontalSpacing: mergedOptions.horizontalSpacing || mergedOptions.spacing,
          verticalSpacing: mergedOptions.verticalSpacing || 500,
          marginX: mergedOptions.marginX,
          marginY: mergedOptions.marginY
        });
        break;
        
      case 'gridrows':
        // Use our grid rows layout
        arrangedNodes = arrangeNodesInGridRows(nodes, {
          cellWidth: mergedOptions.nodeWidth,
          cellHeight: mergedOptions.nodeHeight,
          marginX: mergedOptions.marginX,
          marginY: mergedOptions.marginY,
          spacing: mergedOptions.spacing
        });
        break;
        
      case 'tree':
        // Use improved tree layout with balanced distribution
        arrangedNodes = arrangeNodesInTreeLayout(nodes, edges, {
          spacing: mergedOptions.spacing,
          nodeWidth: mergedOptions.nodeWidth,
          nodeHeight: mergedOptions.nodeHeight,
          marginX: mergedOptions.marginX,
          marginY: mergedOptions.marginY,
          compactFactor: mergedOptions.compactFactor,
          edgeShortenFactor: mergedOptions.edgeShortenFactor,
          horizontalSpacing: mergedOptions.horizontalSpacing, 
          verticalSpacing: mergedOptions.verticalSpacing,
          levelHeight: mergedOptions.levelHeight,
          preventOverlap: mergedOptions.preventOverlap,
          minNodeDistance: mergedOptions.minNodeDistance
        });
        break;
        
      case 'grid':
      default:
        // Use grid layout for maximum stability
        arrangedNodes = arrangeNodesInGrid(nodes, {
          spacing: mergedOptions.spacing,
          marginX: mergedOptions.marginX,
          marginY: mergedOptions.marginY,
          nodeWidth: mergedOptions.nodeWidth,
          nodeHeight: mergedOptions.nodeHeight,
          preventOverlap: mergedOptions.preventOverlap,
          minNodeDistance: mergedOptions.minNodeDistance
        });
        break;
    }
    
    // Apply overlap prevention as a post-processing step if requested
    // Skip overlap prevention for balanced-tree layout to preserve symmetry
    if (mergedOptions.preventOverlap && mergedOptions.type !== 'balanced-tree') {
      return preventNodeOverlap(
        arrangedNodes, 
        mergedOptions.nodeWidth || 180, 
        mergedOptions.nodeHeight || 120, 
        mergedOptions.minNodeDistance || 80, 
        mergedOptions.maxIterations || 50,
        mergedOptions.edgeShortenFactor || 0.8
      );
    }
    
    return arrangedNodes;
  } catch (error) {
    console.error('Layout arrangement failed, using fallback:', error);
    // Use simple fallback layout
    return applyFallbackLayout(nodes);
  }
};
