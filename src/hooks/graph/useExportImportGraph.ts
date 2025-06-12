
import { useCallback } from 'react';
import { Node, Edge, useReactFlow } from '@xyflow/react';
import { toast } from 'sonner';
import { updateDnnCounter, resetCounters } from '@/utils/flowData/idCounters';
import type { GraphData } from '@/services/storage/GraphLocalStorageService';

// Export the hook with the name that's imported in useGraphOperations.tsx
export const useExportImportGraph = (
  nodes?: Node[],
  edges?: Edge[],
  setNodes?: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges?: React.Dispatch<React.SetStateAction<Edge[]>>
) => {
  // Get the react flow instance
  const reactFlowInstance = useReactFlow();

  // Export the current graph as JSON
  const exportGraph = useCallback((graphName?: string): string | null => {
    try {
      if (graphName) {
        // Export a saved graph
        const savedGraphs = JSON.parse(localStorage.getItem('savedGraphs') || '{}');
        if (!savedGraphs[graphName]) {
          toast.error(`Graph "${graphName}" not found`);
          return null;
        }
        
        // Create file name from graph name
        const fileName = `${graphName.replace(/\s+/g, '_')}_${Date.now()}.json`;
        
        // Create download link
        const dataStr = JSON.stringify(savedGraphs[graphName], null, 2);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
        
        // Create and trigger download
        const downloadLink = document.createElement('a');
        downloadLink.setAttribute('href', dataUri);
        downloadLink.setAttribute('download', fileName);
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        toast.success(`Graph "${graphName}" exported successfully`);
        return dataStr;
      } else {
        // Export current graph - ensuring we always have nodes and edges arrays
        const fileName = `graph_export_${Date.now()}.json`;
        const dataStr = JSON.stringify({ 
          nodes: nodes || [], 
          edges: edges || [], 
          exportTime: Date.now() 
        }, null, 2);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
        
        // Create and trigger download
        const downloadLink = document.createElement('a');
        downloadLink.setAttribute('href', dataUri);
        downloadLink.setAttribute('download', fileName);
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        if (nodes && nodes.length > 0) {
          toast.success('Current graph exported successfully');
        } else {
          toast.success('Empty graph exported successfully');
        }
        return dataStr;
      }
    } catch (error) {
      console.error('Error exporting graph:', error);
      toast.error('Failed to export graph');
      return null;
    }
  }, [nodes, edges]);

  // Import a graph from JSON content from a file
  const importGraph = useCallback(
    (file: File) => {
      if (!setNodes || !setEdges) {
        console.error('Cannot import graph: setNodes or setEdges not provided');
        toast.error('Import failed', {
          description: 'Unable to update the graph display'
        });
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const jsonData = event.target?.result as string;
          if (!jsonData) {
            toast.error('Empty file', {
              description: 'The imported file is empty'
            });
            return;
          }
          
          const parsedData = JSON.parse(jsonData);
          if (!parsedData.nodes || !parsedData.edges) {
            toast.error('Invalid graph data', {
              description: 'The imported file does not contain valid nodes and edges'
            });
            return;
          }
          
          // First reset all counters to avoid ID conflicts
          resetCounters();
          
          // Then update counters based on imported nodes
          updateDnnCounter(parsedData.nodes);
          
          // First, reset the viewport
          if (reactFlowInstance) {
            console.log('Resetting viewport before importing graph');
            reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
            // Note: Interactivity is enabled by default
          }
          
          // Clear existing nodes and edges first
          setNodes([]);
          setEdges([]);
          
          // Set the imported nodes and edges with a delay
          setTimeout(() => {
            console.log('Setting imported nodes:', parsedData.nodes.length);
            
            // Ensure all nodes have the correct type set for our CustomNode component
            const processedNodes = parsedData.nodes.map((node: Node) => ({
              ...node,
              type: 'customNode'
            }));
            
            setNodes(processedNodes);
            setEdges(parsedData.edges);
            
            // Dispatch event after setting nodes/edges
            setTimeout(() => {
              console.log('Dispatching graph-loaded event after import');
              window.dispatchEvent(new CustomEvent('graph-loaded'));
              
              // Additional fit view with a longer delay
              if (reactFlowInstance) {
                setTimeout(() => {
                  console.log('Fitting view after importing graph (delayed)');
                  reactFlowInstance.fitView({ 
                    padding: 0.2,
                    includeHiddenNodes: false,
                    duration: 800
                  });
                }, 500);
              }
            }, 200);
          }, 100);
          
          toast.success('Graph imported successfully');
        } catch (error) {
          console.error('Error importing graph:', error);
          toast.error('Failed to import graph', {
            description: 'The file could not be parsed as valid JSON'
          });
        }
      };
      
      reader.onerror = () => {
        toast.error('Failed to read file', {
          description: 'The file could not be read'
        });
      };
      
      reader.readAsText(file);
    },
    [setNodes, setEdges, reactFlowInstance]
  );

  return {
    exportGraph,
    importGraph
  };
};
