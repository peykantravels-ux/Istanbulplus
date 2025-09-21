/**
 * Theme Manager - Handles theme switching and modern interactions
 */

class ThemeManager {
  constructor() {
    this.theme = this.getInitialTheme();
    this.init();
  }
  
  getInitialTheme() {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  }
  
  init() {
    this.applyTheme();
    this.bindEvents();
    this.updateThemeIcons();
    this.setupSystemThemeListener();
  }
  
  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('theme', this.theme);
    
    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor();
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme: this.theme } 
    }));
  }
  
  updateMetaThemeColor() {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const color = this.theme === 'dark' ? '#1a1a1a' : '#667eea';
      metaThemeColor.setAttribute('content', color);
    }
  }
  
  toggleTheme() {
    // Add performance optimization classes
    document.body.classList.add('theme-switching');
    
    // Add switching animation class
    const themeButtons = document.querySelectorAll('.theme-toggle');
    themeButtons.forEach(button => button.classList.add('switching'));
    
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme();
    this.updateThemeIcons();
    this.updateThemeStatus();
    this.addTransitionEffect();
    
    // Remove switching class after animation
    setTimeout(() => {
      themeButtons.forEach(button => button.classList.remove('switching'));
      document.body.classList.remove('theme-switching');
      document.body.classList.add('theme-switched');
      
      // Clean up performance optimization after a brief delay
      setTimeout(() => {
        document.body.classList.remove('theme-switched');
      }, 100);
    }, 600);
    
    // Analytics tracking (if available)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'theme_toggle', {
        'theme': this.theme
      });
    }
  }
  
  addTransitionEffect() {
    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      return; // Skip animations for users who prefer reduced motion
    }
    
    // Add smooth transition effect during theme change
    document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    
    // Add a subtle flash effect to indicate theme change
    const flashOverlay = document.createElement('div');
    flashOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: ${this.theme === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
      pointer-events: none;
      z-index: 9998;
      opacity: 1;
      transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(flashOverlay);
    
    // Fade out the flash overlay
    requestAnimationFrame(() => {
      flashOverlay.style.opacity = '0';
    });
    
    // Clean up after animation completes
    setTimeout(() => {
      document.documentElement.style.transition = '';
      document.body.style.transition = '';
      if (flashOverlay.parentNode) {
        flashOverlay.remove();
      }
    }, 300);
  }
  
  updateThemeIcons() {
    const lightIcons = document.querySelectorAll('.theme-icon-light');
    const darkIcons = document.querySelectorAll('.theme-icon-dark');
    
    // Use CSS classes for smoother transitions instead of display property
    if (this.theme === 'dark') {
      lightIcons.forEach(icon => {
        icon.setAttribute('aria-hidden', 'true');
      });
      darkIcons.forEach(icon => {
        icon.setAttribute('aria-hidden', 'false');
      });
    } else {
      lightIcons.forEach(icon => {
        icon.setAttribute('aria-hidden', 'false');
      });
      darkIcons.forEach(icon => {
        icon.setAttribute('aria-hidden', 'true');
      });
    }
  }
  
  updateThemeStatus() {
    // Update ARIA labels and status text
    const themeButtons = document.querySelectorAll('.theme-toggle');
    const themeStatus = document.querySelectorAll('[id^="theme-status"]');
    const currentThemeText = this.theme === 'dark' ? 'تاریک' : 'روشن';
    const nextThemeText = this.theme === 'dark' ? 'روشن' : 'تاریک';
    
    themeButtons.forEach(button => {
      button.setAttribute('aria-label', `تغییر تم به حالت ${nextThemeText}`);
      button.setAttribute('title', `تغییر به تم ${nextThemeText}`);
    });
    
    themeStatus.forEach(status => {
      status.textContent = `تم فعلی: ${currentThemeText}`;
    });
    
    // Announce theme change to screen readers
    this.announceThemeChange();
  }
  
  announceThemeChange() {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'visually-hidden';
    announcement.textContent = `تم ${this.theme === 'dark' ? 'تاریک' : 'روشن'} فعال شد`;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      announcement.remove();
    }, 1000);
  }
  
  bindEvents() {
    // Theme toggle buttons
    document.querySelectorAll('.theme-toggle').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleTheme();
      });
      
      // Add keyboard support
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleTheme();
        }
      });
    });
  }
  
  setupSystemThemeListener() {
    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      mediaQuery.addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem('theme')) {
          this.theme = e.matches ? 'dark' : 'light';
          this.applyTheme();
          this.updateThemeIcons();
        }
      });
    }
  }
  
  // Public method to get current theme
  getCurrentTheme() {
    return this.theme;
  }
  
  // Public method to set theme programmatically
  setTheme(newTheme) {
    if (['light', 'dark'].includes(newTheme) && newTheme !== this.theme) {
      this.theme = newTheme;
      this.applyTheme();
      this.updateThemeIcons();
      this.addTransitionEffect();
    }
  }
}

/**
 * Modern Interactions - Handles modern UI interactions and animations
 */
class ModernInteractions {
  constructor() {
    this.init();
  }
  
  init() {
    this.setupPageLoader();
    this.setupScrollEffects();
    this.setupBackToTop();
    this.setupNavbarEffects();
    this.setupAnimations();
    this.setupAccessibility();
    this.setupPerformanceOptimizations();
  }
  
  setupPageLoader() {
    // Hide page loader when everything is loaded
    const hideLoader = () => {
      const loader = document.getElementById('pageLoader');
      if (loader) {
        loader.classList.add('fade-out');
        setTimeout(() => {
          loader.style.display = 'none';
          loader.remove(); // Clean up DOM
        }, 500);
      }
    };
    
    // Hide loader when page is fully loaded
    if (document.readyState === 'complete') {
      hideLoader();
    } else {
      window.addEventListener('load', hideLoader);
    }
    
    // Fallback: hide loader after maximum wait time
    setTimeout(hideLoader, 3000);
  }
  
  setupScrollEffects() {
    let ticking = false;
    let lastScrollY = 0;
    
    const updateScrollEffects = () => {
      const scrollY = window.scrollY;
      const navbar = document.getElementById('mainNavbar');
      const backToTop = document.getElementById('backToTop');
      
      // Navbar scroll effects
      if (navbar) {
        if (scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
        
        // Hide/show navbar on scroll direction (optional enhancement)
        if (scrollY > lastScrollY && scrollY > 200) {
          navbar.style.transform = 'translateY(-100%)';
        } else {
          navbar.style.transform = 'translateY(0)';
        }
      }
      
      // Back to top button
      if (backToTop) {
        if (scrollY > 300) {
          backToTop.classList.add('show');
        } else {
          backToTop.classList.remove('show');
        }
      }
      
      lastScrollY = scrollY;
      ticking = false;
    };
    
    // Throttled scroll handler
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollEffects);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
  }
  
  setupBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;
    
    backToTop.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Smooth scroll to top
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // Focus management for accessibility
      setTimeout(() => {
        const skipLink = document.querySelector('.visually-hidden-focusable');
        if (skipLink) {
          skipLink.focus();
        }
      }, 500);
    });
    
    // Keyboard support
    backToTop.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        backToTop.click();
      }
    });
  }
  
  setupNavbarEffects() {
    // Add active state to current page nav links
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath !== '/' && href !== '/' && currentPath.startsWith(href))) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
    
    // Mobile menu auto-close on link click
    const mobileNavLinks = document.querySelectorAll('.navbar-collapse .nav-link');
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 992 && navbarCollapse.classList.contains('show')) {
          navbarToggler.click();
        }
      });
    });
  }
  
  setupAnimations() {
    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Disable animations for users who prefer reduced motion
      document.documentElement.style.setProperty('--transition-fast', '0ms');
      document.documentElement.style.setProperty('--transition-base', '0ms');
      document.documentElement.style.setProperty('--transition-slow', '0ms');
      return;
    }
    
    // Intersection Observer for entrance animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          // Stop observing once animated
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    // Observe elements that should animate in
    const animateElements = document.querySelectorAll('.card, .alert, .footer-brand, .glass-alert');
    animateElements.forEach(el => {
      observer.observe(el);
    });
    
    // Add hover effects to interactive elements
    this.setupHoverEffects();
  }
  
  setupHoverEffects() {
    // Add ripple effect to buttons (optional enhancement)
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
      button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });
  }
  
  setupAccessibility() {
    // Enhanced keyboard navigation
    document.addEventListener('keydown', (e) => {
      // ESC key to close dropdowns
      if (e.key === 'Escape') {
        const openDropdowns = document.querySelectorAll('.dropdown-menu.show');
        openDropdowns.forEach(dropdown => {
          const toggle = dropdown.previousElementSibling;
          if (toggle) {
            toggle.click();
            toggle.focus();
          }
        });
      }
    });
    
    // Focus management for modals and dropdowns
    document.addEventListener('shown.bs.dropdown', (e) => {
      const firstItem = e.target.querySelector('.dropdown-item');
      if (firstItem) {
        firstItem.focus();
      }
    });
    
    // Announce theme changes to screen readers
    window.addEventListener('themeChanged', (e) => {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'visually-hidden';
      announcement.textContent = `تم ${e.detail.theme === 'dark' ? 'تاریک' : 'روشن'} فعال شد`;
      
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        announcement.remove();
      }, 1000);
    });
  }
  
  setupPerformanceOptimizations() {
    // Lazy load images when they come into view
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      });
      
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
    
    // Preload critical resources
    this.preloadCriticalResources();
  }
  
  preloadCriticalResources() {
    // Preload fonts
    const fontPreloads = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
      'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
    ];
    
    fontPreloads.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      document.head.appendChild(link);
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme manager
  window.themeManager = new ThemeManager();
  
  // Initialize modern interactions
  window.modernInteractions = new ModernInteractions();
  
  // Global error handling for better UX
  window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
    // Could show user-friendly error message here
  });
  
  // Service worker registration (if available)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('Service worker registration failed:', err);
    });
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ThemeManager, ModernInteractions };
}