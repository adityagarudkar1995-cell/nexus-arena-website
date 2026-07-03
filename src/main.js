import './style.css';
/**
 * NEXUS ARENA - Interactive Website Script
 * High performance animations and interactions using vanilla JS
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initCountUpObserver();
  initCardTiltEffect();
  initConnectorLineAnimation();
});

/**
 * 1. Scroll-Triggered Fade-In / Slide-Up Animations (AOS replacement)
 */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.fade-up');
  
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1 // Triggers when 10% of the element is visible
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Run animation once
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => observer.observe(el));
}

/**
 * 2. Number Count-Up Animation for Prize Pool Figures
 */
function initCountUpObserver() {
  const counterElements = document.querySelectorAll('.count-up');
  
  const observerOptions = {
    root: null,
    threshold: 0.2
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target); // Run count-up once
      }
    });
  }, observerOptions);

  counterElements.forEach(el => observer.observe(el));
}

function animateCount(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const duration = 1500; // Duration of count up in ms
  const startTime = performance.now();

  function updateCount(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing: easeOutQuad
    const ease = progress * (2 - progress);
    const currentVal = Math.floor(ease * target);
    
    // Format to Indian locale (e.g. 8,000 instead of 8000)
    el.textContent = currentVal.toLocaleString('en-IN');
    
    if (progress < 1) {
      requestAnimationFrame(updateCount);
    } else {
      el.textContent = target.toLocaleString('en-IN');
    }
  }

  requestAnimationFrame(updateCount);
}

/**
 * 3. 3D Tilt Effect and Dynamic Spotlight Gradient on Tournament Cards
 */
function initCardTiltEffect() {
  const cards = document.querySelectorAll('[data-tilt]');
  
  // Disable tilt effect on small screens to prevent layout bugs and optimize touch interactions
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (isMobile) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // Mouse position X within card
      const y = e.clientY - rect.top;  // Mouse position Y within card
      
      // Update custom properties for CSS gradient spotlight
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
      
      // Calculate rotation based on cursor offset from card center
      const width = rect.width;
      const height = rect.height;
      const rotateX = ((y - height / 2) / height) * -12; // Max rotation angle: 12 degrees
      const rotateY = ((x - width / 2) / width) * 12;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      // Smooth reset on mouse leave
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      card.style.setProperty('--mouse-x', '50%');
      card.style.setProperty('--mouse-y', '0%');
    });
  });
}

/**
 * 4. SVG Connector Line Drawing Animation on Scroll
 */
function initConnectorLineAnimation() {
  const glowPath = document.getElementById('glow-path');
  const howSection = document.getElementById('how-section');
  
  if (!glowPath || !howSection) return;

  const pathLength = glowPath.getTotalLength();
  
  // Configure SVG stroke dash settings
  glowPath.style.strokeDasharray = pathLength;
  glowPath.style.strokeDashoffset = pathLength;

  let ticking = false;

  function animateConnector() {
    const rect = howSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Check if the section is in view
    if (rect.top < viewportHeight && rect.bottom > 0) {
      // Calculate how far into the section the user has scrolled
      const elementHeight = rect.height;
      const scrolled = viewportHeight - rect.top;
      
      // Normalize percentage (0 to 1) relative to section scroll range
      // Starts drawing as section enters viewport, finishes drawing when half-way through
      const percent = Math.min(Math.max(scrolled / (elementHeight + 100), 0), 1);
      
      // Set line fill progress
      const drawOffset = pathLength - (percent * pathLength);
      glowPath.style.strokeDashoffset = drawOffset;
    }
  }

  // Bind scroll handler with requestAnimationFrame throttle
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        animateConnector();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Run initial calculation in case section is already loaded in viewport
  animateConnector();
}

