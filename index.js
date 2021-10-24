const BOARD = document.getElementById("board");
const COLUMNS = Array.from(document.getElementsByClassName("column"));

COLUMNS.forEach((column, colIdx) => {
  const cells = new Array(6)
    .fill(null)
    .map((_, rowIdx) => {
      return `
        <div class="board-cell-outer" id="col-${colIdx}:${rowIdx}">
          <div class="board-cell-circle"></div>
        </div>
      `;
    })
    .join("");
  column.innerHTML = cells;
});

const state = {
  columns: {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  },
};

let turn = 0;
function getMove() {
  return turn % 2 === 0 ? "R" : "Y";
}

function getNodeIdFromState(colIdx) {
  let positionValue = state.columns[colIdx].length - 1;

  console.log(`positionValue is: ${positionValue}`);

  if (positionValue < 0) {
    positionValue = 0;
  }
  const rowIdx = Math.abs(positionValue - 6);
  return `col-${colIdx}:${rowIdx}`;
}

BOARD.addEventListener("click", (e) => {
  if (e.target.className === "column") {
    return;
  }

  let node = e.target;

  if (e.target.className === "board-cell-circle") {
    node = e.target.parentElement;
  }

  const move = getMove();
  const colIdx = node.id.slice(4).split(":")[0];

  if (state.columns[colIdx].length < 6) {
    state.columns[colIdx].push(move);
    turn++;
    console.log(state);

    const classNameColor = move[0] === "R" ? "red" : "yellow";
    const nodeWhereMoveLandsId = getNodeIdFromState(colIdx);

    console.log(nodeWhereMoveLandsId);

    const NODE_WHERE_MOVE_LANDS = document.getElementById(nodeWhereMoveLandsId);
    NODE_WHERE_MOVE_LANDS.firstElementChild.className = `${classNameColor}-piece`;
  }
});
