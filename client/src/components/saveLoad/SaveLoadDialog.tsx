
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SaveLoadGraphDialog from '@/components/SaveLoadGraphDialog';
import { SavedGraph } from '@/hooks/types';
import type { GraphData } from '@/services/storage/GraphLocalStorageService';

type SaveLoadDialogProps = {
  mode: 'save' | 'load';
  onSave: () => boolean;
  onLoad: (graphData: GraphData) => boolean;
  onDelete: (name: string) => boolean;
  getSavedGraphs: () => SavedGraph[];
  onClose: () => void;
};

const SaveLoadDialog: React.FC<SaveLoadDialogProps> = ({
  mode,
  onSave,
  onLoad,
  onDelete,
  getSavedGraphs,
  onClose,
}) => {
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          {mode === 'save' ? 'Save Graph' : 'Load Graph'}
        </DialogTitle>
      </DialogHeader>
      <SaveLoadGraphDialog
        mode={mode}
        onSave={onSave}
        onLoad={onLoad}
        onDelete={onDelete}
        getSavedGraphs={getSavedGraphs}
        onClose={onClose}
      />
    </DialogContent>
  );
};

export default SaveLoadDialog;
