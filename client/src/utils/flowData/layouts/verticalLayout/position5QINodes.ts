import { Node } from '@xyflow/react';

export const position5QINodes = (
  fiveQiNodes: Node[],
  arrangedNodes: Node[],
  y: number,
  startX: number,
  options: {
    nodeWidth: number;
    nodeHeight: number;
    spacing: number;
    compactFactor: number;
  },
  childrenMap: Map<string, string[]>
) => {
  fiveQiNodes.forEach((node, index) => {
    const nodeToUpdate = arrangedNodes.find(n => n.id === node.id);
    if (nodeToUpdate) {
      // Calculate x position to center node
      let x = startX + index * (options.nodeWidth + options.spacing * options.compactFactor);
      
      // Use preferred position from parent DNN if available
      if (node.data?.preferredX !== undefined) {
        const preferredX = typeof node.data.preferredX === 'number' ? node.data.preferredX : x;
        x = preferredX;
      }
      // Otherwise, use standard parent-child alignment
      else if (node.data?.parentId) {
        const parentId = node.data.parentId;
        const parent = arrangedNodes.find(n => n.id === parentId);
        if (parent) {
          // Get all siblings (nodes with the same parent)
          const siblings = fiveQiNodes.filter(n => n.data?.parentId === parentId);
          const siblingIndex = siblings.indexOf(node);
          const totalSiblings = siblings.length;
          
          // Calculate position relative to parent - centered below
          const parentX = parent.position.x;
          const siblingOffset = ((siblingIndex - (totalSiblings - 1) / 2) * (options.nodeWidth + options.spacing * 0.8));
          x = parentX + siblingOffset;
        }
      }
      
      // Always ensure this node is below its parent if it has one
      let newY = y;
      if (node.data?.parentId) {
        const parentId = node.data.parentId;
        const parent = arrangedNodes.find(n => n.id === parentId);
        if (parent) {
          newY = Math.max(y, parent.position.y + options.nodeHeight + options.spacing * 0.5);
        }
      }
      
      nodeToUpdate.position = { x, y: newY };
    }
  });
};
