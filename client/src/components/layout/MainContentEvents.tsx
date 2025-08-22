
import { useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';

interface MainContentEventsProps {
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

const MainContentEvents: React.FC<MainContentEventsProps> = ({ 
  nodes, 
  edges, 
  setNodes, 
  setEdges 
}) => {
  // Listen for events from child components
  useEffect(() => {
    const handleCanvasCleared = () => {
      console.log('Canvas cleared event received in MainContentEvents');
      // Make sure state is reset at this level too
      setNodes([]);
      setEdges([]);
    };
    
    window.addEventListener('canvas-cleared', handleCanvasCleared);
    
    return () => {
      window.removeEventListener('canvas-cleared', handleCanvasCleared);
    };
  }, [setNodes, setEdges]);
  
  // Listen for export-current-graph event
  useEffect(() => {
    const handleExportCurrentGraph = (event: CustomEvent) => {
      const callback = event.detail?.callback;
      if (callback && typeof callback === 'function') {
        const graphData = JSON.stringify({ 
          nodes, 
          edges, 
          exportTime: Date.now() 
        }, null, 2);
        callback(graphData);
      }
    };
    
    window.addEventListener('export-current-graph', handleExportCurrentGraph as EventListener);
    
    return () => {
      window.removeEventListener('export-current-graph', handleExportCurrentGraph as EventListener);
    };
  }, [nodes, edges]);

  // This component doesn't render anything
  return null;
};

export default MainContentEvents;
