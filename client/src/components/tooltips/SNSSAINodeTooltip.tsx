import React, { useState, useEffect } from 'react';

interface TooltipPosition {
  x: number;
  y: number;
}

const SNSSAINodeTooltip: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleShowTooltip = (event: CustomEvent) => {
      const { position: nodePosition } = event.detail;
      
      // Calculate tooltip position relative to the node
      // Use smaller offset to keep tooltip closer to node
      let tooltipX = nodePosition.x + 120; // Closer offset to the right
      let tooltipY = nodePosition.y + 20;   // Closer offset below
      
      // If node is off-screen (negative x or very high y), position tooltip in viewport
      if (nodePosition.x < 0 || nodePosition.y > window.innerHeight) {
        // Position tooltip in center-right of viewport when node is off-screen
        tooltipX = window.innerWidth / 2;
        tooltipY = window.innerHeight / 2;
      }
      
      // Keep tooltip on screen with minimum 10px margin
      tooltipX = Math.max(10, Math.min(tooltipX, window.innerWidth - 350)); // Account for tooltip width
      tooltipY = Math.max(10, Math.min(tooltipY, window.innerHeight - 120)); // Account for tooltip height
      
      setPosition({
        x: tooltipX,
        y: tooltipY
      });
      
      setIsVisible(true);
      
      // Auto-hide after 7 seconds (longer text needs more time)
      setTimeout(() => {
        setIsVisible(false);
      }, 7000);
    };

    // Listen for the custom event
    window.addEventListener('show-snssai-tooltip', handleShowTooltip as EventListener);

    return () => {
      window.removeEventListener('show-snssai-tooltip', handleShowTooltip as EventListener);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, 0)' // Center horizontally
      }}
    >
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg px-4 py-3 max-w-sm">
        <div className="flex items-start space-x-2">
          <div className="bg-orange-100 rounded-full p-1 flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 mb-1">
              S-NSSAI Node Created
            </div>
            <div className="text-xs text-gray-600">
              Please drag one or more DNN nodes onto this S-NSSAI node to indicate which slice supports a particular DNN. Also fill in the slice Service Differentiator and Slice Service Type information.
            </div>
          </div>
        </div>
        {/* Arrow pointing to the node */}
        <div className="absolute -left-2 top-4 transform -translate-y-1/2">
          <div className="w-0 h-0 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-white"></div>
          <div className="w-0 h-0 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-gray-300 absolute top-0 -left-px"></div>
        </div>
      </div>
    </div>
  );
};

export default SNSSAINodeTooltip;