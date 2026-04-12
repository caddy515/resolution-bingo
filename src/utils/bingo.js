export function getBingoLines() {
  const lines = [];

  for (let row = 0; row < 5; row += 1) {
    lines.push([0, 1, 2, 3, 4].map((column) => row * 5 + column));
  }

  for (let column = 0; column < 5; column += 1) {
    lines.push([0, 1, 2, 3, 4].map((row) => row * 5 + column));
  }

  lines.push([0, 6, 12, 18, 24]);
  lines.push([4, 8, 12, 16, 20]);

  return lines;
}

export function computeBingos(squares = []) {
  return getBingoLines().filter((line) => line.every((index) => squares[index]?.completed));
}

export function isBlackout(squares = []) {
  return squares.length === 25 && squares.every((square) => square.completed);
}
