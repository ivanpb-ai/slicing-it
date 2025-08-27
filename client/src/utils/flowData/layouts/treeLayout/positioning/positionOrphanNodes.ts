
import { Node } from '@xyflow/react';
import { TreeLayoutOptions } from '../treeLayoutOptions';
import { NodeRelationships } from '../types';

/**
 * Position orphan nodes (nodes without parents) at each level with minimum constraint
 */
export function positionOrphanNodes(
  nodes: Node[],
  nodesInLevel: Node[],
  level: number,
  levelPositions: Record<number, Record<string, number>>,
  relationships: NodeRelationships,
  options: TreeLayoutOptions
): void {
  const { parentMap } = relationships;
  const { nodeWidth = 180, nodeHeight = 120, marginY = 100, spacing = 280, verticalSpacing = 200 } = options;
  
  // Find orphan nodes in this level
  const orphanNodes = nodesInLevel.filter(node => !parentMap[node.id]);
  
  if (orphanNodes.length === 0) return;
  
  // Calculate Y position for this level using proper vertical spacing
  const y = marginY + level * verticalSpacing;
  
  // Position orphans at the rightmost part of the canvas
  const usedWidth = Math.max(...Object.values(levelPositions[level]).map(x => x), 0);
  let currentX = usedWidth + nodeWidth * 2;
  
  orphanNodes.forEach(node => {
    const nodeToUpdate = nodes.find(n => n.id === node.id);
    if (nodeToUpdate) {
      nodeToUpdate.position = { x: currentX, y };
      levelPositions[level][node.id] = currentX;
      currentX += nodeWidth + spacing;
    }
  });
}
