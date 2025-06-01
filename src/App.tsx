import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LogtoProvider, LogtoConfig } from '@logto/react';
import Home from './pages/Home';
import Callback from './pages/Callback';

const config: LogtoConfig = {
  endpoint: 'https://logto.mja.lat/',
  appId: 'o8iv2f0bi5a7bfy22i662',
};

function App() {
  return (
    <LogtoProvider config={config}>
      <Router>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/callback" element={<Callback />} />
          </Routes>
        </div>
      </Router>
    </LogtoProvider>
  );
}

export default App;
