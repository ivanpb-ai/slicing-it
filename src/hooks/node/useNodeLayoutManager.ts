
import { useCallback } from 'react';
import { Node, Edge, useReactFlow } from '@xyflow/react';
import { toast } from 'sonner';
import { arrangeNodes, LayoutOptions, LayoutType } from '../../utils/flowData/layouts';

export const useNodeLayoutManager = (
  nodes: Node[],
  edges: Edge[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
) => {
  const { getZoom } = useReactFlow();

  const arrangeNodesInLayout = useCallback((layoutType: LayoutType = 'balanced-tree') => {
    if (nodes.length === 0) {
      toast.info('No nodes to arrange');
      return;
    }

    const isEdgeBeingCreated = document.querySelector('.react-flow__connection-path');
    if (isEdgeBeingCreated) {
      console.log('Avoiding layout arrangement during active edge creation');
      return;
    }

    const baseOptions: Partial<LayoutOptions> = {
      nodeWidth: 180,
      nodeHeight: 120,
      marginX: 150,
      marginY: 50,
    };

    let layoutOptions: LayoutOptions;

    switch (layoutType) {
      case 'balanced-tree':
        layoutOptions = {
          ...baseOptions,
          type: 'balanced-tree',
          horizontalSpacing: 50,
          verticalSpacing: 150,
        };
        break;
      case 'tree':
      default:
        layoutOptions = {
          ...baseOptions,
          type: 'tree',
          horizontalSpacing: 100,
          verticalSpacing: 1,
          preventOverlap: true,
          edgeCrossingReduction: true,
          edgeShortenFactor: 0.98,
          minNodeDistance: 10,
          preservePositions: false,
          levelHeight: 1,
        };
        break;
    }

    try {
      console.log(`Arranging nodes with ${layoutType} layout`);
      
      const nodesCopy = nodes.map(node => ({...node}));
      const arrangedNodes = arrangeNodes(nodesCopy, edges, layoutOptions);
      
      if (arrangedNodes?.length > 0) {
        setNodes(arrangedNodes);
        toast.success(`Nodes arranged in ${layoutType} layout`);
        
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
          spacing: 100,
          preventOverlap: true,
          verticalSpacing: 1,
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
