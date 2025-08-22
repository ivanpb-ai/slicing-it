
import { Node } from '@xyflow/react';
import { NodeSpacingData } from './types';
import { TreeLayoutOptions } from '../treeLayoutOptions';

/**
 * Position root nodes (level 0) with enhanced spacing and precise centering
 */
export function positionRootNodes(
  nodes: Node[],
  rootNodes: Node[],
  level: number,
  spacingData: NodeSpacingData,
  options: TreeLayoutOptions
): void {
  const { nodeHorizontalSpace } = spacingData;
  const {
    marginX = 200,
    marginY = 80,
    spacing = 150,
    nodeWidth = 180,
    nodeHeight = 120
  } = options;

  console.log(`Root positioning: Starting with ${rootNodes.length} root nodes`);

  if (rootNodes.length === 0) return;

  if (rootNodes.length === 1) {
    // Single root: center it precisely
    const rootNode = rootNodes[0];
    rootNode.position = {
      x: marginX,  // Consistent left margin
      y: marginY   // Consistent top margin
    };
    console.log(`Root positioning: Single root ${rootNode.id} positioned at:`, rootNode.position);
  } else {
    // Multiple roots: distribute evenly with precise spacing
    const totalWidth = rootNodes.length * nodeWidth + (rootNodes.length - 1) * spacing;
    let startX = marginX;

    rootNodes.forEach((rootNode, index) => {
      rootNode.position = {
        x: startX + (index * (nodeWidth + spacing)),
        y: marginY
      };
      console.log(`Root positioning: Root ${rootNode.id} positioned at:`, rootNode.position);
    });
  }
}
