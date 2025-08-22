
import { useToast } from "@/hooks/use-toast";

/**
 * Component that handles flow errors with appropriate feedback
 */
const FlowErrorHandler = () => {
  const { toast } = useToast();
  
  const handleFlowError = (error: any) => {
    console.error("ReactFlow error:", error);
    if (typeof error === 'string' && 
        !error.includes('008') && 
        !error.includes('edge') && 
        !error.includes('connection')) {
      toast({
        title: "Flow Error",
        description: "An error occurred in the flow renderer.",
        variant: "destructive"
      });
    }
  };
  
  return { handleFlowError };
};

export default FlowErrorHandler;
