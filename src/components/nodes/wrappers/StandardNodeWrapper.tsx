import { memo, useEffect } from "react";
import { NodeData } from "@/types/nodeTypes";
import { getBgColor, getBorderColor, getNodeShape, getPadding, getWidth } from "@/utils/nodeStyles";
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

// Shared enumeration logic for all node types
function getNodeNumber(data: NodeData, id: string): number | undefined {
  // Try known ID fields
  for (const key of [
    "cellAreaId", "networkId", "rrpId", "snssaiId", "dnnId", "fiveQiId", "rrpMemberId"
  ]) {
    if (typeof (data as any)[key] === "number") return (data as any)[key];
  }
  // Fallback: extract trailing number from ID
  const match = id.match(/(\d+)$/);
  if (match) return parseInt(match[1], 10);
  return undefined;
}

export const StandardNodeWrapper = memo(({ id, data }: StandardNodeWrapperProps) => {
  const nodeNumber = getNodeNumber(data, id);

  useEffect(() => {
    console.log(`StandardNodeWrapper: id=${id}, type=${data.type}, nodeNumber=${nodeNumber}`);
  }, [id, data.type, nodeNumber]);

  const commonProps = {
    id,
    data: { ...data, nodeNumber }, // pass nodeNumber to all node types
    bgColor: getBgColor(data.type),
    borderColor: getBorderColor(data.type),
    nodeShape: getNodeShape(data.type),
    padding: getPadding(data.type),
    width: getWidth(data.type),
  };

  switch (data.type) {
    case "network":
      return <NetworkNode {...commonProps} />;
    case "rrp":
      return <RrpNode {...commonProps} />;
    case "snssai":
      return <SnssaiNode {...commonProps} />;
    case "dnn":
      return <DnnNode {...commonProps} />;
    case "fiveqi":
      return <FiveQiNode {...commonProps} />;
    case "rrp-member":
      return <RrpMemberNode {...commonProps} />;
    default:
      return <div>Unknown node type: {data.type}</div>;
  }
});
