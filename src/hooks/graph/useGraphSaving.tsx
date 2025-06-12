
import { useCallback, useRef } from 'react';
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';
import { useNodeDOMCapture } from './useNodeDOMCapture';
import { useGraphDebug } from './useGraphDebug';
import { GraphLocalStorageService } from '@/services/storage/GraphLocalStorageService';

export const useGraphSaving = (
  nodes?: Node[],
  edges?: Edge[],
) => {
  const { captureNodesFromDOM } = useNodeDOMCapture();
  const { logGraphState, getDebugNodes } = useGraphDebug();
  
  // Track most recent save operation
  const lastSaveNameRef = useRef<string | null>(null);
  
  const saveGraph = useCallback(() => {
    try {
      // Get a name for the graph
      const name = window.prompt('Enter a name for the graph:');
      if (!name || name.trim() === '') {
        toast.error('Please enter a valid name for the graph');
        return false;
      }
      
      // Store the name for potential recovery
      lastSaveNameRef.current = name;
      
      // Log current state
      logGraphState('save-attempt', nodes, edges);
      
      let nodesToSave = nodes;
      let edgesToSave = edges;
      
      // Critical recovery: If no nodes in state but DOM has nodes, use DOM nodes
      if (!nodes || nodes.length === 0) {
        const domNodes = captureNodesFromDOM();
        if (domNodes && domNodes.length > 0) {
          nodesToSave = domNodes;
          logGraphState('dom-recovery', domNodes, edges);
        } else {
          // Try debug nodes as last resort
          const debugNodes = getDebugNodes();
          if (debugNodes) {
            nodesToSave = debugNodes;
            logGraphState('debug-recovery', debugNodes, edges);
          }
        }
      }
      
      // Final validation
      if (!nodesToSave || nodesToSave.length === 0) {
        toast.error('Cannot save an empty graph');
        return false;
      }
      
      // Manual save using GraphLocalStorageService
      const success = GraphLocalStorageService.saveToLocalStorage(
        name,
        nodesToSave,
        edgesToSave || []
      );
      
      if (success) {
        toast.success(`Graph "${name}" saved successfully`);
        return true;
      } else {
        toast.error(`Failed to save graph "${name}"`);
        return false;
      }
    } catch (error) {
      console.error('Error saving graph:', error);
      toast.error('Failed to save graph');
      return false;
    }
  }, [nodes, edges, captureNodesFromDOM, logGraphState, getDebugNodes]);
  
  const saveGraphToCloud = useCallback((name: string, nodes: Node[], edges: Edge[]): Promise<string | null> => {
    try {
      logGraphState('cloud-save-attempt', nodes, edges);
      
      let validNodes = nodes;
      let validEdges = edges;
      
      // Recovery if no nodes provided
      if (!nodes || nodes.length === 0) {
        const domNodes = captureNodesFromDOM();
        if (domNodes) {
          validNodes = domNodes;
          logGraphState('cloud-dom-recovery', domNodes, edges);
        }
      }
      
      if (!validNodes || validNodes.length === 0) {
        toast.error('Cannot save an empty graph to cloud');
        return Promise.resolve(null);
      }
      
      return Promise.resolve('dummy-url'); // Replace with actual cloud save implementation
    } catch (error) {
      console.error('Error in saveGraphToCloud:', error);
      toast.error('Failed to save to cloud');
      return Promise.resolve(null);
    }
  }, [captureNodesFromDOM, logGraphState]);
  
  return {
    saveGraph,
    saveGraphToCloud
  };
};
