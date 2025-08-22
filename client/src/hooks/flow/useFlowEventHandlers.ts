
import { useCallback } from 'react';
import { Node, Edge, Connection, OnSelectionChangeParams } from '@xyflow/react';

/**
 * Custom hook to manage flow event handlers
 */
export const useFlowEventHandlers = (
  nodes: Node[],
  edges: Edge[],
  onNodesChange: any,
  onEdgesChange: any,
  onConnect: any,
  onNodeDoubleClick: any,
  onSelectionChange: any,
  onPaneClick: any
) => {
  // Bundle and return all handlers
  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeDoubleClick,
    onSelectionChange,
    onPaneClick
  };
};
