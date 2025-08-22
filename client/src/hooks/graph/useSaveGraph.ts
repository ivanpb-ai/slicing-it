
import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';

export const useSaveGraph = (nodes?: Node[], edges?: Edge[]) => {
  // Save the current graph to localStorage
  const saveGraph = useCallback(
    (graphName: string): boolean => {
      try {
        // If nodes/edges are not provided, we can't save
        if (!nodes || nodes.length === 0) {
          console.error('Cannot save graph: no nodes provided');
          toast.error('Failed to save graph: No nodes to save');
          return false;
        }

        // Get existing saved graphs or initialize empty object
        const savedGraphs = JSON.parse(localStorage.getItem('savedGraphs') || '{}');
        
        // Add this graph to the saved graphs
        const timestamp = Date.now();
        savedGraphs[graphName] = {
          nodes,
          edges: edges || [],
          timestamp,
        };
        
        // Save back to localStorage
        localStorage.setItem('savedGraphs', JSON.stringify(savedGraphs));
        toast.success(`Graph "${graphName}" saved successfully`);
        return true;
      } catch (error) {
        console.error('Error saving graph:', error);
        toast.error('Failed to save graph');
        return false;
      }
    },
    [nodes, edges]
  );

  return { saveGraph };
};
