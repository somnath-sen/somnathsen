'use strict';

let ytPlayer;
let ytAPIReady = false;

// 1. YouTube API Ready Callback
window.onYouTubeIframeAPIReady = function() {
  ytAPIReady = true;
  // Trigger a custom event in case we already revealed the section
  window.dispatchEvent(new Event('yt-api-ready'));
};

// 2. Load the YouTube IFrame API asynchronously
const ytTag = document.createElement('script');
ytTag.src = "https://www.youtube.com/iframe_api";
const firstTag = document.getElementsByTagName('script')[0];
firstTag.parentNode.insertBefore(ytTag, firstTag);

// Preloader
const preloader = document.querySelector("[data-preloader]");
window.addEventListener("load", () => {
  setTimeout(() => {
    preloader.classList.add("loaded");
  }, 1000);
});

// Theme toggle
const themeBtn = document.querySelector("[data-theme-btn]");
const HTML = document.documentElement;
let isDark = localStorage.getItem("theme") !== "light";

if (!isDark) HTML.setAttribute("data-theme", "light");

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    isDark = !isDark;
    const theme = isDark ? "dark" : "light";
    HTML.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  });
}

// Typewriter Effect
const typeTextSpan = document.querySelector(".type-text");
const textArray = ["Web Applications", "Digital Experiences", "SaaS Platforms", "Modern Interfaces"];
let textArrayIndex = 0;
let charIndex = 0;

function type() {
  if (charIndex < textArray[textArrayIndex].length) {
    typeTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
    charIndex++;
    setTimeout(type, 100);
  } else {
    setTimeout(erase, 2000);
  }
}

function erase() {
  if (charIndex > 0) {
    typeTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex-1);
    charIndex--;
    setTimeout(erase, 50);
  } else {
    textArrayIndex++;
    if(textArrayIndex >= textArray.length) textArrayIndex = 0;
    setTimeout(type, 500);
  }
}

if(typeTextSpan) {
  setTimeout(type, 1500);
}

// VanillaTilt Init
// Glare and max values are largely overwritten by data-attributes in HTML
if (typeof VanillaTilt !== 'undefined') {
  VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
    max: 5,
    speed: 400,
    glare: true,
    "max-glare": 0.2,
  });
}

// Scroll Reveal with Intersection Observer
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      
      // Check for YouTube IFrame API Player
      const playerDiv = entry.target.querySelector('#youtube-player');
      if (playerDiv) {
        const initPlayer = () => {
          if (ytPlayer || !ytAPIReady) return;
          const videoId = playerDiv.getAttribute('data-video-id');
          
          ytPlayer = new YT.Player('youtube-player', {
            width: '100%',
            height: '100%',
            videoId: videoId,
            playerVars: {
              'autoplay': 1,
              'mute': 1,
              'controls': 0,
              'modestbranding': 1,
              'rel': 0,
              'showinfo': 0,
              'loop': 1,
              'playlist': videoId,
              'enablejsapi': 1,
              'widget_referrer': window.location.href
            },
            events: {
              'onReady': (event) => {
                event.target.mute();
                event.target.playVideo();
                event.target.setVolume(70);
                
                // Pulsing unmute button to encourage interaction
                const unmuteBtn = document.getElementById('video-unmute-btn');
                if (unmuteBtn) unmuteBtn.classList.add('pulsing');
              },
              'onStateChange': (event) => {
                if (event.data === YT.PlayerState.ENDED) {
                  event.target.playVideo();
                }
              }
            }
          });
        };

        // Global interaction listener to unmute on first user click
        window.addEventListener('click', () => {
          if (ytPlayer && ytPlayer.unMute) {
            ytPlayer.unMute();
            ytPlayer.setVolume(70);
            const icon = document.getElementById('volume-icon');
            if (icon) icon.setAttribute('name', 'volume-high-outline');
            const btn = document.getElementById('video-unmute-btn');
            if (btn) btn.classList.remove('pulsing');
          }
        }, { once: true });

        // Direct button listener
        document.getElementById('video-unmute-btn')?.addEventListener('click', (e) => {
          e.stopPropagation(); // Don't trigger window click
          if (ytPlayer && ytPlayer.unMute) {
             const isMuted = ytPlayer.isMuted();
             if (isMuted) {
               ytPlayer.unMute();
               ytPlayer.setVolume(70);
               document.getElementById('volume-icon')?.setAttribute('name', 'volume-high-outline');
               document.getElementById('video-unmute-btn')?.classList.remove('pulsing');
             } else {
               ytPlayer.mute();
               document.getElementById('volume-icon')?.setAttribute('name', 'volume-mute-outline');
             }
          }
        });

        if (ytAPIReady) {
          initPlayer();
        } else {
          window.addEventListener('yt-api-ready', initPlayer, { once: true });
        }
      }

      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealElements.forEach(el => revealObserver.observe(el));

// Form Logic (Google Sheet Integration)
const scriptURL = 'https://script.google.com/macros/s/AKfycbwqlceRfUBkQ2nGONkOmUSEz0HfzoxQTpN_Occi6jpt7HnQUHIa53CpXGKHIoyv0lihMA/exec';

const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");
const toast = document.querySelector("[data-toast]");
const toastMessage = document.querySelector("[data-toast-message]");
const toastIcon = document.querySelector("[data-toast-icon]");

if (form && formInputs.length > 0 && formBtn) {
  formInputs.forEach(input => {
    input.addEventListener("input", () => {
      if (form.checkValidity()) {
        formBtn.removeAttribute("disabled");
      } else {
        formBtn.setAttribute("disabled", "");
      }
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();

    const btnText = formBtn.querySelector('.btn-text');
    const originalText = btnText.textContent;
    
    // Trigger CSS Transaction Animation
    formBtn.classList.add('is-sending');
    btnText.textContent = "Transmitting...";
    formBtn.setAttribute("disabled", "");

    fetch(scriptURL, {
      method: 'POST',
      mode: 'no-cors',
      body: new URLSearchParams(new FormData(form))
    })
      .then(response => {
        toastMessage.textContent = "Transmission successful!";
        toastIcon.setAttribute("name", "checkmark-circle-outline");
        toastIcon.style.color = "#10b981";
        toast.classList.add("active");

        form.reset();
        
        // Reset transaction animation
        formBtn.classList.remove('is-sending');
        btnText.textContent = originalText;
        formBtn.setAttribute("disabled", ""); 

        setTimeout(() => toast.classList.remove("active"), 5000);
      })
      .catch(error => {
        toastMessage.textContent = "Error transmitting payload.";
        toastIcon.setAttribute("name", "close-circle-outline");
        toastIcon.style.color = "#ef4444";
        toast.classList.add("active");

        formBtn.classList.remove('is-sending');
        btnText.textContent = originalText;
        formBtn.removeAttribute("disabled");

        setTimeout(() => toast.classList.remove("active"), 5000);
      });
  });
}

// macOS Modal Logic
const modalTriggers = document.querySelectorAll('.modal-trigger');
const closeBtns = document.querySelectorAll('.modal-close');

modalTriggers.forEach(trigger => {
  trigger.addEventListener('click', () => {
    const targetId = trigger.getAttribute('data-target');
    const modal = document.querySelector(targetId);
    if(modal) modal.classList.add('active');
  });
});

closeBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.target.closest('.mac-modal-overlay').classList.remove('active');
  });
});

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('mac-modal-overlay')) {
    e.target.classList.remove('active');
  }
});

// Testimonial Card Shuffle Logic
const tCards = Array.from(document.querySelectorAll('.t-card'));
const stack = document.getElementById('testimonial-stack');

if (tCards.length && stack) {
  // Initialize default positions
  tCards.forEach((card, index) => {
    card.classList.add(`pos-${index}`);
  });

  stack.addEventListener('click', () => {
    // Find current cards by their position classes
    const topCard = tCards.find(card => card.classList.contains('pos-0'));
    const midCard = tCards.find(card => card.classList.contains('pos-1'));
    const bottomCard = tCards.find(card => card.classList.contains('pos-2'));

    // 1. Animate top card out
    if(topCard) topCard.classList.add('shuffle-out');

    // 2. Shift others up
    if(midCard) { midCard.classList.remove('pos-1'); midCard.classList.add('pos-0'); }
    if(bottomCard) { bottomCard.classList.remove('pos-2'); bottomCard.classList.add('pos-1'); }

    // 3. After animation completes, place old top card at the bottom of the stack
    setTimeout(() => {
      if(topCard) {
        topCard.classList.remove('pos-0');
        topCard.classList.remove('shuffle-out');
        topCard.classList.add('pos-2');
      }
    }, 400); 
  });
}