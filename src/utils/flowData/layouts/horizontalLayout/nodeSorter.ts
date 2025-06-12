
import { NodeRelationships, NodeLevelData, NodeWeightData } from './types';

/**
 * Sorts nodes within each level to minimize edge crossings
 * for horizontal layout
 */
export function sortNodesWithinLevels(
  levelData: NodeLevelData, 
  relationships: NodeRelationships,
  weightData: NodeWeightData
): void {
  const { levelNodes } = levelData;
  const { parentMap } = relationships;
  const { nodeWeight } = weightData;
  
  // Sort nodes within each level
  Object.values(levelNodes).forEach(levelNodeSet => {
    levelNodeSet.sort((a, b) => {
      // Try to position nodes with similar parents/children close together
      const aParent = parentMap[a.id];
      const bParent = parentMap[b.id];
      
      // Group by parent
      if (aParent && bParent && aParent !== bParent) {
        // Get parent index in previous level
        const aParentIndex = levelNodes[levelData.nodeLevels[aParent] || 0]?.findIndex(n => n.id === aParent) || 0;
        const bParentIndex = levelNodes[levelData.nodeLevels[bParent] || 0]?.findIndex(n => n.id === bParent) || 0;
        
        return aParentIndex - bParentIndex;
      }
      
      // If no parent or same parent, sort by weight (number of descendants)
      return (nodeWeight[b.id] || 0) - (nodeWeight[a.id] || 0);
    });
  });
}
