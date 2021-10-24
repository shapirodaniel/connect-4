////////////////
/* GAME STATE */
////////////////

const state = {
  columns: [[], [], [], [], [], [], []],
};

const getMatrix = () => state.columns;

///////////////////////////
/* GLOBALS AND FUNCTIONS */
///////////////////////////

let turn = 0;

function getMove() {
  return turn % 2 === 0 ? "R" : "Y";
}

function getNodeIdFromState(colIdx) {
  let positionValue = state.columns[colIdx].length - 1;

  if (positionValue < 0) {
    positionValue = 0;
  }
  const rowIdx = Math.abs(positionValue - 5);
  return `col-${colIdx}:${rowIdx}`;
}

//////////////////////////////////
/* DOM SETUP: BOARD AND COLUMNS */
//////////////////////////////////

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

////////////
/* EVENTS */
////////////

BOARD.addEventListener("click", (e) => {
  if (e.target.className === "column") {
    return;
  }

  let node = e.target;

  if (
    e.target.className === "board-cell-circle" ||
    e.target.className === "red-piece" ||
    e.target.className === "yellow-piece"
  ) {
    node = e.target.parentElement;
  }

  const move = getMove();
  const colIdx = node.id.slice(4).split(":")[0];

  if (state.columns[colIdx].length < 6) {
    state.columns[colIdx].push(move);
    turn++;

    const classNameColor = move[0] === "R" ? "red" : "yellow";
    const nodeWhereMoveLandsId = getNodeIdFromState(colIdx);

    const NODE_WHERE_MOVE_LANDS = document.getElementById(nodeWhereMoveLandsId);
    NODE_WHERE_MOVE_LANDS.firstElementChild.className = `${classNameColor}-piece`;
  }

  const won = didWin();

  if (won) {
    console.log("winner");
    document.body.style.backgroundColor = "green";
    document.getElementById("gameMsg").innerText = "Hooray you won! :)";
  }
});

///////////////////////
/* WIN DETERMINATION */
///////////////////////

function checkAscendingLeftRightDiagonal(
  startCoord,
  nextCoord,
  count = 0,
  matrix
) {
  const [startCol, startRow] = startCoord;
  const startPiece = matrix[startCol][startRow];

  if (!startPiece) {
    return false;
  }

  const [nextCol, nextRow] = nextCoord;
  const nextPiece = matrix[nextCol][nextRow];

  if (count === 3 && startPiece === nextPiece) {
    return true;
  } else {
    if (!nextPiece) {
      return false;
    }
    if (nextPiece !== startPiece) {
      count = -1;
    }
    return checkAscendingLeftRightDiagonal(
      nextCoord,
      [nextCol + 1, nextRow - 1],
      ++count,
      matrix
    );
  }
}

function checkDescendingLeftRightDiagonal(
  startCoord,
  nextCoord,
  count = 0,
  matrix
) {
  const [startCol, startRow] = startCoord;
  const startPiece = matrix[startCol][startRow];

  if (!startPiece) {
    return false;
  }

  const [nextCol, nextRow] = nextCoord;
  const nextPiece = matrix[nextCol][nextRow];

  if (count === 3 && startPiece === nextPiece) {
    return true;
  } else {
    if (!nextPiece) {
      return false;
    }
    if (nextPiece !== startPiece) {
      count = -1;
    }
    return checkDescendingLeftRightDiagonal(
      nextCoord,
      [nextCol + 1, nextRow + 1],
      ++count,
      matrix
    );
  }
}

// start from left
function checkRow(startCoord, nextCoord, count = 0, matrix) {
  const [startCol, startRow] = startCoord;
  const startPiece = matrix[startCol][startRow];

  if (!startPiece) {
    return false;
  }

  const [nextCol, nextRow] = nextCoord;
  const nextPiece = matrix[nextCol][nextRow];

  if (count === 3 && startPiece === nextPiece) {
    return true;
  } else {
    if (!nextPiece) {
      return false;
    }
    if (nextPiece !== startPiece) {
      count = -1;
    }
    return checkRow(nextCoord, [nextCol + 1, nextRow], ++count, matrix);
  }
}

// start from bottom
function checkCol(startCoord, nextCoord, count = 0, matrix) {
  const [startCol, startRow] = startCoord;
  const startPiece = matrix[startCol][startRow];

  if (!startPiece) {
    return false;
  }

  const [nextCol, nextRow] = nextCoord;
  const nextPiece = matrix[nextCol][nextRow];

  if (count === 3 && startPiece === nextPiece) {
    return true;
  } else {
    if (!nextPiece) {
      return false;
    }
    if (nextPiece !== startPiece) {
      count = -1;
    }
    return checkCol(nextCoord, [nextCol, nextRow - 1], ++count, matrix);
  }
}

function didWin() {
  // starts from leftmost column
  const rowStartIds = new Array(6)
    .fill(null)
    .map((_, rowIdx) => `col-0:${rowIdx}`);

  // start from bottom row
  const colStartIds = new Array(7)
    .fill(null)
    .map((_, colIdx) => `col-${colIdx}:5`);

  const diagonalAscendingStartIds = new Array(6).fill(null).map((_, idx) => {
    if (idx < 3) {
      return `col-0:${idx + 3}`;
    } else {
      return `col-${idx - 2}:5`;
    }
  });

  const diagonalDescendingStartIds = new Array(6).fill(null).map((_, idx) => {
    if (idx < 4) {
      return `col-${3 - idx}:0`;
    } else {
      return `col-0:${Math.abs(idx - 5)}`;
    }
  });

  function getCoord(id) {
    return id
      .slice(4)
      .split(":")
      .map((val) => +val);
  }

  rowStartIds.forEach((id) => {
    const startCoord = getCoord(id);
    const [startCol, startRow] = startCoord;
    const nextCoord = [startCol + 1, startRow];

    return checkRow(startCoord, nextCoord, 0, getMatrix());
  });

  colStartIds.forEach((id) => {
    const startCoord = getCoord(id);
    const [startCol, startRow] = startCoord;
    const nextCoord = [startCol, startRow - 1];

    return checkCol(startCoord, nextCoord, 0, getMatrix());
  });

  diagonalAscendingStartIds.forEach((id) => {
    const startCoord = getCoord(id);
    const [startCol, startRow] = startCoord;
    const nextCoord = [startCol + 1, startRow - 1];

    return checkAscendingLeftRightDiagonal(
      startCoord,
      nextCoord,
      0,
      getMatrix()
    );
  });

  diagonalDescendingStartIds.forEach((id) => {
    const startCoord = getCoord(id);
    const [startCol, startRow] = startCoord;
    const nextCoord = [startCol + 1, startRow + 1];

    return checkDescendingLeftRightDiagonal(
      startCoord,
      nextCoord,
      0,
      getMatrix()
    );
  });
}
