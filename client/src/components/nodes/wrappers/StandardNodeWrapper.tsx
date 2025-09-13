import { memo, useEffect } from "react";
import { NodeData } from "../../../types/nodeTypes";
import {
  getBgColor,
  getBorderColor,
  getNodeShape,
  getPadding,
  getWidth,
  getClipPath,
} from "../../../utils/nodeStyles";

import NetworkNode from "../NetworkNode";
import CellAreaNode from "../CellAreaNode";
import RrpNode from "../RrpNode";
import SnssaiNode from "../SnssaiNode";
import DnnNode from "../DnnNode";
import FiveQiNode from "../FiveQiNode";
import RrpMemberNode from "../RrpMemberNode";
import QoSFlowNode from "../QoSFlowNode";

interface StandardNodeWrapperProps {
  id: string;
  data: NodeData;
}

type IdKey =
  "network" |
  "cell-area" |
  "rrp" |
  "s-nssai" |
  "dnn" |
  "qosflow" |
  "fiveqi" |
  "rrpmember";

function getNodeNumber(data: NodeData, id: string): number  {
  const idKeys: IdKey[] = [
    "network",
    "cell-area",
    "rrp",
    "s-nssai",
    "dnn",
    "qosflow",
    "fiveqi",
    "rrpmember"
  ];
  for (const key of idKeys) {
    if (typeof data[key] === "number") return data[key];
  }
  // Fallback
  const match = id.match(/(\d+)$/);
  if (match) return parseInt(match[1], 10);
  return 0;
}

export const StandardNodeWrapper = memo(({ id, data }: StandardNodeWrapperProps) => {
  const nodeNumber = getNodeNumber(data, id);

  useEffect(() => {
    console.log(`StandardNodeWrapper: id=${id}, type=${data.type}, nodeNumber=${nodeNumber}`);
  }, [id, data.type, nodeNumber]);

  // Compute styles and pass through props
  const nodeType = data.type || 'generic';
  const bgColor = getBgColor(nodeType);
  const borderColor = getBorderColor(nodeType);
  const nodeShape = getNodeShape(nodeType);
  const padding = getPadding(nodeType);
  const width = getWidth(nodeType);
  const clipPath = getClipPath(nodeType); // <-- Dynamic shape

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
          <NetworkNode data={{ ...data, nodeNumber }} />
        </div>
      );
    case "cell-area":
      return (
        <div className={className} style={style}>
          <CellAreaNode data={{ ...data, nodeNumber }} />
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
          <RrpMemberNode data={{ ...data, nodeNumber }} />
        </div>
      );
    case "s-nssai":
      return (
        <div className={className} style={style}>
          <SnssaiNode data={{ ...data, nodeNumber }} />
        </div>
      );
    case "dnn":
      return (
        <div className={className} style={style}>
          <DnnNode data={{ ...data, nodeNumber }} />
        </div>
      );
    case "qosflow":
      // Check if this QoS Flow node is marked as default for special styling
      const isDefaultQoSFlow = data.isDefault === true;
      
      if (isDefaultQoSFlow) {
        // For default QoS Flow nodes, add an extra wrapper with thick border
        return (
          <div className={className} style={style}>
            <div className="border-4 border-cyan-600 rounded-lg bg-cyan-50/50 p-1">
              <QoSFlowNode id={id} data={{ ...data, nodeNumber }} />
            </div>
          </div>
        );
      } else {
        return (
          <div className={className} style={style}>
            <QoSFlowNode id={id} data={{ ...data, nodeNumber }} />
          </div>
        );
      }
    case "fiveqi":
      // 5QI nodes no longer have default styling - that's moved to QoS Flow
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
