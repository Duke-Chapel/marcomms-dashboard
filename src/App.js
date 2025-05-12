// Correct import statement for your file structure
import React from 'react';
import './App.css';
import MarketingDashboard from './components/MarketingDashboard.js';
// Note: adding the .js extension explicitly can help resolve the issue

function App() {
  return (
    <div className="App">
      <MarketingDashboard />
    </div>
  );
}

export default App;