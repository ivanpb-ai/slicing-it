
import { useCallback, useEffect, useRef } from 'react';
import { Node } from '@xyflow/react';

export const useGraphDebugTools = (nodes?: Node[]) => {
  // Create ref to track previous nodes state
  const prevNodesRef = useRef<Node[] | undefined>();
  
  // Track nodes changes for debugging
  const trackNodesChanges = useCallback(() => {
    if (!nodes) return;
    
    // Store nodes in global debug variable
    try {
      window.__DEBUG_LAST_NODES = nodes;
    } catch (e) {
      // Ignore errors in debug code
    }
    
    // Log node changes if they've changed significantly
    if (prevNodesRef.current?.length !== nodes.length) {
      console.log(`useGraphDebugTools: nodes count changed from ${prevNodesRef.current?.length || 0} to ${nodes.length}`);
    }
    
    // Update the previous nodes reference
    prevNodesRef.current = nodes;
  }, [nodes]);
  
  // Log detailed node information to help with debugging
  const logNodesDetails = useCallback(() => {
    if (!nodes || nodes.length === 0) {
      console.log('useGraphDebugTools: No nodes to log');
      return;
    }
    
    console.log(`useGraphDebugTools: Logging details for ${nodes.length} nodes`);
    console.log('First node details:', JSON.stringify(nodes[0], null, 2));
  }, [nodes]);
  
  return {
    trackNodesChanges,
    logNodesDetails
  };
};
