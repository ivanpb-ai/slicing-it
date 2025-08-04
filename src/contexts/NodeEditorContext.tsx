
import { createContext, useContext, ReactNode } from 'react';
import { XYPosition } from '@xyflow/react';
import { NodeType, NodeData } from '../types/nodeTypes';

export interface NodeEditorContextType {
  createChildNode: (type: NodeType, position: XYPosition, parentId: string, fiveQIId?: string) => void;
  updateNodeData: (id: string, newData: NodeData) => void;
}

const NodeEditorContext = createContext<NodeEditorContextType | undefined>(undefined);

export const useNodeEditorContext = () => {
  const context = useContext(NodeEditorContext);
  if (!context) {
    throw new Error('useNodeEditorContext must be used within a NodeEditorProvider');
  }
  return context;
};

export interface NodeEditorProviderProps {
  children: ReactNode;
  createChildNode: (type: NodeType, position: XYPosition, parentId: string, fiveQIId?: string) => any;
  updateNodeData: (id: string, newData: NodeData) => void;
}

export const NodeEditorProvider = ({ children, createChildNode, updateNodeData }: NodeEditorProviderProps) => {
  return (
    <NodeEditorContext.Provider value={{ createChildNode, updateNodeData }}>
      {children}
    </NodeEditorContext.Provider>
  );
};
