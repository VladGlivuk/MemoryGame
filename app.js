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

    this.isGameStarted = false;
    this.startTime = null;
    this.endTime = null;

    this.init();
  }

  init() {
    this.createGrid();
    this.renderGrid();

    const startBtn = document.getElementById('startBtn');
    startBtn.addEventListener('click', () => this.startGame());

    const restartBtn = document.getElementById('restartBtn');
    restartBtn.addEventListener('click', () => this.restartGame());
  }

  createGrid() {
    const cardsNumber = this.rows * this.columns;
    const cardValues = Array.from({ length: cardsNumber / 2 }, (_element, index) => index + 1);
    const cards = cardValues.concat(cardValues);

    const shuffledCards = shuffleArray(cards);

    const newGrid = shuffledCards.map((value) => createCard(value));

    this.grid = newGrid;
  }

  renderGrid() {
    const wrapperElement = document.getElementById('wrapper');
    const gridElement = document.getElementById('grid');

    gridElement.innerHTML = '';

    this.grid.map((_el, index) => {
      const card = document.createElement('div');

      card.className = 'card';
      card.dataset.index = index;

      card.textContent = '?';
      gridElement.appendChild(card);
    });

    const cards = document.querySelectorAll('.card');
    cards.forEach((card) => card.addEventListener('click', () => this.flipCard(card)));

    const theme = this.theme || {};
    const defaultTheme = {
      fontColor: '#000',
      backgroundColor: '#fff',
    };

    //set styles
    //grid
    gridElement.style.gridTemplate = `repeat(${this.rows}, 1fr)/repeat(${this.columns}, 1fr)`;
    gridElement.style.maxWidth = `${this.width}px`;
    gridElement.style.maxHeight = `${this.height}px`;
    gridElement.style.color = theme.fontColor || defaultTheme.fontColor;
    //wrapper
    wrapperElement.style.background = theme.backgroundColor || defaultTheme.backgroundColor;
  }

  flipCard(card) {
    const index = parseInt(card.dataset.index);
    const selectedCard = this.grid[index];

    if (selectedCard.isMatched || selectedCard.isFlipped || this.flippedCards.length === 2) return;

    this.flipAnimation(card, selectedCard.value, false);
    selectedCard.isFlipped = true;
    this.flippedCards.push(index);

    if (this.flippedCards.length === 2) {
      const [firstChosenCardValue, secondChosenCardValue] = this.flippedCards;
      const firstCard = this.grid[firstChosenCardValue];
      const secondCard = this.grid[secondChosenCardValue];

      if (firstCard.value === secondCard.value) {
        firstCard.isMatched = true;
        secondCard.isMatched = true;
        this.matchedCards += 2;
        this.flippedCards = [];

        if (this.matchedCards === this.grid.length) {
          this.endGame();
        }
      } else {
        setTimeout(() => {
          this.flipAnimation(document.querySelector(`[data-index="${firstChosenCardValue}"]`), '?', true);
          this.flipAnimation(document.querySelector(`[data-index="${secondChosenCardValue}"]`), '?', true);
          firstCard.isFlipped = false;
          secondCard.isFlipped = false;
          this.flippedCards = [];
        }, 1000);
      }
    }
  }

  flipAnimation(card, value, isWrongPair) {
    anime({
      targets: card,
      innerHTML: value,
      round: 2,
      backgroundColor: '#00D100',
      color: this.theme.fontColor,
      easing: 'easeInOutQuad',
      duration: 200,
      complete: (anim) => {
        if (value === '?') {
          const targetBackgroundColor = !!isWrongPair ? '#999' : '#eee';
          const targetFontColor = !!isWrongPair ? this.theme.fontColor : '#eee';

          anim.animatables[0].target.style.backgroundColor = targetBackgroundColor;
          anim.animatables[0].target.style.color = targetFontColor;
          card.textContent = '?';
        }
      },
    });
  }

  startGame() {
    if (this.isGameStarted) return;

    this.isGameStarted = true;
    this.startTime = new Date();
  }

  restartGame() {
    clearTimeout(this.timer);

    this.grid = [];
    this.flippedCards = [];
    this.matchedCards = 0;
    this.isPaused = false;
    this.isGameStarted = false;
    this.startTime = null;
    this.endTime = null;

    this.createGrid();
    this.renderGrid();
  }

  endGame() {
    clearTimeout(this.timer);
    this.isGameStarted = false;
    this.endTime = new Date();
    const timeElapsed = (this.endTime - this.startTime) / 1000;

    setTimeout(() => {
      alert(`Congratulations! You found all the matching elements.
      Time has passed: ${timeElapsed.toFixed(2)} seconds.`);
    }, 500);
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
  width: 800,
  height: 600,
  rows: 2,
  columns: 2,
  theme: {
    backgroundColor: '2f2f2f',
    fontColor: '#333',
  },
});
