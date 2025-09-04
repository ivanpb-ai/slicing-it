import React, { useCallback, useRef, useEffect } from 'react';
import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import { useNodeEditor } from '../hooks/useNodeEditor';
import { useNodeLayoutManager } from '../hooks/node/useNodeLayoutManager';
import { useLayoutOperations } from '../hooks/flow/useLayoutOperations';
import { useNodeDragDrop } from '../hooks/useNodeDragDrop';
import FlowInstance from './flow/FlowInstance';
import { SavedGraph } from '../hooks/types';
import type { GraphData } from '../services/storage/GraphLocalStorageService';
import { GraphLocalStorageService } from '../services/storage/GraphLocalStorageService';
import { GraphExportImportService } from '../services/export/GraphExportImportService';
import { GraphNodeProcessor } from '../services/processing/GraphNodeProcessor';
import { NodeEditorProvider } from '../contexts/NodeEditorContext';
import { toast } from 'sonner';
import { EXAMPLE_GRAPH } from '../data/exampleGraph';
import { resetCounters, updateDnnCounter } from '../utils/flowData/idCounters';

interface NodeEditorProps {
  nodes: any[];
  edges: any[];
  setNodes: React.Dispatch<React.SetStateAction<any[]>>;
  setEdges: React.Dispatch<React.SetStateAction<any[]>>;
  saveGraph: () => boolean;
  loadGraph: () => boolean;
  deleteGraph: (name: string) => boolean;
  getSavedGraphs: () => SavedGraph[];
  exportGraph: () => string | null;
  importGraph: (file: File) => void;
}

const NodeEditorContent: React.FC<NodeEditorProps> = ({
  nodes,
  edges,
  setNodes,
  setEdges,
  saveGraph,
  loadGraph,
  deleteGraph,
  getSavedGraphs,
  exportGraph,
  importGraph
}) => {
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const {
    nodes: hookNodes,
    edges: hookEdges,
    setNodes: hookSetNodes,
    setEdges: hookSetEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onSelectionChange,
    selectedElements,
    addNode,
    createChildNode,
    updateNodeData,
    deleteSelected,
    duplicateSelected,
    clearCanvas,
    initializeCanvas
  } = useNodeEditor();

  // CRITICAL FIX: Only sync when passed state has MORE items (like after import)
  // Don't sync when hook state has more items (like after creating new nodes)
  React.useEffect(() => {
    if (nodes.length > hookNodes.length) {
      console.log(`NodeEditor: Syncing passed nodes (${nodes.length}) with hook nodes (${hookNodes.length}) - import detected`);
      hookSetNodes(nodes);
    }
  }, [nodes, hookNodes.length, hookSetNodes]);

  React.useEffect(() => {
    if (edges.length > hookEdges.length) {
      console.log(`NodeEditor: Syncing passed edges (${edges.length}) with hook edges (${hookEdges.length}) - import detected`);
      hookSetEdges(edges);
    }
  }, [edges, hookEdges.length, hookSetEdges]);
  


  // Create custom clear and initialize functions that use the correct state setters
  const handleClearCanvas = useCallback(() => {
    if (nodes.length === 0) {
      toast.info('Canvas is already empty');
      return;
    }
    
    // CRITICAL FIX: Reset ID counters when starting a new graph
    resetCounters();
    
    // CRITICAL FIX: Use ReactFlow instance AND update component state
    if (reactFlowInstance) {
      reactFlowInstance.setNodes([]);
      reactFlowInstance.setEdges([]);
      reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
      // ALSO update component state so UI reflects the clear
      setNodes([]);
      setEdges([]);
    } else {
      setNodes([]);
      setEdges([]);
    }
    toast.success('Canvas cleared');
  }, [nodes.length, setNodes, setEdges, reactFlowInstance]);

  const handleInitializeCanvas = useCallback(() => {
    if (nodes.length > 0) {
      const proceed = window.confirm('Canvas already has nodes. Clear it first and add example data?');
      if (!proceed) return;
    }

    try {      
      console.log(`NodeEditor: Loading example graph with ${EXAMPLE_GRAPH.nodes.length} nodes and ${EXAMPLE_GRAPH.edges.length} edges`);
      
      // CRITICAL FIX: Reset and update counters to avoid ID conflicts
      resetCounters();
      updateDnnCounter(EXAMPLE_GRAPH.nodes);
      
      // Clear existing state first
      setNodes([]);
      setEdges([]);
      
      // Reset viewport
      if (reactFlowInstance) {
        reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
      }
      
      // CRITICAL FIX: Use ReactFlow instance AND update component state
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.setNodes(EXAMPLE_GRAPH.nodes);
          setNodes(EXAMPLE_GRAPH.nodes);
        } else {
          setNodes(EXAMPLE_GRAPH.nodes);
        }
        setTimeout(() => {
          if (reactFlowInstance) {
            reactFlowInstance.setEdges(EXAMPLE_GRAPH.edges);
            setEdges(EXAMPLE_GRAPH.edges);
          } else {
            setEdges(EXAMPLE_GRAPH.edges);
          }
          
          // Fit view after loading
          setTimeout(() => {
            if (reactFlowInstance) {
              reactFlowInstance.fitView({ padding: 0.2 });
            }
            toast.success(`Example graph loaded with ${EXAMPLE_GRAPH.nodes.length} nodes and ${EXAMPLE_GRAPH.edges.length} edges`);
          }, 200);
        }, 100);
      }, 50);
      
    } catch (error) {
      console.error('NodeEditor: Error loading example graph:', error);
      toast.error('Failed to load example graph');
    }
  }, [nodes.length, setNodes, setEdges, reactFlowInstance]);

  // Add layout management - pass setEdges for proper edge handling
  const { arrangeNodesInLayout } = useNodeLayoutManager(nodes, edges, setNodes, setEdges);
  const { handleArrangeLayout } = useLayoutOperations(
    nodes,
    edges,
    setNodes,
    setEdges,
    arrangeNodesInLayout
  );
  

  // Use the proper drag and drop handler
  const { onDragOver, onDrop } = useNodeDragDrop(
    reactFlowWrapper,
    addNode,
    createChildNode
  );

  const hasSelectedElements = selectedElements.nodes.length > 0 || selectedElements.edges.length > 0;

  // Create a wrapper function that calculates proper viewport-relative positions
  const handleAddNode = useCallback((type: any, fiveQIId?: string) => {
    try {
      // Get the current viewport center using ReactFlow instance
      let position = { x: 250, y: 250 }; // Default fallback position
      
      if (reactFlowInstance) {
        // Get viewport center in flow coordinates
        const viewport = reactFlowInstance.getViewport();
        const bounds = document.querySelector('.react-flow')?.getBoundingClientRect();
        
        if (bounds) {
          const centerX = bounds.width / 2;
          const centerY = bounds.height / 2;
          
          // Convert screen coordinates to flow coordinates
          position = reactFlowInstance.screenToFlowPosition({
            x: centerX,
            y: centerY
          });
        }
      }
      
      // Add some randomization to avoid overlapping
      position.x += (Math.random() - 0.5) * 100;
      position.y += (Math.random() - 0.5) * 100;
      
      console.log(`NodeEditor: Adding ${type} node at position:`, position);
      addNode(type, position, fiveQIId);
    } catch (error) {
      console.error('Error in handleAddNode:', error);
      // Fallback to simple position
      addNode(type, { x: 250, y: 250 }, fiveQIId);
    }
  }, [addNode, reactFlowInstance]);

  // Handle node double-click for editing
  const handleNodeDoubleClick = useCallback((event: React.MouseEvent, node: any) => {
    console.log('Node double-clicked:', node);
  }, []);

  // Handle selection changes
  const handleSelectionChange = useCallback((params: any) => {
    onSelectionChange(params);
  }, [onSelectionChange]);

  // Handle pane click to deselect
  const handlePaneClick = useCallback(() => {
    // Clear selection when clicking on empty space
  }, []);

  // FIXED: Load handler that properly loads saved graphs
  const handleLoadGraph = useCallback(() => {
    console.log('NodeEditor: Load triggered');
    
    try {
      // Get saved graphs from localStorage
      const savedGraphs = GraphLocalStorageService.getLocalGraphs();
      console.log(`Available graphs for loading: ${savedGraphs.length}`);
      
      if (savedGraphs.length === 0) {
        toast.error('No saved graphs found');
        return false;
      }
      
      // Prompt user for graph name
      const graphNames = savedGraphs.map(g => g.name).join(', ');
      const name = window.prompt(`Enter the name of the graph to load.\nAvailable graphs: ${graphNames}`);
      
      if (!name || name.trim() === '') {
        toast.info('Load cancelled');
        return false;
      }
      
      // Check if graph exists
      const graphExists = savedGraphs.some(g => g.name === name);
      if (!graphExists) {
        toast.error(`Graph "${name}" not found`);
        return false;
      }
      
      // Load the graph data
      const graphData = GraphLocalStorageService.loadFromLocalStorage(name);
      
      if (!graphData) {
        toast.error(`Failed to load graph "${name}"`);
        return false;
      }
      
      console.log(`Loading graph "${name}" with ${graphData.nodes.length} nodes and ${graphData.edges?.length || 0} edges`);
      console.log('NodeEditor: Loaded nodes:', graphData.nodes.map(n => ({id: n.id, type: n.data?.type || n.type})));
      
      // CRITICAL FIX: Clear existing state using ReactFlow instance
      if (reactFlowInstance) {
        reactFlowInstance.setNodes([]);
        reactFlowInstance.setEdges([]);
      } else {
        setNodes([]);
        setEdges([]);
      }
      
      // Reset viewport (unless prevented by manual layout)
      if (reactFlowInstance && !window.sessionStorage.getItem('prevent-fitview')) {
        reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
      }
      
      // OPTIMIZED: Skip heavy processing during load, use nodes/edges directly
      const processedNodes = (graphData.nodes || []).map(node => ({
        ...node,
        type: 'customNode',
        position: node.position || { x: 0, y: 0 }
      }));
      const processedEdges = (graphData.edges || []).map(edge => ({
        ...edge,
        type: edge.type || 'default'
      }));
      
      console.log(`Processed ${processedNodes.length} nodes and ${processedEdges.length} edges for loading`);
      console.log('NodeEditor: Processed nodes for load:', processedNodes.map(n => ({id: n.id, type: n.data?.type || n.type})));
      
      // CRITICAL FIX: Force ReactFlow to treat loaded nodes as completely new
      // Clear everything first to reset ReactFlow's internal state
      if (reactFlowInstance) {
        console.log('NodeEditor: Resetting ReactFlow state for clean load');
        reactFlowInstance.setNodes([]);
        reactFlowInstance.setEdges([]);
      }
      setNodes([]);
      setEdges([]);
      
      // Wait a frame for complete reset, then load as new nodes
      setTimeout(() => {
        console.log('NodeEditor: Loading nodes as fresh entities');
        setNodes(processedNodes);
        setEdges(processedEdges);
      }, 50);
      
      // Minimal delay only for DOM rendering, then fit view
      setTimeout(() => {
        if (reactFlowInstance && !window.sessionStorage.getItem('prevent-fitview')) {
          reactFlowInstance.fitView({ padding: 0.2 });
        }
        
        // CRITICAL FIX: Force ReactFlow to initialize node interactivity
        // Trigger a position change for each node to register them as interactive
        setTimeout(() => {
          if (reactFlowInstance) {
            const currentNodes = reactFlowInstance.getNodes();
            const refreshedNodes = currentNodes.map(node => ({
              ...node,
              position: { 
                x: node.position.x + 0.01, // Tiny position change
                y: node.position.y + 0.01 
              }
            }));
            reactFlowInstance.setNodes(refreshedNodes);
            
            // Immediately restore exact positions
            setTimeout(() => {
              reactFlowInstance.setNodes(currentNodes);
            }, 10);
          }
        }, 100);
        
        toast.success(`Graph "${name}" loaded successfully with ${processedNodes.length} nodes and ${processedEdges.length} edges`);
      }, 200);
      
      return true;
    } catch (error) {
      console.error('Error loading graph:', error);
      toast.error('Failed to load graph');
      return false;
    }
  }, [setNodes, setEdges, reactFlowInstance]);

  // Handle loading graph from storage
  const handleLoadGraphFromStorage = useCallback((graphData: GraphData | string) => {
    if (typeof graphData === 'string') {
      return handleLoadGraph();
    }
    // Handle GraphData object if needed
    return false;
  }, [handleLoadGraph]);

  // FIXED: Import handler that uses parent import function to update parent state
  const handleImportGraph = useCallback(async (file: File) => {
    console.log(`NodeEditor: Import handler called with file: ${file.name} - delegating to parent import function`);
    
    try {
      // Use the parent import function that updates the correct state
      importGraph(file);
      console.log(`NodeEditor: Successfully delegated import to parent function`);
    } catch (error) {
      console.error('NodeEditor: Error delegating import:', error);
      toast.error('Failed to import graph');
    }
  }, [importGraph]);

  // CRITICAL FIX: Direct save handler that saves the actual graph data
  const handleSaveGraph = useCallback(() => {
    console.log(`NodeEditor: Save triggered with ${nodes.length} nodes and ${edges.length} edges`);
    
    let currentNodes = nodes;
    let currentEdges = edges;
    
    // If no nodes in current state, try to get them from ReactFlow instance
    if (currentNodes.length === 0 && reactFlowInstance) {
      const flowNodes = reactFlowInstance.getNodes();
      const flowEdges = reactFlowInstance.getEdges();
      console.log(`NodeEditor: Retrieved ${flowNodes.length} nodes and ${flowEdges.length} edges from ReactFlow instance`);
      
      if (flowNodes.length > 0) {
        currentNodes = flowNodes;
        currentEdges = flowEdges;
        
        // Update the state for future operations
        setNodes(flowNodes);
        setEdges(flowEdges);
      }
    }
    
    // If we still have no nodes, we truly have an empty graph
    if (currentNodes.length === 0) {
      console.warn('NodeEditor: No nodes to save');
      toast.error('Cannot save an empty graph');
      return false;
    }
    
    console.log(`NodeEditor: Attempting to save ${currentNodes.length} nodes and ${currentEdges.length} edges`);
    console.log('NodeEditor: Nodes being saved:', currentNodes.map(n => ({id: n.id, type: n.data?.type || n.type})));
    
    // Direct save using the actual graph data
    try {
      const name = window.prompt('Enter a name for the graph:');
      if (!name || name.trim() === '') {
        toast.error('Please enter a valid name for the graph');
        return false;
      }
      
      const success = GraphLocalStorageService.saveToLocalStorage(
        name,
        currentNodes,
        currentEdges
      );
      
      if (success) {
        toast.success(`Graph "${name}" saved successfully`);
        return true;
      } else {
        toast.error(`Failed to save graph "${name}"`);
        return false;
      }
    } catch (error) {
      console.error('Error saving graph:', error);
      toast.error('Failed to save graph');
      return false;
    }
  }, [nodes, edges, reactFlowInstance, setNodes, setEdges]);

  return (
    <NodeEditorProvider createChildNode={createChildNode} updateNodeData={updateNodeData}>
      <div ref={reactFlowWrapper} className="h-full w-full">
        <FlowInstance
          nodes={hookNodes}
          edges={hookEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={handleNodeDoubleClick}
          onSelectionChange={handleSelectionChange}
          onPaneClick={handlePaneClick}
          onDragOver={onDragOver}
          onDrop={onDrop}
          handleAddNode={handleAddNode}
          deleteSelected={deleteSelected}
          duplicateSelected={duplicateSelected}
          clearCanvas={handleClearCanvas}
          initializeCanvas={handleInitializeCanvas}
          arrangeLayout={handleArrangeLayout}
          hasSelectedElements={hasSelectedElements}
          onSave={handleSaveGraph}
          onLoad={handleLoadGraph}
          onDelete={deleteGraph}
          onExport={exportGraph}
          onImport={handleImportGraph}
          getSavedGraphs={getSavedGraphs}
          onLoadGraphFromStorage={handleLoadGraphFromStorage}
        />
      </div>
    </NodeEditorProvider>
  );
};

const NodeEditor: React.FC<NodeEditorProps> = (props) => {
  return (
    <ReactFlowProvider>
      <NodeEditorContent {...props} />
    </ReactFlowProvider>
  );
};

export default NodeEditor;
