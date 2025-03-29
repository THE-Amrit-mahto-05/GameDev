import './Card.css';

const Card = ({ name, isFlipped, isCorrect, onClick, isActive }) => {
  return (
    <div 
      className={`card ${isFlipped ? 'flipped' : ''} ${isCorrect ? 'correct' : ''} ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="card-front">
        <span>{name}</span>
      </div>
      <div className="card-back">
        <span>?</span>
      </div>
    </div>
  );
};

export default Card;