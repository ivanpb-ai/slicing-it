
import { useCallback } from 'react';
import { Connection, MarkerType } from '@xyflow/react';

/**
 * Simplified hook for managing flow connections
 */
export function useFlowConnections() {
  const enhanceConnectionParams = useCallback((params: Connection) => {
    console.log("useFlowConnections: Creating connection:", params);
    
    const enhancedConnection = {
      ...params,
      type: 'smoothstep',
      animated: false,
      style: { 
        stroke: '#94a3b8', 
        strokeWidth: 2,
        opacity: 1
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 8, 
        height: 8, 
        color: '#94a3b8',
      }
    };
    
    return enhancedConnection;
  }, []);

  return { enhanceConnectionParams };
}
