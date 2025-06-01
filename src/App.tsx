import React, { useState } from 'react';
import WelcomePage from './components/WelcomePage';
import ChatBot from './components/ChatBot';

function App() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="min-h-screen">
      {!showChat ? (
        <WelcomePage onEnterChat={() => setShowChat(true)} />
      ) : (
        <ChatBot onBack={() => setShowChat(false)} />
      )}
    </div>
  );
}

export default App;
