
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
  
  // FIXED: More restrictive parent detection - only detect if dropping in CENTER area
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
  
  // Check each node with MORE RESTRICTIVE bounds - only center 60% of node area
  for (const node of sortedNodes) {
    const nodeWidth = node.measured?.width || node.style?.width || 200;
    const nodeHeight = node.measured?.height || node.style?.height || 100;
    
    const width = typeof nodeWidth === 'string' ? parseInt(nodeWidth) : nodeWidth;
    const height = typeof nodeHeight === 'string' ? parseInt(nodeHeight) : nodeHeight;
    
    // FIXED: Create a smaller "drop zone" - only 60% of the node's center area
    const margin = 0.2; // 20% margin on each side = 60% center area
    const dropZoneLeft = node.position.x + (width * margin);
    const dropZoneRight = node.position.x + (width * (1 - margin));
    const dropZoneTop = node.position.y + (height * margin);
    const dropZoneBottom = node.position.y + (height * (1 - margin));
    
    const withinX = dropPosition.x >= dropZoneLeft && dropPosition.x <= dropZoneRight;
    const withinY = dropPosition.y >= dropZoneTop && dropPosition.y <= dropZoneBottom;
    
    if (withinX && withinY) {
      console.log(`detectParentNodeFromPosition: Found node ${node.id} (${node.data?.type}) in CENTER drop zone`);
      console.log(`detectParentNodeFromPosition: Drop zone bounds: x=${dropZoneLeft}-${dropZoneRight}, y=${dropZoneTop}-${dropZoneBottom}`);
      return node.id;
    }
  }
  
  console.log('detectParentNodeFromPosition: No parent node found in CENTER drop zones');
  return null;
};
