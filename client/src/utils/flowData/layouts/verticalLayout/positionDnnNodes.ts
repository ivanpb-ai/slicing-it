
import { Node } from '@xyflow/react';

export const positionDnnNodes = (
  dnnNodes: Node[],
  arrangedNodes: Node[],
  y: number,
  startX: number,
  options: {
    nodeWidth: number;
    nodeHeight: number;
    spacing: number;
    compactFactor: number;
  },
  childrenMap: Map<string, string[]>,
  dnnPositions: Map<string, number>
) => {
  // Parent-group aware positioning to prevent overlap between groups
  // Group DNN nodes by their parent ID
  const nodesByParent = new Map<string, Node[]>();
  const nodesWithoutParent: Node[] = [];
  
  dnnNodes.forEach(node => {
    if (node.data?.parentId && typeof node.data.parentId === 'string') {
      if (!nodesByParent.has(node.data.parentId)) {
        nodesByParent.set(node.data.parentId, []);
      }
      nodesByParent.get(node.data.parentId)!.push(node);
    } else {
      nodesWithoutParent.push(node);
    }
  });
  
  // Position nodes without parents first using the original method
  let cursorX = startX;
  nodesWithoutParent.forEach((node, index) => {
    const nodeToUpdate = arrangedNodes.find(n => n.id === node.id);
    if (nodeToUpdate) {
      const x = startX + index * (options.nodeWidth + options.spacing * options.compactFactor);
      nodeToUpdate.position = { x, y };
      dnnPositions.set(node.id, x);
      cursorX = Math.max(cursorX, x + options.nodeWidth + options.spacing);
    }
  });
  
  // Sort parents by their X position to process left to right
  const sortedParents = Array.from(nodesByParent.keys())
    .map(parentId => ({ 
      parentId, 
      parent: arrangedNodes.find(n => n.id === parentId),
      children: nodesByParent.get(parentId)!
    }))
    .filter(group => group.parent)
    .sort((a, b) => a.parent!.position.x - b.parent!.position.x);
  
  // Position each parent group with non-overlapping logic
  sortedParents.forEach(({ parentId, parent, children }) => {
    const parentCenterX = parent!.position.x + (options.nodeWidth / 2);
    const groupWidth = children.length * options.nodeWidth + (children.length - 1) * options.spacing;
    
    // Calculate ideal group start, but clamp to prevent overlap with previous groups
    const idealGroupStartX = parentCenterX - (groupWidth / 2);
    const groupStartX = Math.max(idealGroupStartX, cursorX);
    
    // Position children in the group
    children.forEach((node, childIndex) => {
      const nodeToUpdate = arrangedNodes.find(n => n.id === node.id);
      if (nodeToUpdate) {
        const x = groupStartX + childIndex * (options.nodeWidth + options.spacing);
        nodeToUpdate.position = { x, y };
        dnnPositions.set(node.id, x);
      }
    });
    
    // Update cursor to the end of this group plus spacing
    cursorX = groupStartX + groupWidth + options.spacing;
      
  });
  
  // Pre-calculate positions for QoS Flow children after all DNN nodes are positioned
  dnnNodes.forEach(node => {
    const nodeToUpdate = arrangedNodes.find(n => n.id === node.id);
    if (nodeToUpdate) {
      const children = childrenMap.get(node.id) || [];
      const qosFlowChildren = children.filter(childId => {
        const childNode = arrangedNodes.find(n => n.id === childId);
        return childNode && childNode.data?.type === 'qosflow';
      });
      
      if (qosFlowChildren.length > 0) {
        // Store the preferred x positions for these QoS Flow nodes
        qosFlowChildren.forEach((childId, childIndex) => {
          const totalChildren = qosFlowChildren.length;
          const childOffset = ((childIndex - (totalChildren - 1) / 2) * (options.nodeWidth + options.spacing));
          // Store this position to use when arranging the QoS Flow level
          const childNode = arrangedNodes.find(n => n.id === childId);
          if (childNode) {
            const preferredXPosition = nodeToUpdate.position.x + childOffset;
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
