
import { useState } from 'react';
import { Button } from '../ui/button';
import GraphNameInput from './GraphNameInput';
import FileUploadInput from './FileUploadInput';
import { toast } from 'sonner';

interface UploadFormProps {
  graphName: string;
  onGraphNameChange: (value: string) => void;
  uploading: boolean;
  storageAccessible: boolean;
  onFileSelect: (file: File | null) => void;
  onUpload: () => Promise<void>;
  onSaveCurrent: () => void;
  file: File | null;
}

const UploadForm = ({
  graphName,
  onGraphNameChange,
  uploading,
  storageAccessible,
  onFileSelect,
  onUpload,
  onSaveCurrent,
  file,
}: UploadFormProps) => {
  return (
    <div className="grid gap-4">
      <GraphNameInput 
        graphName={graphName} 
        onChange={onGraphNameChange}
        disabled={uploading}
      />
      
      <div className="grid grid-cols-2 gap-2">
        <Button 
          onClick={onSaveCurrent} 
          className="w-full"
          disabled={!graphName.trim() || uploading || !storageAccessible}
        >
          {uploading ? 'Saving...' : 'Save Current Graph'}
        </Button>
        
        <div className="flex flex-col gap-2">
          <FileUploadInput onFileSelect={onFileSelect} disabled={uploading} />
          <Button 
            onClick={onUpload} 
            disabled={!file || !graphName.trim() || uploading || !storageAccessible}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadForm;
