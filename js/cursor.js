/**
 * NEXUS STUDIO - Fluid Spring Custom Cursor Engine
 * Magnetic snapping, smooth interpolation, and tactile cursor physics
 */

export function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const follower = document.getElementById('cursor-follower');

  if (!cursor || !follower) return;

  let mouseX = -100;
  let mouseY = -100;
  let followerX = -100;
  let followerY = -100;

  let isHovering = false;
  let magneticEl = null;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  }, { passive: true });

  // Attach magnetic snap listeners
  function setupHoverTargets() {
    const targets = document.querySelectorAll('button, a, .glass-card, .project-card, .preset-btn, input, [data-cursor-hover]');

    targets.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        isHovering = true;
        cursor.classList.add('active');
        follower.classList.add('active');

        if (el.hasAttribute('data-magnetic')) {
          magneticEl = el;
        }
      });

      el.addEventListener('mouseleave', () => {
        isHovering = false;
        cursor.classList.remove('active');
        follower.classList.remove('active');
        magneticEl = null;
        el.style.transform = '';
      });
    });
  }

  // Smooth lerp for outer follower
  function updateFollower() {
    requestAnimationFrame(updateFollower);

    let targetX = mouseX;
    let targetY = mouseY;

    if (magneticEl) {
      const rect = magneticEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Magnetic pull towards center
      targetX = centerX + (mouseX - centerX) * 0.35;
      targetY = centerY + (mouseY - centerY) * 0.35;

      const pullX = (mouseX - centerX) * 0.25;
      const pullY = (mouseY - centerY) * 0.25;
      magneticEl.style.transform = `translate3d(${pullX}px, ${pullY}px, 0)`;
    }

    followerX += (targetX - followerX) * 0.18;
    followerY += (targetY - followerY) * 0.18;

    follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
  }

  setupHoverTargets();
  updateFollower();

  // Re-run setup whenever DOM changes (e.g. filter or modal)
  window.refreshCursorTargets = setupHoverTargets;
}
