
import React from 'react';
import { Node, Edge, Connection } from '@xyflow/react';
import { useToast } from "@/hooks/use-toast";
import FlowCanvasContainer from './FlowCanvasContainer';

interface FlowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: any;
  onDragOver: React.DragEventHandler;
  onDrop: React.DragEventHandler;
  onSelectionChange: any;
  hasSelectedElements: boolean;
  onAddNode: (type: "network" | "cell-area" | "rrp" | "s-nssai" | "dnn" | "fiveqi", fiveQIId?: string) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  handleClearCanvas: () => void;
  initializeCanvas: () => void;
}

const FlowCanvas: React.FC<FlowCanvasProps> = (props) => {
  return <FlowCanvasContainer {...props} />;
};

export default FlowCanvas;
