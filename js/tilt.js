/**
 * NEXUS STUDIO - 3D Card Tilt & Dynamic Glare Engine
 * Calculates perspective transforms and specular highlight reflection angles
 */

export function initCardTilt() {
  const cards = document.querySelectorAll('[data-tilt]');

  cards.forEach((card) => {
    let bounds;
    let isHovered = false;

    // Ensure glare overlay exists
    if (!card.querySelector('.card-glare')) {
      const glare = document.createElement('div');
      glare.className = 'card-glare';
      card.appendChild(glare);
    }

    const onMouseEnter = () => {
      bounds = card.getBoundingClientRect();
      isHovered = true;
      card.style.transition = 'none';
    };

    const onMouseMove = (e) => {
      if (!isHovered || !bounds) return;

      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;

      const xPct = (mouseX / bounds.width - 0.5) * 2; // -1 to 1
      const yPct = (mouseY / bounds.height - 0.5) * 2; // -1 to 1

      const maxTilt = parseFloat(card.getAttribute('data-tilt-max') || '12');

      const rotateX = -yPct * maxTilt;
      const rotateY = xPct * maxTilt;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(10px)`;
      
      // Update glare coordinates
      card.style.setProperty('--mouse-x', `${(mouseX / bounds.width * 100).toFixed(1)}%`);
      card.style.setProperty('--mouse-y', `${(mouseY / bounds.height * 100).toFixed(1)}%`);
    };

    const onMouseLeave = () => {
      isHovered = false;
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    };

    card.addEventListener('mouseenter', onMouseEnter);
    card.addEventListener('mousemove', onMouseMove);
    card.addEventListener('mouseleave', onMouseLeave);
  });
}
