// Procedural Three.js CanvasTexture Generators for Skyscrapers, Signs, and Clock
const THREE = window.THREE;

export function createSkyscraperTexture(baseHex, windowLitHex, cols, rows) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, c.width, c.height);

  const padX = 8;
  const padY = 10;
  const cellW = (c.width - padX * 2) / cols;
  const cellH = (c.height - padY * 2) / rows;

  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const rand = Math.sin(r * 19.3 + col * 7.7) * 0.5 + 0.5;
      if (rand > 0.28) {
        ctx.fillStyle = rand > 0.65 ? windowLitHex : '#334155';
      } else {
        ctx.fillStyle = '#0f172a';
      }
      ctx.fillRect(padX + col * cellW + 3, padY + r * cellH + 3, cellW - 6, cellH - 6);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function createSignTexture(text, subtext, bgHex, accentHex, textColor) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 160;
  const ctx = c.getContext('2d');
  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, c.width, c.height);

  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, c.width - 16, c.height - 16);

  const colors = ['#ec4899', '#22d3ee', '#a3e635', '#facc15'];
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.arc(35 + (i * 64) % 450, i % 2 === 0 ? 28 : 132, 12 + (i % 3) * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = textColor || '#ffffff';
  ctx.font = '900 40px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, c.width / 2, subtext ? 64 : 80);

  if (subtext) {
    ctx.fillStyle = accentHex;
    ctx.font = '800 24px Inter, sans-serif';
    ctx.fillText(subtext, c.width / 2, 114);
  }
  return new THREE.CanvasTexture(c);
}

export function createClockTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 256, 256);

  ctx.beginPath();
  ctx.arc(128, 128, 110, 0, Math.PI * 2);
  ctx.fillStyle = '#fef3c7';
  ctx.fill();
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#d97706';
  ctx.stroke();

  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 6;
  for (let i = 0; i < 12; i++) {
    const ang = (i * Math.PI) / 6;
    ctx.beginPath();
    ctx.moveTo(128 + Math.cos(ang) * 82, 128 + Math.sin(ang) * 82);
    ctx.lineTo(128 + Math.cos(ang) * 98, 128 + Math.sin(ang) * 98);
    ctx.stroke();
  }

  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(128, 128);
  ctx.lineTo(128, 62);
  ctx.stroke();

  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(128, 128);
  ctx.lineTo(178, 128);
  ctx.stroke();

  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.arc(128, 128, 10, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(c);
}
