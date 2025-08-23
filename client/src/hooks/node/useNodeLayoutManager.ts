
import { useCallback } from 'react';
import { Node, Edge, useReactFlow } from '@xyflow/react';
import { toast } from 'sonner';
import { arrangeNodes, LayoutType } from '../../utils/flowData/layouts';

export const useNodeLayoutManager = (
  nodes: Node[],
  edges: Edge[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
) => {
  const { getZoom } = useReactFlow();

  const arrangeNodesInLayout = useCallback(() => {
    if (nodes.length === 0) {
      toast.info('No nodes to arrange');
      return;
    }

    // Prevent layout recalculation during active drawing
    const isEdgeBeingCreated = document.querySelector('.react-flow__connection-path');
    if (isEdgeBeingCreated) {
      console.log('Avoiding layout arrangement during active edge creation');
      return;
    }

    // Layout options using balanced tree layout for optimal hierarchical arrangement
    const layoutOptions = {
      type: 'balanced-tree' as LayoutType,
      horizontalSpacing: 250,     // Optimal spacing for balanced tree
      verticalSpacing: 180,       // Optimal vertical spacing
      nodeWidth: 180,
      nodeHeight: 120,
      marginX: 400,               // Optimized margin for balanced tree
      marginY: 100,               // Optimized margin for balanced tree
      preventOverlap: true,
      edgeShortenFactor: 0.95,    // Optimal edge factor for balanced tree
      minNodeDistance: 10
    };

    try {
      console.log('🌳 BALANCED TREE: Arranging nodes with balanced hierarchical tree layout');
      
      const nodesCopy = nodes.map(node => ({...node}));
      const arrangedNodes = arrangeNodes(nodesCopy, edges, layoutOptions);
      
      if (arrangedNodes?.length > 0) {
        setNodes(arrangedNodes);
        toast.success('Nodes arranged in balanced hierarchical tree layout');
        
        requestAnimationFrame(() => {
          window.dispatchEvent(new CustomEvent('node-added'));
          window.dispatchEvent(new CustomEvent('layout-changed'));
          window.dispatchEvent(new CustomEvent('force-cell-visibility'));
        });
      }
    } catch (error) {
      console.error('Layout error:', error);
      
      try {
        const fallbackNodes = arrangeNodes(nodes, edges, {
          type: 'grid' as LayoutType,
          spacing: 100,              // Fallback grid spacing
          preventOverlap: true,
          verticalSpacing: 1
        });
        setNodes(fallbackNodes);
        toast.warning('Using fallback grid layout');
      } catch (e) {
        console.error('Failed to apply fallback layout');
        toast.error('Failed to arrange nodes');
      }
    }
  }, [nodes, edges, setNodes, getZoom]);

  return { arrangeNodesInLayout };
};
