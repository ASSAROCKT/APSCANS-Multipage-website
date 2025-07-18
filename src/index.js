import React from 'react';
import ReactDOM from 'react-dom/client';
import HomePage from './pages/HomePage'; // Import the new HomePage component

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HomePage />
  </React.StrictMode>
);