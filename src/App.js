import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Find the root element in index.html
const container = document.getElementById('root');
// Create a root
const root = createRoot(container);
// Render the App component
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// src/App.js
import React from 'react';
import ReaderPage from './pages/ReaderPage'; // Assuming ReaderPage is in src/pages

function App() {
  // Simple routing based on URL path for MPA style
  const path = window.location.pathname;
  const pathSegments = path.split('/').filter(Boolean); // e.g., ["tsumi-to-batsu-no-spica", "21"]

  // If there are two segments, it's likely a reader page (slug/chapterKey)
  if (pathSegments.length === 2) {
    return <ReaderPage />;
  }

  // Otherwise, render a simple home page or series list (you can expand this)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-4">
      <h1 className="text-4xl font-bold mb-6 text-indigo-400">Welcome to Aphrodite Scans!</h1>
      <p className="text-lg text-gray-300 mb-8 text-center">
        Navigate to a manga series and chapter using the URL format: <br />
        <code className="bg-gray-800 p-2 rounded-md">/manga-slug/chapter-key</code>
      </p>
      <div className="flex flex-col space-y-4">
        <a
          href="/tsumi-to-batsu-no-spica/21"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Read Tsumi to Batsu no Spica Chapter 21
        </a>
        <a
          href="/olympia-of-infidelity/1"
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Read Olympia of Infidelity Chapter 1
        </a>
      </div>
    </div>
  );
}

export default App;