import { Node } from '@xyflow/react';
import { TreeLayoutOptions } from '../treeLayoutOptions';
import { NodeSpacingData } from './types';
import { NodeLevelData } from '../types';

export function positionChildNodes(
  nodes: Node[],
  nodesWithChildren: Node[],
  levelData: NodeLevelData,
  spacingData: NodeSpacingData,
  levelPositions: Record<string, number>,
  options: TreeLayoutOptions
): void {
  const { nodeHorizontalSpace } = spacingData;
  const { nodeLevels } = levelData;

  // Extract relationships from nodes
  const childrenMap: Record<string, string[]> = {};
  const parentMap: Record<string, string> = {};

  nodes.forEach(node => {
    if (node.data?.parentId) {
      const parentId = node.data.parentId as string;
      if (!childrenMap[parentId]) {
        childrenMap[parentId] = [];
      }
      childrenMap[parentId].push(node.id);
      parentMap[node.id] = parentId;
    }
  });

  const {
    marginY = 50,
    spacing = 100,
    nodeHeight = 120,
    nodeWidth = 180,
    verticalSpacing = 150,  // Default to 150px if not provided
    minNodeDistance = 20
  } = options;

  // Sort parent nodes by level
  const sortedParentNodes = [...nodesWithChildren].sort((a, b) => {
    const levelA = nodeLevels[a.id] || 0;
    const levelB = nodeLevels[b.id] || 0;
    return levelA - levelB;
  });

  // Position each parent's children
  sortedParentNodes.forEach((parentNode) => {
    const parentId = parentNode.id;
    const parentLevel = nodeLevels[parentId] || 0;
    const children = childrenMap[parentId] || [];
    if (children.length === 0) return;

    // Use configurable vertical spacing
    const childY = parentNode.position.y + nodeHeight + verticalSpacing;

    // Use precomputed horizontal spacing per level
    const horizontalSpacing = nodeHorizontalSpace[parentLevel] || minNodeDistance;
    const parentCenterX = parentNode.position.x + (nodeWidth / 2);

    if (children.length === 1) {
      // Single child: centered under parent
      const childNode = nodes.find(n => n.id === children[0]);
      if (childNode) {
        childNode.position = {
          x: parentCenterX - (nodeWidth / 2),
          y: childY
        };
      }
    } else {
      // Multiple children: compact horizontal layout
      const totalChildrenWidth = children.length * nodeWidth;
      const totalSpacing = horizontalSpacing * (children.length - 1);
      const totalWidth = totalChildrenWidth + totalSpacing;
      
      // Center group under parent
      const startX = parentCenterX - (totalWidth / 2);

      children.forEach((childId, index) => {
        const childNode = nodes.find(n => n.id === childId);
        if (!childNode) return;

        childNode.position = {
          x: startX + index * (nodeWidth + horizontalSpacing),
          y: childY
        };
      });
    }
  });
}
