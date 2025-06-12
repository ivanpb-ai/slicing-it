
import { memo } from "react";
import { NodeData } from "@/types/nodeTypes";

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
      
      <div className="text-sm font-semibold">
        PLMN: {data.plmnValue || 'Unknown'}
      </div>
    </div>
  );
});

RrpMemberNode.displayName = 'RrpMemberNode';

export default RrpMemberNode;
