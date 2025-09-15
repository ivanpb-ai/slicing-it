
import React, { useState, useRef, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { SaveIcon, FolderOpenIcon, DownloadIcon, UploadIcon } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
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
  const { zoomIn, zoomOut, fitView } = useReactFlow();
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
    console.log(`SaveLoadMenu: File selected for import: ${file.name}, size: ${file.size} bytes`);
    onImport(file);
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
        onClick={() => onExport()}
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
      
      {/* Zoom Controls */}
      <div className="border-t border-gray-200 pt-2 mt-2">
        <button
          onClick={() => zoomIn()}
          className="w-10 h-8 mb-1 flex items-center justify-center bg-white hover:bg-gray-100 border border-gray-300 rounded text-gray-700 transition-colors text-sm font-medium"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => zoomOut()}
          className="w-10 h-8 mb-1 flex items-center justify-center bg-white hover:bg-gray-100 border border-gray-300 rounded text-gray-700 transition-colors text-sm font-medium"
          title="Zoom Out"
        >
          −
        </button>
        <button
          onClick={() => fitView({ padding: 0.1, duration: 500 })}
          className="w-10 h-8 flex items-center justify-center bg-white hover:bg-gray-100 border border-gray-300 rounded text-gray-700 transition-colors text-xs font-medium"
          title="Fit View"
        >
          ⌂
        </button>
      </div>
    </div>
  );
};

export default SaveLoadMenu;
