
import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LucideIcon } from "lucide-react";

interface ActionButtonProps {
  label: string;
  icon: LucideIcon;
  iconColor: string;
  tooltipTitle: string;
  tooltipDescription: string;
  onClick: () => void;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  icon: Icon,
  iconColor,
  tooltipTitle,
  tooltipDescription,
  onClick,
  disabled = false
}) => {
  return (
    <div className="flex flex-col items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              console.log('🔥 ARRANGE BUTTON CLICKED - Starting debug trace');
              onClick();
              console.log('🔥 ARRANGE BUTTON CLICK HANDLER COMPLETED');
            }}
            disabled={disabled}
            className="h-8 w-8 mb-1"
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

export default ActionButton;
