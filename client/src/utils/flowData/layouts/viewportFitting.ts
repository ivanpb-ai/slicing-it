
import { Node } from '@xyflow/react';

/**
 * Positions nodes to fit within the viewport
 */
export const fitNodesToViewport = (
  nodes: Node[],
  viewportWidth: number,
  viewportHeight: number,
  padding = 50
): Node[] => {
  if (nodes.length === 0) return nodes;
  
  // Find the current bounds of all nodes
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  
  nodes.forEach(node => {
    const width = (node.style?.width as number) || 150;
    const height = (node.style?.height as number) || 80;
    
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + width);
    maxY = Math.max(maxY, node.position.y + height);
  });
  
  // Calculate scaling factors to fit in viewport
  const nodeWidth = maxX - minX;
  const nodeHeight = maxY - minY;
  
  const availableWidth = viewportWidth - (padding * 2);
  const availableHeight = viewportHeight - (padding * 2);
  
  const scaleX = nodeWidth > availableWidth ? availableWidth / nodeWidth : 1;
  const scaleY = nodeHeight > availableHeight ? availableHeight / nodeHeight : 1;
  
  // Use the smaller scale to maintain aspect ratio
  const scale = Math.min(scaleX, scaleY);
  
  // Apply scaling and centering - BUT DON'T SCALE DOWN PROPERLY SPACED LAYOUTS
  // Only scale if nodes are too cramped (minX/minY negative) but preserve proper spacing
  if (minX < padding || minY < padding) {
    const offsetX = Math.max(0, padding - minX);
    const offsetY = Math.max(0, padding - minY);
    
    return nodes.map(node => {
      return {
        ...node,
        position: { 
          x: node.position.x + offsetX, 
          y: node.position.y + offsetY 
        }
      };
    });
  }
  
  return nodes;
};
