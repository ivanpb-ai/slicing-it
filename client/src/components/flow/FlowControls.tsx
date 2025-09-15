
import React from 'react';
import { MiniMap, useReactFlow } from '@xyflow/react';

const FlowControls = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <>
      {/* Custom Controls positioned on the right */}
      <div className="fixed right-4 top-4 z-40 flex flex-col gap-1 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-2 border border-gray-200" style={{ marginTop: '180px' }}>
        <button
          onClick={() => zoomIn()}
          className="w-10 h-8 flex items-center justify-center bg-white hover:bg-gray-100 border border-gray-300 rounded text-gray-700 transition-colors text-sm font-medium"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => zoomOut()}
          className="w-10 h-8 flex items-center justify-center bg-white hover:bg-gray-100 border border-gray-300 rounded text-gray-700 transition-colors text-sm font-medium"
          title="Zoom Out"
        >
          −
        </button>
        <button
          onClick={() => fitView({ padding: 0.1, duration: 500 })}
          className="w-10 h-8 flex items-center justify-center bg-white hover:bg-gray-100 border border-gray-300 rounded text-gray-700 transition-colors text-xs font-medium"
          title="Fit View"
        >
          ⌂
        </button>
      </div>
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
