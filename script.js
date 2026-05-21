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

  // ══ GLOBAL MOTION GRAPHIC (PREMIUM DRIFTING BOKEH PARTICLES) ══
  const canvas = document.getElementById("global-canvas");
  if (canvas && !reducedMotion) {
    const ctx = canvas.getContext("2d");
    let w, h;
    const stars = [];
    
    const initCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
      
      stars.length = 0;
      const numStars = w < 768 ? 40 : 130;
      
      for (let i = 0; i < numStars; i++) {
        const isPurple = Math.random() > 0.6;
        const vx = (Math.random() - 0.5) * 0.12;
        const vy = (Math.random() - 0.5) * 0.12;
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: vx,
          vy: vy,
          ox: vx,
          oy: vy,
          size: Math.random() * 2.2 + 0.4,
          alpha: Math.random() * 0.35 + 0.05,
          color: isPurple ? "139, 113, 255" : "0, 230, 167", // Accent purple vs Accent green
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
    const trail = [];

    window.addEventListener("mousemove", (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      
      if (!reducedMotion && Math.random() > 0.45) {
        trail.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 1.6,
          vy: (Math.random() - 0.5) * 1.6,
          size: Math.random() * 3.5 + 1.5,
          alpha: 0.7,
          color: Math.random() > 0.5 ? "0, 230, 167" : "139, 113, 255"
        });
      }
    });

    window.addEventListener("scroll", () => {
      targetScrollY = window.scrollY;
    }, { passive: true });

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      
      mouseX += (targetX - mouseX) * 0.02;
      mouseY += (targetY - mouseY) * 0.02;
      scrollYOffset += (targetScrollY - scrollYOffset) * 0.06;

      const scrollVelocity = targetScrollY - scrollYOffset;
      const warp = Math.min(Math.abs(scrollVelocity) * 0.03, 3);
      
      const cx = w / 2;
      const cy = h / 2;

      // Update positions and cache coordinates
      for (let i = 0; i < stars.length; i++) {
        let star = stars[i];
        
        // Elastic Repulsion from mouse cursor
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

        // Velocity dampening back to base cosmic drift speeds
        star.vx = star.vx * 0.94 + star.ox * 0.06;
        star.vy = star.vy * 0.94 + star.oy * 0.06;

        // Update positions (drift)
        star.x += star.vx;
        star.y += star.vy;
        
        // Boundary wrap
        if (star.x < 0) star.x = w;
        if (star.x > w) star.x = 0;
        if (star.y < 0) star.y = h;
        if (star.y > h) star.y = 0;

        // Interactive mouse parallax (strength proportional to particle size)
        const dx = (mouseX - cx) * 0.012 * (star.size / 2);
        const dy = (mouseY - cy) * 0.012 * (star.size / 2);
        
        // Scroll parallax offset (strength proportional to particle size for deep depth field)
        const scrollParallax = -scrollYOffset * 0.15 * (star.size / 2);

        star.drawX = star.x + dx;
        // Seamless wrap modulo math within the viewport height [0, h]
        star.drawY = (((star.y + dy + scrollParallax) % h) + h) % h;

        // Glowing pulse opacity
        star.currentAlpha = star.alpha * (0.5 + 0.5 * Math.sin(Date.now() * star.pulseSpeed + star.pulsePhase));
      }

      // Draw constellation links first (lines sit cleanly underneath particle cores)
      const maxDist = w < 768 ? 60 : 85;
      const maxDistSq = maxDist * maxDist;
      
      for (let i = 0; i < stars.length; i++) {
        const starA = stars[i];
        for (let j = i + 1; j < stars.length; j++) {
          const starB = stars[j];
          const ldx = starA.drawX - starB.drawX;
          const ldy = starA.drawY - starB.drawY;
          const distSq = ldx * ldx + ldy * ldy;
          
          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            const linkAlpha = (1 - dist / maxDist) * 0.12 * Math.min(starA.currentAlpha, starB.currentAlpha);
            
            ctx.beginPath();
            ctx.moveTo(starA.drawX, starA.drawY);
            ctx.lineTo(starB.drawX, starB.drawY);
            
            // Premium linear gradient matches star colors
            const grad = ctx.createLinearGradient(starA.drawX, starA.drawY, starB.drawX, starB.drawY);
            grad.addColorStop(0, `rgba(${starA.color}, ${linkAlpha})`);
            grad.addColorStop(1, `rgba(${starB.color}, ${linkAlpha})`);
            
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw soft glowing particles
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        
        ctx.beginPath();
        if (warp > 0.1 && !reducedMotion) {
          // Stretched ellipse vertical warp in scroll velocity direction
          const radiusY = star.size + warp * (star.size / 1.5);
          ctx.ellipse(star.drawX, star.drawY, star.size, radiusY, 0, 0, Math.PI * 2);
        } else {
          ctx.arc(star.drawX, star.drawY, star.size, 0, Math.PI * 2);
        }
        ctx.fillStyle = `rgba(${star.color}, ${star.currentAlpha})`;
        ctx.fill();

        // Core accent for larger particles
        if (star.size > 1.8 && i % 4 === 0) {
          ctx.beginPath();
          ctx.arc(star.drawX, star.drawY, star.size * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${star.currentAlpha * 1.5})`;
          ctx.fill();
        }
      }
      
      // Update and draw mouse trail particles
      if (!reducedMotion) {
        for (let i = trail.length - 1; i >= 0; i--) {
          const p = trail[i];
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= 0.025;
          p.size *= 0.95;
          
          if (p.alpha <= 0 || p.size < 0.5) {
            trail.splice(i, 1);
            continue;
          }
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
          ctx.fill();
          
          // Connective vector network line to the raw target pointer position
          const tdx = targetX - p.x;
          const tdy = targetY - p.y;
          const tdist = Math.sqrt(tdx * tdx + tdy * tdy);
          if (tdist < 60) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(targetX, targetY);
            ctx.strokeStyle = `rgba(${p.color}, ${p.alpha * (1 - tdist / 60) * 0.25})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw futuristic fluid HUD tracking ring around the smoothed mouse position
      if (!reducedMotion) {
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 230, 167, 0.15)`;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 15 + Math.sin(Date.now() * 0.003) * 3, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(139, 113, 255, 0.08)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
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
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!r.ok) throw new Error();
      btn.textContent = "Message Sent ✓";
      form.reset();
      setTimeout(() => { btn.textContent = txt; btn.disabled = false; }, 3000);
    } catch {
      btn.textContent = "Try Again";
      setTimeout(() => { btn.textContent = txt; btn.disabled = false; }, 3000);
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
        const res = await fetch('blog/posts.json');
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
        btn.style.transform = "";
        btn.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
      });
    });
  };
  initCursor();

});
