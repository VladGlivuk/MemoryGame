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
    this.remainingTime = new Date();

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

    const shuffledCards = getShuffledCards(cards);

    const newGrid = shuffledCards.map((value) => createCard(value));

    this.grid = newGrid;
  }

  renderGrid() {
    const wrapperElement = document.getElementById('wrapper');
    const gridElement = document.getElementById('grid');
    const contentElement = document.getElementById('content');
    const startBtn = document.getElementById('startButton');

    gridElement.innerHTML = '';

    this.grid.map((_el, index) => {
      const card = document.createElement('div');

      card.className = 'card';
      card.dataset.index = index;

      card.textContent = '?';
      gridElement.appendChild(card);
    });

    startBtn.addEventListener('click', () => this.startGame());
    const cards = document.querySelectorAll('.card');
    cards.forEach((card) => card.addEventListener('click', () => this.flipCard(card)));
    contentElement.addEventListener('mouseleave', () => {
      if (this.isGameStarted && !this.isPaused) {
        this.pauseGame();
      }
    });
    contentElement.addEventListener('mouseenter', () => {
      if (this.isGameStarted && this.isPaused) {
        this.resumeGame();
      }
    });

    const theme = this.theme || {};
    const defaultTheme = {
      fontColor: '#000',
      backgroundColor: '#fff',
    };

    //set styles
    //grid
    gridElement.style.gridTemplate = `repeat(${this.rows}, 1fr)/repeat(${this.columns}, 1fr)`;
    contentElement.style.maxWidth = `${this.width}px`;
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
    this.startTimer(this.timeLimit);
  }
  endGame(isSuccessful = false) {
    clearTimeout(this.timer);
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

  startTimer(durationTime) {
    const timeElement = document.querySelector('#timer');
    let timer = durationTime;
    let minutes = 0;
    let seconds = 0;

    this.timer = setInterval(() => {
      minutes = parseInt(timer / 60, 10);
      seconds = parseInt(timer % 60, 10);

      minutes = minutes < 10 ? '0' + minutes : minutes;

      if (seconds < 0) seconds = '00';
      else seconds = seconds < 10 ? '0' + seconds : seconds;

      const timeLeft = minutes + ':' + seconds;
      timeElement.textContent = timeLeft;

      if (--timer < 0) {
        timer = durationTime;
        this.endGame();
      }
    }, 1000);
  }

  pauseGame() {
    if (this.isPaused || !this.isGameStarted) return;

    this.isPaused = true;
    const endTime = new Date();
    const timeElapsed = +((endTime.getTime() - this.startTime.getTime()) / 1000).toFixed(2);
    this.remainingTime = this.timeLimit - timeElapsed;
    clearInterval(this.timer);
  }

  resumeGame() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.startTimer(this.remainingTime);
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
  width: 1200,
  height: 600,
  rows: 4,
  columns: 4,
  timeLimit: 60,
  theme: {
    backgroundColor: '2f2f2f',
    fontColor: '#333',
  },
});
