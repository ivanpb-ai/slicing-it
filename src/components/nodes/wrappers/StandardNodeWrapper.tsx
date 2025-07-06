import { memo, useEffect } from 'react';
import { NodeHandles } from '../common/NodeHandles';
import CellAreaNode from '../CellAreaNode';
import NetworkNode from '../NetworkNode';
import RrpNode from '../RrpNode';
import SnssaiNode from '../SnssaiNode';
import DnnNode from '../DnnNode';
import FiveQiNode from '../FiveQiNode';
import RrpMemberNode from '../RrpMemberNode';
import { getBgColor, getBorderColor, getNodeShape, getPadding, getWidth } from "@/utils/nodeStyles";
import { NodeData } from "@/types/nodeTypes";

interface NodeWrapperProps {
  id: string;
  data: NodeData;
}

export const NodeWrapper = memo(({ id, data }: NodeWrapperProps) => {
  // Generalized enumeration logic
  let nodeNumber: number | undefined = data.nodeNumber;

  // Try to extract a number from the node id if not provided
  if (nodeNumber === undefined) {
    const match = id.match(/(\d+)$/);
    if (match && match[1]) {
      nodeNumber = parseInt(match[1], 10);
    }
  }

  // Optionally assign it back to data for consistency
  data.nodeNumber = nodeNumber;

  // Debug logging
  useEffect(() => {
    console.log(`NodeWrapper rendering with data:`, data);
    if (nodeNumber !== undefined) {
      console.log(`Enumerated node number: ${nodeNumber} (type: ${typeof nodeNumber})`);
    } else {
      console.log('Node number is undefined');
    }
  }, [data, id, nodeNumber]);

  // Shared style logic
  const bgColor = getBgColor(data.type);
  const borderColor = getBorderColor(data.type);
  const nodeShape = getNodeShape(data.type);
  const padding = getPadding(data.type);
  const width = getWidth(data.type);

  // Render the correct node type, passing nodeNumber to all
  switch (data.type) {
    case 'cell-area':
      return (
        <CellAreaNode
          id={id}
          data={{ ...data, nodeNumber }}
          bgColor={bgColor}
          borderColor={borderColor}
          nodeShape={nodeShape}
          padding={padding}
          width={width}
        />
      );
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
