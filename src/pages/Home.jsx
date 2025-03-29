import { useState, useEffect, useRef, useCallback } from 'react';
import GameInfo from '../components/GameInfo/GameInfo';
import { initializeNumbers, getMemoryNumbers, calculateScore } from '../utils/gameLogic';
import './Home.css';

const MAX_LEVEL = 10;
const BASE_OPTIONS = 20;
const OPTIONS_INCREMENT = 5;
const MAX_WRONG_ATTEMPTS = 3;

const Home = () => {
  const [allNumbers] = useState(initializeNumbers());
  const [memoryNumbers, setMemoryNumbers] = useState([]);
  const [testNumbers, setTestNumbers] = useState([]);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState('memorize');
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(20);
  const [gameStatus, setGameStatus] = useState('playing');
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [popupMessage, setPopupMessage] = useState({ show: false, text: '', type: '' });
  const timerRef = useRef(null);
  const popupTimerRef = useRef(null);

  const showPopup = (text, type = 'info') => {
    setPopupMessage({ show: true, text, type });
    clearTimeout(popupTimerRef.current);
    popupTimerRef.current = setTimeout(() => {
      setPopupMessage({ show: false, text: '', type: '' });
    }, 2000);
  };

  const getRecallTime = useCallback((currentLevel) => {
    return 20 * currentLevel;
  }, []);

  const getTestNumbers = useCallback((memoryNums, allNums, currentLevel) => {
    const optionsCount = BASE_OPTIONS + ((currentLevel - 1) * OPTIONS_INCREMENT);
    const neededDistractors = optionsCount - memoryNums.length;
    
    const possibleDistractors = allNums.filter(num => !memoryNums.includes(num));
    
    const shuffledDistractors = [...possibleDistractors]
      .sort(() => 0.5 - Math.random())
      .slice(0, neededDistractors);
    
    return [...memoryNums, ...shuffledDistractors]
      .sort(() => 0.5 - Math.random());
  }, []);

  const resetGame = useCallback(() => {
    setLevel(1);
    setScore(0);
    setGameStatus('ready');
    setMemoryNumbers([]);
    setTestNumbers([]);
    setSelectedNumbers([]);
    setTimeLeft(20);
    setWrongAttempts(0);
    showPopup("Ready for a new challenge? Let's go!", 'info');
  }, []);

  const startGame = useCallback(() => {
    setGameStatus('playing');
    const initialNumbers = getMemoryNumbers(allNumbers, 1);
    setMemoryNumbers(initialNumbers);
    setPhase('memorize');
    setTimeLeft(20);
    setWrongAttempts(0);
    showPopup(`Level 1: Memorize ${initialNumbers.length} numbers!`, 'info');
  }, [allNumbers]);

  const startLevel = useCallback((currentLevel) => {
    if (currentLevel > MAX_LEVEL) {
      setGameStatus('complete');
      showPopup("Congratulations! You've mastered all levels!", 'success');
      return;
    }
    const newMemoryNumbers = getMemoryNumbers(allNumbers, currentLevel);
    setMemoryNumbers(newMemoryNumbers);
    setPhase('memorize');
    setSelectedNumbers([]);
    setTimeLeft(20);
    setLevel(currentLevel);
    setWrongAttempts(0);
    showPopup(`Level ${currentLevel}: Memorize ${newMemoryNumbers.length} numbers!`, 'info');
  }, [allNumbers]);

  const showTestNumbers = useCallback(() => {
    const newTestNumbers = getTestNumbers(memoryNumbers, allNumbers, level);
    setTestNumbers(newTestNumbers);
    setPhase('test');
    setTimeLeft(getRecallTime(level));
    showPopup(`Now select the ${memoryNumbers.length} numbers you memorized!`, 'info');
  }, [memoryNumbers, allNumbers, level, getTestNumbers, getRecallTime]);

  const endTestPhase = useCallback(() => {
    const correctCount = selectedNumbers.filter(num => 
      memoryNumbers.includes(num)
    ).length;
    
    const isLevelComplete = correctCount === memoryNumbers.length;
    
    if (!isLevelComplete) {
      showPopup("Almost there! Try again!", 'warning');
      setTimeout(() => {
        resetGame();
      }, 1500);
    }
  }, [selectedNumbers, memoryNumbers, resetGame]);

  useEffect(() => {
    resetGame();
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(popupTimerRef.current);
    };
  }, [resetGame]);

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
    
    const isWrong = !memoryNumbers.includes(number);
    if (isWrong) {
      const newWrongAttempts = wrongAttempts + 1;
      setWrongAttempts(newWrongAttempts);
      
      if (newWrongAttempts >= MAX_WRONG_ATTEMPTS) {
        showPopup("Oops! Too many wrong attempts. Try again!", 'error');
        setTimeout(() => {
          resetGame();
        }, 1000);
      } else {
        showPopup(`Careful! ${MAX_WRONG_ATTEMPTS - newWrongAttempts} attempts left`, 'warning');
      }
    } else {
      showPopup("Correct! Keep going!", 'success');
    }
    
    setSelectedNumbers(prev => {
      const newSelected = [...prev, number];
      
      const allCorrectSelected = memoryNumbers.every(num => newSelected.includes(num));
      if (allCorrectSelected) {
        
        clearInterval(timerRef.current);
       
        const newScore = score + calculateScore(level);
        setScore(newScore);
        
        if (level === MAX_LEVEL) {
          showPopup("Perfect! You've completed the game!", 'success');
          setTimeout(() => {
            setGameStatus('complete');
          }, 1000);
        } else {
          showPopup(`Great job! Level ${level} complete!`, 'success');
          setTimeout(() => {
            startLevel(level + 1);
          }, 1000);
        }
      }
      return newSelected;
    });
  };

  if (gameStatus === 'ready') {
    return (
      <div className="game-screen">
        <div className="start-screen">
          <h2>Number Memory Challenge</h2>
          <p>Remember the numbers and select them correctly</p>
          <button onClick={startGame}>Start Game</button>
        </div>
        {popupMessage.show && (
          <div className={`popup ${popupMessage.type}`}>
            {popupMessage.text}
          </div>
        )}
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
        {popupMessage.show && (
          <div className={`popup ${popupMessage.type}`}>
            {popupMessage.text}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="game-screen">
      <GameInfo 
        level={level} 
        score={score} 
        phase={phase} 
        timeLeft={timeLeft}
        wrongAttempts={wrongAttempts}
        maxWrongAttempts={MAX_WRONG_ATTEMPTS}
      />
      
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
          <h3>Select the {memoryNumbers.length} numbers you saw ({testNumbers.length} options):</h3>
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
                } ${wrongAttempts >= MAX_WRONG_ATTEMPTS ? 'disabled' : ''}`}
                onClick={() => handleNumberClick(number)}
              >
                {number}
              </div>
            ))}
          </div>
          {wrongAttempts > 0 && (
            <div className="attempts-warning">
              Wrong attempts: {wrongAttempts}/{MAX_WRONG_ATTEMPTS}
            </div>
          )}
        </div>
      )}
      
      {popupMessage.show && (
        <div className={`popup ${popupMessage.type}`}>
          {popupMessage.text}
        </div>
      )}
    </div>
  );
};

export default Home;