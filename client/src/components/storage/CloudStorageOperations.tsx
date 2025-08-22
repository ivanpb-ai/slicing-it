
import { useState } from 'react';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { GraphPersistenceService } from '@/services/graphPersistenceService';
import StoredFilesList from './StoredFilesList';
import UploadStatus from './UploadStatus';

interface CloudStorageOperationsProps {
  storageAccessible: boolean;
  error: string | null;
  uploadedFile: string | null;
  storedFiles: Array<{ name: string, url: string }>;
  loading: boolean;
  fetchStoredFiles: () => void;
  onLoadFile: (fileUrl: string) => Promise<void>;
}

const CloudStorageOperations = ({
  storageAccessible,
  error,
  uploadedFile,
  storedFiles,
  loading,
  fetchStoredFiles,
  onLoadFile,
}: CloudStorageOperationsProps) => {
  return (
    <div className="space-y-4">
      <UploadStatus 
        file={null}
        uploadedFileUrl={uploadedFile} 
        error={error} 
      />
      
      <StoredFilesList 
        files={storedFiles} 
        onLoadFile={onLoadFile}
        loading={loading} 
        onRefresh={fetchStoredFiles}
      />
    </div>
  );
};

export default CloudStorageOperations;
