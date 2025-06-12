
import React, { useEffect } from 'react';
import { ReactFlow, ConnectionLineType, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Node, Edge } from '@xyflow/react';
import FlowBackground from './FlowBackground';
import FlowControls from './FlowControls';
import NodeTypes from './NodeTypes';
import FlowToolbarPanel from './FlowToolbarPanel';

interface FlowCanvasContentProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: any;
  onDragOver: React.DragEventHandler;
  onDrop: React.DragEventHandler;
  onSelectionChange: any;
  hasSelectedElements: boolean;
  onAddNode: (type: "network" | "cell-area" | "rrp" | "s-nssai" | "dnn" | "5qi", fiveQIId?: string) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  handleClearCanvas: () => void;
  initializeCanvas: () => void;
}

const FlowCanvasContent: React.FC<FlowCanvasContentProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onDragOver,
  onDrop,
  onSelectionChange,
  hasSelectedElements,
  onAddNode,
  deleteSelected,
  duplicateSelected,
  handleClearCanvas,
  initializeCanvas
}) => {
  console.log(`FlowCanvasContent: Rendering with ${nodes.length} nodes and ${edges.length} edges`);
  
  // Debug edge rendering with detailed logging
  useEffect(() => {
    console.log('FlowCanvasContent: Current edges for rendering:', edges);
    if (edges.length > 0) {
      edges.forEach(edge => {
        console.log(`FlowCanvasContent: Edge ${edge.id}:`, {
          source: edge.source,
          target: edge.target,
          type: edge.type,
          style: edge.style,
          markerEnd: edge.markerEnd
        });
      });
    } else {
      console.log('FlowCanvasContent: No edges to render');
    }
  }, [edges]);

  // Simplified default edge options
  const defaultEdgeOptions = {
    type: 'default',
    style: { 
      stroke: '#3b82f6',
      strokeWidth: 3
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#3b82f6'
    }
  };

  console.log('FlowCanvasContent: About to render ReactFlow with edges:', edges);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={NodeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      onDragOver={onDragOver}
      onDrop={onDrop}
      connectionLineType={ConnectionLineType.SmoothStep}
      connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 3 }}
      fitView={false}
      panOnScroll={true}
      panOnDrag={true}
      zoomOnScroll={true}
      zoomOnPinch={true}
      selectionOnDrag={false}
      panOnScrollSpeed={1.0}
      preventScrolling={false}
      proOptions={{ hideAttribution: false }}
      attributionPosition="bottom-right"
      className="bg-[#fafafa]"
      minZoom={0.1}
      maxZoom={2}
      defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      elementsSelectable={true}
      nodesDraggable={true}
      nodesConnectable={true}
      elevateNodesOnSelect={true}
      elevateEdgesOnSelect={true}
      onSelectionChange={onSelectionChange}
      onInit={(reactFlowInstance) => {
        console.log('FlowCanvasContent: ReactFlow initialized');
        console.log('FlowCanvasContent: Edges at init:', edges);
      }}
    >
      <FlowBackground />
      <FlowControls />
      
      <FlowToolbarPanel
        onAddNode={onAddNode}
        onDeleteSelected={deleteSelected}
        onDuplicateSelected={duplicateSelected}
        onClearCanvas={handleClearCanvas}
        hasSelectedElements={hasSelectedElements}
        onInitializeCanvas={initializeCanvas}
      />
    </ReactFlow>
  );
};

export default FlowCanvasContent;
