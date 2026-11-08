const mobileToggle = document.querySelector(".mobile-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const mobileDropdownToggle = document.querySelector(".mobile-dropdown-toggle");
const mobileDropdownMenu = document.querySelector(".mobile-dropdown-menu");
const backToTop = document.querySelector(".back-to-top");
const yearEl = document.getElementById("year");
const reveals = document.querySelectorAll(".reveal");


// Desktop Bible Teaching dropdown: click to open/close without leaving excess blank space.
const desktopDropdown = document.querySelector(".header .nav-dropdown");
const desktopDropdownToggle = desktopDropdown?.querySelector(".dropdown-toggle");
if (desktopDropdown && desktopDropdownToggle) {
  desktopDropdownToggle.setAttribute("aria-expanded", "false");
  desktopDropdownToggle.addEventListener("click", (event) => {
    event.preventDefault();
    const isOpen = desktopDropdown.classList.toggle("open");
    desktopDropdownToggle.setAttribute("aria-expanded", String(isOpen));
  });
  document.addEventListener("click", (event) => {
    if (!desktopDropdown.contains(event.target)) {
      desktopDropdown.classList.remove("open");
      desktopDropdownToggle.setAttribute("aria-expanded", "false");
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      desktopDropdown.classList.remove("open");
      desktopDropdownToggle.setAttribute("aria-expanded", "false");
    }
  });
}

// Responsive navigation with accessible expanded state and reliable close behaviour.
if (mobileToggle && mobileMenu) {
  mobileToggle.setAttribute("aria-expanded", "false");
  mobileToggle.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("active");
    mobileToggle.setAttribute("aria-expanded", String(open));
  });
  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("active");
      mobileToggle.setAttribute("aria-expanded", "false");
    });
  });
  document.addEventListener("click", (event) => {
    if (!mobileMenu.contains(event.target) && !mobileToggle.contains(event.target)) {
      mobileMenu.classList.remove("active");
      mobileToggle.setAttribute("aria-expanded", "false");
    }
  });
}
if (mobileDropdownToggle && mobileDropdownMenu) {
  mobileDropdownToggle.setAttribute("aria-expanded", "false");
  mobileDropdownToggle.addEventListener("click", () => {
    const open = mobileDropdownMenu.classList.toggle("active");
    mobileDropdownToggle.setAttribute("aria-expanded", String(open));
  });
}

// Account for the persistent header when a menu link jumps to a section.
function alignHashTarget() {
  if (!window.location.hash || window.location.hash.length < 2) return;
  const id = decodeURIComponent(window.location.hash.slice(1));
  const target = document.getElementById(id);
  if (!target) return;
  const header = document.querySelector(".header");
  const offset = header ? header.getBoundingClientRect().height + 12 : 12;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
}
window.addEventListener("load", () => requestAnimationFrame(alignHashTarget), { once: true });
window.addEventListener("hashchange", () => requestAnimationFrame(alignHashTarget));
// Back to top
window.addEventListener("scroll", () => {
  if (backToTop) backToTop.classList.toggle("active", window.scrollY > 600);
}, { passive: true });
if (backToTop) {
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Reveal content when it enters the viewport.
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });
  reveals.forEach((el) => observer.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("active"));
}

// Animated cinematic gold particles, sparkles, and light streaks across the full-page background.
(() => {
  const canvas = document.querySelector(".ambient-particles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let width = 0, height = 0, particles = [], raf = 0;
  const density = () => Math.min(width < 700 ? 12 : 22, Math.max(width < 700 ? 7 : 12, Math.floor((width * height) / (width < 700 ? 65000 : 52000))));

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.1);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles = Array.from({ length: density() }, () => {
      const roll = Math.random();
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: roll < .62 ? Math.random() * 1.8 + .8 : Math.random() * 2.8 + 1.4,
        vx: (Math.random() - .5) * (width < 700 ? .55 : (roll < .7 ? .65 : 1.25)),
        vy: -(Math.random() * (width < 700 ? .72 : .95) + .22),
        alpha: Math.random() * .55 + .35,
        phase: Math.random() * Math.PI * 2,
        type: roll < .55 ? "ember" : roll < .79 ? "spark" : roll < .92 ? "streak" : "ring",
        length: Math.random() * 18 + 8
      };
    });
  }

  let lastFrame = 0;
  function draw(time) {
    if (!reduceMotion && time - lastFrame < 42) {
      raf = requestAnimationFrame(draw);
      return;
    }
    lastFrame = time;
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -24) { p.y = height + 18; p.x = Math.random() * width; }
      if (p.x < -24) p.x = width + 18;
      if (p.x > width + 24) p.x = -18;

      const pulse = .52 + .48 * Math.sin(time * .0025 + p.phase);
      const a = Math.min(1, p.alpha * pulse);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      if (p.type === "streak") {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 194, 82, ${a * .8})`;
        ctx.lineWidth = 1 + p.r * .22;
        ctx.shadowBlur = 6;
        ctx.shadowColor = "rgba(255, 175, 55, .9)";
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * p.length, p.y + p.length);
        ctx.stroke();
      } else if (p.type === "spark") {
        ctx.strokeStyle = `rgba(255, 222, 153, ${a})`;
        ctx.lineWidth = 1;
        ctx.shadowBlur = 6;
        ctx.shadowColor = "rgba(255, 182, 61, .95)";
        ctx.beginPath();
        ctx.moveTo(p.x - p.r * 2.7, p.y);
        ctx.lineTo(p.x + p.r * 2.7, p.y);
        ctx.moveTo(p.x, p.y - p.r * 2.7);
        ctx.lineTo(p.x, p.y + p.r * 2.7);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * .7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 247, 213, ${a})`;
        ctx.fill();
      } else if (p.type === "ring") {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 188, 73, ${a * .78})`;
        ctx.lineWidth = 1.2;
        ctx.shadowBlur = 5;
        ctx.shadowColor = "rgba(255, 167, 43, .8)";
        ctx.arc(p.x, p.y, p.r * (1.3 + pulse * .8), 0, Math.PI * 2);
        ctx.stroke();
      } else {
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4.5);
        glow.addColorStop(0, `rgba(255, 246, 205, ${a})`);
        glow.addColorStop(.25, `rgba(255, 190, 75, ${a * .85})`);
        glow.addColorStop(1, "rgba(255, 161, 42, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 226, 155, ${a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    if (!reduceMotion) raf = requestAnimationFrame(draw);
  }

  resize();
  if (reduceMotion) draw(0);
  else raf = requestAnimationFrame(draw);
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else if (!reduceMotion) raf = requestAnimationFrame(draw);
  });
})();
