
import { useState, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';

export const useNodeSelection = () => {
  const [selectedElements, setSelectedElements] = useState<{
    nodes: Node[];
    edges: Edge[];
  }>({
    nodes: [],
    edges: []
  });

  const handleSelectionChange = useCallback((params: any) => {
    setSelectedElements({
      nodes: params.nodes || [],
      edges: params.edges || []
    });
  }, []);

  return { selectedElements, handleSelectionChange };
};
