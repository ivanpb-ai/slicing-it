
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NetworkNodeTooltip from "@/components/tooltips/NetworkNodeTooltip";
import CellAreaNodeTooltip from "@/components/tooltips/CellAreaNodeTooltip";
import RRPNodeTooltip from "@/components/tooltips/RRPNodeTooltip";
import RRPMemberNodeTooltip from "@/components/tooltips/RRPMemberNodeTooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <NetworkNodeTooltip />
      <CellAreaNodeTooltip />
      <RRPNodeTooltip />
      <RRPMemberNodeTooltip />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
