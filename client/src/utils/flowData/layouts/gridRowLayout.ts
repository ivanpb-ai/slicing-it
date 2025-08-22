
import { Node } from '@xyflow/react';

/**
 * Options for the grid row layout algorithm
 */
interface GridRowLayoutOptions {
  cellWidth?: number;
  cellHeight?: number;
  marginX?: number;
  marginY?: number;
  spacing?: number;
}

/**
 * Arranges nodes in a grid pattern with different node types in specific rows
 * - Row 1: network nodes
 * - Row 2: cell-area nodes
 * - Row 3: rrp nodes
 * - Row 4: s-nssai nodes
 * - Row 5: dnn nodes
 * - Row 6: 5qi nodes
 */
export function arrangeNodesInGridRows(
  nodes: Node[],
  options: GridRowLayoutOptions = {}
): Node[] {
  if (!nodes || nodes.length === 0) return nodes;

  // Default options - cells are now 80% smaller
  const {
    cellWidth = 40,    // Reduced from 200 (80% smaller)
    cellHeight = 40,   // Reduced from 200 (80% smaller)
    marginX = 10,      // Reduced from 50
    marginY = 10,      // Reduced from 50
    spacing = 6,       // Reduced from 30
  } = options;

  console.log(`Arranging ${nodes.length} nodes in grid rows by type with 80% smaller cells`);

  // Create a deep copy of nodes to avoid mutating the input
  const arrangedNodes = nodes.map(node => ({...node, position: {...node.position}}));
  
  // Group nodes by their type
  const nodesByType: Record<string, Node[]> = {};
  
  arrangedNodes.forEach(node => {
    // Ensure node.data and node.data.type exist before accessing
    const nodeType = node.data && typeof node.data === 'object' ? (node.data.type as string) : 'unknown';
    
    if (!nodesByType[nodeType]) {
      nodesByType[nodeType] = [];
    }
    nodesByType[nodeType].push(node);
  });
  
  // Map of node types to row numbers (1-indexed)
  const rowAssignments: Record<string, number> = {
    'network': 1,
    'cell-area': 2,
    'rrp': 3,
    's-nssai': 4,
    'dnn': 5,
    'fiveqi': 6,
    'unknown': 7 // Default row for nodes with unknown type
  };
  
  // Calculate the total width required for each row
  const maxNodesInAnyRow = Math.max(
    ...Object.values(nodesByType).map(nodes => nodes.length),
    1 // Ensure we don't get 0 if there are no nodes
  );
  
  // Position each node in its assigned row
  Object.entries(nodesByType).forEach(([nodeType, nodesOfType]) => {
    // Get the row number for this type, default to row 1 if not specified
    const rowNumber = rowAssignments[nodeType] || 7;
    
    // Calculate Y position based on row number
    const rowY = marginY + (rowNumber - 1) * (cellHeight + spacing);
    
    // Calculate the starting X position to center the row
    const totalRowWidth = nodesOfType.length * cellWidth + (nodesOfType.length - 1) * spacing;
    let startX = marginX;
    
    // Center nodes in their row if there are fewer than the max
    if (nodesOfType.length < maxNodesInAnyRow) {
      const emptySpace = (maxNodesInAnyRow - nodesOfType.length) * (cellWidth + spacing);
      startX += emptySpace / 2;
    }
    
    // Position each node in the row
    nodesOfType.forEach((node, index) => {
      node.position = {
        x: startX + index * (cellWidth + spacing),
        y: rowY
      };
    });
  });

  return arrangedNodes;
}
