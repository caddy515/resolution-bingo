const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const ROOT = '/Users/evanluscher/resolution-bingo';
const ASSETS = path.join(ROOT, 'assets/images');

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function mix(c1, c2, t) {
  return [
    Math.round(lerp(c1[0], c2[0], t)),
    Math.round(lerp(c1[1], c2[1], t)),
    Math.round(lerp(c1[2], c2[2], t)),
    Math.round(lerp(c1[3] ?? 255, c2[3] ?? 255, t)),
  ];
}

function createPng(size, fill = [0, 0, 0, 0]) {
  const png = new PNG({ width: size, height: size });
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      setPixel(png, x, y, fill);
    }
  }
  return png;
}

function setPixel(png, x, y, rgba) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) {
    return;
  }
  const idx = (png.width * y + x) * 4;
  png.data[idx] = rgba[0];
  png.data[idx + 1] = rgba[1];
  png.data[idx + 2] = rgba[2];
  png.data[idx + 3] = rgba[3] ?? 255;
}

function blendPixel(png, x, y, rgba) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) {
    return;
  }
  const idx = (png.width * y + x) * 4;
  const srcA = (rgba[3] ?? 255) / 255;
  const dstA = png.data[idx + 3] / 255;
  const outA = srcA + dstA * (1 - srcA);

  if (outA <= 0) {
    return;
  }

  png.data[idx] = Math.round((rgba[0] * srcA + png.data[idx] * dstA * (1 - srcA)) / outA);
  png.data[idx + 1] = Math.round((rgba[1] * srcA + png.data[idx + 1] * dstA * (1 - srcA)) / outA);
  png.data[idx + 2] = Math.round((rgba[2] * srcA + png.data[idx + 2] * dstA * (1 - srcA)) / outA);
  png.data[idx + 3] = Math.round(outA * 255);
}

function fillRect(png, x, y, w, h, rgba) {
  const left = Math.floor(x);
  const top = Math.floor(y);
  const right = Math.ceil(x + w);
  const bottom = Math.ceil(y + h);
  for (let py = top; py < bottom; py += 1) {
    for (let px = left; px < right; px += 1) {
      setPixel(png, px, py, rgba);
    }
  }
}

function fillRoundedRect(png, x, y, w, h, radius, rgba) {
  const left = Math.floor(x);
  const top = Math.floor(y);
  const right = Math.ceil(x + w);
  const bottom = Math.ceil(y + h);
  const r = radius;

  for (let py = top; py < bottom; py += 1) {
    for (let px = left; px < right; px += 1) {
      const rx = px + 0.5;
      const ry = py + 0.5;
      const dx = Math.max(Math.max(x + r - rx, 0), rx - (x + w - r));
      const dy = Math.max(Math.max(y + r - ry, 0), ry - (y + h - r));
      if (dx * dx + dy * dy <= r * r) {
        setPixel(png, px, py, rgba);
      }
    }
  }
}

function fillCircle(png, cx, cy, radius, rgba) {
  const left = Math.floor(cx - radius);
  const top = Math.floor(cy - radius);
  const right = Math.ceil(cx + radius);
  const bottom = Math.ceil(cy + radius);
  const rr = radius * radius;

  for (let py = top; py < bottom; py += 1) {
    for (let px = left; px < right; px += 1) {
      const dx = px + 0.5 - cx;
      const dy = py + 0.5 - cy;
      if (dx * dx + dy * dy <= rr) {
        setPixel(png, px, py, rgba);
      }
    }
  }
}

function drawGradientBackground(png, colors) {
  const size = png.width;
  const centerX = size * 0.35;
  const centerY = size * 0.18;
  const maxDist = Math.sqrt((size - centerX) ** 2 + (size - centerY) ** 2);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const diag = (x + y) / (size * 2);
      const radial = clamp(Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2) / maxDist, 0, 1);
      const tone = clamp(diag * 0.72 + radial * 0.48, 0, 1);
      const color = tone < 0.52
        ? mix(colors[0], colors[1], tone / 0.52)
        : mix(colors[1], colors[2], (tone - 0.52) / 0.48);
      setPixel(png, x, y, color);
    }
  }
}

function drawSparkle(png, cx, cy, size, rgba) {
  fillCircle(png, cx, cy, size * 0.26, rgba);
  fillRoundedRect(png, cx - size * 0.08, cy - size * 0.5, size * 0.16, size, size * 0.06, rgba);
  fillRoundedRect(png, cx - size * 0.5, cy - size * 0.08, size, size * 0.16, size * 0.06, rgba);
}

function drawCheck(png, x, y, w, h, rgba) {
  const points = [
    [x + w * 0.18, y + h * 0.56],
    [x + w * 0.42, y + h * 0.8],
    [x + w * 0.84, y + h * 0.22],
  ];

  drawThickLine(png, points[0], points[1], Math.max(10, Math.round(w * 0.1)), rgba);
  drawThickLine(png, points[1], points[2], Math.max(10, Math.round(w * 0.1)), rgba);
}

function drawThickLine(png, p1, p2, thickness, rgba) {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  const minX = Math.floor(Math.min(x1, x2) - thickness);
  const maxX = Math.ceil(Math.max(x1, x2) + thickness);
  const minY = Math.floor(Math.min(y1, y2) - thickness);
  const maxY = Math.ceil(Math.max(y1, y2) + thickness);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  const radiusSq = (thickness * 0.5) ** 2;

  for (let py = minY; py <= maxY; py += 1) {
    for (let px = minX; px <= maxX; px += 1) {
      const t = clamp(((px - x1) * dx + (py - y1) * dy) / lenSq, 0, 1);
      const projX = x1 + dx * t;
      const projY = y1 + dy * t;
      const distSq = (px - projX) ** 2 + (py - projY) ** 2;
      if (distSq <= radiusSq) {
        setPixel(png, px, py, rgba);
      }
    }
  }
}

function addConfetti(png) {
  const palette = [
    [249, 115, 22, 140],
    [244, 63, 94, 130],
    [34, 197, 94, 125],
    [59, 130, 246, 120],
    [250, 204, 21, 130],
  ];
  const positions = [
    [0.13, 0.18, 26, 8, 0],
    [0.85, 0.14, 34, 10, 1],
    [0.18, 0.83, 30, 8, 2],
    [0.83, 0.82, 26, 8, 3],
    [0.11, 0.55, 18, 18, 4],
    [0.9, 0.53, 18, 18, 1],
  ];

  positions.forEach(([nx, ny, w, h, colorIndex]) => {
    fillRoundedRect(
      png,
      png.width * nx,
      png.height * ny,
      w,
      h,
      Math.min(w, h) * 0.5,
      palette[colorIndex]
    );
  });
}

function drawMainIcon(size) {
  const png = createPng(size);
  drawGradientBackground(png, [
    [255, 245, 224, 255],
    [252, 211, 153, 255],
    [234, 88, 12, 255],
  ]);

  const inset = size * 0.075;
  fillRoundedRect(png, inset, inset, size - inset * 2, size - inset * 2, size * 0.19, [15, 23, 42, 24]);
  fillRoundedRect(png, inset, inset - size * 0.01, size - inset * 2, size - inset * 2, size * 0.19, [255, 251, 235, 255]);

  addConfetti(png);

  const boardSize = size * 0.67;
  const boardX = (size - boardSize) / 2;
  const boardY = size * 0.2;
  const cellGap = size * 0.016;
  const cellSize = (boardSize - cellGap * 4) / 5;

  fillRoundedRect(png, boardX - size * 0.024, boardY - size * 0.024, boardSize + size * 0.048, boardSize + size * 0.048, size * 0.055, [255, 255, 255, 160]);
  fillRoundedRect(png, boardX, boardY, boardSize, boardSize, size * 0.045, [255, 255, 255, 250]);

  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      const x = boardX + col * (cellSize + cellGap);
      const y = boardY + row * (cellSize + cellGap);
      const isCenter = row === 2 && col === 2;
      const isWinning = row === col;
      const fill = isCenter
        ? [255, 247, 237, 255]
        : isWinning
          ? [220, 252, 231, 255]
          : [248, 250, 252, 255];
      const border = isCenter
        ? [251, 146, 60, 255]
        : isWinning
          ? [74, 222, 128, 255]
          : [203, 213, 225, 255];
      fillRoundedRect(png, x, y, cellSize, cellSize, size * 0.018, border);
      fillRoundedRect(png, x + size * 0.004, y + size * 0.004, cellSize - size * 0.008, cellSize - size * 0.008, size * 0.015, fill);

      if (isCenter) {
        drawSparkle(png, x + cellSize / 2, y + cellSize / 2, cellSize * 0.62, [251, 146, 60, 255]);
      } else if (isWinning) {
        drawCheck(png, x + cellSize * 0.12, y + cellSize * 0.1, cellSize * 0.78, cellSize * 0.82, [22, 163, 74, 255]);
      } else {
        fillRoundedRect(png, x + cellSize * 0.18, y + cellSize * 0.2, cellSize * 0.64, cellSize * 0.1, cellSize * 0.04, [226, 232, 240, 255]);
        fillRoundedRect(png, x + cellSize * 0.18, y + cellSize * 0.4, cellSize * 0.44, cellSize * 0.1, cellSize * 0.04, [226, 232, 240, 255]);
      }
    }
  }

  drawSparkle(png, size * 0.19, size * 0.17, size * 0.07, [255, 255, 255, 200]);
  drawSparkle(png, size * 0.82, size * 0.2, size * 0.055, [255, 244, 214, 180]);

  return png;
}

function drawForeground(size) {
  const png = createPng(size);
  const boardSize = size * 0.72;
  const boardX = (size - boardSize) / 2;
  const boardY = (size - boardSize) / 2;
  const gap = size * 0.018;
  const cellSize = (boardSize - gap * 4) / 5;

  fillRoundedRect(png, boardX - size * 0.03, boardY - size * 0.03, boardSize + size * 0.06, boardSize + size * 0.06, size * 0.06, [255, 255, 255, 235]);
  fillRoundedRect(png, boardX, boardY, boardSize, boardSize, size * 0.05, [255, 255, 255, 255]);

  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      const x = boardX + col * (cellSize + gap);
      const y = boardY + row * (cellSize + gap);
      const isCenter = row === 2 && col === 2;
      const isWinning = row === col;

      fillRoundedRect(png, x, y, cellSize, cellSize, size * 0.02, isWinning ? [255, 236, 210, 255] : [245, 247, 250, 255]);
      if (isCenter) {
        drawSparkle(png, x + cellSize / 2, y + cellSize / 2, cellSize * 0.58, [249, 115, 22, 255]);
      } else if (isWinning) {
        drawCheck(png, x + cellSize * 0.12, y + cellSize * 0.1, cellSize * 0.78, cellSize * 0.82, [249, 115, 22, 255]);
      } else {
        fillRoundedRect(png, x + cellSize * 0.2, y + cellSize * 0.24, cellSize * 0.6, cellSize * 0.1, cellSize * 0.04, [203, 213, 225, 255]);
        fillRoundedRect(png, x + cellSize * 0.2, y + cellSize * 0.45, cellSize * 0.42, cellSize * 0.1, cellSize * 0.04, [203, 213, 225, 255]);
      }
    }
  }

  return png;
}

function drawBackground(size) {
  const png = createPng(size);
  drawGradientBackground(png, [
    [255, 244, 222, 255],
    [251, 191, 36, 255],
    [234, 88, 12, 255],
  ]);
  addConfetti(png);
  return png;
}

function drawMonochrome(size) {
  const png = createPng(size);
  const black = [15, 23, 42, 255];
  const boardSize = size * 0.78;
  const boardX = (size - boardSize) / 2;
  const boardY = (size - boardSize) / 2;
  const gap = size * 0.02;
  const cellSize = (boardSize - gap * 4) / 5;
  fillRoundedRect(png, boardX - size * 0.04, boardY - size * 0.04, boardSize + size * 0.08, boardSize + size * 0.08, size * 0.065, black);
  fillRoundedRect(png, boardX, boardY, boardSize, boardSize, size * 0.045, [255, 255, 255, 0]);

  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      const x = boardX + col * (cellSize + gap);
      const y = boardY + row * (cellSize + gap);
      fillRoundedRect(png, x, y, cellSize, cellSize, size * 0.018, black);
      if (row === col && !(row === 2 && col === 2)) {
        drawCheck(png, x + cellSize * 0.12, y + cellSize * 0.1, cellSize * 0.78, cellSize * 0.82, [255, 255, 255, 255]);
      }
      if (row === 2 && col === 2) {
        drawSparkle(png, x + cellSize / 2, y + cellSize / 2, cellSize * 0.58, [255, 255, 255, 255]);
      }
    }
  }

  return png;
}

function savePng(png, filename) {
  const target = path.join(ASSETS, filename);
  fs.writeFileSync(target, PNG.sync.write(png));
  console.log(`wrote ${target}`);
}

savePng(drawMainIcon(1024), 'icon.png');
savePng(drawMainIcon(1024), 'splash-icon.png');
savePng(drawMainIcon(48), 'favicon.png');
savePng(drawForeground(512), 'android-icon-foreground.png');
savePng(drawBackground(512), 'android-icon-background.png');
savePng(drawMonochrome(432), 'android-icon-monochrome.png');
