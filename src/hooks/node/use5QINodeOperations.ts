
import { useCallback } from 'react';
import { toast } from "sonner";
import { getFiveQIValueById } from "@/utils/flowData/utils/fiveQIUtils";
import { NodeType } from '@/types/nodeTypes';

/**
 * Custom hook for 5QI node specific operations
 */
export const use5QINodeOperations = () => {
  /**
   * Validates a 5QI ID and checks if it exists in the data
   */
  const validate5QIId = useCallback((fiveQIId?: string): string | null => {
    if (!fiveQIId) {
      console.error("Attempted to validate a 5QI node without providing an ID");
      toast.error("Missing 5QI ID", {
        description: "Cannot create 5QI node without a specific ID"
      });
      return null;
    }
    
    // CRITICAL: Use exactly the provided ID, ensuring it's a string
    const normalizedId = String(fiveQIId);
    
    // Verify that the ID exists in our data
    const qosValues = getFiveQIValueById(normalizedId);
    if (qosValues) {
      // Force the value to match the ID exactly
      qosValues.value = normalizedId;
      console.log(`use5QINodeOperations: Found QoS values for ID ${normalizedId}:`, qosValues);
      return normalizedId;
    } else {
      console.warn(`use5QINodeOperations: No QoS values found for ID ${normalizedId}`);
      toast.error(`Invalid 5QI ID: ${normalizedId}`, {
        description: "Could not find QoS data for this ID"
      });
      return null;
    }
  }, []);

  return {
    validate5QIId
  };
};
