/**
 * ============================================================================
 * SOMNATH SEN — THE BIOGRAPHY BOOK
 * 3D Physical Book Navigation Engine & State Machine
 * ============================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  const bookStage = document.getElementById('bookStage');
  const book = document.getElementById('book');
  const sheets = Array.from(document.querySelectorAll('.sheet'));
  const btnNext = document.getElementById('btnNext');
  const btnPrev = document.getElementById('btnPrev');
  const btnOpenCover = document.getElementById('btnOpenCover');
  const btnCloseBook = document.getElementById('btnCloseBook');
  const btnContents = document.getElementById('btnContents');
  const btnCloseContents = document.getElementById('btnCloseContents');
  const contentsOverlay = document.getElementById('contentsOverlay');
  const contentsItems = document.querySelectorAll('.contents-item');
  const spreadBadge = document.getElementById('spreadBadge');
  const spreadIndicator = document.getElementById('spreadIndicator');
  const spreadFolio = document.getElementById('spreadFolio');
  const btnSoundToggle = document.getElementById('btnSoundToggle');
  const soundIcon = document.getElementById('soundIcon');
  const cornerCurls = document.querySelectorAll('.page-corner-curl');
  const allPageFaces = Array.from(document.querySelectorAll('.page-face'));

  const totalSheets = sheets.length; // 9 sheets (0 to 8)
  let currentSheetIndex = 0; // Number of sheets currently flipped to the left (0 = closed cover)
  let currentMobilePageIndex = 0; // Active single page on mobile (0 to allPageFaces.length - 1)
  let isFlipping = false;
  let soundEnabled = false;

  const isMobileMode = () => window.innerWidth <= 768;

  // Chapter labels for folios and indicator (Desktop spreads)
  const chapterMetadata = [
    { badge: "COVER", title: "Selected Works", folio: "Front" },
    { badge: "PREFACE", title: "Hello, I'm Somnath", folio: "01 / 14" },
    { badge: "CH. 01", title: "About & Journey", folio: "02–05" },
    { badge: "CH. 02", title: "Two Sides of Work", folio: "06–07" },
    { badge: "CH. 03", title: "Data Analytics", folio: "08–09" },
    { badge: "CH. 04", title: "Featured Projects", folio: "10–11" },
    { badge: "CH. 05", title: "EdFlow Case Study", folio: "11–12" },
    { badge: "CH. 06", title: "Workbench & NPTEL", folio: "12–13" },
    { badge: "EPILOGUE", title: "Contact & Notes", folio: "14 / 14" }
  ];

  // Dedicated single-page metadata for mobile reading mode
  const mobilePageMetadata = [
    { badge: "COVER", title: "Somnath Sen", folio: "Front" },
    { badge: "EX LIBRIS", title: "Archive Plate", folio: "Flyleaf" },
    { badge: "PREFACE", title: "Hello, I'm Somnath", folio: "01 / 14" },
    { badge: "PORTRAIT", title: "Somnath Sen", folio: "02 / 14" },
    { badge: "ABOUT", title: "A Developer & Analyst", folio: "03 / 14" },
    { badge: "JOURNEY", title: "Chronological Timeline", folio: "04 / 14" },
    { badge: "SKILLS", title: "Software Development", folio: "05 / 14" },
    { badge: "ANALYTICS", title: "Data & BI Toolsets", folio: "06 / 14" },
    { badge: "PIPELINE", title: "From Data to Insight", folio: "07 / 14" },
    { badge: "TOOLKIT", title: "Analytical Workflow", folio: "08 / 14" },
    { badge: "PROJECTS", title: "Things I've Built", folio: "09 / 14" },
    { badge: "CASE STUDY", title: "EdFlow Deep Dive", folio: "10 / 14" },
    { badge: "WORKBENCH", title: "What I'm Building Now", folio: "11 / 14" },
    { badge: "PHILOSOPHY", title: "How I Work & NPTEL", folio: "12 / 14" },
    { badge: "CONTACT", title: "Let's Create Next Page", folio: "13 / 14" },
    { badge: "EPILOGUE", title: "Thanks for Reading", folio: "14 / 14" },
    { badge: "COLOPHON", title: "Book Specifications", folio: "Colophon" },
    { badge: "BACK", title: "Hardcover Back", folio: "Back" }
  ];

  /* --------------------------------------------------------------------------
     00. CINEMATIC BIOGRAPHY LOADING CONTROLLER
     -------------------------------------------------------------------------- */
  const biographyLoader = document.getElementById('biographyLoader');
  const loaderProgressFill = document.getElementById('loaderProgressFill');
  const loaderPercent = document.getElementById('loaderPercent');
  const loaderStatusText = document.getElementById('loaderStatusText');
  const loaderSkipBtn = document.getElementById('loaderSkipBtn');

  if (biographyLoader && loaderProgressFill && loaderPercent && loaderStatusText) {
    let progress = 0;
    let isLoaderDismissed = false;

    const statusMilestones = [
      { threshold: 15, text: "Typesetting preface & archives..." },
      { threshold: 38, text: "Compiling software repositories & systems..." },
      { threshold: 64, text: "Structuring data analytics pipelines..." },
      { threshold: 86, text: "Binding edition 2026 hardcover..." },
      { threshold: 98, text: "Opening the chronicle..." }
    ];

    const dismissLoader = () => {
      if (isLoaderDismissed) return;
      isLoaderDismissed = true;
      progress = 100;
      loaderProgressFill.style.width = '100%';
      loaderPercent.textContent = '100%';
      loaderStatusText.textContent = 'Welcome to the chronicle.';

      setTimeout(() => {
        biographyLoader.classList.add('loaded');
        setTimeout(() => {
          biographyLoader.setAttribute('aria-hidden', 'true');
          biographyLoader.style.display = 'none';
        }, 900);
      }, 350);
    };

    // Smooth progress simulation
    const progressInterval = setInterval(() => {
      if (isLoaderDismissed) {
        clearInterval(progressInterval);
        return;
      }

      const step = Math.floor(Math.random() * 6) + 3; // +3% to +8%
      progress = Math.min(progress + step, 96);

      loaderProgressFill.style.width = `${progress}%`;
      loaderPercent.textContent = `${progress}%`;

      // Update literary status text with subtle fade
      for (let i = statusMilestones.length - 1; i >= 0; i--) {
        if (progress >= statusMilestones[i].threshold) {
          if (loaderStatusText.textContent !== statusMilestones[i].text) {
            loaderStatusText.style.opacity = '0';
            setTimeout(() => {
              loaderStatusText.textContent = statusMilestones[i].text;
              loaderStatusText.style.opacity = '1';
            }, 120);
          }
          break;
        }
      }
    }, 70);

    // Complete on load with minimum cinematic display duration (~1.3s)
    const minTimePromise = new Promise(resolve => setTimeout(resolve, 1300));
    const loadPromise = new Promise(resolve => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', resolve, { once: true });
      }
    });

    Promise.all([minTimePromise, loadPromise]).then(() => {
      clearInterval(progressInterval);
      dismissLoader();
    });

    // Skip button for immediate entry
    if (loaderSkipBtn) {
      loaderSkipBtn.addEventListener('click', () => {
        clearInterval(progressInterval);
        dismissLoader();
      });
    }
  }

  /* --------------------------------------------------------------------------
     01. Z-INDEX & SHEET STACKING MANAGER (Desktop Spreads & Mobile Single Page)
     -------------------------------------------------------------------------- */
  const updateSheetStacking = () => {
    if (isMobileMode()) {
      // Mobile Single-Page Display: show exactly one page face at a time
      allPageFaces.forEach((face, idx) => {
        if (idx === currentMobilePageIndex) {
          face.classList.add('mobile-active');
          face.scrollTop = 0;
        } else {
          face.classList.remove('mobile-active');
        }
      });

      // Update button states on mobile
      btnPrev.disabled = currentMobilePageIndex === 0;
      btnCloseBook.disabled = currentMobilePageIndex === 0;
      btnNext.disabled = currentMobilePageIndex >= allPageFaces.length - 1;

      // Update mobile folios and badge
      const meta = mobilePageMetadata[currentMobilePageIndex] || { badge: 'PAGE', title: '', folio: `${currentMobilePageIndex + 1}` };
      if (spreadBadge) spreadBadge.textContent = meta.badge;
      if (spreadIndicator) spreadIndicator.textContent = meta.title;
      if (spreadFolio) spreadFolio.textContent = meta.folio;

    } else {
      // Desktop 2-Page 3D Sheets Display
      allPageFaces.forEach(face => face.classList.remove('mobile-active'));

      sheets.forEach((sheet, idx) => {
        if (idx < currentSheetIndex) {
          // Sheet is on the LEFT side (flipped)
          sheet.classList.add('flipped');
          sheet.style.zIndex = idx + 1;
        } else {
          // Sheet is on the RIGHT side (unflipped)
          sheet.classList.remove('flipped');
          sheet.style.zIndex = totalSheets - idx;
        }
      });

      // Update book stage closed/open class
      if (currentSheetIndex === 0) {
        bookStage.classList.add('book-closed');
        btnPrev.setAttribute('disabled', '');
        btnCloseBook.setAttribute('disabled', '');
      } else {
        bookStage.classList.remove('book-closed');
        btnPrev.removeAttribute('disabled');
        btnCloseBook.removeAttribute('disabled');
      }

      if (currentSheetIndex >= totalSheets) {
        btnNext.setAttribute('disabled', '');
      } else {
        btnNext.removeAttribute('disabled');
      }

      // Update spread indicator
      const currentMeta = chapterMetadata[Math.min(currentSheetIndex, chapterMetadata.length - 1)];
      if (currentMeta) {
        if (spreadBadge) spreadBadge.textContent = currentMeta.badge;
        if (spreadIndicator) spreadIndicator.textContent = currentMeta.title;
        if (spreadFolio) spreadFolio.textContent = currentMeta.folio;
      }
    }
  };

  /* --------------------------------------------------------------------------
     02. PHYSICAL PAGE FLIP AUDIO (Web Audio API)
     -------------------------------------------------------------------------- */
  let audioCtx = null;

  const playPaperRustle = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      // Generate a soft realistic paper flutter using bandpass-filtered noise
      const bufferSize = audioCtx.sampleRate * 0.18; // 180ms
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1400;
      filter.Q.value = 1.2;

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      noise.start();
    } catch (e) {
      // Audio context unavailable or blocked; fail silently
    }
  };

  if (btnSoundToggle) {
    btnSoundToggle.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      if (soundIcon) {
        soundIcon.className = soundEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
        soundIcon.style.color = soundEnabled ? 'var(--cover-gold)' : '';
      }
      if (soundEnabled) playPaperRustle();
    });
  }

  /* --------------------------------------------------------------------------
     03. FLIP PAGE LOGIC (FORWARD & BACKWARD)
     -------------------------------------------------------------------------- */
  const flipNext = () => {
    if (isFlipping) return;

    if (isMobileMode()) {
      if (currentMobilePageIndex < allPageFaces.length - 1) {
        currentMobilePageIndex++;
        currentSheetIndex = Math.floor(currentMobilePageIndex / 2);
        playPaperRustle();
        updateSheetStacking();
      }
    } else {
      if (currentSheetIndex >= totalSheets) return;
      isFlipping = true;

      const sheetToFlip = sheets[currentSheetIndex];
      sheetToFlip.style.zIndex = 100; // Elevation during rotation
      sheetToFlip.classList.add('flipping');
      playPaperRustle();

      // Trigger 3D rotation
      sheetToFlip.classList.add('flipped');
      currentSheetIndex++;
      currentMobilePageIndex = Math.min(currentSheetIndex * 2, allPageFaces.length - 1);

      setTimeout(() => {
        sheetToFlip.classList.remove('flipping');
        updateSheetStacking();
        isFlipping = false;
      }, 950);
    }
  };

  const flipPrev = () => {
    if (isFlipping) return;

    if (isMobileMode()) {
      if (currentMobilePageIndex > 0) {
        currentMobilePageIndex--;
        currentSheetIndex = Math.floor(currentMobilePageIndex / 2);
        playPaperRustle();
        updateSheetStacking();
      }
    } else {
      if (currentSheetIndex <= 0) return;
      isFlipping = true;

      currentSheetIndex--;
      currentMobilePageIndex = currentSheetIndex * 2;
      const sheetToUnflip = sheets[currentSheetIndex];
      sheetToUnflip.style.zIndex = 100; // Elevation during rotation
      sheetToUnflip.classList.add('flipping');
      playPaperRustle();

      // Trigger 3D reverse rotation
      sheetToUnflip.classList.remove('flipped');

      setTimeout(() => {
        sheetToUnflip.classList.remove('flipping');
        updateSheetStacking();
        isFlipping = false;
      }, 950);
    }
  };

  const goToSheet = (targetIndex) => {
    if (contentsOverlay) contentsOverlay.classList.remove('active');

    if (isMobileMode()) {
      // Map sheet index to mobile single page index
      const mobileIndexMap = [0, 2, 4, 6, 8, 10, 12, 14, 15];
      currentMobilePageIndex = mobileIndexMap[targetIndex] ?? (targetIndex * 2);
      currentSheetIndex = targetIndex;
      playPaperRustle();
      updateSheetStacking();
    } else {
      targetIndex = Math.max(0, Math.min(targetIndex, totalSheets));
      if (targetIndex === currentSheetIndex) return;

      // Immediate re-indexing for multi-page jump
      currentSheetIndex = targetIndex;
      currentMobilePageIndex = currentSheetIndex * 2;
      playPaperRustle();
      updateSheetStacking();
    }
  };

  // Window resize handler for smooth responsive transition
  window.addEventListener('resize', () => {
    updateSheetStacking();
  });

  // Button Listeners
  if (btnNext) btnNext.addEventListener('click', flipNext);
  if (btnPrev) btnPrev.addEventListener('click', flipPrev);
  if (btnOpenCover) {
    btnOpenCover.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isMobileMode()) {
        currentMobilePageIndex = 2; // Jump to Preface on mobile
        currentSheetIndex = 1;
        playPaperRustle();
        updateSheetStacking();
      } else {
        flipNext();
      }
    });
  }
  if (btnCloseBook) btnCloseBook.addEventListener('click', () => goToSheet(0));

  // Corner Dog-Ear Click
  cornerCurls.forEach(curl => {
    curl.addEventListener('click', (e) => {
      e.stopPropagation();
      flipNext();
    });
  });

  // Direct Page Click (Click right side of book to go next, left side to go prev)
  book.addEventListener('click', (e) => {
    // Don't trigger page turn if user clicked an interactive link, button, input, or textarea
    if (e.target.closest('a, button, input, textarea, .page-corner-curl')) {
      return;
    }

    const rect = book.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const isRightSide = clickX > (rect.width / 2);

    if (currentSheetIndex === 0) {
      flipNext();
    } else if (isRightSide) {
      flipNext();
    } else {
      flipPrev();
    }
  });

  /* --------------------------------------------------------------------------
     04. KEYBOARD NAVIGATION
     -------------------------------------------------------------------------- */
  window.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea')) return;

    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      flipNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      flipPrev();
    } else if (e.key === 'Home') {
      e.preventDefault();
      goToSheet(0);
    } else if (e.key === 'Escape') {
      if (contentsOverlay) contentsOverlay.classList.remove('active');
    }
  });

  /* --------------------------------------------------------------------------
     05. MOBILE TOUCH SWIPE NAVIGATION
     -------------------------------------------------------------------------- */
  let touchStartX = 0;
  let touchStartY = 0;

  book.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  book.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Detect horizontal swipe
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        flipNext(); // Swiped left -> next page
      } else {
        flipPrev(); // Swiped right -> previous page
      }
    }
  }, { passive: true });

  /* --------------------------------------------------------------------------
     06. TABLE OF CONTENTS MODAL
     -------------------------------------------------------------------------- */
  if (btnContents && contentsOverlay) {
    btnContents.addEventListener('click', () => {
      contentsOverlay.classList.add('active');
    });

    if (btnCloseContents) {
      btnCloseContents.addEventListener('click', () => {
        contentsOverlay.classList.remove('active');
      });
    }

    contentsOverlay.addEventListener('click', (e) => {
      if (e.target === contentsOverlay) {
        contentsOverlay.classList.remove('active');
      }
    });

    contentsItems.forEach(item => {
      item.addEventListener('click', () => {
        const gotoIdx = parseInt(item.getAttribute('data-goto'), 10);
        goToSheet(gotoIdx);
      });
    });
  }

  /* --------------------------------------------------------------------------
     07. PRESERVED GOOGLE SHEETS CONTACT FORM
     -------------------------------------------------------------------------- */
  const contactForm = document.getElementById('bookContactForm');
  const submitBtn = document.getElementById('bookSubmitBtn');
  const bookToast = document.getElementById('bookToast');
  const bookToastText = document.getElementById('bookToastText');

  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwqlceRfUBkQ2nGONkOmUSEz0HfzoxQTpN_Occi6jpt7HnQUHIa53CpXGKHIoyv0lihMA/exec';

  const showToast = (message, isSuccess = true) => {
    if (!bookToast) return;
    bookToastText.textContent = message;
    bookToast.classList.add('active');
    setTimeout(() => {
      bookToast.classList.remove('active');
    }, 5000);
  };

  if (contactForm && submitBtn) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!contactForm.checkValidity()) {
        showToast('Please fill in your name, email, and message.', false);
        return;
      }

      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span>Transmitting...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
      submitBtn.setAttribute('disabled', '');

      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams(new FormData(contactForm))
      })
      .then(() => {
        showToast('Thank you! Your message has been sent to Somnath.', true);
        contactForm.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.removeAttribute('disabled');
      })
      .catch((error) => {
        console.error('Submission error:', error);
        showToast('Transmission error. Please email sen126265@gmail.com directly.', false);
        submitBtn.innerHTML = originalText;
        submitBtn.removeAttribute('disabled');
      });
    });
  }

  // Initial layout initialization
  updateSheetStacking();

});