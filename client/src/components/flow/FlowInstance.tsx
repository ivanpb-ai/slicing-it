import React, { useRef, useEffect } from 'react';
import {
  ReactFlow,
  SelectionMode,
  MarkerType,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import NodeTypes from './NodeTypes';
import FlowBackground from './FlowBackground';
import FlowControls from './FlowControls';
import EditorPanels from './EditorPanels';
import { SavedGraph } from '../../hooks/types';
import type { GraphData } from '../../services/storage/GraphLocalStorageService';
import type { NodeData } from '../../types/nodeTypes';

interface FlowInstanceProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onNodeDoubleClick: (event: React.MouseEvent, node: Node<NodeData>) => void;
  onSelectionChange: (params: { nodes: Node<NodeData>[]; edges: Edge[] }) => void;
  onPaneClick: () => void;
  onDragOver: React.DragEventHandler;
  onDrop: React.DragEventHandler;

  handleAddNode: (type: string, fiveQIId?: string) => void;
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
  onLoadGraphFromStorage,
}) => {
  // Reduced logging to prevent render loop debugging noise  
  useEffect(() => {
    console.log(`FlowInstance: Rendering with ${nodes.length} nodes, ${edges.length} edges`);
    // Only log details when there are significant changes
    if (nodes.length > 0 && nodes.length <= 3) {
      console.log('FlowInstance: First node:', nodes[0]);
    }
  }, [nodes.length, edges.length]); // Only trigger on length changes, not content changes

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
      opacity: 1,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#2563eb',
      width: 12,
      height: 12,
    },
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
      onInit={(instance) => {
        console.log('FlowInstance: ReactFlow initialized');
        
        // Register instance globally for export functions
        // @ts-ignore - Create global registry for ReactFlow instances
        if (!window.__REACTFLOW_INSTANCES__) {
          window.__REACTFLOW_INSTANCES__ = [];
        }
        window.__REACTFLOW_INSTANCES__.push(instance);
        console.log('FlowInstance: Registered ReactFlow instance globally');
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

    </ReactFlow>
  );
};

export default FlowInstance;
