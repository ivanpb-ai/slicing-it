
import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';

export const useGraphDebug = () => {
  const logGraphState = useCallback((
    action: string,
    nodes?: Node[],
    edges?: Edge[],
    additionalInfo?: Record<string, any>
  ) => {
    console.log(`GraphDebug [${action}]:`, {
      nodesCount: nodes?.length || 0,
      edgesCount: edges?.length || 0,
      ...additionalInfo
    });

    if (nodes && nodes.length > 0) {
      console.log('First node sample:', nodes[0]);
    }
  }, []);

  const getDebugNodes = useCallback((): Node[] | null => {
    try {
      // @ts-ignore - This is for debugging only
      if (window.__DEBUG_NODE_EDITOR_NODES && Array.isArray(window.__DEBUG_NODE_EDITOR_NODES)) {
        return [...window.__DEBUG_NODE_EDITOR_NODES];
      }
      // @ts-ignore - This is for debugging only
      if (window.__DEBUG_DOM_NODES && Array.isArray(window.__DEBUG_DOM_NODES)) {
        return [...window.__DEBUG_DOM_NODES];
      }
    } catch (e) {
      console.error('Error accessing debug nodes:', e);
    }
    return null;
  }, []);

  return {
    logGraphState,
    getDebugNodes
  };
};
