
import { useState, useCallback, memo, useRef, useEffect } from "react";
import { Handle, Position } from "@xyflow/react";
import { NodeData } from "@/types/nodeTypes";

interface DnnNodeProps {
  data: NodeData;
}

const DnnNode = memo(({ data }: DnnNodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [customName, setCustomName] = useState(data.dnnCustomName || '');
  
  // Use a ref to store the previous custom name to avoid unnecessary updates
  const prevCustomNameRef = useRef(data.dnnCustomName);
  
  // Update local state when the prop changes (but not on every render)
  useEffect(() => {
    if (data.dnnCustomName !== prevCustomNameRef.current) {
      setCustomName(data.dnnCustomName || '');
      prevCustomNameRef.current = data.dnnCustomName;
    }
  }, [data.dnnCustomName]);

  const handleCustomNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCustomName(newValue);
    
    // Safe to update data in an event handler
    data.dnnCustomName = newValue;
  }, [data]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  // Format the DNN ID properly - ensure it shows a number
  const displayId = data.dnnId !== undefined && data.dnnId !== null ? data.dnnId : 1;

  return (
    <div className="w-full h-full flex flex-col items-center relative">
      {/* Input handle at the top */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className="!w-4 !h-4 !border-2 !rounded-full !border-white !bg-orange-500 !opacity-100 !z-50"
        style={{ top: -8 }}
        isConnectable={true}
      />
      
      {/* Header */}
      <div className="w-full bg-orange-100 border-b border-orange-200 px-2 py-1 mb-2 rounded-t">
        <div className="text-sm font-semibold text-orange-800 text-center">DNN#{displayId}</div>
      </div>
      
      {data.description && (
        <div className="text-xs text-gray-600 mt-1 text-center">{data.description}</div>
      )}
      <div className="mt-2 mb-1 w-full">
        {isEditing ? (
          <input
            type="text"
            value={customName}
            onChange={handleCustomNameChange}
            onBlur={handleBlur}
            placeholder="Add custom name..."
            className="text-xs p-1 w-full border border-gray-300 rounded"
            autoFocus
          />
        ) : (
          <div 
            className="text-xs text-center cursor-pointer hover:bg-gray-100/50 p-1 rounded"
            onClick={handleClick}
          >
            {customName ? customName : "Click to add custom name..."}
          </div>
        )}
      </div>
      <div className="text-xs text-center text-blue-600 mt-1">
        Connect top handle to multiple S-NSSAI bottom handles
      </div>
      <div className="text-xs text-center text-green-600 mt-1 font-semibold">
        Drag 5QI nodes onto this DNN to connect them
      </div>
      <div className="text-xs text-center text-purple-600 mt-1">
        5QI nodes will appear below this DNN
      </div>
      
      {/* Output handle at the bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className="!w-4 !h-4 !border-2 !rounded-full !border-white !bg-orange-500 !opacity-100 !z-50"
        style={{ bottom: -8 }}
        isConnectable={true}
      />
    </div>
  );
});

export default DnnNode;
