
import { LayoutOptions } from './LayoutTypes';

/**
 * Default layout options with absolute minimum edge length
 */
export const getDefaultLayoutOptions = (): LayoutOptions => ({
  type: 'tree',
  spacing: 200,
  nodeWidth: 180,
  nodeHeight: 120,
  marginX: 200,
  marginY: 50,
  preventOverlap: true,
  compactFactor: 0.9,
  edgeShortenFactor: 0.9,
  maxIterations: 100,
  verticalSpacing: 100,      // Absolute minimum: 1px edge length
  horizontalSpacing: 100,
  levelHeight: 10,          // Absolute minimum: 1px edge length
  minNodeDistance: 50
});
