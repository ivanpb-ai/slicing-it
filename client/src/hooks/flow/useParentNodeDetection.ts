
import { Node } from '@xyflow/react';

export const detectParentNodeFromDOM = (
  elementsAtPoint: Element[],
  clientX: number,
  clientY: number
): string | null => {
  console.log('detectParentNodeFromDOM: Checking elements at point:', elementsAtPoint.length);
  
  for (const element of elementsAtPoint) {
    // Look for React Flow node elements directly
    if (element.classList.contains('react-flow__node')) {
      const nodeElement = element as HTMLElement;
      const nodeId = nodeElement.getAttribute('data-id');
      
      console.log('detectParentNodeFromDOM: Found direct node element with ID:', nodeId);
      
      if (nodeId) {
        return nodeId;
      }
    }
    
    // Also check parent elements for node containers
    const nodeParent = element.closest('.react-flow__node');
    if (nodeParent) {
      const nodeId = nodeParent.getAttribute('data-id');
      console.log('detectParentNodeFromDOM: Found parent node container with ID:', nodeId);
      
      if (nodeId) {
        return nodeId;
      }
    }
    
    // Check for custom node wrappers or components
    const customNodeParent = element.closest('[data-id]');
    if (customNodeParent && customNodeParent.classList.contains('react-flow__node')) {
      const nodeId = customNodeParent.getAttribute('data-id');
      console.log('detectParentNodeFromDOM: Found custom node wrapper with ID:', nodeId);
      
      if (nodeId) {
        return nodeId;
      }
    }
  }
  
  console.log('detectParentNodeFromDOM: No parent node found in DOM elements');
  return null;
};

export const detectParentNodeFromPosition = (
  nodes: Node[],
  dropPosition: { x: number; y: number }
): string | null => {
  console.log('detectParentNodeFromPosition: Checking position:', dropPosition);
  console.log('detectParentNodeFromPosition: Available nodes:', nodes.map(n => ({ id: n.id, type: n.data?.type, pos: n.position })));
  
  // Sort nodes by area (smallest first) to get the most specific parent
  const sortedNodes = [...nodes].sort((a, b) => {
    const aWidth = a.measured?.width || a.style?.width || 200;
    const aHeight = a.measured?.height || a.style?.height || 100;
    const bWidth = b.measured?.width || b.style?.width || 200;
    const bHeight = b.measured?.height || b.style?.height || 100;
    
    const aArea = (typeof aWidth === 'string' ? parseInt(aWidth) : aWidth) * 
                  (typeof aHeight === 'string' ? parseInt(aHeight) : aHeight);
    const bArea = (typeof bWidth === 'string' ? parseInt(bWidth) : bWidth) * 
                  (typeof bHeight === 'string' ? parseInt(bHeight) : bHeight);
    
    return aArea - bArea;
  });
  
  // Check each node to see if the drop position is within its bounds
  for (const node of sortedNodes) {
    const nodeWidth = node.measured?.width || node.style?.width || 200;
    const nodeHeight = node.measured?.height || node.style?.height || 100;
    
    const width = typeof nodeWidth === 'string' ? parseInt(nodeWidth) : nodeWidth;
    const height = typeof nodeHeight === 'string' ? parseInt(nodeHeight) : nodeHeight;
    
    const withinX = dropPosition.x >= node.position.x && 
                   dropPosition.x <= node.position.x + width;
    const withinY = dropPosition.y >= node.position.y && 
                   dropPosition.y <= node.position.y + height;
    
    if (withinX && withinY) {
      console.log(`detectParentNodeFromPosition: Found node ${node.id} (${node.data?.type}) at position`);
      return node.id;
    }
  }
  
  console.log('detectParentNodeFromPosition: No parent node found at position');
  return null;
};
