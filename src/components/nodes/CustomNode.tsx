
import { memo, useEffect, useRef } from "react";
import { NodeProps } from "@xyflow/react";
import { CellAreaWrapper } from "./wrappers/CellAreaWrapper";
import { StandardNodeWrapper } from "./wrappers/StandardNodeWrapper";
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
        
        // Special z-index for certain node types
        if (data?.type === 'cell-area') {
          style.setProperty('z-index', '1800', 'important');
        } else if (data?.type === 'network') {
          style.setProperty('z-index', '2000', 'important'); // Higher z-index for network nodes
          console.log(`CustomNode: Applied maximum z-index for network node ${id}`);
          
          // Additional styles for network nodes to ensure visibility
          style.setProperty('background', '#f5f7ff', 'important');
          style.setProperty('border-width', '2px', 'important');
          style.setProperty('box-shadow', '0 0 10px rgba(0, 0, 0, 0.15)', 'important');
        } else {
          style.setProperty('z-index', '1000', 'important');
        }
        
        visibilityAppliedRef.current = true;
      }
      
      // For network nodes, apply additional visibility enforcement
      if (data?.type === 'network') {
        const networkNodes = document.querySelectorAll(`[data-node-type="network"]`);
        networkNodes.forEach(node => {
          if (node.parentElement) {
            const parentNode = node.parentElement.closest('.react-flow__node');
            if (parentNode) {
              (parentNode as HTMLElement).style.setProperty('visibility', 'visible', 'important');
              (parentNode as HTMLElement).style.setProperty('display', 'flex', 'important');
              (parentNode as HTMLElement).style.setProperty('opacity', '1', 'important');
              (parentNode as HTMLElement).style.setProperty('z-index', '2000', 'important');
              (parentNode as HTMLElement).style.setProperty('background', '#f5f7ff', 'important');
            }
          }
        });
      }
    }, 50);
    
    return () => clearTimeout(timer);
  }, [id, data]);

  if (data && data.type === 'cell-area') {
    // Ensure cellAreaId is properly set for cell-area nodes
    if (data.cellAreaId === undefined && data.nodeId) {
      // Type check nodeId to make sure it's a string before using match
      const nodeId = data.nodeId as string;
      // Try to extract cell area ID from node ID if present
      const match = typeof nodeId === 'string' ? nodeId.match(/cell-area-(\d+)/) : null;
      if (match && match[1]) {
        data.cellAreaId = parseInt(match[1]);
        console.log(`Extracted cell area ID from node ID: ${data.cellAreaId}`);
      }
    }
    
    // Ensure cellAreaId is properly converted to a number if it's a string
    if (typeof data.cellAreaId === 'string') {
      data.cellAreaId = parseInt(data.cellAreaId);
      console.log(`Converted cell area ID string to number: ${data.cellAreaId}`);
    }
    
    return <CellAreaWrapper id={id} data={data as NodeData} />;
  }

  return <StandardNodeWrapper id={id} data={data as NodeData} />;
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;
