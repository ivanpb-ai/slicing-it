
import { LayoutOptions } from './LayoutTypes';

export const getDefaultLayoutOptions = {
  type: 'balanced-tree',
  nodeWidth: 180,          // match your node size
  nodeHeight: 120,
  horizontalSpacing: 60,   // reduce for compactness
  verticalSpacing: 80,     // reduce for compactness
  marginX: 40,             // less outer padding
  marginY: 30,
  preventOverlap: true,
  edgeShortenFactor: 0.85, // shrink edge rendering
  minNodeDistance: 10,     // minimum gap between nodes
  levelHeight: 1,
  maxIterations: 100
};
