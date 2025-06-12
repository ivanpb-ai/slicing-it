
import { Node } from '@xyflow/react';

export interface HierarchyInfo {
  childrenMap: Map<string, string[]>;
  parentChildMap: Map<string, string[]>;
}

export const buildNodesHierarchy = (
  nodesByLevel?: Map<number, Node[]>,
  nodeParents?: Map<string, string>
): HierarchyInfo => {
  // Build a map of child nodes for each parent
  const childrenMap = new Map<string, string[]>();
  const parentChildMap = new Map<string, string[]>();
  
  if (nodeParents) {
    nodeParents.forEach((parentId, childId) => {
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }
      childrenMap.get(parentId)?.push(childId);
      
      // Also track parent-child relationships
      if (!parentChildMap.has(childId)) {
        parentChildMap.set(childId, [parentId]);
      } else {
        parentChildMap.get(childId)?.push(parentId);
      }
    });
  }
  
  return {
    childrenMap,
    parentChildMap
  };
};
