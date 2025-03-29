import Home from './pages/Home';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Memory Challenge Game</h1>
      </header>
      <main className="game-container">
        <Home />
      </main>
    </div>
  );
}

export default App;