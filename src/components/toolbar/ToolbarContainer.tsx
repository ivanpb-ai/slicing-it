
import { useState, useEffect, useCallback } from "react";
import ToolbarHeader from "./ToolbarHeader";
import NodeButtonsGrid from "./NodeButtonsGrid";
import EditButtonsGrid from "./EditButtonsGrid";
import CanvasButtonsGrid from "./CanvasButtonsGrid";
import { Separator } from "@/components/ui/separator";

interface ToolbarContainerProps {
  onAddNode: (type: "network" | "cell-area" | "rrp" | "s-nssai" | "dnn" | "5qi", fiveQIId?: string) => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onClearCanvas: () => void;
  onInitializeCanvas: () => void;
  onArrangeLayout?: () => void;
  hasSelectedElements: boolean;
}

const ToolbarContainer: React.FC<ToolbarContainerProps> = ({
  onAddNode,
  onDeleteSelected,
  onDuplicateSelected,
  onClearCanvas,
  onInitializeCanvas,
  onArrangeLayout,
  hasSelectedElements,
}) => {
  const [position, setPosition] = useState({ x: 20, y: 70 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const ensureVisibility = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      setPosition(prev => ({
        x: Math.min(Math.max(20, prev.x), viewportWidth - 300),
        y: Math.min(Math.max(20, prev.y), viewportHeight - 100)
      }));
    };

    ensureVisibility();
    window.addEventListener('resize', ensureVisibility);
    
    return () => {
      window.removeEventListener('resize', ensureVisibility);
    };
  }, []);

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = position.x;
    const startPosY = position.y;
    
    const handleMouseMove = (e: MouseEvent) => {
      const newX = startPosX + (e.clientX - startX);
      const newY = startPosY + (e.clientY - startY);
      
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      setPosition({ 
        x: Math.min(Math.max(0, newX), viewportWidth - 300),
        y: Math.min(Math.max(0, newY), viewportHeight - 100)
      });
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Add a dedicated handler for clear canvas
  const handleClearCanvas = useCallback(() => {
    console.log("Clear canvas button clicked in Toolbar");
    try {
      onClearCanvas();
    } catch (error) {
      console.error("Error in clear canvas operation:", error);
    }
  }, [onClearCanvas]);

  return (
    <div 
      className="fixed flex flex-col space-y-2 bg-white p-3 rounded-lg shadow-md border border-gray-200 z-50"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        width: '280px',
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      <ToolbarHeader onDragStart={handleDragStart} />
      
      <NodeButtonsGrid onAddNode={onAddNode} />
      
      <Separator className="my-1" />
      
      <div className="text-xs font-medium text-gray-700 mb-1">Edit Elements</div>
      
      <EditButtonsGrid 
        onDeleteSelected={onDeleteSelected}
        onDuplicateSelected={onDuplicateSelected}
        hasSelectedElements={hasSelectedElements}
      />

      <Separator className="my-1" />
      
      <div className="text-xs font-medium text-gray-700 mb-1">Canvas Options</div>
      
      <CanvasButtonsGrid 
        onClearCanvas={handleClearCanvas}
        onInitializeCanvas={onInitializeCanvas}
        onArrangeLayout={onArrangeLayout}
      />
      
      <div className="text-[9px] text-muted-foreground px-1 mt-1">
        <p>❓ Tip: Drag nodes to create connections (Network → Cell Area → RRP → S-NSSAI → DNN → 5QI)</p>
      </div>
    </div>
  );
};

export default ToolbarContainer;
