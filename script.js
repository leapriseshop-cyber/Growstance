document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("site-header");
  const toggle = document.querySelector(".menu-toggle");
  const panel = document.getElementById("mobile-panel");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[ch]);

  // Scroll progress bar
  const progressEl = document.getElementById("scroll-progress");
  if (progressEl) {
    window.addEventListener("scroll", () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPct = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
      progressEl.style.width = scrollPct + "%";
    }, { passive: true });
  }

  // Header scroll
  const check = () => header?.classList.toggle("scrolled", scrollY > 32);
  check();
  addEventListener("scroll", check, { passive: true });

  // Mobile menu & Native Drawer Backdrop
  let overlayEl = document.querySelector(".menu-overlay");
  if (!overlayEl) {
    overlayEl = document.createElement("div");
    overlayEl.className = "menu-overlay";
    document.body.appendChild(overlayEl);
  }

  const close = () => {
    document.body.classList.remove("menu-open");
    panel?.classList.remove("open");
    panel?.setAttribute("aria-hidden", "true");
    toggle?.setAttribute("aria-expanded", "false");
    
    // Clear styles
    panel?.querySelectorAll("a").forEach(a => {
      a.style.transform = "";
      a.style.opacity = "";
    });
  };
  
  overlayEl.addEventListener("click", close);
  
  toggle?.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    panel?.setAttribute("aria-hidden", String(open));
    panel?.classList.toggle("open", !open);
    document.body.classList.toggle("menu-open", !open);

    if (!open) {
      // Staggered slide-up and fade-in for drawer sheet links
      const links = panel?.querySelectorAll("a");
      links?.forEach((a, i) => {
        a.style.transform = "translateY(24px)";
        a.style.opacity = "0";
        a.style.transition = "none";
        
        requestAnimationFrame(() => {
          setTimeout(() => {
            a.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease";
            a.style.transform = "translateY(0)";
            a.style.opacity = "1";
          }, 60 + i * 40);
        });
      });
    }
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const el = a.getAttribute("href")?.length > 1 ? document.querySelector(a.getAttribute("href")) : null;
      if (!el) return;
      e.preventDefault();
      close();
      scrollTo({ top: el.getBoundingClientRect().top + scrollY - 68, behavior: "smooth" });
    });
  });

  // Scroll Spy (highlight active section in desktop nav)
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".desktop-nav a[href^='#']");
  
  const scrollSpy = () => {
    let currentId = "";
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute("id");
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove("active");
      const href = link.getAttribute("href");
      if (href === `#${currentId}`) {
        link.classList.add("active");
      }
    });
  };
  window.addEventListener("scroll", scrollSpy, { passive: true });
  scrollSpy();

  // Reveal
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("active"); io.unobserve(en.target); } });
  }, { threshold: 0.08, rootMargin: "0px 0px -48px 0px" });
  document.querySelectorAll(".reveal-up").forEach(el => io.observe(el));

  // Stagger
  document.querySelectorAll("[data-stagger]").forEach(c => {
    [...c.children].forEach((ch, i) => { ch.style.transitionDelay = `${Math.min(i * 90, 540)}ms`; });
  });

  // Card hover glow & 3D Tilt effect
  document.querySelectorAll(".sys-card, .cs-card, .insight-card, .service-card").forEach(card => {
    card.style.transformStyle = "preserve-3d";
    
    card.addEventListener("mousemove", e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);

      if (!reducedMotion && !window.matchMedia("(pointer: coarse)").matches) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotX = ((y - centerY) / centerY) * -6; // max 6 degrees pitch
        const rotY = ((x - centerX) / centerX) * 6;  // max 6 degrees yaw
        
        card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-5px)`;
        card.style.transition = "transform 0.1s ease-out, border-color 0.4s, box-shadow 0.4s";
      }
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
      card.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s, box-shadow 0.4s";
    });
  });

  // Hero Graphic and Background 3D Parallax — Integrated 3D Interactive Canvas Engine
  const hero = document.querySelector(".hero");
  const heroVisual = document.querySelector(".hero-visual");
  const motionGraphic = document.getElementById("hero-3d-canvas");
  const motionWrapper = document.querySelector(".motion-graphic-wrapper");
  const heroBg = document.querySelector(".hero-bg");

  if (hero && motionGraphic) {
    const hCtx = motionGraphic.getContext("2d");
    const cx = 800;
    const cy = 450;

    // 1. Generate 48 Core Cluster Nodes using Fibonacci Sphere Distribution
    const coreNodes = [];
    const numCoreNodes = 48;
    for (let i = 0; i < numCoreNodes; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / numCoreNodes);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      coreNodes.push({
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.sin(phi) * Math.sin(theta),
        z: Math.cos(phi)
      });
    }

    // 2. Build Static Geodesic Core Mesh Connections (3 nearest neighbors per node)
    const coreLinks = [];
    for (let i = 0; i < numCoreNodes; i++) {
      const distances = [];
      for (let j = 0; j < numCoreNodes; j++) {
        if (i === j) continue;
        const dx = coreNodes[i].x - coreNodes[j].x;
        const dy = coreNodes[i].y - coreNodes[j].y;
        const dz = coreNodes[i].z - coreNodes[j].z;
        distances.push({ index: j, distSq: dx * dx + dy * dy + dz * dz });
      }
      distances.sort((a, b) => a.distSq - b.distSq);
      for (let k = 0; k < 3; k++) {
        const nIdx = distances[k].index;
        if (nIdx > i) {
          coreLinks.push([i, nIdx]);
        }
      }
    }

    // Orbit 1: Tilted Emerald Green Ring (Inner Orbit)
    const R1 = 280;
    const tiltZ1 = 0.5;
    const tiltX1 = 0.4;
    const numOrbit1 = 24;

    // Orbit 2: Tilted Purple Ring (Outer Orbit)
    const R2 = 360;
    const tiltZ2 = -0.5;
    const tiltX2 = -0.3;
    const numOrbit2 = 24;

    // Interactive mouse offsets & tracking — Neuro-UX biological feedback variables
    let rawMouseX = 0;
    let rawMouseY = 0;
    let mouseActive = false;
    let activeMotionIntensity = 1.0;
    let lastMouseX = null;
    let lastMouseY = null;

    hero.addEventListener("mousemove", (e) => {
      mouseActive = true;
      const rect = hero.getBoundingClientRect();
      rawMouseX = e.clientX - rect.left - rect.width / 2;
      rawMouseY = e.clientY - rect.top - rect.height / 2;

      // Neuropsychological responsive micro-interaction (kinetic excitation loop)
      if (lastMouseX !== null && lastMouseY !== null && !reducedMotion) {
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        const speed = Math.sqrt(dx * dx + dy * dy);
        activeMotionIntensity = Math.min(2.5, activeMotionIntensity + speed * 0.02);
      }
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      // Dual-layer parallax for background elements
      if (heroBg && !reducedMotion) {
        const bgX = (rawMouseX / (rect.width / 2)) * 1.5;
        const bgY = (rawMouseY / (rect.height / 2)) * 1.5;
        heroBg.style.transform = `translate(${bgX}%, ${bgY}%) scale(1.05)`;
      }

      // Smooth CSS spatial 3D float overlay on the parent wrapper element
      if (motionWrapper && !reducedMotion) {
        const rotateX = (rawMouseY / (rect.height / 2)) * -12;
        const rotateY = (rawMouseX / (rect.width / 2)) * 12;
        motionWrapper.style.transform = `rotateX(${8 + rotateX}deg) rotateY(${rotateY}deg)`;
      }
    });

    hero.addEventListener("mouseleave", () => {
      mouseActive = false;
      lastMouseX = null;
      lastMouseY = null;
      if (heroBg) heroBg.style.transform = `translate(0, 0) scale(1.05)`;
      if (motionWrapper) motionWrapper.style.transform = `rotateX(8deg) rotateY(0deg)`;
    });

    // 3D coordinate transformation mathematics helpers
    function rotatePoint(x, y, z, ax, ay) {
      // Rotation around X axis
      const cosX = Math.cos(ax), sinX = Math.sin(ax);
      const y1 = y * cosX - z * sinX;
      const z1 = z * cosX + y * sinX;

      // Rotation around Y axis
      const cosY = Math.cos(ay), sinY = Math.sin(ay);
      const x2 = x * cosY + z1 * sinY;
      const z2 = z1 * cosY - x * sinY;

      return { x: x2, y: y1, z: z2 };
    }

    function applyTilt(x, y, z, tZ, tX) {
      // Rotate around Z axis (Z tilt)
      const cosZ = Math.cos(tZ), sinZ = Math.sin(tZ);
      const x1 = x * cosZ - y * sinZ;
      const y1 = y * cosZ + x * sinZ;

      // Rotate around X axis (X tilt)
      const cosX = Math.cos(tX), sinX = Math.sin(tX);
      const y2 = y1 * cosX - z * sinX;
      const z2 = z * cosX + y1 * sinX;

      return { x: x1, y: y2, z: z2 };
    }

    // Rendering loops
    let time = 0;
    let viewRotX = 0;
    let viewRotY = 0;
    const baseAngleX = -0.2;
    const baseAngleY = 0;

    const renderLoop = () => {
      // Damping the activeMotionIntensity down to baseline 1.0 (biological decay)
      if (!reducedMotion) {
        activeMotionIntensity = 1.0 + (activeMotionIntensity - 1.0) * 0.95;
        time += activeMotionIntensity;
      }

      hCtx.clearRect(0, 0, 1600, 900);

      // Interpolated camera tilt drag momentum — slightly dampened (0.04) for heavy, luxury physics
      let targetTX = 0;
      let targetTY = 0;
      if (mouseActive && !reducedMotion) {
        targetTX = (rawMouseY / 450) * 0.35;
        targetTY = (rawMouseX / 800) * 0.35;
      }
      viewRotX += (targetTX - viewRotX) * 0.04;
      viewRotY += (targetTY - viewRotY) * 0.04;

      const finalAngleX = baseAngleX + viewRotX;
      const finalAngleY = baseAngleY + viewRotY + (reducedMotion ? 0 : time * 0.0035);

      const drawItems = [];
      const fov = 1000;

      // ══ 1. COMPUTE AND PROJECT CORE NODES ══
      const projectedCore = [];
      const coreSpin = reducedMotion ? 0 : time * 0.0015;
      for (let i = 0; i < numCoreNodes; i++) {
        const node = coreNodes[i];
        
        // Model Spin Transform
        const cx_m = node.x * Math.cos(coreSpin) - node.z * Math.sin(coreSpin);
        const cy_m = node.y;
        const cz_m = node.z * Math.cos(coreSpin) + node.x * Math.sin(coreSpin);

        // Geodesic breathing radius ripple
        const R_core = 145 + (reducedMotion ? 0 : 12 * Math.sin(time * 0.025 + i));

        // Camera Projection View Transform
        const rotated = rotatePoint(cx_m * R_core, cy_m * R_core, cz_m * R_core, finalAngleX, finalAngleY);
        const scale = fov / (fov + rotated.z);
        const px = cx + rotated.x * scale;
        const py = cy + rotated.y * scale;

        projectedCore.push({
          x_space: cx_m * R_core,
          y_space: cy_m * R_core,
          z_space: cz_m * R_core,
          rotated: rotated,
          px: px,
          py: py,
          scale: scale
        });

        const pulse = 0.4 + (reducedMotion ? 0.2 : 0.3 * Math.sin(time * 0.03 + i));
        drawItems.push({
          type: "node",
          z: rotated.z,
          px: px,
          py: py,
          size: (2.5 + (reducedMotion ? 0 : Math.sin(time * 0.02 + i) * 0.4)) * scale,
          color: `rgba(255, 255, 255, ${pulse})`,
          glow: true,
          glowColor: `rgba(0, 230, 167, ${pulse * 0.4})`
        });
      }

      // ══ 2. COMPUTE AND PROJECT MESH CONNECTIONS ══
      for (let i = 0; i < coreLinks.length; i++) {
        const link = coreLinks[i];
        const pA = projectedCore[link[0]];
        const pB = projectedCore[link[1]];
        const avgZ = (pA.rotated.z + pB.rotated.z) / 2;

        drawItems.push({
          type: "line",
          z: avgZ,
          px1: pA.px, py1: pA.py,
          px2: pB.px, py2: pB.py,
          color: "rgba(255, 255, 255, 0.08)",
          width: 0.5
        });
      }

      // ══ 3. COMPUTE ORBIT 1 PATH TRACK SEGMENTS & NODE SATELLITES (Emerald Green) ══
      const trackDivs = 64;
      for (let k = 0; k < trackDivs; k++) {
        const t1 = (k / trackDivs) * Math.PI * 2;
        const t2 = ((k + 1) / trackDivs) * Math.PI * 2;

        const sA = applyTilt(R1 * Math.cos(t1), 0, R1 * Math.sin(t1), tiltZ1, tiltX1);
        const sB = applyTilt(R1 * Math.cos(t2), 0, R1 * Math.sin(t2), tiltZ1, tiltX1);

        const rA = rotatePoint(sA.x, sA.y, sA.z, finalAngleX, finalAngleY);
        const rB = rotatePoint(sB.x, sB.y, sB.z, finalAngleX, finalAngleY);

        const scA = fov / (fov + rA.z);
        const scB = fov / (fov + rB.z);

        drawItems.push({
          type: "line",
          z: (rA.z + rB.z) / 2,
          px1: cx + rA.x * scA,
          py1: cy + rA.y * scA,
          px2: cx + rB.x * scB,
          py2: cy + rB.y * scB,
          color: "rgba(0, 230, 167, 0.08)",
          width: 0.8
        });
      }

      // Orbit 1 Satellites
      const projectedOrbit1 = [];
      for (let i = 0; i < numOrbit1; i++) {
        const theta = (i / numOrbit1) * Math.PI * 2 + (reducedMotion ? 0 : time * 0.005);
        const spacePt = applyTilt(R1 * Math.cos(theta), 0, R1 * Math.sin(theta), tiltZ1, tiltX1);
        const rotated = rotatePoint(spacePt.x, spacePt.y, spacePt.z, finalAngleX, finalAngleY);
        const scale = fov / (fov + rotated.z);
        const px = cx + rotated.x * scale;
        const py = cy + rotated.y * scale;

        projectedOrbit1.push({
          spacePt: spacePt,
          rotated: rotated,
          px: px,
          py: py,
          scale: scale
        });

        drawItems.push({
          type: "node",
          z: rotated.z,
          px: px,
          py: py,
          size: 3.2 * scale,
          color: "rgba(0, 230, 167, 0.95)",
          glow: true,
          glowColor: "rgba(0, 230, 167, 0.55)"
        });
      }

      // ══ 4. COMPUTE ORBIT 2 PATH TRACK SEGMENTS & NODE SATELLITES (Purple) ══
      for (let k = 0; k < trackDivs; k++) {
        const t1 = (k / trackDivs) * Math.PI * 2;
        const t2 = ((k + 1) / trackDivs) * Math.PI * 2;

        const sA = applyTilt(R2 * Math.cos(t1), 0, R2 * Math.sin(t1), tiltZ2, tiltX2);
        const sB = applyTilt(R2 * Math.cos(t2), 0, R2 * Math.sin(t2), tiltZ2, tiltX2);

        const rA = rotatePoint(sA.x, sA.y, sA.z, finalAngleX, finalAngleY);
        const rB = rotatePoint(sB.x, sB.y, sB.z, finalAngleX, finalAngleY);

        const scA = fov / (fov + rA.z);
        const scB = fov / (fov + rB.z);

        drawItems.push({
          type: "line",
          z: (rA.z + rB.z) / 2,
          px1: cx + rA.x * scA,
          py1: cy + rA.y * scA,
          px2: cx + rB.x * scB,
          py2: cy + rB.y * scB,
          color: "rgba(139, 113, 255, 0.06)",
          width: 0.8
        });
      }

      // Orbit 2 Satellites
      const projectedOrbit2 = [];
      for (let i = 0; i < numOrbit2; i++) {
        const theta = (i / numOrbit2) * Math.PI * 2 - (reducedMotion ? 0 : time * 0.0035);
        const spacePt = applyTilt(R2 * Math.cos(theta), 0, R2 * Math.sin(theta), tiltZ2, tiltX2);
        const rotated = rotatePoint(spacePt.x, spacePt.y, spacePt.z, finalAngleX, finalAngleY);
        const scale = fov / (fov + rotated.z);
        const px = cx + rotated.x * scale;
        const py = cy + rotated.y * scale;

        projectedOrbit2.push({
          spacePt: spacePt,
          rotated: rotated,
          px: px,
          py: py,
          scale: scale
        });

        drawItems.push({
          type: "node",
          z: rotated.z,
          px: px,
          py: py,
          size: 3.2 * scale,
          color: "rgba(139, 113, 255, 0.95)",
          glow: true,
          glowColor: "rgba(139, 113, 255, 0.55)"
        });
      }

      // ══ 5. COMPUTE DYNAMIC LASER CONVERGENCE CONNECTIONS ══
      const projectTransmissions = (satelliteList, isPurple) => {
        for (let i = 0; i < satelliteList.length; i++) {
          const sat = satelliteList[i];
          let closestIdx = -1;
          let minDistSq = Infinity;
          for (let j = 0; j < numCoreNodes; j++) {
            const core = projectedCore[j];
            const dx = sat.spacePt.x - core.x_space;
            const dy = sat.spacePt.y - core.y_space;
            const dz = sat.spacePt.z - core.z_space;
            const dSq = dx * dx + dy * dy + dz * dz;
            if (dSq < minDistSq) {
              minDistSq = dSq;
              closestIdx = j;
            }
          }

          if (closestIdx !== -1) {
            const dist = Math.sqrt(minDistSq);
            if (dist < 180) {
              const core = projectedCore[closestIdx];
              const alpha = (1 - dist / 180) * 0.24;
              drawItems.push({
                type: "line",
                z: (sat.rotated.z + core.rotated.z) / 2,
                px1: sat.px, py1: sat.py,
                px2: core.px, py2: core.py,
                color: isPurple ? `rgba(139, 113, 255, ${alpha})` : `rgba(0, 230, 167, ${alpha})`,
                width: 0.8
              });
            }
          }
        }
      };

      projectTransmissions(projectedOrbit1, false);
      projectTransmissions(projectedOrbit2, true);

      // ══ 6. DEPTH SORT PIPELINE (farthest elements drawn first) ══
      drawItems.sort((a, b) => b.z - a.z);

      // ══ 7. VECTOR RENDER STEP ══
      for (let i = 0; i < drawItems.length; i++) {
        const item = drawItems[i];
        if (item.type === "line") {
          hCtx.beginPath();
          hCtx.moveTo(item.px1, item.py1);
          hCtx.lineTo(item.px2, item.py2);
          hCtx.strokeStyle = item.color;
          hCtx.lineWidth = item.width;
          hCtx.stroke();
        } else if (item.type === "node") {
          if (item.glow) {
            hCtx.beginPath();
            hCtx.arc(item.px, item.py, item.size * 3.5, 0, Math.PI * 2);
            hCtx.fillStyle = item.glowColor;
            hCtx.fill();
          }
          hCtx.beginPath();
          hCtx.arc(item.px, item.py, item.size, 0, Math.PI * 2);
          hCtx.fillStyle = item.color;
          hCtx.fill();
        }
      }

      if (!reducedMotion) {
        requestAnimationFrame(renderLoop);
      }
    };

    renderLoop();
  }

  // ══ GLOBAL MOTION GRAPHIC (COMBINED ORGANIC FLOW-FIELD & CONSTELLATION NETWORK) ══
  const canvas = document.getElementById("global-canvas");
  if (canvas && !reducedMotion) {
    const ctx = canvas.getContext("2d");
    let w, h;
    const particles = []; // Fluid flow-field sparks
    const stars = [];     // Drifting bokeh stars
    const trail = [];     // Mouse trail sparks
    
    const isHospitality = document.body.classList.contains("hospitality-page") || 
                          window.location.pathname.includes("hospitality-growth") || 
                          window.location.pathname.includes("hospitality");

    const initCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
      
      // 1. Populate Fluid Flow-Field Sparks
      particles.length = 0;
      const numParticles = w < 768 ? 40 : 120;
      for (let i = 0; i < numParticles; i++) {
        let colorStr = "";
        if (isHospitality) {
          const rand = Math.random();
          if (rand < 0.4) colorStr = "197, 168, 128"; // Champagne Gold (#c5a880)
          else if (rand < 0.7) colorStr = "155, 130, 95"; // Darker Bronze
          else colorStr = "225, 205, 175"; // Muted Light Gold
        } else {
          colorStr = Math.random() > 0.55 ? "0, 230, 167" : "139, 113, 255";
        }
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 1.5 + 0.6,
          alpha: Math.random() * 0.35 + 0.15,
          color: colorStr,
          history: [],
          speedFactor: Math.random() * 0.4 + 0.8
        });
      }

      // 2. Populate Drifting Bokeh Stars
      stars.length = 0;
      const numStars = w < 768 ? 55 : 160;
      for (let i = 0; i < numStars; i++) {
        let colorStr = "";
        if (isHospitality) {
          const rand = Math.random();
          if (rand < 0.4) colorStr = "197, 168, 128";
          else if (rand < 0.7) colorStr = "155, 130, 95";
          else colorStr = "225, 205, 175";
        } else {
          colorStr = Math.random() > 0.6 ? "139, 113, 255" : "0, 230, 167";
        }
        // Constant slow-drifting motion graphics speed (increased from 0.12)
        const vx = (Math.random() - 0.5) * 0.38;
        const vy = (Math.random() - 0.5) * 0.38;
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: vx,
          vy: vy,
          ox: vx,
          oy: vy,
          size: Math.random() * 2.2 + 0.4,
          alpha: Math.random() * 0.35 + 0.05,
          color: colorStr,
          pulseSpeed: 0.003 + Math.random() * 0.007,
          pulsePhase: Math.random() * Math.PI * 2
        });
      }
    };

    window.addEventListener("resize", initCanvas);
    initCanvas();

    let mouseX = w / 2;
    let mouseY = h / 2;
    let targetX = w / 2;
    let targetY = h / 2;
    let scrollYOffset = window.scrollY;
    let targetScrollY = window.scrollY;
    let pointerActive = false;

    window.addEventListener("mousemove", (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      pointerActive = true;
      
      // Spawn trail particles organically on pointer moves
      if (Math.random() > 0.55) {
        let trailColor = isHospitality ? "197, 168, 128" : (Math.random() > 0.5 ? "0, 230, 167" : "139, 113, 255");
        trail.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          size: Math.random() * 3.0 + 1.2,
          alpha: 0.65,
          color: trailColor
        });
      }
    }, { passive: true });

    window.addEventListener("touchmove", (e) => {
      if (e.touches && e.touches[0]) {
        targetX = e.touches[0].clientX;
        targetY = e.touches[0].clientY;
        pointerActive = true;
        
        if (Math.random() > 0.55) {
          let trailColor = isHospitality ? "197, 168, 128" : (Math.random() > 0.5 ? "0, 230, 167" : "139, 113, 255");
          trail.push({
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            size: Math.random() * 3.0 + 1.2,
            alpha: 0.65,
            color: trailColor
          });
        }
      }
    }, { passive: true });

    window.addEventListener("scroll", () => {
      targetScrollY = window.scrollY;
    }, { passive: true });

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;
      scrollYOffset += (targetScrollY - scrollYOffset) * 0.08;

      const time = Date.now() * 0.0006;

      // ═══ 1. RENDER INTERACTIVE COORDINATE TRIANGULATION GRID ═══
      const gridSpacing = 120;
      const gridCols = Math.ceil(w / gridSpacing);
      const gridRows = Math.ceil(h / gridSpacing);
      ctx.font = "7px monospace";

      for (let c = 0; c <= gridCols; c++) {
        const gx = c * gridSpacing;
        for (let r = 0; r <= gridRows; r++) {
          const gy = (((r * gridSpacing - scrollYOffset * 0.25) % h) + h) % h;
          const gdx = mouseX - gx;
          const gdy = mouseY - gy;
          const gdist = Math.sqrt(gdx * gdx + gdy * gdy);
          
          if (gdist < 220) {
            const proximity = 1 - (gdist / 220);
            const crossAlpha = proximity * 0.16 + 0.01;
            ctx.strokeStyle = isHospitality ? `rgba(197, 168, 128, ${crossAlpha})` : `rgba(0, 230, 167, ${crossAlpha})`;
            ctx.lineWidth = 0.5;
            
            ctx.beginPath();
            ctx.moveTo(gx - 3, gy);
            ctx.lineTo(gx + 3, gy);
            ctx.moveTo(gx, gy - 3);
            ctx.lineTo(gx, gy + 3);
            ctx.stroke();
            
            if (gdist < 130) {
              const textAlpha = (1 - (gdist / 130)) * 0.22;
              ctx.fillStyle = isHospitality ? `rgba(197, 168, 128, ${textAlpha})` : `rgba(139, 113, 255, ${textAlpha})`;
              const docY = Math.round(gy + scrollYOffset);
              ctx.fillText(`[${Math.round(gx)},${docY}]`, gx + 6, gy + 3);
              
              if (gdist < 80) {
                ctx.beginPath();
                ctx.moveTo(mouseX, mouseY);
                ctx.lineTo(gx, gy);
                ctx.strokeStyle = isHospitality ? `rgba(197, 168, 128, ${(1 - gdist / 80) * 0.12})` : `rgba(13, 204, 147, ${(1 - gdist / 80) * 0.12})`;
                ctx.lineWidth = 0.4;
                ctx.stroke();
              }
            }
          } else {
            ctx.strokeStyle = `rgba(255, 255, 255, 0.008)`;
            ctx.lineWidth = 0.3;
            ctx.beginPath();
            ctx.moveTo(gx - 2, gy);
            ctx.lineTo(gx + 2, gy);
            ctx.moveTo(gx, gy - 2);
            ctx.lineTo(gx, gy + 2);
            ctx.stroke();
          }
        }
      }

      // ═══ 2. FUTURISTIC FLUID HUD MOUSE RINGS ═══
      if (pointerActive) {
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 8, 0, Math.PI * 2);
        ctx.strokeStyle = isHospitality ? `rgba(197, 168, 128, 0.15)` : `rgba(0, 230, 167, 0.15)`;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 15 + Math.sin(Date.now() * 0.003) * 3, 0, Math.PI * 2);
        ctx.strokeStyle = isHospitality ? `rgba(197, 168, 128, 0.08)` : `rgba(139, 113, 255, 0.08)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // ═══ 3. DRIFTING BOKEH STARS (With Cursor Repulsion) ═══
      const cx = w / 2;
      const cy = h / 2;
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Elastic Repulsion from mouse
        if (pointerActive) {
          const pdx = star.x - mouseX;
          const pdy = star.y - mouseY;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
          if (pdist < 120) {
            const force = (120 - pdist) / 120;
            const pushX = (pdx / pdist) * force * 0.8 * (star.size / 1.5);
            const pushY = (pdy / pdist) * force * 0.8 * (star.size / 1.5);
            star.vx += pushX * 0.08;
            star.vy += pushY * 0.08;
          }
        }

        // Gentle organic background flow-field force applied to the star's drift
        const starAngle = (Math.sin(star.x * 0.0025 + time * 0.12) + Math.cos(star.y * 0.0025 - time * 0.12)) * Math.PI;
        const driftForceX = Math.cos(starAngle) * 0.12;
        const driftForceY = Math.sin(starAngle) * 0.12;

        // Dampen velocity back to base drift plus organic flow force
        star.vx = star.vx * 0.94 + (star.ox + driftForceX) * 0.06;
        star.vy = star.vy * 0.94 + (star.oy + driftForceY) * 0.06;

        // Move
        star.x += star.vx;
        star.y += star.vy;

        // Wrap around borders
        if (star.x < 0) star.x = w;
        if (star.x > w) star.x = 0;
        if (star.y < 0) star.y = h;
        if (star.y > h) star.y = 0;

        // Sizing parallax and offsets
        const starDx = (mouseX - cx) * 0.012 * (star.size / 2);
        const starDy = (mouseY - cy) * 0.012 * (star.size / 2);
        const starScrollParallax = -scrollYOffset * 0.12 * (star.size / 2);

        const drawX = star.x + starDx;
        const drawY = (((star.y + starDy + starScrollParallax) % h) + h) % h;

        // Sizing & pulse
        star.pulsePhase += star.pulseSpeed;
        const starAlpha = star.alpha + Math.sin(star.pulsePhase) * 0.06;
        const drawAlpha = Math.max(0.02, Math.min(starAlpha, 0.65));

        // Draw star head
        ctx.beginPath();
        ctx.arc(drawX, drawY, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${star.color}, ${drawAlpha})`;
        ctx.fill();

        // Extra shiny core for bigger ones
        if (star.size > 1.8 && i % 4 === 0) {
          ctx.beginPath();
          ctx.arc(drawX, drawY, star.size * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${drawAlpha * 1.5})`;
          ctx.fill();
        }

        // Draw elegant constellation lines to nearby stars
        for (let j = i + 1; j < stars.length; j++) {
          const star2 = stars[j];
          
          // Calculate draw coordinates for star2
          const star2Dx = (mouseX - cx) * 0.012 * (star2.size / 2);
          const star2Dy = (mouseY - cy) * 0.012 * (star2.size / 2);
          const star2ScrollParallax = -scrollYOffset * 0.12 * (star2.size / 2);
          
          const drawX2 = star2.x + star2Dx;
          const drawY2 = (((star2.y + star2Dy + star2ScrollParallax) % h) + h) % h;
          
          const sdx = drawX - drawX2;
          const sdy = drawY - drawY2;
          
          // Fast bounding box check to optimize performance
          const maxDist = 95;
          if (Math.abs(sdx) < maxDist && Math.abs(sdy) < maxDist) {
            const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
            if (sdist < maxDist) {
              const proximity = 1 - (sdist / maxDist);
              const star2PulsePhase = star2.pulsePhase + star2.pulseSpeed;
              const star2Alpha = star2.alpha + Math.sin(star2PulsePhase) * 0.06;
              const lineAlpha = proximity * 0.13 * Math.min(drawAlpha, star2Alpha);
              
              ctx.strokeStyle = isHospitality ? `rgba(197, 168, 128, ${lineAlpha})` : `rgba(${star.color}, ${lineAlpha})`;
              ctx.lineWidth = 0.45;
              ctx.beginPath();
              ctx.moveTo(drawX, drawY);
              ctx.lineTo(drawX2, drawY2);
              ctx.stroke();
            }
          }
        }
      }

      // ═══ 4. ORGANIC FLUID FLOW-FIELD PARTICLES ═══
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Organic Vector Flow Field
        const angle = (Math.sin(p.x * 0.0035 + time * 0.15) + Math.cos(p.y * 0.0035 - time * 0.15)) * Math.PI;
        const flowX = Math.cos(angle) * 0.18 * p.speedFactor;
        const flowY = Math.sin(angle) * 0.18 * p.speedFactor;

        p.vx += flowX;
        p.vy += flowY;

        // 2. Cursor Swirl Turbulence Vortex
        if (pointerActive) {
          const pdx = p.x - mouseX;
          const pdy = p.y - mouseY;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
          if (pdist < 220) {
            const proximity = (220 - pdist) / 220; // 0 to 1
            const angleToMouse = Math.atan2(pdy, pdx);
            const swirlAngle = angleToMouse + Math.PI / 2;
            const swirlForce = proximity * 0.38 * p.speedFactor;
            const pullForce = -proximity * 0.12;

            p.vx += Math.cos(swirlAngle) * swirlForce + Math.cos(angleToMouse) * pullForce;
            p.vy += Math.sin(swirlAngle) * swirlForce + Math.sin(angleToMouse) * pullForce;
          }
        }

        // Apply drag and fluid dynamics
        p.vx *= 0.94;
        p.vy *= 0.94;

        // Save history before moving
        p.history.push({ x: p.x, y: p.y });
        if (p.history.length > 5) {
          p.history.shift();
        }

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Boundary wrap & history purge
        if (p.x < -10) { p.x = w + 10; p.history.length = 0; }
        else if (p.x > w + 10) { p.x = -10; p.history.length = 0; }
        if (p.y < -10) { p.y = h + 10; p.history.length = 0; }
        else if (p.y > h + 10) { p.y = -10; p.history.length = 0; }

        // Render offsets for deep parallax
        const dx = (mouseX - w / 2) * 0.008 * (p.size / 2);
        const dy = (mouseY - h / 2) * 0.008 * (p.size / 2);
        const scrollParallax = -scrollYOffset * 0.12 * (p.size / 2);

        // Draw smooth ribbon history trails
        if (p.history.length > 1) {
          ctx.beginPath();
          for (let j = 0; j < p.history.length; j++) {
            const pt = p.history[j];
            const drawX = pt.x + dx;
            const drawY = (((pt.y + dy + scrollParallax) % h) + h) % h;
            
            if (j === 0) {
              ctx.moveTo(drawX, drawY);
            } else {
              const prevPt = p.history[j - 1];
              const prevDrawY = (((prevPt.y + dy + scrollParallax) % h) + h) % h;
              if (Math.abs(drawY - prevDrawY) < h * 0.5 && Math.abs(drawX - (prevPt.x + dx)) < w * 0.5) {
                ctx.lineTo(drawX, drawY);
              } else {
                ctx.moveTo(drawX, drawY);
              }
            }
          }
          ctx.strokeStyle = `rgba(${p.color}, ${p.alpha * 0.28})`;
          ctx.lineWidth = p.size * 0.65;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.stroke();
        }

        // Draw lead spark particle head
        const headX = p.x + dx;
        const headY = (((p.y + dy + scrollParallax) % h) + h) % h;
        ctx.beginPath();
        ctx.arc(headX, headY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.fill();

        // Add pure white core spark
        if (p.size > 1.8 && i % 6 === 0) {
          ctx.beginPath();
          ctx.arc(headX, headY, p.size * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 1.5})`;
          ctx.fill();
        }
      }

      // ═══ 5. INTERACTIVE POINTER TRAIL CONSTELLATION NETWORK ═══
      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.022;
        p.size *= 0.96;
        
        if (p.alpha <= 0 || p.size < 0.4) {
          trail.splice(i, 1);
          continue;
        }
        
        // Draw trail dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.fill();
        
        // Connective network vector line to mouse cursor
        const tdx = mouseX - p.x;
        const tdy = mouseY - p.y;
        const tdist = Math.sqrt(tdx * tdx + tdy * tdy);
        if (tdist < 90) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.strokeStyle = isHospitality ? `rgba(197, 168, 128, ${p.alpha * (1 - tdist / 90) * 0.22})` : `rgba(${p.color}, ${p.alpha * (1 - tdist / 90) * 0.22})`;
          ctx.lineWidth = 0.55;
          ctx.stroke();
        }
      }

      requestAnimationFrame(animate);
    };
    animate();
  }

  // Active nav
  const secs = [...document.querySelectorAll("main section[id]")];
  const links = [...document.querySelectorAll(".desktop-nav a")];
  const ao = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === `#${en.target.id}`));
    });
  }, { rootMargin: "-30% 0px -60% 0px" });
  secs.forEach(s => ao.observe(s));

  // ══ CONTACT FORM — sends email via server ══
  const form = document.getElementById("contact-form");
  form?.addEventListener("submit", async e => {
    e.preventDefault();
    const btn = form.querySelector(".form-btn");
    const txt = btn.textContent;
    const data = Object.fromEntries(new FormData(form).entries());
    btn.textContent = "Sending…"; btn.disabled = true;
    
    // Prepare dynamic fallback mailto params
    const emailTo = "growstancedigital@gmail.com";
    const subject = encodeURIComponent(`Inquiry from ${data.name} — Growstance`);
    const mailtoBody = encodeURIComponent(
      `Name: ${data.name}\n` +
      `Email: ${data.email}\n` +
      `Phone: ${data.phone || "Not provided"}\n` +
      `Growth Need: ${data.service || "Not selected"}\n\n` +
      `Message:\n${data.message}`
    );
    const fallbackMailto = () => {
      window.location.href = `mailto:${emailTo}?subject=${subject}&body=${mailtoBody}`;
      btn.textContent = "Mail Client Opened";
      form.reset();
      setTimeout(() => { btn.textContent = txt; btn.disabled = false; }, 4000);
    };

    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      if (r.status === 404) {
        // Safe fallback for static hostings (like GitHub Pages)
        fallbackMailto();
        return;
      }
      
      if (!r.ok) throw new Error();
      btn.textContent = "Message Sent ✓";
      form.reset();
      setTimeout(() => { btn.textContent = txt; btn.disabled = false; }, 3000);
    } catch {
      // Fallback for general offline or network connectivity blocks
      fallbackMailto();
    }
  });

  // ══ WHATSAPP CHATBOT WIDGET ══
  const waWidget = document.getElementById("wa-widget");
  const waFab = document.getElementById("wa-fab");
  const waClose = document.getElementById("wa-close");
  const waForm = document.getElementById("wa-form");
  const waMsg = document.getElementById("wa-msg");
  const PHONE = "919350790702";

  waFab?.addEventListener("click", () => {
    waWidget.classList.toggle("open");
  });

  waClose?.addEventListener("click", () => {
    waWidget.classList.remove("open");
  });

  waForm?.addEventListener("submit", e => {
    e.preventDefault();
    const msg = waMsg.value.trim();
    if (!msg) return;
    const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    waMsg.value = "";
    waWidget.classList.remove("open");
  });

  // ══ DYNAMIC BLOG/INSIGHTS LOADER ══
  const blogGrid = document.getElementById("blog-grid");
  if (blogGrid) {
    const loadBlogs = async () => {
      try {
        const res = await fetch('posts.json');
        if (!res.ok) throw new Error("Could not load posts");
        const posts = await res.json();
        
        let html = '';
        posts.slice(0, 3).forEach(post => {
          html += `
            <article class="insight-card reveal-up active" style="transition-delay: 0.1s; opacity: 1; transform: none;">
              <div class="insight-meta">
                <span style="color: var(--accent); font-weight: 700;">${escapeHTML(post.category)}</span>
                <span style="margin: 0 8px; opacity: 0.5;">•</span>
                <span style="opacity: 0.7;">${escapeHTML(post.date)}</span>
              </div>
              <h3 style="margin-top: 12px; font-size: 1.4rem;">${escapeHTML(post.title)}</h3>
              <a href="${escapeHTML(post.link)}" class="insight-link">Read insight →</a>
            </article>
          `;
        });
        blogGrid.innerHTML = html;
      } catch(e) {
        console.error("Blog load error:", e);
        blogGrid.innerHTML = `<p style="color:var(--text-muted);">Insights are currently being updated.</p>`;
      }
    };
    loadBlogs();
  }

  // ══ PROBLEM SECTION MOTION GRAPHIC ══
  const probCanvas = document.getElementById("problem-canvas");
  if (probCanvas && !reducedMotion) {
    const ctx = probCanvas.getContext("2d");
    let w, h, time = 0;
    
    const initProb = () => {
      const dpr = window.devicePixelRatio || 1;
      w = probCanvas.offsetWidth || 300;
      h = probCanvas.offsetHeight || 300;
      probCanvas.width = w * dpr;
      probCanvas.height = h * dpr;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    };
    window.addEventListener("resize", initProb);
    initProb();

    const drawProb = () => {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      
      // Draw slowly rotating abstract data rings
      time += 0.002;
      ctx.lineWidth = 1;
      
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const radius = h * 0.35 + (i * 30);
        for (let a = 0; a < Math.PI * 2; a += 0.1) {
          const noise = Math.sin(a * 5 + time * (i+1)) * 12;
          const x = cx + Math.cos(a + time * (i % 2 === 0 ? 1 : -1)) * (radius + noise);
          const y = cy + Math.sin(a + time * (i % 2 === 0 ? 1 : -1)) * (radius + noise) * 0.35;
          
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.stroke();
      }

      // Draw subtle connecting nodes
      for (let i = 0; i < 20; i++) {
        const a = (i / 20) * Math.PI * 2 + time * 2;
        const r = h * 0.35 + Math.sin(time * 3 + i) * 15;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r * 0.35;
        
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 230, 167, 0.2)'; // Soft brand glow
        ctx.fill();
      }
      
      requestAnimationFrame(drawProb);
    };
    drawProb();
  }

  // ══ ENHANCEMENT #2: SYSTEMS WIREFRAME SPHERE ══
  const sysCanvas = document.getElementById("systems-canvas");
  if (sysCanvas && !reducedMotion) {
    const sCtx = sysCanvas.getContext("2d");
    let sW, sH, sTime = 0;
    const sNodes = [];
    const sNumNodes = 60;

    const initSys = () => {
      const dpr = window.devicePixelRatio || 1;
      sW = sysCanvas.offsetWidth || 300;
      sH = sysCanvas.offsetHeight || 300;
      sysCanvas.width = sW * dpr;
      sysCanvas.height = sH * dpr;
      sCtx.resetTransform();
      sCtx.scale(dpr, dpr);
      
      sNodes.length = 0;
      for (let i = 0; i < sNumNodes; i++) {
        const phi = Math.acos(1 - 2 * (i + 0.5) / sNumNodes);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const r = Math.min(sW, sH) * 0.3;
        sNodes.push({
          x: r * Math.sin(phi) * Math.cos(theta),
          y: r * Math.sin(phi) * Math.sin(theta),
          z: r * Math.cos(phi)
        });
      }
    };
    window.addEventListener("resize", initSys);
    initSys();

    const drawSys = () => {
      sCtx.clearRect(0, 0, sW, sH);
      sTime += 0.003;
      const cx = sW / 2;
      const cy = sH / 2;
      const cosT = Math.cos(sTime);
      const sinT = Math.sin(sTime);

      const proj = [];
      for (let i = 0; i < sNumNodes; i++) {
        const n = sNodes[i];
        const x1 = n.x * cosT - n.z * sinT;
        const z1 = n.z * cosT + n.x * sinT;
        const fov = 600;
        const scale = fov / (fov + z1);
        proj.push({ x: cx + x1 * scale, y: cy + n.y * scale, z: z1, s: scale });
      }

      // Draw wireframe connections
      sCtx.lineWidth = 0.5;
      for (let i = 0; i < proj.length; i++) {
        for (let j = i + 1; j < proj.length; j++) {
          const dx = proj[i].x - proj[j].x;
          const dy = proj[i].y - proj[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            sCtx.beginPath();
            sCtx.moveTo(proj[i].x, proj[i].y);
            sCtx.lineTo(proj[j].x, proj[j].y);
            const o = (1 - dist / 80) * 0.4;
            sCtx.strokeStyle = `rgba(0, 230, 167, ${o * 0.4})`; // soft green line glow
            sCtx.stroke();
          }
        }
      }

      // Draw nodes
      for (const p of proj) {
        sCtx.beginPath();
        sCtx.arc(p.x, p.y, Math.max(1, 1.5 * p.s), 0, Math.PI * 2);
        sCtx.fillStyle = `rgba(255, 255, 255, ${p.z > 0 ? 0.35 : 0.15})`;
        sCtx.fill();
        
        // Add subtle accent to front-facing nodes
        if (p.z < 0 && p.s > 1.0) {
          sCtx.beginPath();
          sCtx.arc(p.x, p.y, 0.6 * p.s, 0, Math.PI * 2);
          sCtx.fillStyle = 'rgba(0, 230, 167, 0.8)';
          sCtx.fill();
        }
      }

      requestAnimationFrame(drawSys);
    };
    drawSys();
  }

  // ══ ENHANCEMENT #3: SCROLL-ACTIVATED PROCESS TIMELINE ══
  const processTimeline = document.querySelector(".process-timeline");
  if (processTimeline) {
    const steps = processTimeline.querySelectorAll(".proc-step");
    const processObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Calculate how far the section is scrolled
          const rect = processTimeline.getBoundingClientRect();
          const viewH = window.innerHeight;
          const progress = Math.min(1, Math.max(0, 1 - (rect.top / viewH)));
          processTimeline.style.setProperty("--progress", `${progress * 100}%`);

          // Activate steps based on scroll progress
          steps.forEach((step, i) => {
            const stepThreshold = (i + 1) / steps.length;
            if (progress >= stepThreshold * 0.5) {
              step.classList.add("step-active");
            }
          });
        }
      });
    }, { threshold: Array.from({ length: 20 }, (_, i) => i / 20) });

    processObserver.observe(processTimeline);

    // Update on scroll for smooth progress
    window.addEventListener("scroll", () => {
      const rect = processTimeline.getBoundingClientRect();
      const viewH = window.innerHeight;
      if (rect.top < viewH && rect.bottom > 0) {
        const progress = Math.min(1, Math.max(0, 1 - (rect.top / viewH)));
        processTimeline.style.setProperty("--progress", `${progress * 100}%`);
        steps.forEach((step, i) => {
          const stepThreshold = (i + 0.5) / steps.length;
          step.classList.toggle("step-active", progress >= stepThreshold * 0.6);
        });
      }
    }, { passive: true });
  }

  // ══ ENHANCEMENT #4: FOUNDER ORBITING PARTICLE RINGS ══
  const founderCanvas = document.getElementById("founder-canvas");
  if (founderCanvas && !reducedMotion) {
    const fCtx = founderCanvas.getContext("2d");
    let fW, fH, fTime = 0;

    const initFounder = () => {
      const dpr = window.devicePixelRatio || 1;
      fW = founderCanvas.offsetWidth || 300;
      fH = founderCanvas.offsetHeight || 300;
      founderCanvas.width = fW * dpr;
      founderCanvas.height = fH * dpr;
      fCtx.resetTransform();
      fCtx.scale(dpr, dpr);
    };
    window.addEventListener("resize", initFounder);
    initFounder();

    const drawFounder = () => {
      fCtx.clearRect(0, 0, fW, fH);
      fTime += 0.006;
      // In mobile, center the rings; in desktop, position center on left
      const cx = window.innerWidth <= 1024 ? fW / 2 : fW * 0.25;
      const cy = fH / 2;

      // Draw 3 concentric orbit rings with particles
      const rings = [
        { r: 120, count: 12, speed: 0.8, color: '0, 230, 167' }, // Accent green
        { r: 180, count: 18, speed: -0.5, color: '255, 255, 255' }, // White
        { r: 240, count: 24, speed: 0.3, color: '139, 113, 255' } // Accent purple
      ];

      for (const ring of rings) {
        // Draw the ring path (faint)
        fCtx.beginPath();
        fCtx.ellipse(cx, cy, ring.r, ring.r * 0.32, 0, 0, Math.PI * 2);
        fCtx.strokeStyle = `rgba(${ring.color}, 0.04)`;
        fCtx.lineWidth = 0.5;
        fCtx.stroke();

        // Draw orbiting particles
        for (let i = 0; i < ring.count; i++) {
          const angle = (i / ring.count) * Math.PI * 2 + fTime * ring.speed;
          const px = cx + Math.cos(angle) * ring.r;
          const py = cy + Math.sin(angle) * ring.r * 0.32;
          const depth = Math.sin(angle);
          const size = 1.2 + depth * 0.6;
          const alpha = 0.18 + depth * 0.12;

          fCtx.beginPath();
          fCtx.arc(px, py, Math.max(0.6, size), 0, Math.PI * 2);
          fCtx.fillStyle = `rgba(${ring.color}, ${Math.max(0.05, alpha)})`;
          fCtx.fill();
        }
      }

      requestAnimationFrame(drawFounder);
    };
    drawFounder();
  }

  // ══ ENHANCEMENT #5: PHILOSOPHY NEURAL NETWORK ══
  const philCanvas = document.getElementById("philosophy-canvas");
  if (philCanvas && !reducedMotion) {
    const pCtx = philCanvas.getContext("2d");
    let pW, pH;
    const pNodes = [];
    const pNumNodes = 40;

    const initPhil = () => {
      const dpr = window.devicePixelRatio || 1;
      pW = philCanvas.offsetWidth || 300;
      pH = philCanvas.offsetHeight || 300;
      philCanvas.width = pW * dpr;
      philCanvas.height = pH * dpr;
      pCtx.resetTransform();
      pCtx.scale(dpr, dpr);
      
      pNodes.length = 0;
      for (let i = 0; i < pNumNodes; i++) {
        const isAccent = Math.random() > 0.7;
        pNodes.push({
          x: Math.random() * pW,
          y: Math.random() * pH,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 2 + 1,
          color: isAccent ? "0, 230, 167" : "255, 255, 255"
        });
      }
    };
    window.addEventListener("resize", initPhil);
    initPhil();

    const drawPhil = () => {
      pCtx.clearRect(0, 0, pW, pH);

      // Update positions
      for (const n of pNodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > pW) n.vx *= -1;
        if (n.y < 0 || n.y > pH) n.vy *= -1;
      }

      // Draw connections
      pCtx.lineWidth = 0.5;
      for (let i = 0; i < pNodes.length; i++) {
        for (let j = i + 1; j < pNodes.length; j++) {
          const dx = pNodes[i].x - pNodes[j].x;
          const dy = pNodes[i].y - pNodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            pCtx.beginPath();
            pCtx.moveTo(pNodes[i].x, pNodes[i].y);
            pCtx.lineTo(pNodes[j].x, pNodes[j].y);
            const o = (1 - dist / 150) * 0.12;
            // Draw connection lines colored by node connection
            const grad = pCtx.createLinearGradient(pNodes[i].x, pNodes[i].y, pNodes[j].x, pNodes[j].y);
            grad.addColorStop(0, `rgba(${pNodes[i].color}, ${o})`);
            grad.addColorStop(1, `rgba(${pNodes[j].color}, ${o})`);
            pCtx.strokeStyle = grad;
            pCtx.stroke();
          }
        }
      }

      // Draw nodes
      for (const n of pNodes) {
        pCtx.beginPath();
        pCtx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        pCtx.fillStyle = `rgba(${n.color}, 0.25)`;
        pCtx.fill();
        
        if (n.color === "0, 230, 167") {
          pCtx.beginPath();
          pCtx.arc(n.x, n.y, n.r * 0.5, 0, Math.PI * 2);
          pCtx.fillStyle = "rgba(0, 230, 167, 0.8)";
          pCtx.fill();
        }
      }

      requestAnimationFrame(drawPhil);
    };
    drawPhil();
  }

  // ══ ENHANCEMENT #6: CTA AURORA PULSE ══
  const ctaCanvas = document.getElementById("cta-canvas");
  if (ctaCanvas && !reducedMotion) {
    const cCtx = ctaCanvas.getContext("2d");
    let cW, cH, cTime = 0;

    const initCta = () => {
      const dpr = window.devicePixelRatio || 1;
      cW = ctaCanvas.offsetWidth || 300;
      cH = ctaCanvas.offsetHeight || 300;
      ctaCanvas.width = cW * dpr;
      ctaCanvas.height = cH * dpr;
      cCtx.resetTransform();
      cCtx.scale(dpr, dpr);
    };
    window.addEventListener("resize", initCta);
    initCta();

    let ctaMouseX = cW / 2;
    let ctaMouseY = cH / 2;
    ctaCanvas.parentElement.addEventListener("mousemove", (e) => {
      const rect = ctaCanvas.parentElement.getBoundingClientRect();
      ctaMouseX = e.clientX - rect.left;
      ctaMouseY = e.clientY - rect.top;
    });

    const drawCta = () => {
      cCtx.clearRect(0, 0, cW, cH);
      cTime += 0.008;

      const cx = cW / 2;
      const cy = cH / 2;

      // Mouse-reactive brand aurora blobs
      const blobs = [
        { x: cx + Math.sin(cTime) * 120, y: cy + Math.cos(cTime * 0.7) * 70, r: 250, color: 'rgba(0, 230, 167, 0.035)' }, // Accent green
        { x: cx + Math.cos(cTime * 0.8) * 100, y: cy + Math.sin(cTime * 1.2) * 60, r: 230, color: 'rgba(139, 113, 255, 0.025)' }, // Accent purple
        { x: ctaMouseX, y: ctaMouseY, r: 180, color: 'rgba(255, 255, 255, 0.02)' }
      ];

      for (const b of blobs) {
        const grad = cCtx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        grad.addColorStop(0, b.color);
        grad.addColorStop(1, 'transparent');
        cCtx.fillStyle = grad;
        cCtx.fillRect(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
      }

      // Subtle pulsing background ring
      const pulseR = 250 + Math.sin(cTime * 1.5) * 30;
      cCtx.beginPath();
      cCtx.arc(cx, cy, pulseR, 0, Math.PI * 2);
      cCtx.strokeStyle = `rgba(0, 230, 167, ${0.015 + Math.sin(cTime * 1.5) * 0.01})`;
      cCtx.lineWidth = 0.5;
      cCtx.stroke();

      requestAnimationFrame(drawCta);
    };
    drawCta();
  }

  // ══ LIQUID CUSTOM CURSOR & MAGNETIC PHYSICS SYSTEM ══
  const initCursor = () => {
    // Return early if pointer is coarse (touchscreens)
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let dot = document.getElementById("cursor-dot");
    let ring = document.getElementById("cursor-ring");

    // Dynamic generation if elements are missing
    if (!dot) {
      dot = document.createElement("div");
      dot.id = "cursor-dot";
      dot.className = "cursor-dot";
      dot.setAttribute("aria-hidden", "true");
      document.body.appendChild(dot);
    }
    if (!ring) {
      ring = document.createElement("div");
      ring.id = "cursor-ring";
      ring.className = "cursor-ring";
      ring.setAttribute("aria-hidden", "true");
      document.body.appendChild(ring);
    }

    let mX = -100, mY = -100;
    let rX = -100, rY = -100;

    window.addEventListener("mousemove", (e) => {
      mX = e.clientX;
      mY = e.clientY;
    });

    const updateCursorPosition = () => {
      // Lerp calculations for fluid trailing ring
      rX += (mX - rX) * 0.16;
      rY += (mY - rY) * 0.16;

      dot.style.transform = `translate3d(${mX}px, ${mY}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${rX}px, ${rY}px, 0) translate(-50%, -50%)`;

      requestAnimationFrame(updateCursorPosition);
    };
    updateCursorPosition();

    // Attach hover transitions
    const hoverQuery = "a, button, select, details summary, .sys-card, .insight-card, .cs-card";
    document.querySelectorAll(hoverQuery).forEach((el) => {
      el.addEventListener("mouseenter", () => {
        document.body.classList.add("cursor-hover");
        if (el.classList.contains("sys-card") || el.classList.contains("insight-card") || el.classList.contains("cs-card")) {
          document.body.classList.add("cursor-hover-card");
        }
      });
      el.addEventListener("mouseleave", () => {
        document.body.classList.remove("cursor-hover");
        document.body.classList.remove("cursor-hover-card");
      });
    });

    // Magnetic pull physics for key CTA elements
    const magnetQuery = ".btn-prime, .btn-ghost, .nav-cta, .menu-toggle";
    document.querySelectorAll(magnetQuery).forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        // Element center coordinates relative to viewport
        const btnCenterX = rect.left + rect.width / 2;
        const btnCenterY = rect.top + rect.height / 2;

        const distanceX = mX - btnCenterX;
        const distanceY = mY - btnCenterY;
        const dist = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        if (dist < 70) {
          // Spring scale physics: pull strength increases with proximity
          const pullStrength = (70 - dist) / 70;
          const pullX = distanceX * pullStrength * 0.35;
          const pullY = distanceY * pullStrength * 0.35;
          
          btn.style.transform = `translate3d(${pullX}px, ${pullY}px, 0) scale(1.02)`;
          btn.style.transition = "none"; // Stop delays to make pull instant
        }
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "translate3d(0, 0, 0) scale(1)";
        btn.style.transition = "transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)";
      });
    });
  };
  initCursor();

  if (hero && !motionGraphic && motionWrapper) {
      let rawMouseX = 0;
      let rawMouseY = 0;
      hero.addEventListener("mousemove", (e) => {
        const rect = hero.getBoundingClientRect();
        rawMouseX = e.clientX - rect.left - rect.width / 2;
        rawMouseY = e.clientY - rect.top - rect.height / 2;

        if (heroBg && !reducedMotion) {
          const bgX = (rawMouseX / (rect.width / 2)) * 1.5;
          const bgY = (rawMouseY / (rect.height / 2)) * 1.5;
          heroBg.style.transform = `translate(${bgX}%, ${bgY}%) scale(1.05)`;
        }

        if (motionWrapper && !reducedMotion) {
          const rotateX = (rawMouseY / (rect.height / 2)) * -12;
          const rotateY = (rawMouseX / (rect.width / 2)) * 12;
          motionWrapper.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }
      });
      hero.addEventListener("mouseleave", () => {
        if (heroBg) heroBg.style.transform = "translate(0,0) scale(1.05)";
        if (motionWrapper) motionWrapper.style.transform = "rotateX(0deg) rotateY(0deg)";
      });
    }
  // ══ SERVICE HUD MOTION GRAPHICS ══

  // Utility for setting up High-DPI canvases
  function setupDpiCanvas(canvas, logicalW, logicalH) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = logicalW * dpr;
    canvas.height = logicalH * dpr;
    const ctx = canvas.getContext("2d");
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    return { ctx, dpr };
  }

  // Utility for responsive section background canvases
  function setupResponsiveCanvas(canvas) {
    const parent = canvas.parentElement;
    const w = parent.offsetWidth || window.innerWidth;
    const h = parent.offsetHeight || 500;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    const ctx = canvas.getContext("2d");
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    return { ctx, w, h, dpr };
  }

  // Linear Interpolation helper
  const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

  // 3D Rotation helper functions
  function rotate3DX(y, z, angle) {
    const cos = Math.cos(angle), sin = Math.sin(angle);
    return { y: y * cos - z * sin, z: z * cos + y * sin };
  }
  function rotate3DY(x, z, angle) {
    const cos = Math.cos(angle), sin = Math.sin(angle);
    return { x: x * cos + z * sin, z: z * cos - x * sin };
  }
  function rotate3DZ(x, y, angle) {
    const cos = Math.cos(angle), sin = Math.sin(angle);
    return { x: x * cos - y * sin, y: y * cos + x * sin };
  }

  // A. Branding & Website Design Canvases
  const brandingCanvas = document.getElementById("branding-hud-canvas");
  if (brandingCanvas && !reducedMotion) {
    const { ctx } = setupDpiCanvas(brandingCanvas, 600, 600);
    const cx = 300, cy = 300;
    const fov = 400;
    let time = 0;

    // Mouse interactive camera offsets
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;
    const heroSection = brandingCanvas.closest(".hero");

    if (heroSection) {
      heroSection.addEventListener("mousemove", (e) => {
        const rect = heroSection.getBoundingClientRect();
        targetMouseX = (e.clientX - rect.left - rect.width / 2) * 0.4;
        targetMouseY = (e.clientY - rect.top - rect.height / 2) * 0.4;
      });
      heroSection.addEventListener("mouseleave", () => {
        targetMouseX = 0;
        targetMouseY = 0;
      });
    }

    // Golden Ratio 3D Icosahedron Vertices
    const phi = (1 + Math.sqrt(5)) / 2;
    const scaleFactor = 105;
    const rawVertices = [
      {x: -1, y: phi, z: 0}, {x: 1, y: phi, z: 0}, {x: -1, y: -phi, z: 0}, {x: 1, y: -phi, z: 0},
      {x: 0, y: -1, z: phi}, {x: 0, y: 1, z: phi}, {x: 0, y: -1, z: -phi}, {x: 0, y: 1, z: -phi},
      {x: phi, y: 0, z: -1}, {x: phi, y: 0, z: 1}, {x: -phi, y: 0, z: -1}, {x: -phi, y: 0, z: 1}
    ].map(v => ({ x: v.x * scaleFactor, y: v.y * scaleFactor, z: v.z * scaleFactor }));

    const edges = [
      [0, 1], [0, 5], [0, 7], [0, 10], [0, 11],
      [1, 5], [1, 7], [1, 8], [1, 9],
      [2, 3], [2, 4], [2, 6], [2, 10], [2, 11],
      [3, 4], [3, 6], [3, 8], [3, 9],
      [4, 5], [4, 9], [4, 11],
      [5, 9], [5, 11],
      [6, 7], [6, 8], [6, 10],
      [7, 8], [7, 10],
      [8, 9], [10, 11]
    ];

    // Drifting 3D dust particles
    const dust = [];
    for (let i = 0; i < 20; i++) {
      dust.push({
        x: (Math.random() - 0.5) * 360,
        y: (Math.random() - 0.5) * 360,
        z: (Math.random() - 0.5) * 360,
        size: Math.random() * 2 + 0.5,
        speed: 0.005 + Math.random() * 0.015
      });
    }

    // Edge packets shooting along wireframe
    const packets = [];
    const maxPackets = 12;

    const render = () => {
      ctx.clearRect(0, 0, 600, 600);
      time += 0.008;

      // Smoothed camera tracking
      mouseX = lerp(mouseX, targetMouseX, 0.05);
      mouseY = lerp(mouseY, targetMouseY, 0.05);

      const angleX = time * 0.2 + mouseY * 0.004;
      const angleY = time * 0.35 + mouseX * 0.004;
      const angleZ = time * 0.15;

      // Draw Spinning Cybernetic HUD Outer Rings
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(13, 204, 147, 0.035)";
      ctx.beginPath();
      ctx.arc(cx, cy, 260, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(13, 204, 147, 0.07)";
      ctx.setLineDash([4, 16]);
      ctx.beginPath();
      ctx.arc(cx, cy, 220, -time * 0.4, Math.PI * 2 - time * 0.4);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = "rgba(139, 113, 255, 0.06)";
      ctx.setLineDash([40, 15, 10, 15]);
      ctx.beginPath();
      ctx.arc(cx, cy, 180, time * 0.2, Math.PI * 2 + time * 0.2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw circular angle tick marks
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        const x1 = cx + Math.cos(a) * 215;
        const y1 = cy + Math.sin(a) * 215;
        const x2 = cx + Math.cos(a) * 225;
        const y2 = cy + Math.sin(a) * 225;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
      ctx.stroke();

      // Project and draw 3D Dust Particles
      dust.forEach(p => {
        p.z -= p.speed * 40;
        if (p.z < -180) p.z = 180;
        
        let rot = rotate3DX(p.y, p.z, angleX);
        rot = rotate3DY(p.x, rot.z, angleY);
        
        const scale = fov / (fov + rot.z);
        const px = cx + rot.x * scale;
        const py = cy + rot.y * scale;

        if (px >= 0 && px <= 600 && py >= 0 && py <= 600) {
          const alpha = Math.min(1, (180 - rot.z) / 360) * 0.35;
          ctx.fillStyle = `rgba(13, 204, 147, ${alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, p.size * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Project Icosahedron Vertices
      const projected = rawVertices.map(v => {
        let r = rotate3DX(v.y, v.z, angleX);
        r = rotate3DY(v.x, r.z, angleY);
        r = rotate3DZ(r.x, r.y, angleZ);

        const scale = fov / (fov + r.z);
        return {
          x: cx + r.x * scale,
          y: cy + r.y * scale,
          z: r.z,
          scale: scale
        };
      });

      // Depth-sort and draw edges
      const edgeDrawData = edges.map(e => {
        const p1 = projected[e[0]];
        const p2 = projected[e[1]];
        return {
          e: e,
          avgZ: (p1.z + p2.z) / 2,
          p1: p1,
          p2: p2
        };
      });
      edgeDrawData.sort((a, b) => b.avgZ - a.avgZ);

      edgeDrawData.forEach(edge => {
        const alpha = Math.min(1, (180 - edge.avgZ) / 360);
        ctx.strokeStyle = `rgba(13, 204, 147, ${0.12 + alpha * 0.22})`;
        ctx.lineWidth = Math.max(0.5, 1.2 * ((edge.p1.scale + edge.p2.scale) / 2));
        ctx.beginPath();
        ctx.moveTo(edge.p1.x, edge.p1.y);
        ctx.lineTo(edge.p2.x, edge.p2.y);
        ctx.stroke();
      });

      // Shooting data packets along mesh
      if (Math.random() < 0.08 && packets.length < maxPackets) {
        const randEdge = edges[Math.floor(Math.random() * edges.length)];
        packets.push({
          from: randEdge[0],
          to: randEdge[1],
          progress: 0,
          speed: 0.012 + Math.random() * 0.015,
          color: Math.random() > 0.45 ? "13, 204, 147" : "139, 113, 255"
        });
      }

      packets.forEach((p, idx) => {
        p.progress += p.speed;
        if (p.progress >= 1) {
          packets.splice(idx, 1);
          return;
        }
        const n1 = projected[p.from];
        const n2 = projected[p.to];
        const px = n1.x + (n2.x - n1.x) * p.progress;
        const py = n1.y + (n2.y - n1.y) * p.progress;

        ctx.fillStyle = `rgba(${p.color}, 0.9)`;
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = `rgb(${p.color})`;
        ctx.shadowBlur = 10;
        ctx.fillStyle = `rgba(${p.color}, 0.3)`;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw vertex nodes
      projected.forEach((p, idx) => {
        const pulse = Math.sin(time * 3.5 + idx) * 0.5 + 0.5;
        const size = (4.5 + pulse * 1.5) * p.scale;
        
        ctx.fillStyle = idx % 2 === 0 ? "#0dcca7" : "#a78bfa";
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 1.6, 0, Math.PI * 2);
        ctx.stroke();
      });

      requestAnimationFrame(render);
    };
    render();
  }

  // Golden Ratio Architect Grid Background (`branding-grid-canvas`)
  const brandingGridCanvas = document.getElementById("branding-grid-canvas");
  if (brandingGridCanvas && !reducedMotion) {
    let { ctx, w, h } = setupResponsiveCanvas(brandingGridCanvas);
    let time = 0;

    let pMouseX = w / 2, pMouseY = h / 2;
    let targetPMouseX = w / 2, targetPMouseY = h / 2;

    window.addEventListener("resize", () => {
      const res = setupResponsiveCanvas(brandingGridCanvas);
      ctx = res.ctx; w = res.w; h = res.h;
    });

    brandingGridCanvas.parentElement.addEventListener("mousemove", (e) => {
      const rect = brandingGridCanvas.parentElement.getBoundingClientRect();
      targetPMouseX = e.clientX - rect.left;
      targetPMouseY = e.clientY - rect.top;
    });

    const drawGrid = () => {
      ctx.clearRect(0, 0, w, h);
      time += 0.005;

      pMouseX = lerp(pMouseX, targetPMouseX, 0.08);
      pMouseY = lerp(pMouseY, targetPMouseY, 0.08);

      // Draw horizontal and vertical blueprint grid lines
      ctx.strokeStyle = "rgba(13, 204, 147, 0.015)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let x = 0; x < w; x += 50) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += 50) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      // Render Golden Ratio (Fibonacci) Spiral
      const cx = w * 0.45;
      const cy = h * 0.5;
      let size = 1.2;
      let angle = -time * 0.08;

      ctx.strokeStyle = "rgba(13, 204, 147, 0.035)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      
      let x = cx, y = cy;
      const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
      fib.forEach((f, idx) => {
        const radius = f * size;
        const startA = idx * Math.PI / 2 + angle;
        const endA = (idx + 1) * Math.PI / 2 + angle;

        ctx.arc(x, y, radius, startA, endA);
        
        x += Math.cos(endA) * radius * 0.618;
        y += Math.sin(endA) * radius * 0.618;
      });
      ctx.stroke();

      // Draw engineering crosshair overlay on pointer
      ctx.strokeStyle = "rgba(13, 204, 147, 0.05)";
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(pMouseX, 0); ctx.lineTo(pMouseX, h);
      ctx.moveTo(0, pMouseY); ctx.lineTo(w, pMouseY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = "rgba(139, 113, 255, 0.15)";
      ctx.beginPath();
      ctx.arc(pMouseX, pMouseY, 12, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.font = "8px Outfit, Courier, monospace";
      ctx.textAlign = "left";
      ctx.fillText(`GS-ALIGN // X: ${Math.round(pMouseX)}px  Y: ${Math.round(pMouseY)}px`, pMouseX + 18, pMouseY - 4);

      requestAnimationFrame(drawGrid);
    };
    drawGrid();
  }

  // B. Founder Branding Canvases
  const founderHudCanvas = document.getElementById("founder-hud-canvas");
  if (founderHudCanvas && !reducedMotion) {
    const { ctx } = setupDpiCanvas(founderHudCanvas, 600, 600);
    const cx = 300, cy = 300;
    let time = 0;

    let mouseX = 300, mouseY = 300;
    let targetMouseX = 300, targetMouseY = 300;
    let proximityIntensity = 1.0;
    const heroSection = founderHudCanvas.closest(".hero");

    if (heroSection) {
      heroSection.addEventListener("mousemove", (e) => {
        const rect = heroSection.getBoundingClientRect();
        // Mouse in canvas coordinate space
        const canvasRect = founderHudCanvas.getBoundingClientRect();
        targetMouseX = ((e.clientX - canvasRect.left) / canvasRect.width) * 600;
        targetMouseY = ((e.clientY - canvasRect.top) / canvasRect.height) * 600;
        
        const dx = targetMouseX - cx;
        const dy = targetMouseY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        proximityIntensity = Math.min(2.5, 1.0 + (180 - Math.min(180, dist)) * 0.008);
      });
      heroSection.addEventListener("mouseleave", () => {
        targetMouseX = cx;
        targetMouseY = cy;
        proximityIntensity = 1.0;
      });
    }

    const orbits = [
      { rx: 110, ry: 40, tiltZ: 0.5, tiltX: 0.6, speed: 0.8, color: "0, 230, 167", count: 8 },
      { rx: 165, ry: 60, tiltZ: -0.3, tiltX: -0.4, speed: -0.5, color: "139, 113, 255", count: 12 },
      { rx: 220, ry: 75, tiltZ: 0.8, tiltX: 0.3, speed: 0.3, color: "255, 255, 255", count: 16 }
    ];

    // Ripple wave structures
    const ripples = [];

    const getEllipticCoordinate = (rx, ry, angle, tZ, tX) => {
      let x = rx * Math.cos(angle);
      let y = ry * Math.sin(angle);
      let z = rx * Math.sin(angle) * 0.5;

      // Z rotate
      const cosZ = Math.cos(tZ), sinZ = Math.sin(tZ);
      const x1 = x * cosZ - y * sinZ;
      const y1 = y * cosZ + x * sinZ;

      // X rotate
      const cosX = Math.cos(tX), sinX = Math.sin(tX);
      const y2 = y1 * cosX - z * sinX;
      const z2 = z * cosX + y1 * sinX;

      return { x: x1, y: y2, z: z2 };
    };

    const drawFounderHud = () => {
      ctx.clearRect(0, 0, 600, 600);
      time += 0.006 * proximityIntensity;

      mouseX = lerp(mouseX, targetMouseX, 0.06);
      mouseY = lerp(mouseY, targetMouseY, 0.06);

      // Trigger background circular ripples randomly
      if (Math.random() < 0.015) {
        ripples.push({ r: 40, alpha: 0.4, speed: 1.5 });
      }

      // Draw Concentric Ripples (Aura Waves)
      ripples.forEach((r, idx) => {
        r.r += r.speed;
        r.alpha -= 0.004;
        if (r.alpha <= 0) {
          ripples.splice(idx, 1);
          return;
        }
        ctx.strokeStyle = `rgba(13, 204, 147, ${r.alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r.r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Draw static circular HUD background meshes
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 80, 0, Math.PI * 2);
      ctx.arc(cx, cy, 140, 0, Math.PI * 2);
      ctx.stroke();

      const projectedPoints = [];

      orbits.forEach((orbit, oIdx) => {
        // Draw the ring guides
        ctx.beginPath();
        ctx.strokeStyle = oIdx === 1 ? "rgba(139, 113, 255, 0.08)" : "rgba(13, 204, 147, 0.05)";
        ctx.lineWidth = 0.8;
        
        for (let a = 0; a < Math.PI * 2; a += 0.1) {
          const pt = getEllipticCoordinate(orbit.rx, orbit.ry, a, orbit.tiltZ, orbit.tiltX);
          if (a === 0) ctx.moveTo(cx + pt.x, cy + pt.y);
          else ctx.lineTo(cx + pt.x, cy + pt.y);
        }
        ctx.closePath();
        ctx.stroke();

        // Calculate and Draw orbiting nodes
        for (let i = 0; i < orbit.count; i++) {
          const angle = (i / orbit.count) * Math.PI * 2 + time * orbit.speed;
          const pt = getEllipticCoordinate(orbit.rx, orbit.ry, angle, orbit.tiltZ, orbit.tiltX);
          const px = cx + pt.x;
          const py = cy + pt.y;

          projectedPoints.push({
            x: px,
            y: py,
            z: pt.z,
            color: orbit.color,
            size: 3 + (pt.z / orbit.rx) * 1.5
          });
        }
      });

      // Depth sort satellite nodes
      projectedPoints.sort((a, b) => b.z - a.z);

      // Mouse interactive connection vector lines
      projectedPoints.forEach(p => {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          const alpha = (1 - dist / 130) * 0.28;
          ctx.strokeStyle = `rgba(${p.color}, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.stroke();
        }

        // Draw Core authority halo
        ctx.fillStyle = `rgba(${p.color}, ${0.12 + (p.z / 200) * 0.08})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${p.color}, 0.95)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Glowing center personal brand anchor sphere
      ctx.shadowColor = "rgba(139, 113, 255, 0.4)";
      ctx.shadowBlur = 18;
      ctx.fillStyle = "#8b71ff";
      ctx.beginPath();
      ctx.arc(cx, cy, 32 + Math.sin(time * 3) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 48 + Math.sin(time * 3) * 4, 0, Math.PI * 2);
      ctx.stroke();

      requestAnimationFrame(drawFounderHud);
    };
    drawFounderHud();
  }

  // Shifting Brand Aura Blobs Background (`founder-aura-canvas`)
  const founderAuraCanvas = document.getElementById("founder-aura-canvas");
  if (founderAuraCanvas && !reducedMotion) {
    let { ctx, w, h } = setupResponsiveCanvas(founderAuraCanvas);
    let time = 0;

    let auraMouseX = w / 2, auraMouseY = h / 2;
    let targetAuraX = w / 2, targetAuraY = h / 2;

    window.addEventListener("resize", () => {
      const res = setupResponsiveCanvas(founderAuraCanvas);
      ctx = res.ctx; w = res.w; h = res.h;
    });

    founderAuraCanvas.parentElement.addEventListener("mousemove", (e) => {
      const rect = founderAuraCanvas.parentElement.getBoundingClientRect();
      targetAuraX = e.clientX - rect.left;
      targetAuraY = e.clientY - rect.top;
    });

    // 4 Organic fluid metaballs
    const blobs = [
      { x: w * 0.3, y: h * 0.4, vx: 0.2, vy: 0.3, r: 240, color: "rgba(13, 204, 147, 0.04)" }, // Emerald
      { x: w * 0.7, y: h * 0.6, vx: -0.3, vy: -0.2, r: 280, color: "rgba(139, 113, 255, 0.03)" }, // Purple
      { x: w * 0.5, y: h * 0.3, vx: 0.15, vy: -0.35, r: 200, color: "rgba(0, 230, 167, 0.02)" }, // Green
      { x: w / 2, y: h / 2, vx: 0, vy: 0, r: 180, color: "rgba(255, 255, 255, 0.015)" } // White center
    ];

    const drawAura = () => {
      ctx.clearRect(0, 0, w, h);
      time += 0.003;

      auraMouseX = lerp(auraMouseX, targetAuraX, 0.05);
      auraMouseY = lerp(auraMouseY, targetAuraY, 0.05);

      ctx.globalCompositeOperation = "screen";

      blobs.forEach((b, idx) => {
        if (idx === 3) {
          // Centered tracker blob follows mouse closely
          b.x = lerp(b.x, auraMouseX, 0.04);
          b.y = lerp(b.y, auraMouseY, 0.04);
        } else {
          // Physics updates with bounce
          b.x += b.vx;
          b.y += b.vy;
          if (b.x < 0 || b.x > w) b.vx *= -1;
          if (b.y < 0 || b.y > h) b.vy *= -1;

          // Gentle spring attraction to mouse pointer
          const dx = auraMouseX - b.x;
          const dy = auraMouseY - b.y;
          b.vx += dx * 0.00008;
          b.vy += dy * 0.00008;

          // Limit speed
          const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
          if (speed > 1.5) {
            b.vx = (b.vx / speed) * 1.5;
            b.vy = (b.vy / speed) * 1.5;
          }
        }

        // Draw radial glowing blob
        const rad = b.r + Math.sin(time * 1.5 + idx) * 35;
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, rad);
        grad.addColorStop(0, b.color);
        grad.addColorStop(1, "transparent");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, rad, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(drawAura);
    };
    drawAura();
  }

  // C. SEO & AEO Content Systems Canvases
  const seoCanvas = document.getElementById("seo-hud-canvas");
  if (seoCanvas && !reducedMotion) {
    const { ctx } = setupDpiCanvas(seoCanvas, 600, 600);
    const cx = 300, cy = 300;
    const fov = 420;
    let time = 0;

    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;
    const heroSection = seoCanvas.closest(".hero");

    if (heroSection) {
      heroSection.addEventListener("mousemove", (e) => {
        const rect = heroSection.getBoundingClientRect();
        targetMouseX = (e.clientX - rect.left - rect.width / 2) * 0.45;
        targetMouseY = (e.clientY - rect.top - rect.height / 2) * 0.45;
      });
      heroSection.addEventListener("mouseleave", () => {
        targetMouseX = 0;
        targetMouseY = 0;
      });
    }

    // 3D Node constellation
    const rawNodes = [
      { x: 0, y: 0, z: 0, baseR: 20, color: "#06b6d4", tag: "AI Search" },
      { x: -110, y: -80, z: 50, baseR: 12, color: "#0dcca7", tag: "Intent" },
      { x: 110, y: -80, z: -50, baseR: 12, color: "#a78bfa", tag: "GEO" },
      { x: -130, y: 70, z: -60, baseR: 10, color: "#06b6d4", tag: "SEO" },
      { x: 130, y: 70, z: 60, baseR: 10, color: "#0dcca7", tag: "FAQ" },
      { x: 0, y: -130, z: -30, baseR: 8, color: "#a78bfa", tag: "Schema" },
      { x: -50, y: 120, z: 40, baseR: 9, color: "#06b6d4", tag: "Entity" },
      { x: 50, y: 120, z: -40, baseR: 9, color: "#0dcca7", tag: "Cluster" },
      { x: 100, y: 0, z: 120, baseR: 11, color: "#a78bfa", tag: "Trust Engine" }
    ];

    const links = [
      [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 8],
      [1, 5], [2, 5], [1, 3], [2, 4], [3, 6], [4, 7], [6, 7], [8, 4], [8, 2]
    ];

    let packets = [];
    let ripplePulses = [];
    let hoveredNodeIdx = -1;

    // Interactive Node Burst Particles
    let burstParticles = [];

    const triggerBurst = (x, y, color) => {
      for (let i = 0; i < 10; i++) {
        burstParticles.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5,
          size: Math.random() * 2.5 + 1.2,
          alpha: 0.8,
          color: color
        });
      }
    };

    const renderSeo = () => {
      ctx.clearRect(0, 0, 600, 600);
      time += 0.012;

      mouseX = lerp(mouseX, targetMouseX, 0.05);
      mouseY = lerp(mouseY, targetMouseY, 0.05);

      const angleX = time * 0.12 + mouseY * 0.0035;
      const angleY = time * 0.18 + mouseX * 0.0035;

      // Project nodes in 3D
      const projectedNodes = rawNodes.map((n, idx) => {
        let r = rotate3DX(n.y, n.z, angleX);
        r = rotate3DY(n.x, r.z, angleY);

        const scale = fov / (fov + r.z);
        return {
          idx: idx,
          x: cx + r.x * scale,
          y: cy + r.y * scale,
          z: r.z,
          scale: scale,
          baseR: n.baseR,
          color: n.color,
          tag: n.tag
        };
      });

      // Hover Detection
      let hoveredIdx = -1;
      const mouseCanvasX = mouseX + cx;
      const mouseCanvasY = mouseY + cy;

      projectedNodes.forEach((pn, i) => {
        const dx = mouseCanvasX - pn.x;
        const dy = mouseCanvasY - pn.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < pn.baseR + 12) {
          hoveredIdx = i;
        }
      });

      if (hoveredIdx !== -1 && hoveredIdx !== hoveredNodeIdx) {
        hoveredNodeIdx = hoveredIdx;
        const hn = projectedNodes[hoveredNodeIdx];
        triggerBurst(hn.x, hn.y, hn.color);
        ripplePulses.push({ x: hn.x, y: hn.y, r: 15, maxR: 70, alpha: 0.5 });
      } else if (hoveredIdx === -1) {
        hoveredNodeIdx = -1;
      }

      // Draw faint structural orbits in background
      ctx.strokeStyle = "rgba(6, 182, 212, 0.02)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 140, 0, Math.PI * 2);
      ctx.arc(cx, cy, 210, 0, Math.PI * 2);
      ctx.stroke();

      // Draw connections
      ctx.strokeStyle = "rgba(6, 182, 212, 0.08)";
      ctx.lineWidth = 0.8;
      links.forEach(l => {
        const p1 = projectedNodes[l[0]];
        const p2 = projectedNodes[l[1]];
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      // Handle Ripple Pulses
      ripplePulses.forEach((p, idx) => {
        p.r += 2.2;
        p.alpha -= 0.012;
        if (p.alpha <= 0) {
          ripplePulses.splice(idx, 1);
          return;
        }
        ctx.strokeStyle = `rgba(6, 182, 212, ${p.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Flowing data packets
      if (Math.random() < 0.09 && packets.length < 15) {
        const randLink = links[Math.floor(Math.random() * links.length)];
        packets.push({
          link: randLink,
          progress: 0,
          speed: 0.014 + Math.random() * 0.014
        });
      }

      ctx.fillStyle = "#06b6d4";
      packets = packets.filter(p => {
        p.progress += p.speed;
        if (p.progress >= 1) return false;
        const n1 = projectedNodes[p.link[0]];
        const n2 = projectedNodes[p.link[1]];
        const px = n1.x + (n2.x - n1.x) * p.progress;
        const py = n1.y + (n2.y - n1.y) * p.progress;
        ctx.beginPath();
        ctx.arc(px, py, 3.2, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      // Handle Node Burst Particles
      burstParticles.forEach((bp, idx) => {
        bp.x += bp.vx;
        bp.y += bp.vy;
        bp.alpha -= 0.02;
        bp.size *= 0.96;

        if (bp.alpha <= 0 || bp.size < 0.4) {
          burstParticles.splice(idx, 1);
          return;
        }

        ctx.fillStyle = `rgba(6, 182, 212, ${bp.alpha})`;
        ctx.beginPath();
        ctx.arc(bp.x, bp.y, bp.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Depth sort node drawings
      projectedNodes.sort((a, b) => b.z - a.z);

      projectedNodes.forEach(n => {
        const isHovered = n.idx === hoveredNodeIdx;
        const pulse = Math.sin(time * 2.5 + n.idx) * 2;
        const size = (n.baseR + pulse * 0.3) * n.scale * (isHovered ? 1.25 : 1.0);

        ctx.fillStyle = n.color;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = isHovered ? 18 : 6;
        ctx.beginPath();
        ctx.arc(n.x, n.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, size + 8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.font = "10px Outfit, Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(n.tag, n.x, n.y + size + 20);

        // Draw Interactive Cybernetic HUD Tooltip for Hovered Node
        if (isHovered) {
          ctx.strokeStyle = "rgba(6, 182, 212, 0.5)";
          ctx.fillStyle = "rgba(9, 12, 19, 0.9)";
          ctx.lineWidth = 1;
          
          const boxW = 115, boxH = 50;
          const bx = n.x + size + 10, by = n.y - boxH / 2;

          ctx.beginPath();
          ctx.rect(bx, by, boxW, boxH);
          ctx.fill();
          ctx.stroke();

          // Connective line to tooltip box
          ctx.beginPath();
          ctx.moveTo(n.x + size, n.y);
          ctx.lineTo(bx, n.y);
          ctx.stroke();

          ctx.fillStyle = "#ffffff";
          ctx.font = "9px Outfit, Arial, sans-serif";
          ctx.textAlign = "left";
          ctx.fillText(`[ENTITY // ${n.tag.toUpperCase()}]`, bx + 8, by + 14);
          
          ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
          ctx.fillText(`CRAWL_VAL: ${(90 + n.scale * 10).toFixed(1)}%`, bx + 8, by + 26);
          ctx.fillStyle = "#0dcca7";
          ctx.fillText(`STATUS: SYS_OPTIMIZED`, bx + 8, by + 38);
        }
      });

      requestAnimationFrame(renderSeo);
    };
    renderSeo();
  }

  // Cascading SEO Crawler & Web Index Background (`seo-crawl-canvas`)
  const seoCrawlCanvas = document.getElementById("seo-crawl-canvas");
  if (seoCrawlCanvas && !reducedMotion) {
    let { ctx, w, h } = setupResponsiveCanvas(seoCrawlCanvas);
    let time = 0;

    let crawlMouseX = w / 2, crawlMouseY = h / 2;
    let targetCrawlX = w / 2, targetCrawlY = h / 2;

    window.addEventListener("resize", () => {
      const res = setupResponsiveCanvas(seoCrawlCanvas);
      ctx = res.ctx; w = res.w; h = res.h;
    });

    seoCrawlCanvas.parentElement.addEventListener("mousemove", (e) => {
      const rect = seoCrawlCanvas.parentElement.getBoundingClientRect();
      targetCrawlX = e.clientX - rect.left;
      targetCrawlY = e.clientY - rect.top;
    });

    // Crawler grid nodes
    const gridNodes = [];
    const gridCols = Math.ceil(w / 80) + 1;
    const gridRows = Math.ceil(h / 80) + 1;

    for (let c = 0; c < gridCols; c++) {
      for (let r = 0; r < gridRows; r++) {
        gridNodes.push({
          x: c * 80 + (Math.random() - 0.5) * 15,
          y: r * 80 + (Math.random() - 0.5) * 15,
          baseX: c * 80,
          baseY: r * 80,
          pulseSpeed: 0.05 + Math.random() * 0.05,
          pulsePhase: Math.random() * Math.PI
        });
      }
    }

    // Crawling streams of symbols
    const columns = [];
    const numColumns = Math.ceil(w / 35);
    const symbols = ["GEO", "AEO", "FAQ", "Schema", "Entity", "1", "0", "LSI", "XML", "JSON-LD", "SSL", "SEO", "INDEX", "URI", "HTTPS", "WEB"];
    
    for (let i = 0; i < numColumns; i++) {
      columns.push({
        x: i * 35 + (Math.random() - 0.5) * 5,
        y: Math.random() * -h,
        speed: 1.2 + Math.random() * 2.2,
        val: symbols[Math.floor(Math.random() * symbols.length)]
      });
    }

    const drawCrawl = () => {
      ctx.clearRect(0, 0, w, h);
      time += 0.02;

      crawlMouseX = lerp(crawlMouseX, targetCrawlX, 0.06);
      crawlMouseY = lerp(crawlMouseY, targetCrawlY, 0.06);

      // Draw faint web crawler grid mesh
      ctx.strokeStyle = "rgba(6, 182, 212, 0.012)";
      ctx.lineWidth = 0.6;
      for (let i = 0; i < gridNodes.length; i++) {
        const nA = gridNodes[i];
        
        // Slight organic oscillation
        nA.x = nA.baseX + Math.sin(time * nA.pulseSpeed + nA.pulsePhase) * 6;
        nA.y = nA.baseY + Math.cos(time * nA.pulseSpeed + nA.pulsePhase) * 6;

        for (let j = i + 1; j < gridNodes.length; j++) {
          const nB = gridNodes[j];
          const dx = nA.x - nB.x;
          const dy = nA.y - nB.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 105) {
            // Check proximity to mouse to light up web crawl paths
            const mDistA = Math.sqrt((crawlMouseX - nA.x) * (crawlMouseX - nA.x) + (crawlMouseY - nA.y) * (crawlMouseY - nA.y));
            const mDistB = Math.sqrt((crawlMouseX - nB.x) * (crawlMouseX - nB.x) + (crawlMouseY - nB.y) * (crawlMouseY - nB.y));
            const pathLit = (mDistA < 140 || mDistB < 140);

            ctx.strokeStyle = pathLit 
              ? `rgba(6, 182, 212, ${(1 - Math.min(140, Math.min(mDistA, mDistB)) / 140) * 0.12})` 
              : "rgba(6, 182, 212, 0.012)";
            ctx.lineWidth = pathLit ? 1.0 : 0.6;

            ctx.beginPath();
            ctx.moveTo(nA.x, nA.y);
            ctx.lineTo(nB.x, nB.y);
            ctx.stroke();
          }
        }
      }

      // Draw network anchor points
      gridNodes.forEach(n => {
        const mDist = Math.sqrt((crawlMouseX - n.x) * (crawlMouseX - n.x) + (crawlMouseY - n.y) * (crawlMouseY - n.y));
        const active = mDist < 140;

        ctx.fillStyle = active ? "rgba(13, 204, 147, 0.3)" : "rgba(255, 255, 255, 0.06)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, active ? 2.5 : 1.2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw cascading semantic crawlers
      ctx.textAlign = "center";
      ctx.font = "8px Outfit, monospace";

      columns.forEach(col => {
        col.y += col.speed;
        if (col.y > h + 20) {
          col.y = -40;
          col.speed = 1.2 + Math.random() * 2.2;
          col.val = symbols[Math.floor(Math.random() * symbols.length)];
        }

        // Draw character column trail
        const mDist = Math.sqrt((crawlMouseX - col.x) * (crawlMouseX - col.x) + (crawlMouseY - col.y) * (crawlMouseY - col.y));
        const nearMouse = mDist < 150;

        ctx.fillStyle = nearMouse 
          ? `rgba(6, 182, 212, ${(1 - mDist / 150) * 0.45})` 
          : "rgba(255, 255, 255, 0.02)";

        ctx.fillText(col.val, col.x, col.y);
      });

      requestAnimationFrame(drawCrawl);
      columns.forEach(col => {
        col.y += col.speed;
        if (col.y > h + 20) {
          col.y = -40;
          col.speed = 1.2 + Math.random() * 2.2;
          col.val = symbols[Math.floor(Math.random() * symbols.length)];
        }

        // Draw character column trail
        const mDist = Math.sqrt((crawlMouseX - col.x) * (crawlMouseX - col.x) + (crawlMouseY - col.y) * (crawlMouseY - col.y));
        const nearMouse = mDist < 150;

        ctx.fillStyle = nearMouse 
          ? `rgba(6, 182, 212, ${(1 - mDist / 150) * 0.45})` 
          : "rgba(255, 255, 255, 0.02)";

        ctx.fillText(col.val, col.x, col.y);
      });

      requestAnimationFrame(drawCrawl);
    };
    drawCrawl();
  }

  // D. Boutique Hospitality & Luxury Resort Canvases
  const hospCanvas = document.getElementById("hospitality-hud-canvas");
  if (hospCanvas && !reducedMotion) {
    const { ctx } = setupDpiCanvas(hospCanvas, 600, 600);
    const cx = 300, cy = 300;
    const fov = 450;
    let time = 0;

    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;
    const heroSection = hospCanvas.closest(".hero");

    if (heroSection) {
      heroSection.addEventListener("mousemove", (e) => {
        const rect = heroSection.getBoundingClientRect();
        targetMouseX = (e.clientX - rect.left - rect.width / 2) * 0.45;
        targetMouseY = (e.clientY - rect.top - rect.height / 2) * 0.45;
      });
      heroSection.addEventListener("mouseleave", () => {
        targetMouseX = 0;
        targetMouseY = 0;
      });
    }

    // Generate 3D Arched Facade coordinates (Boutique architecture structure)
    const arches = [];
    const numArches = 3;
    const pointsPerArch = 20;

    for (let a = 0; a < numArches; a++) {
      const z = -70 + a * 70; // Depth planes
      for (let i = 0; i <= pointsPerArch; i++) {
        const theta = (i / pointsPerArch) * Math.PI; // Semi-circle arch
        arches.push({
          x: Math.cos(theta) * 115,
          y: -Math.sin(theta) * 150 + 70, // offset arch top
          z: z,
          archIdx: a,
          pointIdx: i
        });
      }
    }

    // 3D floating dust nodes representing spatial ambiance
    const particles = [];
    for (let i = 0; i < 18; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 360,
        y: (Math.random() - 0.5) * 360,
        z: (Math.random() - 0.5) * 360,
        size: Math.random() * 2 + 0.6,
        speed: 0.006 + Math.random() * 0.012
      });
    }

    // Direct Booking "Guest Flow" data packets shooting along arches
    let packets = [];

    const renderHosp = () => {
      ctx.clearRect(0, 0, 600, 600);
      time += 0.007;

      mouseX = lerp(mouseX, targetMouseX, 0.05);
      mouseY = lerp(mouseY, targetMouseY, 0.05);

      const angleX = time * 0.15 + mouseY * 0.0035;
      const angleY = time * 0.22 + mouseX * 0.0035;
      const angleZ = Math.sin(time * 0.4) * 0.05;

      // Draw Spinning Cybernetic Coordinates HUD (warm gold)
      ctx.strokeStyle = "rgba(197, 168, 128, 0.03)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 270, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(197, 168, 128, 0.07)";
      ctx.setLineDash([5, 20]);
      ctx.beginPath();
      ctx.arc(cx, cy, 230, -time * 0.3, Math.PI * 2 - time * 0.3);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = "rgba(197, 168, 128, 0.04)";
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
        const x1 = cx + Math.cos(a) * 235;
        const y1 = cy + Math.sin(a) * 235;
        const x2 = cx + Math.cos(a) * 245;
        const y2 = cy + Math.sin(a) * 245;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
      ctx.stroke();

      // Project and render 3D dust particles
      particles.forEach(p => {
        p.z -= p.speed * 30;
        if (p.z < -180) p.z = 180;

        let rot = rotate3DX(p.y, p.z, angleX);
        rot = rotate3DY(p.x, rot.z, angleY);
        rot = rotate3DZ(rot.x, rot.y, angleZ);

        const scale = fov / (fov + rot.z);
        const px = cx + rot.x * scale;
        const py = cy + rot.y * scale;

        if (px >= 0 && px <= 600 && py >= 0 && py <= 600) {
          const alpha = Math.min(1, (180 - rot.z) / 360) * 0.4;
          ctx.fillStyle = `rgba(197, 168, 128, ${alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, p.size * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Project Arch vertices in 3D
      const projectedArches = arches.map(v => {
        let r = rotate3DX(v.y, v.z, angleX);
        r = rotate3DY(v.x, r.z, angleY);
        r = rotate3DZ(r.x, r.y, angleZ);

        const scale = fov / (fov + r.z);
        return {
          x: cx + r.x * scale,
          y: cy + r.y * scale,
          z: r.z,
          scale: scale,
          archIdx: v.archIdx,
          pointIdx: v.pointIdx
        };
      });

      // Render structural wireframe lines of arches
      ctx.lineWidth = 0.8;
      for (let a = 0; a < numArches; a++) {
        // Filter points belonging to current arch plane
        const pts = projectedArches.filter(p => p.archIdx === a);
        ctx.strokeStyle = `rgba(197, 168, 128, ${0.08 + (a * 0.05)})`;
        ctx.beginPath();
        for (let i = 0; i < pts.length; i++) {
          if (i === 0) ctx.moveTo(pts[i].x, pts[i].y);
          else ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.stroke();

        // Connect the arch columns to the virtual "ground plane"
        ctx.strokeStyle = `rgba(197, 168, 128, ${0.04 + (a * 0.03)})`;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        ctx.lineTo(pts[0].x, cy + 180);
        ctx.moveTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.lineTo(pts[pts.length - 1].x, cy + 180);
        ctx.stroke();
      }

      // Connect subsequent arches in depth spacing
      ctx.strokeStyle = "rgba(197, 168, 128, 0.05)";
      for (let i = 0; i <= pointsPerArch; i += 4) {
        ctx.beginPath();
        for (let a = 0; a < numArches; a++) {
          const pt = projectedArches.find(p => p.archIdx === a && p.pointIdx === i);
          if (pt) {
            if (a === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.stroke();
      }

      // Draw active guest reservation flow packets along arches
      if (Math.random() < 0.07 && packets.length < 10) {
        packets.push({
          archIdx: Math.floor(Math.random() * numArches),
          progress: 0,
          speed: 0.012 + Math.random() * 0.012,
          dir: Math.random() > 0.5 ? 1 : -1
        });
      }

      packets = packets.filter(p => {
        p.progress += p.speed;
        if (p.progress >= 1) return false;

        const pts = projectedArches.filter(node => node.archIdx === p.archIdx);
        // Find segment coordinate based on progress
        const indexFloat = p.progress * (pts.length - 1);
        const idx = Math.floor(indexFloat);
        const fract = indexFloat - idx;

        const nA = pts[p.dir === 1 ? idx : pts.length - 1 - idx];
        const nB = pts[p.dir === 1 ? Math.min(pts.length - 1, idx + 1) : Math.max(0, pts.length - 1 - idx - 1)];

        if (!nA || !nB) return false;

        const px = nA.x + (nB.x - nA.x) * fract;
        const py = nA.y + (nB.y - nA.y) * fract;

        ctx.fillStyle = "rgba(197, 168, 128, 0.95)";
        ctx.shadowColor = "rgb(197, 168, 128)";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(px, py, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        return true;
      });

      // Render highlighted guest portals/nodes
      projectedArches.forEach(n => {
        if (n.pointIdx === 0 || n.pointIdx === pointsPerArch || n.pointIdx === Math.floor(pointsPerArch / 2)) {
          const pulse = Math.sin(time * 3 + n.archIdx * 2) * 1.5;
          const size = (4.5 + pulse) * n.scale;

          ctx.fillStyle = "#c5a880";
          ctx.beginPath();
          ctx.arc(n.x, n.y, size, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(n.x, n.y, size * 1.8, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      requestAnimationFrame(renderHosp);
    };
    renderHosp();
  }

  // Interactive Guest Flow & Spatial Resonance Background (`hospitality-flow-canvas`)
  const hospFlowCanvas = document.getElementById("hospitality-flow-canvas");
  if (hospFlowCanvas && !reducedMotion) {
    let { ctx, w, h } = setupResponsiveCanvas(hospFlowCanvas);
    let time = 0;

    let fMouseX = w / 2, fMouseY = h / 2;
    let targetFMouseX = w / 2, targetFMouseY = h / 2;

    window.addEventListener("resize", () => {
      const res = setupResponsiveCanvas(hospFlowCanvas);
      ctx = res.ctx; w = res.w; h = res.h;
    });

    hospFlowCanvas.parentElement.addEventListener("mousemove", (e) => {
      const rect = hospFlowCanvas.parentElement.getBoundingClientRect();
      targetFMouseX = e.clientX - rect.left;
      targetFMouseY = e.clientY - rect.top;
    });

    // 4 Faint floating bezier flows
    const pathWaves = [];
    for (let i = 0; i < 4; i++) {
      pathWaves.push({
        yPos: h * 0.2 + i * h * 0.22,
        phase: i * (Math.PI / 4),
        speed: 0.003 + i * 0.001,
        amp: 30 + Math.random() * 20
      });
    }

    const drawHospFlow = () => {
      ctx.clearRect(0, 0, w, h);
      time += 0.006;

      fMouseX = lerp(fMouseX, targetFMouseX, 0.08);
      fMouseY = lerp(fMouseY, targetFMouseY, 0.08);

      // Rendering blueprints horizontal guidelines
      ctx.strokeStyle = "rgba(197, 168, 128, 0.012)";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      for (let y = 0; y < h; y += 60) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      // Draw bezier curves
      pathWaves.forEach((wv, idx) => {
        ctx.strokeStyle = `rgba(197, 168, 128, ${0.02 + idx * 0.015})`;
        ctx.lineWidth = 0.9;
        ctx.beginPath();

        let prevX = 0;
        let prevY = wv.yPos + Math.sin(time + wv.phase) * wv.amp;
        ctx.moveTo(prevX, prevY);

        for (let x = 10; x <= w; x += 15) {
          const cycle = (x / w) * Math.PI * 2.5 + time * wv.speed;
          const y = wv.yPos + Math.sin(cycle + wv.phase) * wv.amp;
          
          // Interaction highlight along coordinate hover
          const mDist = Math.sqrt((fMouseX - x) * (fMouseX - x) + (fMouseY - y) * (fMouseY - y));
          if (mDist < 120) {
            ctx.strokeStyle = `rgba(197, 168, 128, ${(1 - mDist / 120) * 0.32})`;
            ctx.lineWidth = 2.0;
          } else {
            ctx.strokeStyle = `rgba(197, 168, 128, ${0.025 + idx * 0.01})`;
            ctx.lineWidth = 0.9;
          }

          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(x, y);
          ctx.stroke();

          prevX = x;
          prevY = y;
        }
      });

      // Pointer spatial crosshair coordinates HUD overlay
      ctx.strokeStyle = "rgba(197, 168, 128, 0.04)";
      ctx.setLineDash([3, 8]);
      ctx.beginPath();
      ctx.moveTo(fMouseX, 0); ctx.lineTo(fMouseX, h);
      ctx.moveTo(0, fMouseY); ctx.lineTo(w, fMouseY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.font = "8px Outfit, Courier, monospace";
      ctx.textAlign = "left";
      ctx.fillText(`[GS-RESERVATION // INQUIRY_FLOW_ACTIVE]`, fMouseX + 15, fMouseY - 4);

      requestAnimationFrame(drawHospFlow);
    };
    drawHospFlow();
  }

  // E. Clean Design Blog Background (`clean-design-canvas`)
  const cleanCanvas = document.getElementById("clean-design-canvas");
  if (cleanCanvas && !reducedMotion) {
    let { ctx, w, h } = setupResponsiveCanvas(cleanCanvas);
    let time = 0;

    let mouseX = w / 2, mouseY = h / 2;
    let targetMouseX = w / 2, targetMouseY = h / 2;

    window.addEventListener("resize", () => {
      const res = setupResponsiveCanvas(cleanCanvas);
      ctx = res.ctx; w = res.w; h = res.h;
    });

    cleanCanvas.parentElement.addEventListener("mousemove", (e) => {
      const rect = cleanCanvas.parentElement.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    });

    const drawCleanGrid = () => {
      ctx.clearRect(0, 0, w, h);
      time += 0.004;

      mouseX = lerp(mouseX, targetMouseX, 0.07);
      mouseY = lerp(mouseY, targetMouseY, 0.07);

      // Rendering structural guidelines in white/gray
      ctx.strokeStyle = "rgba(255, 255, 255, 0.012)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let x = 0; x < w; x += 80) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += 80) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      // Render architectural geometry: Golden spiral elements
      const cx = w * 0.5;
      const cy = h * 0.5;
      ctx.strokeStyle = "rgba(0, 230, 167, 0.02)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(cx, cy, 180, 0, Math.PI * 2);
      ctx.rect(cx - 180, cy - 180, 360, 360);
      ctx.stroke();

      // Dynamic drafting lines extending to cursor
      ctx.strokeStyle = "rgba(0, 230, 167, 0.05)";
      ctx.setLineDash([4, 12]);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(mouseX, mouseY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = "rgba(139, 113, 255, 0.12)";
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 15, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.font = "8px Outfit, Courier, monospace";
      ctx.fillText(`[ALIGN // RATIO_GRID_STABLE]`, mouseX + 20, mouseY + 4);

      requestAnimationFrame(drawCleanGrid);
    };
    drawCleanGrid();
  }

  // F. Emotional Resonance Blog Background (`resonance-canvas`)
  const resonanceCanvas = document.getElementById("resonance-canvas");
  if (resonanceCanvas && !reducedMotion) {
    let { ctx, w, h } = setupResponsiveCanvas(resonanceCanvas);
    let time = 0;

    let mouseX = w / 2, mouseY = h / 2;
    let targetMouseX = w / 2, targetMouseY = h / 2;

    window.addEventListener("resize", () => {
      const res = setupResponsiveCanvas(resonanceCanvas);
      ctx = res.ctx; w = res.w; h = res.h;
    });

    resonanceCanvas.parentElement.addEventListener("mousemove", (e) => {
      const rect = resonanceCanvas.parentElement.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    });

    // Sensory particles floating
    const waves = [];
    for (let i = 0; i < 25; i++) {
      waves.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2.5 + 1.0,
        phase: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.03
      });
    }

    const drawResonance = () => {
      ctx.clearRect(0, 0, w, h);
      time += 0.015;

      mouseX = lerp(mouseX, targetMouseX, 0.05);
      mouseY = lerp(mouseY, targetMouseY, 0.05);

      // Render elegant fluid circles tracing mouse coords
      ctx.globalCompositeOperation = "screen";
      const rad = 210 + Math.sin(time * 0.8) * 30;
      const grad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, rad);
      grad.addColorStop(0, "rgba(139, 113, 255, 0.035)");
      grad.addColorStop(0.5, "rgba(0, 230, 167, 0.012)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";

      // Render sensory points
      waves.forEach((pt, idx) => {
        pt.y += Math.sin(time * 0.2 + idx) * 0.2;
        const cycle = Math.sin(time * pt.speed + pt.phase);
        
        // Attract to mouse
        const dx = mouseX - pt.x;
        const dy = mouseY - pt.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 180) {
          pt.x += dx * 0.005;
          pt.y += dy * 0.005;
        }

        const size = pt.size + cycle * 0.8;
        ctx.fillStyle = idx % 2 === 0 ? "rgba(139, 113, 255, 0.08)" : "rgba(0, 230, 167, 0.08)";
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(drawResonance);
    };
    drawResonance();
  }

  // G. Visibility vs Trusted Blog Background (`dual-state-canvas`)
  const dualCanvas = document.getElementById("dual-state-canvas");
  if (dualCanvas && !reducedMotion) {
    let { ctx, w, h } = setupResponsiveCanvas(dualCanvas);
    let time = 0;

    let mouseX = w / 2, mouseY = h / 2;
    let targetMouseX = w / 2, targetMouseY = h / 2;

    window.addEventListener("resize", () => {
      const res = setupResponsiveCanvas(dualCanvas);
      ctx = res.ctx; w = res.w; h = res.h;
    });

    dualCanvas.parentElement.addEventListener("mousemove", (e) => {
      const rect = dualCanvas.parentElement.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    });

    // Create scattered left (noise) nodes and stable right (trust) nodes
    const noiseNodes = [];
    const trustNodes = [];

    for (let i = 0; i < 12; i++) {
      noiseNodes.push({
        x: w * 0.25 + (Math.random() - 0.5) * 160,
        y: h * 0.5 + (Math.random() - 0.5) * 200,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 2 + 1.2
      });

      trustNodes.push({
        x: w * 0.75 + (Math.random() - 0.5) * 80, // much closely clustered (high structural trust!)
        y: h * 0.5 + (Math.random() - 0.5) * 140,
        phase: Math.random() * Math.PI,
        size: Math.random() * 3 + 2.0
      });
    }

    const drawDualState = () => {
      ctx.clearRect(0, 0, w, h);
      time += 0.02;

      mouseX = lerp(mouseX, targetMouseX, 0.06);
      mouseY = lerp(mouseY, targetMouseY, 0.06);

      // Render Visibility (noise) Left Nodes
      ctx.strokeStyle = "rgba(139, 113, 255, 0.025)";
      ctx.lineWidth = 0.6;
      noiseNodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce inside left region boundaries
        if (node.x < 20 || node.x > w * 0.48) node.vx *= -1;
        if (node.y < 20 || node.y > h - 20) node.vy *= -1;

        // Draw scattered lines
        noiseNodes.forEach(other => {
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 85) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });

        ctx.fillStyle = "rgba(139, 113, 255, 0.1)";
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render Trust (aligned signal) Right Nodes
      ctx.strokeStyle = "rgba(0, 230, 167, 0.05)";
      ctx.lineWidth = 0.8;
      trustNodes.forEach((node, idx) => {
        // Slow structured oscillation
        const ox = node.x + Math.sin(time * 0.15 + idx) * 3;
        const oy = node.y + Math.cos(time * 0.15 + idx) * 3;

        trustNodes.forEach((other, oIdx) => {
          const ooy = other.y + Math.cos(time * 0.15 + oIdx) * 3;
          const oox = other.x + Math.sin(time * 0.15 + oIdx) * 3;

          const dx = ox - oox;
          const dy = oy - ooy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            // Draw clean linked mesh paths
            ctx.beginPath();
            ctx.moveTo(ox, oy);
            ctx.lineTo(oox, ooy);
            ctx.stroke();
          }
        });

        ctx.fillStyle = "rgba(0, 230, 167, 0.2)";
        ctx.beginPath();
        ctx.arc(ox, oy, node.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Interactive link bridge bridging noise to trust on mouse cursor overlay
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(w * 0.48, 0);
      ctx.lineTo(w * 0.48, h);
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
      ctx.font = "7px Outfit, monospace";
      ctx.fillText("[DUAL-STATE SYSTEM // NOISE VS SIGNAL]", w * 0.48 - 85, h - 15);

      requestAnimationFrame(drawDualState);
    };
    drawDualState();
  }

  // ═══ GLOBAL SEAMLESS TRANSITIONS & PREDICTIVE PREFETCHING ═══
  const handlePageTransitions = () => {
    // 1. Fade-in on DOMContentLoaded
    document.body.classList.add("loaded");

    // 2. Predictive Link Prefetcher (65ms hover threshold)
    const activePrefetches = new Set();
    const links = document.querySelectorAll("a");

    links.forEach(link => {
      const href = link.getAttribute("href");
      // Skip empty, hash anchors, non-local, or external links
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto") || href.startsWith("tel")) return;

      let hoverTimer = null;

      link.addEventListener("mouseenter", () => {
        if (activePrefetches.has(href)) return;
        
        hoverTimer = setTimeout(() => {
          // Verify that prefetch doesn't already exist
          if (!document.querySelector(`link[rel='prefetch'][href='${href}']`)) {
            const prefetchLink = document.createElement("link");
            prefetchLink.rel = "prefetch";
            prefetchLink.href = href;
            document.head.appendChild(prefetchLink);
            activePrefetches.add(href);
          }
        }, 65); // 65ms hover threshold
      });

      link.addEventListener("mouseleave", () => {
        if (hoverTimer) {
          clearTimeout(hoverTimer);
          hoverTimer = null;
        }
      });

      // 3. Zero-Latency Page Exit Transition
      link.addEventListener("click", e => {
        // Skip if modifier key is pressed (Ctrl, Shift, Meta) or target is new window
        if (e.defaultPrevented || e.ctrlKey || e.shiftKey || e.metaKey || link.target === "_blank") return;

        e.preventDefault();
        document.body.classList.add("page-transition-out");

        setTimeout(() => {
          window.location.href = href;
        }, 160); // 160ms exit delay
      });
    });
  };
  handlePageTransitions();

  // ═══ AMBIENT CURSOR GLOW SYSTEM ═══
  const initAmbientTelemetry = () => {
    // Create element for ambient pointer glow overlay if not existing
    let glowEl = document.querySelector(".ambient-glow-backlight");
    if (!glowEl) {
      glowEl = document.createElement("div");
      glowEl.className = "ambient-glow-backlight";
      document.body.appendChild(glowEl);
    }

    // Set page specific theme class to body for adaptive glows
    if (window.location.pathname.includes("hospitality")) {
      document.body.classList.add("hospitality-page");
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let curX = mouseX;
    let curY = mouseY;
    let pointerActive = false;
    let excitation = 1.0;
    let lastX = 0, lastY = 0;
    let idleTime = 0;

    // Track pointer coordinates
    window.addEventListener("mousemove", e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      pointerActive = true;
      idleTime = 0;
      document.body.classList.add("pointer-active");

      // Calculate micro-movement excitation rate
      const dx = mouseX - lastX;
      const dy = mouseY - lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);
      excitation = Math.min(2.5, excitation + speed * 0.03);
      lastX = mouseX;
      lastY = mouseY;
    }, { passive: true });

    // Handle touch pointer coordinates
    window.addEventListener("touchmove", e => {
      if (e.touches && e.touches[0]) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
        pointerActive = true;
        idleTime = 0;
        document.body.classList.add("pointer-active");
      }
    }, { passive: true });

    // Glow LERP Loop (high performance 60FPS)
    const updateTelemetry = () => {
      // Linear Interpolation (LERP) for heavy lag/momentum physics
      curX += (mouseX - curX) * 0.06;
      curY += (mouseY - curY) * 0.06;

      // Update body CSS custom variables for the radial glow gradient
      document.documentElement.style.setProperty("--cursor-x", `${curX}px`);
      document.documentElement.style.setProperty("--cursor-y", `${curY}px`);

      // Decay kinetic excitation down to baseline 1.0
      excitation = 1.0 + (excitation - 1.0) * 0.94;

      // Idle wave telemetry generator fallback (for mobile or mouse static)
      idleTime += 0.015;
      if (!pointerActive) {
        // Drifting Lissajous pattern to move glow organically
        const driftX = (window.innerWidth / 2) + Math.sin(idleTime * 0.7) * (window.innerWidth * 0.25);
        const driftY = (window.innerHeight / 2) + Math.cos(idleTime * 0.5) * (window.innerHeight * 0.2);
        mouseX = driftX;
        mouseY = driftY;
      }

      requestAnimationFrame(updateTelemetry);
    };
    updateTelemetry();
  };
  initAmbientTelemetry();

});


