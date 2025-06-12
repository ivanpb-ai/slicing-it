
import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LucideIcon } from "lucide-react";

interface NodeButtonProps {
  type: "network" | "cell-area" | "rrp" | "s-nssai" | "dnn";
  label: string;
  icon: LucideIcon;
  iconColor: string;
  tooltipTitle: string;
  tooltipDescription: string;
  onAddNode: (type: "network" | "cell-area" | "rrp" | "s-nssai" | "dnn" | "5qi", fiveQIId?: string) => void;
}

const NodeButton: React.FC<NodeButtonProps> = ({
  type,
  label,
  icon: Icon,
  iconColor,
  tooltipTitle,
  tooltipDescription,
  onAddNode
}) => {
  // Click handler
  const handleClick = () => {
    console.log(`NodeButton: Clicked on ${type} button`);
    onAddNode(type);
  };
  
  // Enhanced drag handler with proper data format
  const handleDragStart = (event: React.DragEvent<HTMLButtonElement>) => {
    console.log(`NodeButton: Started dragging ${type} button`);
    
    // Set multiple data formats for better compatibility
    event.dataTransfer.setData('text/plain', type);
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.setData('application/node-type', type);
    event.dataTransfer.effectAllowed = 'copy';
    
    console.log(`NodeButton: Set drag data to: ${type}`);
  };

  return (
    <div className="flex flex-col items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleClick}
            draggable={true}
            onDragStart={handleDragStart}
            className="h-8 w-8 mb-1 cursor-grab active:cursor-grabbing"
          >
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" align="start" className="font-normal">
          <p className="font-medium">{tooltipTitle}</p>
          <p className="text-xs text-muted-foreground">{tooltipDescription}</p>
        </TooltipContent>
      </Tooltip>
      <span className="text-[9px] text-center">{label}</span>
    </div>
  );
};

export default NodeButton;
