
import { LayoutOptions } from './LayoutTypes';

export const getDefaultLayoutOptions = {
  type: 'balanced-tree',
  nodeWidth: 180,          // match your node size
  nodeHeight: 120,
  horizontalSpacing: 250,  // optimal spacing for balanced tree
  verticalSpacing: 180,    // optimal vertical spacing for balanced tree
  marginX: 400,            // wider margins for better balanced tree centering
  marginY: 100,            // optimal top margin for balanced tree
  preventOverlap: true,
  edgeShortenFactor: 0.95, // optimal edge factor for balanced tree
  minNodeDistance: 10,     // minimum gap between nodes
  levelHeight: 1,
  maxIterations: 100
};
