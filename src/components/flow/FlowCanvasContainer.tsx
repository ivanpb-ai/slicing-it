
import React from 'react';
import { Node, Edge, Connection } from '@xyflow/react';
import { toast } from '@/hooks/use-toast';
import FlowCanvasContent from './FlowCanvasContent';

interface FlowCanvasContainerProps {
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

const FlowCanvasContainer: React.FC<FlowCanvasContainerProps> = (props) => {
  return (
    <FlowCanvasContent {...props} />
  );
};

export default FlowCanvasContainer;
