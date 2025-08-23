
import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
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
  // Ultra-optimized layout options for compact balanced tree layout
  const defaultLayoutOptions: LayoutOptions = {
    type: 'balanced-tree',
    spacing: 250,        // Optimal spacing for balanced tree
    nodeWidth: 180,
    nodeHeight: 120,
    marginX: 400,        // Optimized margin for balanced tree
    marginY: 100,        // Optimized margin for balanced tree
    preventOverlap: true,
    edgeShortenFactor: 0.95, // Optimized edge factor for balanced tree
    horizontalSpacing: 250,  // Horizontal spacing for balanced tree
    verticalSpacing: 180     // Vertical spacing for balanced tree
  };

  // Merge default options with provided options
  const layoutOptions: LayoutOptions = {
    ...defaultLayoutOptions,
    ...options.layoutOptions
  };
  
  // Clear the canvas
  const clearCanvas = useCallback(() => {
    if (nodes.length === 0 && edges.length === 0) {
      toast.info('Canvas is already empty');
      return;
    }
    
    setNodes([]);
    setEdges([]);
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
    
    // First set the initial nodes and edges
    setNodes(initialNodes);
    setEdges(initialEdges);
    
    // Then arrange them after a short delay to ensure they're properly rendered
    setTimeout(() => {
      const arrangedNodes = arrangeNodes(
        initialNodes,
        initialEdges,
        {
          type: 'balanced-tree',
          spacing: 250,        // Optimal spacing for balanced tree
          nodeWidth: 180,
          nodeHeight: 120,
          marginX: 400,        // Optimized margin for balanced tree
          marginY: 100,        // Optimized margin for balanced tree
          preventOverlap: true,
          edgeShortenFactor: 0.95, // Optimized edge factor for balanced tree
          horizontalSpacing: 250,  // Horizontal spacing for balanced tree
          verticalSpacing: 180     // Vertical spacing for balanced tree
        }
      );
      
      if (arrangedNodes.length > 0) {
        setNodes(arrangedNodes);
        toast.success('Canvas initialized with balanced hierarchical tree layout');
        // Dispatch events for ensuring visibility
        window.dispatchEvent(new CustomEvent('ensure-nodes-visible'));
        window.dispatchEvent(new CustomEvent('force-edge-redraw'));
      }
    }, 100);
    
  }, [nodes.length, setNodes, setEdges]);
  
  // Arrange nodes in a new grid row layout with 80% smaller grid squares and fixed edge lengths
  const arrangeNodesInLayout = useCallback(() => {
    if (nodes.length === 0) {
      toast.info('No nodes to arrange');
      return;
    }
    
    toast.info('Arranging nodes in compact grid layout by type...');
    
    try {
      // Use the new grid row layout algorithm with 80% smaller grid squares and fixed ~100px edge lengths
      const arrangedNodes = arrangeNodes(nodes, edges, {
        type: 'gridrows',
        spacing: 10,         // Reduced from 50
        nodeWidth: 40,       // Reduced from 180
        nodeHeight: 40,      // Reduced from 120
        marginX: 20,         // Reduced from 100
        marginY: 16,         // Reduced from 80
        preventOverlap: true,
        edgeShortenFactor: 0.55 // Fixed edge length of approximately 100px (55% shortening)
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
      
      // Set the nodes with the updated positions
      setNodes(updatedNodes);
      
      toast.success('Nodes arranged in compact grid layout by type');
      
      // Dispatch event for further processing
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('nodes-arranged'));
      }, 100);
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
