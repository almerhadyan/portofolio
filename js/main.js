// Pure Vanilla JavaScript for Almer Hadyan Portfolion

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supportsCustomCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const cursorZone = document.getElementById('gyro-box');

  const siteLoader = document.querySelector('.site-loader');

  if (siteLoader) {
    document.body.classList.add('site-loading-content');
    const matrixCanvas = document.createElement('canvas');
    matrixCanvas.className = 'site-matrix-background';
    matrixCanvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(matrixCanvas);

    const matrixContext = matrixCanvas.getContext('2d');
    const matrixGlyphs = '01{}[]<>/=+*;';
    const matrixFontSize = 14;
    let matrixWidth = 0;
    let matrixHeight = 0;
    let matrixScale = 1;
    let matrixDrops = [];
    let matrixAnimationFrame = null;
    let lastMatrixFrameAt = 0;

    const resizeMatrix = () => {
      matrixWidth = window.innerWidth;
      matrixHeight = window.innerHeight;
      matrixScale = Math.min(window.devicePixelRatio || 1, 1.5);
      matrixCanvas.width = Math.round(matrixWidth * matrixScale);
      matrixCanvas.height = Math.round(matrixHeight * matrixScale);
      matrixContext.setTransform(matrixScale, 0, 0, matrixScale, 0, 0);

      const columnCount = Math.ceil(matrixWidth / matrixFontSize);
      const rowCount = Math.ceil(matrixHeight / matrixFontSize);
      matrixDrops = Array.from({ length: columnCount }, () => Math.random() * rowCount);
    };

    const drawMatrix = (timestamp = 0) => {
      if (!matrixContext) return;

      const frameInterval = prefersReducedMotion ? 100 : 42;
      if (timestamp - lastMatrixFrameAt < frameInterval) {
        matrixAnimationFrame = window.requestAnimationFrame(drawMatrix);
        return;
      }
      lastMatrixFrameAt = timestamp;

      matrixContext.fillStyle = 'rgba(5, 7, 9, 0.18)';
      matrixContext.fillRect(0, 0, matrixWidth, matrixHeight);
      matrixContext.font = `300 ${matrixFontSize - 4}px "JetBrains Mono", monospace`;

      matrixDrops.forEach((drop, column) => {
        const x = column * matrixFontSize;
        const trailLength = 8;

        for (let trail = trailLength; trail >= 0; trail--) {
          const y = (drop - trail) * matrixFontSize;
          if (y < 0 || y > matrixHeight) continue;

          const glyph = matrixGlyphs[Math.floor(Math.random() * matrixGlyphs.length)];
          const isHead = trail === 0;
          const opacity = isHead ? 0.62 : 0.08 + (1 - trail / trailLength) * 0.36;
          matrixContext.fillStyle = isHead && Math.random() > 0.45
            ? `rgba(190, 255, 215, ${opacity})`
            : `rgba(0, 214, 127, ${opacity})`;
          matrixContext.fillText(glyph, x, y);
        }

        if (drop * matrixFontSize > matrixHeight && Math.random() > 0.985) {
          matrixDrops[column] = -Math.random() * trailLength;
        } else {
          matrixDrops[column] += 0.55;
        }
      });

      matrixAnimationFrame = window.requestAnimationFrame(drawMatrix);
    };

    resizeMatrix();
    drawMatrix();
    window.addEventListener('resize', resizeMatrix);
    const codeLines = [...siteLoader.querySelectorAll('.site-loader-code > div')];
    const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));
    const characterDelay = 18;
    const linePause = 60;
    const typingStartDelay = 350;

    const typeNode = async (sourceNode, targetNode) => {
      if (sourceNode.nodeType === Node.TEXT_NODE) {
        for (const character of sourceNode.textContent) {
          targetNode.append(document.createTextNode(character));
          await wait(characterDelay);
        }
        return;
      }

      if (sourceNode.nodeType === Node.ELEMENT_NODE) {
        const typedElement = sourceNode.cloneNode(false);
        targetNode.append(typedElement);
        for (const childNode of sourceNode.childNodes) {
          await typeNode(childNode, typedElement);
        }
      }
    };

    const typeCode = async () => {
      await wait(typingStartDelay);
      siteLoader.classList.add('is-typing');

      for (let index = 0; index < codeLines.length; index++) {
        const line = codeLines[index];
        const originalNodes = [...line.childNodes].map((node) => node.cloneNode(true));
        line.replaceChildren();
        line.classList.add('is-typing');

        for (const node of originalNodes) {
          await typeNode(node, line);
        }

        line.classList.remove('is-typing');
        line.classList.add('is-typed');
        if (index < codeLines.length - 1) await wait(linePause);
      }
    };

    const typingPromise = typeCode();
    let loaderDismissed = false;
    const dismissSiteLoader = async () => {
      if (loaderDismissed) return;
      loaderDismissed = true;

      await typingPromise;
      siteLoader.classList.add('is-done');
      window.setTimeout(() => {
        siteLoader.remove();
        document.body.classList.remove('site-loading-content');
        document.body.classList.add('site-content-ready');
      }, prefersReducedMotion ? 0 : 320);
    };

    typingPromise.then(dismissSiteLoader);
    window.setTimeout(dismissSiteLoader, 4000);
  }

  if (supportsCustomCursor && cursorZone) {
    const cursorDot = document.createElement('div');
    cursorDot.className = 'custom-cursor-dot';
    cursorDot.setAttribute('aria-hidden', 'true');

    const cursorCard = document.createElement('div');
    cursorCard.className = 'custom-cursor-card';
    cursorCard.setAttribute('aria-hidden', 'true');
    cursorCard.textContent = 'Hello!';
    document.body.append(cursorDot, cursorCard);

    let pointerX = 0;
    let pointerY = 0;
    let dotX = 0;
    let dotY = 0;
    let cardX = 0;
    let cardY = 0;
    const cursorTrail = [];
    let animationFrame = null;
    let hasCursorPosition = false;
    let cardRevealTimeout = null;
    let lastPointerMoveAt = 0;
    let lastDotMoveAt = 0;

    const followCursor = (timestamp) => {
      const dotEasing = 0.28;
      dotX += (pointerX - dotX) * dotEasing;
      dotY += (pointerY - dotY) * dotEasing;
      cursorDot.style.left = `${dotX}px`;
      cursorDot.style.top = `${dotY}px`;
      const dotIsMoving = Math.abs(pointerX - dotX) > 0.4 || Math.abs(pointerY - dotY) > 0.4;
      if (dotIsMoving) {
        lastDotMoveAt = timestamp;
      }

      cursorTrail.push({ x: dotX, y: dotY, time: timestamp });
      const trailDelay = 100;
      const targetTime = timestamp - trailDelay;
      let delayedDot = cursorTrail[0];

      for (let index = cursorTrail.length - 1; index >= 0; index--) {
        if (cursorTrail[index].time <= targetTime) {
          delayedDot = cursorTrail[index];
          break;
        }
      }

      while (cursorTrail.length > 2 && cursorTrail[1].time < targetTime) {
        cursorTrail.shift();
      }

      const maxLeft = window.innerWidth - cursorCard.offsetWidth - 8;
      const maxTop = window.innerHeight - cursorCard.offsetHeight - 8;
      const targetX = Math.max(8, Math.min(delayedDot.x + 22, maxLeft));
      const targetY = Math.max(8, Math.min(delayedDot.y + 22, maxTop));
      const cardEasing = 0.2;

      cardX += (targetX - cardX) * cardEasing;
      cardY += (targetY - cardY) * cardEasing;
      cursorCard.style.left = `${cardX}px`;
      cursorCard.style.top = `${cardY}px`;

      const cardIsMoving = Math.abs(targetX - cardX) > 0.4 || Math.abs(targetY - cardY) > 0.4;
      const trailIsActive = timestamp - lastDotMoveAt < trailDelay;

      if (dotIsMoving || cardIsMoving || trailIsActive) {
        animationFrame = window.requestAnimationFrame(followCursor);
      } else {
        dotX = pointerX;
        dotY = pointerY;
        cardX = targetX;
        cardY = targetY;
        cursorDot.style.left = `${dotX}px`;
        cursorDot.style.top = `${dotY}px`;
        cursorCard.style.left = `${cardX}px`;
        cursorCard.style.top = `${cardY}px`;
        animationFrame = null;
      }
    };

    cursorZone.addEventListener('pointerenter', () => {
      cursorZone.classList.add('custom-cursor-active');
    });

    cursorZone.addEventListener('pointermove', (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      lastPointerMoveAt = performance.now();

      if (!hasCursorPosition) {
        dotX = pointerX;
        dotY = pointerY;
        cardX = pointerX + 22;
        cardY = pointerY + 22;
        lastDotMoveAt = lastPointerMoveAt;
        cursorTrail.length = 0;
        cursorTrail.push({ x: dotX, y: dotY, time: lastPointerMoveAt });
        cursorDot.style.left = `${dotX}px`;
        cursorDot.style.top = `${dotY}px`;
        hasCursorPosition = true;
      }

      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(followCursor);
      }

      cursorDot.classList.add('is-visible');
      if (prefersReducedMotion) {
        cursorCard.classList.add('is-visible');
      } else if (!cursorCard.classList.contains('is-visible') && cardRevealTimeout === null) {
        cardRevealTimeout = window.setTimeout(() => {
          cursorCard.classList.add('is-visible');
          cardRevealTimeout = null;
        }, 100);
      }
    }, { passive: true });

    cursorZone.addEventListener('pointerleave', () => {
      cursorDot.classList.remove('is-visible');
      cursorCard.classList.remove('is-visible');
      cursorZone.classList.remove('custom-cursor-active');
      window.clearTimeout(cardRevealTimeout);
      cardRevealTimeout = null;
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
      cursorTrail.length = 0;
      lastDotMoveAt = 0;
      hasCursorPosition = false;
    });
  }

  const revealTargets = document.querySelectorAll('main > *, main .card, main .project-card, main .explorer-card, main .skill-box');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -90px 0px' });

    revealTargets.forEach((element, index) => {
      element.classList.add('scroll-reveal');
      const revealDelay = prefersReducedMotion ? 0 : (index % 4) * 65;
      element.style.setProperty('--scroll-reveal-delay', `${revealDelay}ms`);
      revealObserver.observe(element);
    });
  }

  // 1. Smooth Scrolling for Navigation & Hash Links
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '#top') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    });
  });

  // 2. Project Explorer Category Filter
  const filterBtns = document.querySelectorAll('.filter-btn');
  const explorerCards = document.querySelectorAll('.explorer-card');

  if (filterBtns.length && explorerCards.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', function () {
        filterBtns.forEach((b) => b.classList.remove('active'));
        this.classList.add('active');

        const filterValue = this.getAttribute('data-filter');

        explorerCards.forEach((card) => {
          const cardCategories = card.getAttribute('data-category') || '';
          if (filterValue === 'all' || cardCategories.includes(filterValue)) {
            card.style.display = 'flex';
            card.style.opacity = '0';
            setTimeout(() => {
              card.style.transition = 'opacity 200ms ease';
              card.style.opacity = '1';
            }, 10);
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // 3. Sandbox Lab - Widget 01: Cursor Magnet & Gyro
  const gyroBox = cursorZone;
  const gyroReadout = document.getElementById('gyro-readout');

  if (gyroBox && gyroReadout) {
    gyroBox.addEventListener('mousemove', (e) => {
      const rect = gyroBox.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = ((e.clientX - centerX) / (rect.width / 2)) * 16;
      const deltaY = ((centerY - e.clientY) / (rect.height / 2)) * 16;

      const rotX = deltaY.toFixed(2);
      const rotY = deltaX.toFixed(2);

      gyroBox.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      gyroReadout.textContent = `X: ${rotX}° | Y: ${rotY}°`;
    });

    gyroBox.addEventListener('mouseleave', () => {
      gyroBox.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg)';
      gyroReadout.textContent = 'X: 0.00° | Y: 0.00°';
    });
  }

  // 4. Sandbox Lab - Widget 02: Hex Theme Generator
  const palettes = [
    { hex: '#00F0FF', green: '#00D67F', amber: '#F59E0B', name: 'CYBER CYAN' },
    { hex: '#00D67F', green: '#6EE7B7', amber: '#FBBF24', name: 'MATRIX EMERALD' },
    { hex: '#F43F5E', green: '#4ADE80', amber: '#FDBA74', name: 'PLASMA ROSE' },
    { hex: '#2DD4BF', green: '#A3E635', amber: '#FCD34D', name: 'LAGOON TEAL' },
    { hex: '#FB7185', green: '#86EFAC', amber: '#FCD34D', name: 'CORAL ROSE' },
    { hex: '#BEF264', green: '#34D399', amber: '#FDBA74', name: 'CITRUS LIME' },
  ];
  let currentPaletteIdx = 0;

  const cycleBtn = document.getElementById('btn-cycle-palette');
  const paletteBox = document.getElementById('palette-preview');
  const paletteHex = document.getElementById('palette-hex');
  const paletteName = document.getElementById('palette-name');
  const paletteWidget = paletteBox?.closest('.sandbox-card');

  if (cycleBtn && paletteBox && paletteHex && paletteName && paletteWidget) {
    let lastPaletteMoveAt = 0;

    const cyclePalette = () => {
      currentPaletteIdx = (currentPaletteIdx + 1) % palettes.length;
      const pal = palettes[currentPaletteIdx];

      paletteHex.textContent = pal.hex;
      paletteHex.style.color = pal.hex;
      paletteName.textContent = pal.name;
      paletteBox.style.backgroundColor = `${pal.hex}14`;
      paletteBox.style.borderColor = `${pal.hex}44`;
      paletteWidget.style.setProperty('--cyan', pal.hex);
      paletteWidget.style.setProperty('--green', pal.green);
      paletteWidget.style.setProperty('--amber', pal.amber);
      paletteWidget.style.setProperty('--border-card-hover', `${pal.hex}4D`);
      paletteWidget.style.setProperty('--bg-card-hover', `color-mix(in srgb, ${pal.hex} 8%, #10151D)`);
    };

    paletteBox.style.transition = 'background-color 200ms ease, border-color 200ms ease';
    paletteHex.style.transition = 'color 200ms ease';
    paletteWidget.addEventListener('pointermove', (event) => {
      const now = performance.now();
      if (now - lastPaletteMoveAt >= 180) {
        cyclePalette();
        lastPaletteMoveAt = now;
      }
    });
    cycleBtn.addEventListener('click', cyclePalette);
  }

  // 5. Sandbox Lab - Widget 03: Tactile Spring Physics
  const pulseBtn = document.getElementById('btn-pulse');
  const hitsCounter = document.getElementById('hits-counter');
  let hitCount = 0;

  if (pulseBtn && hitsCounter) {
    pulseBtn.addEventListener('click', () => {
      hitCount++;
      hitsCounter.textContent = hitCount;

      pulseBtn.style.transform = 'scale(0.88)';
      setTimeout(() => {
        pulseBtn.style.transform = 'scale(1.05)';
        setTimeout(() => {
          pulseBtn.style.transform = 'scale(1)';
        }, 120);
      }, 80);
    });
  }

  // 6. Scroll-to-Top Button
  const topBtn = document.getElementById('btn-top');
  if (topBtn) {
    topBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
