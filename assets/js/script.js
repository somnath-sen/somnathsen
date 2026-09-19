/**
 * ============================================================================
 * SOMNATH SEN — PORTFOLIO INTERACTION ENGINE (2026 EDITION)
 * Clean, lightweight, performance-first Vanilla JavaScript
 * ============================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* --------------------------------------------------------------------------
     01. THEME CONTROLLER (Dark / Light Mode)
     -------------------------------------------------------------------------- */
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const htmlRoot = document.documentElement;

  // Detect stored theme or system preference
  const getInitialTheme = () => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  };

  const applyTheme = (theme) => {
    htmlRoot.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  // Set initial theme
  applyTheme(getInitialTheme());

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  }

  // Listen to OS system theme changes if user hasn't explicitly set one
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });


  /* --------------------------------------------------------------------------
     02. SCROLL PROGRESS INDICATOR
     -------------------------------------------------------------------------- */
  const scrollProgress = document.getElementById('scrollProgress');

  const updateScrollProgress = () => {
    if (!scrollProgress) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = `${scrollPercent}%`;
  };

  window.addEventListener('scroll', updateScrollProgress, { passive: true });


  /* --------------------------------------------------------------------------
     03. NAVBAR SCROLL EFFECT & MOBILE DRAWER
     -------------------------------------------------------------------------- */
  const mainNavbar = document.getElementById('mainNavbar');
  const mobileToggleBtn = document.getElementById('mobileToggleBtn');
  const menuIcon = document.getElementById('menuIcon');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  const handleNavbarScroll = () => {
    if (!mainNavbar) return;
    if (window.scrollY > 40) {
      mainNavbar.classList.add('scrolled');
    } else {
      mainNavbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  // Mobile Menu Toggle
  if (mobileToggleBtn && mobileNavDrawer) {
    mobileToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileNavDrawer.classList.toggle('open');
      if (menuIcon) {
        menuIcon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
      }
    });

    // Close on navigation link click
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNavDrawer.classList.remove('open');
        if (menuIcon) menuIcon.className = 'fa-solid fa-bars';
      });
    });

    // Close when clicking outside drawer
    document.addEventListener('click', (e) => {
      if (!mobileNavDrawer.contains(e.target) && !mobileToggleBtn.contains(e.target)) {
        mobileNavDrawer.classList.remove('open');
        if (menuIcon) menuIcon.className = 'fa-solid fa-bars';
      }
    });
  }


  /* --------------------------------------------------------------------------
     04. ACTIVE NAVIGATION LINK HIGHLIGHTER
     -------------------------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const highlightNavOnScroll = () => {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', highlightNavOnScroll, { passive: true });


  /* --------------------------------------------------------------------------
     05. SCROLL REVEAL (IntersectionObserver)
     -------------------------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal-init');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback if IntersectionObserver is unavailable
    revealElements.forEach(el => el.classList.add('revealed'));
  }


  /* --------------------------------------------------------------------------
     06. PROJECT CATEGORY FILTERING
     -------------------------------------------------------------------------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectRows = document.querySelectorAll('.project-row');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active filter button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectRows.forEach(row => {
        const categories = (row.getAttribute('data-category') || '').split(' ');
        
        if (filterValue === 'all' || categories.includes(filterValue)) {
          row.style.opacity = '0';
          row.style.display = 'grid';
          setTimeout(() => {
            row.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            row.style.opacity = '1';
          }, 20);
        } else {
          row.style.opacity = '0';
          setTimeout(() => {
            row.style.display = 'none';
          }, 300);
        }
      });
    });
  });


  /* --------------------------------------------------------------------------
     07. MINIMAL CUSTOM CURSOR (Desktop Only)
     -------------------------------------------------------------------------- */
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

  if (!isTouchDevice && cursorDot && cursorRing) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let isMoving = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      if (!isMoving) {
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '1';
        isMoving = true;
      }
    });

    // Smooth cursor follower animation loop
    const animateCursor = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
      requestAnimationFrame(animateCursor);
    };
    requestAnimationFrame(animateCursor);

    // Expand cursor ring on interactive elements
    const interactiveSelectors = 'a, button, input, textarea, .project-row, .skill-card, .building-card, .timeline-card';
    const interactiveElements = document.querySelectorAll(interactiveSelectors);

    const addHover = () => document.body.classList.add('cursor-hover');
    const removeHover = () => document.body.classList.remove('cursor-hover');

    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', addHover);
      el.addEventListener('mouseleave', removeHover);
    });

    // Handle dynamically added or modified elements
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveSelectors)) {
        document.body.classList.add('cursor-hover');
      } else {
        document.body.classList.remove('cursor-hover');
      }
    });

    window.addEventListener('mouseout', () => {
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
      isMoving = false;
    });
  }


  /* --------------------------------------------------------------------------
     08. PRESERVED GOOGLE SHEETS CONTACT FORM INTEGRATION
     -------------------------------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const toastNotice = document.getElementById('toastNotice');
  const toastMessage = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');

  // Exact Google Apps Script deployment URL from repository
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwqlceRfUBkQ2nGONkOmUSEz0HfzoxQTpN_Occi6jpt7HnQUHIa53CpXGKHIoyv0lihMA/exec';

  const showToast = (message, isSuccess = true) => {
    if (!toastNotice) return;
    
    toastMessage.textContent = message;
    if (isSuccess) {
      toastIcon.className = 'fa-regular fa-circle-check toast-icon';
      toastIcon.style.color = 'var(--accent-emerald)';
    } else {
      toastIcon.className = 'fa-regular fa-circle-xmark toast-icon';
      toastIcon.style.color = '#EF4444';
    }

    toastNotice.classList.add('visible');
    setTimeout(() => {
      toastNotice.classList.remove('visible');
    }, 5000);
  };

  if (contactForm && submitBtn) {
    const inputs = contactForm.querySelectorAll('input, textarea');

    // Real-time input validation to enable submit button
    const validateForm = () => {
      const isValid = contactForm.checkValidity();
      if (isValid) {
        submitBtn.removeAttribute('disabled');
      } else {
        submitBtn.setAttribute('disabled', '');
      }
    };

    inputs.forEach(input => {
      input.addEventListener('input', validateForm);
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!contactForm.checkValidity()) {
        showToast('Please fill in all required fields correctly.', false);
        return;
      }

      const btnText = submitBtn.querySelector('.btn-text');
      const originalText = btnText ? btnText.textContent : 'Send Message';

      // Set Sending State
      submitBtn.classList.add('sending');
      if (btnText) btnText.textContent = 'Sending Message...';
      submitBtn.setAttribute('disabled', '');

      // Execute POST request to Google Apps Script
      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams(new FormData(contactForm))
      })
      .then(() => {
        showToast('Thank you! Your message has been sent successfully.', true);
        contactForm.reset();
        submitBtn.classList.remove('sending');
        if (btnText) btnText.textContent = originalText;
        submitBtn.setAttribute('disabled', '');
      })
      .catch((error) => {
        console.error('Contact Form Submission Error:', error);
        showToast('Unable to send message right now. Please email directly.', false);
        submitBtn.classList.remove('sending');
        if (btnText) btnText.textContent = originalText;
        submitBtn.removeAttribute('disabled');
      });
    });
  }

});