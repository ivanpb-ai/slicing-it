
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';
import type { GraphData } from '../storage/GraphLocalStorageService';

export class GraphExportImportService {
  // Helper method to deep clone data
  private static deepClone<T>(data: T): T {
    return JSON.parse(JSON.stringify(data));
  }

  // Export graph to JSON file
  static exportGraphToFile(name: string | undefined, nodes: Node[], edges: Edge[]): string | null {
    try {
      const startTime = performance.now();
      console.log('🔍 GraphExportImportService: Starting export with', nodes.length, 'nodes and', edges.length, 'edges');
      
      // Create file name
      const fileName = `${name || 'graph'}_${new Date().toISOString().split('T')[0]}.json`;
      console.log('🔍 GraphExportImportService: Filename:', fileName);
      
      // Create graph data with timing
      const cloneStartTime = performance.now();
      const clonedNodes = this.deepClone(nodes);
      const nodesCloneTime = performance.now();
      console.log('🔍 GraphExportImportService: Node cloning took', nodesCloneTime - cloneStartTime, 'ms');
      
      const clonedEdges = this.deepClone(edges);
      const edgesCloneTime = performance.now();
      console.log('🔍 GraphExportImportService: Edge cloning took', edgesCloneTime - nodesCloneTime, 'ms');
      
      const graphData = {
        nodes: clonedNodes,
        edges: clonedEdges,
        exportTime: Date.now(),
        timestamp: Date.now()
      };
      
      // Create JSON string
      const stringifyStartTime = performance.now();
      const dataString = JSON.stringify(graphData, null, 2);
      const stringifyEndTime = performance.now();
      console.log('🔍 GraphExportImportService: JSON.stringify took', stringifyEndTime - stringifyStartTime, 'ms');
      
      // Create blob and download
      const blobStartTime = performance.now();
      const blob = new Blob([dataString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      
      URL.revokeObjectURL(url);
      const endTime = performance.now();
      console.log('🔍 GraphExportImportService: Total export time:', endTime - startTime, 'ms');
      return url;
    } catch (error) {
      console.error('GraphExportImportService: Error exporting graph:', error);
      toast.error('Failed to export graph');
      return null;
    }
  }
  
  // Import graph from file
  static async importGraphFromFile(file: File): Promise<GraphData | null> {
    console.log(`GraphExportImportService: Starting import of ${file.name}, size: ${file.size} bytes`);
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          if (!e.target?.result) {
            console.error('GraphExportImportService: Failed to read file - no result');
            toast.error('Failed to read file');
            resolve(null);
            return;
          }
          
          const contents = e.target.result as string;
          console.log(`GraphExportImportService: File contents length: ${contents.length}`);
          
          if (contents.length === 0) {
            console.error('GraphExportImportService: File is empty');
            toast.error('File is empty');
            resolve(null);
            return;
          }
          
          let graphData: GraphData;
          
          try {
            graphData = JSON.parse(contents);
            console.log('GraphExportImportService: Successfully parsed JSON', graphData);
          } catch (parseError) {
            console.error('GraphExportImportService: JSON parse error:', parseError);
            toast.error('Invalid JSON file format');
            resolve(null);
            return;
          }
          
          // Validate graph data structure
          if (!graphData || typeof graphData !== 'object') {
            console.error('GraphExportImportService: Invalid graph data structure');
            toast.error('Invalid graph data structure');
            resolve(null);
            return;
          }
          
          // Ensure we have nodes array
          if (!graphData.nodes || !Array.isArray(graphData.nodes)) {
            console.error('GraphExportImportService: No valid nodes array found');
            toast.error('Invalid graph data: nodes not found or invalid');
            resolve(null);
            return;
          }
          
          // Ensure we have edges array (can be empty)
          if (!graphData.edges || !Array.isArray(graphData.edges)) {
            console.log('GraphExportImportService: No edges found or invalid, setting empty array');
            graphData.edges = [];
          }
          
          // Create timestamp if it doesn't exist
          if (!graphData.timestamp) {
            graphData.timestamp = Date.now();
          }
          
          console.log(`GraphExportImportService: Successfully processed graph with ${graphData.nodes.length} nodes and ${graphData.edges.length} edges`);
          
          // Additional validation: check if nodes have required properties
          const validNodes = graphData.nodes.filter(node => 
            node && 
            typeof node === 'object' && 
            node.id && 
            node.position &&
            typeof node.position.x === 'number' &&
            typeof node.position.y === 'number'
          );
          
          if (validNodes.length !== graphData.nodes.length) {
            console.warn(`GraphExportImportService: Filtered out ${graphData.nodes.length - validNodes.length} invalid nodes`);
            graphData.nodes = validNodes;
          }
          
          if (graphData.nodes.length === 0) {
            console.error('GraphExportImportService: No valid nodes after filtering');
            toast.error('No valid nodes found in file');
            resolve(null);
            return;
          }
          
          console.log(`GraphExportImportService: Final validation passed - returning ${graphData.nodes.length} nodes and ${graphData.edges.length} edges`);
          resolve(graphData);
          
        } catch (error) {
          console.error('GraphExportImportService: Error processing file:', error);
          toast.error('Failed to process graph file: ' + (error instanceof Error ? error.message : 'Unknown error'));
          resolve(null);
        }
      };
      
      reader.onerror = (error) => {
        console.error('GraphExportImportService: File read error:', error);
        toast.error('Error reading file');
        resolve(null);
      };
      
      // Start reading the file
      reader.readAsText(file);
    });
  }
}
