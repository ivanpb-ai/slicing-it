import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LucideIcon, Search } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { fiveQIValues } from "@/utils/flowData/data/fiveQIData";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FiveQINodeButtonProps {
  icon: LucideIcon;
  iconColor: string;
  onSelect: (fiveQIId: string) => void;
}

const FiveQINodeButton: React.FC<FiveQINodeButtonProps> = ({
  icon: Icon,
  iconColor,
  onSelect
}) => {
  // State for search input
  const [searchQuery, setSearchQuery] = useState("");
  
  // Group and filter 5QI values based on search query
  const groupedAndFilteredValues = useMemo(() => {
    // Convert search query to lowercase for case-insensitive comparison
    const query = searchQuery.toLowerCase();
    
    // Filter values based on search query
    const filteredValues = fiveQIValues.filter(qos => 
      qos.value.toLowerCase().includes(query) || 
      qos.service.toLowerCase().includes(query) || 
      qos.resourceType.toLowerCase().includes(query)
    );
    
    // Group by resource type
    return {
      GBR: filteredValues.filter(qos => qos.resourceType === "GBR"),
      NonGBR: filteredValues.filter(qos => qos.resourceType === "Non-GBR")
    };
  }, [searchQuery]);
  
  const handleClick = (fiveQIId: string) => {
    console.log(`FiveQINodeButton: Selected 5QI ${fiveQIId}`);
    onSelect(fiveQIId);
  };
  
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, fiveQIId: string) => {
    console.log(`FiveQINodeButton: Started dragging 5QI ${fiveQIId}`);
    
    // Use the simple string format that the parser expects
    const dragData = `fiveqi:${fiveQIId}`;
    
    console.log(`FiveQINodeButton: Setting drag data: "${dragData}"`);
    
    // Set the drag data in the format the parser expects
    event.dataTransfer.setData('text/plain', dragData);
    event.dataTransfer.effectAllowed = 'copy';
    
    // Prevent default drag image
    const dragImage = new Image();
    dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    event.dataTransfer.setDragImage(dragImage, 0, 0);
  };

  return (
    <div className="flex flex-col items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 mb-1 cursor-pointer"
              >
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="center" className="w-64 bg-white p-0">
              <div className="p-2 sticky top-0 bg-white border-b z-10">
                <div className="flex items-center gap-2 px-2 py-1">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search 5QI values..." 
                    className="h-8 focus-visible:ring-0 border-none focus-visible:ring-offset-0 pl-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <ScrollArea className="h-[300px]">
                {/* GBR Section */}
                {groupedAndFilteredValues.GBR.length > 0 && (
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs font-medium text-blue-600 bg-blue-50">
                      GBR (Guaranteed Bit Rate)
                    </DropdownMenuLabel>
                    {groupedAndFilteredValues.GBR.map((qos) => (
                      <DropdownMenuItem 
                        key={qos.value}
                        onClick={() => handleClick(qos.value)}
                        draggable
                        onDragStart={(e) => handleDragStart(e, qos.value)}
                        className="cursor-grab active:cursor-grabbing flex justify-between items-center"
                      >
                        <div className="flex items-center">
                          <span className="font-medium mr-2 text-blue-700">{qos.value}</span>
                          <span className="text-xs truncate max-w-[140px]">{qos.service}</span>
                        </div>
                        <span className="text-xs text-gray-500">{qos.priority}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                )}
              
                {/* Separator between GBR and Non-GBR */}
                {groupedAndFilteredValues.GBR.length > 0 && 
                 groupedAndFilteredValues.NonGBR.length > 0 && 
                 <DropdownMenuSeparator />}

                {/* Non-GBR Section */}
                {groupedAndFilteredValues.NonGBR.length > 0 && (
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs font-medium text-purple-600 bg-purple-50">
                      Non-GBR (Non-Guaranteed Bit Rate)
                    </DropdownMenuLabel>
                    {groupedAndFilteredValues.NonGBR.map((qos) => (
                      <DropdownMenuItem 
                        key={qos.value}
                        onClick={() => handleClick(qos.value)}
                        draggable
                        onDragStart={(e) => handleDragStart(e, qos.value)}
                        className="cursor-grab active:cursor-grabbing flex justify-between items-center"
                      >
                        <div className="flex items-center">
                          <span className="font-medium mr-2 text-purple-700">{qos.value}</span>
                          <span className="text-xs truncate max-w-[140px]">{qos.service}</span>
                        </div>
                        <span className="text-xs text-gray-500">{qos.priority}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                )}
                
                {/* Empty state */}
                {groupedAndFilteredValues.GBR.length === 0 && 
                 groupedAndFilteredValues.NonGBR.length === 0 && (
                  <div className="py-6 text-center text-gray-500">
                    No matching 5QI values found
                  </div>
                )}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent side="right" align="start" className="font-normal">
          <p className="font-medium">5QI Node</p>
          <p className="text-xs text-muted-foreground">Quality of Service parameters for the traffic flow</p>
        </TooltipContent>
      </Tooltip>
      <span className="text-[9px] text-center">5QI</span>
    </div>
  );
};

export default FiveQINodeButton;
