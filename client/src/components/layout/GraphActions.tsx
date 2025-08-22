
import React, { useCallback, useRef } from 'react';
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';
import { SavedGraph } from '@/hooks/types';
import { GraphLocalStorageService, GraphData } from '@/services/storage/GraphLocalStorageService';

interface GraphActionsProps {
  saveGraph: (name: string) => boolean;
  loadGraph: (name: string) => boolean;
  exportGraph: (name?: string) => string | null;
  importGraph: (file: File) => void;
  isLoadingRef: React.MutableRefObject<boolean>;
  nodes: Node[];
  edges: Edge[];
  getDomNodes: () => Node[] | null;
}

const GraphActions = (props: GraphActionsProps) => {
  const { 
    saveGraph, 
    loadGraph, 
    exportGraph, 
    importGraph, 
    isLoadingRef,
    nodes,
    edges,
    getDomNodes
  } = props;
  
  // Track most recent save operation
  const lastSaveNameRef = useRef<string | null>(null);
  
  // Handle graph save
  const handleSave = useCallback(() => {
    try {
      // Get a name for the graph
      const name = window.prompt('Enter a name for the graph:');
      if (!name || name.trim() === '') {
        toast.error('Please enter a valid name for the graph');
        return false;
      }
      
      // Store the name for potential recovery
      lastSaveNameRef.current = name;
      
      // Check for node state mismatch
      console.log(`GraphActions: Current nodes count: ${nodes.length}`);
      console.log(`GraphActions: Current edges count: ${edges.length}`);
      
      // Get DOM nodes for recovery
      const domNodes = getDomNodes();
      if (domNodes) {
        console.log(`GraphActions: Nodes visible in DOM: ${domNodes.length}`);
      }
      
      let nodesToSave = nodes;
      let edgesToSave = edges;
      
      // Critical recovery: If no nodes in state but DOM has nodes, use DOM nodes
      if (nodes.length === 0 && domNodes && domNodes.length > 0) {
        console.warn('CRITICAL: Node state mismatch detected. Using recovery methods for saving.');
        console.log(`Retrieved ${domNodes.length} nodes from DOM reference`);
        
        // Use DOM nodes for saving
        nodesToSave = domNodes;
        console.log(`Using ${domNodes.length} DOM nodes for saving`);
        
        // We don't have edges here, but at least we recover the nodes
      }
      
      // Manual save using GraphLocalStorageService for better control
      const success = GraphLocalStorageService.saveToLocalStorage(
        name,
        nodesToSave,
        edgesToSave
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
  }, [nodes, edges, getDomNodes]);
  
  // Handle graph load
  const handleLoad = useCallback(() => {
    try {
      // If already loading, prevent another load
      if (isLoadingRef.current) {
        toast.info('Already loading a graph, please wait');
        return false;
      }
      
      // Get saved graphs
      const savedGraphs = GraphLocalStorageService.getLocalGraphs();
      console.log(`Available graphs for loading: ${savedGraphs.length}`);
      
      // Direct access to localStorage for better debugging
      const savedGraphsStr = localStorage.getItem('savedGraphs');
      if (savedGraphsStr) {
        try {
          const savedGraphsObj = JSON.parse(savedGraphsStr);
          console.log(`Retrieved graphs directly from localStorage: ${Object.keys(savedGraphsObj).length}`);
          // Log each saved graph's structure
          Object.entries(savedGraphsObj).forEach(([graphName, graphData]: [string, any]) => {
            console.log(`Graph "${graphName}": ${graphData.nodes?.length || 0} nodes, ${graphData.edges?.length || 0} edges`);
            if (graphData.nodes && graphData.nodes.length > 0) {
              console.log(`First node sample: ${JSON.stringify(graphData.nodes[0])}`);
            }
          });
        } catch (e) {
          console.error('Error parsing savedGraphs:', e);
        }
      }
      
      if (savedGraphs.length === 0) {
        toast.error('No saved graphs found');
        return false;
      }
      
      // Prompt user for graph name
      const graphNames = savedGraphs.map(g => g.name).join(', ');
      const name = window.prompt(`Enter the name of the graph to load.\nAvailable graphs: ${graphNames}`);
      
      if (!name || name.trim() === '') {
        toast.error('Please enter a valid name');
        return false;
      }
      
      // Check if graph exists
      const graphExists = savedGraphs.some(g => g.name === name);
      if (!graphExists) {
        toast.error(`Graph "${name}" not found`);
        return false;
      }
      
      // Set loading flag
      isLoadingRef.current = true;
      console.log(`Loading graph "${name}" - loading flag set to true`);
      
      // Direct load from storage service
      const graphData = GraphLocalStorageService.loadFromLocalStorage(name);
      
      if (!graphData) {
        toast.error(`Failed to load graph "${name}"`);
        isLoadingRef.current = false;
        return false;
      }
      
      // Validate data is usable
      if (!graphData.nodes || !Array.isArray(graphData.nodes)) {
        toast.error(`Graph "${name}" has invalid node data`);
        isLoadingRef.current = false;
        return false;
      }
      
      console.log(`Loaded graph "${name}" with ${graphData.nodes.length} nodes and ${graphData.edges?.length || 0} edges`);
      
      // Let the actual loadGraph function handle the rest
      const result = loadGraph(name);
      
      // Update internal references for debugging
      if (result) {
        console.log(`GraphActions: Updated nodes reference with ${graphData.nodes?.length || 0} nodes`);
        console.log(`GraphActions: Updated edges reference with ${graphData.edges?.length || 0} edges`);
        
        // Make sure to dispatch an event to notify the rest of the application about the loaded graph
        window.dispatchEvent(new CustomEvent('graph-loaded'));
        
        // Set a timeout to reset the loading flag in case something goes wrong
        setTimeout(() => {
          if (isLoadingRef.current) {
            console.log('Force resetting loading flag after timeout');
            isLoadingRef.current = false;
            window.dispatchEvent(new CustomEvent('loading-timeout'));
          }
        }, 5000);
      } else {
        isLoadingRef.current = false;
      }
      
      return result;
    } catch (error) {
      console.error('Error loading graph:', error);
      toast.error('Failed to load graph');
      isLoadingRef.current = false;
      return false;
    }
  }, [loadGraph, isLoadingRef]);
  
  // Handle graph export
  const handleExport = useCallback(() => {
    try {
      const name = window.prompt('Enter a name for the exported file (optional):');
      
      // Check for empty canvas
      if (nodes.length === 0) {
        const domNodes = getDomNodes();
        if (domNodes && domNodes.length > 0) {
          console.warn('CRITICAL: Empty state but DOM has nodes. Using DOM nodes for export.');
          
          // Create an export with DOM nodes instead
          const exportData = {
            nodes: domNodes,
            edges: [] // We don't have edges in this recovery scenario
          };
          
          // Export manually
          const dataString = JSON.stringify(exportData, null, 2);
          const blob = new Blob([dataString], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          
          const a = document.createElement('a');
          a.href = url;
          a.download = `${name || 'graph-recovery'}_${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          
          URL.revokeObjectURL(url);
          
          toast.success('Graph exported successfully (recovery mode)');
          return url;
        }
      }
      
      // Normal export
      return exportGraph(name || undefined);
    } catch (error) {
      console.error('Error exporting graph:', error);
      toast.error('Failed to export graph');
      return null;
    }
  }, [exportGraph, nodes, getDomNodes]);
  
  // Handle graph import
  const handleImport = useCallback((file: File) => {
    try {
      if (isLoadingRef.current) {
        toast.info('Already loading a graph, please wait');
        return;
      }
      
      importGraph(file);
    } catch (error) {
      console.error('Error importing graph:', error);
      toast.error('Failed to import graph');
    }
  }, [importGraph, isLoadingRef]);
  
  return {
    handleSave,
    handleLoad,
    handleExport,
    handleImport
  };
};

export default GraphActions;
