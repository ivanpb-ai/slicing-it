import { memo, useEffect, useRef } from "react";
import { NodeProps } from "@xyflow/react";
import { CellAreaWrapper } from "./nodes/wrappers/CellAreaWrapper";
import { StandardNodeWrapper } from "./nodes/wrappers/StandardNodeWrapper";
import { NodeData } from "@/types/nodeTypes";

const CustomNode = memo(({ id, data }: NodeProps<NodeData>) => {
  const visibilityAppliedRef = useRef(false);

  useEffect(() => {
    console.log(`CustomNode rendering: id=${id}, type=${data?.type}`, data);

    window.dispatchEvent(new CustomEvent('node-added'));
    window.dispatchEvent(new CustomEvent('node-visibility-check'));

    const timer = setTimeout(() => {
      const nodeElement = document.querySelector(`[data-id="${id}"]`);
      if (nodeElement && !visibilityAppliedRef.current) {
        const style = (nodeElement as HTMLElement).style;
        style.setProperty('visibility', 'visible', 'important');
        style.setProperty('display', 'flex', 'important');
        style.setProperty('opacity', '1', 'important');
        style.setProperty('z-index', '1000', 'important');
        visibilityAppliedRef.current = true;
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [id, data]);

  // For all other node types, use StandardNodeWrapper (which now enumerates all)
  return <StandardNodeWrapper id={id} data={data} />;
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;
