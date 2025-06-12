
import { AlertCircle } from 'lucide-react';

interface StorageWarningProps {
  storageAccessible: boolean;
  showSecurityNote?: boolean;
}

const StorageWarning = ({ storageAccessible, showSecurityNote = true }: StorageWarningProps) => {
  return (
    <div className="space-y-3">
      {!storageAccessible && (
        <div className="p-3 bg-amber-50 border border-amber-100 rounded flex items-start">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Storage access unavailable</p>
            <p className="text-amber-700">
              Cloud storage requires authentication or may be temporarily unavailable. 
              You can still use local storage to save your graphs.
            </p>
          </div>
        </div>
      )}
      
      {showSecurityNote && (
        <div className="text-xs text-gray-500 border-t pt-2 mt-2">
          <p className="flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            Files are publicly accessible. Use for non-sensitive data only.
          </p>
        </div>
      )}
    </div>
  );
};

export default StorageWarning;
