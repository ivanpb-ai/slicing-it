
import { useCallback } from 'react';
import { Node } from '@xyflow/react';

export const useNodeDOMCapture = () => {
  const captureNodesFromDOM = useCallback((): Node[] | null => {
    try {
      const nodeElements = document.querySelectorAll('.react-flow__node');
      console.log('useNodeDOMCapture: Found', nodeElements.length, 'nodes in DOM');
      
      if (nodeElements.length === 0) {
        return null;
      }
      
      const domNodes = Array.from(nodeElements).map(element => {
        const id = element.getAttribute('data-id') || '';
        const typeClass = Array.from(element.classList)
          .find(className => className.startsWith('react-flow__node-'));
        const type = typeClass ? typeClass.replace('react-flow__node-', '') : 'customNode';
        
        // Try to extract position
        const style = window.getComputedStyle(element);
        const transform = style.transform;
        let x = 0, y = 0;
        
        if (transform && transform !== 'none') {
          const matrix = transform.match(/matrix.*\((.+)\)/);
          if (matrix && matrix[1]) {
            const values = matrix[1].split(', ');
            x = parseFloat(values[4] || '0');
            y = parseFloat(values[5] || '0');
          }
        }
        
        // Extract label if possible
        const labelElem = element.querySelector('.label-text');
        const label = labelElem ? labelElem.textContent?.trim() : element.textContent?.trim();
        
        return {
          id,
          type: 'customNode',
          position: { x, y },
          data: {
            label: label || id,
            type: id.split('-')[0] || 'generic'
          }
        };
      });
      
      return domNodes.length > 0 ? domNodes : null;
    } catch (e) {
      console.error('Error capturing nodes from DOM:', e);
      return null;
    }
  }, []);

  return { captureNodesFromDOM };
};
