import React, { useState, useEffect } from 'react';

interface TooltipPosition {
  x: number;
  y: number;
}

const RRPNodeTooltip: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleShowTooltip = (event: CustomEvent) => {
      const { position: nodePosition } = event.detail;
      
      // Calculate tooltip position relative to the node
      // Offset it to appear to the right and slightly below the node
      setPosition({
        x: nodePosition.x + 200, // Offset to the right
        y: nodePosition.y + 50   // Offset below
      });
      
      setIsVisible(true);
      
      // Auto-hide after 6 seconds (longer text needs more time)
      setTimeout(() => {
        setIsVisible(false);
      }, 6000);
    };

    // Listen for the custom event
    window.addEventListener('show-rrp-tooltip', handleShowTooltip as EventListener);

    return () => {
      window.removeEventListener('show-rrp-tooltip', handleShowTooltip as EventListener);
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
          <div className="bg-green-100 rounded-full p-1 flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 mb-1">
              RRP Node Created
            </div>
            <div className="text-xs text-gray-600">
              You can name this RRP, e.g. 'Premium'. Also please create RRP member nodes that belong to this RRP node by adding one or PLMN IDs
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

export default RRPNodeTooltip;