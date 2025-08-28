import React, { useCallback, useRef } from 'react';
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

interface NodeEditorProps {
  saveGraph: () => boolean;
  loadGraph: () => boolean;
  deleteGraph: (name: string) => boolean;
  getSavedGraphs: () => SavedGraph[];
  exportGraph: () => string | null;
  importGraph: (file: File) => void;
}

const NodeEditorContent: React.FC<NodeEditorProps> = ({
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
    duplicateSelected,
    clearCanvas,
    initializeCanvas
  } = useNodeEditor();

  // Add layout management
  const { arrangeNodesInLayout } = useNodeLayoutManager(nodes, edges, setNodes);
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
      
      // Clear existing state first
      setNodes([]);
      setEdges([]);
      
      // Reset viewport (unless prevented by manual layout)
      if (reactFlowInstance && !window.sessionStorage.getItem('prevent-fitview')) {
        reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
      }
      
      // Process the nodes and edges properly before loading
      const processedNodes = GraphNodeProcessor.prepareNodesForLoading(graphData.nodes || []);
      const processedEdges = GraphNodeProcessor.prepareEdgesForLoading(graphData.edges || []);
      
      console.log(`Processed ${processedNodes.length} nodes and ${processedEdges.length} edges for loading`);
      
      // Set processed nodes first
      setTimeout(() => {
        setNodes(processedNodes);
        
        // Then set processed edges with delay to ensure nodes are rendered
        setTimeout(() => {
          setEdges(processedEdges);
          
          // Fit view after loading (unless prevented by manual layout)
          setTimeout(() => {
            if (reactFlowInstance && !window.sessionStorage.getItem('prevent-fitview')) {
              reactFlowInstance.fitView({ padding: 0.2 });
            }
            toast.success(`Graph "${name}" loaded successfully`);
          }, 200);
        }, 100);
      }, 50);
      
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

  // FIXED: Import handler that directly handles the file import with proper state setters
  const handleImportGraph = useCallback(async (file: File) => {
    console.log(`NodeEditor: Import handler called with file: ${file.name}`);
    
    try {
      // Use the GraphExportImportService directly with our state setters
      const graphData = await GraphExportImportService.importGraphFromFile(file);
      
      if (!graphData) {
        toast.error('Failed to import graph');
        return;
      }
      
      console.log(`NodeEditor: Successfully imported graph with ${graphData.nodes.length} nodes and ${graphData.edges.length} edges`);
      
      // Clear existing state first
      setNodes([]);
      setEdges([]);
      
      // Reset viewport (unless prevented by manual layout)
      if (reactFlowInstance && !window.sessionStorage.getItem('prevent-fitview')) {
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
            toast.success(`Graph imported successfully`);
          }, 200);
        }, 100);
      }, 50);
      
    } catch (error) {
      console.error('NodeEditor: Error importing graph:', error);
      toast.error('Failed to import graph');
    }
  }, [setNodes, setEdges, reactFlowInstance]);

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
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={() => {}} // NO-OP FUNCTION TO TEST
          onSelectionChange={handleSelectionChange}
          onPaneClick={handlePaneClick}
          onDragOver={onDragOver}
          onDrop={onDrop}
          handleAddNode={handleAddNode}
          deleteSelected={deleteSelected}
          duplicateSelected={duplicateSelected}
          clearCanvas={clearCanvas}
          initializeCanvas={initializeCanvas}
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
