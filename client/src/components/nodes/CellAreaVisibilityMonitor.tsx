
import { useEffect } from 'react';

/**
 * Ultra-lightweight component that ensures all nodes are visible
 */
const CellAreaVisibilityMonitor = () => {
  useEffect(() => {
    // Function to ensure all nodes are visible
    const checkNodeVisibility = () => {
      // Basic visibility event dispatch
      window.dispatchEvent(new CustomEvent('node-visibility-check'));
    };
    
    // Set up event listeners for node changes
    window.addEventListener('node-added', checkNodeVisibility);
    window.addEventListener('node-drag-stop', checkNodeVisibility);
    window.addEventListener('edge-created', checkNodeVisibility);
    window.addEventListener('layout-changed', checkNodeVisibility);
    
    return () => {
      window.removeEventListener('node-added', checkNodeVisibility);
      window.removeEventListener('node-drag-stop', checkNodeVisibility);
      window.removeEventListener('edge-created', checkNodeVisibility);
      window.removeEventListener('layout-changed', checkNodeVisibility);
    };
  }, []);
  
  return null;
};

export default CellAreaVisibilityMonitor;
