
import { memo, useEffect, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import { NodeData } from "../../types/nodeTypes";

interface NetworkNodeProps {
  data: NodeData;
}

const NetworkNode = memo(({ data }: NetworkNodeProps) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  
  // Use effect to enforce visibility on mount
  useEffect(() => {
    if (nodeRef.current) {
      // Force visibility on the node element
      nodeRef.current.style.visibility = 'visible';
      nodeRef.current.style.display = 'flex';
      nodeRef.current.style.opacity = '1';
      
      // Set a timeout to ensure visibility is applied after any layout recalculations
      setTimeout(() => {
        if (nodeRef.current) {
          // Apply critical styles again to ensure visibility
          nodeRef.current.style.visibility = 'visible';
          nodeRef.current.style.display = 'flex';
          nodeRef.current.style.opacity = '1';
        }
      }, 100);
    }
  }, []);

  return (
    <div 
      ref={nodeRef}
      className="node-content flex flex-col items-center justify-center p-2 bg-indigo-50 rounded-md w-full h-full"
      style={{ visibility: 'visible', display: 'flex', opacity: 1 }}
      data-node-type="network"
      data-node-debug="true"
    >
      {/* Header */}
      <div className="w-full bg-indigo-100 border-b border-indigo-200 px-2 py-1 mb-2 rounded-t">
        <div className="text-sm font-semibold text-indigo-800 text-center">Network</div>
      </div>
      
      {data.description && (
        <div className="text-xs text-gray-600 mt-1 text-center">{data.description}</div>
      )}
      <div className="text-center text-xs mt-2 text-blue-600">Main entry point</div>

      <div className="text-xs text-center text-green-600 mt-1">
        Connect bottom handle to Cell Area/TAC nodes
      </div>
    
          {/* Output handle at the bottom */}
          <Handle
            type="source"
            position={Position.Bottom}
            id="bottom-source"
            className="!w-4 !h-4 !border-2 !rounded-full !border-white !bg-blue-500 !opacity-100 !z-50"
            style={{ bottom: -8 }}
            isConnectable={true}
          />
              </div>

  );
});

NetworkNode.displayName = 'NetworkNode';

export default NetworkNode;
