import { Client } from 'boardgame.io/client';
import { Local } from 'boardgame.io/multiplayer';
import { SlowRace } from './Game';

class SlowRaceClient {
  constructor(rootElement, { playerID } = {}) {
    this.client = Client({
        game: SlowRace, 
        numPlayers: 4,
        multiplayer: Local(),
        playerID,
    });
    this.client.start();
    this.rootElement = rootElement;
    this.createBoard();
    this.attachListeners();
    this.client.subscribe(state => this.update(state));
  }

  createBoard() {
    const rows = [];
    for (let i = 0; i < 13; i++) {
      const cells = [];
      for (let j = 0; j < 4; j++) {
        const id = 4 * i + j;
        cells.push(`<td class="cell" data-id="${id}"></td>`);
      }
      rows.push(`<tr>${cells.join('')}</tr>`);
    }

    // Add the HTML to our app <div>.
    // We’ll use the empty <p> to display the game winner later.
    this.rootElement.innerHTML = `
      <h2 class="main-title">Game Name</h2>
      <table class="main-table">${rows.reverse().join('')}</table>
      <div class="player-turn display-container"></div>
      <div class="display-container">
        <button class="roll-dice">Roll Dice</button>
        <span class="roll-result"></span>
      </div>
      <p class="winner display-container"></p>
    `;
  }

  attachListeners() {
    // This event handler will read the cell id from a cell’s
    // `data-id` attribute and make the `clickCell` move.
    const handleCellClick = event => {
      const id = parseInt(event.target.dataset.id);
      this.client.moves.MakeMove(id);
    };
    // Attach the event listener to each of the board cells.
    const cells = this.rootElement.querySelectorAll('.cell');
    cells.forEach(cell => {
      cell.onclick = handleCellClick;
    });

    const handleRollDice = event => {
        this.client.moves.RollDice();
    };
    const rollDiceButton = this.rootElement.querySelector('.roll-dice');
    rollDiceButton.onclick = handleRollDice;
  }

  update(state) {
    // board (all cells)
    const cells = this.rootElement.querySelectorAll('.cell');
    cells.forEach(cell => {
      const cellId = parseInt(cell.dataset.id);
      const cellValue = state.G.cells[cellId];
      cell.textContent = cellValue !== null ? cellValue : '';
    });

    // rollDice result
    const rollResult = this.rootElement.querySelector('.roll-result');
    rollResult.textContent = state.G.currentRoll;

    // current player turn
    const playerTurn = this.rootElement.querySelector('.player-turn');
    playerTurn.textContent =  'Turn: Player ' + state.ctx.currentPlayer;

    // winner
    const messageWinner = this.rootElement.querySelector('.winner');
    if (state.ctx.gameover) {
        messageWinner.textContent = 'Winner: Player ' + state.ctx.gameover.winner;
    } else {
        messageWinner.textContent = '';
    }
  }
}

const appElement = document.getElementById('app');
const playerIDs = ['0', '1', '2', '3'];
const clients = playerIDs.map(playerID => {
    const rootElement = document.createElement('div');
    appElement.append(rootElement);
    return new SlowRaceClient(rootElement, { playerID });
});

/* const app = new SlowRaceClient(appElement); */