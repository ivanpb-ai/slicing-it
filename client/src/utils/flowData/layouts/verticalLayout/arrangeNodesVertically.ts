
import { Node, Edge } from '@xyflow/react';
import { LayoutOptions } from '../index';
import { VERTICAL_SPACING } from '../constants';
import { positionNodesByLevel } from './positionNodesByLevel';
import { buildNodesHierarchy } from './buildNodesHierarchy';

export const arrangeNodesVertically = (
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions & {
    nodesByLevel?: Map<number, Node[]>;
    nodeParents?: Map<string, string>;
  } = {}
): Node[] => {
  const {
    spacing = 1, // MINIMUM: Max 1px edge length
    marginX = 300,
    marginY = 150,
    nodeWidth = 180,
    nodeHeight = 120,
    compactFactor = 1.0,
    nodesByLevel,
    nodeParents
  } = options;

  if (!nodes || nodes.length === 0) return nodes;

  const arrangedNodes = [...nodes];
  
  // If we don't have pre-organized levels, we're done
  if (!nodesByLevel) {
    return arrangedNodes;
  }

  // Calculate hierarchy relationships if not provided
  const hierarchyInfo = buildNodesHierarchy(nodesByLevel, nodeParents);
  
  // Position the nodes level by level with the hierarchy information and minimum constraint
  return positionNodesByLevel(
    arrangedNodes,
    nodesByLevel,
    hierarchyInfo,
    {
      spacing: 1, // MINIMUM: Max 1px edge length
      marginX,
      marginY,
      nodeWidth,
      nodeHeight,
      compactFactor
    }
  );
};
