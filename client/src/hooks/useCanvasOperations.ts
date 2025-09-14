
import { useCallback } from 'react';
import { Node, Edge, useReactFlow } from '@xyflow/react';
import { arrangeNodes, LayoutOptions } from '@/utils/flowData/layouts';
import { toast } from 'sonner';
import { getInitialNodes, getInitialEdges } from '@/utils/flowData/initialNodes';

interface CanvasOperationsOptions {
  layoutOptions?: LayoutOptions;
}

export const useCanvasOperations = (
  nodes: Node[],
  edges: Edge[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
  options: CanvasOperationsOptions = {}
) => {
  const reactFlowInstance = useReactFlow();
  
  // Ultra-optimized layout options for compact balanced tree layout
  const defaultLayoutOptions: LayoutOptions = {
    type: 'balanced-tree',
    spacing: 800,        // Optimal spacing for balanced tree
    nodeWidth: 180,
    nodeHeight: 120,
    marginX: 400,        // Optimized margin for balanced tree
    marginY: 100,        // Optimized margin for balanced tree
    preventOverlap: true,
    edgeShortenFactor: 0.95,
    horizontalSpacing: 800,  // Horizontal spacing for balanced tree
    verticalSpacing: 150     // Much shorter for compact edges
  };

  // Merge default options with provided options
  const layoutOptions: LayoutOptions = {
    ...defaultLayoutOptions,
    ...options.layoutOptions
  };
  
  // Clear the canvas - FORCE immediate clearing
  const clearCanvas = useCallback(() => {
    console.log('useCanvasOperations: Clear canvas called');
    
    if (nodes.length === 0 && edges.length === 0) {
      toast.info('Canvas is already empty');
      return;
    }
    
    // Clear canvas using React state - ReactFlow will automatically sync
    setNodes([]);
    setEdges([]);
    
    // Dispatch clear event
    window.dispatchEvent(new CustomEvent('canvas-cleared'));
    
    toast.success('Canvas cleared');
  }, [nodes.length, edges.length, setNodes, setEdges]);
  
  // Initialize the canvas with default nodes in a compact vertical tree layout
  const initializeCanvas = useCallback(() => {
    if (nodes.length > 0) {
      toast.info('Canvas already has nodes. Clear it first.');
      return;
    }
    
    const initialNodes = getInitialNodes();
    const initialEdges = getInitialEdges();
    
    // Initialize using React state - ReactFlow will automatically sync
    setNodes(initialNodes);
    setEdges(initialEdges);
    
    // Arrange immediately without delay for better performance
    const arrangedNodes = arrangeNodes(
      initialNodes,
      initialEdges,
      {
        type: 'balanced-tree',
        spacing: 800,        
        nodeWidth: 180,
        nodeHeight: 120,
        marginX: 400,        
        marginY: 100,        
        preventOverlap: true,
        edgeShortenFactor: 0.95,
        horizontalSpacing: 800,  
        verticalSpacing: 150     
      }
    );
    
    if (arrangedNodes.length > 0) {
      // Update nodes using React state - ReactFlow will automatically sync
      setNodes(arrangedNodes);
      toast.success('Canvas initialized with balanced hierarchical tree layout');
    }
    
  }, [nodes.length, setNodes, setEdges]);
  
  // Arrange nodes in a new grid row layout with 80% smaller grid squares and fixed edge lengths
  const arrangeNodesInLayout = useCallback(() => {
    if (nodes.length === 0) {
      toast.info('No nodes to arrange');
      return;
    }
    
    toast.info('Arranging nodes in balanced hierarchical tree layout...');
    
    try {
      // Use balanced tree layout with proper spacing for readability
      const arrangedNodes = arrangeNodes(nodes, edges, {
        type: 'balanced-tree',
        spacing: 800,        // Proper spacing for readability
        nodeWidth: 180,      // Standard node width
        nodeHeight: 120,     // Standard node height
        marginX: 400,        // Proper margin
        marginY: 100,        // Proper margin
        horizontalSpacing: 800,
        verticalSpacing: 150,
        preventOverlap: true,
        edgeShortenFactor: 0.9
      });
      
      if (!arrangedNodes || arrangedNodes.length === 0) {
        toast.error('Layout arrangement failed: No nodes returned');
        return;
      }
      
      if (arrangedNodes.length !== nodes.length) {
        toast.error('Layout arrangement failed: Node count mismatch');
        return;
      }
      
      // Create a new array that preserves all properties of original nodes except position
      const updatedNodes = nodes.map(originalNode => {
        const arrangedNode = arrangedNodes.find(n => n.id === originalNode.id);
        if (!arrangedNode) {
          return originalNode;
        }
        
        // Only update position, preserve all other properties
        return {
          ...originalNode,
          position: arrangedNode.position
        };
      });
      
      // Update nodes using React state - ReactFlow will automatically sync
      setNodes(updatedNodes);
      
      toast.success('Nodes arranged in balanced hierarchical tree layout');
      
      // Dispatch event immediately for better performance
      window.dispatchEvent(new CustomEvent('nodes-arranged'));
    } catch (error) {
      console.error('Error arranging nodes:', error);
      toast.error('Failed to arrange nodes');
    }
  }, [nodes, edges, setNodes]);
  
  return {
    clearCanvas,
    initializeCanvas,
    arrangeNodesInLayout
  };
};
