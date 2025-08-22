
import { Node } from "@xyflow/react";

/**
 * Distributes multiple cell-area nodes horizontally to prevent overlap
 * when they share the same parent network node
 */
export function distributeCellAreaNodes(nodes: Node[]): Node[] {
  // Create a deep copy of nodes to avoid mutation
  const nodesCopy = nodes.map(node => ({...node, position: {...node.position}}));
  
  // Extract cell area nodes and network nodes
  const cellAreaNodes = nodesCopy.filter(node => node.data?.type === 'cell-area');
  const networkNodes = nodesCopy.filter(node => node.data?.type === 'network');
  
  if (cellAreaNodes.length <= 1 || networkNodes.length === 0) {
    return nodesCopy;
  }
  
  // Group cell areas by their parent network node
  const cellAreasByParent: Record<string, Node[]> = {};
  
  cellAreaNodes.forEach(cellArea => {
    if (cellArea.data && typeof cellArea.data.parentId === 'string') {
      const parentNodeId = cellArea.data.parentId || 'unassigned';
      if (!cellAreasByParent[parentNodeId]) {
        cellAreasByParent[parentNodeId] = [];
      }
      cellAreasByParent[parentNodeId].push(cellArea);
    }
  });
  
  // For each parent with multiple cell areas, distribute them horizontally
  Object.entries(cellAreasByParent).forEach(([parentNodeId, relatedCellAreas]) => {
    if (relatedCellAreas.length <= 1) return;
    
    // Sort cell areas by x position
    relatedCellAreas.sort((a, b) => a.position.x - b.position.x);
    
    // Find the parent node
    const firstCellArea = relatedCellAreas[0];
    if (!firstCellArea.data || typeof firstCellArea.data.parentId !== 'string') return;
    
    const parentNetwork = networkNodes.find(n => n.id === firstCellArea.data.parentId);
    if (!parentNetwork) return;
    
    // Position cell areas in a row below the network node
    const centerX = parentNetwork.position.x;
    const spacing = 250; // Horizontal spacing between cell areas
    const totalWidth = (relatedCellAreas.length - 1) * spacing;
    const startX = centerX - totalWidth / 2;
    
    relatedCellAreas.forEach((cellArea, index) => {
      cellArea.position.x = startX + (index * spacing);
    });
  });
  
  return nodesCopy;
}
