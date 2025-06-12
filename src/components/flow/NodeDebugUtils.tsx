
import { useEffect } from 'react';
import { Node } from '@xyflow/react';

interface NodeDebugUtilsProps {
  nodes: Node[];
}

const NodeDebugUtils = ({ nodes }: NodeDebugUtilsProps) => {
  // Add global debug event listener
  useEffect(() => {
    const debugCheckNodesHandler = () => {
      console.log("DEBUG NODE CHECK:");
      console.log(`  - Current nodes in NodeEditor: ${nodes.length}`);
      if (nodes.length > 0) {
        console.log('  - First node:', JSON.stringify(nodes[0]));
      }
      
      // Store nodes in a global debug variable to access them from anywhere
      try {
        window.__DEBUG_NODE_EDITOR_NODES = nodes;
        console.log('  - Stored nodes in window.__DEBUG_NODE_EDITOR_NODES');
      } catch (e) {
        // Ignore errors in debug code
      }
    };
    
    window.addEventListener('debug-check-nodes-before-save', debugCheckNodesHandler);
    
    return () => {
      window.removeEventListener('debug-check-nodes-before-save', debugCheckNodesHandler);
    };
  }, [nodes]);

  // Log nodes changes
  useEffect(() => {
    console.log(`NodeEditor: nodes state updated, now has ${nodes.length} nodes`);
  }, [nodes]);

  return null;
};

export default NodeDebugUtils;
