////////////////
/* GAME STATE */
////////////////

const state = {
  columns: new Array(7).fill(null).map(() => new Array(6).fill(null)),
};

const height = [-1, -1, -1, -1, -1, -1, -1];

///////////////////////////
/* GLOBALS AND FUNCTIONS */
///////////////////////////

let player1;
let player2;
let turn = 0;

function getMove() {
  return turn % 2 === 0 ? "R" : "Y";
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
        <div class="board-cell-outer" id="col-${colIdx}:${Math.abs(
        5 - rowIdx
      )}">
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

const TEXT_INPUTS = Array.from(
  document.querySelectorAll(".textInput, .textInputComputer")
);

TEXT_INPUTS.forEach((input) => {
  input.addEventListener("DOMCharacterDataModified", () => {
    if (input.id === "inputPlayer1") {
      player1 = input.innerText;
    } else {
      player2 = input.innerText;
    }
  });
  input.addEventListener("blur", () => {
    if (input.innerText.length > 20) {
      alert("Please choose a player name less than 20 characters long");
    }
  });
});

const PLAY_BTNS = Array.from(
  document.querySelectorAll(".playBtnContainer > button")
);

PLAY_BTNS.forEach((button) => {
  button.addEventListener("click", (e) => {
    let textInput =
      e.target.parentElement.parentElement.querySelector(".textInput");

    if (!textInput) {
      textInput =
        e.target.parentElement.parentElement.querySelector(
          ".textInputComputer"
        );
    }

    console.log(textInput);

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
        const bothComputer =
          Array.from(document.querySelectorAll(".textInputComputer")).length ===
          2;

        if (bothComputer) {
          alert(
            "At least one human player is required! Please change Player 1 or Player 2 and continue"
          );
          e.target.innerText = "Play";
          e.target.className = "playBtn";
          return;
        }

        document.querySelector("#startGameBtn").style.visibility = "visible";
      }
    }
  });
});

const START_GAME_BTN = document.getElementById("startGameBtn");
START_GAME_BTN.addEventListener("click", () => {
  startGame();
});

////////////
/* EVENTS */
////////////

// quickstart functionality for debugging -- allows user to skip game initialization and start with two default players
function quickStart() {
  player1 = "alice";
  player2 = "bob";
  document.getElementById("inputPlayer1").innerText = "alice";
  document.getElementById("inputPlayer2").innerText = "bob";

  START_GAME_BTN.click();
}

const QUICK_START_BTN = document.getElementById("quickStart");
QUICK_START_BTN.addEventListener("click", () => {
  quickStart();
});

const NEXT_MOVE = document.getElementById("nextMove");

function initializeBoard() {
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

    if (height[colIdx] < 6) {
      height[colIdx]++;
      turn++;
      state.columns[colIdx][height[colIdx]] = move;

      const nodeWhereMoveLandsId = `col-${colIdx}:${height[colIdx]}`;
      const classNameColor = move[0] === "R" ? "red" : "yellow";

      const NODE_WHERE_MOVE_LANDS =
        document.getElementById(nodeWhereMoveLandsId);
      NODE_WHERE_MOVE_LANDS.firstElementChild.className = `${classNameColor}-piece`;

      NEXT_MOVE.className = move[0] === "R" ? "yellow" : "red";
      NEXT_MOVE.innerText = move[0] === "R" ? player2 : player1;
    }

    const { won, winType } = didWin();

    if (won) {
      document.body.style.backgroundColor = "green";
      document.getElementById("gameMsg").innerText = `Winner: ${winType}`;
    }
  });
}

const nextComputerMove = () =>
  COLUMNS[Math.floor(Math.random() * COLUMNS.length)].firstElementChild.click();

let computerMoveInterval;

function handleComputerMove() {
  if (NEXT_MOVE.innerText === "Computer") {
    nextComputerMove();
  }
}

function listenForComputerMoves() {
  computerMoveInterval = setInterval(() => {
    handleComputerMove();
  }, 1000);
}

function startGame() {
  console.log("game time! :)");
  document.getElementById("enterNames").style.display = "none";
  document.getElementById("board").style.display = "flex";
  document.getElementById("whoseTurn").style.display = "flex";
  initializeBoard();
  if (!player1) {
    player1 = "Computer";
  }
  if (!player2) {
    player2 = "Computer";
  }
  document.getElementById("nextMove").innerText = player1;
  if (computerMoveInterval) {
    computerMoveInterval = undefined;
  }
  listenForComputerMoves();
}

/* ------------- Win Determination ------------- */

/////////////////////////////////
/* WIN CONSTANTS and UTILITIES */
/////////////////////////////////

const rowStartIds = new Array(6)
  .fill(null)
  .map((_, rowIdx) => `col-0:${rowIdx}`);

// start from bottom row
const colStartIds = new Array(7)
  .fill(null)
  .map((_, colIdx) => `col-${colIdx}:0`);

const diagonalAscendingStartIds = [
  "col-0:2",
  "col-0:1",
  "col-0:0",
  "col-1:0",
  "col-2:0",
  "col-3:0",
];

const diagonalDescendingStartIds = [
  "col-3:5",
  "col-2:5",
  "col-1:5",
  "col-0:5",
  "col-0:4",
  "col-0:3",
];

const idArrays = {
  row: rowStartIds,
  column: colStartIds,
  diagonalAscending: diagonalAscendingStartIds,
  diagonalDescending: diagonalDescendingStartIds,
};

/////////////////////
/* WIN CHECK LOGIC */
/////////////////////

function getDirection(kind) {
  let direction;

  switch (kind) {
    case "row":
      direction = [1, 0];
      break;
    case "column":
      direction = [0, 1];
      break;
    case "diagonalAscending":
      direction = [1, 1];
      break;
    case "diagonalDescending":
      direction = [1, -1];
      break;
  }

  return direction;
}

const getMatrix = () => state.columns;

function getCoord(id) {
  return id
    .slice(4)
    .split(":")
    .map((val) => +val);
}

function foundWin(startCol, startRow, direction, count, totalCount, matrix) {
  // if check goes off game board function will throw err
  // try-catch allows us to return false
  try {
    const nextCol = startCol + direction[0];
    const nextRow = startRow + direction[1];

    const startPos = matrix[startCol][startRow];
    const nextPos = matrix[nextCol][nextRow];

    if (startPos !== nextPos || !startPos || !nextPos) {
      count = 0;
    }

    if (count === 3 && startPos === nextPos) {
      return true;
    }

    if (totalCount === 6) {
      return false;
    }

    if (startPos !== nextPos) {
      count = 0;
    }

    return foundWin(nextCol, nextRow, direction, ++count, ++totalCount, matrix);
  } catch (err) {
    return false;
  }
}

function checkWin(kind) {
  const idArray = idArrays[kind];
  const direction = getDirection(kind);
  const matrix = getMatrix();

  for (let i = 0; i < idArray.length; i++) {
    const [startCol, startRow] = getCoord(idArray[i]);
    let count = 0;
    let totalCount = 0;

    console.log("init values", {
      kind,
      startCol,
      startRow,
      direction,
      count,
      matrix,
    });

    if (
      foundWin(startCol, startRow, direction, ++count, ++totalCount, matrix)
    ) {
      return true;
    }
  }

  return false;
}

function didWin() {
  const kinds = Object.keys(idArrays);

  for (let i = 0; i < kinds.length; i++) {
    if (checkWin(kinds[i])) {
      return { won: true, msg: "you won!" };
    }
  }

  return { won: false, msg: "keep trying" };
}
