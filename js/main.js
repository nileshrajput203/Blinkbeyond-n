/* ========================================
   Blink Beyond — Shared JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ── Premium Branded Splash Screen ──
  const loader = document.getElementById('page-loader');
  if (loader) {
    const docEl = document.documentElement;
    const getCookieSeen = () => /(?:^|; )bb_loader_seen=1/.test(document.cookie);
    const getSeenFlag = () => {
      if (docEl.classList.contains('bb-loader-skip')) return true;
      try {
        if (localStorage.getItem('bb_loader_seen') === '1') return true;
      } catch (e) {}
      if (getCookieSeen()) return true;
      try {
        return sessionStorage.getItem('bb_loader_seen') === '1';
      } catch (e) {
        return false;
      }
    };
    const setSeenFlag = () => {
      try {
        localStorage.setItem('bb_loader_seen', '1');
      } catch (e) {}
      document.cookie = 'bb_loader_seen=1; path=/; max-age=31536000';
      try {
        sessionStorage.setItem('bb_loader_seen', '1');
      } catch (e) {}
    };

    if (getSeenFlag()) {
      loader.classList.add('skip');
      loader.remove();
    } else {
      setSeenFlag();
      const counterEl = document.getElementById('loader-percent');
      const barFill = document.getElementById('loader-bar-fill');
      const fillText = document.getElementById('loader-fill-text');
      let current = 0;
      const duration = 2500; // total ms
      const startTime = performance.now();

      function animateLoader(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Eased progress: fast-slow-fast (ease-in-out cubic)
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        current = Math.floor(eased * 100);

        if (counterEl) {
          const counterValue = current + '%';
          counterEl.textContent = counterValue;
          counterEl.dataset.value = counterValue;
          counterEl.style.setProperty('--progress', current + '%');
        }
        if (barFill) barFill.style.width = current + '%';

        // Progressive white fill inside the text
        if (fillText) {
          fillText.style.background = 
            'linear-gradient(to right, #ffffff 0%, #ffffff ' + current + '%, rgba(255,255,255,0.24) ' + current + '%)';
          fillText.style.webkitBackgroundClip = 'text';
          fillText.style.backgroundClip = 'text';
          fillText.style.webkitTextFillColor = 'transparent';
        }

        if (progress < 1) {
          requestAnimationFrame(animateLoader);
        } else {
          // Done — slide loader out after a brief pause
          setTimeout(() => {
            loader.classList.add('hidden');
            // Remove from DOM after transition
            setTimeout(() => loader.remove(), 900);
          }, 400);
        }
      }

      requestAnimationFrame(animateLoader);
    }
  }

  // ── Navbar scroll effect ──
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // ── Active nav link ──
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .sm-panel-item').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage ||
        (currentPage === '' && href === 'index.html') ||
        (currentPage === 'index.html' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ── Hamburger Menu ──
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ── Staggered menu (vanilla) ──
  const smWrapper = document.querySelector('.staggered-menu-wrapper');
  if (smWrapper) {
    const panel = smWrapper.querySelector('.staggered-menu-panel');
    const preContainer = smWrapper.querySelector('.sm-prelayers');
    const preLayers = preContainer ? Array.from(preContainer.querySelectorAll('.sm-prelayer')) : [];
    const toggleBtn = smWrapper.querySelector('.sm-toggle');
    const icon = smWrapper.querySelector('.sm-icon');
    const plusH = smWrapper.querySelector('.sm-icon-line');
    const plusV = smWrapper.querySelector('.sm-icon-line-v');
    const textInner = smWrapper.querySelector('.sm-toggle-textInner');
    const headerBar = smWrapper.querySelector('.sm-header-bar');
    const position = smWrapper.dataset.position === 'left' ? 'left' : 'right';
    const offscreen = position === 'left' ? -100 : 100;
    const gs = window.gsap || null;
    let open = false;
    let busy = false;
    let openTl = null;
    let closeTween = null;

    const setHeaderScroll = () => {
      if (headerBar) headerBar.classList.toggle('scrolled', window.scrollY > 50);
    };
    setHeaderScroll();
    window.addEventListener('scroll', setHeaderScroll);

    const setOpenState = (next) => {
      open = next;
      if (next) {
        smWrapper.setAttribute('data-open', '');
      } else {
        smWrapper.removeAttribute('data-open');
      }
      if (panel) panel.setAttribute('aria-hidden', next ? 'false' : 'true');
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-expanded', next ? 'true' : 'false');
        toggleBtn.setAttribute('aria-label', next ? 'Close menu' : 'Open menu');
      }
      document.body.classList.toggle('sm-menu-open', next);
    };

    const setInitial = () => {
      if (!panel) return;
      if (gs) {
        gs.set([panel, ...preLayers], { xPercent: offscreen, opacity: 1 });
        if (preContainer) gs.set(preContainer, { xPercent: 0, opacity: 1 });
        if (plusH) gs.set(plusH, { transformOrigin: '50% 50%', rotate: 0 });
        if (plusV) gs.set(plusV, { transformOrigin: '50% 50%', rotate: 90 });
        if (icon) gs.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
        if (textInner) gs.set(textInner, { yPercent: 0 });
      } else {
        panel.style.transform = position === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
      }
    };
    setInitial();

    const animateText = (opening) => {
      if (!textInner) return;
      if (gs) {
        gs.to(textInner, { yPercent: opening ? -50 : 0, duration: 0.35, ease: 'power3.out' });
      } else {
        textInner.style.transform = opening ? 'translateY(-50%)' : 'translateY(0)';
      }
    };

    const animateIcon = (opening) => {
      if (!icon) return;
      if (gs) {
        gs.to(icon, {
          rotate: opening ? 225 : 0,
          duration: opening ? 0.7 : 0.35,
          ease: opening ? 'power4.out' : 'power3.inOut',
          overwrite: 'auto'
        });
      } else {
        icon.style.transform = `rotate(${opening ? 225 : 0}deg)`;
      }
    };

    const openMenu = () => {
      if (busy || open) return;
      busy = true;
      setOpenState(true);
      if (gs && panel) {
        if (openTl) openTl.kill();
        if (closeTween) closeTween.kill();
        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
        const numberEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));
        const socialTitle = panel.querySelector('.sm-socials-title');
        const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link'));

        if (itemEls.length) gs.set(itemEls, { yPercent: 140, rotate: 10 });
        if (numberEls.length) gs.set(numberEls, { '--sm-num-opacity': 0 });
        if (socialTitle) gs.set(socialTitle, { opacity: 0 });
        if (socialLinks.length) gs.set(socialLinks, { y: 25, opacity: 0 });

        const tl = gs.timeline({ paused: true });
        preLayers.forEach((layer, i) => {
          tl.fromTo(layer, { xPercent: offscreen }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07);
        });
        const lastTime = preLayers.length ? (preLayers.length - 1) * 0.07 : 0;
        const panelInsertTime = lastTime + (preLayers.length ? 0.08 : 0);
        const panelDuration = 0.65;
        tl.fromTo(panel, { xPercent: offscreen }, { xPercent: 0, duration: panelDuration, ease: 'power4.out' }, panelInsertTime);

        if (itemEls.length) {
          const itemsStart = panelInsertTime + panelDuration * 0.15;
          tl.to(
            itemEls,
            {
              yPercent: 0,
              rotate: 0,
              duration: 1,
              ease: 'power4.out',
              stagger: { each: 0.1, from: 'start' }
            },
            itemsStart
          );
          if (numberEls.length) {
            tl.to(
              numberEls,
              {
                duration: 0.6,
                ease: 'power2.out',
                '--sm-num-opacity': 1,
                stagger: { each: 0.08, from: 'start' }
              },
              itemsStart + 0.1
            );
          }
        }

        if (socialTitle || socialLinks.length) {
          const socialsStart = panelInsertTime + panelDuration * 0.4;
          if (socialTitle) {
            tl.to(
              socialTitle,
              {
                opacity: 1,
                duration: 0.5,
                ease: 'power2.out'
              },
              socialsStart
            );
          }
          if (socialLinks.length) {
            tl.to(
              socialLinks,
              {
                y: 0,
                opacity: 1,
                duration: 0.55,
                ease: 'power3.out',
                stagger: { each: 0.08, from: 'start' }
              },
              socialsStart + 0.04
            );
          }
        }

        tl.eventCallback('onComplete', () => {
          busy = false;
        });
        openTl = tl;
        tl.play(0);
      } else {
        busy = false;
      }
      animateIcon(true);
      animateText(true);
    };

    const closeMenu = () => {
      if (busy || !open) return;
      busy = true;
      if (gs && panel) {
        if (openTl) openTl.kill();
        const all = [...preLayers, panel].filter(Boolean);
        closeTween = gs.to(all, {
          xPercent: offscreen,
          duration: 0.32,
          ease: 'power3.in',
          overwrite: 'auto',
          onComplete: () => {
            busy = false;
            setOpenState(false);
          }
        });
      } else {
        setOpenState(false);
        busy = false;
      }
      animateIcon(false);
      animateText(false);
    };

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        if (open) {
          closeMenu();
        } else {
          openMenu();
        }
      });
    }

    document.addEventListener('mousedown', (event) => {
      if (!open) return;
      if (panel && panel.contains(event.target)) return;
      if (toggleBtn && toggleBtn.contains(event.target)) return;
      closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });

    if (panel) {
      panel.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => closeMenu());
      });
    }
  }

  // ── Scroll Reveal (Intersection Observer) ──
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  }

  // ── Service word hover pulse ──
  document.querySelectorAll('.service-big-word').forEach(word => {
    word.addEventListener('mouseenter', () => {
      word.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      word.style.transform = 'scale(1.04)';
    });
    word.addEventListener('mouseleave', () => {
      word.style.transform = 'scale(1)';
    });
  });

  // ── Contact form interaction ──
  const contactForm = document.getElementById('contactForm');
  // (Formspree handles the submission natively, so JS intercept is removed)

  // ── Parallax-like float on mouse for hero ──
  const heroContent = document.querySelector('.hero-content');
  const heroSection = document.querySelector('.hero-parallax');
  if (heroContent && heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      heroContent.style.transform = `translate(${x * 8}px, ${y * 8}px)`;
    });
    heroSection.addEventListener('mouseleave', () => {
      heroContent.style.transform = '';
    });
  }

  // ── Creative Minds parallax collage ──
  const creativeParallax = document.getElementById('creative-parallax');
  if (creativeParallax) {
    const cards = Array.from(creativeParallax.querySelectorAll('.creative-photo-card'));
    const layers = cards.map(card => card.querySelector('.creative-photo-layer')).filter(Boolean);
    const gs = window.gsap || null;
    let bounds = creativeParallax.getBoundingClientRect();

    const updateBounds = () => {
      bounds = creativeParallax.getBoundingClientRect();
    };

    const moveLayers = (clientX, clientY) => {
      const relX = (clientX - bounds.left) / bounds.width - 0.5;
      const relY = (clientY - bounds.top) / bounds.height - 0.5;
      cards.forEach((card) => {
        const depth = parseFloat(card.dataset.depth || '0.12');
        const layer = card.querySelector('.creative-photo-layer');
        if (!layer) return;
        const moveX = relX * depth * 140;
        const moveY = relY * depth * 140;
        if (gs) {
          gs.to(layer, { x: moveX, y: moveY, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
        } else {
          layer.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
      });
    };

    const resetLayers = () => {
      layers.forEach(layer => {
        if (gs) {
          gs.to(layer, { x: 0, y: 0, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
        } else {
          layer.style.transform = '';
        }
      });
    };

    creativeParallax.addEventListener('mousemove', (event) => {
      moveLayers(event.clientX, event.clientY);
    });

    creativeParallax.addEventListener('mouseleave', resetLayers);
    window.addEventListener('resize', updateBounds);
    updateBounds();
  }

  // ── Smooth number counter for stats ──
  const statEls = document.querySelectorAll('[data-count]');
  if (statEls.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const suffix = el.dataset.suffix || '';
          let startTime = null;
          const duration = 1500;
          const easeOut = t => 1 - Math.pow(1 - t, 3);
          
          const animateCount = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = (timestamp - startTime) / duration;
            if (progress < 1) {
              const current = Math.floor(target * easeOut(progress));
              el.textContent = current + suffix;
              requestAnimationFrame(animateCount);
            } else {
              el.textContent = target + suffix;
            }
          };
          requestAnimationFrame(animateCount);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    statEls.forEach(el => counterObserver.observe(el));
  }

  // ── Magnetic Cards Reveal Effect ──
  const magneticCards = document.querySelectorAll('.magnetic-card');
  
  magneticCards.forEach(card => {
    const reveal = card.querySelector('.magnetic-reveal');
    const revealInner = card.querySelector('.magnetic-reveal-inner');
    
    if (!reveal || !revealInner) return;

    let isHovered = false;
    let cardSize = { width: 0, height: 0 };
    
    // Target position (raw mouse) vs Current position (smoothed)
    const targetPos = { x: 0, y: 0 };
    const currentPos = { x: 0, y: 0 };
    let animationFrameId;

    // Smooth lerp function
    const lerp = (start, end, factor) => start + (end - start) * factor;

    const updateSize = () => {
      cardSize = {
        width: card.offsetWidth,
        height: card.offsetHeight
      };
      // Keep the inner text full width of the card
      revealInner.style.width = `${cardSize.width}px`;
      revealInner.style.height = `${cardSize.height}px`;
    };

    const animate = () => {
      if (!isHovered) {
        // Option to stop animation when not hovered, but 
        // we keep it running briefly to finish smoothing out.
      }
      
      currentPos.x = lerp(currentPos.x, targetPos.x, 0.15);
      currentPos.y = lerp(currentPos.y, targetPos.y, 0.15);

      // Move the circle cutout
      reveal.style.transform = `translate(${currentPos.x}px, ${currentPos.y}px) translate(-50%, -50%)`;
      // Move the inner text inversely to keep it fixed relative to the card
      revealInner.style.transform = `translate(${-currentPos.x}px, ${-currentPos.y}px)`;

      animationFrameId = requestAnimationFrame(animate);
    };

    // Update dimensions on resize
    updateSize();
    window.addEventListener('resize', updateSize);

    card.addEventListener('mouseenter', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Snap instantly to enter position
      targetPos.x = x;
      targetPos.y = y;
      currentPos.x = x;
      currentPos.y = y;
      
      isHovered = true;
      card.classList.add('is-hovered');
      
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animate();
    });

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      targetPos.x = e.clientX - rect.left;
      targetPos.y = e.clientY - rect.top;
    });

    card.addEventListener('mouseleave', () => {
      isHovered = false;
      card.classList.remove('is-hovered');
    });
  });

  /* ========================================
     FOOTER BRAND VAPORIZE TEXT EFFECT
     ======================================== */
  const brandWrap = document.getElementById('footer-brand-wrap');
  const brandCanvas = document.getElementById('footer-brand-canvas');
  
  if (brandWrap && brandCanvas) {
    const bCtx = brandCanvas.getContext('2d');
    const brandText = 'BLINK BEYOND';
    let brandParticles = [];
    let brandAnimFrame = null;
    let isHovered = false;
    let isVaporizing = false;
    let isReforming = false;
    let brandCanvasW = 0;
    let brandCanvasH = 0;
    
    // DPR for retina
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    // Vaporize config
    const SPREAD = 3;
    const VAPORIZE_SPEED = 1.8;
    const REFORM_LERP = 0.06;
    
    // Create particles from text
    function createBrandParticles() {
      if (!bCtx || !brandCanvasW || !brandCanvasH) return;
      
      const w = brandCanvasW;
      const h = brandCanvasH;
      
      // Set canvas dimensions
      brandCanvas.style.width = w + 'px';
      brandCanvas.style.height = h + 'px';
      brandCanvas.width = Math.floor(w * dpr);
      brandCanvas.height = Math.floor(h * dpr);
      
      // Calculate responsive font size
      const fontSize = Math.min(Math.floor(w / 7), Math.floor(h * 0.55), 180);
      const font = '900 ' + (fontSize * dpr) + 'px "Barlow Condensed", sans-serif';
      
      // Render text for sampling
      bCtx.clearRect(0, 0, brandCanvas.width, brandCanvas.height);
      bCtx.fillStyle = 'rgba(61, 61, 255, 1)';
      bCtx.font = font;
      bCtx.textAlign = 'center';
      bCtx.textBaseline = 'middle';
      bCtx.fillText(brandText, brandCanvas.width / 2, brandCanvas.height / 2);
      
      // Sample pixels
      const imageData = bCtx.getImageData(0, 0, brandCanvas.width, brandCanvas.height);
      const data = imageData.data;
      
      // Calculate sample rate based on DPR
      const sampleRate = Math.max(1, Math.round(dpr));
      
      brandParticles = [];
      
      for (let y = 0; y < brandCanvas.height; y += sampleRate) {
        for (let x = 0; x < brandCanvas.width; x += sampleRate) {
          const idx = (y * brandCanvas.width + x) * 4;
          const alpha = data[idx + 3];
          
          if (alpha > 20) {
            const normalizedAlpha = (alpha / 255) * (sampleRate / dpr);
            brandParticles.push({
              x: x,
              y: y,
              originalX: x,
              originalY: y,
              r: data[idx],
              g: data[idx + 1],
              b: data[idx + 2],
              opacity: normalizedAlpha,
              originalAlpha: normalizedAlpha,
              vx: 0,
              vy: 0,
              speed: 0,
              angle: 0
            });
          }
        }
      }
      
      // Clear and render statically
      bCtx.clearRect(0, 0, brandCanvas.width, brandCanvas.height);
      renderBrandParticles();
    }
    
    // Render particles
    function renderBrandParticles() {
      if (!bCtx) return;
      bCtx.clearRect(0, 0, brandCanvas.width, brandCanvas.height);
      bCtx.save();
      bCtx.scale(dpr, dpr);
      
      for (let i = 0; i < brandParticles.length; i++) {
        const p = brandParticles[i];
        if (p.opacity > 0.01) {
          bCtx.fillStyle = 'rgba(' + p.r + ',' + p.g + ',' + p.b + ',' + p.opacity + ')';
          bCtx.fillRect(p.x / dpr, p.y / dpr, 1, 1);
        }
      }
      
      bCtx.restore();
    }
    
    // Vaporize animation
    let lastTime = 0;
    let vaporProgress = 0;
    
    function animateBrand(currentTime) {
      if (!lastTime) lastTime = currentTime;
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;
      
      if (isVaporizing) {
        vaporProgress += dt * VAPORIZE_SPEED * 100;
        const progress = Math.min(100, vaporProgress);
        
        // Calculate vaporize X position (left to right)
        const textMetrics = bCtx ? bCtx.measureText(brandText) : { width: brandCanvasW * dpr };
        const textWidth = brandCanvasW * dpr;
        const textLeft = (brandCanvas.width - textWidth) / 2;
        const vaporX = textLeft + textWidth * progress / 100;
        
        let allDone = true;
        
        for (let i = 0; i < brandParticles.length; i++) {
          const p = brandParticles[i];
          
          if (p.originalX <= vaporX) {
            // Initialize motion on first contact
            if (p.speed === 0) {
              p.angle = Math.random() * Math.PI * 2;
              p.speed = (Math.random() * 1 + 0.5) * SPREAD;
              p.vx = Math.cos(p.angle) * p.speed;
              p.vy = Math.sin(p.angle) * p.speed;
            }
            
            // Physics
            const dx = p.originalX - p.x;
            const dy = p.originalY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const damping = Math.max(0.95, 1 - dist / (100 * SPREAD));
            
            const spreadX = (Math.random() - 0.5) * SPREAD * 3;
            const spreadY = (Math.random() - 0.5) * SPREAD * 3;
            
            p.vx = (p.vx + spreadX + dx * 0.002) * damping;
            p.vy = (p.vy + spreadY + dy * 0.002) * damping;
            
            // Limit velocity
            const vel = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            const maxVel = SPREAD * 2;
            if (vel > maxVel) {
              p.vx *= maxVel / vel;
              p.vy *= maxVel / vel;
            }
            
            p.x += p.vx * dt * 20;
            p.y += p.vy * dt * 10;
            p.opacity = Math.max(0, p.opacity - dt * 0.35);
            
            if (p.opacity > 0.01) allDone = false;
          } else {
            allDone = false;
          }
        }
        
        renderBrandParticles();
        
        if (allDone && vaporProgress >= 100) {
          isVaporizing = false;
          // Keep in vaporized state while hovered
        }
        
      } else if (isReforming) {
        let allBack = true;
        
        for (let i = 0; i < brandParticles.length; i++) {
          const p = brandParticles[i];
          
          // Lerp back to original position
          p.x += (p.originalX - p.x) * REFORM_LERP;
          p.y += (p.originalY - p.y) * REFORM_LERP;
          p.opacity += (p.originalAlpha - p.opacity) * REFORM_LERP;
          
          // Slow down velocity
          p.vx *= 0.9;
          p.vy *= 0.9;
          
          const dx = Math.abs(p.x - p.originalX);
          const dy = Math.abs(p.y - p.originalY);
          const opDiff = Math.abs(p.opacity - p.originalAlpha);
          
          if (dx > 0.5 || dy > 0.5 || opDiff > 0.01) {
            allBack = false;
          }
        }
        
        renderBrandParticles();
        
        if (allBack) {
          // Snap to original
          for (let i = 0; i < brandParticles.length; i++) {
            const p = brandParticles[i];
            p.x = p.originalX;
            p.y = p.originalY;
            p.opacity = p.originalAlpha;
            p.speed = 0;
            p.vx = 0;
            p.vy = 0;
          }
          renderBrandParticles();
          isReforming = false;
          
          if (!isHovered) {
            cancelAnimationFrame(brandAnimFrame);
            brandAnimFrame = null;
            return;
          }
        }
      }
      
      if (isVaporizing || isReforming) {
        brandAnimFrame = requestAnimationFrame(animateBrand);
      }
    }
    
    // Start vaporize loop
    function startVaporize() {
      isVaporizing = true;
      isReforming = false;
      vaporProgress = 0;
      lastTime = 0;
      
      // Reset particles for fresh vaporize
      for (let i = 0; i < brandParticles.length; i++) {
        const p = brandParticles[i];
        p.speed = 0;
        p.vx = 0;
        p.vy = 0;
      }
      
      if (brandAnimFrame) cancelAnimationFrame(brandAnimFrame);
      brandAnimFrame = requestAnimationFrame(animateBrand);
    }
    
    // Start reform
    function startReform() {
      isVaporizing = false;
      isReforming = true;
      lastTime = 0;
      
      if (brandAnimFrame) cancelAnimationFrame(brandAnimFrame);
      brandAnimFrame = requestAnimationFrame(animateBrand);
    }
    
    // Events
    brandWrap.addEventListener('mouseenter', () => {
      isHovered = true;
      startVaporize();
    });
    
    brandWrap.addEventListener('mouseleave', () => {
      isHovered = false;
      startReform();
    });
    
    // Resize handling
    function resizeBrandCanvas() {
      const rect = brandWrap.getBoundingClientRect();
      brandCanvasW = rect.width;
      brandCanvasH = rect.height;
      createBrandParticles();
    }
    
    // Use ResizeObserver for responsive
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        resizeBrandCanvas();
      });
      ro.observe(brandWrap);
    }
    
    window.addEventListener('resize', resizeBrandCanvas);
    
    // Initial render — wait for fonts
    document.fonts.ready.then(() => resizeBrandCanvas());
  }

  /* ========================================
     TESTIMONIAL PARALLAX STACK (SERVICES)
     ======================================== */
  const testimonialStack = document.getElementById('testimonial-stack');
  if (testimonialStack) {
    const cards = document.querySelectorAll('.testimonial-card');
    const seeMore = document.getElementById('testimonials-see-more');
    const seeMoreBtn = document.getElementById('testimonials-see-more-btn');

    // Simple scroll-driven depth effect without extra dependencies
    const handleScroll = () => {
      const rect = testimonialStack.getBoundingClientRect();
      const viewportH = window.innerHeight || document.documentElement.clientHeight;
      const center = viewportH / 2;

      cards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.top + cardRect.height / 2;
        const distance = (cardCenter - center) / viewportH; // -1..1

        const translateY = distance * -80; // move up slightly as it crosses center
        const depthScale = 1 - Math.abs(distance) * 0.08;
        const rotateX = distance * -10;
        const opacity = 1 - Math.abs(distance) * 0.5;

        card.style.transform =
          `translate3d(0, ${translateY}px, 0) scale(${depthScale}) rotateX(${rotateX}deg)`;
        card.style.opacity = opacity;
      });

      if (seeMore && rect.top < center && rect.bottom < viewportH * 0.8) {
        seeMore.classList.add('visible');
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    if (seeMoreBtn) {
      seeMoreBtn.addEventListener('click', () => {
        window.location.href = 'testimonials.html';
      });
    }
  }

});

/* ========================================
   GSAP PARALLAX + LENIS SMOOTH SCROLL
   (Runs after DOMContentLoaded, outside it)
   ======================================== */
window.addEventListener('load', () => {
  // Guard: only run if GSAP is available (loaded via CDN on index.html)
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // ── Flow-style stacked sections (Blink / Build / Boom) ──
  const flowStack = document.getElementById('services-stack');
  if (flowStack) {
    const sections = Array.from(flowStack.querySelectorAll('.stack-card'));

    sections.forEach((section, index) => {
      gsap.set(section, { zIndex: index + 1 });

      if (index < sections.length - 1) {
        ScrollTrigger.create({
          trigger: section,
          start: 'bottom bottom',
          end: 'bottom top',
          pin: true,
          pinSpacing: false,
        });
      }
    });

    ScrollTrigger.refresh();
  }

  // ── Hero Parallax ──
  const triggerElement = document.querySelector('[data-parallax-layers]');

  if (triggerElement) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        start: '0% 0%',
        end: '100% 0%',
        scrub: 1
      }
    });

    const layers = [
      { layer: '1', yPercent: 70 },
      { layer: '2', yPercent: 55 },
      { layer: '3', yPercent: 40 },
      { layer: '4', yPercent: 10 }
    ];

    layers.forEach((layerObj, idx) => {
      tl.to(
        triggerElement.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
        {
          yPercent: layerObj.yPercent,
          ease: 'none'
        },
        idx === 0 ? undefined : '<'
      );
    });
  }

  // ── Lamp Effect Observer ──
  const footerLamp = document.getElementById('footer-lamp');
  if (footerLamp) {
    const lampObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          footerLamp.classList.add('lamp-active');
          lampObserver.disconnect(); // only animate once
        }
      });
    }, { threshold: 0.3 });
    lampObserver.observe(footerLamp);
  }

  // ── ARC — Giant Rotating Circle (Osmo-style) — SEAMLESS LOOP ──
  const arcScene = document.getElementById('arcScene');
  const arcRing = document.getElementById('arcRing');
  
  if (arcScene && arcRing) {
    const originalCards = gsap.utils.toArray('#arcRing > .a-card');
    const CARD_COUNT = originalCards.length; // 12

    // Clone all cards and append to ring for seamless 360° loop
    originalCards.forEach(card => {
      const clone = card.cloneNode(true);
      clone.classList.add('a-card-clone');
      arcRing.appendChild(clone);
    });

    // Now grab ALL cards (originals + clones = 24)
    const allCards = gsap.utils.toArray('#arcRing > .a-card');
    const totalCards = allCards.length;
    
    // The ring is 260vw × 260vw (set in CSS).
    const ringEl = arcRing;
    const ringDiameter = ringEl.offsetWidth;
    const ringRadius = ringDiameter / 2;
    
    // Distribute ALL cards evenly around full 360° circle
    const angleStep = 360 / totalCards;
    const startAngle = -90; // Top of circle
    
    // Position each card along the circle
    allCards.forEach((card, i) => {
      const angleDeg = startAngle + (i * angleStep);
      const angleRad = angleDeg * (Math.PI / 180);
      
      // Position relative to center of ring
      const cx = ringRadius + ringRadius * Math.cos(angleRad);
      const cy = ringRadius + ringRadius * Math.sin(angleRad);
      
      // Place card centered at this point, rotated tangent to circle
      const cardW = card.offsetWidth;
      const cardH = card.offsetHeight;
      
      gsap.set(card, {
        left: cx - cardW / 2,
        top: cy - cardH / 2,
        rotation: angleDeg + 90, // +90 to make cards tangent to the circle
        transformOrigin: 'center center'
      });
    });
    
    // Auto-rotate the ring continuously – full 360° loops seamlessly
    // because the duplicate cards fill the other half of the circle
    gsap.set(arcRing, { rotation: 8 });
    
    gsap.to(arcRing, {
      rotation: '-=360',   // Full rotation
      duration: 100,       // 100 seconds for one full revolution (slower, more premium)
      ease: 'none',
      repeat: -1           // Infinite loop
    });
  }

});

// ══════════════════════════════════════════
// CINEMATIC TUBE-LIGHT FOOTER
// IntersectionObserver triggers flicker + content reveal
// ══════════════════════════════════════════
(function() {
  const footer = document.getElementById('site-footer');
  const lamp = document.getElementById('footer-lamp');
  if (!footer || !lamp) return;

  let fired = false;

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && !fired) {
        fired = true;

        // 1. Start flicker animation (CSS handles the keyframes)
        setTimeout(function() {
          lamp.classList.add('lamp-active');
        }, 200); // shorter delay so the effect starts quickly

        // 2. After flicker completes (~2.5s animation + 0.6s delay = 3.1s),
        //    reveal footer content
        setTimeout(function() {
          footer.classList.add('footer-revealed');
        }, 1200);

        observer.disconnect();
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  observer.observe(footer);
})();
