
import { memo, useEffect, useRef } from "react";
import { NodeProps } from "@xyflow/react";
import { CellAreaWrapper } from "./nodes/wrappers/CellAreaWrapper";
import { StandardNodeWrapper } from "./nodes/wrappers/StandardNodeWrapper";
import { NodeData } from "@/types/nodeTypes";

const CustomNode = memo(({ id, data }: NodeProps) => {
  // Reference to track if we've applied visibility styles
  const visibilityAppliedRef = useRef(false);
  
  // Debug logging to track node rendering and data
  useEffect(() => {
    console.log(`CustomNode rendering: id=${id}, type=${data?.type}`, data);
    
    // Ensure node visibility by triggering relevant events
    window.dispatchEvent(new CustomEvent('node-added'));
    window.dispatchEvent(new CustomEvent('node-visibility-check'));
    
    // Set a small timeout to ensure the DOM is ready
    const timer = setTimeout(() => {
      // Force node visibility at the element level
      const nodeElement = document.querySelector(`[data-id="${id}"]`);
      if (nodeElement && !visibilityAppliedRef.current) {
        const style = (nodeElement as HTMLElement).style;
        style.setProperty('visibility', 'visible', 'important');
        style.setProperty('display', 'flex', 'important');
        style.setProperty('opacity', '1', 'important');
        
        // Standard z-index for all nodes
        style.setProperty('z-index', '1000', 'important');
        
        visibilityAppliedRef.current = true;
      }
    }, 50);
    
    return () => clearTimeout(timer);
  }, [id, data]);

  if (data && data.type === 'cell-area') {
    return <CellAreaWrapper id={id} data={data as NodeData} />;
  }

  return <StandardNodeWrapper id={id} data={data as NodeData} />;
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;
