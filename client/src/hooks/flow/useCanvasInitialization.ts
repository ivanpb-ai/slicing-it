
import { useState, useEffect } from 'react';
import { Node, Edge, useReactFlow, ReactFlowInstance } from '@xyflow/react';
import { initializeCanvasWithNodes } from '@/utils/flowEvents';

interface UseCanvasInitializationProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  initializeCanvas: () => string;
}

export function useCanvasInitialization({
  initialNodes,
  initialEdges,
  nodes,
  setNodes,
  setEdges,
  initializeCanvas
}: UseCanvasInitializationProps) {
  const [initialized, setInitialized] = useState(false);
  const reactFlowInstance = useReactFlow();

  useEffect(() => {
    // Call initializeCanvasWithNodes with the correct number of parameters
    initializeCanvasWithNodes(
      initialNodes,
      initialEdges,
      reactFlowInstance,
      setNodes,
      setEdges,
      initializeCanvas,
      setInitialized,
      initialized,
      nodes
    );
  }, [initialNodes, initialEdges, initialized, initializeCanvas, nodes, setEdges, setNodes, reactFlowInstance]);

  return { initialized };
}
