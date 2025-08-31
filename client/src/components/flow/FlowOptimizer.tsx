import React, { useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';

interface FlowOptimizerProps {
  nodes: Node[];
  edges: Edge[];
}

export const FlowOptimizer: React.FC<FlowOptimizerProps> = ({ nodes, edges }) => {
  // LIGHTWEIGHT visibility optimization - removed heavy DOM manipulation
  useEffect(() => {
    if (nodes.length === 0) return;
    
    console.log(`FlowOptimizer: Lightweight mode for ${nodes.length} nodes`);
    
    // Single lightweight visibility check - no heavy DOM manipulation
    const lightweightVisibilityCheck = () => {
      // Only fix critical visibility issues, no heavy styling
      const hiddenNodes = nodes.filter(node => {
        const element = document.querySelector(`[data-id="${node.id}"]`);
        return element && (element as HTMLElement).style.display === 'none';
      });
      
      if (hiddenNodes.length > 0) {
        console.log(`FlowOptimizer: Fixing ${hiddenNodes.length} hidden nodes`);
        hiddenNodes.forEach(node => {
          const element = document.querySelector(`[data-id="${node.id}"]`);
          if (element) {
            (element as HTMLElement).style.display = '';
          }
        });
      }
    };
    
    // Only run once after initial mount - no intervals or multiple timeouts
    const timeoutId = setTimeout(lightweightVisibilityCheck, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [nodes.length]); // Only re-run when node count changes
  
  return null; // This component doesn't render anything
};

export default FlowOptimizer;
