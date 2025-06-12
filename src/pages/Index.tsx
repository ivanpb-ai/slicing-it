
import { Toaster } from "sonner";
import { ReactFlowProvider } from "@xyflow/react";
import { Node, Edge } from "@xyflow/react";
import { useState, useEffect, useRef } from "react";
import Header from "@/components/layout/Header";
import MainContent from "@/components/layout/MainContent";
import { toast } from "sonner";

const Index = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  
  // Track initialization status to prevent infinite rendering loops
  const [isInitialized, setIsInitialized] = useState(false);
  // Add loading state to prevent duplicate operations
  const [isLoading, setIsLoading] = useState(false);
  
  // ADDED: Listen for loading events to update isLoading state
  useEffect(() => {
    const handleLoadingCompleted = () => {
      console.log('Index: Loading completed event received');
      setIsLoading(false);
    };
    
    const handleLoadingReset = () => {
      console.log('Index: Loading reset event received');
      setIsLoading(false);
    };
    
    window.addEventListener('loading-completed', handleLoadingCompleted);
    window.addEventListener('loading-reset', handleLoadingReset);
    window.addEventListener('loading-timeout', handleLoadingReset);
    
    return () => {
      window.removeEventListener('loading-completed', handleLoadingCompleted);
      window.removeEventListener('loading-reset', handleLoadingReset);
      window.removeEventListener('loading-timeout', handleLoadingReset);
    };
  }, []);
  
  // Debug effect to monitor nodes changes
  useEffect(() => {
    console.log(`Index component: nodes state updated, count: ${nodes.length}`);
    if (nodes.length > 0) {
      console.log('Index component: First node:', JSON.stringify(nodes[0]));
      
      // Store nodes in global debug variable for emergency access
      try {
        // @ts-ignore - This is for debugging only
        window.__DEBUG_NODE_EDITOR_NODES = [...nodes];
      } catch (e) {
        // Ignore errors in debug code
      }
    }
  }, [nodes]);
  
  // Debug effect to monitor edges changes
  useEffect(() => {
    console.log(`Index component: edges state updated, count: ${edges.length}`);
    if (edges.length > 0) {
      console.log('Index component: First edge:', JSON.stringify(edges[0]));
      
      // Store edges in global debug variable for emergency access
      try {
        // @ts-ignore - This is for debugging only
        window.__DEBUG_NODE_EDITOR_EDGES = [...edges];
        console.log('Index: Updated __DEBUG_NODE_EDITOR_EDGES with', edges.length, 'edges');
        
        // IMPROVED: Also store a backup of valid edges for recovery
        if (edges.length > 0) {
          // @ts-ignore - This is for debugging only
          window.__DEBUG_LAST_EDGES = [...edges];
        }
      } catch (e) {
        // Ignore errors in debug code
      }
    }
  }, [edges]);
  
  // Display a welcome toast when the app loads
  useEffect(() => {
    if (!isInitialized && !isLoading) {
      toast.info('Welcome to the Network Flow Designer', {
        duration: 5000,
        position: 'bottom-right'
      });
      setIsInitialized(true);
    }
  }, [isInitialized, isLoading]);
  
  // Wrap the component in ReactFlowProvider to ensure all React Flow hooks work
  return (
    <div className="h-screen w-screen flex flex-col">
      <ReactFlowProvider>
        <Header />
        {/* We will load and manage the graph operations inside MainContent */}
        <MainContentWithGraphOperations 
          nodes={nodes}
          edges={edges}
          setNodes={setNodes}
          setEdges={setEdges}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      </ReactFlowProvider>
      
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: "glass-panel",
          style: {
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "#1f2937",
          },
        }}
      />
    </div>
  );
};

// This component will initialize the graph operations inside the ReactFlowProvider context
const MainContentWithGraphOperations = ({ 
  nodes, 
  edges, 
  setNodes, 
  setEdges,
  isLoading,
  setIsLoading
}: { 
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  // Create a ref to track edges for debugging
  const edgesRef = useRef<Edge[]>(edges);
  
  // Update the ref when edges change
  useEffect(() => {
    edgesRef.current = edges;
    console.log('MainContentWithGraphOperations: edges updated', edges.length);
    
    // Make sure the debug global variable gets updated
    try {
      // FIXED: Create a copy of edges to avoid reference issues
      // @ts-ignore - This is for debugging only
      window.__DEBUG_NODE_EDITOR_EDGES = [...edges];
      console.log('MainContentWithGraphOperations: Updated global debug edges with', edges.length, 'edges');
      
      // IMPROVED: Store a backup of valid edges for recovery
      if (edges.length > 0) {
        // @ts-ignore - This is for debugging only
        window.__DEBUG_LAST_EDGES = [...edges];
      }
    } catch (e) {
      console.error('Failed to update global debug edges:', e);
    }
  }, [edges]);
  
  // Now useSaveLoadGraph is safely used within the ReactFlowProvider context
  const { 
    saveGraph, 
    loadGraph, 
    deleteGraph, 
    getSavedGraphs, 
    exportGraph, 
    importGraph 
  } = useSaveLoadGraph(nodes, edges, setNodes, setEdges, isLoading, setIsLoading);
  
  return (
    <MainContent 
      nodes={nodes}
      edges={edges}
      setNodes={setNodes}
      setEdges={setEdges}
      saveGraph={saveGraph}
      loadGraph={loadGraph}
      deleteGraph={deleteGraph}
      getSavedGraphs={getSavedGraphs}
      exportGraph={exportGraph}
      importGraph={importGraph}
    />
  );
};

// Dynamically import the hook to ensure it's only used within the ReactFlowProvider context
import { useSaveLoadGraph } from "@/hooks/useSaveLoadGraph";

export default Index;
