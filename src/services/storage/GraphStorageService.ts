import { Node, Edge, MarkerType } from '@xyflow/react';
import { toast } from 'sonner';

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
  timestamp: number;
  name?: string;
}

export interface SavedGraph {
  id: string;
  name: string;
  createdAt: number;
  nodes: Node[];
  edges: Edge[];
}

export class GraphStorageService {
  // STORAGE KEYS
  private static readonly GRAPHS_KEY = 'flowGraphs';
  private static readonly LEGACY_GRAPHS_KEY = 'savedGraphs'; // Support legacy storage key
  
  // SAVING
  static saveGraph(name: string, nodes: Node[], edges: Edge[]): boolean {
    try {
      console.log(`GraphStorageService: Saving graph "${name}" with ${nodes.length} nodes and ${edges.length} edges`);
      
      // Get saved graphs or initialize new object
      const savedGraphsStr = localStorage.getItem(this.GRAPHS_KEY);
      const savedGraphs = savedGraphsStr ? JSON.parse(savedGraphsStr) : {};
      
      // Deep clone nodes and edges to avoid reference issues
      const nodesCopy = JSON.parse(JSON.stringify(nodes));
      const edgesCopy = JSON.parse(JSON.stringify(edges));
      
      // Debug logging
      if (edgesCopy.length > 0) {
        console.log(`First edge to save:`, JSON.stringify(edgesCopy[0]));
      }
      
      // Create the graph object with cloned data
      savedGraphs[name] = {
        nodes: nodesCopy,
        edges: edgesCopy,
        timestamp: Date.now()
      };
      
      // Save to localStorage
      localStorage.setItem(this.GRAPHS_KEY, JSON.stringify(savedGraphs));
      
      console.log(`Graph "${name}" saved with ${nodesCopy.length} nodes and ${edgesCopy.length} edges`);
      toast.success(`Graph "${name}" saved successfully`);
      return true;
    } catch (error) {
      console.error('Error saving graph:', error);
      toast.error('Failed to save graph');
      return false;
    }
  }
  
  // LOADING
  static loadGraph(name: string): GraphData | null {
    try {
      console.log(`GraphStorageService: Loading graph "${name}"`);
      
      // Try both storage keys for backward compatibility
      let savedGraphs: any = null;
      let savedGraphsStr = localStorage.getItem(this.GRAPHS_KEY);
      
      if (!savedGraphsStr) {
        console.log('No graphs found in primary storage, checking legacy storage...');
        savedGraphsStr = localStorage.getItem(this.LEGACY_GRAPHS_KEY);
        
        if (!savedGraphsStr) {
          console.error('No saved graphs found in any storage location');
          toast.error('No saved graphs found');
          return null;
        }
      }
      
      try {
        savedGraphs = JSON.parse(savedGraphsStr);
      } catch (e) {
        console.error('Error parsing saved graphs:', e);
        toast.error('Invalid storage format');
        return null;
      }
      
      // Check if the graph exists
      if (!savedGraphs[name]) {
        console.error(`Graph "${name}" not found`);
        toast.error(`Graph "${name}" not found`);
        return null;
      }
      
      // Get the graph data
      const graphData = savedGraphs[name];
      
      // Ensure valid arrays for nodes and edges
      const nodes = Array.isArray(graphData.nodes) ? JSON.parse(JSON.stringify(graphData.nodes)) : [];
      const edges = Array.isArray(graphData.edges) ? JSON.parse(JSON.stringify(graphData.edges)) : [];
      
      console.log(`Loaded graph "${name}" with ${nodes.length} nodes and ${edges.length} edges`);
      
      // Normalize edges to ensure they have required properties
      const processedEdges = edges.map((edge: Edge, index: number) => ({
        id: edge.id || `edge-${Date.now()}-${index}`,
        source: String(edge.source),
        target: String(edge.target),
        sourceHandle: edge.sourceHandle ? String(edge.sourceHandle) : 'bottom-source',
        targetHandle: edge.targetHandle ? String(edge.targetHandle) : 'top-target',
        type: 'straight',
        animated: false,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
        data: {
          curvature: 0,
          shortened: true,
          shortenFactor: 0.92,
          persistent: true
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 8,
          height: 8,
          color: '#94a3b8',
        }
      }));
      
      if (processedEdges.length > 0) {
        console.log(`Processed edge sample:`, JSON.stringify(processedEdges[0]));
      }
      
      return {
        nodes,
        edges: processedEdges,
        name: name,  // Include the graph name for reference
        timestamp: graphData.timestamp || Date.now()
      };
    } catch (error) {
      console.error('Error loading graph:', error);
      toast.error('Failed to load graph');
      return null;
    }
  }
  
  // LISTING
  static getSavedGraphs(): SavedGraph[] {
    try {
      // Try both storage keys for backward compatibility
      let savedGraphs: any = {};
      const primaryGraphsStr = localStorage.getItem(this.GRAPHS_KEY);
      const legacyGraphsStr = localStorage.getItem(this.LEGACY_GRAPHS_KEY);
      
      if (primaryGraphsStr) {
        try {
          const primaryGraphs = JSON.parse(primaryGraphsStr);
          savedGraphs = { ...savedGraphs, ...primaryGraphs };
        } catch (e) {
          console.error('Error parsing primary graphs:', e);
        }
      }
      
      if (legacyGraphsStr) {
        try {
          const legacyGraphs = JSON.parse(legacyGraphsStr);
          savedGraphs = { ...savedGraphs, ...legacyGraphs };
        } catch (e) {
          console.error('Error parsing legacy graphs:', e);
        }
      }
      
      if (Object.keys(savedGraphs).length === 0) {
        // No graphs found in either storage location
        console.log('No saved graphs found');
        return [];
      }
      
      return Object.entries(savedGraphs).map(([name, data]: [string, any]) => ({
        id: `local-${name}`,
        name,
        createdAt: data.timestamp || Date.now(),
        nodes: data.nodes || [],
        edges: data.edges || []
      }));
    } catch (error) {
      console.error('Error getting saved graphs:', error);
      return [];
    }
  }

  // DELETING
  static deleteGraph(name: string): boolean {
    try {
      const savedGraphsStr = localStorage.getItem(this.GRAPHS_KEY);
      
      if (!savedGraphsStr) {
        toast.error('No saved graphs found');
        return false;
      }
      
      const savedGraphs = JSON.parse(savedGraphsStr);
      
      if (!savedGraphs[name]) {
        toast.error(`Graph "${name}" not found`);
        return false;
      }
      
      delete savedGraphs[name];
      localStorage.setItem(this.GRAPHS_KEY, JSON.stringify(savedGraphs));
      
      toast.success(`Graph "${name}" deleted successfully`);
      return true;
    } catch (error) {
      console.error('Error deleting graph:', error);
      toast.error('Failed to delete graph');
      return false;
    }
  }
  
  // EXPORTING
  static exportGraph(name: string | undefined, nodes: Node[], edges: Edge[]): string | null {
    try {
      if (name) {
        // Export a saved graph by name
        const savedGraphs = JSON.parse(localStorage.getItem(this.GRAPHS_KEY) || '{}');
        
        if (!savedGraphs[name]) {
          toast.error(`Graph "${name}" not found`);
          return null;
        }
        
        const fileName = `${name.replace(/\s+/g, '_')}_${Date.now()}.json`;
        const dataStr = JSON.stringify(savedGraphs[name], null, 2);
        
        this.downloadFile(dataStr, fileName);
        toast.success(`Graph "${name}" exported successfully`);
        return dataStr;
      } else {
        // Export current graph
        const fileName = `graph_export_${Date.now()}.json`;
        const dataStr = JSON.stringify({ nodes, edges, exportTime: Date.now() }, null, 2);
        
        this.downloadFile(dataStr, fileName);
        toast.success(`Graph exported successfully`);
        return dataStr;
      }
    } catch (error) {
      console.error('Error exporting graph:', error);
      toast.error('Failed to export graph');
      return null;
    }
  }
  
  // IMPORTING
  static async importGraph(file: File): Promise<GraphData | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const jsonData = event.target?.result as string;
          if (!jsonData) {
            toast.error('Empty file');
            reject(new Error('The imported file is empty'));
            return;
          }
          
          const parsedData = JSON.parse(jsonData);
          
          if (!parsedData.nodes) {
            toast.error('Invalid graph data');
            reject(new Error('The imported file does not contain valid nodes'));
            return;
          }
          
          // Process edges to ensure valid structure
          const processedEdges = Array.isArray(parsedData.edges) ? parsedData.edges.map((edge: Edge, index: number) => ({
            id: edge.id || `edge-${Date.now()}-${index}`,
            source: String(edge.source),
            target: String(edge.target),
            sourceHandle: edge.sourceHandle ? String(edge.sourceHandle) : undefined,
            targetHandle: edge.targetHandle ? String(edge.targetHandle) : undefined,
            type: 'default',
            animated: false,
            style: { stroke: '#94a3b8', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 15,
              height: 15,
              color: '#94a3b8',
            }
          })) : [];
          
          resolve({
            nodes: parsedData.nodes || [],
            edges: processedEdges,
            timestamp: parsedData.timestamp || parsedData.exportTime || Date.now()
          });
        } catch (error) {
          console.error('Error importing graph:', error);
          toast.error('Failed to import graph');
          reject(error);
        }
      };
      
      reader.onerror = () => {
        toast.error('Failed to read file');
        reject(new Error('The file could not be read'));
      };
      
      reader.readAsText(file);
    });
  }
  
  // Helper method to download a file
  private static downloadFile(data: string, fileName: string): void {
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(data)}`;
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', dataUri);
    downloadLink.setAttribute('download', fileName);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
}
