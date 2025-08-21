
import { Toaster } from "sonner";
import { Node, Edge } from "@xyflow/react";
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import MainContent from "@/components/layout/MainContent";
import { toast } from "sonner";
import { useGraphOperations } from "@/hooks/graph/useGraphOperations";

const Index = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    saveGraph,
    loadGraph,
    deleteGraph,
    getSavedGraphs,
    getCloudGraphs,
    exportGraph,
    importGraph,
    handleLoadGraphFromData,
    isLoading
  } = useGraphOperations(nodes, edges, setNodes, setEdges);

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

  // Expose a function for Playwright to load data
  useEffect(() => {
    (window as any).loadGraphDataForTesting = (data: any) => {
      handleLoadGraphFromData(data);
    };
  }, [handleLoadGraphFromData]);

  return (
    <div className="h-screen w-screen flex flex-col">
      <Header />
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

export default Index;
