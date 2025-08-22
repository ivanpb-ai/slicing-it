
import { Node } from '@xyflow/react';
import { HierarchyInfo } from './buildNodesHierarchy';
import { isDnn, is5QI, isSnssai } from './nodeTypeDetection';
import { positionDnnNodes } from './positionDnnNodes';
import { position5QINodes } from './position5QINodes';
import { positionOtherNodes } from './positionOtherNodes';
import { VERTICAL_LEVEL_SPACINGS } from '../constants';

interface PositioningOptions {
  spacing: number;
  marginX: number;
  marginY: number;
  nodeWidth: number;
  nodeHeight: number;
  compactFactor: number;
}

export const positionNodesByLevel = (
  arrangedNodes: Node[],
  nodesByLevel: Map<number, Node[]>,
  hierarchyInfo: HierarchyInfo,
  options: PositioningOptions
): Node[] => {
  const { childrenMap } = hierarchyInfo;
  const levelWidths = new Map<number, number>();
  const dnnPositions = new Map<string, number>();
  
  // Calculate the maximum width needed for each level
  nodesByLevel.forEach((nodesInLevel, level) => {
    const width = nodesInLevel.length * (options.nodeWidth + options.spacing * options.compactFactor);
    levelWidths.set(level, width);
  });
  
  // Special handling for 5QI nodes to minimize crossings
  nodesByLevel.forEach((nodesInLevel, level) => {
    const fiveQiNodes = nodesInLevel.filter(is5QI);
    if (fiveQiNodes.length > 1) {
      // Sort 5QI nodes based on their parent DNN's position
      sortNodesByParentPosition(nodesInLevel, arrangedNodes);
    }
  });

  // Position nodes level by level, ensuring each level is below the previous
  nodesByLevel.forEach((nodesInLevel, level) => {
    const levelWidth = levelWidths.get(level) || 0;
    const startX = options.marginX - levelWidth / 2;
    
    // Determine vertical position based on level and node types using max 3cm (113px) spacing
    let y = options.marginY + level * (options.nodeHeight + options.spacing);
    
    // Special closer spacing for S-NSSAI to DNN connections using the max 3cm (113px) spacing
    if (level > 0) {
      const hasSnssaiNodes = nodesByLevel.get(level-1)?.some(isSnssai);
      const hasDnnNodes = nodesInLevel.some(isDnn);
      // If this level has DNN nodes and previous level has S-NSSAI nodes
      if (hasSnssaiNodes && hasDnnNodes) {
        // Use the max 3cm (113px) spacing for S-NSSAI to DNN connections
        const verticalSpacing = VERTICAL_LEVEL_SPACINGS['s-nssai-dnn'] || VERTICAL_LEVEL_SPACINGS['default'];
        y = options.marginY + (level - 1) * (options.nodeHeight + options.spacing) + options.nodeHeight + verticalSpacing;
      }
    }

    // First position DNN nodes (they need special handling)
    const dnnNodes = nodesInLevel.filter(isDnn);
    if (dnnNodes.length > 0) {
      positionDnnNodes(
        dnnNodes,
        arrangedNodes,
        y,
        startX,
        options,
        childrenMap,
        dnnPositions
      );
    }

    // Position 5QI nodes with special alignment
    const fiveQiNodes = nodesInLevel.filter(is5QI);
    if (fiveQiNodes.length > 0) {
      position5QINodes(
        fiveQiNodes, 
        arrangedNodes,
        y,
        startX,
        options,
        childrenMap
      );
    }

    // Now position other nodes with standard alignment
    const otherNodes = nodesInLevel.filter(n => !isDnn(n) && !is5QI(n));
    if (otherNodes.length > 0) {
      positionOtherNodes(
        otherNodes,
        arrangedNodes,
        y,
        startX,
        options,
        childrenMap
      );
    }
  });

  return arrangedNodes;
};

// Helper function to sort nodes based on parent positions
const sortNodesByParentPosition = (nodes: Node[], arrangedNodes: Node[]) => {
  nodes.sort((a, b) => {
    if (is5QI(a) && is5QI(b)) {
      const parentA = a.data?.parentId;
      const parentB = b.data?.parentId;
      
      if (parentA && parentB) {
        const parentNodeA = arrangedNodes.find(n => n.id === parentA);
        const parentNodeB = arrangedNodes.find(n => n.id === parentB);
        
        if (parentNodeA && parentNodeB && parentNodeA.position && parentNodeB.position) {
          // Sort 5QI nodes based on their parent DNN's X position
          return parentNodeA.position.x - parentNodeB.position.x;
        }
      }
    }
    return 0;
  });
};
