import { Node, Edge, useReactFlow, useNodesState, useEdgesState } from '@xyflow/react';
import { useUnifiedEdgeManager } from '../edge/useUnifiedEdgeManager';

export const useNodesEdgesState = () => {
  const reactFlowInstance = useReactFlow();
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  
  // Use unified edge manager to prevent duplicate edges
  const { onConnect, addEdgeWithHandles } = useUnifiedEdgeManager(setEdges, nodes);

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addEdgeWithHandles,
    reactFlowInstance
  };
};
