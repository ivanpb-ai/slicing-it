
import { useState, useRef, useEffect } from 'react';
import { Node, Edge, ReactFlowProvider } from '@xyflow/react';
import NodeEditor from '@/components/NodeEditor';
import { toast } from 'sonner';

interface MainContentProps {
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  saveGraph: (name: string) => boolean;
  loadGraph: (name: string) => boolean;
  deleteGraph: (name: string) => boolean;
  getSavedGraphs: () => any[];
  exportGraph: (name?: string) => string | null;
  importGraph: (file: File) => void;
}

const MainContent = ({ 
  nodes, 
  edges, 
  setNodes, 
  setEdges,
  saveGraph,
  loadGraph,
  deleteGraph,
  getSavedGraphs,
  exportGraph,
  importGraph
}: MainContentProps) => {
  // Use a ref to track if we're loading
  const isLoadingRef = useRef(false);
  
  // Debug state to track nodes/edges
  const [debugInfo, setDebugInfo] = useState({ nodes: 0, edges: 0 });
  
  // Update debug info when nodes or edges change
  useEffect(() => {
    setDebugInfo({ nodes: nodes.length, edges: edges.length });
  }, [nodes.length, edges.length]);
  
  // FIXED: Create action handlers that pass the state setters to import
  const handleSave = () => {
    console.log('MainContent: Save triggered');
    return saveGraph('default');
  };

  const handleLoad = () => {
    console.log('MainContent: Load triggered');
    return loadGraph('default');
  };

  const handleExport = () => {
    console.log('MainContent: Export triggered');
    console.log('MainContent: Current state - nodes:', nodes.length, 'edges:', edges.length);
    const name = window.prompt('Enter a name for the exported file (optional):');
    return exportGraph(name || undefined);
  };

  // FIXED: Import handler that properly passes file to the import function
  const handleImport = (file: File) => {
    console.log(`MainContent: Import triggered for ${file.name}`);
    try {
      importGraph(file);
    } catch (error) {
      console.error('MainContent: Import error:', error);
      toast.error('Import failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };
  
  return (
    <main className="flex-1 relative">
      {/* Debug info overlay only in development */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="absolute top-2 left-2 z-50 bg-black/40 text-white px-2 py-1 rounded text-xs">
          Nodes: {debugInfo.nodes} | Edges: {debugInfo.edges}
        </div>
      )}
      
      <ReactFlowProvider>
        <NodeEditor 
          nodes={nodes}
          edges={edges}
          setNodes={setNodes}
          setEdges={setEdges}
          saveGraph={handleSave}
          loadGraph={handleLoad}
          exportGraph={handleExport}
          importGraph={handleImport}
          deleteGraph={deleteGraph}
          getSavedGraphs={getSavedGraphs}
        />
      </ReactFlowProvider>
    </main>
  );
};

export default MainContent;
