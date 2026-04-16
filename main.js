/**
 * DOLCE — main.js
 * Features: hamburger nav, sticky header, smooth scroll, form validation
 *
 * Coding standards (M06 / M07):
 *   - let / const only (no var)
 *   - === strict equality
 *   - addEventListener only (no onclick="")
 *   - DRY helper functions
 *   - Script placed at bottom of <body>
 */

'use strict';

/* ================================================================
   UTILITY HELPERS
================================================================ */

/**
 * Shorthand querySelector
 * @param {string} selector
 * @param {Element} [context=document]
 * @returns {Element|null}
 */
const qs = (selector, context = document) => context.querySelector(selector);

/**
 * Shorthand querySelectorAll → Array
 * @param {string} selector
 * @param {Element} [context=document]
 * @returns {Element[]}
 */
const qsa = (selector, context = document) => Array.from(context.querySelectorAll(selector));

/* ================================================================
   STICKY HEADER — adds .scrolled class on scroll
================================================================ */
const initStickyHeader = () => {
  const header = qs('#site-header');
  if (!header) return;

  const SCROLL_THRESHOLD = 60;

  const onScroll = () => {
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load in case page starts scrolled
};

/* ================================================================
   HAMBURGER NAVIGATION
================================================================ */
const initHamburger = () => {
  const hamburger = qs('#hamburger');
  const nav       = qs('#primary-nav');
  if (!hamburger || !nav) return;

  const openNav = () => {
    nav.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; // prevent background scroll
  };

  const closeNav = () => {
    nav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  const toggleNav = () => {
    const isOpen = nav.classList.contains('open');
    if (isOpen) {
      closeNav();
    } else {
      openNav();
    }
  };

  hamburger.addEventListener('click', toggleNav);

  // Close nav when a nav link is clicked
  qsa('.nav-link', nav).forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  // Close nav on Escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      closeNav();
      hamburger.focus();
    }
  });

  // Close nav when clicking outside the nav panel
  document.addEventListener('click', (event) => {
    const isOutside = !nav.contains(event.target) && !hamburger.contains(event.target);
    if (isOutside && nav.classList.contains('open')) {
      closeNav();
    }
  });
};

/* ================================================================
   SMOOTH SCROLL — for anchor links
================================================================ */
const initSmoothScroll = () => {
  qsa('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = qs(targetId);
      if (!targetEl) return;

      event.preventDefault();
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
};

/* ================================================================
   FORM VALIDATION — pre-order form (contact.html)
================================================================ */

/**
 * Show error message for a form field
 * @param {Element} input - The input/select/textarea element
 * @param {string} message - Error text to display
 */
const showError = (input, message) => {
  input.classList.add('error');
  const errorEl = qs(`#${input.id}-error`);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  }
};

/**
 * Clear error state from a form field
 * @param {Element} input
 */
const clearError = (input) => {
  input.classList.remove('error');
  const errorEl = qs(`#${input.id}-error`);
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('visible');
  }
};

/**
 * Check if a field has a non-empty value
 * @param {Element} field
 * @returns {boolean}
 */
const isFieldFilled = (field) => field.value.trim() !== '';

/**
 * Validate email format using regex
 * @param {string} email
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email.trim());
};

/**
 * Check that the chosen date is at least 48 hours from now
 * @param {string} dateValue - value from date input (YYYY-MM-DD)
 * @returns {boolean}
 */
const isDateValid = (dateValue) => {
  if (!dateValue) return false;

  const chosen = new Date(dateValue);
  const now    = new Date();
  const minDate = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  // Compare dates only (ignore time component)
  const chosenDay = new Date(chosen.getFullYear(), chosen.getMonth(), chosen.getDate());
  const minDay    = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());

  return chosenDay >= minDay;
};

/**
 * Set minimum selectable date on date input to 48 hours from now
 * @param {HTMLInputElement} dateInput
 */
const setMinOrderDate = (dateInput) => {
  const minDate = new Date(Date.now() + 48 * 60 * 60 * 1000);
  const yyyy    = minDate.getFullYear();
  const mm      = String(minDate.getMonth() + 1).padStart(2, '0');
  const dd      = String(minDate.getDate()).padStart(2, '0');
  dateInput.min = `${yyyy}-${mm}-${dd}`;
};

/**
 * Validate all fields and return true if form is valid
 * @param {HTMLFormElement} form
 * @returns {boolean}
 */
const validateForm = (form) => {
  let isValid = true;

  const nameField    = qs('#customer-name', form);
  const emailField   = qs('#email', form);
  const orderType    = qs('#order-type', form);
  const fulfillment  = qs('#fulfillment', form);
  const orderDate    = qs('#order-date', form);

  // Name
  if (nameField) {
    if (!isFieldFilled(nameField)) {
      showError(nameField, 'Please enter your name.');
      isValid = false;
    } else {
      clearError(nameField);
    }
  }

  // Email
  if (emailField) {
    if (!isFieldFilled(emailField)) {
      showError(emailField, 'Please enter your email address.');
      isValid = false;
    } else if (!isValidEmail(emailField.value)) {
      showError(emailField, 'Please enter a valid email address.');
      isValid = false;
    } else {
      clearError(emailField);
    }
  }

  // Order type (select)
  if (orderType) {
    if (!isFieldFilled(orderType)) {
      showError(orderType, 'Please select a dessert.');
      isValid = false;
    } else {
      clearError(orderType);
    }
  }

  // Fulfillment method
  if (fulfillment) {
    if (!isFieldFilled(fulfillment)) {
      showError(fulfillment, 'Please choose pickup or delivery.');
      isValid = false;
    } else {
      clearError(fulfillment);
    }
  }

  // Date — must be at least 48 hours from now
  if (orderDate) {
    if (!isFieldFilled(orderDate)) {
      showError(orderDate, 'Please choose your preferred date.');
      isValid = false;
    } else if (!isDateValid(orderDate.value)) {
      showError(orderDate, 'We need at least 48 hours notice. Please choose a later date.');
      isValid = false;
    } else {
      clearError(orderDate);
    }
  }

  return isValid;
};

const initFormValidation = () => {
  const form = qs('#order-form');
  if (!form) return;

  // Set min date on load
  const dateInput = qs('#order-date', form);
  if (dateInput) setMinOrderDate(dateInput);

  // Live validation — clear error once user starts correcting a field
  const inputs = qsa('input, select, textarea', form);
  inputs.forEach((input) => {
    input.addEventListener('input', () => clearError(input));
    input.addEventListener('change', () => clearError(input));
  });

  // Submit
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (validateForm(form)) {
      // Show success state
      const successMsg = qs('#form-success');
      if (successMsg) {
        form.style.display = 'none';
        successMsg.removeAttribute('hidden');
        successMsg.focus();
      }
    }
  });
};

/* ================================================================
   HERO SLIDESHOW
   Crossfades through 4 background slide divs every 5 seconds.
   Each slide's image is set in CSS (nth-child selectors) — no inline styles.
================================================================ */
const initHeroSlideshow = () => {
  const slides = qsa('.hero-slide');
  if (slides.length === 0) return;

  // Respect user's reduced-motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  let currentIndex = 0;
  const SLIDE_INTERVAL = 5000;  // ms between transitions
  const TOTAL = slides.length;

  const goToSlide = (index) => {
    slides[currentIndex].classList.remove('hero-slide--active');
    currentIndex = (index + TOTAL) % TOTAL;
    slides[currentIndex].classList.add('hero-slide--active');
  };

  setInterval(() => {
    goToSlide(currentIndex + 1);
  }, SLIDE_INTERVAL);
};

/* ================================================================
   DISH CARD ENTRANCE ANIMATION
   Fade cards in as they enter the viewport using IntersectionObserver
================================================================ */
const initCardAnimations = () => {
  if (!('IntersectionObserver' in window)) return;

  const cards = qsa('.dish-card, .promise-card, .testimonial-card, .step-item, .globe-item');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  cards.forEach((card) => {
    card.classList.add('animate-on-scroll');
    observer.observe(card);
  });
};

/* ================================================================
   ACTIVE NAV LINK — highlight current page link
================================================================ */
const setActiveNavLink = () => {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  qsa('.nav-link').forEach((link) => {
    const href = link.getAttribute('href').replace('./', '');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
};

/* ================================================================
   INIT — run everything when DOM is ready
================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initHamburger();
  initSmoothScroll();
  initHeroSlideshow();
  initFormValidation();
  initCardAnimations();
  setActiveNavLink();
});
