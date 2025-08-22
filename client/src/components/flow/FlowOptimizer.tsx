import React, { useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';

interface FlowOptimizerProps {
  nodes: Node[];
  edges: Edge[];
}

export const FlowOptimizer: React.FC<FlowOptimizerProps> = ({ nodes, edges }) => {
  // Effect to ensure all nodes remain visible with special focus on network nodes
  useEffect(() => {
    if (nodes.length === 0) return;
    
    console.log(`FlowOptimizer: Found ${nodes.length} nodes to manage visibility`);
    
    // Function to ensure visibility of all nodes
    const ensureVisibility = () => {
      // First handle network nodes specially - they need extra attention
      const networkNodes = nodes.filter(node => node.data?.type === 'network');
      if (networkNodes.length > 0) {
        console.log(`FlowOptimizer: Found ${networkNodes.length} network nodes for special visibility handling`);
        
        networkNodes.forEach(node => {
          // Find network node element
          const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
          if (nodeElement) {
            // Apply extra visible styles with important flags to override any hiding
            const nodeStyle = (nodeElement as HTMLElement).style;
            nodeStyle.setProperty('visibility', 'visible', 'important');
            nodeStyle.setProperty('display', 'flex', 'important');
            nodeStyle.setProperty('opacity', '1', 'important');
            nodeStyle.setProperty('z-index', '2000', 'important'); // Highest z-index for network nodes
            nodeStyle.setProperty('background', '#f5f7ff', 'important');
            nodeStyle.setProperty('border-width', '2px', 'important');
            
            // Add a special debug class for visibility tracking
            nodeElement.classList.add('network-node-visible');
            console.log(`FlowOptimizer: Enhanced visibility for network node ${node.id}`);
            
            // Force the node wrapper to be visible
            const nodeWrapper = nodeElement.querySelector('.node-wrapper');
            if (nodeWrapper) {
              (nodeWrapper as HTMLElement).style.setProperty('visibility', 'visible', 'important');
              (nodeWrapper as HTMLElement).style.setProperty('display', 'flex', 'important');
              (nodeWrapper as HTMLElement).style.setProperty('opacity', '1', 'important');
            }
          }
        });
      }
      
      // Then handle all other nodes
      nodes.forEach(node => {
        // Get DOM element for the node
        const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
        if (nodeElement) {
          // Force visibility at DOM level with !important flags
          const nodeStyle = (nodeElement as HTMLElement).style;
          nodeStyle.setProperty('visibility', 'visible', 'important');
          nodeStyle.setProperty('display', 'flex', 'important');
          nodeStyle.setProperty('opacity', '1', 'important');
          nodeStyle.setProperty('z-index', node.data?.type === 'cell-area' ? '2000' : '1000', 'important');
          
          // Also ensure the node wrapper is visible
          const nodeWrapper = nodeElement.querySelector('.node-wrapper');
          if (nodeWrapper) {
            (nodeWrapper as HTMLElement).style.setProperty('visibility', 'visible', 'important');
            (nodeWrapper as HTMLElement).style.setProperty('display', 'flex', 'important');
            (nodeWrapper as HTMLElement).style.setProperty('opacity', '1', 'important');
          }
          
          // Special handling for different node types
          if (node.data?.type === 'cell-area') {
            console.log(`FlowOptimizer: Enforced visibility for cell-area node ${node.id}`);
            nodeStyle.setProperty('z-index', '2000', 'important'); 
          } else if (node.data?.type === 'network') {
            console.log(`FlowOptimizer: Enforced visibility for network node ${node.id}`);
            nodeStyle.setProperty('z-index', '1900', 'important');
          }
        }
      });
      
      // Check for edges and ensure their visibility
      edges.forEach(edge => {
        // Get DOM element for the edge
        const edgeElement = document.querySelector(`[data-id="${edge.id}"]`);
        if (edgeElement) {
          // Force visibility at DOM level with !important flags
          const edgeStyle = (edgeElement as HTMLElement).style;
          edgeStyle.setProperty('visibility', 'visible', 'important');
          edgeStyle.setProperty('opacity', '1', 'important');
          edgeStyle.setProperty('stroke', '#94a3b8', 'important');
          edgeStyle.setProperty('stroke-width', '2px', 'important');
          edgeStyle.setProperty('z-index', '1500', 'important');
        }
      });
    };
    
    // Listen for node visibility events
    const handleVisibilityEvent = () => {
      ensureVisibility();
    };
    
    window.addEventListener('node-visibility-check', handleVisibilityEvent);
    window.addEventListener('ensure-nodes-visible', handleVisibilityEvent);
    window.addEventListener('edge-created', handleVisibilityEvent);
    window.addEventListener('force-edge-redraw', handleVisibilityEvent);
    window.addEventListener('node-added', handleVisibilityEvent);
    window.addEventListener('node-created', handleVisibilityEvent);
    
    // Initial visibility check
    ensureVisibility();
    
    // Schedule multiple checks with increasing delays for reliability
    [100, 300, 500, 1000, 2000].forEach(delay => {
      setTimeout(ensureVisibility, delay);
    });
    
    // Run regular visibility checks with higher frequency
    const interval = setInterval(ensureVisibility, 1000);
    
    return () => {
      window.removeEventListener('node-visibility-check', handleVisibilityEvent);
      window.removeEventListener('ensure-nodes-visible', handleVisibilityEvent);
      window.removeEventListener('edge-created', handleVisibilityEvent);
      window.removeEventListener('force-edge-redraw', handleVisibilityEvent);
      window.removeEventListener('node-added', handleVisibilityEvent);
      window.removeEventListener('node-created', handleVisibilityEvent);
      clearInterval(interval);
    };
  }, [nodes, edges]);
  
  return null; // This component doesn't render anything
};

export default FlowOptimizer;
