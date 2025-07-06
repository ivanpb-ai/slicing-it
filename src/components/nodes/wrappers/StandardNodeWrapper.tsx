import { memo, useEffect } from "react";
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
  // Generalized enumeration logic for all node types
  let nodeNumber: number | undefined;

  // Try to use a node-specific property if it exists
  if (typeof data.nodeNumber === "number") {
    nodeNumber = data.nodeNumber;
  } else if (typeof data.cellAreaId === "number") {
    nodeNumber = data.cellAreaId;
  } else if (typeof data.networkId === "number") {
    nodeNumber = data.networkId;
  } else if (typeof data.rrpId === "number") {
    nodeNumber = data.rrpId;
  } else if (typeof data.snssaiId === "number") {
    nodeNumber = data.snssaiId;
  } else if (typeof data.dnnId === "number") {
    nodeNumber = data.dnnId;
  } else if (typeof data.fiveQiId === "number") {
    nodeNumber = data.fiveQiId;
  } else if (typeof data.rrpMemberId === "number") {
    nodeNumber = data.rrpMemberId;
  }

  // If still undefined, extract trailing number from node id
  if (nodeNumber === undefined && id) {
    const match = id.match(/(\d+)$/);
    if (match && match[1]) {
      nodeNumber = parseInt(match[1], 10);
    }
  }

  // Optionally assign it back to data for consistency (not recommended if data is immutable)
  // data.nodeNumber = nodeNumber;

  // Debug logging
  useEffect(() => {
    console.log(`StandardNodeWrapper rendering with data:`, data);
    if (nodeNumber !== undefined) {
      console.log(`Enumerated node number: ${nodeNumber} (type: ${typeof nodeNumber})`);
    } else {
      console.log('Node number is undefined');
    }
  }, [data, id, nodeNumber]);

  const bgColor = getBgColor(data.type);
  const borderColor = getBorderColor(data.type);
  const nodeShape = getNodeShape(data.type);
  const padding = getPadding(data.type);
  const width = getWidth(data.type);

  // Render the correct node type, passing nodeNumber to all
  switch (data.type) {
    case 'network':
      return (
        <NetworkNode
          id={id}
          data={{ ...data, nodeNumber }}
          bgColor={bgColor}
          borderColor={borderColor}
          nodeShape={nodeShape}
          padding={padding}
          width={width}
        />
      );
    case 'rrp':
      return (
        <RrpNode
          id={id}
          data={{ ...data, nodeNumber }}
          bgColor={bgColor}
          borderColor={borderColor}
          nodeShape={nodeShape}
          padding={padding}
          width={width}
        />
      );
    case 'snssai':
      return (
        <SnssaiNode
          id={id}
          data={{ ...data, nodeNumber }}
          bgColor={bgColor}
          borderColor={borderColor}
          nodeShape={nodeShape}
          padding={padding}
          width={width}
        />
      );
    case 'dnn':
      return (
        <DnnNode
          id={id}
          data={{ ...data, nodeNumber }}
          bgColor={bgColor}
          borderColor={borderColor}
          nodeShape={nodeShape}
          padding={padding}
          width={width}
        />
      );
    case 'fiveqi':
      return (
        <FiveQiNode
          id={id}
          data={{ ...data, nodeNumber }}
          bgColor={bgColor}
          borderColor={borderColor}
          nodeShape={nodeShape}
          padding={padding}
          width={width}
        />
      );
    case 'rrp-member':
      return (
        <RrpMemberNode
          id={id}
          data={{ ...data, nodeNumber }}
          bgColor={bgColor}
          borderColor={borderColor}
          nodeShape={nodeShape}
          padding={padding}
          width={width}
        />
      );
    default:
      return (
        <div>
          Unknown node type: {data.type}
        </div>
      );
  }
});
