
import React from 'react';

const Header = () => {
  return (
    <header className="p-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm z-10">
      <div className="container flex items-center justify-between">
        <h1 className="text-xl font-medium text-gray-800">5G Network Slicer</h1>
        <div className="text-sm text-gray-500">
          Create, connect, and visualize 5G network slices
        </div>
      </div>
    </header>
  );
};

export default Header;
