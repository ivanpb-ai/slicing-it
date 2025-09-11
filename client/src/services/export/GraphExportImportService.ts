
import { Node, Edge, useReactFlow } from '@xyflow/react';
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
      
      
      
      // Create file name
      const fileName = `${name || 'graph'}_${new Date().toISOString().split('T')[0]}.json`;
      
      // Create graph data with timing
      const cloneStartTime = performance.now();
      const clonedNodes = this.deepClone(nodes);
      const nodesCloneTime = performance.now();
      
      const clonedEdges = this.deepClone(edges);
      const edgesCloneTime = performance.now();
      
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
          
          // Enhanced validation: check and fix nodes with invalid positions
          const validNodes = graphData.nodes.map((node, index) => {
            if (!node || typeof node !== 'object' || !node.id) {
              console.warn(`GraphExportImportService: Invalid node at index ${index}:`, node);
              return null;
            }
            
            // Fix invalid positions
            let hasValidPosition = node.position && 
              typeof node.position.x === 'number' && 
              typeof node.position.y === 'number' &&
              !isNaN(node.position.x) && 
              !isNaN(node.position.y);
            
            if (!hasValidPosition) {
              console.warn(`GraphExportImportService: Fixing invalid position for ${node.data?.type || 'unknown'} node ${node.id}:`, node.position);
              // Assign default position based on node index to prevent overlap
              const defaultX = (index % 5) * 200; // 5 nodes per row
              const defaultY = Math.floor(index / 5) * 150; // Rows 150px apart
              
              node = {
                ...node,
                position: {
                  x: defaultX,
                  y: defaultY
                }
              };
              
              console.log(`GraphExportImportService: Assigned default position (${defaultX}, ${defaultY}) to ${node.data?.type} node ${node.id}`);
            }
            
            return node;
          }).filter(node => node !== null);
          
          if (validNodes.length !== graphData.nodes.length) {
            const filteredNodes = graphData.nodes.filter((node, index) => !validNodes.includes(node));
            console.warn(`GraphExportImportService: Filtered out ${graphData.nodes.length - validNodes.length} invalid nodes:`, 
              filteredNodes.map(node => ({ id: node?.id, type: node?.data?.type, position: node?.position }))
            );
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
