
import React, { useState, useRef, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { SaveIcon, FolderOpenIcon, DownloadIcon, UploadIcon } from 'lucide-react';
import MenuButton from './MenuButton';
import StarIcon from './StarIcon';
import SaveLoadDialog from './SaveLoadDialog';
import { SavedGraph } from '@/hooks/types';
import type { GraphData } from '@/services/storage/GraphLocalStorageService';
import { toast } from 'sonner';
import FileImportInput from '@/components/flow/FileImportInput';

type SaveLoadMenuProps = {
  onSave: () => boolean;
  onLoad: () => boolean;
  onDelete: (name: string) => boolean;
  onExport: () => string | null;
  onImport: (file: File) => void;
  getSavedGraphs: () => SavedGraph[];
  onLoadGraphFromStorage: (graphData: GraphData) => boolean;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenSaveDialog = () => {
    setDialogMode('save');
    setDialogOpen(true);
  };

  const handleOpenLoadDialog = () => {
    setDialogMode('load');
    setDialogOpen(true);
  };

  const handleImport = () => {
    console.log("SaveLoadMenu: Import button clicked");
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear previous value
      fileInputRef.current.click();
    } else {
      console.error('SaveLoadMenu: File input ref not available');
      toast.error("Cannot access file selector");
    }
  };

  // SIMPLIFIED: Direct file handler that just calls onImport
  const handleFileSelected = (file: File) => {
    console.log(`🔍 SaveLoadMenu: File selected for import: ${file.name}, size: ${file.size} bytes`);
    console.log('🔍 SaveLoadMenu: About to call onImport...');
    onImport(file);
    console.log('🔍 SaveLoadMenu: onImport call completed');
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
      
      <MenuButton 
        icon={DownloadIcon} 
        onClick={onExport}
        title="Export Graph"
      />
      
      <MenuButton 
        icon={UploadIcon} 
        onClick={handleImport}
        title="Import Graph"
      />
      
      <FileImportInput
        onImport={handleFileSelected}
        inputRef={fileInputRef}
      />
    </div>
  );
};

export default SaveLoadMenu;
