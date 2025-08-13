
import React from 'react';
import { Panel } from '@xyflow/react';
import Toolbar from '@/components/Toolbar';
import SaveLoadMenu from '@/components/saveLoad/SaveLoadMenu';
import { NodeType } from '@/types/nodeTypes';
import type { GraphData } from '@/services/storage/GraphLocalStorageService';
import { SavedGraph } from '@/hooks/types';
import { LayoutType } from '@/utils/flowData/layouts';

interface EditorPanelsProps {
  handleAddNode: (type: NodeType, fiveQIId?: string) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  clearCanvas: () => void;
  initializeCanvas: () => void;
  arrangeLayout?: (layoutType: LayoutType) => void;
  hasSelectedElements: boolean;
  onSave: () => boolean;
  onLoad: () => boolean;
  onDelete: (name: string) => boolean;
  onExport: () => string | null;
  onImport: () => void;
  getSavedGraphs: () => SavedGraph[];
  onLoadGraphFromStorage: (graphData: GraphData) => boolean;
}

const EditorPanels: React.FC<EditorPanelsProps> = ({
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
  return (
    <>
      <Panel position="top-left" className="z-50">
        <Toolbar
          onAddNode={handleAddNode}
          onDeleteSelected={deleteSelected}
          onDuplicateSelected={duplicateSelected}
          onClearCanvas={clearCanvas}
          onInitializeCanvas={initializeCanvas}
          onArrangeLayout={arrangeLayout}
          hasSelectedElements={hasSelectedElements}
        />
      </Panel>
      
      <Panel position="top-right" className="z-50">
        <SaveLoadMenu
          onSave={onSave}
          onLoad={onLoad}
          onDelete={onDelete}
          onExport={onExport}
          onImport={onImport}
          getSavedGraphs={getSavedGraphs}
          onLoadGraphFromStorage={onLoadGraphFromStorage}
        />
      </Panel>
    </>
  );
};

export default EditorPanels;
