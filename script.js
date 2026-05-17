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

  // Header scroll
  const check = () => header?.classList.toggle("scrolled", scrollY > 32);
  check();
  addEventListener("scroll", check, { passive: true });

  // Mobile menu
  const close = () => {
    document.body.classList.remove("menu-open");
    panel?.classList.remove("open");
    panel?.setAttribute("aria-hidden", "true");
    toggle?.setAttribute("aria-expanded", "false");
  };
  toggle?.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    panel?.setAttribute("aria-hidden", String(open));
    panel?.classList.toggle("open", !open);
    document.body.classList.toggle("menu-open", !open);
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

  // Reveal
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("active"); io.unobserve(en.target); } });
  }, { threshold: 0.08, rootMargin: "0px 0px -48px 0px" });
  document.querySelectorAll(".reveal-up").forEach(el => io.observe(el));

  // Stagger
  document.querySelectorAll("[data-stagger]").forEach(c => {
    [...c.children].forEach((ch, i) => { ch.style.transitionDelay = `${Math.min(i * 90, 540)}ms`; });
  });

  // Card hover glow effect
  document.querySelectorAll(".sys-card").forEach(card => {
    card.addEventListener("mousemove", e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    });
  });

  // Hero Graphic and Background 3D Parallax
  const hero = document.querySelector(".hero");
  const heroVisual = document.querySelector(".hero-visual");
  const motionGraphic = document.querySelector(".motion-graphic");
  const heroBg = document.querySelector(".hero-bg");

  if (hero && !reducedMotion) {
    hero.addEventListener("mousemove", (e) => {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Parallax for Background
      if (heroBg) {
        const bgX = ((x - centerX) / centerX) * 1.5; // Subtle movement
        const bgY = ((y - centerY) / centerY) * 1.5;
        heroBg.style.transform = `translate(${bgX}%, ${bgY}%) scale(1.05)`;
      }

      // Parallax for Dashboard Graphic
      if (heroVisual && motionGraphic) {
        const rotateX = ((y - centerY) / centerY) * -15; // Max 15 deg tilt
        const rotateY = ((x - centerX) / centerX) * 15; // Max 15 deg tilt
        motionGraphic.style.transform = `rotateX(${8 + rotateX}deg) rotateY(${rotateY}deg) translateZ(40px) scale(1.02)`;
      }
    });
    
    hero.addEventListener("mouseleave", () => {
      if (heroBg) heroBg.style.transform = `translate(0, 0) scale(1.05)`;
      if (motionGraphic) motionGraphic.style.transform = `rotateX(8deg) rotateY(0deg) translateZ(0) scale(1)`;
    });
  }

  // ══ GLOBAL MOTION GRAPHIC (MINIMAL STARFIELD) ══
  const canvas = document.getElementById("global-canvas");
  if (canvas && !reducedMotion) {
    const ctx = canvas.getContext("2d");
    let w, h;
    const stars = [];
    
    const initCanvas = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      stars.length = 0;
      const numStars = window.innerWidth < 768 ? 100 : 300;
      
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: Math.random() * w,
          size: Math.random() * 1.2 + 0.3,
          alpha: Math.random() * 0.4 + 0.1
        });
      }
    };

    window.addEventListener("resize", initCanvas);
    initCanvas();

    let mouseX = w / 2;
    let mouseY = h / 2;
    let targetX = w / 2;
    let targetY = h / 2;

    window.addEventListener("mousemove", (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    });

    const animate = () => {
      ctx.fillStyle = 'rgba(3, 4, 6, 0.12)';
      ctx.fillRect(0, 0, w, h);
      
      mouseX += (targetX - mouseX) * 0.03;
      mouseY += (targetY - mouseY) * 0.03;
      
      const cx = w / 2;
      const cy = h / 2;

      for (let i = 0; i < stars.length; i++) {
        let star = stars[i];
        star.z -= 1.5;
        
        if (star.z <= 0) {
          star.z = w;
          star.x = Math.random() * w;
          star.y = Math.random() * h;
        }

        const parallaxX = (mouseX - cx) * (1 - star.z / w) * 0.8;
        const parallaxY = (mouseY - cy) * (1 - star.z / w) * 0.8;

        const k = 128.0 / star.z;
        const x = (star.x + parallaxX - cx) * k + cx;
        const y = (star.y + parallaxY - cy) * k + cy;
        const size = star.size * k;

        if (x >= 0 && x <= w && y >= 0 && y <= h) {
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
          ctx.fill();
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
      w = probCanvas.width = probCanvas.offsetWidth;
      h = probCanvas.height = probCanvas.offsetHeight;
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
        const radius = h * 0.4 + (i * 40);
        for (let a = 0; a < Math.PI * 2; a += 0.1) {
          const noise = Math.sin(a * 5 + time * (i+1)) * 15;
          const x = cx + Math.cos(a + time * (i % 2 === 0 ? 1 : -1)) * (radius + noise);
          const y = cy + Math.sin(a + time * (i % 2 === 0 ? 1 : -1)) * (radius + noise) * 0.4;
          
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.stroke();
      }

      // Draw subtle connecting nodes
      for (let i = 0; i < 20; i++) {
        const a = (i / 20) * Math.PI * 2 + time * 2;
        const r = h * 0.4 + Math.sin(time * 3 + i) * 20;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r * 0.4;
        
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
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
      sW = sysCanvas.width = sysCanvas.offsetWidth;
      sH = sysCanvas.height = sysCanvas.offsetHeight;
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
            sCtx.strokeStyle = `rgba(255, 255, 255, ${o})`;
            sCtx.stroke();
          }
        }
      }

      // Draw nodes
      for (const p of proj) {
        sCtx.beginPath();
        sCtx.arc(p.x, p.y, Math.max(1, 1.5 * p.s), 0, Math.PI * 2);
        sCtx.fillStyle = `rgba(255, 255, 255, ${p.z > 0 ? 0.3 : 0.15})`;
        sCtx.fill();
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
      fW = founderCanvas.width = founderCanvas.offsetWidth;
      fH = founderCanvas.height = founderCanvas.offsetHeight;
    };
    window.addEventListener("resize", initFounder);
    initFounder();

    const drawFounder = () => {
      fCtx.clearRect(0, 0, fW, fH);
      fTime += 0.008;
      const cx = fW * 0.25; // Center on the left side (where emblem is)
      const cy = fH / 2;

      // Draw 3 concentric orbit rings with particles
      const rings = [
        { r: 120, count: 12, speed: 1, color: '255, 255, 255' },
        { r: 180, count: 18, speed: -0.7, color: '255, 255, 255' },
        { r: 240, count: 24, speed: 0.4, color: '255, 255, 255' }
      ];

      for (const ring of rings) {
        // Draw the ring path (faint)
        fCtx.beginPath();
        fCtx.ellipse(cx, cy, ring.r, ring.r * 0.35, 0, 0, Math.PI * 2);
        fCtx.strokeStyle = `rgba(${ring.color}, 0.04)`;
        fCtx.lineWidth = 0.5;
        fCtx.stroke();

        // Draw orbiting particles
        for (let i = 0; i < ring.count; i++) {
          const angle = (i / ring.count) * Math.PI * 2 + fTime * ring.speed;
          const px = cx + Math.cos(angle) * ring.r;
          const py = cy + Math.sin(angle) * ring.r * 0.35;
          const depth = Math.sin(angle);
          const size = 1 + depth * 0.5;
          const alpha = 0.15 + depth * 0.15;

          fCtx.beginPath();
          fCtx.arc(px, py, Math.max(0.5, size), 0, Math.PI * 2);
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
      pW = philCanvas.width = philCanvas.offsetWidth;
      pH = philCanvas.height = philCanvas.offsetHeight;
      pNodes.length = 0;
      for (let i = 0; i < pNumNodes; i++) {
        pNodes.push({
          x: Math.random() * pW,
          y: Math.random() * pH,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 2 + 1
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
            const o = (1 - dist / 150) * 0.15;
            pCtx.strokeStyle = `rgba(255, 255, 255, ${o})`;
            pCtx.stroke();
          }
        }
      }

      // Draw nodes
      for (const n of pNodes) {
        pCtx.beginPath();
        pCtx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        pCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        pCtx.fill();
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
      cW = ctaCanvas.width = ctaCanvas.offsetWidth;
      cH = ctaCanvas.height = ctaCanvas.offsetHeight;
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
      cTime += 0.01;

      const cx = cW / 2;
      const cy = cH / 2;

      // Mouse-reactive aurora blobs
      const blobs = [
        { x: cx + Math.sin(cTime) * 100, y: cy + Math.cos(cTime * 0.7) * 60, r: 200, color: 'rgba(255, 255, 255, 0.04)' },
        { x: cx + Math.cos(cTime * 0.8) * 80, y: cy + Math.sin(cTime * 1.2) * 50, r: 180, color: 'rgba(255, 255, 255, 0.03)' },
        { x: ctaMouseX, y: ctaMouseY, r: 150, color: 'rgba(255, 255, 255, 0.03)' }
      ];

      for (const b of blobs) {
        const grad = cCtx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        grad.addColorStop(0, b.color);
        grad.addColorStop(1, 'transparent');
        cCtx.fillStyle = grad;
        cCtx.fillRect(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
      }

      // Subtle ring
      const pulseR = 250 + Math.sin(cTime * 2) * 30;
      cCtx.beginPath();
      cCtx.arc(cx, cy, pulseR, 0, Math.PI * 2);
      cCtx.strokeStyle = `rgba(255, 255, 255, ${0.03 + Math.sin(cTime * 2) * 0.02})`;
      cCtx.lineWidth = 0.5;
      cCtx.stroke();

      requestAnimationFrame(drawCta);
    };
    drawCta();
  }

});
