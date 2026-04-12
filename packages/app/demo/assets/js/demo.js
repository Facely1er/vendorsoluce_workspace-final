// VendorSoluce Demo JavaScript

(function() {
  'use strict';

  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function() {
      const isOpen = navLinks.style.display === 'flex';
      navLinks.style.display = isOpen ? 'none' : 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '100%';
      navLinks.style.left = '0';
      navLinks.style.right = '0';
      navLinks.style.background = 'white';
      navLinks.style.padding = '1rem';
      navLinks.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const offsetTop = target.offsetTop - 80; // Account for sticky nav
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // Intersection Observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe elements for animation
  document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll('.feature-card, .screenshot-card, .step-item');
    animateElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      observer.observe(el);
    });
  });

  // Add active state to navigation links on scroll
  let sections = document.querySelectorAll('section[id]');
  let navLinksAll = document.querySelectorAll('.nav-link[href^="#"]');

  function updateActiveNavLink() {
    let scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 100;
      const sectionId = section.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinksAll.forEach(link => {
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.style.color = 'var(--vendorsoluce-green)';
            link.style.fontWeight = '600';
          } else {
            link.style.color = '';
            link.style.fontWeight = '';
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNavLink);

  // Lazy load images (if you add real screenshots later)
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // Screenshot Carousel
  const carousel = document.getElementById('screenshotCarousel');
  const carouselDots = document.getElementById('carouselDots');
  const prevBtn = document.querySelector('.carousel-btn-prev');
  const nextBtn = document.querySelector('.carousel-btn-next');
  
  if (carousel && carouselDots && prevBtn && nextBtn) {
    const slides = carousel.querySelectorAll('.carousel-slide');
    let currentSlide = 0;
    const totalSlides = slides.length;
    
    // Calculate slides per view based on screen size
    function getSlidesPerView() {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    }
    
    // Create dots
    function createDots() {
      carouselDots.innerHTML = '';
      const dotsCount = Math.ceil(totalSlides / getSlidesPerView());
      for (let i = 0; i < dotsCount; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        carouselDots.appendChild(dot);
      }
    }
    
    // Update carousel position
    function updateCarousel() {
      const slidesPerView = getSlidesPerView();
      const slideWidth = 100 / slidesPerView;
      const offset = -(currentSlide * slideWidth);
      carousel.style.transform = `translateX(${offset}%)`;
      
      // Update dots
      const dots = carouselDots.querySelectorAll('.carousel-dot');
      const activeDotIndex = Math.floor(currentSlide / slidesPerView);
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === activeDotIndex);
      });
      
      // Update button states
      const maxSlide = totalSlides - slidesPerView;
      prevBtn.disabled = currentSlide === 0;
      nextBtn.disabled = currentSlide >= maxSlide;
    }
    
    // Go to specific slide
    function goToSlide(index) {
      const slidesPerView = getSlidesPerView();
      currentSlide = Math.min(index * slidesPerView, totalSlides - slidesPerView);
      currentSlide = Math.max(0, currentSlide);
      updateCarousel();
    }
    
    // Next slide
    function nextSlide() {
      const slidesPerView = getSlidesPerView();
      const maxSlide = totalSlides - slidesPerView;
      if (currentSlide < maxSlide) {
        currentSlide += slidesPerView;
        updateCarousel();
      }
    }
    
    // Previous slide
    function prevSlide() {
      const slidesPerView = getSlidesPerView();
      if (currentSlide > 0) {
        currentSlide -= slidesPerView;
        updateCarousel();
      }
    }
    
    // Event listeners
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);
    
    // Keyboard navigation
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    });
    
    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    carousel.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    });
    
    function handleSwipe() {
      const swipeThreshold = 50;
      if (touchEndX < touchStartX - swipeThreshold) {
        nextSlide();
      }
      if (touchEndX > touchStartX + swipeThreshold) {
        prevSlide();
      }
    }
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        createDots();
        updateCarousel();
      }, 250);
    });
    
    // Initialize
    createDots();
    updateCarousel();
    
    // Auto-play (optional - uncomment to enable)
    // setInterval(() => {
    //   const slidesPerView = getSlidesPerView();
    //   const maxSlide = totalSlides - slidesPerView;
    //   if (currentSlide >= maxSlide) {
    //     currentSlide = 0;
    //   } else {
    //     currentSlide += slidesPerView;
    //   }
    //   updateCarousel();
    // }, 5000);
  }

  // Console message for demo
  console.log('%cVendorSoluce Demo', 'color: #33691E; font-size: 20px; font-weight: bold;');
  console.log('%cThis is a demo version showcasing the platform features.', 'color: #666; font-size: 12px;');
  console.log('%cFor the full interactive experience, visit vendorsoluce.com', 'color: #33691E; font-size: 12px;');

})();

