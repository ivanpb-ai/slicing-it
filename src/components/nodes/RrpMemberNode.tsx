
import { memo } from "react";
import { NodeData } from "../../types/nodeTypes";
import { Handle, Position } from "@xyflow/react";


interface RrpMemberNodeProps {
  data: NodeData;
}

const RrpMemberNode = memo(({ data }: RrpMemberNodeProps) => {
  return (
    <div className="text-xs text-gray-600 text-center">
      {/* Header */}
      <div className="w-full bg-teal-100 border-b border-teal-200 px-2 py-1 mb-2 rounded-t">
        <div className="text-sm font-semibold text-teal-800 text-center">RRP Member</div>
      </div>
    
      {/* Input handle at the top */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className="!w-4 !h-4 !border-2 !rounded-full !border-white !bg-blue-500 !opacity-100 !z-50"
        style={{ top: -8 }}
        isConnectable={true}
      />
      <div className="text-sm font-semibold">
        PLMN: {data.plmnValue || 'Unknown'}
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

RrpMemberNode.displayName = 'RrpMemberNode';

export default RrpMemberNode;
