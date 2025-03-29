export const initializeNumbers = () => {
    return Array.from({length: 100}, (_, i) => i + 1); // Numbers 1-100
  };
  
  export const getMemoryNumbers = (allNumbers, level) => {
    const count = 5 + 2 * (level - 1);
    return [...allNumbers]
      .sort(() => 0.5 - Math.random())
      .slice(0, count);
  };
  
  export const getTestNumbers = (memoryNumbers, allNumbers) => {
    const distractions = allNumbers
      .filter(num => !memoryNumbers.includes(num))
      .sort(() => 0.5 - Math.random())
      .slice(0, 100 - memoryNumbers.length);
    
    return [...memoryNumbers, ...distractions]
      .sort(() => 0.5 - Math.random());
  };
  
  export const calculateScore = (level) => level * 10;