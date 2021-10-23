const game = new Array(6).fill(null).map(() => new Array(7).fill(null));

const BOARD = document.getElementById("board");

let cellIdx = 0;

while (cellIdx < 42) {
  const PIECE = document.createElement("div");
  PIECE.className = "board-cell-outer";
  const INNER_CIRCLE = document.createElement("div");
  INNER_CIRCLE.className = "board-cell-circle";
  INNER_CIRCLE.id = `cell-${cellIdx}`;
  PIECE.appendChild(INNER_CIRCLE);
  BOARD.appendChild(PIECE);
  cellIdx++;
}

function getXY(nodeId) {
  let positionNum = +nodeId.replace("cell-", "");
  let col = positionNum % 7;
  let row = 0;
  while (positionNum > 6) {
    row++;
    positionNum -= 7;
  }
  return [row, col];
}

let turn = 0;

function getPossibleMovesFromNodeId(nodeId) {
  let res = [];
  let currentValue = +nodeId.replace("cell-", "");
  while (currentValue >= 0) {
    res.push(currentValue);
    currentValue -= 7;
  }
  return res;
}

function move(movesArray, xPosition, yPosition) {
  for (let i = 0; i < movesArray.length; i++) {
    if (!game[xPosition][yPosition]) {
      const move = turn % 2 === 0 ? "R" : "Y";
      game[xPosition][yPosition] = move;
    }
    return;
  }
}

BOARD.addEventListener("click", (e) => {
  // funnel clicks on edge of cell to cell
  let node = e.target;
  if (e.target.classList.contains("board-cell-outer")) {
    node = e.target.firstElementChild;
  }
  console.log(node);

  const [x, y] = getXY(node.id);
  console.log("xy positions are: ", x, y);

  const possibleMoves = getPossibleMovesFromNodeId(node.id);
  console.log("positions: ", possibleMoves);

  move(possibleMoves, x, y);
  console.log("game is now: ", game);

  turn++;
});
