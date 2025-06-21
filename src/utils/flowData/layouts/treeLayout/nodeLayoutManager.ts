
import { Node } from "@xyflow/react";
import { NodeRelationships, NodeLevelData, SubtreeData } from "./types";
import { TreeLayoutOptions } from "./treeLayoutOptions";
import { calculateNodeSpacing, positionRootNodes, positionChildNodes, positionOrphanNodes, validateNodePositions } from "./positioning";

/**
 * Position all nodes with MINIMUM 1px maximum edge length
 */
export function positionAllNodes(
  nodes: Node[],
  relationships: NodeRelationships,
  levelData: NodeLevelData, 
  subtreeData: SubtreeData,
  options: TreeLayoutOptions
): Node[] {
  const { levelNodes } = levelData;
  
  // Calculate enhanced node spacing for crossing reduction
  const nodeSpacingData = calculateNodeSpacing(
    nodes,
    levelData, 
    relationships,
    {
      nodeWidth: options.nodeWidth || 180,
      spacing: options.horizontalSpacing || 100,
      minNodeDistance: options.minNodeDistance || 80
    }
  );

  // Create a record to track node positions at each level
  const levelPositions: Record<number, Record<string, number>> = {};
  
  // Initialize level positions record
  Object.keys(levelNodes).forEach(level => {
    levelPositions[parseInt(level)] = {};
  });

  // Position root nodes with enhanced spacing
  if (levelNodes[0] && levelNodes[0].length > 0) {
    positionRootNodes(
      nodes,
      levelNodes[0],
      0,
      nodeSpacingData,
      {
        ...options,
        marginX: options.marginX || 300,
        spacing: (options.horizontalSpacing || 100) 
      }
    );
  }
  
  // Get all nodes that have children for child positioning
  const nodesWithChildren = nodes.filter(node => 
    relationships.childrenMap[node.id] && 
    relationships.childrenMap[node.id].length > 0
  );

  // Position child nodes with MINIMUM 1px vertical spacing
  positionChildNodes(
    nodes,
    nodesWithChildren,
    levelData,
    nodeSpacingData,
    levelPositions,
    {
      ...options,
      marginY: options.marginY || 80,
      verticalSpacing: 100,     // MINIMUM: Exactly 1px
      minNodeDistance: options.minNodeDistance || 80,
      edgeShortenFactor: options.edgeShortenFactor || 0.9,
      horizontalSpacing: (options.horizontalSpacing || 100) 
    }
  );

  // Position orphan nodes with MINIMUM 1px vertical spacing
  Object.keys(levelNodes).forEach(levelStr => {
    const level = parseInt(levelStr);
    positionOrphanNodes(
      nodes,
      levelNodes[level],
      level,
      levelPositions,
      relationships,
      {
        ...options,
        marginY: options.marginY || 80,
        verticalSpacing: 100  // MINIMUM: Exactly 1px
      }
    );
  });

  // Validate positions and ensure all nodes have valid coordinates
  return validateNodePositions(nodes);
}
