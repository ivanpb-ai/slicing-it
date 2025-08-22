
import React, { useMemo } from 'react';
import { MarkerType, ConnectionLineType } from '@xyflow/react';

interface FlowDefaultOptionsProps {
  children: React.ReactNode;
}

const FlowDefaultOptions: React.FC<FlowDefaultOptionsProps> = ({ children }) => {
  // Default edge options with fixed edge length of approximately 100px
  const defaultEdgeOptions = useMemo(() => ({
    type: 'straight',
    animated: false,
    style: { 
      stroke: '#94a3b8', 
      strokeWidth: 2
    },
    data: {
      curvature: 0, 
      shortened: true,
      shortenFactor: 0.55, // Updated to fixed edge length of approximately 100px (55% shortening)
      persistent: true,
      permanent: true,
      preserveEdge: true,
      optimized: true
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 8,
      height: 8,
      color: '#94a3b8',
    },
  }), []);

  // Connection line style
  const connectionLineStyle = useMemo(() => ({ 
    stroke: '#94a3b8', 
    strokeWidth: 2
  }), []);

  // Default viewport
  const defaultViewport = useMemo(() => ({ 
    x: 0, 
    y: 0, 
    zoom: 1 
  }), []);

  return (
    <>
      {children}
    </>
  );
};

export { FlowDefaultOptions };
export type { FlowDefaultOptionsProps };
