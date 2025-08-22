
import { useCallback, useState } from 'react';
import { Node, Edge, OnSelectionChangeParams } from '@xyflow/react';

/**
 * Custom hook to manage node selection
 */
export const useNodeSelectionManager = () => {
  // State for selected elements
  const [selectedElements, setSelectedElements] = useState<{
    nodes: Node[];
    edges: Edge[];
  }>({ nodes: [], edges: [] });
  
  // Handle selection change
  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    setSelectedElements({
      nodes: params.nodes,
      edges: params.edges,
    });
  }, []);

  return {
    selectedElements,
    onSelectionChange
  };
};
