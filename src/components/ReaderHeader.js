// src/components/ReaderHeader.js
import React from 'react';

// This component is now just a button to toggle the ReaderMenu
function ReaderHeader({ onToggleMenu }) {
  return (
    <button
      onClick={onToggleMenu}
      className="fixed top-4 right-4 z-50 bg-gray-800 hover:bg-gray-700 text-white font-bold p-3 rounded-full shadow-lg transition duration-300 ease-in-out flex items-center justify-center text-xl"
      aria-label="Open Reader Menu"
      title="Open Reader Menu"
    >
      <i className="fas fa-bars"></i> {/* Font Awesome bars icon for menu */}
    </button>
  );
}

export default ReaderHeader;