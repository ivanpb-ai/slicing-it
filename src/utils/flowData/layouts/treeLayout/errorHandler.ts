
import { Node } from "@xyflow/react";
import { createFallbackGridLayout } from "./fallbackLayoutHandler";

/**
 * Handles errors in tree layout processing and applies fallback layout when needed
 */
export function handleLayoutError(
  error: unknown, 
  nodes: Node[]
): Node[] {
  console.error("Error in tree layout algorithm:", error);
  
  // Check if error is related to node tier positioning
  if (error instanceof Error) {
    if (error.message.includes('tier') || error.message.includes('hierarchy')) {
      console.warn("Hierarchy/tier-related layout error, applying fallback grid layout");
    }
  }
  
  // Apply fallback grid layout as last resort
  return createFallbackGridLayout(nodes);
}
