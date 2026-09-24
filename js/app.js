/**
 * SYNAPSE STUDIO - Main Orchestrator Application
 */

import { soundEngine } from './audioEngine.js';
import { initHeroCanvas } from './heroCanvas.js';
import { initShowcaseCanvas } from './showcaseCanvas.js';
import { initCustomCursor } from './cursor.js';
import { initCardTilt } from './tilt.js';
import { portfolioProjects } from './portfolioData.js';
import { initDisciplineSystem } from './disciplineModal.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 2. Initialize Three.js Hero & Interactive Canvases
  initHeroCanvas();
  initShowcaseCanvas();
  initCustomCursor();
  initCardTilt();
  initDisciplineSystem();

  // 3. Scroll Progress Indicator & Sticky Navbar
  const progressBar = document.getElementById('scroll-progress');
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    if (progressBar) {
      progressBar.style.width = `${scrollPercent}%`;
    }

    if (navbar) {
      if (scrollTop > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  }, { passive: true });

  // 4. Sound Engine Controls
  const soundToggleBtn = document.getElementById('sound-toggle');
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      const isAudible = soundEngine.toggleSound();
      const soundIcon = soundToggleBtn.querySelector('i');
      if (soundIcon) {
        soundIcon.setAttribute('data-lucide', isAudible ? 'volume-2' : 'volume-x');
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
      showToast(isAudible ? 'Audio cues enabled' : 'Audio cues muted');
    });
  }

  // Attach sound feedback to buttons & links
  document.querySelectorAll('button, a, .filter-btn, .preset-btn, .project-card').forEach((el) => {
    el.addEventListener('mouseenter', () => soundEngine.playHover());
    el.addEventListener('click', () => soundEngine.playClick());
  });

  // 5. Scroll Reveal with Intersection Observer
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach((el) => revealObserver.observe(el));

  // 6. Metric Numbers Animated Counter
  const metricElements = document.querySelectorAll('[data-counter]');
  let metricsCounted = false;

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !metricsCounted) {
        metricsCounted = true;
        metricElements.forEach((el) => {
          const target = parseFloat(el.getAttribute('data-counter'));
          const suffix = el.getAttribute('data-suffix') || '';
          const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
          const duration = 2000;
          const startTime = performance.now();

          function updateCounter(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = (target * easeOut).toFixed(decimals);
            el.textContent = current + suffix;

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              el.textContent = target.toFixed(decimals) + suffix;
            }
          }

          requestAnimationFrame(updateCounter);
        });
      }
    });
  }, { threshold: 0.3 });

  const metricsSection = document.getElementById('metrics');
  if (metricsSection) countObserver.observe(metricsSection);

  // 7. Portfolio Dynamic Render & Filter Manager
  const portfolioGrid = document.getElementById('portfolio-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');

  function renderPortfolio(filter = 'all') {
    if (!portfolioGrid) return;
    portfolioGrid.innerHTML = '';

    const filtered = filter === 'all' 
      ? portfolioProjects 
      : portfolioProjects.filter(p => p.category === filter);

    filtered.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = 'project-card glass-card reveal active';
      card.setAttribute('data-tilt', 'true');
      card.setAttribute('data-tilt-max', '10');
      card.setAttribute('data-cursor-hover', 'true');
      card.style.animationDelay = `${idx * 0.1}s`;

      card.innerHTML = `
        <div class="project-thumb-box">
          <div style="width: 100%; height: 100%; background: ${p.gradient}; display: flex; align-items: center; justify-content: center; position: relative;">
            <div style="position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.6) 100%);"></div>
            <i data-lucide="layers" style="width: 54px; height: 54px; color: rgba(255,255,255,0.7); filter: drop-shadow(0 0 10px rgba(0,240,255,0.5));"></i>
          </div>
          <span class="project-category-badge">${p.categoryLabel}</span>
        </div>
        <div class="project-details">
          <div>
            <h3 class="project-title">${p.title}</h3>
            <p class="project-summary">${p.summary}</p>
          </div>
          <div class="project-metric">
            <span style="color: var(--text-muted); font-size: 0.8rem;">Impact</span>
            <span class="metric-val">${p.metric}</span>
          </div>
        </div>
      `;

      card.addEventListener('mouseenter', () => soundEngine.playHover());
      card.addEventListener('click', () => {
        soundEngine.playClick();
        openProjectModal(p);
      });

      portfolioGrid.appendChild(card);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
    initCardTilt();
    if (window.refreshCursorTargets) window.refreshCursorTargets();
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-filter');
      renderPortfolio(cat);
    });
  });

  renderPortfolio('all');

  // 8. Project Detail Modal Manager
  const modalOverlay = document.getElementById('project-modal');
  const modalBody = document.getElementById('modal-body-content');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  function openProjectModal(project) {
    if (!modalOverlay || !modalBody) return;

    modalBody.innerHTML = `
      <div style="height: 220px; background: ${project.gradient}; border-radius: 16px; margin-bottom: 24px; position: relative; overflow: hidden; display: flex; align-items: flex-end; padding: 24px;">
        <div style="position: absolute; inset: 0; background: linear-gradient(180deg, transparent 0%, rgba(12,16,23,0.95) 100%);"></div>
        <div style="position: relative; z-index: 2;">
          <span style="display: inline-block; padding: 4px 12px; border-radius: 6px; background: rgba(0,240,255,0.2); border: 1px solid var(--cyan); color: var(--cyan); font-size: 0.75rem; font-family: var(--font-mono); margin-bottom: 8px;">
            ${project.categoryLabel} • ${project.year}
          </span>
          <h2 style="font-size: 2rem; color: #fff;">${project.title}</h2>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 32px; margin-bottom: 32px;">
        <div>
          <h4 style="color: var(--cyan); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">Challenge</h4>
          <p style="margin-bottom: 20px; line-height: 1.7;">${project.challenge}</p>

          <h4 style="color: var(--cyan); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">Architectural Solution</h4>
          <p style="margin-bottom: 20px; line-height: 1.7;">${project.solution}</p>

          <h4 style="color: var(--cyan); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">Verified Impact</h4>
          <p style="line-height: 1.7; color: var(--emerald); font-weight: 500;">${project.impact}</p>
        </div>

        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 20px; height: fit-content;">
          <div style="margin-bottom: 16px;">
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Client</div>
            <div style="font-weight: 600; color: #fff;">${project.client}</div>
          </div>
          <div style="margin-bottom: 16px;">
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Timeline</div>
            <div style="font-weight: 600; color: #fff;">${project.duration}</div>
          </div>
          <div style="margin-bottom: 16px;">
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Key Metric</div>
            <div style="font-weight: 700; color: var(--emerald); font-family: var(--font-mono);">${project.metric}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px;">Stack</div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${project.tags.map(t => `<span class="tech-pill">${t}</span>`).join('')}
            </div>
          </div>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 14px;">
        <button class="btn btn-secondary" id="modal-prev-close-btn">Close Case Study</button>
        <button class="btn btn-primary" onclick="window.triggerContactModal('Project: ${project.title}')">
          <span>Inquire Similar Project</span>
          <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>
        </button>
      </div>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();

    const subClose = document.getElementById('modal-prev-close-btn');
    if (subClose) subClose.addEventListener('click', closeModal);

    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // 9. Interactive Contact Drawer & Form Submissions
  window.triggerContactModal = (subject = '') => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      closeModal();
      contactSection.scrollIntoView({ behavior: 'smooth' });
      const msgInput = document.getElementById('contact-message');
      if (msgInput && subject) {
        msgInput.value = `Hello SYNAPSE team, I'd like to discuss ${subject}.`;
        msgInput.focus();
      }
    }
  };

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <div style="width: 18px; height: 18px; border: 2px solid #000; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; margin-right: 8px;"></div>
        <span>Transmitting Proposal...</span>
      `;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        contactForm.reset();
        soundEngine.playSuccess();
        showToast('🚀 Transmission successful! Our engineering director will contact you within 2 hours.');
      }, 1400);
    });
  }

  // Newsletter Form
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input');
      if (input && input.value) {
        input.value = '';
        soundEngine.playSuccess();
        showToast('✨ Subscribed to SYNAPSE Quantum Dispatch!');
      }
    });
  }

  // 10. Mobile Menu Drawer
  const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openMobileDrawer() {
    if (mobileDrawer && drawerBackdrop) {
      mobileDrawer.classList.add('open');
      drawerBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMobileDrawer() {
    if (mobileDrawer && drawerBackdrop) {
      mobileDrawer.classList.remove('open');
      drawerBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeMobileDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeMobileDrawer);

  mobileNavLinks.forEach((link) => {
    link.addEventListener('click', closeMobileDrawer);
  });

  // 11. Toast System
  function showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i data-lucide="check-circle" style="width: 18px; height: 18px; color: var(--cyan); flex-shrink: 0;"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    if (typeof lucide !== 'undefined') lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  window.showToast = showToast;
});
