
import { Node } from '@xyflow/react';
import { assignNodeLevels } from './levelAssignment';
import { calculateNodeSpacing, positionRootNodes, positionChildNodes, positionOrphanNodes, validateNodePositions } from './positioning';
import { buildNodeRelationships } from './nodeRelationships';

/**
 * Positions nodes in a tree layout with parent-child hierarchy
 */
export function positionNodesInTree(nodes: Node[], options: any = {}): Node[] {
  try {
    // Default options for vertical tree layout with uniform 200px spacing
    const defaultOptions = {
      marginX: 300,       // Horizontal margin
      marginY: 100,       // Top margin for the layout
      spacing: 200,       // Horizontal spacing between siblings
      nodeWidth: 180,     // Default node width
      nodeHeight: 100,    // Default node height
      verticalSpacing: 200, // Updated to consistent 200px spacing
      compactFactor: 0.95,  // Factor to compress spacing
      minNodeDistance: 100, // Minimum distance between nodes
    };

    // Merge provided options with defaults
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Build node relationships
    const relationships = buildNodeRelationships(nodes, []);
    
    // Assign levels to nodes
    const levelData = assignNodeLevels(nodes, relationships);
    
    // Calculate spacing for nodes
    const spacingData = calculateNodeSpacing(nodes, levelData, relationships, mergedOptions);
    
    // Track positions at each level
    const levelPositions: Record<number, Record<string, number>> = {};
    
    // Position root nodes
    const rootNodePositions = positionRootNodes(nodes, levelData.levelNodes[0] || [], 0, spacingData, mergedOptions);
    
    // Get nodes with children
    const nodesWithChildren = nodes.filter(n => 
      relationships.childrenMap[n.id] && relationships.childrenMap[n.id].length > 0
    );
    
    // Position child nodes
    positionChildNodes(
      nodes, 
      nodesWithChildren, 
      levelData, 
      spacingData, 
      levelPositions, 
      mergedOptions
    );
    
    // Position any orphaned nodes
    Object.entries(levelData.levelNodes).forEach(([levelStr, nodesInLevel]) => {
      const level = parseInt(levelStr, 10);
      if (level > 0) { // Skip root level which is already positioned
        positionOrphanNodes(
          nodes,
          nodesInLevel,
          level,
          levelPositions,
          relationships,
          mergedOptions
        );
      }
    });
    
    // Validate all node positions
    return validateNodePositions(nodes);
  } catch (error) {
    console.error('Error in positionNodesInTree:', error);
    return nodes; // Return unmodified nodes in case of error
  }
}
