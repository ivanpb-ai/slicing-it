
/**
 * Available layout types
 */
export type LayoutType = 'balanced-tree';

/**
 * Layout configuration options
 */
export interface LayoutOptions {
  type?: LayoutType;
  spacing?: number;
  nodeWidth?: number;
  nodeHeight?: number;
  marginX?: number;
  marginY?: number;
  preventOverlap?: boolean;
  compactFactor?: number;
  edgeShortenFactor?: number;
  horizontalSpacing?: number;
  verticalSpacing?: number;
  levelHeight?: number;
  minNodeDistance?: number;
  maxIterations?: number;
}
