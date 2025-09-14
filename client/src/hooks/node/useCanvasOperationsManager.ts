
import { useCallback } from 'react';
import { Node, Edge, useReactFlow } from '@xyflow/react';
import { toast } from 'sonner';
import { getInitialNodes, getInitialEdges } from '@/utils/flowData/initialNodes';
import { resetCounters } from '../../utils/flowData/idCounters';

export const useCanvasOperationsManager = (
  nodes: Node[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
) => {
  const reactFlowInstance = useReactFlow();
  
  const clearCanvas = useCallback(() => {
    console.log('useCanvasOperationsManager: Clear canvas called');
    
    // Always try to clear regardless of current nodes length to ensure state consistency
    console.log('Current nodes count:', nodes.length);
    
    // Clear using React state - ReactFlow will automatically sync
    setNodes([]);
    setEdges([]);
    
    // Reset viewport
    if (reactFlowInstance) {
      reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
    }
    
    // Reset all counters
    resetCounters();
    
    // Dispatch events
    window.dispatchEvent(new CustomEvent('canvas-cleared'));
    
    console.log('useCanvasOperationsManager: Canvas cleared successfully');
    toast.success('Canvas cleared');
  }, [nodes, setNodes, setEdges, reactFlowInstance]);

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
