
import { FileCheck, AlertCircle, Download } from 'lucide-react';

interface UploadStatusProps {
  file: File | null;
  uploadedFileUrl: string | null;
  error: string | null;
}

const UploadStatus = ({ file, uploadedFileUrl, error }: UploadStatusProps) => {
  return (
    <>
      {file && (
        <div className="text-sm text-gray-500">
          Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
        </div>
      )}
      
      {uploadedFileUrl && (
        <div className="mt-2 p-3 bg-green-50 border border-green-100 rounded flex items-start">
          <FileCheck className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
          <div className="space-y-1">
            <div className="font-medium">File uploaded successfully!</div>
            <a 
              href={uploadedFileUrl} 
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
      
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
          <div className="space-y-1">
            <div className="font-medium">Error:</div>
            <div className="text-sm text-red-600 break-words">{error}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default UploadStatus;
