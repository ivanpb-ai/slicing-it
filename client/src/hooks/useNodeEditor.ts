import { useState, useCallback, useRef } from 'react';
import { Node, Edge, Connection, useReactFlow, applyNodeChanges } from '@xyflow/react';
import { toast } from 'sonner';
import { NodeType } from '../types/nodeTypes';
import { useNodeCreation } from './node/useNodeCreation';
import { useSimpleChildNodeCreation } from './node/useSimpleChildNodeCreation';
import { useUnifiedEdgeManager } from './edge/useUnifiedEdgeManager';
import { useNodeSelection } from './node/useNodeSelection';
import { useNodeDuplication } from './node/useNodeDuplication';
import { resetCounters} from '../utils/flowData/idCounters';
import { cleanupOrphanedEdges } from '../utils/edgeCleanup';

import { EXAMPLE_GRAPH } from '../data/exampleGraph';

export const useNodeEditor = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const reactFlowInstance = useReactFlow();

  // Node creation hooks
  const { createNode } = useNodeCreation(setNodes);
  const { addEdgeWithHandles } = useUnifiedEdgeManager(setEdges);
  const { createChildNode } = useSimpleChildNodeCreation(setNodes, addEdgeWithHandles);
  
  // Selection and duplication hooks
  const { selectedElements, handleSelectionChange } = useNodeSelection();
  const { duplicateSelected } = useNodeDuplication(nodes, edges, setNodes, setEdges, selectedElements);

  const onNodesChange = useCallback((changes: any) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
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

  // Use unified edge manager instead of manual edge creation
  const { onConnect: unifiedOnConnect } = useUnifiedEdgeManager(setEdges);
  
  const onConnect = useCallback((connection: Connection) => {
    console.log('useNodeEditor: Delegating to unified edge manager:', connection);
    unifiedOnConnect(connection);
  }, [unifiedOnConnect]);

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

  // Clean up orphaned edges
  const cleanupEdges = useCallback(() => {
    const removedCount = cleanupOrphanedEdges(nodes, edges, setEdges);
    if (removedCount > 0) {
      toast.success(`Removed ${removedCount} orphaned edges`);
    } else {
      toast.info('No orphaned edges found');
    }
  }, [nodes, edges]);

  const clearCanvas = useCallback(() => {
    console.log('useNodeEditor: Clear canvas called');
    
    // Force immediate clearing - no delays
    setNodes([]);
    setEdges([]);
    resetCounters();
    
    // Reset viewport immediately
    if (reactFlowInstance) {
      reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
      // Force reactflow to update
      reactFlowInstance.setNodes([]);
      reactFlowInstance.setEdges([]);
    }
    
    // Dispatch clear event
    window.dispatchEvent(new CustomEvent('canvas-cleared'));
    
    toast.success('Canvas cleared');
  }, [reactFlowInstance, resetCounters]);

  // Initialize canvas with hardcoded graph
  const initializeCanvas = useCallback(() => {
    console.log('useNodeEditor: Initializing canvas with hardcoded graph');
    
    try {
      const graphData = EXAMPLE_GRAPH;
      
      console.log(`Loading graph with ${graphData.nodes.length} nodes and ${graphData.edges.length} edges`);
      
      // Reset counters before loading
      resetCounters();
      //updateDnnCounter(graphData.nodes);
      
      // Clear existing state first
      setNodes([]);
      setEdges([]);
      
      // Reset viewport
      if (reactFlowInstance) {
        reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
      }
      
      // Set nodes and edges immediately for better performance
      setNodes(graphData.nodes || []);
      
      if (Array.isArray(graphData.edges)) {
         const validEdges: Edge[] = graphData.edges.map(edge => ({
               data: {},      // add missing optional fields if necessary
             ...edge,
  }));
     setEdges(validEdges);
  }   else {
     setEdges([]);
    }
      
      // Fit view immediately if not prevented
      if (reactFlowInstance && !window.sessionStorage.getItem('prevent-fitview')) {
        reactFlowInstance.fitView({ padding: 0.2 });
      }
      toast.success(`Example graph loaded successfully with ${graphData.nodes?.length || 0} nodes and ${graphData.edges?.length || 0} edges`);
      
    } catch (error) {
      console.error('Error loading example graph:', error);
      toast.error('Failed to load example graph');
    }
  }, [reactFlowInstance]);

  // Update node data function
  const updateNodeData = useCallback((id: string, newData: any) => {
    setNodes((nds) => 
      nds.map((node) => 
        node.id === id 
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
  }, []);

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
    updateNodeData,
    deleteSelected,
    duplicateSelected: duplicateSelectedNodes,
    clearCanvas,
    cleanupEdges,
    initializeCanvas
  };
};
