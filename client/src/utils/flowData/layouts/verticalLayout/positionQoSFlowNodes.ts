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
  // Parent-group aware positioning to prevent overlap between groups
  // Group QoS Flow nodes by their parent ID
  const nodesByParent = new Map<string, Node[]>();
  const nodesWithoutParent: Node[] = [];
  
  qosFlowNodes.forEach(node => {
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
        
        // Pre-calculate positions for 5QI children to minimize crossings
        const nodeChildren = childrenMap.get(node.id) || [];
        const fiveQiChildren = nodeChildren.filter(childId => {
          const childNode = arrangedNodes.find(n => n.id === childId);
          return childNode && childNode.data?.type === 'fiveqi';
        });
        
        if (fiveQiChildren.length > 0) {
          // Store the preferred x positions for these 5QI nodes
          fiveQiChildren.forEach((childId, fiveQiChildIndex) => {
            const totalChildren = fiveQiChildren.length;
            const childOffset = ((fiveQiChildIndex - (totalChildren - 1) / 2) * (options.nodeWidth + options.spacing));
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
    
    // Update cursor to the end of this group plus spacing
    cursorX = groupStartX + groupWidth + options.spacing;
  });
};