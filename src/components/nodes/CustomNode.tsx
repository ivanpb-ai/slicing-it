import { memo } from "react";
import { NodeProps } from "@xyflow/react";
import { NodeData } from "@/types/nodeTypes";
import { StandardNodeWrapper } from "./wrappers/StandardNodeWrapper";

const CustomNode = memo(({ id, data }: NodeProps<NodeData>) => {
  // Render custom wrapper/component; 'id' is string, 'data' is NodeData type
  return <StandardNodeWrapper id={id} data={data} />;
});

CustomNode.displayName = "CustomNode";
export default CustomNode;
