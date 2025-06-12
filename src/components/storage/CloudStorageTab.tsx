
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { GraphPersistenceService } from '@/services/graphPersistenceService';
import StoredFilesList from './StoredFilesList';
import GraphNameInput from './GraphNameInput';

type CloudStorageTabProps = {
  mode: 'save' | 'load';
  graphName: string;
  setGraphName: (name: string) => void;
  cloudFiles: Array<{ name: string, url: string }>;
  loading: boolean;
  fetchCloudFiles: () => void;
  onClose: () => void;
  onLoadFile: (url: string) => Promise<void>;
};

const CloudStorageTab: React.FC<CloudStorageTabProps> = ({
  mode,
  graphName,
  setGraphName,
  cloudFiles,
  loading,
  fetchCloudFiles,
  onClose,
  onLoadFile,
}) => {
  const handleSaveToCloud = () => {
    if (!graphName.trim()) {
      toast.error('Please enter a graph name');
      return;
    }

    try {
      // Create a trigger event for exporting the current graph as JSON
      const event = new CustomEvent('export-current-graph', {
        detail: { 
          callback: async (graphData: string) => {
            try {
              const parsedData = JSON.parse(graphData);
              const result = await GraphPersistenceService.saveToCloudStorage(
                graphName,
                parsedData.nodes || [],
                parsedData.edges || []
              );
              
              if (result) {
                setGraphName('');
                fetchCloudFiles();
                onClose();
              }
            } catch (error) {
              console.error('Error saving to cloud:', error);
              toast.error('Failed to save graph to cloud');
            }
          }
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error saving graph to cloud:', error);
      toast.error('Failed to save graph to cloud');
    }
  };

  return (
    <div className="space-y-4">
      {mode === 'save' ? (
        <div className="space-y-2">
          <GraphNameInput 
            graphName={graphName} 
            onChange={setGraphName} 
            disabled={loading}
          />
          <Button 
            onClick={handleSaveToCloud} 
            className="w-full"
            disabled={loading}
          >
            Save to Cloud
          </Button>
        </div>
      ) : (
        <StoredFilesList 
          files={cloudFiles} 
          onLoadFile={onLoadFile}
          loading={loading} 
          onRefresh={fetchCloudFiles}
        />
      )}
    </div>
  );
};

export default CloudStorageTab;
