import { useState, useCallback, useRef } from 'react';
import { Node, Edge, Connection, addEdge, useReactFlow } from '@xyflow/react';
import { toast } from 'sonner';
import { NodeType } from '@/types/nodeTypes';
import { useNodeCreation } from './node/useNodeCreation';
import { useSimpleChildNodeCreation } from './node/useSimpleChildNodeCreation';
import { useEdgeCreation } from './edge/useEdgeCreation';
import { useNodeSelection } from './node/useNodeSelection';
import { useNodeDuplication } from './node/useNodeDuplication';
import { resetCounters, updateDnnCounter } from '@/utils/flowData/idCounters';

import { EXAMPLE_GRAPH } from '@/data/exampleGraph';

export const useNodeEditor = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const reactFlowInstance = useReactFlow();

  // Node creation hooks
  const { createNode } = useNodeCreation(setNodes);
  const { addEdgeWithHandles } = useEdgeCreation(setEdges);
  const { createChildNode } = useSimpleChildNodeCreation(setNodes, addEdgeWithHandles);
  
  // Selection and duplication hooks
  const { selectedElements, handleSelectionChange } = useNodeSelection();
  const { duplicateSelected } = useNodeDuplication(nodes, edges, setNodes, setEdges, selectedElements);

  const onNodesChange = useCallback((changes: any) => {
    setNodes((nds) => {
      const updatedNodes = nds.map(node => {
        const change = changes.find((c: any) => c.id === node.id);
        if (change) {
          if (change.type === 'position' && change.position) {
            return { ...node, position: change.position };
          }
          if (change.type === 'select') {
            return { ...node, selected: change.selected };
          }
          if (change.type === 'remove') {
            return null;
          }
        }
        return node;
      }).filter(Boolean) as Node[];
      
      return updatedNodes;
    });
  }, []);

  const onEdgesChange = useCallback((changes: any) => {
    setEdges((eds) => {
      const updatedEdges = eds.map(edge => {
        const change = changes.find((c: any) => c.id === edge.id);
        if (change) {
          if (change.type === 'select') {
            return { ...edge, selected: change.selected };
          }
          if (change.type === 'remove') {
            return null;
          }
        }
        return edge;
      }).filter(Boolean) as Edge[];
      
      return updatedEdges;
    });
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds));
  }, []);

  const onSelectionChange = useCallback((params: any) => {
    handleSelectionChange(params);
  }, [handleSelectionChange]);

  const addNode = useCallback((type: NodeType, position: { x: number; y: number }, fiveQIId?: string) => {
    console.log(`useNodeEditor: Adding ${type} node at position:`, position);
    createNode(type, position, fiveQIId);
  }, [createNode]);

  const deleteSelected = useCallback(() => {
    if (selectedElements.nodes.length === 0 && selectedElements.edges.length === 0) {
      toast.error('No elements selected for deletion');
      return;
    }

    const selectedNodeIds = selectedElements.nodes.map(n => n.id);
    const selectedEdgeIds = selectedElements.edges.map(e => e.id);

    // Remove selected nodes
    setNodes(prevNodes => 
      prevNodes.filter(node => !selectedNodeIds.includes(node.id))
    );

    // Remove selected edges
    setEdges(prevEdges => 
      prevEdges.filter(edge => !selectedEdgeIds.includes(edge.id))
    );

    toast.success(`Deleted ${selectedElements.nodes.length} nodes and ${selectedElements.edges.length} edges`);
  }, [selectedElements]);

  const duplicateSelectedNodes = useCallback(() => {
    duplicateSelected();
  }, [duplicateSelected]);

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    resetCounters();
    
    if (reactFlowInstance) {
      reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
    }
    
    toast.success('Canvas cleared');
  }, [reactFlowInstance]);

  // Initialize canvas with hardcoded mats1 graph
  const initializeCanvas = useCallback(() => {
    console.log('useNodeEditor: Initializing canvas with hardcoded mats1 graph');
    
    try {
      const graphData = EXAMPLE_GRAPH;
      
      console.log(`Loading mats1 graph with ${graphData.nodes.length} nodes and ${graphData.edges.length} edges`);
      
      // Reset counters before loading
      resetCounters();
      updateDnnCounter(graphData.nodes);
      
      // Clear existing state first
      setNodes([]);
      setEdges([]);
      
      // Reset viewport
      if (reactFlowInstance) {
        reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
      }
      
      // Set nodes first
      setTimeout(() => {
        setNodes(graphData.nodes || []);
        
        // Then set edges with delay to ensure nodes are rendered
        setTimeout(() => {
          setEdges(graphData.edges || []);
          
          // Fit view after loading
          setTimeout(() => {
            if (reactFlowInstance) {
              reactFlowInstance.fitView({ padding: 0.2 });
            }
            toast.success('Example graph (example) loaded successfully');
          }, 200);
        }, 100);
      }, 50);
      
    } catch (error) {
      console.error('Error loading example graph:', error);
      toast.error('Failed to load example graph');
    }
  }, [reactFlowInstance]);

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onSelectionChange,
    selectedElements,
    addNode,
    createChildNode,
    deleteSelected,
    duplicateSelected: duplicateSelectedNodes,
    clearCanvas,
    initializeCanvas
  };
};
