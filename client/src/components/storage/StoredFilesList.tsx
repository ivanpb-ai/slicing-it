
import { Download, FileText } from 'lucide-react';
import { Button } from '../ui/button';

interface StoredFile {
  name: string;
  url: string;
}

interface StoredFilesListProps {
  files: StoredFile[];
  onLoadFile: (url: string) => void;
  loading: boolean;
  onRefresh: () => void;
}

const StoredFilesList = ({ files, onLoadFile, loading, onRefresh }: StoredFilesListProps) => {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2 flex justify-between items-center">
        <span>Stored Graphs</span>
        <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading}>
          Refresh
        </Button>
      </h3>
      {loading ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : files.length > 0 ? (
        <div className="max-h-60 overflow-y-auto border rounded">
          {files.map((file, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-2 hover:bg-gray-50 border-b last:border-b-0"
            >
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm truncate max-w-[150px]" title={file.name}>
                  {file.name}
                </span>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onLoadFile(file.url)}
                  title="Load this graph"
                >
                  Load
                </Button>
                <a 
                  href={file.url} 
                  download={file.name}
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
  );
};

export default StoredFilesList;
