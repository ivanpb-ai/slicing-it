
import React, { useCallback, useRef, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useNodeEditor } from '../../hooks/useNodeEditor';
import { SavedGraph } from '../../hooks/types';
import { useNodeDragDrop } from '../../hooks/flow/useNodeDragDrop';
import { useSaveLoadGraph } from '../../hooks/useSaveLoadGraph';
import { useNodeInteraction } from '../../hooks/flow/useNodeInteraction';
import { useFileOperations } from '../../hooks/flow/useFileOperations';
import { NodeType } from '../../types/nodeTypes';
import { useFlowEventHandlers } from '../../hooks/flow/useFlowEventHandlers';
import FlowInstance from './FlowInstance';
import GraphPersistenceHandler from './GraphPersistenceHandler';
import { NodeEditorProvider } from '../../contexts/NodeEditorContext';
import type { GraphData } from '../../services/storage/GraphLocalStorageService';
import { toast } from 'sonner';

interface NodeEditorWrapperProps {
  saveGraph: (name: string) => boolean;
  loadGraph: (name: string) => boolean;
  deleteGraph: (name: string) => boolean;
  getSavedGraphs: () => SavedGraph[];
  exportGraph: (name?: string) => string | null;
  importGraph: (file: File) => void;
}

const NodeEditorWrapper: React.FC<NodeEditorWrapperProps> = ({
  saveGraph: externalSaveGraph,
  loadGraph: externalLoadGraph,
  deleteGraph,
  getSavedGraphs,
  exportGraph: externalExportGraph,
  importGraph: externalImportGraph
}) => {
  // Loading state
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Use the React Flow instance
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  
  // File input reference
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use our refactored hook for editor functionality
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
    deleteSelected,
    duplicateSelected,
    clearCanvas,
    initializeCanvas
  } = useNodeEditor();
  
  // Add the save and load graph functionality
  const {
    saveGraph,
    loadGraph,
    getSavedGraphs: getInternalSavedGraphs,
    deleteGraph: internalDeleteGraph,
    exportGraph,
    importGraph,
    handleLoadGraphFromStorage
  } = useSaveLoadGraph(nodes, edges, setNodes, setEdges, isLoading, setIsLoading);
  
  // Use the node interaction hook
  const { onNodeDoubleClick, onPaneClick } = useNodeInteraction({
    createChildNode
  });

  // FIXED: Use the file operations hook with the correct parameters and get the direct import handler
  const { handleImport } = useFileOperations({
    nodes,
    edges,
    setNodes,
    setEdges,
    setIsLoading,
    reactFlowInstance
  });
  
  // Bundle all the flow event handlers
  const flowEventHandlers = useFlowEventHandlers(
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeDoubleClick,
    onSelectionChange,
    onPaneClick
  );


  // Simplified visibility handling - only ensure nodes are visible without viewport changes
  useEffect(() => {
    const forceNodeVisibility = () => {
      console.log('NodeEditorWrapper: Force node visibility event received');
      
      // Only do this if we have nodes
      if (nodes.length === 0) return;
      
      // Get all node elements and ensure they're visible
      const nodeElements = document.querySelectorAll('.react-flow__node');
      console.log(`NodeEditorWrapper: Found ${nodeElements.length} node elements in DOM`);
      
      // Apply visibility styles to each node - NO viewport changes
      nodeElements.forEach((el) => {
        const element = el as HTMLElement;
        const computedStyle = window.getComputedStyle(element);
        
        // Only update if the node is actually invisible
        if (computedStyle.visibility === 'hidden' || computedStyle.opacity === '0' || computedStyle.display === 'none') {
          element.style.setProperty('visibility', 'visible', 'important');
          element.style.setProperty('display', 'flex', 'important');
          element.style.setProperty('opacity', '1', 'important');
        }
      });
      
      // DO NOT call fitView - let user control the viewport
    };
    
    window.addEventListener('force-node-visibility', forceNodeVisibility);
    
    return () => {
      window.removeEventListener('force-node-visibility', forceNodeVisibility);
    };
  }, [nodes]); // Keep dependency on nodes for updates

  // Create a wrapper function for addNode
  const handleAddNode = useCallback(
    (type: NodeType, fiveQIId?: string) => {
      console.log(`NodeEditor: Adding ${type} node from toolbar, fiveQIId:`, fiveQIId);
      
      if (!reactFlowInstance) {
        console.error("NodeEditor: ReactFlow instance not available");
        return;
      }
      
      // Create a position in the center of the viewport
      const viewportCenter = reactFlowInstance.screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      });
      
      // Add some random offset
      const randomOffset = () => Math.random() * 100 - 50;
      const position = {
        x: viewportCenter.x + randomOffset(),
        y: viewportCenter.y + randomOffset()
      };
      
      // Call the original addNode with all required parameters
      addNode(type, position, fiveQIId);
    },
    [addNode, reactFlowInstance]
  );

  // Create a wrapper for createChildNode that ensures correct parameter order
  const handleCreateChildNode = useCallback(
    (type: NodeType, position: { x: number; y: number }, parentId: string, fiveQIId?: string) => {
      // Directly pass parameters in the same order - no reordering needed
      return createChildNode(type, position, parentId, fiveQIId);
    },
    [createChildNode]
  );

  // Implement drag and drop functionality with the corrected handler
  const { onDragOver, onDrop } = useNodeDragDrop(
    reactFlowWrapper,
    addNode,
    handleCreateChildNode
  );
  
  // Use the GraphPersistenceHandler component to handle persistence operations
  const {
    handleSave,
    handleLoad
  } = GraphPersistenceHandler({
    saveGraph,
    loadGraph,
    deleteGraph,
    exportGraph,
    getSavedGraphs
  });

  // Create a wrapper function for handleLoadGraphFromStorage to match the expected signature
  const handleLoadGraphByName = useCallback((name: string) => {
    console.log(`NodeEditorWrapper: Loading graph by name: ${name}`);
    return handleLoadGraphFromStorage(name);
  }, [handleLoadGraphFromStorage]);

  // CRITICAL FIX: Simplified file import that only uses the working handleImport from useFileOperations
  const handleFileImport = useCallback(async (file: File) => {
    console.log(`🔍 NodeEditorWrapper: Starting file import for ${file.name}, size: ${file.size} bytes`);
    
    if (!file) {
      toast.error("No file selected");
      return;
    }
    
    try {
      console.log('🔍 NodeEditorWrapper: About to call handleImport from useFileOperations...');
      // Call handleImport directly - it has the correct setNodes and setEdges
      await handleImport(file);
      console.log('🔍 NodeEditorWrapper: File import completed successfully');
    } catch (error) {
      console.error('🔍 NodeEditorWrapper: Error during file import:', error);
      toast.error("Error importing file: " + (error?.message || 'Unknown error'));
    }
  }, [handleImport]);

  return (
    <div className="h-full w-full" ref={reactFlowWrapper}>
      <FlowInstance
        // Flow state and handlers
        {...flowEventHandlers}
        onDragOver={onDragOver}
        onDrop={onDrop}
        
        // Editor operations
        handleAddNode={handleAddNode}
        deleteSelected={deleteSelected}
        duplicateSelected={duplicateSelected}
        clearCanvas={clearCanvas}
        initializeCanvas={initializeCanvas}
        hasSelectedElements={selectedElements.nodes.length > 0 || selectedElements.edges.length > 0}
        
        // Graph persistence
        onSave={handleSave}
        onLoad={handleLoad}
        onDelete={deleteGraph}
        onExport={() => {
          const name = window.prompt('Enter a name for the exported file (optional):');
          return exportGraph(name || undefined);
        }}
        onImport={handleFileImport}
        getSavedGraphs={getSavedGraphs}
        onLoadGraphFromStorage={handleLoadGraphByName}
      />
    </div>
  );
};

export default NodeEditorWrapper;
