
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { GraphPersistenceService } from '@/services/graphPersistenceService';
import UploadForm from './storage/UploadForm';
import CloudStorageOperations from './storage/CloudStorageOperations';
import StorageWarning from './storage/StorageWarning';
import UploadStatus from './storage/UploadStatus';

interface SupabaseStoragePanelProps {
  onFileLoad?: (data: any) => void;
}

const SupabaseStoragePanel = ({ onFileLoad }: SupabaseStoragePanelProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [storedFiles, setStoredFiles] = useState<Array<{ name: string, url: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [graphName, setGraphName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [storageAccessible, setStorageAccessible] = useState(true);

  const handleGraphNameChange = (value: string) => {
    setGraphName(value);
  };

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    if (!graphName.trim()) {
      toast.error('Please enter a name for your graph');
      return;
    }

    setUploading(true);
    setError(null);
    
    try {
      console.log('Starting file upload to Supabase storage...');
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${graphName.trim().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`;
      
      // Use our service to upload the file
      const publicUrl = await GraphPersistenceService.saveToCloudStorage(graphName, [], []);
      
      if (publicUrl) {
        setUploadedFile(publicUrl);
        toast.success('Graph saved to cloud storage!');
        setGraphName('');
        setFile(null);
        
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        // Refresh the list of stored files
        fetchStoredFiles();
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setError(error.message || 'Error uploading graph to cloud. Check console for details.');
    } finally {
      setUploading(false);
    }
  };

  const saveCurrentGraph = () => {
    if (!graphName.trim()) {
      toast.error('Please enter a name for your graph');
      return;
    }
    
    // Create a trigger event for exporting the current graph as JSON
    const event = new CustomEvent('export-current-graph', {
      detail: { callback: handleSaveCurrentGraph }
    });
    window.dispatchEvent(event);
  };

  const handleSaveCurrentGraph = async (graphData: string) => {
    setUploading(true);
    setError(null);
    
    try {
      const fileName = `${graphName.trim().replace(/\s+/g, '-')}-${Date.now()}.json`;
      // Create a File object instead of a Blob to satisfy the type requirements
      const graphFile = new File(
        [graphData], 
        fileName, 
        { type: 'application/json' }
      );
      
      // Use our service to upload the file
      const parsedData = JSON.parse(graphData);
      const publicUrl = await GraphPersistenceService.saveToCloudStorage(
        graphName, 
        parsedData.nodes || [], 
        parsedData.edges || []
      );
      
      if (publicUrl) {
        setUploadedFile(publicUrl);
        toast.success('Current graph saved to cloud!');
        setGraphName('');
        
        // Refresh the list of stored files
        fetchStoredFiles();
      }
    } catch (error: any) {
      console.error('Error uploading current graph:', error);
      setError(error.message || 'Error saving current graph. Check console for details.');
    } finally {
      setUploading(false);
    }
  };
  
  const fetchStoredFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use our service to get cloud files
      const files = await GraphPersistenceService.getCloudGraphs();
      setStoredFiles(files);
      setStorageAccessible(true);
    } catch (error: any) {
      console.error('Error fetching stored files:', error);
      setError(error.message || 'Error fetching stored files. Check console for details.');
      setStorageAccessible(false);
    } finally {
      setLoading(false);
    }
  };
  
  const loadGraphFromFile = async (fileUrl: string) => {
    try {
      // Use our service to load from cloud storage
      const graphData = await GraphPersistenceService.loadFromCloudStorage(fileUrl);
      
      if (onFileLoad && graphData) {
        onFileLoad(graphData);
        toast.success(`Graph loaded successfully with ${graphData.nodes?.length || 0} nodes and ${graphData.edges?.length || 0} edges`);
      }
    } catch (error: any) {
      console.error('Error loading graph from file:', error);
      toast.error(error.message || 'Error loading graph from file. Check console for details.');
    }
  };
  
  // Fetch stored files when component mounts
  useEffect(() => {
    fetchStoredFiles();
  }, []);

  return (
    <div className="grid gap-4">
      <UploadForm
        graphName={graphName}
        onGraphNameChange={handleGraphNameChange}
        uploading={uploading}
        storageAccessible={storageAccessible}
        onFileSelect={handleFileSelect}
        onUpload={handleUpload}
        onSaveCurrent={saveCurrentGraph}
        file={file}
      />
      
      <UploadStatus 
        file={file} 
        uploadedFileUrl={uploadedFile} 
        error={error} 
      />
      
      <CloudStorageOperations
        storageAccessible={storageAccessible}
        error={error}
        uploadedFile={uploadedFile}
        storedFiles={storedFiles}
        loading={loading}
        fetchStoredFiles={fetchStoredFiles}
        onLoadFile={loadGraphFromFile}
      />
      
      <StorageWarning storageAccessible={storageAccessible} />
    </div>
  );
};

export default SupabaseStoragePanel;
