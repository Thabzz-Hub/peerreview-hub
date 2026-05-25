/* ═══════════════════════════════════════════════
   PEERREVIEW HUB — MAIN JS
═══════════════════════════════════════════════ */

// ── Custom Cursor ──
const cursor = document.getElementById('cursor');
const trail  = document.getElementById('cursorTrail');
let mx = 0, my = 0, tx = 0, ty = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  if (cursor) { cursor.style.left = mx + 'px'; cursor.style.top = my + 'px'; }
});

function animateCursor() {
  tx += (mx - tx) * 0.12;
  ty += (my - ty) * 0.12;
  if (trail) { trail.style.left = tx + 'px'; trail.style.top = ty + 'px'; }
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a, button, [data-hover]').forEach(el => {
  el.addEventListener('mouseenter', () => { if (trail) { trail.style.width = '56px'; trail.style.height = '56px'; } });
  el.addEventListener('mouseleave', () => { if (trail) { trail.style.width = '36px'; trail.style.height = '36px'; } });
});

// ── Sticky Nav ──
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// ── Mobile Nav Toggle ──
const navToggle = document.getElementById('navToggle');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    const links = document.querySelector('.nav-links');
    if (links) {
      const open = links.style.display === 'flex';
      links.style.display = open ? '' : 'flex';
      links.style.flexDirection = 'column';
      links.style.position = 'fixed';
      links.style.top = '72px';
      links.style.left = '0'; links.style.right = '0';
      links.style.background = 'rgba(8,12,20,0.98)';
      links.style.padding = '24px 5vw';
      links.style.backdropFilter = 'blur(20px)';
      links.style.borderBottom = '1px solid rgba(255,255,255,0.07)';
      if (open) links.style.display = '';
    }
  });
}

// ── Reveal on Scroll ──
function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}
initReveal();

// ── Counter Animation ──
function animateCounter(el, target, suffix = '') {
  let start = 0;
  const duration = 1600;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const counters = document.querySelectorAll('.stat-num[data-target]');
if (counters.length) {
  const cObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const target = parseInt(e.target.dataset.target);
        animateCounter(e.target, target);
        cObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => cObs.observe(c));
}

// ── Hero Canvas — Animated Network ──
const canvas = document.getElementById('heroCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, dots = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const TEAL = '0,229,195';
  const N = window.innerWidth < 768 ? 40 : 80;

  for (let i = 0; i < N; i++) {
    dots.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
    });
  }

  let mouseX = W / 2, mouseY = H / 2;
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Background gradient
    const grd = ctx.createRadialGradient(W * 0.5, H * 0.3, 0, W * 0.5, H * 0.3, W * 0.7);
    grd.addColorStop(0, 'rgba(0,30,50,0.8)');
    grd.addColorStop(1, 'rgba(8,12,20,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    // Update & draw dots
    dots.forEach(d => {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > W) d.vx *= -1;
      if (d.y < 0 || d.y > H) d.vy *= -1;

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${TEAL},0.5)`;
      ctx.fill();
    });

    // Connect nearby dots
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 120;
        if (dist < maxDist) {
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(${TEAL},${(1 - dist / maxDist) * 0.15})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // Mouse interaction
      const dx = dots[i].x - mouseX;
      const dy = dots[i].y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        ctx.beginPath();
        ctx.moveTo(dots[i].x, dots[i].y);
        ctx.lineTo(mouseX, mouseY);
        ctx.strokeStyle = `rgba(${TEAL},${(1 - dist / 150) * 0.25})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    requestAnimationFrame(draw);
  }
  draw();
}

// ── Progress bars (Dashboard) ──
function initProgressBars() {
  const fills = document.querySelectorAll('.progress-fill[data-width]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = e.target.dataset.width;
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  fills.forEach(f => { f.style.width = '0'; obs.observe(f); });
}
initProgressBars();

// ── Upload drag & drop ──
document.querySelectorAll('.upload-area').forEach(area => {
  ['dragenter', 'dragover'].forEach(ev =>
    area.addEventListener(ev, e => { e.preventDefault(); area.classList.add('drag-over'); })
  );
  ['dragleave', 'drop'].forEach(ev =>
    area.addEventListener(ev, e => { e.preventDefault(); area.classList.remove('drag-over'); })
  );
  area.addEventListener('drop', e => {
    const files = e.dataTransfer.files;
    if (files.length) handleUpload(area, files[0]);
  });
  area.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.docx,.txt';
    input.onchange = () => { if (input.files.length) handleUpload(area, input.files[0]); };
    input.click();
  });
});

function handleUpload(area, file) {
  area.innerHTML = `
    <div class="upload-icon">✅</div>
    <p class="upload-text">${file.name}</p>
    <p class="upload-sub">${(file.size / 1024).toFixed(1)} KB · Ready for review</p>
  `;
  area.style.borderColor = 'var(--teal)';
  area.style.background = 'var(--teal-dim)';
}

// ── Smooth active nav link ──
document.querySelectorAll('.nav-link').forEach(link => {
  if (link.href === window.location.href) link.classList.add('active');
  else link.classList.remove('active');
});
