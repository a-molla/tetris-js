const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");

context.scale(20, 20);

context.fillStyle = "#000";
context.fillRect(0, 0, 20, 20);

// Represented as a 2D Matrix

// T piece
const matrix = [[0, 0, 0], [1, 1, 1], [0, 1, 0]];

function collide(arena, player) {
  const [matrix, position] = [player.matrix, player.pos];
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (
        matrix[y][x] !== 0 && (arena[y + position.y] && arena[y + position.y][x + position.x]) !== 0
      ) {
        return true;
      }
    }
  }
  return false;
}

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
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
        context.fillStyle = "red";
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

const player = {
  pos: { x: 5, y: 5 },
  matrix: matrix
};

const arena = createMatrix(20, 20);

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value != 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    player.pos.y = 0;
  }
  dropCounter = 0; // If a manual drop occurs, restart the drop delay.
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;

  if (dropCounter > dropInterval) {
    playerDrop()
  }

  draw();
  requestAnimationFrame(update);
}

document.addEventListener("keydown", event => {
  const { keyCode } = event;

  if (keyCode === 37) {
    player.pos.x--;
  }

  if (keyCode === 39) {
    player.pos.x++;
  }

  if (keyCode === 40) {
    playerDrop();
  }
});

update();
