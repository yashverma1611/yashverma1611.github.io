/**
 * YASH KUMAR VERMA — CINEMATIC DATA ANALYST PORTFOLIO
 * Core Orchestration: Lenis Smooth Scroll, GSAP Choreography, WebGL/Canvas Embers, 3D Tilt, Audio FX
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // ==========================================================================
  // 1. SOUND FX ENGINE (Web Audio API)
  // ==========================================================================
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = false;
      this.initButton();
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    initButton() {
      const btn = document.getElementById('sound-toggle');
      if (!btn) return;

      btn.addEventListener('click', () => {
        this.init();
        this.enabled = !this.enabled;
        btn.classList.toggle('active', this.enabled);
        const text = btn.querySelector('.sound-status');
        if (text) text.textContent = this.enabled ? 'AUDIO: ON' : 'AUDIO: OFF';

        if (this.enabled) {
          this.playBeep(440, 0.08, 'sine', 0.15);
        }
      });
    }

    playBeep(freq = 440, duration = 0.05, type = 'sine', vol = 0.1) {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        // Audio policy restrictions fallback silently
      }
    }

    hoverSound() {
      this.playBeep(620, 0.04, 'triangle', 0.04);
    }

    clickSound() {
      this.playBeep(880, 0.06, 'sine', 0.08);
    }

    terminalKey() {
      this.playBeep(320 + Math.random() * 120, 0.03, 'square', 0.02);
    }
  }

  const sound = new SoundEngine();

  // ==========================================================================
  // 2. LENIS SMOOTH SCROLL & GSAP TICKER
  // ==========================================================================
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.8,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  // Smooth anchor navigation with Lenis
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId.startsWith('#')) return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        sound.clickSound();
        if (lenis) {
          lenis.scrollTo(target, { offset: -60, duration: 1.4 });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // ==========================================================================
  // 3. CANVAS CELESTIAL BACKGROUND & EMBER CONSTELLATION
  // ==========================================================================
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const PARTICLE_COUNT = Math.min(width < 768 ? 40 : 85, 100);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35 - 0.15, // slight upward float
        radius: Math.random() * 1.8 + 0.6,
        isEmber: Math.random() > 0.65,
        alpha: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
      });
    }

    let mouseX = width / 2;
    let mouseY = height / 2;
    window.addEventListener('pointermove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function renderCanvas() {
      ctx.clearRect(0, 0, width, height);

      // Render & update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        p.alpha += Math.sin(Date.now() * p.twinkleSpeed) * 0.008;
        const boundedAlpha = Math.max(0.1, Math.min(0.85, p.alpha));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        if (p.isEmber) {
          ctx.fillStyle = `rgba(255, 122, 60, ${boundedAlpha})`;
          ctx.shadowColor = 'rgba(255, 90, 38, 0.7)';
          ctx.shadowBlur = 8;
        } else {
          ctx.fillStyle = `rgba(47, 217, 198, ${boundedAlpha * 0.75})`;
          ctx.shadowColor = 'rgba(47, 217, 198, 0.5)';
          ctx.shadowBlur = 4;
        }

        ctx.fill();
        ctx.shadowBlur = 0;

        // Subtle proximity connection to mouse cursor
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.strokeStyle = p.isEmber
            ? `rgba(255, 90, 38, ${0.2 * (1 - dist / 120)})`
            : `rgba(47, 217, 198, ${0.15 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }

      requestAnimationFrame(renderCanvas);
    }
    renderCanvas();
  }

  // ==========================================================================
  // 4. CUSTOM DUAL-RING MAGNETIC CURSOR
  // ==========================================================================
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorOutline = document.querySelector('.cursor-outline');

  if (cursorDot && cursorOutline && window.matchMedia('(pointer: fine)').matches) {
    let mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let outlinePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    window.addEventListener('pointermove', (e) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
      cursorDot.style.left = `${mousePos.x}px`;
      cursorDot.style.top = `${mousePos.y}px`;
    });

    function updateCursor() {
      // Smooth lerp following
      outlinePos.x += (mousePos.x - outlinePos.x) * 0.16;
      outlinePos.y += (mousePos.y - outlinePos.y) * 0.16;

      cursorOutline.style.left = `${outlinePos.x}px`;
      cursorOutline.style.top = `${outlinePos.y}px`;

      requestAnimationFrame(updateCursor);
    }
    requestAnimationFrame(updateCursor);

    // Hover state on interactive elements
    const hoverTargets = document.querySelectorAll(
      'a, button, input, textarea, .project-card-3d, .dossier-card, .metric-card, .edu-card'
    );
    hoverTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
        sound.hoverSound();
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
      });
    });

    // Magnetic pull effect on primary buttons
    const magneticElements = document.querySelectorAll('.btn-magnetic, .sound-toggle-btn');
    magneticElements.forEach((mag) => {
      mag.addEventListener('mousemove', (e) => {
        const rect = mag.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        mag.style.transform = `translate(${x * 0.28}px, ${y * 0.28}px)`;
      });
      mag.addEventListener('mouseleave', () => {
        mag.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  // ==========================================================================
  // 5. 3D CARD PERSPECTIVE TILT
  // ==========================================================================
  const cards3D = document.querySelectorAll('.project-card-3d');
  cards3D.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5.5;
      const rotateY = ((x - centerX) / centerX) * 5.5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
    });
  });

  // ==========================================================================
  // 6. PRELOADER & CINEMATIC INTRO TIMELINE
  // ==========================================================================
  const preloader = document.getElementById('preloader');
  const countDisplay = document.getElementById('load-val');
  const barFill = document.getElementById('load-bar-fill');
  let currentLoad = 0;

  const loadInterval = setInterval(() => {
    currentLoad += Math.floor(Math.random() * 15) + 8;
    if (currentLoad >= 100) {
      currentLoad = 100;
      clearInterval(loadInterval);

      if (countDisplay) countDisplay.textContent = '100';
      if (barFill) barFill.style.width = '100%';

      setTimeout(startCinematicIntro, 350);
    } else {
      if (countDisplay) countDisplay.textContent = String(currentLoad).padStart(2, '0');
      if (barFill) barFill.style.width = `${currentLoad}%`;
    }
  }, 90);

  function startCinematicIntro() {
    if (preloader) preloader.classList.add('loaded');

    // Header reveal
    const header = document.querySelector('header.site-header');
    if (header) header.classList.add('visible');

    // GSAP Hero intro reveal
    if (window.gsap) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.to('.status-capsule', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 0.15,
      })
        .to(
          '.hero-headline .split-mask span',
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            stagger: 0.12,
            ease: 'power4.out',
          },
          '-=0.5'
        )
        .to(
          '.hero-tagline',
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
          },
          '-=0.6'
        )
        .to(
          '.hero-cta-group',
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
          },
          '-=0.5'
        );
    }
  }

  // ==========================================================================
  // 7. PARALLAX SILHOUETTE & SCENE SCROLL REVEALS
  // ==========================================================================
  const mtnLayers = document.querySelectorAll('.mtn-layer');
  window.addEventListener(
    'scroll',
    () => {
      const scrollY = window.scrollY;
      mtnLayers.forEach((layer) => {
        const speed = parseFloat(layer.getAttribute('data-speed') || '0.2');
        layer.style.transform = `translateY(${scrollY * speed * 0.35}px)`;
      });
    },
    { passive: true }
  );

  // ScrollTrigger Animations
  if (window.gsap && window.ScrollTrigger) {
    // Reveal section titles
    gsap.utils.toArray('.scene-title').forEach((title) => {
      gsap.from(title, {
        scrollTrigger: {
          trigger: title,
          start: 'top 85%',
        },
        y: 35,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
      });
    });

    // Reveal metric cards with count-up feel
    gsap.utils.toArray('.metric-card').forEach((card, idx) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
        },
        y: 30,
        opacity: 0,
        duration: 0.7,
        delay: idx * 0.12,
        ease: 'power3.out',
      });
    });

    // Reveal project cards
    gsap.utils.toArray('.project-card-3d').forEach((proj, idx) => {
      gsap.from(proj, {
        scrollTrigger: {
          trigger: proj,
          start: 'top 82%',
        },
        y: 40,
        opacity: 0,
        duration: 0.85,
        delay: idx * 0.15,
        ease: 'power3.out',
      });
    });

    // Reveal timeline items
    gsap.utils.toArray('.timeline-dossier-item').forEach((item) => {
      gsap.from(item, {
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
        },
        x: -25,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });
    });

    // Animate timeline vertical line height
    gsap.to('.trajectory-timeline::before', {
      scrollTrigger: {
        trigger: '.trajectory-timeline',
        start: 'top 70%',
        end: 'bottom 85%',
        scrub: 1,
      },
      height: '100%',
    });
  }

  // ==========================================================================
  // 8. INTERACTIVE RETRO-FUTURISTIC TERMINAL
  // ==========================================================================
  const terminalInput = document.getElementById('terminal-input');
  const terminalOutput = document.getElementById('terminal-output');

  if (terminalInput && terminalOutput) {
    const COMMAND_RESPONSES = {
      help: `AVAILABLE COMMANDS:
  <span class="cyan">about</span>       - Summary of analytical background & focus
  <span class="cyan">skills</span>      - Technical toolkit (QGIS, Tableau, Excel, GenAI)
  <span class="cyan">projects</span>    - Case studies & key project stats
  <span class="cyan">experience</span>  - Training, internships & simulations
  <span class="cyan">education</span>   - Academic credentials (BCA & boards)
  <span class="cyan">contact</span>     - Direct dispatch details & social links
  <span class="cyan">sudo hire</span>   - Immediate recruitment protocol
  <span class="cyan">clear</span>       - Wipe terminal display`,

      about: `<span class="ember">[DOSSIER: YASH KUMAR VERMA]</span>
Role: Data Analyst & GIS Specialist
Location: Lucknow, India
Mission: Transforming unstructured datasets into operational intelligence.
Expertise: Digitized 15,000+ building polygons, engineered customer segmentations (2,200+ profiles), and designed AI collections logic with responsible guardrails.`,

      skills: `<span class="cyan">[TECHNICAL ARSENAL]</span>
• <span class="gold">GIS & Spatial Analysis:</span> QGIS, Georeferencing, Polygon Digitization, Attribute Architecture (15K+ buildings)
• <span class="gold">BI & Dashboards:</span> Tableau, Advanced Microsoft Excel, Data Validation, Source Sheet Structuring
• <span class="gold">AI & Modeling:</span> GenAI-Assisted Missing-Data Treatment, Synthetic Data, Customer Risk Profiling
• <span class="gold">Core Tech:</span> Database Management (BCA Coursework), Responsible AI Guardrails, Executive Documentation`,

      projects: `<span class="ember">[SELECTED OPERATIONS]</span>
1. <span class="gold">iFood Customer Personality Analysis</span>
   - 2,200+ customers segmented across spend, campaigns, and channels.
   - Result: Key discovery that 45% of total spend is allocated to wine.
2. <span class="gold">GIS Building Survey (Aircode Technologies)</span>
   - 15,000+ building structures audited in QGIS.
   - Flagged uncovered structures & structured dense attribute data.
3. <span class="gold">Password Strength Analyzer</span>
   - Custom rules engine identifying cybersecurity vulnerabilities.`,

      experience: `<span class="cyan">[CAREER TRAJECTORY & SIMULATIONS]</span>
• <span class="gold">Jul – Aug 2026:</span> GIS Trainee — Aircode Technologies Pvt. Ltd. (6-week field audit of 15K+ buildings)
• <span class="gold">March 2026:</span> UNICEF Program — Digital Productivity with AI (Graduated with 95% score)
• <span class="gold">2026:</span> TCS — AI for All (Applied AI, data analytics & cybersecurity)
• <span class="gold">Forage:</span> Tata AI-Powered Data Analytics Job Simulation (Delinquency EDA & bias guardrails)
• <span class="gold">Forage:</span> Deloitte Data Analytics Job Simulation (Tableau visualization & Excel modeling)`,

      education: `<span class="ember">[ACADEMIC FOUNDATION]</span>
• <span class="gold">BCA (Bachelor's of Computer Application):</span> City College of Management, Tiwariganj (2025–2028 | Currently in 4th Sem)
• <span class="gold">12th Science Stream:</span> Mahavir Inter College, Aliganj (U.P. Board | 77.4%)
• <span class="gold">10th:</span> Mahavir Inter College, Aliganj (U.P. Board | 88.67%)`,

      contact: `<span class="cyan">[COMMUNICATION CHANNELS]</span>
Email:    <a href="mailto:90yashkumar@gmail.com" class="ember">90yashkumar@gmail.com</a>
LinkedIn: <a href="https://www.linkedin.com/in/yash-kumar-verma-7405a4405/" target="_blank" class="cyan">linkedin.com/in/yash-kumar-verma-7405a4405</a>
GitHub:   <a href="https://github.com/yashverma1611" target="_blank" class="gold">github.com/yashverma1611</a>`,

      'sudo hire': `<span class="cyan">INITIATING PRIORITY CANDIDATE PROTOCOL...</span>
<span class="ember">STATUS:</span> Verification successful.
Yash Kumar Verma is available for immediate hire and internship engagements.
Dispatching connection channel to: <a href="mailto:90yashkumar@gmail.com" class="gold">90yashkumar@gmail.com</a>`,
    };

    terminalInput.addEventListener('keydown', (e) => {
      sound.terminalKey();

      if (e.key === 'Enter') {
        const rawCmd = terminalInput.value.trim();
        const cmd = rawCmd.toLowerCase();
        terminalInput.value = '';

        if (!cmd) return;

        if (cmd === 'clear') {
          terminalOutput.innerHTML = `<span class="cyan">TERMINAL RESET.</span> Type <span class="ember">'help'</span> for instructions.\n`;
          return;
        }

        const userLine = `\n<span class="cyan">guest@yash-verma:~$</span> ${rawCmd}\n`;
        const response =
          COMMAND_RESPONSES[cmd] ||
          `<span style="color:#FF5F56;">Command not recognized: "${rawCmd}". Type '<span class="cyan">help</span>' for a list of directives.</span>`;

        terminalOutput.innerHTML += userLine + response + '\n';
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
      }
    });
  }

  // ==========================================================================
  // 9. DIRECT DISPATCH MESSAGE FORM
  // ==========================================================================
  const dispatchForm = document.getElementById('direct-dispatch-form');
  if (dispatchForm) {
    dispatchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sound.clickSound();

      const name = document.getElementById('msg-name').value.trim();
      const email = document.getElementById('msg-email').value.trim();
      const text = document.getElementById('msg-body').value.trim();

      const subject = encodeURIComponent(`[Portfolio Inquiry] From ${name}`);
      const body = encodeURIComponent(`${text}\n\n— Sender: ${name} (${email})`);

      window.location.href = `mailto:90yashkumar@gmail.com?subject=${subject}&body=${body}`;
    });
  }
});
