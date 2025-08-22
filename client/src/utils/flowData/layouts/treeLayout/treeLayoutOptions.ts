
/**
 * Options for the tree layout algorithm
 */
export interface TreeLayoutOptions {
  // General spacing and dimensions
  spacing?: number;
  horizontalSpacing?: number;
  verticalSpacing?: number;
  levelHeight?: number;
  nodeWidth?: number;
  nodeHeight?: number;
  marginX?: number;
  marginY?: number;
  
  // Layout behavior
  compactFactor?: number;
  edgeShortenFactor?: number;
  enforceHierarchy?: boolean;
  preservePositions?: boolean;
  preventOverlap?: boolean;
  skipStableLayout?: boolean;
  skipNodeRearrangement?: boolean;
  centerWidth?: number;
  minNodeDistance?: number;
  maxIterations?: number;
  
  // Edge crossing prevention
  edgeCrossingReduction?: boolean;
  siblingSpacing?: number;
  
  // Node specific options
  enforceNetworkCellRelationship?: boolean;
  forceVerticalAlignment?: boolean;
}
