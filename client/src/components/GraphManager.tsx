import React, { useRef } from 'react';
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';
import { useGraphManager } from '@/hooks/useGraphManager';

interface GraphManagerProps {
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

const GraphManager: React.FC<GraphManagerProps> = ({ nodes, edges, setNodes, setEdges }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    saveGraph,
    loadGraph,
    getSavedGraphs,
    deleteGraph,
    exportGraph,
    importGraph,
    isLoading
  } = useGraphManager();
  
  // Handle save graph
  const handleSaveGraph = () => {
    const name = window.prompt('Enter a name for the graph:');
    
    if (!name) {
      return;
    }
    
    // Log the graph data before saving
    console.log(`GraphManager: Saving graph "${name}" with ${nodes.length} nodes and ${edges.length} edges`);
    
    if (nodes.length === 0 && edges.length === 0) {
      toast.warning('Cannot save an empty graph');
      return;
    }
    
    saveGraph(name, nodes, edges);
  };
  
  // Handle load graph
  const handleLoadGraph = () => {
    // Get saved graphs
    const savedGraphs = getSavedGraphs();
    
    if (savedGraphs.length === 0) {
      toast.error('No saved graphs found');
      return;
    }
    
    // Show available graph names
    const graphNames = savedGraphs.map(g => g.name).join(', ');
    const promptMessage = `Enter the name of the graph to load.\nAvailable graphs: ${graphNames}`;
    
    const name = window.prompt(promptMessage);
    
    if (!name) {
      return;
    }
    
    // Check if the graph exists
    const graphExists = savedGraphs.some(g => g.name === name);
    
    if (!graphExists) {
      toast.error(`Graph "${name}" not found`);
      return;
    }
    
    // Load the graph
    loadGraph(name, setNodes, setEdges);
  };
  
  // Handle export graph
  const handleExportGraph = () => {
    const name = window.prompt('Enter a name for the exported file (optional):');
    
    // If a name is provided, try to load and export that saved graph
    if (name && name.trim() !== '') {
      const savedGraphs = getSavedGraphs();
      const graphExists = savedGraphs.some(g => g.name === name);
      
      if (graphExists) {
        exportGraph(name, [], []);
        return;
      }
    }
    
    // Otherwise export the current graph
    exportGraph(undefined, nodes, edges);
  };
  
  // Handle import graph
  const handleImportGraph = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    
    if (!files || files.length === 0) {
      return;
    }
    
    const file = files[0];
    
    if (file.type !== 'application/json') {
      toast.error('Please select a JSON file');
      return;
    }
    
    importGraph(file, setNodes, setEdges);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle delete graph
  const handleDeleteGraph = () => {
    // Get saved graphs
    const savedGraphs = getSavedGraphs();
    
    if (savedGraphs.length === 0) {
      toast.error('No saved graphs found');
      return;
    }
    
    // Show available graph names
    const graphNames = savedGraphs.map(g => g.name).join(', ');
    const promptMessage = `Enter the name of the graph to delete.\nAvailable graphs: ${graphNames}`;
    
    const name = window.prompt(promptMessage);
    
    if (!name) {
      return;
    }
    
    // Delete the graph
    deleteGraph(name);
  };
  
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2">
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          onClick={handleSaveGraph}
          disabled={isLoading}
        >
          Save Graph
        </button>
        
        <button 
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          onClick={handleLoadGraph}
          disabled={isLoading}
        >
          Load Graph
        </button>
      </div>
      
      <div className="flex flex-row gap-2">
        <button 
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
          onClick={handleExportGraph}
          disabled={isLoading}
        >
          Export Graph
        </button>
        
        <button 
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          Import Graph
        </button>
        
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleImportGraph}
          accept=".json"
          className="hidden"
        />
        
        <button 
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          onClick={handleDeleteGraph}
          disabled={isLoading}
        >
          Delete Graph
        </button>
      </div>
      
      {isLoading && (
        <div className="text-center py-2 font-semibold text-blue-600">Loading...</div>
      )}
    </div>
  );
};

export default GraphManager;
