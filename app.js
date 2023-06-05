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
    this.isPaused = false;
    this.timer = null;
    this.startTime = null;

    this.init();
  }

  init() {
    this.createGrid();
    this.renderGrid();

    const startBtn = document.getElementById('startButton');
    startBtn.addEventListener('click', () => this.startGame());
  }

  createGrid() {
    const cardsNumber = this.rows * this.columns;
    const cardValues = Array.from({ length: cardsNumber / 2 }, (_element, index) => index + 1);
    const cards = cardValues.concat(cardValues);

    const shuffledCards = getShuffledCards(cards);

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
    if (!this.isGameStarted) return;
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

        const isSuccessful = this.matchedCards === this.grid.length;
        if (isSuccessful) this.endGame(isSuccessful);
      } else {
        setTimeout(() => {
          this.flipAnimation(document.querySelector(`[data-index="${firstChosenCardValue}"]`), '?', true);
          this.flipAnimation(document.querySelector(`[data-index="${secondChosenCardValue}"]`), '?', true);
          firstCard.isFlipped = false;
          secondCard.isFlipped = false;
          this.flippedCards = [];
        }, 800);
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
      duration: 100,
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

  endGame(isSuccessful = false) {
    clearTimeout(this.timer);
    console.log('file: app.js:155  MatchGrid  this.timer:', this.timer);
    this.isGameStarted = false;

    const endTime = new Date();
    const timeElapsed = +((endTime.getTime() - this.startTime.getTime()) / 1000).toFixed(2);

    const alertText = isSuccessful
      ? `Congratulations! You found all the matching elements.
    Time has passed: ${timeElapsed} seconds.`
      : `The time has run out, please try again!`;

    setTimeout(() => {
      alert(alertText);
    }, 500);
  }

  startGame() {
    if (this.isGameStarted) return;

    clearTimeout(this.timer);

    this.grid = [];
    this.flippedCards = [];
    this.matchedCards = 0;
    this.isPaused = false;
    this.isGameStarted = false;

    this.createGrid();
    this.renderGrid();

    this.isGameStarted = true;
    this.startTime = new Date();
    this.startTimer();
  }

  startTimer() {
    const timeElement = document.querySelector('#timer');
    let time = this.timeLimit;
    console.log('file: app.js:176  MatchGrid  time:', time);
    let minutes = 0;
    let seconds = 0;

    this.timer = setInterval(() => {
      minutes = parseInt(time / 60, 10);
      console.log('file: app.js:183  MatchGrid  minutes:', minutes);
      seconds = parseInt(time % 60, 10);
      console.log('file: app.js:185  MatchGrid  seconds:', seconds);

      minutes = minutes < 10 ? '0' + minutes : minutes;
      seconds = seconds < 10 ? '0' + seconds : seconds;

      const timeLeft = minutes + ':' + seconds;
      timeElement.textContent = timeLeft;

      if (--time < 0) {
        time = this.timeLimit;
        this.endGame();
      }
    }, 1000);
  }
}

function getShuffledCards(array) {
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
  timeLimit: 20,
  theme: {
    backgroundColor: '2f2f2f',
    fontColor: '#333',
  },
});
