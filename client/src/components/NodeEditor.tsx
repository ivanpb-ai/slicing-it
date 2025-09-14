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
  importGraph
}) => {
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // SIMPLIFIED: Direct export using ReactFlow instance inside provider context
  const directExportGraph = useCallback((graphName?: string): string | null => {
    console.log('🔍 NodeEditor: Direct export called with ReactFlow instance');
    console.log('🔍 NodeEditor: ReactFlow instance available:', !!reactFlowInstance);
    console.log('🔍 NodeEditor: graphName parameter passed:', graphName);
    
    // Get name from user if not provided
    console.log('🔍 NodeEditor: About to show naming prompt...');
    const exportName = graphName || window.prompt('Enter a name for the exported file (optional):') || undefined;
    console.log('🔍 NodeEditor: User entered name:', exportName);
    
    if (reactFlowInstance) {
      const flowNodes = reactFlowInstance.getNodes();
      const flowEdges = reactFlowInstance.getEdges();
      console.log('🔍 NodeEditor: Direct access - ReactFlow has', flowNodes.length, 'nodes and', flowEdges.length, 'edges');
      
      if (flowNodes.length > 0) {
        const fileName = exportName && typeof exportName === 'string'
          ? `${exportName.replace(/\s+/g, '_')}_${Date.now()}.json`
          : `graph_export_${Date.now()}.json`;
        
        const graphData = {
          nodes: flowNodes,
          edges: flowEdges,
          exportTime: Date.now(),
          exportMethod: 'DIRECT_REACTFLOW_ACCESS'
        };
        
        const dataStr = JSON.stringify(graphData, null, 2);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
        
        const downloadLink = document.createElement('a');
        downloadLink.setAttribute('href', dataUri);
        downloadLink.setAttribute('download', fileName);
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        toast.success(`Graph exported with ${flowNodes.length} nodes using direct ReactFlow access!`);
        return dataStr;
      }
    }
    
    console.error('🔍 NodeEditor: No ReactFlow instance or empty graph');
    toast.error('Cannot export: no graph data available');
    return null;
  }, [reactFlowInstance]);

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


  // CRITICAL FIX: Allow imports AND explicit clear operations, but prevent interference with normal node creation
  React.useEffect(() => {
    // Import scenario: nodes.length > hookNodes.length (e.g., 26 > 0 or 26 > 5)
    // REMOVED: Clear scenario sync - this was interfering with normal drag/drop node creation
    // DNN creation scenario: hookNodes.length > nodes.length (e.g., 27 > 26) - should NOT sync
    
    const isImport = nodes.length > hookNodes.length && nodes.length > 0;
    const isNewNodeCreation = hookNodes.length > nodes.length;
    
    if (isImport) {
      console.log(`NodeEditor: Syncing passed nodes (${nodes.length}) with hook nodes (${hookNodes.length}) - import detected`);
      hookSetNodes(nodes);
    } else if (isNewNodeCreation) {
      console.log(`NodeEditor: PRESERVED new nodes - nodes: ${nodes.length}, hookNodes: ${hookNodes.length} (normal node creation or child node addition)`);
    }
  }, [nodes, edges.length, hookNodes.length, hookSetNodes]);

  React.useEffect(() => {
    // SMART SYNC: Allow imports but prevent interference with normal edge creation
    const isImport = edges.length > hookEdges.length && edges.length > 0;
    const isNewEdgeCreation = hookEdges.length > edges.length;
    
    if (isImport) {
      console.log(`NodeEditor: Syncing passed edges (${edges.length}) with hook edges (${hookEdges.length}) - import detected`);
      hookSetEdges(edges);
    } else if (isNewEdgeCreation) {
      console.log(`NodeEditor: PRESERVED new edges - edges: ${edges.length}, hookEdges: ${hookEdges.length} (normal edge creation)`);
    }
  }, [edges, nodes.length, hookEdges.length, hookSetEdges]);
  


  // Create custom clear and initialize functions that use the correct state setters
  const handleClearCanvas = useCallback(() => {
    // Check actual current nodes from ReactFlow instance or hookNodes
    const currentNodes = reactFlowInstance?.getNodes() || hookNodes;
    const currentEdges = reactFlowInstance?.getEdges() || hookEdges;
    
    console.log('Clear canvas check - current nodes:', currentNodes.length, 'current edges:', currentEdges.length);
    
    if (currentNodes.length === 0 && currentEdges.length === 0) {
      toast.info('Canvas is already empty');
      return;
    }
    
    // CRITICAL FIX: Reset ID counters when starting a new graph
    resetCounters();
    
    // Clear using React state - ReactFlow will automatically sync
    setNodes([]);
    setEdges([]);
    
    // Reset viewport
    if (reactFlowInstance) {
      reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
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
      
      // Set nodes using React state - ReactFlow will automatically sync
      setTimeout(() => {
        setNodes(EXAMPLE_GRAPH.nodes);
        setTimeout(() => {
          // Use React state for edges - ReactFlow will automatically sync
          setEdges(EXAMPLE_GRAPH.edges);
          
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

  // Add layout management - use hookNodes for accurate state
  const { arrangeNodesInLayout } = useNodeLayoutManager(hookNodes, hookEdges, hookSetNodes, hookSetEdges);
  const { handleArrangeLayout } = useLayoutOperations(
    hookNodes,
    hookEdges,
    hookSetNodes,
    hookSetEdges,
    arrangeNodesInLayout
  );
  

  // Use the proper drag and drop handler
  const { onDragOver, onDrop } = useNodeDragDrop(
    reactFlowWrapper,
    addNode,
    createChildNode,
    setNodes,
    arrangeNodesInLayout
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
      
      // Show tooltip notification for network nodes
      if (type === 'network') {
        toast.info("Please drag TAC nodes onto the network node to associate geographical areas with this network", {
          style: {
            color: '#000000 !important',
            backgroundColor: '#ffffff !important',
            border: '1px solid #e0e0e0 !important',
            fontSize: '14px !important',
            fontWeight: '500 !important'
          },
          className: 'custom-info-toast',
          duration: 5000 // Show for 5 seconds
        });
      }
      
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
      
      // Clear existing state using React state - ReactFlow will automatically sync
      setNodes([]);
      setEdges([]);
      
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
      
      // Clear everything first to reset state
      console.log('NodeEditor: Resetting state for clean load');
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
        // Remove the position refresh hack - not needed with proper state management
        setTimeout(() => {
          // The nodes are already loaded via React state, no manual refresh needed
        }, 100);
        
        // Show toast with proper styling
        toast.success(`Graph "${name}" loaded successfully with ${processedNodes.length} nodes and ${processedEdges.length} edges`, {
          style: {
            color: '#000000 !important',
            backgroundColor: '#ffffff !important',
            border: '1px solid #e0e0e0 !important',
            fontSize: '14px !important',
            fontWeight: '500 !important'
          },
          className: 'custom-success-toast'
        });
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
          onExport={directExportGraph}
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
