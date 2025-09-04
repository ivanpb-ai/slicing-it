
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';
import { SavedGraph } from '@/hooks/types';

// Define GraphData type for better type safety
export interface GraphData {
  nodes: Node[];
  edges: Edge[];
  name?: string;
  timestamp?: number;
}

export class GraphLocalStorageService {
  // Key used to store saved graphs in localStorage
  private static STORAGE_KEY = 'savedGraphs';

  // Save a graph to localStorage
  static saveToLocalStorage(name: string, nodes: Node[], edges: Edge[]): boolean {
    try {
      // Get existing saved graphs, initialize as empty object if none exist
      let savedGraphs = {};
      const savedGraphsStr = localStorage.getItem(this.STORAGE_KEY);
      
      if (savedGraphsStr) {
        try {
          savedGraphs = JSON.parse(savedGraphsStr);
        } catch (e) {
          console.error('Error parsing saved graphs:', e);
          savedGraphs = {};
        }
      }
      
      // Ensure savedGraphs is an object
      if (!savedGraphs || typeof savedGraphs !== 'object' || Array.isArray(savedGraphs)) {
        savedGraphs = {};
      }
      
      // Save the new graph
      savedGraphs[name] = {
        nodes,
        edges,
        timestamp: Date.now()
      };
      
      // Save back to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(savedGraphs));
      
      toast.success(`Graph "${name}" saved successfully`);
      return true;
    } catch (error) {
      console.error('Error saving graph to local storage:', error);
      toast.error('Failed to save graph');
      return false;
    }
  }

  // Get all saved graphs from localStorage
  static getLocalGraphs(): SavedGraph[] {
    try {
      const savedGraphsStr = localStorage.getItem(this.STORAGE_KEY);
      
      if (!savedGraphsStr) {
        return [];
      }
      
      const savedGraphsObj = JSON.parse(savedGraphsStr);
      
      // If there are no saved graphs or it's not an object
      if (!savedGraphsObj || typeof savedGraphsObj !== 'object') {
        return [];
      }
      
      // Convert object to array of SavedGraph objects
      const savedGraphs: SavedGraph[] = Object.entries(savedGraphsObj).map(([name, data]: [string, any]) => ({
        id: `local-${name}`,
        name,
        createdAt: data.timestamp || Date.now(),
        nodes: data.nodes || [],
        edges: data.edges || []
      }));
      
      return savedGraphs;
    } catch (error) {
      console.error('Error retrieving saved graphs:', error);
      return [];
    }
  }

  // Load a graph from localStorage
  static loadFromLocalStorage(name: string): GraphData | null {
    try {
      const savedGraphsStr = localStorage.getItem(this.STORAGE_KEY);
      
      if (!savedGraphsStr) {
        toast.error('No saved graphs found');
        return null;
      }
      
      const savedGraphs = JSON.parse(savedGraphsStr);
      
      if (!savedGraphs || typeof savedGraphs !== 'object') {
        toast.error('Invalid saved graphs data');
        return null;
      }
      
      const graphData = savedGraphs[name];
      
      if (!graphData) {
        toast.error(`Graph "${name}" not found`);
        return null;
      }
      
      toast.success(`Graph "${name}" loaded successfully with ${graphData.nodes?.length || 0} nodes and ${graphData.edges?.length || 0} edges`);
      
      return {
        nodes: graphData.nodes || [],
        edges: graphData.edges || [],
        name,
        timestamp: graphData.timestamp
      };
    } catch (error) {
      console.error('Error loading graph from local storage:', error);
      toast.error('Failed to load graph');
      return null;
    }
  }

  // Delete a graph from localStorage
  static deleteFromLocalStorage(name: string): boolean {
    try {
      const savedGraphsStr = localStorage.getItem(this.STORAGE_KEY);
      
      if (!savedGraphsStr) {
        toast.error('No saved graphs found');
        return false;
      }
      
      const savedGraphs = JSON.parse(savedGraphsStr);
      
      if (!savedGraphs || typeof savedGraphs !== 'object') {
        toast.error('Invalid saved graphs data');
        return false;
      }
      
      if (!savedGraphs[name]) {
        toast.error(`Graph "${name}" not found`);
        return false;
      }
      
      // Delete the graph
      delete savedGraphs[name];
      
      // Save back to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(savedGraphs));
      
      toast.success(`Graph "${name}" deleted successfully`);
      return true;
    } catch (error) {
      console.error('Error deleting graph from local storage:', error);
      toast.error('Failed to delete graph');
      return false;
    }
  }
}
