
import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';
import { getInitialNodes, getInitialEdges } from '@/utils/flowData/initialNodes';

export const useCanvasOperationsManager = (
  nodes: Node[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
) => {
  const clearCanvas = useCallback(() => {
    if (nodes.length === 0) {
      toast.info('Canvas is already empty');
      return;
    }
    setNodes([]);
    setEdges([]);
    toast.success('Canvas cleared');
  }, [nodes.length, setNodes, setEdges]);

  const initializeCanvas = useCallback(() => {
    if (nodes.length > 0) {
      toast.info('Canvas already has nodes. Clear it first.');
      return;
    }

    const initialNodes = getInitialNodes();
    const initialEdges = getInitialEdges();

    setNodes(initialNodes);
    setEdges(initialEdges);
    window.dispatchEvent(new CustomEvent('ensure-nodes-visible'));
  }, [nodes.length, setNodes, setEdges]);

  return {
    clearCanvas,
    initializeCanvas,
  };
};
