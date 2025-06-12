
import React from 'react';
import { ConnectionLineType, MarkerType } from '@xyflow/react';

interface FlowConnectionManagerProps {
  onConnect: (params: any) => void;
}

/**
 * Simplified connection manager for visible edges
 */
const useFlowConnectionManager = (props: FlowConnectionManagerProps) => {
  const { onConnect } = props;
  
  return {
    handleConnect: onConnect,
    defaultEdgeOptions: {
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
      },
    },
    connectionLineType: ConnectionLineType.SmoothStep,
    connectionLineStyle: { 
      stroke: '#94a3b8', 
      strokeWidth: 2,
      opacity: 1
    }
  };
};

export default useFlowConnectionManager;
