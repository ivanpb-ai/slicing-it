
import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import ActionButton from "./buttons/ActionButton";
import { RotateCcw, AppWindow, Network } from "lucide-react";

interface CanvasButtonsGridProps {
  onClearCanvas: () => void;
  onInitializeCanvas: () => void;
  onArrangeLayout?: () => void;
}

const CanvasButtonsGrid: React.FC<CanvasButtonsGridProps> = ({
  onClearCanvas,
  onInitializeCanvas,
  onArrangeLayout
}) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      <TooltipProvider>
        <ActionButton 
          label="Clear"
          icon={RotateCcw}
          iconColor="text-gray-600"
          tooltipTitle="Clear Canvas"
          tooltipDescription="Remove all nodes and connections"
          onClick={onClearCanvas}
        />
        
        <ActionButton 
          label="Example"
          icon={AppWindow}
          iconColor="text-blue-600"
          tooltipTitle="Initialize Canvas"
          tooltipDescription="Load example network with all node types"
          onClick={onInitializeCanvas}
        />

        {onArrangeLayout && (
          <ActionButton 
            label="Arrange"
            icon={Network}
            iconColor="text-green-600"
            tooltipTitle="Arrange Layout"
            tooltipDescription="Automatically arrange nodes in balanced tree"
            onClick={() => {
              console.log('🎯 CanvasButtonsGrid: Arrange button clicked!');
              console.log('🎯 onArrangeLayout function:', typeof onArrangeLayout);
              if (onArrangeLayout) {
                onArrangeLayout();
              } else {
                console.log('❌ onArrangeLayout is undefined!');
              }
            }}
          />
        )}
      </TooltipProvider>
    </div>
  );
};

export default CanvasButtonsGrid;
