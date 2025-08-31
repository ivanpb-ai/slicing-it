
import { useCallback } from 'react';
import { Node, Edge, useReactFlow } from '@xyflow/react';
import { toast } from 'sonner';
import { arrangeNodes, LayoutType } from '../../utils/flowData/layouts';

export const useNodeLayoutManager = (
  nodes: Node[],
  edges: Edge[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges?: React.Dispatch<React.SetStateAction<Edge[]>>,
) => {
  const reactFlowInstance = useReactFlow();

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

    // Layout options with proper spacing to prevent overlap
    const layoutOptions = {
      type: 'balanced-tree' as LayoutType,
      horizontalSpacing: 800,     // Increased to prevent overlap of DNN/5QI nodes
      verticalSpacing: 150,       // Much shorter for compact edges
      nodeWidth: 180,
      nodeHeight: 120,
      marginX: 100,
      marginY: 100,
      preventOverlap: true,
      edgeShortenFactor: 0.95,
      minNodeDistance: 50         
    };

    try {
      console.log('✅ BALANCED TREE: Starting layout arrangement with improved spacing');
      console.log('Layout options:', layoutOptions);
      
      const nodesCopy = nodes.map(node => ({...node}));
      
      // Special handling for balanced-tree layout that returns cleaned edges
      if (layoutOptions.type === 'balanced-tree') {
        const balancedResult = require('../../utils/flowData/layouts/balancedTreeLayout').arrangeNodesInBalancedTree(nodesCopy, edges, layoutOptions);
        
        console.log(`🧹 Layout returned ${balancedResult.nodes.length} nodes and ${balancedResult.cleanedEdges.length} cleaned edges (was ${edges.length})`);
        
        if (balancedResult.nodes?.length > 0) {
          setNodes(balancedResult.nodes);
          
          // Update edges with cleaned edges if setEdges is available
          if (setEdges && balancedResult.cleanedEdges) {
            console.log(`🧹 Updating edges: ${edges.length} -> ${balancedResult.cleanedEdges.length}`);
            setEdges(balancedResult.cleanedEdges);
          }
          
          return balancedResult.nodes;
        }
      } else {
        // Use normal arrangement for other layout types
        const arrangedNodes = arrangeNodes(nodesCopy, edges, layoutOptions);
        if (arrangedNodes?.length > 0) {
          setNodes(arrangedNodes);
          return arrangedNodes;
        }
      }
      
      // Handle success for special layouts
      toast.success('Nodes arranged in balanced hierarchical tree layout');
      
      requestAnimationFrame(() => {
        window.dispatchEvent(new CustomEvent('node-added'));
        window.dispatchEvent(new CustomEvent('layout-changed'));
        window.dispatchEvent(new CustomEvent('force-cell-visibility'));
      });
    } catch (error) {
      console.error('Layout error:', error);
      
      try {
        const fallbackNodes = arrangeNodes(nodes, edges, {
          type: 'grid' as LayoutType,
          spacing: 250,              // Proper fallback spacing
          preventOverlap: true,
          verticalSpacing: 200,      // Proper vertical spacing instead of 1px!
          horizontalSpacing: 300,    // Proper horizontal spacing
          nodeWidth: 180,
          nodeHeight: 120,
          marginX: 400,
          marginY: 100
        });
        setNodes(fallbackNodes);
        toast.warning('Using fallback grid layout');
      } catch (e) {
        console.error('Failed to apply fallback layout');
        toast.error('Failed to arrange nodes');
      }
    }
  }, [nodes, edges, setNodes, reactFlowInstance]);

  return { arrangeNodesInLayout };
};
