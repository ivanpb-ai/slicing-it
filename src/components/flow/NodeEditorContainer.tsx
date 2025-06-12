
import React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { toast } from 'sonner';
import NodeEditorContent from './NodeEditorContent';
import { SavedGraph } from '@/hooks/types';
import type { GraphData } from '@/services/storage/GraphLocalStorageService';

interface NodeEditorContainerProps {
  saveGraph: (name: string) => boolean;
  loadGraph: (name: string) => boolean;
  deleteGraph: (name: string) => boolean;
  getSavedGraphs: () => SavedGraph[];
  exportGraph: (name?: string) => string | null;
  importGraph: (file: File) => void;
}

const NodeEditorContainer: React.FC<NodeEditorContainerProps> = ({
  saveGraph,
  loadGraph,
  deleteGraph,
  getSavedGraphs,
  exportGraph,
  importGraph
}) => {
  return (
    <ReactFlowProvider>
      <NodeEditorContent
        saveGraph={saveGraph}
        loadGraph={loadGraph}
        deleteGraph={deleteGraph}
        getSavedGraphs={getSavedGraphs}
        exportGraph={exportGraph}
        importGraph={importGraph}
      />
    </ReactFlowProvider>
  );
};

export default NodeEditorContainer;
