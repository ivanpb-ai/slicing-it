
import { memo } from "react";
import { NodeData } from "@/types/nodeTypes";
import { getBgColor, getBorderColor, getNodeShape, getPadding, getWidth } from "@/utils/nodeStyles";
import { NodeHandles } from "../common/NodeHandles";
import NetworkNode from "../NetworkNode";
import RrpNode from "../RrpNode";
import SnssaiNode from "../SnssaiNode";
import DnnNode from "../DnnNode";
import FiveQiNode from "../FiveQiNode";
import RrpMemberNode from "../RrpMemberNode";

interface StandardNodeWrapperProps {
  id: string;
  data: NodeData;
}

export const StandardNodeWrapper = memo(({ id, data }: StandardNodeWrapperProps) => {
  const renderNodeContent = () => {
    switch (data.type) {
      case 'network':
        return <NetworkNode data={data} />;
      case 'rrp':
        return <RrpNode data={data} />;
      case 'rrpmember':
        return <RrpMemberNode data={data} />;
      case 's-nssai':
        return <SnssaiNode data={data} />;
      case 'dnn':
        return <DnnNode data={data} />;
      case '5qi':
        return <FiveQiNode data={data} />;
      default:
        return (
          <div className="text-xs text-gray-600 text-center">
            <div className="font-medium">{data.label || 'Unknown Node'}</div>
            <div className="text-xs opacity-75">{data.type}</div>
          </div>
        );
    }
  };

  const bgColor = getBgColor(data.type);
  const borderColor = getBorderColor(data.type);
  const nodeShape = getNodeShape(data.type);
  const padding = getPadding(data.type);
  const width = getWidth(data.type, data.rrpPercentage);

  return (
    <div 
      className={`${bgColor} ${borderColor} ${nodeShape} ${padding} ${width} min-h-[80px] shadow-sm border-4 relative`} 
      data-node-type={data.type}
      style={{ position: 'relative' }}
    >
      {/* Input handle at the top */}
      <NodeHandles position="top" type="target" />
      
      {renderNodeContent()}
      
      {/* Output handle at the bottom */}
      <NodeHandles position="bottom" type="source" />
    </div>
  );
});

StandardNodeWrapper.displayName = 'StandardNodeWrapper';
