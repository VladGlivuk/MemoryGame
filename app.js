class MatchGrid {
  constructor(args) {
    this.width = args.width;
    this.height = args.height;
    this.rows = args.rows;
    this.columns = args.columns;
    this.timeLimit = args.timeLimit;
    this.theme = args.theme;

    this.grid = [];
    this.flippedCards = [];
    this.matchedCards = 0;

    this.init();
  }

  init() {
    this.createGrid();
    this.renderGrid();
  }

  createGrid() {
    const cardsNumber = this.rows * this.columns;
    const cardValues = Array.from({ length: cardsNumber / 2 }, (_element, index) => index + 1);
    const cards = cardValues.concat(cardValues);

    const shuffledCards = shuffleArray(cards);

    const newGrid = shuffledCards.map((value) => createCard(value));

    this.grid = newGrid;
  }

  shuffleCards() {
    for (let i = this.grid.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.grid[i], this.grid[j]] = [this.grid[j], this.grid[i]];
    }
  }

  renderGrid() {
    const gridElement = document.getElementById('grid');

    gridElement.innerHTML = '';

    this.grid.map((_el, index) => {
      const card = document.createElement('div');

      card.className = 'card';
      card.dataset.index = index;

      card.textContent = '?';
      gridElement.appendChild(card);
    });

    const theme = this.theme || {};
    const defaultTheme = {
      fontColor: '#000',
      backgroundColor: '#fff',
    };

    //set styles
    gridElement.style.gridTemplate = `repeat(${this.rows}, 1fr)/repeat(${this.columns}, 1fr)`;
    gridElement.style.maxWidth = `${this.width}px`;
    gridElement.style.maxHeight = `${this.height}px`;
    gridElement.style.color = theme.fontColor || defaultTheme.fontColor;
    gridElement.style.backgroundColor = theme.backgroundColor || defaultTheme.backgroundColor;
  }
}

function shuffleArray(array) {
  array.forEach((_el, index) => {
    const randomValue = Math.floor(Math.random() * (index + 1));
    [array[index], array[randomValue]] = [array[randomValue], array[index]];
  });

  return array;
}

const createCard = (value) => ({
  value,
  isFlipped: false,
  isMatched: false,
});

const matchGrid = new MatchGrid({
  width: 1200,
  height: 800,
  rows: 8,
  columns: 8,
  theme: {
    backgroundColor: '#f2f2f2',
    fontColor: '#333',
  },
});
