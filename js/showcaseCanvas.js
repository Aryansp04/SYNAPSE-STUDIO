/**
 * NEXUS STUDIO - Interactive Live Showcase Canvas
 * Generative particle wavefield & real-time audio-visual sandbox
 */

export function initShowcaseCanvas() {
  const canvas = document.getElementById('showcase-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;

  const resize = () => {
    const parent = canvas.parentElement;
    width = canvas.width = parent.clientWidth;
    height = canvas.height = parent.clientHeight;
  };

  resize();
  window.addEventListener('resize', resize);

  // Playground state
  const state = {
    particleCount: 160,
    frequency: 3.5,
    speed: 1.2,
    distortion: 40,
    colorScheme: 'cyan-violet', // 'cyan-violet' | 'matrix-emerald' | 'sunset-amber'
    hoverX: width / 2,
    hoverY: height / 2,
    isHovered: false
  };

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    state.hoverX = e.clientX - rect.left;
    state.hoverY = e.clientY - rect.top;
    state.isHovered = true;
  });

  canvas.addEventListener('mouseleave', () => {
    state.isHovered = false;
  });

  // Connect Sliders & Controls
  const countSlider = document.getElementById('slider-density');
  const speedSlider = document.getElementById('slider-speed');
  const distortSlider = document.getElementById('slider-distortion');

  if (countSlider) {
    countSlider.addEventListener('input', (e) => {
      state.particleCount = parseInt(e.target.value, 10);
      const valEl = document.getElementById('val-density');
      if (valEl) valEl.textContent = state.particleCount;
    });
  }

  if (speedSlider) {
    speedSlider.addEventListener('input', (e) => {
      state.speed = parseFloat(e.target.value);
      const valEl = document.getElementById('val-speed');
      if (valEl) valEl.textContent = state.speed.toFixed(1) + 'x';
    });
  }

  if (distortSlider) {
    distortSlider.addEventListener('input', (e) => {
      state.distortion = parseInt(e.target.value, 10);
      const valEl = document.getElementById('val-distortion');
      if (valEl) valEl.textContent = state.distortion + 'px';
    });
  }

  // Presets
  window.setVisualPreset = (presetName) => {
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`[data-preset="${presetName}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    if (presetName === 'quantum') {
      state.particleCount = 180;
      state.speed = 1.0;
      state.distortion = 35;
      state.colorScheme = 'cyan-violet';
    } else if (presetName === 'neural') {
      state.particleCount = 240;
      state.speed = 2.2;
      state.distortion = 70;
      state.colorScheme = 'matrix-emerald';
    } else if (presetName === 'horizon') {
      state.particleCount = 120;
      state.speed = 0.6;
      state.distortion = 90;
      state.colorScheme = 'sunset-amber';
    }

    if (countSlider) countSlider.value = state.particleCount;
    if (speedSlider) speedSlider.value = state.speed;
    if (distortSlider) distortSlider.value = state.distortion;

    const valD = document.getElementById('val-density');
    const valS = document.getElementById('val-speed');
    const valM = document.getElementById('val-distortion');
    if (valD) valD.textContent = state.particleCount;
    if (valS) valS.textContent = state.speed.toFixed(1) + 'x';
    if (valM) valM.textContent = state.distortion + 'px';
  };

  // Color Palettes
  const getColor = (normX, normY, time) => {
    if (state.colorScheme === 'matrix-emerald') {
      const alpha = 0.4 + 0.6 * Math.sin(normX * 5 + time);
      return `rgba(16, 185, 129, ${alpha.toFixed(2)})`;
    }
    if (state.colorScheme === 'sunset-amber') {
      const r = Math.floor(236 + 19 * Math.sin(time + normX));
      const g = Math.floor(72 + 50 * Math.cos(time + normY));
      const b = 153;
      return `rgba(${r}, ${g}, ${b}, 0.8)`;
    }
    // Default: cyan-violet
    const mix = 0.5 + 0.5 * Math.sin(normX * 3 + time);
    const r = Math.floor(0 * (1 - mix) + 139 * mix);
    const g = Math.floor(240 * (1 - mix) + 92 * mix);
    const b = Math.floor(255 * (1 - mix) + 246 * mix);
    return `rgba(${r}, ${g}, ${b}, 0.85)`;
  };

  let time = 0;

  function render() {
    requestAnimationFrame(render);
    time += 0.015 * state.speed;

    // Dark semi-transparent fade for motion blur trail
    ctx.fillStyle = 'rgba(6, 8, 14, 0.22)';
    ctx.fillRect(0, 0, width, height);

    const rows = 16;
    const cols = Math.floor(state.particleCount / rows);
    const spacingX = width / (cols + 1);
    const spacingY = height / (rows + 1);

    const nodes = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const baseX = (c + 1) * spacingX;
        const baseY = (r + 1) * spacingY;

        // Wave formula
        const waveX = Math.sin(c * 0.4 + time * state.frequency) * (state.distortion * 0.35);
        const waveY = Math.cos(r * 0.35 + c * 0.2 + time) * state.distortion;

        let posX = baseX + waveX;
        let posY = baseY + waveY;

        // Cursor attraction / repulsion
        if (state.isHovered) {
          const dx = posX - state.hoverX;
          const dy = posY - state.hoverY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140 && dist > 0) {
            const force = (1 - dist / 140) * 45;
            posX += (dx / dist) * force;
            posY += (dy / dist) * force;
          }
        }

        nodes.push({ x: posX, y: posY, c: c, r: r });
      }
    }

    // Draw connecting dynamic mesh lines
    ctx.lineWidth = 0.75;
    for (let i = 0; i < nodes.length; i++) {
      const p1 = nodes[i];
      // Connect to right neighbor
      if (p1.c < cols - 1) {
        const p2 = nodes[i + 1];
        ctx.strokeStyle = getColor(p1.x / width, p1.y / height, time);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
      // Connect to bottom neighbor
      if (p1.r < rows - 1) {
        const p3 = nodes[i + cols];
        if (p3) {
          ctx.strokeStyle = getColor(p1.x / width, p1.y / height, time);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.stroke();
        }
      }
    }

    // Draw glowing nodes
    for (let i = 0; i < nodes.length; i++) {
      const p = nodes[i];
      const color = getColor(p.x / width, p.y / height, time);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  render();
}
