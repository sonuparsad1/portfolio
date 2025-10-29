/* ======================================================
   THEME PERSISTENCE • 3D PARALLAX HERO • CARD TILT
====================================================== */
(function () {
  const radios = ['blue','purple','gold','coral','noir','sand'];
  const saved = localStorage.getItem('site-theme');
  if(saved && radios.includes(saved)){
    const el = document.getElementById(saved);
    if(el) el.checked = true;
  }

  radios.forEach(id=>{
    const r = document.getElementById(id);
    if(!r) return;
    r.addEventListener('change', ()=> { if(r.checked) localStorage.setItem('site-theme', id); });
  });

  // keyboard support
  document.querySelectorAll('.theme-ui .swatch').forEach(s=>{
    s.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); s.click(); }
    });
  });

  // show year
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // parallax 3D hero
  const hero = document.getElementById('hero');
  const title = document.getElementById('mainTitle');
  const avatar = document.getElementById('avatar');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if(!reduce && hero){
    hero.addEventListener('mousemove', (e)=>{
      const rect = hero.getBoundingClientRect();
      const cx = rect.left + rect.width/2;
      const cy = rect.top + rect.height/2;
      const dx = (e.clientX - cx) / (rect.width/2);
      const dy = (e.clientY - cy) / (rect.height/2);
      title.style.transform = `translateZ(40px) rotateX(${(-dy*6).toFixed(2)}deg) rotateY(${(dx*6).toFixed(2)}deg)`;
      avatar.style.transform = `translateZ(60px) rotateY(${(dx*9).toFixed(2)}deg) rotateX(${(-dy*8).toFixed(2)}deg)`;
    });
    hero.addEventListener('mouseleave', ()=>{
      title.style.transform = 'translateZ(40px) rotateX(0deg) rotateY(0deg)';
      avatar.style.transform = 'translateZ(60px) rotateX(0deg) rotateY(0deg)';
    });
  }

  // card tilt
  document.querySelectorAll('.card').forEach(card=>{
    if(reduce) return;
    card.addEventListener('pointermove', (ev)=>{
      const rect = card.getBoundingClientRect();
      const px = (ev.clientX - rect.left) / rect.width;
      const py = (ev.clientY - rect.top) / rect.height;
      const rx = ((py - 0.5) * 10);
      const ry = ((px - 0.5) * 10) * -1;
      card.style.transform = `translateY(-8px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(6px)`;
    });
    card.addEventListener('pointerleave', ()=> card.style.transform = '');
  });

  // mobile tilt
  if('ontouchstart' in window && !reduce){
    window.addEventListener('deviceorientation', (ev)=>{
      const gamma = ev.gamma || 0;
      const beta = ev.beta || 0;
      title.style.transform = `translateZ(40px) rotateX(${(-beta/6).toFixed(2)}deg) rotateY(${(gamma/6).toFixed(2)}deg)`;
      avatar.style.transform = `translateZ(60px) rotateY(${(gamma/4).toFixed(2)}deg) rotateX(${(-beta/4).toFixed(2)}deg)`;
    }, { passive: true });
  }
})(); // ✅ closes first block properly


/* ======================================================
   INTERACTIVE BACKGROUND + RIPPLE EFFECT
====================================================== */
(() => {
  const canvas = document.getElementById('topParticles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  let width, height;
  let particles = [];
  let mouse = { x: 0, y: 0 };
  let hue = getThemeHue();

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight * 0.45;
  }

  function createParticles(count = 50) {
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2 + 1,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.6 + 0.2
      });
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > width) p.dx *= -1;
      if (p.y < 0 || p.y > height) p.dy *= -1;
      const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      const glow = Math.max(0, 1 - dist / 200);
      ctx.beginPath();
      ctx.fillStyle = `hsla(${hue}, 90%, 60%, ${p.alpha + glow * 0.5})`;
      ctx.arc(p.x, p.y, p.r + glow * 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function getThemeHue() {
    const theme = localStorage.getItem('site-theme') || 'blue';
    switch (theme) {
      case 'blue': return 210;
      case 'purple': return 270;
      case 'gold': return 45;
      case 'coral': return 10;
      case 'noir': return 180;
      case 'sand': return 30;
      default: return 200;
    }
  }

  // theme hue update
  document.querySelectorAll('input[name="theme"]').forEach(radio => {
    radio.addEventListener('change', () => { hue = getThemeHue(); });
  });

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  function animate() {
    drawParticles();
    requestAnimationFrame(animate);
  }

  // Click ripple
  window.addEventListener('click', e => {
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = `${e.clientX - 10}px`;
    ripple.style.top = `${e.clientY - 10}px`;
    ripple.style.backgroundColor = `hsla(${hue}, 90%, 60%, 0.6)`;
    ripple.style.boxShadow = `0 0 15px hsla(${hue}, 90%, 60%, 0.8)`;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 800);
  });

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  resize();
  createParticles();
  animate();
})(); // ✅ separate, closed


/* ======================================================
   ENHANCED INTRO LOADER
====================================================== */
window.addEventListener("load", () => {
  const intro = document.getElementById("introLoader");
  if (!intro) return;

  const hideIntro = () => {
    intro.classList.add("fade-out");
    setTimeout(() => intro.remove(), 1000);
  };

  setTimeout(hideIntro, 4000);
});
// ===========================
// MOUSE TRAIL EFFECT
// ===========================
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const trail = [];
  const maxTrail = 20;

  window.addEventListener('mousemove', (e) => {
    const dot = document.createElement('div');
    dot.className = 'mouse-dot';
    dot.style.left = `${e.clientX}px`;
    dot.style.top = `${e.clientY}px`;

    document.body.appendChild(dot);
    trail.push(dot);

    if (trail.length > maxTrail) {
      const old = trail.shift();
      old.remove();
    }

    // Fade and shrink dots
    setTimeout(() => {
      dot.style.transform = 'scale(0)';
      dot.style.opacity = '0';
    }, 20);

    setTimeout(() => dot.remove(), 600);
  });
})();

// new section
// ===========================
// MOUSE TRAIL EFFECT
// ===========================
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const trail = [];
  const maxTrail = 20;

  window.addEventListener('mousemove', (e) => {
    const dot = document.createElement('div');
    dot.className = 'mouse-dot';
    dot.style.left = `${e.clientX}px`;
    dot.style.top = `${e.clientY}px`;

    document.body.appendChild(dot);
    trail.push(dot);

    if (trail.length > maxTrail) {
      const old = trail.shift();
      old.remove();
    }

    setTimeout(() => {
      dot.style.transform = 'scale(0)';
      dot.style.opacity = '0';
    }, 20);

    setTimeout(() => dot.remove(), 600);
  });
})();

// /* ======================================================
//    TYPING NEON INTRO EFFECT
// ====================================================== */
// (() => {
//   const typingText = document.getElementById("typingText");
//   if (!typingText) return;

//   setTimeout(() => {
//     const messages = [
//       "AI & ML Enthusiast ⚡",
//       "Web Developer 💻",
//       "Innovator & Creator 🚀",
//       "Patent Writer ✍️"
//     ];

//     let msgIndex = 0;

//     function getThemeColor() {
//       const theme = localStorage.getItem("site-theme") || "blue";
//       switch (theme) {
//         case "blue": return 210;
//         case "purple": return 270;
//         case "gold": return 45;
//         case "coral": return 10;
//         case "noir": return 180;
//         case "sand": return 30;
//         default: return 200;
//       }
//     }

//     function typeMessage() {
//       typingText.textContent = "";
//       const msg = messages[msgIndex];
//       let i = 0;

//       const hue = getThemeColor();
//       typingText.style.color = `hsl(${hue}, 90%, 70%)`;
//       typingText.style.textShadow = `
//         0 0 5px hsl(${hue}, 90%, 70%),
//         0 0 10px hsl(${hue}, 90%, 60%),
//         0 0 20px hsl(${hue}, 90%, 50%)
//       `;

//       const typingInterval = setInterval(() => {
//         typingText.textContent = msg.slice(0, i);
//         i++;

//         if (i > msg.length) {
//           clearInterval(typingInterval);
//           setTimeout(() => {
//             msgIndex = (msgIndex + 1) % messages.length;
//             typeMessage();
//           }, 2000);
//         }
//       }, 100);
//     }

//     typeMessage();
//   }, 4000);
// })();
/* ======================================================
   SIMPLE TYPING EFFECT (MATCHES SITE THEME)
====================================================== */
/* ======================================================
   SIMPLE TYPING EFFECT — MATCHES CURRENT THEME COLOR
====================================================== */
(function () {
  const typingElement = document.getElementById('typingText') || (() => {
    const hero = document.getElementById('hero') || document.body;
    const el = document.createElement('h2');
    el.id = 'typingText';
    el.className = 'typing-text';
    hero.appendChild(el);
    return el;
  })();

  // Map theme to color (matches your theme UI)
  function getThemeColor() {
    const theme = localStorage.getItem('site-theme') || 'blue';
    const map = {
      blue: '#38bdf8',   // cyan-blue
      purple: '#a855f7', // purple
      gold: '#facc15',   // gold
      coral: '#fb7185',  // coral
      noir: '#4b5563',   // grayish-black
      sand: '#d6d3d1'    // sand
    };
    return map[theme] || '#38bdf8';
  }

  // Apply color dynamically when theme changes
  function applyColor() {
    typingElement.style.color = getThemeColor();
  }

  document.querySelectorAll('input[name="theme"]').forEach(radio => {
    radio.addEventListener('change', applyColor);
  });

  // Typing effect
  const words = ["AI Developer", "Machine Learning Engineer", "Web Developer", "Innovator"];
  let wordIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function type() {
    const current = words[wordIndex];
    typingElement.textContent = current.substring(0, charIndex);

    applyColor(); // ensure color matches theme

    if (!deleting && charIndex < current.length) {
      charIndex++;
      setTimeout(type, 100);
    } else if (deleting && charIndex > 0) {
      charIndex--;
      setTimeout(type, 60);
    } else {
      deleting = !deleting;
      if (!deleting) wordIndex = (wordIndex + 1) % words.length;
      setTimeout(type, 800);
    }
  }

  // Start typing after intro hides or immediately
  window.addEventListener("load", () => {
    const intro = document.getElementById("introLoader");
    if (intro) {
      setTimeout(() => type(), 4200); // wait for intro to finish
    } else {
      type();
    }
  });
})();

// ===========================
// THEME VIDEO FILTER SYNC
// ===========================
const overlay = document.getElementById('video-overlay');
const themes = {
  blue: "rgba(45, 212, 191, 0.3)",     // cool aqua glow
  purple: "rgba(168, 85, 247, 0.3)",   // vivid violet
  gold: "rgba(234, 179, 8, 0.25)",     // warm bright gold
  coral: "rgba(244, 114, 182, 0.25)",  // soft pink-coral
  noir: "rgba(30, 30, 30, 0.55)",      // darker for contrast
  sand: "rgba(217, 180, 130, 0.18)"    // **fixed lighter brown tint**
};

document.querySelectorAll('.swatch').forEach(swatch => {
  swatch.addEventListener('click', () => {
    const themeName = swatch.classList[1];
    document.body.setAttribute('data-theme', themeName);
    overlay.style.background = themes[themeName];
  });
});
