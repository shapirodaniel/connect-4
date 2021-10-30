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

    if (state.columns[colIdx].length < 6) {
      state.columns[colIdx].push(move);
      turn++;

      const classNameColor = move[0] === "R" ? "red" : "yellow";
      const nodeWhereMoveLandsId = getNodeIdFromState(colIdx);

      const NODE_WHERE_MOVE_LANDS =
        document.getElementById(nodeWhereMoveLandsId);
      NODE_WHERE_MOVE_LANDS.firstElementChild.className = `${classNameColor}-piece`;

      NEXT_MOVE.className = move[0] === "R" ? "yellow" : "red";
      NEXT_MOVE.innerText = move[0] === "R" ? player2 : player1;
    }

    const { won, winType } = didWin();

    if (won) {
      console.log("winner");
      document.body.style.backgroundColor = "green";
      document.getElementById("gameMsg").innerText = `Winner: ${winType}`;
    }
  });
}

let nextComputerMove = () =>
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

///////////////////////
/* WIN DETERMINATION */
///////////////////////

function didWin() {
  let status = { won: false, winType: "" };

  return status;
}
