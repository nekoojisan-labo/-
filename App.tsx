import React from 'react';
import { GameCanvas } from './components/GameCanvas';

const App: React.FC = () => {
  return (
    <div className="w-full h-full bg-stone-950 flex items-center justify-center">
      <GameCanvas />
    </div>
  );
};

export default App;
