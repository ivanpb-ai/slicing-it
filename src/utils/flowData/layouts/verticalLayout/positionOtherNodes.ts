import { Node } from '@xyflow/react';
import { isDnn, isSnssai } from './nodeTypeDetection';
import { VERTICAL_LEVEL_SPACINGS } from '../constants';

export const positionOtherNodes = (
  nodes: Node[],
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
  nodes.forEach((node, index) => {
    const nodeToUpdate = arrangedNodes.find(n => n.id === node.id);
    if (nodeToUpdate) {
      // Calculate x position to center node
      let x = startX + index * (options.nodeWidth + options.spacing * options.compactFactor);
      
      // If node has a parent, try to position it more directly under its parent
      if (node.data?.parentId) {
        const parentId = node.data.parentId;
        const parent = arrangedNodes.find(n => n.id === parentId);
        if (parent) {
          // Get all siblings (nodes with the same parent)
          const siblings = nodes.filter(n => n.data?.parentId === parentId);
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
          // Special case for S-NSSAI to DNN connections - position much closer
          if (isSnssai(parent) && isDnn(node)) {
            const snssaiDnnSpacing = VERTICAL_LEVEL_SPACINGS['s-nssai-dnn'] || VERTICAL_LEVEL_SPACINGS['default'];
            newY = parent.position.y + options.nodeHeight + snssaiDnnSpacing;
          } 
          // Otherwise, ensure vertical position is at least below parent
          else {
            newY = Math.max(y, parent.position.y + options.nodeHeight + options.spacing * 0.5);
          }
        }
      }
      
      nodeToUpdate.position = { x, y: newY };
    }
  });
};
