
import { useCallback } from 'react';
import { toast } from "@/hooks/use-toast";
import { getFiveQIValueById } from "@/utils/flowData/utils/fiveQIUtils";

/**
 * Custom hook to handle 5QI node creation
 */
export function use5QINodeHandler() {
  // Handle adding 5QI nodes with specific IDs
  const handleAdd5QINode = useCallback((
    fiveQIId: string | undefined,
    onAddNode: (type: "5qi", fiveQIId?: string) => void
  ) => {
    console.log("use5QINodeHandler: Adding 5QI node with exact ID:", fiveQIId);
    
    if (!fiveQIId) {
      console.error("handleAdd5QINode was called without a valid fiveQIId");
      toast({
        title: "Missing 5QI ID",
        description: "Cannot add 5QI node without a valid ID",
        variant: "destructive"
      });
      return;
    }
    
    // Normalize to string for consistency
    const validFiveQIId = String(fiveQIId).trim();
    
    // Verify that this ID exists in our data before attempting to create the node
    const qosValue = getFiveQIValueById(validFiveQIId);
    if (!qosValue) {
      console.error(`handleAdd5QINode: No QoS data found for ID ${validFiveQIId}`);
      toast({
        title: "Invalid 5QI ID",
        description: `Could not find QoS data for ID: ${validFiveQIId}`,
        variant: "destructive"
      });
      return;
    }
    
    console.log(`use5QINodeHandler: Verified 5QI ID: ${validFiveQIId}, found data:`, qosValue);
    
    // Pass the exact ID to onAddNode
    onAddNode("5qi", validFiveQIId);
  }, []);

  return { handleAdd5QINode };
}
