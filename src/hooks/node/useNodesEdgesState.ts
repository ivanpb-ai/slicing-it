
import { useCallback } from 'react';
import { Node, Edge, useReactFlow, useNodesState, useEdgesState } from '@xyflow/react';
import { useSimpleEdgeManager } from '../edge/useSimpleEdgeManager';

export const useNodesEdgesState = () => {
  const reactFlowInstance = useReactFlow();
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Use simple edge manager with handle support
  const { onConnect, addEdgeWithHandles } = useSimpleEdgeManager(edges, setEdges);

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
