import './GameInfo.css';

const GameInfo = ({ level, score, phase, timeLeft }) => {
  return (
    <div className="game-info">
      <div className="info-grid">
        <div className="info-item">
          <span className="label">Level:</span>
          <span className="value">{level}</span>
        </div>
        <div className="info-item">
          <span className="label">Score:</span>
          <span className="value">{score}</span>
        </div>
        <div className="info-item phase">
          <span className="label">Mode:</span>
          <span className="value">{phase === 'memorize' ? 'Memorize' : 'Recall'}</span>
        </div>
        <div className="info-item timer">
          <span className="label">Time:</span>
          <span className="value">{timeLeft}s</span>
        </div>
      </div>
    </div>
  );
};

export default GameInfo;