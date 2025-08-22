
import React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { SavedGraph } from '@/hooks/types';
import type { GraphData } from '@/services/storage/GraphLocalStorageService';
import NodeEditorWrapper from './NodeEditorWrapper';

interface NodeEditorContentProps {
  saveGraph: (name: string) => boolean;
  loadGraph: (name: string) => boolean;
  deleteGraph: (name: string) => boolean;
  getSavedGraphs: () => SavedGraph[];
  exportGraph: (name?: string) => string | null;
  importGraph: (file: File) => void;
}

const NodeEditorContent: React.FC<NodeEditorContentProps> = (props) => {
  return (
    <ReactFlowProvider>
      <NodeEditorWrapper {...props} />
    </ReactFlowProvider>
  );
};

export default NodeEditorContent;
