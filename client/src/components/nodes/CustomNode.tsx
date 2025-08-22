import { memo } from "react";
import { NodeProps } from "@xyflow/react";
import { StandardNodeWrapper } from "./wrappers/StandardNodeWrapper";

// Proper usage without incorrect generic argument
const CustomNode = memo(({ id, data }: NodeProps) => {
  return <StandardNodeWrapper id={id} data={data} />;
});

CustomNode.displayName = "CustomNode";
export default CustomNode;
