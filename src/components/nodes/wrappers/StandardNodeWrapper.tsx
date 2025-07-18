import { memo, useEffect } from "react";
import { NodeData } from "@/types/nodeTypes";
import {
  getBgColor,
  getBorderColor,
  getNodeShape,
  getPadding,
  getWidth,
  getClipPath,
} from "@/utils/nodeStyles";

import NetworkNode from "../NetworkNode";
import RrpNode from "../RrpNode";
import SnssaiNode from "../SnssaiNode";
import DnnNode from "../DnnNode";
import FiveQiNode from "../FiveQiNode";
import RrpMemberNode from "../RrpMemberNode";
// import CellAreaNode from "../CellAreaNode"; // Uncomment if used

interface StandardNodeWrapperProps {
  id: string;
  data: NodeData;
}

type IdKey =
  | "cellAreaId"
  | "networkId"
  | "rrpId"
  | "snssaiId"
  | "dnnId"
  | "fiveQiId"
  | "rrpMemberId";

function getNodeNumber(data: NodeData, id: string): number | undefined {
  const idKeys: IdKey[] = [
    "cellAreaId",
    "networkId",
    "rrpId",
    "snssaiId",
    "dnnId",
    "fiveQiId",
    "rrpMemberId",
  ];
  for (const key of idKeys) {
    if (typeof data[key] === "number") return data[key];
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

  // Compute styles and pass through props
  const bgColor = getBgColor(data.type);
  const borderColor = getBorderColor(data.type);
  const nodeShape = getNodeShape(data.type);
  const padding = getPadding(data.type);
  const width = getWidth(data.type);
  const clipPath = getClipPath(data.type); // <-- Dynamic shape

  // Compose className and inline style. 
  // You may adjust the base class "node-wrapper" to match your setup.
  const className = [
    "node-wrapper",
    bgColor,
    borderColor,
    nodeShape,
    padding,
    width,
  ]
    .filter(Boolean)
    .join(" ");

  const style = clipPath !== "none" ? { clipPath } : undefined;

  // Select and render the appropriate node type
  switch (data.type) {
    case "network":
      return (
        <div className={className} style={style}>
          <NetworkNode id={id} data={{ ...data, nodeNumber }} />
        </div>
      );
    case "cell-area":
      return (
        <div className={className} style={style}>
          <CellAreaNode id={id} data={{ ...data, nodeNumber }} />
        </div>
      );
    case "rrp":
      return (
        <div className={className} style={style}>
          <RrpNode id={id} data={{ ...data, nodeNumber }} />
        </div>
      );
    case "rrpmember":
      return (
        <div className={className} style={style}>
          <RrpMemberNode id={id} data={{ ...data, nodeNumber }} />
        </div>
      );
    case "s-nssai":
      return (
        <div className={className} style={style}>
          <SnssaiNode id={id} data={{ ...data, nodeNumber }} />
        </div>
      );
    case "dnn":
      return (
        <div className={className} style={style}>
          <DnnNode id={id} data={{ ...data, nodeNumber }} />
        </div>
      );
    case "fiveqi":
      return (
        <div className={className} style={style}>
          <FiveQiNode id={id} data={{ ...data, nodeNumber }} />
        </div>
      );
    default:
      return (
        <div className={className} style={style}>
          <span>{data.label ?? "Node"}</span>
        </div>
      );
  }
});
