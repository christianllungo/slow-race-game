import { Client } from 'boardgame.io/client';
import { SlowRace } from './Game';

class SlowRaceClient {
  constructor(rootElement) {
    this.client = Client({ game: SlowRace, numPlayers: 4 });
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
      <table class="main-table">${rows.reverse().join('')}</table>
      <button class="roll-dice">Roll Dice</button>
      <p class="winner"></p>
    `;
  }

  attachListeners() {
    // This event handler will read the cell id from a cell’s
    // `data-id` attribute and make the `clickCell` move.
    const handleCellClick = event => {
      const id = parseInt(event.target.dataset.id);
      this.client.moves.ChooseCell(id);
    };
    // Attach the event listener to each of the board cells.
    const cells = this.rootElement.querySelectorAll('.cell');
    cells.forEach(cell => {
      cell.onclick = handleCellClick;
    });

    const handleRollDice = event => {
        this.client.moves.RollDice();
    };
    const rollDiceButtons = this.rootElement.querySelectorAll('.roll-dice');
    rollDiceButtons.forEach(rollDiceButton => {
        rollDiceButton.onclick = handleRollDice;
      });
  }

  update(state) {
    const cells = this.rootElement.querySelectorAll('.cell');
    cells.forEach(cell => {
      const cellId = parseInt(cell.dataset.id);
      const cellValue = state.G.cells[cellId];
      cell.textContent = cellValue !== null ? cellValue : '';
    });
  }
}

const appElement = document.getElementById('app');
const app = new SlowRaceClient(appElement);
