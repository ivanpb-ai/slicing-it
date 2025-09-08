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
      console.log('🎯 SNSSAINodeTooltip: Received show-snssai-tooltip event', event.detail);
      const { position: nodePosition } = event.detail;
      
      // Calculate tooltip position relative to the node
      // Offset it to appear to the right and slightly below the node
      setPosition({
        x: nodePosition.x + 200, // Offset to the right
        y: nodePosition.y + 50   // Offset below
      });
      
      console.log('🎯 SNSSAINodeTooltip: Setting visible and position:', { x: nodePosition.x + 200, y: nodePosition.y + 50 });
      setIsVisible(true);
      
      // Auto-hide after 7 seconds (longer text needs more time)
      setTimeout(() => {
        setIsVisible(false);
      }, 7000);
    };

    console.log('🎯 SNSSAINodeTooltip: Adding event listener for show-snssai-tooltip');
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