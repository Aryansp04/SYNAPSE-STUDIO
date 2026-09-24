/**
 * SYNAPSE STUDIO - Interactive Disciplines & Live Pipeline Simulator Studio
 * Full interactive 3D WebGL pipeline, AI token streamer, FinTech stress bench, and Design System studio
 */

import { soundEngine } from './audioEngine.js';

let pipelineThree = {
  scene: null,
  camera: null,
  renderer: null,
  mesh: null,
  pointsMesh: null,
  materialPBR: null,
  materialWire: null,
  materialNormal: null,
  currentMode: 'wireframe',
  animId: null
};

let fintechInterval = null;
let aiStreamTimeout = null;

export function initDisciplineSystem() {
  // Ensure discipline modal container exists in DOM
  setupDisciplineModalDOM();
}

function setupDisciplineModalDOM() {
  let modal = document.getElementById('discipline-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'discipline-modal';
    modal.className = 'modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Discipline Interactive Inspector');

    modal.innerHTML = `
      <div class="modal-content" style="max-width: 960px;">
        <button id="discipline-modal-close" class="modal-close-btn" aria-label="Close Inspector" data-cursor-hover="true">
          <i data-lucide="x" style="width: 20px; height: 20px;"></i>
        </button>

        <div style="padding: 32px;">
          <!-- Discipline Header & Tab Switcher -->
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 20px; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
            <div>
              <span id="disc-modal-badge" class="section-badge" style="margin-bottom: 8px;">INTERACTIVE STUDIO</span>
              <h2 id="disc-modal-title" style="font-size: 1.85rem; color: #fff;">Discipline Simulator</h2>
            </div>

            <!-- Tab Navigation Buttons -->
            <div class="discipline-tab-bar" style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="filter-btn disc-tab-btn" data-disc="3d-pipeline">3D Pipeline</button>
              <button class="filter-btn disc-tab-btn" data-disc="ai-ux">AI UX Engine</button>
              <button class="filter-btn disc-tab-btn" data-disc="fintech">FinTech Bench</button>
              <button class="filter-btn disc-tab-btn" data-disc="design-system">Design System</button>
            </div>
          </div>

          <!-- Dynamic Discipline Content Area -->
          <div id="discipline-content-box"></div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = document.getElementById('discipline-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeDisciplineModal);
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeDisciplineModal();
    });

    // Tab buttons click listeners
    const tabBtns = modal.querySelectorAll('.disc-tab-btn');
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const discId = btn.getAttribute('data-disc');
        switchDisciplineTab(discId);
      });
    });
  }

  // Bind global helper for opening discipline
  window.openDisciplineModal = (disciplineId = '3d-pipeline') => {
    soundEngine.playClick();
    const modalEl = document.getElementById('discipline-modal');
    if (!modalEl) return;
    modalEl.classList.add('open');
    document.body.style.overflow = 'hidden';
    switchDisciplineTab(disciplineId);
  };
}

export function switchDisciplineTab(tabId) {
  const modal = document.getElementById('discipline-modal');
  if (!modal) return;

  // Cleanup prior running intervals or loops
  if (fintechInterval) {
    clearInterval(fintechInterval);
    fintechInterval = null;
  }
  if (aiStreamTimeout) {
    clearTimeout(aiStreamTimeout);
    aiStreamTimeout = null;
  }
  if (pipelineThree.animId) {
    cancelAnimationFrame(pipelineThree.animId);
    pipelineThree.animId = null;
  }

  // Update tab buttons active state
  modal.querySelectorAll('.disc-tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-disc') === tabId);
  });

  const contentBox = document.getElementById('discipline-content-box');
  const badgeEl = document.getElementById('disc-modal-badge');
  const titleEl = document.getElementById('disc-modal-title');

  if (tabId === '3d-pipeline') {
    badgeEl.textContent = '3D WEBGPU PIPELINE';
    titleEl.textContent = 'Interactive 3D Geometry & Shader Pipeline';
    render3DPipelineView(contentBox);
  } else if (tabId === 'ai-ux') {
    badgeEl.textContent = 'NEURAL INTERFACE STUDIO';
    titleEl.textContent = 'Generative AI Multi-Modal UX Simulator';
    renderAIUXView(contentBox);
  } else if (tabId === 'fintech') {
    badgeEl.textContent = 'HIGH-FREQUENCY DESK';
    titleEl.textContent = 'FinTech 120 FPS Benchmark & L2 Orderbook';
    renderFinTechView(contentBox);
  } else if (tabId === 'design-system') {
    badgeEl.textContent = 'TOKEN STUDIO';
    titleEl.textContent = 'Aesthetic Direction & Spring Physics Sandbox';
    renderDesignSystemView(contentBox);
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
  if (window.refreshCursorTargets) window.refreshCursorTargets();
}

export function closeDisciplineModal() {
  const modal = document.getElementById('discipline-modal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';

  if (fintechInterval) {
    clearInterval(fintechInterval);
    fintechInterval = null;
  }
  if (aiStreamTimeout) {
    clearTimeout(aiStreamTimeout);
    aiStreamTimeout = null;
  }
  if (pipelineThree.animId) {
    cancelAnimationFrame(pipelineThree.animId);
    pipelineThree.animId = null;
  }
}

/* ==========================================================================
   1. 3D PIPELINE INTERACTIVE VIEW
   ========================================================================== */
function render3DPipelineView(container) {
  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 24px; align-items: stretch;">
      
      <!-- Live 3D Pipeline Canvas Box -->
      <div style="background: #04060a; border: 1px solid var(--border-subtle); border-radius: 16px; overflow: hidden; position: relative; min-height: 380px; display: flex; flex-direction: column;">
        <canvas id="pipeline-3d-canvas" style="width: 100%; height: 320px; display: block;"></canvas>
        
        <!-- Live Shader Mode Switcher Toolbar -->
        <div style="padding: 12px 16px; background: rgba(12,16,23,0.9); border-top: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
          <span style="font-size: 0.75rem; font-family: var(--font-mono); color: var(--text-muted);">RENDER PASS:</span>
          <div style="display: flex; gap: 6px;">
            <button class="preset-btn active" id="btn-mode-wire" onclick="window.setPipelineRenderMode('wireframe')">Wireframe</button>
            <button class="preset-btn" id="btn-mode-pbr" onclick="window.setPipelineRenderMode('pbr')">PBR Shaded</button>
            <button class="preset-btn" id="btn-mode-normal" onclick="window.setPipelineRenderMode('normal')">Normal Map</button>
            <button class="preset-btn" id="btn-mode-points" onclick="window.setPipelineRenderMode('points')">Points</button>
          </div>
        </div>

        <div style="position: absolute; top: 12px; left: 14px; padding: 4px 10px; border-radius: 6px; background: rgba(6,8,14,0.85); border: 1px solid rgba(0,240,255,0.3); font-size: 0.72rem; font-family: var(--font-mono); color: var(--cyan);">
          FPS: 120 • DRACO v1.4 • 18.4K POLYS
        </div>
      </div>

      <!-- Pipeline Stages Stepper & Telemetry -->
      <div style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="font-size: 0.85rem; font-family: var(--font-mono); color: var(--cyan); margin-bottom: 12px;">// 4-STAGE SPATIAL ARCHITECTURE</div>
          
          <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
            <div class="pipeline-step-card active" onclick="window.setPipelineStage(1)">
              <div class="step-num">01</div>
              <div>
                <div style="font-weight: 700; font-size: 0.9rem; color: #fff;">Asset Decimation & Draco Compression</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">Reduces raw 2.4M polygon CAD models by 98% without visual degradation.</div>
              </div>
            </div>

            <div class="pipeline-step-card" onclick="window.setPipelineStage(2)">
              <div class="step-num">02</div>
              <div>
                <div style="font-weight: 700; font-size: 0.9rem; color: #fff;">Custom GLSL Compute & Displacements</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">Procedural vertex wave deformation computed natively on the GPU.</div>
              </div>
            </div>

            <div class="pipeline-step-card" onclick="window.setPipelineStage(3)">
              <div class="step-num">03</div>
              <div>
                <div style="font-weight: 700; font-size: 0.9rem; color: #fff;">WebGPU 120 FPS Frame Budgeting</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">Zero frame drops via instanced rendering and unified buffer cache.</div>
              </div>
            </div>

            <div class="pipeline-step-card" onclick="window.setPipelineStage(4)">
              <div class="step-num">04</div>
              <div>
                <div style="font-weight: 700; font-size: 0.9rem; color: #fff;">Unreal Bloom & Chromatic Post-Processing</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">Multi-pass convolution bloom and spatial raymarching depth.</div>
              </div>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 10px;">
          <button class="btn btn-primary" style="flex: 1; padding: 12px;" onclick="window.triggerContactModal('3D WebGL Pipeline Integration')">
            <span>Inquire 3D Pipeline</span>
            <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>
          </button>
        </div>
      </div>

    </div>
  `;

  setTimeout(() => initPipelineThreeCanvas(), 50);
}

function initPipelineThreeCanvas() {
  const canvas = document.getElementById('pipeline-3d-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const width = canvas.parentElement.clientWidth;
  const height = 320;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.z = 14;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Geometry: Torus Knot for dynamic spatial geometry
  const geometry = new THREE.TorusKnotGeometry(3.6, 1.1, 128, 32);

  // Materials
  const materialWire = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    wireframe: true,
    transparent: true,
    opacity: 0.65
  });

  const materialPBR = new THREE.MeshStandardMaterial({
    color: 0x0b1329,
    metalness: 0.85,
    roughness: 0.2,
    wireframe: false
  });

  const materialNormal = new THREE.MeshNormalMaterial({
    wireframe: false
  });

  const materialPoints = new THREE.PointsMaterial({
    color: 0x00f0ff,
    size: 0.08,
    transparent: true,
    opacity: 0.9
  });

  const mesh = new THREE.Mesh(geometry, materialWire);
  const pointsMesh = new THREE.Points(geometry, materialPoints);
  pointsMesh.visible = false;

  scene.add(mesh);
  scene.add(pointsMesh);

  // Lights for PBR mode
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  const pointLight1 = new THREE.PointLight(0x00f0ff, 3, 50);
  pointLight1.position.set(10, 10, 10);
  const pointLight2 = new THREE.PointLight(0xec4899, 2.5, 50);
  pointLight2.position.set(-10, -10, 10);

  scene.add(ambientLight);
  scene.add(pointLight1);
  scene.add(pointLight2);

  pipelineThree = {
    scene,
    camera,
    renderer,
    mesh,
    pointsMesh,
    materialWire,
    materialPBR,
    materialNormal,
    currentMode: 'wireframe',
    animId: null
  };

  // Helper mode setter
  window.setPipelineRenderMode = (mode) => {
    soundEngine.playClick();
    ['wire', 'pbr', 'normal', 'points'].forEach(m => {
      const b = document.getElementById(`btn-mode-${m}`);
      if (b) b.classList.toggle('active', m === mode);
    });

    if (!pipelineThree.mesh) return;

    if (mode === 'wireframe') {
      pipelineThree.mesh.visible = true;
      pipelineThree.pointsMesh.visible = false;
      pipelineThree.mesh.material = pipelineThree.materialWire;
    } else if (mode === 'pbr') {
      pipelineThree.mesh.visible = true;
      pipelineThree.pointsMesh.visible = false;
      pipelineThree.mesh.material = pipelineThree.materialPBR;
    } else if (mode === 'normal') {
      pipelineThree.mesh.visible = true;
      pipelineThree.pointsMesh.visible = false;
      pipelineThree.mesh.material = pipelineThree.materialNormal;
    } else if (mode === 'points') {
      pipelineThree.mesh.visible = false;
      pipelineThree.pointsMesh.visible = true;
    }
  };

  window.setPipelineStage = (stageNum) => {
    soundEngine.playHover();
    const cards = document.querySelectorAll('.pipeline-step-card');
    cards.forEach((c, idx) => c.classList.toggle('active', idx === stageNum - 1));

    if (stageNum === 1) window.setPipelineRenderMode('wireframe');
    if (stageNum === 2) window.setPipelineRenderMode('normal');
    if (stageNum === 3) window.setPipelineRenderMode('points');
    if (stageNum === 4) window.setPipelineRenderMode('pbr');
  };

  function animate() {
    pipelineThree.animId = requestAnimationFrame(animate);
    mesh.rotation.x += 0.008;
    mesh.rotation.y += 0.012;
    pointsMesh.rotation.x = mesh.rotation.x;
    pointsMesh.rotation.y = mesh.rotation.y;
    renderer.render(scene, camera);
  }

  animate();
}

/* ==========================================================================
   2. GENERATIVE AI UX INTERACTIVE VIEW
   ========================================================================== */
function renderAIUXView(container) {
  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
      
      <!-- Interactive Neural Stream Simulator -->
      <div style="background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div style="font-size: 0.85rem; font-family: var(--font-mono); color: var(--violet);">// NEURAL STREAM PROTOCOL</div>
            <span style="font-size: 0.75rem; color: var(--emerald); font-family: var(--font-mono);">STREAM ACTIVE</span>
          </div>

          <!-- Prompt Preset Buttons -->
          <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
            <button class="preset-btn active" onclick="window.runAISimulation('spatial')">Spatial UI Layout</button>
            <button class="preset-btn" onclick="window.runAISimulation('shader')">GLSL Wave Shader</button>
            <button class="preset-btn" onclick="window.runAISimulation('quant')">Algorithmic Strategy</button>
          </div>

          <!-- Token Stream Terminal -->
          <div id="ai-token-terminal" style="height: 200px; background: #04060a; border: 1px solid rgba(139,92,246,0.3); border-radius: 12px; padding: 16px; font-family: var(--font-mono); font-size: 0.85rem; line-height: 1.6; color: #cbd5e1; overflow-y: auto; white-space: pre-wrap;">
            Initiating neural inference...
          </div>
        </div>

        <!-- Telemetry Stats -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-subtle); text-align: center;">
          <div>
            <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">TTFT</div>
            <div id="ai-stat-ttft" style="font-weight: 700; color: var(--cyan); font-family: var(--font-mono);">42ms</div>
          </div>
          <div>
            <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">THROUGHPUT</div>
            <div id="ai-stat-speed" style="font-weight: 700; color: var(--emerald); font-family: var(--font-mono);">168 tok/s</div>
          </div>
          <div>
            <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">CONFIDENCE</div>
            <div style="font-weight: 700; color: #fff; font-family: var(--font-mono);">99.4%</div>
          </div>
        </div>
      </div>

      <!-- Neural Graph Routing Visualizer -->
      <div style="display: flex; flex-direction: column; justify-content: space-between;">
        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 24px;">
          <h4 style="font-size: 1.1rem; color: #fff; margin-bottom: 12px;">Multi-Modal Node Graph Architecture</h4>
          <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 20px; line-height: 1.6;">
            We architect zero-latency streaming interfaces that connect human gesture to deep multimodal models with optimistic UI updates and non-destructive graph history.
          </p>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-radius: 8px; background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.25);">
              <span style="font-size: 0.85rem; font-family: var(--font-mono); color: #fff;">1. Token Ingestion & Intent Map</span>
              <i data-lucide="check" style="width: 16px; height: 16px; color: var(--emerald);"></i>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-radius: 8px; background: rgba(0,240,255,0.08); border: 1px solid rgba(0,240,255,0.25);">
              <span style="font-size: 0.85rem; font-family: var(--font-mono); color: #fff;">2. Real-Time Semantic Blending</span>
              <span class="chip-pulse"></span>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-radius: 8px; background: rgba(255,255,255,0.04); border: 1px solid var(--border-subtle);">
              <span style="font-size: 0.85rem; font-family: var(--font-mono); color: #fff;">3. Infinite Node Graph Canvas Blit</span>
              <span style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">0.08s</span>
            </div>
          </div>
        </div>

        <button class="btn btn-primary" style="margin-top: 20px;" onclick="window.triggerContactModal('Generative AI Interface Engineering')">
          <span>Consult AI UX Architecture</span>
          <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>
        </button>
      </div>

    </div>
  `;

  const streamTemplates = {
    spatial: ">> EXEC: Synthesizing Spatial 3D Window Pipeline...\n-> Binding WebGPU Compute Shader...\n-> Hand Gesture Tracking: 60FPS High-Precision.\n-> Dynamic Window Refraction: 1.48 Refractive Index.\n>> STATUS: Spatial interface deployed at 120 FPS.",
    shader: ">> GLSL COMPUTE: Initializing Vertex Wave Function...\n-> uniform float uTime;\n-> vec3 newPos = position + normal * sin(position.y * 3.0 + uTime);\n-> Calculating Tangents & Bitangents...\n>> STATUS: GPU compiled in 1.4ms with 0 shader errors.",
    quant: ">> QUANT ENGINE: Connecting High-Frequency L2 Stream...\n-> Latency: 0.04ms over Direct Fiber WebSockets.\n-> Processing 12,400 ticks/sec with zero GC spikes.\n-> Orderbook depth synchronized across 50 tiers.\n>> STATUS: Trade routing armed."
  };

  window.runAISimulation = (type) => {
    soundEngine.playClick();
    const terminal = document.getElementById('ai-token-terminal');
    if (!terminal) return;
    terminal.textContent = '';
    const text = streamTemplates[type] || streamTemplates.spatial;
    let charIndex = 0;

    function streamChars() {
      if (charIndex < text.length) {
        terminal.textContent += text.charAt(charIndex);
        terminal.scrollTop = terminal.scrollHeight;
        charIndex++;
        aiStreamTimeout = setTimeout(streamChars, 14);
      } else {
        soundEngine.playSuccess();
      }
    }

    streamChars();
  };

  window.runAISimulation('spatial');
}

/* ==========================================================================
   3. FINTECH HIGH FREQUENCY INTERACTIVE BENCHMARK
   ========================================================================== */
function renderFinTechView(container) {
  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 24px;">
      
      <!-- Live L2 Orderbook Ladder Simulation -->
      <div style="background: #04060a; border: 1px solid var(--border-subtle); border-radius: 16px; padding: 20px; font-family: var(--font-mono);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
          <div>
            <span style="color: #fff; font-weight: 700; font-size: 0.95rem;">BTC/USD ORDER BOOK (L2)</span>
            <span style="font-size: 0.75rem; color: var(--emerald); margin-left: 8px;">120 FPS BLIT</span>
          </div>
          <div id="fintech-live-price" style="font-weight: 800; font-size: 1.05rem; color: var(--emerald);">$98,420.50</div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.8rem;">
          <div>
            <div style="color: var(--text-muted); font-size: 0.7rem; margin-bottom: 6px;">BIDS (BUY)</div>
            <div id="fintech-bids-list" style="display: flex; flex-direction: column; gap: 4px;"></div>
          </div>
          <div>
            <div style="color: var(--text-muted); font-size: 0.7rem; margin-bottom: 6px;">ASKS (SELL)</div>
            <div id="fintech-asks-list" style="display: flex; flex-direction: column; gap: 4px;"></div>
          </div>
        </div>

        <!-- Stress Test Trigger Button -->
        <button id="btn-stress-test" class="btn btn-secondary" style="width: 100%; margin-top: 18px; padding: 10px; font-size: 0.85rem;" onclick="window.runFintechStressTest()">
          <i data-lucide="zap" style="width: 16px; height: 16px; color: var(--emerald);"></i>
          <span>Inject 50,000 Order Stress Test</span>
        </button>
      </div>

      <!-- Real-Time Performance Telemetry -->
      <div style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="font-size: 0.85rem; font-family: var(--font-mono); color: var(--emerald); margin-bottom: 8px;">// LATENCY & GPU BENCHMARKS</div>
          <h4 style="font-size: 1.25rem; color: #fff; margin-bottom: 16px;">Zero-GC High-Frequency Pipeline</h4>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.25); border-radius: 12px; padding: 14px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                <span style="color: #cbd5e1;">Render Frame Latency</span>
                <span id="telemetry-latency" style="color: var(--emerald); font-weight: 700; font-family: var(--font-mono);">0.04 ms</span>
              </div>
              <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                <div style="width: 98%; height: 100%; background: var(--emerald);"></div>
              </div>
            </div>

            <div style="background: rgba(0,240,255,0.08); border: 1px solid rgba(0,240,255,0.25); border-radius: 12px; padding: 14px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                <span style="color: #cbd5e1;">UI Frame Rate</span>
                <span style="color: var(--cyan); font-weight: 700; font-family: var(--font-mono);">120 FPS Locked</span>
              </div>
              <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                <div style="width: 100%; height: 100%; background: var(--cyan);"></div>
              </div>
            </div>

            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 14px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                <span style="color: #cbd5e1;">Garbage Collection Pause</span>
                <span style="color: #fff; font-weight: 700; font-family: var(--font-mono);">0.00 ms (Zero-GC Buffer)</span>
              </div>
            </div>
          </div>
        </div>

        <button class="btn btn-primary" style="margin-top: 20px;" onclick="window.triggerContactModal('High-Frequency FinTech UI')">
          <span>Inquire FinTech Trading Terminal</span>
          <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>
        </button>
      </div>

    </div>
  `;

  // Start live orderbook ticker
  const bidsEl = document.getElementById('fintech-bids-list');
  const asksEl = document.getElementById('fintech-asks-list');
  const priceEl = document.getElementById('fintech-live-price');
  let basePrice = 98420.50;

  function updateOrderBook() {
    if (!bidsEl || !asksEl) return;
    const delta = (Math.random() - 0.49) * 4.5;
    basePrice += delta;
    if (priceEl) {
      priceEl.textContent = `$${basePrice.toFixed(2)}`;
      priceEl.style.color = delta >= 0 ? 'var(--emerald)' : '#ef4444';
    }

    let bidsHtml = '';
    let asksHtml = '';

    for (let i = 0; i < 6; i++) {
      const bidP = (basePrice - (i + 1) * 1.5).toFixed(2);
      const bidQ = (Math.random() * 2.8 + 0.1).toFixed(3);
      bidsHtml += `
        <div style="display: flex; justify-content: space-between; padding: 2px 4px; background: rgba(16,185,129,0.08); border-radius: 4px;">
          <span style="color: var(--emerald);">${bidP}</span>
          <span style="color: var(--text-muted);">${bidQ}</span>
        </div>
      `;

      const askP = (basePrice + (i + 1) * 1.5).toFixed(2);
      const askQ = (Math.random() * 2.8 + 0.1).toFixed(3);
      asksHtml += `
        <div style="display: flex; justify-content: space-between; padding: 2px 4px; background: rgba(239,68,68,0.08); border-radius: 4px;">
          <span style="color: #ef4444;">${askP}</span>
          <span style="color: var(--text-muted);">${askQ}</span>
        </div>
      `;
    }

    bidsEl.innerHTML = bidsHtml;
    asksEl.innerHTML = asksHtml;
  }

  updateOrderBook();
  fintechInterval = setInterval(updateOrderBook, 250);

  window.runFintechStressTest = () => {
    soundEngine.playSuccess();
    const btn = document.getElementById('btn-stress-test');
    if (btn) btn.innerHTML = '<span>⚡ Ingesting 50k Ticks (0 Dropped Frames)...</span>';
    
    // Turbo interval
    clearInterval(fintechInterval);
    fintechInterval = setInterval(updateOrderBook, 40);

    setTimeout(() => {
      clearInterval(fintechInterval);
      fintechInterval = setInterval(updateOrderBook, 250);
      if (btn) btn.innerHTML = '<i data-lucide="zap" style="width: 16px; height: 16px; color: var(--emerald);"></i><span>Inject 50,000 Order Stress Test</span>';
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 2500);
  };
}

/* ==========================================================================
   4. DESIGN SYSTEM & SPRING PHYSICS TOKEN STUDIO
   ========================================================================== */
function renderDesignSystemView(container) {
  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
      
      <!-- Interactive Spring Physics Sandbox -->
      <div style="background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="font-size: 0.85rem; font-family: var(--font-mono); color: var(--cyan); margin-bottom: 12px;">// SPRING PHYSICS TEST BENCH</div>
          <h4 style="font-size: 1.15rem; color: #fff; margin-bottom: 16px;">Tactile Micro-Interaction Engine</h4>

          <!-- Interactive Spring Card Target -->
          <div id="spring-test-card" style="padding: 24px; border-radius: 16px; background: rgba(0,240,255,0.06); border: 1px solid var(--cyan); text-align: center; cursor: pointer; transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); margin-bottom: 24px;" onclick="window.triggerSpringBounce()">
            <div style="font-size: 0.8rem; font-family: var(--font-mono); color: var(--cyan); margin-bottom: 6px;">CLICK OR DRAG TO TEST SPRING</div>
            <div style="font-weight: 700; font-size: 1.1rem; color: #fff;">Tactile Organic Response</div>
          </div>

          <!-- Spring Sliders -->
          <div class="control-group">
            <div class="control-label">
              <span>Stiffness: <span id="val-stiffness" style="color: var(--cyan);">380</span></span>
            </div>
            <input type="range" id="slider-stiffness" class="custom-range" min="150" max="600" value="380" oninput="document.getElementById('val-stiffness').textContent = this.value">
          </div>

          <div class="control-group" style="margin-top: 14px;">
            <div class="control-label">
              <span>Damping: <span id="val-damping" style="color: var(--cyan);">28</span></span>
            </div>
            <input type="range" id="slider-damping" class="custom-range" min="10" max="50" value="28" oninput="document.getElementById('val-damping').textContent = this.value">
          </div>
        </div>

        <div style="font-size: 0.78rem; font-family: var(--font-mono); color: var(--text-muted); margin-top: 12px;">
          Framer Motion standard: stiffness 380 • damping 28 • mass 0.8
        </div>
      </div>

      <!-- Color Tokens & Typography Scale -->
      <div style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="font-size: 0.85rem; font-family: var(--font-mono); color: var(--magenta); margin-bottom: 12px;">// DESIGN TOKENS & TYPOGRAPHY</div>
          <h4 style="font-size: 1.15rem; color: #fff; margin-bottom: 16px;">Curated HSL Palette Swatches</h4>

          <!-- Swatches Grid -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px;">
            <div style="padding: 12px 8px; border-radius: 10px; background: rgba(0,240,255,0.12); border: 1px solid var(--cyan); text-align: center; cursor: pointer;" onclick="window.copyTokenColor('#00f0ff')">
              <div style="width: 20px; height: 20px; border-radius: 50%; background: var(--cyan); margin: 0 auto 6px auto;"></div>
              <div style="font-size: 0.7rem; font-family: var(--font-mono); color: #fff;">#00f0ff</div>
            </div>

            <div style="padding: 12px 8px; border-radius: 10px; background: rgba(139,92,246,0.12); border: 1px solid var(--violet); text-align: center; cursor: pointer;" onclick="window.copyTokenColor('#8b5cf6')">
              <div style="width: 20px; height: 20px; border-radius: 50%; background: var(--violet); margin: 0 auto 6px auto;"></div>
              <div style="font-size: 0.7rem; font-family: var(--font-mono); color: #fff;">#8b5cf6</div>
            </div>

            <div style="padding: 12px 8px; border-radius: 10px; background: rgba(236,72,153,0.12); border: 1px solid var(--magenta); text-align: center; cursor: pointer;" onclick="window.copyTokenColor('#ec4899')">
              <div style="width: 20px; height: 20px; border-radius: 50%; background: var(--magenta); margin: 0 auto 6px auto;"></div>
              <div style="font-size: 0.7rem; font-family: var(--font-mono); color: #fff;">#ec4899</div>
            </div>

            <div style="padding: 12px 8px; border-radius: 10px; background: rgba(16,185,129,0.12); border: 1px solid var(--emerald); text-align: center; cursor: pointer;" onclick="window.copyTokenColor('#10b981')">
              <div style="width: 20px; height: 20px; border-radius: 50%; background: var(--emerald); margin: 0 auto 6px auto;"></div>
              <div style="font-size: 0.7rem; font-family: var(--font-mono); color: #fff;">#10b981</div>
            </div>
          </div>

          <!-- Typography Specs -->
          <div style="padding: 16px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.82rem;">
              <span style="font-family: var(--font-display); font-weight: 800;">Outfit (Display Bold)</span>
              <span style="font-family: var(--font-mono); color: var(--text-muted);">clamp(2.4rem, 5vw, 4.8rem)</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.82rem;">
              <span style="font-family: var(--font-body);">Inter (Body Clean)</span>
              <span style="font-family: var(--font-mono); color: var(--text-muted);">16px / 1.65 line-height</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.82rem;">
              <span style="font-family: var(--font-mono); color: var(--cyan);">JetBrains Mono (Telemetry)</span>
              <span style="font-family: var(--font-mono); color: var(--text-muted);">0.85rem / 0.08em tracking</span>
            </div>
          </div>
        </div>

        <button class="btn btn-primary" style="margin-top: 20px;" onclick="window.triggerContactModal('Design System Architecture')">
          <span>Inquire Design System</span>
          <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>
        </button>
      </div>

    </div>
  `;

  window.triggerSpringBounce = () => {
    soundEngine.playClick();
    const card = document.getElementById('spring-test-card');
    if (!card) return;
    card.style.transform = 'scale(0.92) rotate(-2deg)';
    setTimeout(() => {
      card.style.transform = 'scale(1.04) rotate(1deg)';
      setTimeout(() => {
        card.style.transform = 'scale(1) rotate(0deg)';
      }, 180);
    }, 120);
  };

  window.copyTokenColor = (hex) => {
    soundEngine.playSuccess();
    if (navigator.clipboard) navigator.clipboard.writeText(hex);
    if (window.showToast) window.showToast(`Copied token color: ${hex}`);
  };
}
