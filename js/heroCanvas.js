/**
 * SYNAPSE STUDIO - 3D WebGL Hero Canvas Engine
 * Multi-layer chromatic particle constellation, morphing crystal core & physical inertia
 */

export function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const container = canvas.parentElement;
  let width = container.clientWidth || 500;
  let height = container.clientHeight || 500;

  // Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.z = 28;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Central Dynamic Group
  const coreGroup = new THREE.Group();
  scene.add(coreGroup);

  // 1. Outer Cybernetic Icosahedron Wireframe
  const icoGeometry = new THREE.IcosahedronGeometry(7.6, 2);
  const icoMaterial = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    wireframe: true,
    transparent: true,
    opacity: 0.42
  });
  const icoMesh = new THREE.Mesh(icoGeometry, icoMaterial);
  coreGroup.add(icoMesh);

  // 2. Vertex Stars on Outer Shell
  const pointsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.32,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending
  });
  const vertexPoints = new THREE.Points(icoGeometry, pointsMaterial);
  coreGroup.add(vertexPoints);

  // 3. Middle Crystalline Dodecahedron
  const dodecaGeo = new THREE.DodecahedronGeometry(5.2, 1);
  const dodecaMat = new THREE.MeshBasicMaterial({
    color: 0x8b5cf6,
    wireframe: true,
    transparent: true,
    opacity: 0.45
  });
  const dodecaMesh = new THREE.Mesh(dodecaGeo, dodecaMat);
  coreGroup.add(dodecaMesh);

  // 4. Inner Radiant Core Sphere
  const innerGeo = new THREE.SphereGeometry(2.8, 32, 32);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    wireframe: true,
    transparent: true,
    opacity: 0.55
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  coreGroup.add(innerMesh);

  // 5. Dual Energy Orbit Rings
  const createRing = (radius, tiltX, tiltY, color) => {
    const ringGeo = new THREE.TorusGeometry(radius, 0.06, 16, 120);
    const ringMat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = tiltX;
    ring.rotation.y = tiltY;
    return ring;
  };

  const ring1 = createRing(10.8, Math.PI / 3, Math.PI / 6, 0x00f0ff);
  const ring2 = createRing(12.4, -Math.PI / 3.5, Math.PI / 4, 0xec4899);
  coreGroup.add(ring1);
  coreGroup.add(ring2);

  // 6. Orbiting Satellite Energy Sparks (2 luminous tracer nodes)
  const sparkGeo = new THREE.SphereGeometry(0.35, 16, 16);
  const sparkMat1 = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
  const sparkMat2 = new THREE.MeshBasicMaterial({ color: 0x8b5cf6 });
  const spark1 = new THREE.Mesh(sparkGeo, sparkMat1);
  const spark2 = new THREE.Mesh(sparkGeo, sparkMat2);
  coreGroup.add(spark1);
  coreGroup.add(spark2);

  // 7. Ambient Cosmic Particle Field (900 particles)
  const particleCount = 900;
  const posArray = new Float32Array(particleCount * 3);
  const colorArray = new Float32Array(particleCount * 3);

  const colCyan = new THREE.Color(0x00f0ff);
  const colViolet = new THREE.Color(0x8b5cf6);
  const colPink = new THREE.Color(0xec4899);
  const colWhite = new THREE.Color(0xffffff);

  for (let i = 0; i < particleCount * 3; i += 3) {
    posArray[i] = (Math.random() - 0.5) * 55;
    posArray[i + 1] = (Math.random() - 0.5) * 55;
    posArray[i + 2] = (Math.random() - 0.5) * 55;

    const r = Math.random();
    const chosenColor = r < 0.4 ? colCyan : (r < 0.7 ? colViolet : (r < 0.85 ? colPink : colWhite));
    colorArray[i] = chosenColor.r;
    colorArray[i + 1] = chosenColor.g;
    colorArray[i + 2] = chosenColor.b;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.22,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending
  });

  const ambientParticles = new THREE.Points(particleGeo, particleMat);
  scene.add(ambientParticles);

  // Mouse Physics & Velocity Tracking
  let targetRotationX = 0;
  let targetRotationY = 0;
  let currentRotationX = 0;
  let currentRotationY = 0;
  let isDragging = false;
  let previousMouseX = 0;
  let previousMouseY = 0;
  let mouseVelocity = 0;
  let lastMoveTime = performance.now();

  const onMouseMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    targetRotationY = x * 1.6;
    targetRotationX = y * 1.6;

    // Calculate instantaneous velocity for dynamic flare
    const now = performance.now();
    const dt = Math.max(now - lastMoveTime, 1);
    const dist = Math.hypot(e.clientX - previousMouseX, e.clientY - previousMouseY);
    mouseVelocity = Math.min(dist / dt * 0.8, 2.0);
    lastMoveTime = now;

    if (isDragging) {
      const deltaX = e.clientX - previousMouseX;
      const deltaY = e.clientY - previousMouseY;
      coreGroup.rotation.y += deltaX * 0.012;
      coreGroup.rotation.x += deltaY * 0.012;
    }

    previousMouseX = e.clientX;
    previousMouseY = e.clientY;
  };

  const onMouseDown = (e) => {
    isDragging = true;
    previousMouseX = e.clientX;
    previousMouseY = e.clientY;
  };

  const onMouseUp = () => {
    isDragging = false;
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  canvas.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);

  // Touch Support
  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      const x = (e.touches[0].clientX - rect.left) / rect.width - 0.5;
      const y = (e.touches[0].clientY - rect.top) / rect.height - 0.5;
      targetRotationY = x * 1.6;
      targetRotationX = y * 1.6;
    }
  }, { passive: true });

  // Resize Handler
  const onResize = () => {
    if (!container) return;
    width = container.clientWidth;
    height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  window.addEventListener('resize', onResize);

  // Animation Loop with Chromatic Oscillations
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Decay mouse velocity
    mouseVelocity *= 0.94;

    // Smooth inertia interpolation
    currentRotationX += (targetRotationX - currentRotationX) * 0.06;
    currentRotationY += (targetRotationY - currentRotationY) * 0.06;

    if (!isDragging) {
      coreGroup.rotation.y = elapsedTime * (0.16 + mouseVelocity * 0.2) + currentRotationY;
      coreGroup.rotation.x = Math.sin(elapsedTime * 0.25) * 0.18 + currentRotationX;
    }

    // Chromatic oscillation on outer mesh & inner core
    const hue1 = (0.50 + Math.sin(elapsedTime * 0.3) * 0.08) % 1.0;
    const hue2 = (0.78 + Math.cos(elapsedTime * 0.35) * 0.08) % 1.0;
    icoMaterial.color.setHSL(hue1, 1.0, 0.55);
    dodecaMat.color.setHSL(hue2, 0.95, 0.60);

    // Orbiting sparks in 3D Lissajous paths
    spark1.position.x = Math.sin(elapsedTime * 1.5) * 10.8;
    spark1.position.y = Math.cos(elapsedTime * 1.5) * 5.4;
    spark1.position.z = Math.cos(elapsedTime * 1.5) * 8.0;

    spark2.position.x = Math.cos(elapsedTime * 1.2) * 12.0;
    spark2.position.y = Math.sin(elapsedTime * 2.0) * 6.0;
    spark2.position.z = Math.sin(elapsedTime * 1.2) * 9.5;

    // Counter-rotations on rings & dodecahedron
    ring1.rotation.z = elapsedTime * 0.35;
    ring2.rotation.z = -elapsedTime * 0.30;
    dodecaMesh.rotation.x = -elapsedTime * 0.22;
    dodecaMesh.rotation.y = elapsedTime * 0.28;

    // Heartbeat pulse core
    const pulse = 1 + Math.sin(elapsedTime * 3.0) * 0.08 + mouseVelocity * 0.15;
    innerMesh.scale.set(pulse, pulse, pulse);

    // Ambient particle drift
    ambientParticles.rotation.y = -elapsedTime * 0.035;
    ambientParticles.rotation.x = Math.cos(elapsedTime * 0.02) * 0.06;

    renderer.render(scene, camera);
  }

  animate();
}
