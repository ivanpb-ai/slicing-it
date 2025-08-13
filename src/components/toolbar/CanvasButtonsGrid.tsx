
import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import ActionButton from "./buttons/ActionButton";
import { RotateCcw, AppWindow, Network } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutType } from "@/utils/flowData/layouts";
import { Button } from "@/components/ui/button";

interface CanvasButtonsGridProps {
  onClearCanvas: () => void;
  onInitializeCanvas: () => void;
  onArrangeLayout?: (layoutType: LayoutType) => void;
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full h-full flex flex-col items-center justify-center p-1">
                <Network className="h-5 w-5 text-green-600" />
                <span className="text-xs mt-1">Arrange</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onArrangeLayout('tree')}>
                Tree Layout
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onArrangeLayout('balanced-tree')}>
                Balanced Tree
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TooltipProvider>
    </div>
  );
};

export default CanvasButtonsGrid;
