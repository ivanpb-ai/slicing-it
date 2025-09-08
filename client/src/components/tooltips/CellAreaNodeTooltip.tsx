import React, { useState, useEffect } from 'react';

interface TooltipPosition {
  x: number;
  y: number;
}

const CellAreaNodeTooltip: React.FC = () => {
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
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };

    // Listen for the custom event
    window.addEventListener('show-cell-area-tooltip', handleShowTooltip as EventListener);

    return () => {
      window.removeEventListener('show-cell-area-tooltip', handleShowTooltip as EventListener);
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
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg px-4 py-3 max-w-xs">
        <div className="flex items-start space-x-2">
          <div className="bg-blue-100 rounded-full p-1 flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 mb-1">
              TAC Node Created
            </div>
            <div className="text-xs text-gray-600">
              Please drag RRP nodes onto the Cell Area node to associate radio resource partititions with this area
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

export default CellAreaNodeTooltip;