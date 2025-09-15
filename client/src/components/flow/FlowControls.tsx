
import React from 'react';
import { MiniMap } from '@xyflow/react';

const FlowControls = () => {
  return (
    <>
      <MiniMap 
        nodeStrokeWidth={3}
        zoomable
        pannable
        className="glass-panel"
        nodeBorderRadius={8}
        nodeColor={(node) => {
          switch (node.data?.type) {
            case 'network':
              return '#eff6ff';
            case 'cell-area':
              return '#dbeafe';
            case 'rrp':
              return '#dcfce7';
            case 's-nssai':
              return '#fef9c3';
            case 'dnn':
              return '#fee2e2';
            case '5qi':
              return '#f3e8ff';
            default:
              return '#f8fafc';
          }
        }}
      />
    </>
  );
};

export default FlowControls;
