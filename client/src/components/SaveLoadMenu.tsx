
import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { SaveIcon, FolderOpenIcon, DownloadIcon, UploadIcon } from 'lucide-react';
import MenuButton from '@/components/saveLoad/MenuButton';
import StarIcon from '@/components/saveLoad/StarIcon';
import SaveLoadDialog from '@/components/saveLoad/SaveLoadDialog';
import { SavedGraph } from '@/hooks/types';
import type { GraphData } from '@/services/storage/GraphLocalStorageService';

type SaveLoadMenuProps = {
  onSave: () => boolean;
  onLoad: () => boolean;
  onDelete: (name: string) => boolean;
  onExport: () => string | null;
  onImport: () => void;
  getSavedGraphs: () => SavedGraph[];
  onLoadGraphFromStorage: (name: string) => boolean;
};

const SaveLoadMenu: React.FC<SaveLoadMenuProps> = ({
  onSave,
  onLoad,
  onDelete,
  onExport,
  onImport,
  getSavedGraphs,
  onLoadGraphFromStorage
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'save' | 'load'>('save');

  const handleOpenSaveDialog = () => {
    setDialogMode('save');
    setDialogOpen(true);
  };

  const handleOpenLoadDialog = () => {
    setDialogMode('load');
    setDialogOpen(true);
  };

  // Create a wrapper function to adapt to SaveLoadDialog's expected signature
  const handleLoadByGraphData = (graphData: GraphData): boolean => {
    // Extract the name from graphData if possible, otherwise use a timestamp
    const name = graphData.name || `graph_${new Date().getTime()}`;
    return onLoadGraphFromStorage(name);
  };

  return (
    <div className="flex flex-col gap-2 z-50">
      <MenuButton 
        icon={SaveIcon} 
        onClick={onSave}
        title="Quick Save"
      />
      
      <MenuButton 
        icon={FolderOpenIcon} 
        onClick={onLoad}
        title="Quick Load"
      />
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <MenuButton 
          icon={StarIcon} 
          onClick={handleOpenSaveDialog}
          title="Advanced Save/Load"
        />
        
        <SaveLoadDialog
          mode={dialogMode}
          onSave={onSave}
          onLoad={handleLoadByGraphData}
          onDelete={onDelete}
          getSavedGraphs={getSavedGraphs}
          onClose={() => setDialogOpen(false)}
        />
      </Dialog>
      
      <MenuButton 
        icon={DownloadIcon} 
        onClick={onExport}
        title="Export Graph"
      />
      
      <MenuButton 
        icon={UploadIcon} 
        onClick={onImport}
        title="Import Graph"
      />
    </div>
  );
};

export default SaveLoadMenu;
