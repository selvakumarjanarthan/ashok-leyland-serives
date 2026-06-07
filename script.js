/* ═══════════════════════════════════════════════════════════
   SELVA KUMAR — ASHOK LEYLAND SERVICES
   script.js | Interactions, Animations & Functionality
═══════════════════════════════════════════════════════════ */

'use strict';

/* ══ 1. HEADER — Scroll behaviour & active link ═══════════ */
(function initHeader() {
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Scroll state
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
    updateActiveLink();
  }, { passive: true });

  function updateActiveLink() {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }
  updateActiveLink();
})();


/* ══ 2. HAMBURGER / MOBILE MENU ═══════════════════════════ */
(function initHamburger() {
  const btn = document.getElementById('hamburger');
  const nav = document.querySelector('.navbar');

  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    nav.classList.toggle('open');
  });

  // Close on nav link click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('open');
      nav.classList.remove('open');
    });
  });
})();


/* ══ 3. SMOOTH SCROLL ════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const headerH = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--header-h')) || 76;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ══ 4. INTERSECTION OBSERVER — fade-in / reveal-up ══════ */
(function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Stagger siblings within the same parent
        const parent = entry.target.parentElement;
        const siblings = [...parent.querySelectorAll('.fade-in, .reveal-up')];
        siblings.forEach((el, i) => {
          if (!el.classList.contains('visible')) {
            el.style.transitionDelay = `${i * 0.08}s`;
          }
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-in, .reveal-up').forEach(el => observer.observe(el));
})();


/* ══ 5. HERO — mark as visible immediately ═══════════════ */
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.querySelectorAll('.hero .reveal-up').forEach(el => {
      el.classList.add('visible');
    });
  }, 100);
});


/* ══ 6. COUNTER ANIMATION ════════════════════════════════ */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  let triggered = false;

  const observer = new IntersectionObserver((entries) => {
    if (!triggered && entries[0].isIntersecting) {
      triggered = true;
      counters.forEach(counter => {
        const target = parseInt(counter.dataset.target, 10);
        const duration = 1800;
        const start = performance.now();
        function step(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          counter.textContent = Math.floor(ease * target);
          if (progress < 1) requestAnimationFrame(step);
          else counter.textContent = target;
        }
        requestAnimationFrame(step);
      });
    }
  }, { threshold: 0.4 });

  if (counters.length) observer.observe(counters[0].closest('.about-stats') || counters[0]);
})();


/* ══ 7. GALLERY — lightbox ═══════════════════════════════ */
(function initGallery() {
  const items = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  let current = 0;

  // Collect image URLs from gallery items
  const images = [...items].map(item => {
    const img = item.querySelector('.gallery-img');
    const style = img.style.backgroundImage;
    return style.replace(/url\(['"]?|['"]?\)/g, '');
  });

  function openLightbox(index) {
    current = index;
    lightboxImg.style.backgroundImage = `url('${images[current]}')`;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showImage(index) {
    current = (index + images.length) % images.length;
    lightboxImg.style.backgroundImage = `url('${images[current]}')`;
  }

  items.forEach((item, i) => item.addEventListener('click', () => openLightbox(i)));
  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => showImage(current - 1));
  nextBtn.addEventListener('click', () => showImage(current + 1));

  // Keyboard
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')       closeLightbox();
    if (e.key === 'ArrowLeft')    showImage(current - 1);
    if (e.key === 'ArrowRight')   showImage(current + 1);
  });

  // Click outside image
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
})();


/* ══ 8. TESTIMONIALS CAROUSEL ════════════════════════════ */
(function initCarousel() {
  const track = document.getElementById('testimonialsTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsContainer = document.getElementById('carouselDots');
  if (!track) return;

  const cards = track.querySelectorAll('.testimonial-card');
  const total = cards.length;
  let current = 0;
  let autoplayInterval;

  // Determine visible cards
  function getVisible() {
    return window.innerWidth <= 768 ? 1 : 2;
  }

  // Create dots
  const dots = [];
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
    dots.push(dot);
  }

  function goTo(index) {
    const visible = getVisible();
    const maxIndex = total - visible;
    current = Math.max(0, Math.min(index, maxIndex));
    const cardWidth = cards[0].offsetWidth + 24; // gap = 1.5rem ≈ 24px
    track.style.transform = `translateX(-${current * cardWidth}px)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
  }

  prevBtn.addEventListener('click', () => { goTo(current - 1); resetAutoplay(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); resetAutoplay(); });

  function resetAutoplay() {
    clearInterval(autoplayInterval);
    autoplayInterval = setInterval(() => {
      const visible = getVisible();
      const maxIndex = total - visible;
      goTo(current < maxIndex ? current + 1 : 0);
    }, 5000);
  }

  window.addEventListener('resize', () => goTo(current));

  // Touch swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? goTo(current + 1) : goTo(current - 1);
    resetAutoplay();
  });

  resetAutoplay();
})();


/* ══ 9. CONTACT FORM VALIDATION ═════════════════════════ */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const successEl = document.getElementById('formSuccess');

  const validators = {
    name: {
      el: document.getElementById('name'),
      err: document.getElementById('nameError'),
      validate(v) {
        if (!v.trim()) return 'Full name is required.';
        if (v.trim().length < 2) return 'Name must be at least 2 characters.';
        return '';
      }
    },
    phone: {
      el: document.getElementById('phone'),
      err: document.getElementById('phoneError'),
      validate(v) {
        if (!v.trim()) return 'Phone number is required.';
        if (!/^[\d\s\+\-\(\)]{8,15}$/.test(v.trim())) return 'Enter a valid phone number.';
        return '';
      }
    },
    email: {
      el: document.getElementById('email'),
      err: document.getElementById('emailError'),
      validate(v) {
        if (!v.trim()) return 'Email address is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Enter a valid email address.';
        return '';
      }
    },
    message: {
      el: document.getElementById('message'),
      err: document.getElementById('messageError'),
      validate(v) {
        if (!v.trim()) return 'Please enter your message.';
        if (v.trim().length < 20) return 'Message should be at least 20 characters.';
        return '';
      }
    }
  };

  // Live validation
  Object.values(validators).forEach(({ el, err, validate }) => {
    el.addEventListener('blur', () => {
      const msg = validate(el.value);
      err.textContent = msg;
      el.classList.toggle('error', !!msg);
    });
    el.addEventListener('input', () => {
      if (el.classList.contains('error')) {
        const msg = validate(el.value);
        err.textContent = msg;
        el.classList.toggle('error', !!msg);
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    Object.values(validators).forEach(({ el, err, validate }) => {
      const msg = validate(el.value);
      err.textContent = msg;
      el.classList.toggle('error', !!msg);
      if (msg) valid = false;
    });

    if (!valid) return;

    // Simulate submission
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    setTimeout(() => {
      successEl.classList.add('show');
      form.reset();
      Object.values(validators).forEach(({ el, err }) => {
        el.classList.remove('error');
        err.textContent = '';
      });
      btn.textContent = 'Send Message →';
      btn.disabled = false;

      setTimeout(() => successEl.classList.remove('show'), 6000);
    }, 1200);
  });
})();


/* ══ 10. PARALLAX — hero subtle depth ════════════════════ */
(function initParallax() {
  const overlay = document.querySelector('.hero-overlay');
  const content = document.querySelector('.hero-content');
  if (!overlay) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      if (content) content.style.transform = `translateY(${y * 0.18}px)`;
    }
  }, { passive: true });
})();


/* ══ 11. PORTFOLIO — hover tilt ═════════════════════════ */
(function initPortfolioTilt() {
  document.querySelectorAll('.portfolio-item').forEach(item => {
    item.addEventListener('mousemove', e => {
      const { left, top, width, height } = item.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      item.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.02)`;
    });
    item.addEventListener('mouseleave', () => {
      item.style.transform = '';
    });
  });
})();


/* ══ 12. SERVICE CARDS — staggered entrance ══════════════ */
(function initServiceEntrance() {
  const cards = document.querySelectorAll('.service-card');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const cards = entry.target.querySelectorAll('.service-card');
        cards.forEach((card, i) => {
          setTimeout(() => card.classList.add('visible'), i * 90);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  const grid = document.querySelector('.services-grid');
  if (grid) observer.observe(grid);
})();


/* ══ 13. SCROLL-TO-TOP (no button, keyboard shortcut) ═══ */
document.addEventListener('keydown', e => {
  if (e.key === 'Home' && !e.target.matches('input, textarea')) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});