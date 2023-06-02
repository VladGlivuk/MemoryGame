class MatchGrid {
  constructor(args) {
    this.width = args.width;
    this.height = args.height;
    this.rows = args.rows;
    this.columns = args.columns;
    this.timeLimit = args.timeLimit;
    this.theme = args.theme;
  }
}

const matchGrid = new MatchGrid({
  width: 1200,
  height: 800,
  rows: 4,
  columns: 4,
  timeLimit: 60,
  theme: {
    backgroundColor: '#f2f2f2',
    fontColor: '#333',
  },
});
