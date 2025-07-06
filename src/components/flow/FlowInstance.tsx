import React, { useRef, useEffect } from 'react';
import { ReactFlow, SelectionMode, MarkerType, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import NodeTypes from './NodeTypes';
import FlowBackground from './FlowBackground';
import FlowControls from './FlowControls';
import EditorPanels from './EditorPanels';
import FileImportInput from './FileImportInput';
import { SavedGraph } from '@/hooks/types';
import type { GraphData } from '@/services/storage/GraphLocalStorageService';

interface FlowInstanceProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  onNodeDoubleClick: (event: React.MouseEvent, node: Node) => void;
  onSelectionChange: (params: any) => void;
  onPaneClick: () => void;
  onDragOver: React.DragEventHandler;
  onDrop: React.DragEventHandler;

  handleAddNode: (type: any, fiveQIId?: string) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  clearCanvas: () => void;
  initializeCanvas: () => void;
  arrangeLayout?: () => void;
  hasSelectedElements: boolean;

  onSave: () => boolean;
  onLoad: () => boolean;
  onDelete: (name: string) => boolean;
  onExport: () => string | null;
  onImport: (file: File) => void;
  getSavedGraphs: () => SavedGraph[];
  onLoadGraphFromStorage: (name: string) => boolean;
}

const FlowInstance: React.FC<FlowInstanceProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeDoubleClick,
  onSelectionChange,
  onPaneClick,
  onDragOver,
  onDrop,

  handleAddNode,
  deleteSelected,
  duplicateSelected,
  clearCanvas,
  initializeCanvas,
  arrangeLayout,
  hasSelectedElements,

  onSave,
  onLoad,
  onDelete,
  onExport,
  onImport,
  getSavedGraphs,
  onLoadGraphFromStorage
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Enhanced logging for debugging
  useEffect(() => {
    console.log(`FlowInstance: Rendering with ${nodes.length} nodes, ${edges.length} edges`);
    edges.forEach(e => {
      console.log(`FlowInstance: Edge ${e.id}`, {
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        style: e.style,
        type: e.type
      });
    });
  }, [nodes.length, edges.length, edges]);

  const handleFileImport = () => {
    if (fileInputRef.current) {
      // Always reset so the same file can be selected again
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Accepts either a graph name or a GraphData object
  const handleLoadGraphData = (graphData: GraphData | string): boolean => {
    if (typeof graphData === 'string') {
      return onLoadGraphFromStorage(graphData);
    } else if (graphData && typeof graphData === 'object' && 'name' in graphData) {
      // If your onLoadGraphFromStorage expects a name, extract it
      return onLoadGraphFromStorage(graphData.name);
    } else {
      console.error('Invalid graph data provided to handleLoadGraphData');
      return false;
    }
  };

  const defaultEdgeOptions = {
    type: 'default',
    animated: false,
    style: {
      stroke: '#2563eb',
      strokeWidth: 3,
      opacity: 1
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#2563eb',
      width: 12,
      height: 12
    }
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeDoubleClick={onNodeDoubleClick}
      onSelectionChange={onSelectionChange}
      onPaneClick={onPaneClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
      nodeTypes={NodeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      fitView={false}
      selectionMode={SelectionMode.Partial}
      className="bg-gray-100"
      edgesReconnectable={true}
      nodesDraggable={true}
      nodesConnectable={true}
      elementsSelectable={true}
      onInit={() => {
        console.log("FlowInstance: ReactFlow initialized");
      }}
    >
      <FlowBackground />
      <FlowControls />

      <EditorPanels
        handleAddNode={handleAddNode}
        deleteSelected={deleteSelected}
        duplicateSelected={duplicateSelected}
        clearCanvas={clearCanvas}
        initializeCanvas={initializeCanvas}
        arrangeLayout={arrangeLayout}
        hasSelectedElements={hasSelectedElements}
        onSave={onSave}
        onLoad={onLoad}
        onDelete={onDelete}
        onExport={onExport}
        onImport={handleFileImport}
        getSavedGraphs={getSavedGraphs}
        onLoadGraphFromStorage={handleLoadGraphData}
      />

      <FileImportInput onImport={onImport} inputRef={fileInputRef} />
    </ReactFlow>
  );
};

export default FlowInstance;
