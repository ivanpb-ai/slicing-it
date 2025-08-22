
import { toast } from 'sonner';

export class NodeDOMCaptureService {
  /**
   * Attempts to capture nodes from the DOM elements
   * This is used as a fallback mechanism when other methods fail
   */
  static captureNodesFromDOM() {
    try {
      // First try to get nodes from the DOM
      const nodeElements = document.querySelectorAll('.react-flow__node');
      console.log('NodeDOMCaptureService: Found', nodeElements.length, 'nodes in the DOM');
      
      if (nodeElements.length === 0) {
        console.log('No nodes found in DOM');
        return null;
      }
      
      // Extract node IDs and types from the DOM
      const domNodes = Array.from(nodeElements).map(element => {
        const id = element.getAttribute('data-id') || '';
        const typeClass = Array.from(element.classList)
          .find(className => className.startsWith('react-flow__node-'));
        const type = typeClass ? typeClass.replace('react-flow__node-', '') : 'customNode';
        
        // Try to extract position information
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
        
        // Extract data attributes including label and type
        const labelElem = element.querySelector('.label-text, .font-medium');
        const label = labelElem ? labelElem.textContent?.trim() : 
                  element.textContent?.trim() || id;
        
        // Try to determine node type from ID or classes
        let nodeType = 'generic';
        if (id && id.includes('-')) {
          nodeType = id.split('-')[0];
        }
        
        // Extract description if present
        const descElem = element.querySelector('.text-gray-600');
        const description = descElem ? descElem.textContent?.trim() : '';
        
        // Construct a basic node object with available information
        return {
          id,
          type: 'customNode', // Always use our custom node type
          position: { x, y },
          data: {
            label: label,
            type: nodeType,
            description: description || `Network ${nodeType} node`
          }
        };
      });
      
      console.log('NodeDOMCaptureService: Extracted', domNodes.length, 'nodes from DOM with details');
      return domNodes;
    } catch (e) {
      console.error('Error capturing nodes from DOM:', e);
      return null;
    }
  }
}
