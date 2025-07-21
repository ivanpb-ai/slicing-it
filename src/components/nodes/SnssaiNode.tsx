
import { useState, useCallback, memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { NodeData } from "../../types/nodeTypes";

interface SnssaiNodeProps {
  data: NodeData;
}

const SnssaiNode = memo(({ data }: SnssaiNodeProps) => {
  const [sd, setSd] = useState(data.sd || '');
  const [sst, setSst] = useState(data.sst || '');

  const handleSdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSd(newValue);
    data.sd = newValue;
  }, [data]);

  const handleSstChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSst(newValue);
    data.sst = newValue;
  }, [data]);

  // Format the S-NSSAI ID properly - ensure it shows a number
  const displayId = data.snssaiId !== undefined && data.snssaiId !== null ? data.snssaiId : 1;

  return (
    <div className="w-full h-full flex flex-col items-center relative">
      {/* Input handle at the top */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className="!w-4 !h-4 !border-2 !rounded-full !border-white !bg-blue-500 !opacity-100 !z-50"
        style={{ top: -8 }}
        isConnectable={true}
      />
      
      {/* Header */}
      <div className="w-full bg-violet-100 border-b border-violet-200 px-2 py-1 mb-2 rounded-t">
        <div className="text-sm font-semibold text-violet-800 text-center">S-NSSAI#{displayId}</div>
      </div>
      
      {data.description && (
        <div className="text-xs text-gray-600 mt-1 text-center">{data.description}</div>
      )}
      
      <div className="mt-2 mb-1 w-full space-y-2">
        <div className="flex flex-col">
          <label className="text-xs text-gray-700 mb-1">SD:</label>
          <input
            type="text"
            value={sd}
            onChange={handleSdChange}
            placeholder="Service Differentiator"
            className="text-xs p-1 w-full border border-gray-300 rounded"
          />
        </div>
        
        <div className="flex flex-col">
          <label className="text-xs text-gray-700 mb-1">SST:</label>
          <input
            type="text"
            value={sst}
            onChange={handleSstChange}
            placeholder="Slice/Service Type"
            className="text-xs p-1 w-full border border-gray-300 rounded"
          />
        </div>
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

export default SnssaiNode;
