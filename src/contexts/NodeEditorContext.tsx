
import { createContext, useContext, ReactNode } from 'react';
import { XYPosition } from '@xyflow/react';
import { NodeType } from '../types/nodeTypes';

interface NodeEditorContextType {
  createChildNode: (type: NodeType, position: XYPosition, parentId: string, fiveQIId?: string) => any;
}

const NodeEditorContext = createContext<NodeEditorContextType | undefined>(undefined);

export const useNodeEditorContext = () => {
  const context = useContext(NodeEditorContext);
  if (!context) {
    throw new Error('useNodeEditorContext must be used within a NodeEditorProvider');
  }
  return context;
};

interface NodeEditorProviderProps {
  children: ReactNode;
  createChildNode: (type: NodeType, position: XYPosition, parentId: string, fiveQIId?: string) => any;
}

export const NodeEditorProvider = ({ children, createChildNode }: NodeEditorProviderProps) => {
  return (
    <NodeEditorContext.Provider value={{ createChildNode }}>
      {children}
    </NodeEditorContext.Provider>
  );
};
