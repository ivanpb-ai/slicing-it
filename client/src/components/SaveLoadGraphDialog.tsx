
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SavedGraph } from '@/hooks/types';
import { GraphPersistenceService } from '@/services/graphPersistenceService';
import LocalStorageTab from './storage/LocalStorageTab';
import CloudStorageTab from './storage/CloudStorageTab';
import type { GraphData } from '@/services/storage/GraphLocalStorageService';
import { toast } from 'sonner';
import { MarkerType } from '@xyflow/react';
import { GraphNodeProcessor } from '@/services/processing/GraphNodeProcessor';

type SaveLoadGraphDialogProps = {
  mode: 'save' | 'load';
  onSave: () => boolean;
  onLoad: (graphData: GraphData) => boolean;
  onDelete: (name: string) => boolean;
  getSavedGraphs: () => SavedGraph[];
  onClose: () => void;
};

const SaveLoadGraphDialog: React.FC<SaveLoadGraphDialogProps> = ({
  mode,
  onSave,
  onLoad,
  onDelete,
  getSavedGraphs,
  onClose,
}) => {
  const [graphName, setGraphName] = useState('');
  const [savedGraphs, setSavedGraphs] = useState<SavedGraph[]>([]);
  const [cloudFiles, setCloudFiles] = useState<Array<{ name: string, url: string }>>([]);
  const [activeTab, setActiveTab] = useState<string>(mode === 'save' ? 'local' : 'local');
  const [loading, setLoading] = useState(false);

  // Load saved graphs on mount and tab change
  useEffect(() => {
    if (activeTab === 'local') {
      try {
        const graphs = getSavedGraphs();
        console.log('Retrieved saved graphs in dialog:', graphs.length);
        
        // Log graph details for debugging
        if (graphs.length > 0) {
          graphs.forEach(graph => {
            console.log(`Graph "${graph.name}" has ${graph.nodes?.length || 0} nodes and ${graph.edges?.length || 0} edges`);
            // Log edge details for the first graph
            if (graph === graphs[0] && graph.edges && graph.edges.length > 0) {
              console.log(`First edge of "${graph.name}":`, JSON.stringify(graph.edges[0]));
              console.log(`Edge sources of "${graph.name}":`, graph.edges.map(e => e.source).join(', '));
              console.log(`Edge targets of "${graph.name}":`, graph.edges.map(e => e.target).join(', '));
            }
          });
        }
        
        setSavedGraphs(graphs);
      } catch (error) {
        console.error('Error loading saved graphs:', error);
        // Try to get saved graphs directly from localStorage as fallback
        try {
          const savedGraphsStr = localStorage.getItem('savedGraphs');
          if (savedGraphsStr) {
            const savedGraphs = JSON.parse(savedGraphsStr);
            if (savedGraphs && typeof savedGraphs === 'object') {
              if (Array.isArray(savedGraphs)) {
                console.log('Retrieved graphs directly from localStorage:', savedGraphs.length);
                setSavedGraphs(savedGraphs);
              } else {
                const graphs = Object.entries(savedGraphs).map(([name, data]: [string, any]) => ({
                  id: `local-${name}`,
                  name,
                  createdAt: data.timestamp || Date.now(),
                  nodes: data.nodes || [],
                  edges: data.edges || []
                }));
                console.log('Retrieved graphs directly from localStorage:', graphs.length);
                setSavedGraphs(graphs);
              }
            }
          }
        } catch (e) {
          console.error('Fallback retrieval failed:', e);
        }
      }
    } else if (activeTab === 'cloud') {
      fetchCloudFiles();
    }
  }, [getSavedGraphs, activeTab]);

  const fetchCloudFiles = async () => {
    setLoading(true);
    try {
      const files = await GraphPersistenceService.getCloudGraphs();
      setCloudFiles(files);
    } catch (error) {
      console.error('Error fetching cloud files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadGraph = (graph: SavedGraph) => {
    try {
      console.log('Loading graph from SaveLoadGraphDialog:', graph.name, 'with nodes:', graph.nodes.length);
      console.log('Loading graph with edges:', graph.edges?.length || 0);
      
      // Ensure we have valid edges
      if (!graph.edges || !Array.isArray(graph.edges)) {
        console.warn('No valid edges array in graph:', graph.name);
        graph.edges = [];
      }
      
      if (graph.edges.length > 0) {
        console.log('Sample edge from graph:', JSON.stringify(graph.edges[0]));
        console.log('Edge sources:', graph.edges.map(e => e.source).join(', '));
        console.log('Edge targets:', graph.edges.map(e => e.target).join(', '));
      }
      
      // Process edges with our processor to ensure consistent structure
      const processedEdges = GraphNodeProcessor.prepareEdgesForLoading(graph.edges);
      console.log('Processed edges count:', processedEdges.length);
      
      // Convert SavedGraph to GraphData with proper node types and processed edges
      const graphData: GraphData = {
        nodes: graph.nodes.map(node => ({
          ...node,
          type: 'customNode',
          data: {
            ...(node.data || {}),
            type: node.data?.type || 'generic',
            label: node.data?.label || node.id || 'Node'
          },
          position: {
            x: typeof node.position?.x === 'number' ? node.position.x : 0,
            y: typeof node.position?.y === 'number' ? node.position.y : 0
          }
        })),
        edges: processedEdges,
        timestamp: graph.createdAt
      };
      
      console.log('Processed graph data with edges:', graphData.edges.length);
      if (graphData.edges.length > 0) {
        console.log('Sample processed edge:', JSON.stringify(graphData.edges[0]));
      }
      
      // Add loading notification
      toast.info(`Loading graph "${graph.name}"...`, { duration: 3000 });
      
      onLoad(graphData);
      onClose();
    } catch (error) {
      console.error('Error loading graph:', error);
      toast.error('Error loading graph');
    }
  };

  const handleLoadCloudGraph = async (fileUrl: string) => {
    try {
      const graphData = await GraphPersistenceService.loadFromCloudStorage(fileUrl);
      if (graphData) {
        onLoad(graphData);
        onClose();
      }
    } catch (error) {
      console.error('Error loading graph from cloud:', error);
    }
  };

  const handleDeleteGraph = (graphName: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering load
    
    if (window.confirm(`Are you sure you want to delete "${graphName}"?`)) {
      try {
        const result = onDelete(graphName);
        if (result) {
          // Refresh the list
          const updatedGraphs = getSavedGraphs();
          setSavedGraphs(updatedGraphs);
        }
      } catch (error) {
        console.error('Error deleting graph:', error);
      }
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="local">Local Storage</TabsTrigger>
          <TabsTrigger value="cloud">Cloud Storage</TabsTrigger>
        </TabsList>
        
        <TabsContent value="local" className="space-y-4">
          <LocalStorageTab
            mode={mode}
            graphName={graphName}
            setGraphName={setGraphName}
            savedGraphs={savedGraphs}
            onSave={onSave}
            onLoad={handleLoadGraph}
            onDelete={handleDeleteGraph}
            onClose={onClose}
          />
        </TabsContent>
        
        <TabsContent value="cloud" className="space-y-4">
          <CloudStorageTab
            mode={mode}
            graphName={graphName}
            setGraphName={setGraphName}
            cloudFiles={cloudFiles}
            loading={loading}
            fetchCloudFiles={fetchCloudFiles}
            onClose={onClose}
            onLoadFile={handleLoadCloudGraph}
          />
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default SaveLoadGraphDialog;
