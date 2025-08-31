
import { Node, Edge } from '@xyflow/react';
import { GraphLocalStorageService } from './storage/GraphLocalStorageService';
import { GraphCloudStorageService } from './storage/GraphCloudStorageService';
import { GraphExportImportService } from './export/GraphExportImportService';
import { GraphNodeProcessor } from './processing/GraphNodeProcessor';
import { GraphLoadingService } from './loading/GraphLoadingService';
import { GraphSaveService } from './saving/GraphSaveService';

// Use "export type" syntax for re-exporting types when isolatedModules is enabled
import type { GraphData } from './storage/GraphLocalStorageService';
export type { GraphData };
export type StorageMethod = 'local' | 'cloud';

// Main service that coordinates across specialized services
export class GraphPersistenceService {
  // Local storage methods
  static saveToLocalStorage(name: string, nodes: Node[], edges: Edge[]): boolean {
    // First validate nodes before attempting to save
    const preparedGraph = GraphSaveService.prepareGraphForSaving(name, nodes, edges);
    if (!preparedGraph || !preparedGraph.success) {
      console.error(`GraphPersistenceService: Cannot save - ${preparedGraph?.message || 'validation failed'}`);
      return false;
    }
    
    // Add debugging for node and edge counts
    console.log(`GraphPersistenceService.saveToLocalStorage: Prepared graph with ${preparedGraph.nodes?.length || 0} nodes`);
    
    if (preparedGraph.nodes && preparedGraph.nodes.length > 0) {
      console.log('  - First node sample:', JSON.stringify(preparedGraph.nodes[0]));
    }
    
    return GraphLocalStorageService.saveToLocalStorage(name, preparedGraph.nodes || [], preparedGraph.edges || []);
  }

  static getLocalGraphs() {
    const graphs = GraphLocalStorageService.getLocalGraphs();
    console.log(`GraphPersistenceService.getLocalGraphs: Retrieved ${graphs.length} graphs`);
    return graphs;
  }

  static deleteFromLocalStorage(name: string): boolean {
    return GraphLocalStorageService.deleteFromLocalStorage(name);
  }

  static loadFromLocalStorage(name: string): GraphData | null {
    const graphData = GraphLocalStorageService.loadFromLocalStorage(name);
    console.log(`GraphPersistenceService.loadFromLocalStorage: ${graphData ? 'Successfully loaded' : 'Failed to load'} graph "${name}"`);
    return graphData;
  }

  // Cloud storage methods
  static async saveToCloudStorage(name: string, nodes: Node[], edges: Edge[]): Promise<string | null> {
    return GraphCloudStorageService.saveToCloudStorage(name, nodes, edges);
  }

  static async getCloudGraphs() {
    return GraphCloudStorageService.getCloudGraphs();
  }

  static async loadFromCloudStorage(fileUrl: string): Promise<GraphData | null> {
    return GraphCloudStorageService.loadFromCloudStorage(fileUrl);
  }

  static async deleteFromCloudStorage(fileName: string): Promise<boolean> {
    return GraphCloudStorageService.deleteFromCloudStorage(fileName);
  }

  static async ensureStorageBucketExists(): Promise<boolean> {
    return GraphCloudStorageService.ensureStorageBucketExists();
  }

  // Export and import methods with ReactFlow instance prioritization
  static exportGraphToFile(name: string | undefined, nodes: Node[], edges: Edge[]): string | null {
    console.log('🔍 GraphPersistenceService: Export called with', nodes?.length || 0, 'nodes and', edges?.length || 0, 'edges');
    
    // PRIORITY 1: Try to get ReactFlow instance data from global registry
    try {
      // @ts-ignore - Access global ReactFlow instance if available
      const globalReactFlowInstances = window.__REACTFLOW_INSTANCES__;
      if (globalReactFlowInstances && globalReactFlowInstances.length > 0) {
        const reactFlowInstance = globalReactFlowInstances[0]; // Use the first (main) instance
        const flowNodes = reactFlowInstance.getNodes();
        const flowEdges = reactFlowInstance.getEdges();
        
        console.log('🔍 GraphPersistenceService: Found ReactFlow instance with', flowNodes.length, 'nodes and', flowEdges.length, 'edges');
        
        if (flowNodes.length > 0) {
          console.log('🔍 GraphPersistenceService: Using ReactFlow instance data (PRIORITY 1)');
          return GraphExportImportService.exportGraphToFile(name, flowNodes, flowEdges);
        }
      }
    } catch (e) {
      console.warn('🔍 GraphPersistenceService: Failed to access ReactFlow instance:', e);
    }
    
    // PRIORITY 2: Try debug globals as fallback
    try {
      // @ts-ignore - This is for debugging only
      const debugNodes = window.__DEBUG_NODE_EDITOR_NODES;
      // @ts-ignore - This is for debugging only  
      const debugEdges = window.__DEBUG_LAST_EDGES;
      
      if (debugNodes && debugNodes.length > 0 && debugEdges && debugEdges.length > 0) {
        console.log('🔍 GraphPersistenceService: Using debug state with', debugNodes.length, 'nodes and', debugEdges.length, 'edges (PRIORITY 2)');
        return GraphExportImportService.exportGraphToFile(name, debugNodes, debugEdges);
      }
    } catch (e) {
      console.warn('🔍 GraphPersistenceService: Failed to access debug state:', e);
    }
    
    // PRIORITY 3: Use passed parameters as last resort
    console.log('🔍 GraphPersistenceService: Using passed parameters (PRIORITY 3) -', nodes?.length || 0, 'nodes and', edges?.length || 0, 'edges');
    return GraphExportImportService.exportGraphToFile(name, nodes, edges);
  }

  static async importGraphFromFile(file: File): Promise<GraphData | null> {
    return GraphExportImportService.importGraphFromFile(file);
  }

  // Methods to prepare nodes for loading
  static prepareNodesForLoading(nodes: Node[]): Node[] {
    return GraphNodeProcessor.prepareNodesForLoading(nodes);
  }

  static prepareEdgesForLoading(edges: Edge[]): Edge[] {
    // First normalize the handle IDs to match our current application expectations
    const normalizedEdges = GraphNodeProcessor.normalizeHandleIds(edges);
    // Then prepare them for loading
    return GraphNodeProcessor.prepareEdgesForLoading(normalizedEdges);
  }
}
