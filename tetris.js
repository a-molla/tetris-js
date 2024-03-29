const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");

context.scale(20, 20);
context.fillStyle = "#000";
context.fillRect(0, 0, canvas.clientWidth, canvas.height);

// Properties
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

// Instances

const player = {
  pos: { x: 5, y: 5 },
  matrix: null,
  score: 0
};

const colors = [
  null,
  "red",
  "blue",
  "green",
  "violet",
  "purple",
  "grey",
  "yellow"
];

const arena = createMatrix(12, 20);

// ---

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function createPiece(type) {
  switch (type) {
    case "T":
      return [[0, 0, 0], [1, 1, 1], [0, 1, 0]];
    case "O":
      return [[2, 2], [2, 2]];
    case "L":
      return [[0, 3, 0], [0, 3, 0], [0, 3, 3]];
    case "J":
      return [[0, 4, 0], [0, 4, 0], [4, 4, 0]];
    case "I":
      return [[0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0]];
    case "S":
      return [[0, 6, 6], [6, 6, 0], [0, 0, 0]];
    case "Z":
      return [[7, 7, 0], [0, 7, 7], [0, 0, 0]];
    default:
      return [];
  }
}

function draw() {
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.clientWidth, canvas.height);
  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

// ---

function arenaSweep() {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y > 0; y--) {
    for (let x = 0; x < arena[y].length; x++) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    // Remove the row from the arena, fill it with 0, add it to the top.
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;
    player.score += rowCount * 10;
    rowCount *= 2;
  }
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value != 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function collide(arena, player) {
  const [matrix, position] = [player.matrix, player.pos];
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (
        matrix[y][x] !== 0 &&
        (arena[y + position.y] && arena[y + position.y][x + position.x]) !== 0
      ) {
        return true;
      }
    }
  }
  return false;
}

// ---

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0; // If a manual drop occurs, restart the drop delay.
}

function playerMove(direction) {
  player.pos.x += direction;
  if (collide(arena, player)) {
    player.pos.x -= direction;
  }
}

function playerRotate(direction) {
  const position = player.pos.x;
  let offset = 1;

  rotate(player.matrix, direction);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -direction);
      player.pos.x = position;
      return;
    }
  }
}

function playerReset() {
  const pieces = "ILJOTSZ";
  player.matrix = createPiece(pieces[(pieces.length * Math.random()) | 0]);
  player.pos.y = 0;
  player.pos.x =
    ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);

  // Clear arena if game over.
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
  }
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < y; x++) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }

  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

// ---

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;

  if (dropCounter > dropInterval) {
    playerDrop();
  }

  draw();
  requestAnimationFrame(update);
}

function updateScore() {
  document.getElementById("score").innerText = player.score;
}

document.addEventListener("keydown", event => {
  const { keyCode } = event;

  if (keyCode === 37) {
    playerMove(-1);
  }

  if (keyCode === 39) {
    playerMove(1);
  }

  if (keyCode === 40) {
    playerDrop();
  }

  if (keyCode === 81) {
    playerRotate(-1);
  }

  if (keyCode === 87) {
    playerRotate(1);
  }
});

playerReset();
updateScore();
update();
