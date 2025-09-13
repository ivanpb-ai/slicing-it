import { Node } from '@xyflow/react';

/**
 * Positions QoS Flow nodes in the vertical layout
 * QoS Flow nodes are positioned between DNN and 5QI levels
 */
export const positionQoSFlowNodes = (
  qosFlowNodes: Node[],
  y: number,
  startX: number,
  arrangedNodes: Node[],
  options: {
    nodeWidth: number;
    nodeHeight: number;
    spacing: number;
    compactFactor: number;
  },
  childrenMap: Map<string, string[]>
) => {
  qosFlowNodes.forEach((node, index) => {
    const nodeToUpdate = arrangedNodes.find(n => n.id === node.id);
    if (nodeToUpdate) {
      // Calculate x position to center node
      let x = startX + index * (options.nodeWidth + options.spacing * options.compactFactor);
      
      // If node has a parent (DNN), try to position it more directly under its parent
      if (node.data?.parentId) {
        const parentId = node.data.parentId;
        const parent = arrangedNodes.find(n => n.id === parentId);
        if (parent) {
          // Get all siblings (nodes with the same parent)
          const siblings = qosFlowNodes.filter(n => n.data?.parentId === parentId);
          const siblingIndex = siblings.indexOf(node);
          const totalSiblings = siblings.length;
          
          // Calculate position relative to parent - ensure it's below
          const parentX = parent.position.x;
          const siblingOffset = ((siblingIndex - (totalSiblings - 1) / 2) * (options.nodeWidth + options.spacing * 0.8));
          x = parentX + siblingOffset;
        }
      }
      
      nodeToUpdate.position = { x, y };
      
      // Pre-calculate positions for 5QI children to minimize crossings
      const children = childrenMap.get(node.id) || [];
      const fiveQiChildren = children.filter(childId => {
        const childNode = arrangedNodes.find(n => n.id === childId);
        return childNode && childNode.data?.type === 'fiveqi';
      });
      
      if (fiveQiChildren.length > 0) {
        // Store the preferred x positions for these 5QI nodes
        fiveQiChildren.forEach((childId, childIndex) => {
          const totalChildren = fiveQiChildren.length;
          const childOffset = ((childIndex - (totalChildren - 1) / 2) * (options.nodeWidth + options.spacing * 0.6));
          // Store this position to use when arranging the 5QI level
          const childNode = arrangedNodes.find(n => n.id === childId);
          if (childNode) {
            const preferredXPosition = x + childOffset;
            childNode.data = {
              ...childNode.data,
              preferredX: preferredXPosition
            };
          }
        });
      }
    }
  });
};