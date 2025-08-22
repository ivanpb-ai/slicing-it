
import { useStore } from '@xyflow/react';
import { useMemo, useRef, useEffect } from 'react';

/**
 * Hook to get the current nodes and edges from the React Flow store
 * Uses useMemo and reference stability techniques to prevent unnecessary re-renders
 */
export const useNodeState = () => {
  // Get nodes from the ReactFlow store
  const storeNodes = useStore(state => state.nodes);
  const nodesRef = useRef(storeNodes);
  
  // Get edges from the ReactFlow store
  const storeEdges = useStore(state => state.edges);
  const edgesRef = useRef(storeEdges);
  
  // Update refs only when nodes/edges actually change
  useEffect(() => {
    if (storeNodes !== nodesRef.current) {
      nodesRef.current = storeNodes;
    }
    
    if (storeEdges !== edgesRef.current) {
      edgesRef.current = storeEdges;
    }
  }, [storeNodes, storeEdges]);
  
  // Memoize the nodes and edges to prevent unnecessary re-renders
  const nodes = useMemo(() => nodesRef.current, [nodesRef.current]);
  const edges = useMemo(() => edgesRef.current, [edgesRef.current]);
  
  return { nodes, edges };
};
