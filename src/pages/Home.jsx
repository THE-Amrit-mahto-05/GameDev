import { useState, useEffect, useRef, useCallback } from 'react';
import GameInfo from '../components/GameInfo/GameInfo';
import { initializeNumbers, getMemoryNumbers, getTestNumbers, calculateScore } from '../utils/gameLogic';
import './Home.css';

const MAX_LEVEL = 10;

const Home = () => {
  const [allNumbers] = useState(initializeNumbers());
  const [memoryNumbers, setMemoryNumbers] = useState([]);
  const [testNumbers, setTestNumbers] = useState([]);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState('memorize');
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'complete', 'ready'
  const timerRef = useRef(null);

  const resetGame = useCallback(() => {
    setLevel(1);
    setScore(0);
    setGameStatus('ready');
    setMemoryNumbers([]);
    setTestNumbers([]);
    setSelectedNumbers([]);
    setTimeLeft(10);
  }, []);

  const startGame = useCallback(() => {
    setGameStatus('playing');
    const initialNumbers = getMemoryNumbers(allNumbers, 1);
    setMemoryNumbers(initialNumbers);
    setPhase('memorize');
    setTimeLeft(10);
  }, [allNumbers]);

  const startLevel = useCallback((currentLevel) => {
    if (currentLevel > MAX_LEVEL) {
      setGameStatus('complete');
      return;
    }
    const newMemoryNumbers = getMemoryNumbers(allNumbers, currentLevel);
    setMemoryNumbers(newMemoryNumbers);
    setPhase('memorize');
    setSelectedNumbers([]);
    setTimeLeft(10);
    setLevel(currentLevel);
  }, [allNumbers]);

  const showTestNumbers = useCallback(() => {
    const newTestNumbers = getTestNumbers(memoryNumbers, allNumbers);
    setTestNumbers(newTestNumbers);
    setPhase('test');
    setTimeLeft(10);
  }, [memoryNumbers, allNumbers]);

  const endTestPhase = useCallback(() => {
    const correctCount = selectedNumbers.filter(num => 
      memoryNumbers.includes(num)
    ).length;
    
    const isLevelComplete = correctCount === memoryNumbers.length;
    
    if (isLevelComplete) {
      const newScore = score + calculateScore(level);
      setScore(newScore);
    }

    setTimeout(() => {
      if (isLevelComplete) {
        startLevel(level + 1);
      } else {
        resetGame();
      }
    }, 1500);
  }, [selectedNumbers, memoryNumbers, level, score, startLevel, resetGame]);

  // Game initialization
  useEffect(() => {
    resetGame();
    return () => clearTimeout(timerRef.current);
  }, [resetGame]);

  // Timer logic
  useEffect(() => {
    if (gameStatus === 'playing' && (phase === 'memorize' || phase === 'test')) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            if (phase === 'memorize') {
              showTestNumbers();
            } else {
              endTestPhase();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [gameStatus, phase, showTestNumbers, endTestPhase]);

  const handleNumberClick = (number) => {
    if (phase !== 'test' || selectedNumbers.includes(number)) return;
    setSelectedNumbers(prev => [...prev, number]);
  };

  if (gameStatus === 'ready') {
    return (
      <div className="game-screen">
        <div className="start-screen">
          <h2>Number Memory Challenge</h2>
          <p>Remember the numbers and select them correctly</p>
          <button onClick={startGame}>Start Game</button>
        </div>
      </div>
    );
  }

  if (gameStatus === 'complete') {
    return (
      <div className="game-screen">
        <div className="complete-screen">
          <h2>Game Complete!</h2>
          <p>Final Level: {level}</p>
          <p>Final Score: {score}</p>
          <button onClick={resetGame}>Play Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-screen">
      <GameInfo level={level} score={score} phase={phase} timeLeft={timeLeft} />
      
      {phase === 'memorize' ? (
        <div className="memory-phase">
          <h3>Memorize these {memoryNumbers.length} numbers:</h3>
          <div className="memory-cards">
            {memoryNumbers.map((number) => (
              <div key={`mem-${number}`} className="memory-card">
                {number}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="test-phase">
          <h3>Select the {memoryNumbers.length} numbers you saw:</h3>
          <div className="test-cards">
            {testNumbers.map((number) => (
              <div
                key={`test-${number}`}
                className={`test-card ${
                  selectedNumbers.includes(number)
                    ? memoryNumbers.includes(number)
                      ? 'correct'
                      : 'wrong'
                    : ''
                }`}
                onClick={() => handleNumberClick(number)}
              >
                {number}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;