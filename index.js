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

let player1;
let player2;
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

// checkbox and textInput styling
Array.from(document.querySelectorAll('input[type="checkbox"]')).forEach(
  (checkbox) => {
    checkbox.addEventListener("click", (e) => {
      const textInput = e.target.parentElement.previousElementSibling;
      if (e.target.checked) {
        textInput.contentEditable = "false";
        textInput.className = "textInputComputer";
        textInput.innerText = "Computer";
      } else {
        textInput.contentEditable = "true";
        textInput.className = "textInput";
        textInput.innerText = "";
      }
    });
  }
);

const PLAY_BTNS = Array.from(
  document.querySelectorAll(".playBtnContainer > button")
);

PLAY_BTNS.forEach((button) => {
  button.addEventListener("click", (e) => {
    const textInput =
      e.target.parentElement.parentElement.querySelector(".textInput");

    if (e.target.innerText === "Ready") {
      e.target.innerText = "Play";
      e.target.className = "playBtn";
      textInput.contentEditable = "true";
      document.querySelector("#startGameBtn").style.visibility = "hidden";
    } else {
      e.target.innerText = "Ready";
      e.target.className = "readyBtn";
      textInput.contentEditable = "false";

      // show start game btn if both players ready
      if (PLAY_BTNS.every((btn) => btn.className === "readyBtn")) {
        console.log("ready to play");
        const bothComputer = Array.from(
          document.querySelectorAll('input[type="checkbox"]')
        ).every((box) => box.checked === "true");

        console.log(bothComputer);

        if (bothComputer) {
          alert(
            "At least one human player is required! Please change Player 1 or Player 2 and continue"
          );
        }

        document.querySelector("#startGameBtn").style.visibility = "visible";
      }
    }
  });
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

  console.log("node.id is: ", node.id);

  const move = getMove();
  const colIdx = node.id.slice(4).split(":")[0];

  if (state.columns[colIdx].length < 6) {
    state.columns[colIdx].push(move);
    turn++;

    const classNameColor = move[0] === "R" ? "red" : "yellow";
    const nodeWhereMoveLandsId = getNodeIdFromState(colIdx);

    const NODE_WHERE_MOVE_LANDS = document.getElementById(nodeWhereMoveLandsId);
    NODE_WHERE_MOVE_LANDS.firstElementChild.className = `${classNameColor}-piece`;

    const nextMove = document.getElementById("nextMove");
    nextMove.className = move[0] === "R" ? "yellow" : "red";
    nextMove.innerText = move[0] === "R" ? "Yellow" : "Red";
  }

  const { won, winType } = didWin();

  if (won) {
    console.log("winner");
    document.body.style.backgroundColor = "green";
    document.getElementById("gameMsg").innerText = `Winner: ${winType}`;
  }
});

function startGame() {
  console.log("game time! :)");
}

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
  const startPiece = matrix[startCol][5 - startRow];

  const [nextCol, nextRow] = nextCoord;
  const nextPiece = matrix[nextCol][5 - nextRow];

  if (count === 2 && startPiece === nextPiece) {
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
  const startPiece = matrix[startCol][5 - startRow];

  const [nextCol, nextRow] = nextCoord;
  const nextPiece = matrix[nextCol][5 - nextRow];

  if (count === 2 && startPiece === nextPiece) {
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

  const [nextCol, nextRow] = nextCoord;
  const nextPiece = matrix[nextCol][nextRow];

  if (count === 2 && startPiece === nextPiece) {
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
  const startPiece = matrix[startCol][5 - startRow];

  if (!startPiece) {
    return false;
  }

  const [nextCol, nextRow] = nextCoord;
  const nextPiece = matrix[nextCol][5 - nextRow];

  if (count === 2 && startPiece === nextPiece) {
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

  const diagonalAscendingStartIds = [
    "col-0:3",
    "col-0:4",
    "col-0:5",
    "col-1:5",
    "col-2:5",
    "col-3:5",
  ];

  const diagonalDescendingStartIds = [
    "col-3:0",
    "col-2:0",
    "col-1:0",
    "col-0:0",
    "col-0:1",
    "col-0:2",
  ];

  function getCoord(id) {
    return id
      .slice(4)
      .split(":")
      .map((val) => +val);
  }

  let status = { won: false, winType: "" };

  for (let i = 0; i < rowStartIds.length; i++) {
    const id = rowStartIds[i];
    const startCoord = getCoord(id);
    const [startCol, startRow] = startCoord;
    const nextCoord = [startCol + 1, startRow];
    const matrix = getMatrix();

    if (checkRow(startCoord, nextCoord, 0, matrix)) {
      status = { won: true, winType: "row" };
      return status;
    }
  }

  for (let i = 0; i < colStartIds.length; i++) {
    const id = colStartIds[i];
    const startCoord = getCoord(id);
    const [startCol, startRow] = startCoord;
    const nextCoord = [startCol, startRow - 1];
    const matrix = getMatrix();

    if (checkCol(startCoord, nextCoord, 0, matrix)) {
      status = { won: true, winType: "col" };
      return status;
    }
  }

  for (let i = 0; i < diagonalAscendingStartIds.length; i++) {
    const id = diagonalAscendingStartIds[i];
    const startCoord = getCoord(id);
    const [startCol, startRow] = startCoord;
    const nextCoord = [startCol + 1, startRow - 1];
    const matrix = getMatrix();

    if (checkAscendingLeftRightDiagonal(startCoord, nextCoord, 0, matrix)) {
      status = { won: true, winType: "ascending diagonal" };
      return status;
    }
  }

  for (let i = 0; i < diagonalDescendingStartIds.length; i++) {
    const id = diagonalDescendingStartIds[i];
    const startCoord = getCoord(id);
    const [startCol, startRow] = startCoord;
    const nextCoord = [startCol + 1, startRow + 1];
    const matrix = getMatrix();

    if (checkDescendingLeftRightDiagonal(startCoord, nextCoord, 0, matrix)) {
      status = { won: true, winType: "descending diagonal" };
      return status;
    }
  }

  return status;
}
