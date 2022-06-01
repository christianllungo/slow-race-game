import { INVALID_MOVE } from 'boardgame.io/core';

export const SlowRace = {
    setup: () => {
        let cells = Array(52).fill(null);
        cells[0] = 0;
        cells[1] = 1;
        cells[2] = 2;
        cells[3] = 3;
        let currentPlayerPositions = [0, 1, 2, 3];
        let currentRoll;
        let cellsAllowed = [];

        return {
            cells: cells,
            currentRoll: currentRoll,
            cellsAllowed: cellsAllowed,
            currentPlayerPositions: currentPlayerPositions,
        }
    },

    turn: {
        minMoves: 1,
    },

    moves: { RollDice, ChooseCell },

    endIf: (G, ctx) => {
        if (isVictory(G, ctx)) {
            return { winner: ctx.currentPlayer };
        }
    }
};

// moves
function RollDice(G, ctx) {
    const moveCode = ctx.random.Die(4);
    G.currentRoll = moveCode;
    let cellsAllowed = [];
    switch (moveCode) {
        case 1:
            moveZero(ctx);
            break;
        case 2:
            cellsAllowed = moveOne(G, ctx);
            break;
        case 3:
            cellsAllowed = moveOneSide(G, ctx);
            break;
        case 4:
            cellsAllowed = moveTwo(G, ctx);
            break;
        default:
            break;
    }
    G.cellsAllowed = cellsAllowed;
}

function ChooseCell (G, ctx, id) {
    G.cellsAllowed.forEach(e => {
        if (id == e) {
            if (G.cells[id] !== null) {
                return INVALID_MOVE;
            }
            G.currentPlayerPositions[ctx.currentPlayer] = id;
            repaintCells(G);
            G.cellsAllowed = [];
            ctx.events.endTurn();
        }
    });
}

// helper functions

function moveZero(ctx) {
    ctx.events.endTurn();
}

function moveOne(G, ctx) {
    if (isMoveQtyAvailable(G, ctx, 4)) {
        const allowedPosition = G.currentPlayerPositions[ctx.currentPlayer] + 4;
        return [allowedPosition];
    }
    G.cellsAllowed = [];
    ctx.events.endTurn();
}

function moveTwo(G, ctx) {
    if (!isMoveQtyAvailable(G, ctx, 4)) {
        G.cellsAllowed = [];
        ctx.events.endTurn();
    } else if (!isMoveQtyAvailable(G, ctx, 8)) {
        const allowedPosition = G.currentPlayerPositions[ctx.currentPlayer] + 4;
        return [allowedPosition];
    } else {
        const allowedPosition = G.currentPlayerPositions[ctx.currentPlayer] + 8;
        return [allowedPosition];
    }
}

// Checks if moving qty spaces from current player is available
function isMoveQtyAvailable(G, ctx, qty) {
    const moveTo = G.currentPlayerPositions[ctx.currentPlayer] + qty;
    if (G.cells[moveTo] !== null) {
        return false;
    }
    return true;
}

function moveOneSide(G, ctx) {
    const leftSquares = [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40];
    const rightSquares = [3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43];
    const currentPlayerPosition = G.currentPlayerPositions[ctx.currentPlayer];

    if (leftSquares.includes(currentPlayerPosition)) {
        if (isMoveQtyAvailable(G, ctx, 5)) {
            const allowedPosition = G.currentPlayerPositions[ctx.currentPlayer] + 5;
            return [allowedPosition];
        }
        G.cellsAllowed = [];
        ctx.events.endTurn();
    } else if (rightSquares.includes(currentPlayerPosition)) {
        if (isMoveQtyAvailable(G, ctx, 3)) {
            const allowedPosition = G.currentPlayerPositions[ctx.currentPlayer] + 3;
            return [allowedPosition];
        }
        G.cellsAllowed = [];
        ctx.events.endTurn();
    } else {
        let allowedPosition = [];
        if (isMoveQtyAvailable(G, ctx, 3)) {
            allowedPosition.push(G.currentPlayerPositions[ctx.currentPlayer] + 3);
        }
        if (isMoveQtyAvailable(G, ctx, 5)) {
            allowedPosition.push(G.currentPlayerPositions[ctx.currentPlayer] + 5);
        }
        if (allowedPosition.length != 0) {
            return allowedPosition;
        } else {
            G.cellsAllowed = [];
            ctx.events.endTurn();
        }
        /* 
        +3? allowed.push(+3)
        +5? allowed.push(+5)
        if allowed != empty return allowed
        else endTurn
        */
    }
}

function repaintCells(G) {
    G.cells = Array(52).fill(null);
    const pos0 = G.currentPlayerPositions[0];
    const pos1 = G.currentPlayerPositions[1];
    const pos2 = G.currentPlayerPositions[2];
    const pos3 = G.currentPlayerPositions[3];
    G.cells[pos0] = 0;
    G.cells[pos1] = 1;
    G.cells[pos2] = 2;
    G.cells[pos3] = 3;
}

function isVictory(G, ctx) {
    const winningSquares = [44, 45, 46, 47, 48, 49, 50, 51];
    if (winningSquares.includes(G.currentPlayerPositions[ctx.currentPlayer])) {
        return true;
    }
}

/* 
1 n
2 move 1 allowed +4
3 n
4 move 2 allowed +8
5 n
*/
/* 
Notes:
- Stop players from rolling dice multiple times. It should roll once and force
players into the chooseCell move. Could use phases or stages. Read more on those. Use disable HTML element
- Setup simple multiplayer functionality
- Design and implement UI
*/