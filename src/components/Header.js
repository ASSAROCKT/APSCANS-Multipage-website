// src/components/Header.js

import React from 'react';

// Header Component
function Header() {
  return (
    <header className="bg-black text-white p-4 shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Website Name/Logo */}
        <div className="flex items-center mb-4 md:mb-0">
          {/* Changed onClick to href for MPA navigation */}
          <a href="/" className="text-2xl font-bold text-indigo-400 hover:text-indigo-300 transition duration-300 ease-in-out">
            Aphrodite Scans
          </a>
        </div>

        {/* Navigation and Socials */}
        <nav className="flex flex-wrap justify-center md:justify-end items-center space-x-6">
          {/* About Page Link - ensure public/about.html exists */}
          <a href="/about.html" className="text-gray-300 hover:text-white transition duration-300 ease-in-out">
            About
          </a>

          {/* Social Icons */}
          <div className="flex space-x-4">
            {/* Discord */}
            <a href="https://discord.gg/x22HkcVKHT" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition duration-300 ease-in-out">
              <i className="fab fa-discord text-2xl"></i>
            </a>
            {/* Ko-fi */}
            <a href="https://ko-fi.com/aphroditescans" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition duration-300 ease-in-out">
              <i className="fas fa-mug-hot text-2xl"></i>
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;