
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { UploadCloud, FileCheck, AlertCircle, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { uploadFileToStorage, listStoredFiles } from '@/utils/supabaseStorage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

interface FileUploadProps {
  onFileLoad?: (data: any) => void;
}

const FileUpload = ({ onFileLoad }: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [storedFiles, setStoredFiles] = useState<Array<{ name: string, url: string }>>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    
    try {
      console.log('Starting file upload...');
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
      
      console.log(`Uploading file with name: ${fileName}`);
      
      // Upload the file using the new API
      const fileUrl = await uploadFileToStorage(file, fileName);
      
      if (fileUrl) {
        console.log('Upload success, got URL:', fileUrl);
        setUploadedFile(fileUrl);
        toast.success('File uploaded successfully!');
        
        // Refresh the list of stored files
        fetchStoredFiles();
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };
  
  const fetchStoredFiles = async () => {
    setLoading(true);
    try {
      const files = await listStoredFiles();
      setStoredFiles(files);
    } catch (error: any) {
      console.error('Error fetching stored files:', error);
      toast.error(error.message || 'Error fetching stored files');
    } finally {
      setLoading(false);
    }
  };
  
  const loadGraphFromFile = async (fileUrl: string) => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      
      const jsonData = await response.json();
      
      if (onFileLoad && jsonData) {
        // Check if this is likely a graph file (has nodes and edges)
        if (jsonData.nodes && jsonData.edges) {
          onFileLoad(jsonData);
          toast.success('Graph loaded successfully');
        } else {
          toast.error('Invalid graph file format');
        }
      }
    } catch (error: any) {
      console.error('Error loading graph from file:', error);
      toast.error(error.message || 'Error loading graph from file');
    }
  };
  
  // Fetch stored files when dialog opens
  const handleDialogOpen = () => {
    fetchStoredFiles();
  };

  return (
    <Dialog onOpenChange={(open) => open && handleDialogOpen()}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex gap-2">
          <UploadCloud className="h-4 w-4" />
          <span>Cloud Storage</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>File Storage</DialogTitle>
          <DialogDescription>
            Store and load graph files from the cloud
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Input 
              type="file" 
              onChange={handleFileChange}
              disabled={uploading}
              className="flex-1"
            />
            <Button 
              onClick={handleUpload} 
              disabled={!file || uploading}
              className="whitespace-nowrap"
            >
              {uploading ? 'Uploading...' : 'Upload'}
              {!uploading && <UploadCloud className="ml-2 h-4 w-4" />}
            </Button>
          </div>
          
          {file && (
            <div className="text-sm text-gray-500">
              Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </div>
          )}
          
          {uploadedFile && (
            <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded flex items-start">
              <FileCheck className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <div className="space-y-1">
                <div className="font-medium">File uploaded successfully!</div>
                <a 
                  href={uploadedFile} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all flex items-center"
                >
                  <span className="mr-1">View file</span>
                  <Download className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Stored Files</h3>
            {loading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : storedFiles.length > 0 ? (
              <div className="max-h-40 overflow-y-auto border rounded">
                {storedFiles.map((storedFile, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm truncate max-w-[150px]" title={storedFile.name}>
                        {storedFile.name}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => loadGraphFromFile(storedFile.url)}
                        title="Load this graph"
                      >
                        Load
                      </Button>
                      <a 
                        href={storedFile.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center"
                      >
                        <Download className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No files found in storage</div>
            )}
          </div>
        </div>
        
        <div className="text-xs text-gray-500 border-t pt-2 mt-2">
          <p className="flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            Files are publicly accessible. Use for non-sensitive data only.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileUpload;
