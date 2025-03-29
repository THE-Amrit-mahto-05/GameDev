import './GameBoard.css';
import Card from '../Card/Card';

const GameBoard = ({ cards, onCardClick, phase }) => {
  return (
    <div className="game-board">
      {cards.map((card) => (
        <Card
          key={card.id}
          id={card.id}
          name={card.name}
          isFlipped={card.isFlipped}
          isCorrect={card.isCorrect}
          isActive={phase === 'memorize' && card.isActive}
          onClick={() => onCardClick(card.id)}
        />
      ))}
    </div>
  );
};

export default GameBoard;