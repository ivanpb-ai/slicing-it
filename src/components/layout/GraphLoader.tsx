
import React, { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { NodeDOMCaptureService } from '@/services/loading/NodeDOMCaptureService';
import { useGraphLoadHandler } from '@/hooks/loading/useGraphLoadHandler';
import { arrangeNodes } from '@/utils/flowData/layoutAlgorithms';

interface GraphLoaderProps {
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

const GraphLoader = (props: GraphLoaderProps) => {
  const { setNodes, setEdges } = props;
  
  // Use our extracted hook for graph loading logic
  const { handleLoadGraphFromStorage, isLoadingRef } = useGraphLoadHandler(setNodes, setEdges);
  
  // Method to capture nodes from DOM using the extracted service
  const captureNodesFromDOM = useCallback(() => {
    const domNodes = NodeDOMCaptureService.captureNodesFromDOM();
    
    // If we captured nodes from DOM, apply hierarchical non-overlapping layout
    if (domNodes && domNodes.length > 0) {
      console.log('GraphLoader: Arranging captured DOM nodes with hierarchical layout');
      return arrangeNodes(
        domNodes,
        [], // No edges for DOM-captured nodes
        {
          type: 'vertical',
          spacing: 220,        // Increased spacing for better hierarchy visibility
          compactFactor: 0.7,  // Adjusted for better symmetry
          nodeWidth: 180,
          nodeHeight: 120,
          marginX: 300,        // Wider margins for better centering
          marginY: 120,        // Larger top margin
          preventOverlap: true, // Always enable overlap prevention
          edgeShortenFactor: 0.5 // Add edge shortening factor
        }
      );
    }
    
    return domNodes;
  }, []);

  return {
    handleLoadGraphFromStorage, 
    isLoadingRef,
    captureNodesFromDOM
  };
};

export default GraphLoader;
