/* ==========================================
   ChilliensNFT — script.js
   ========================================== */

// ── CONFIG ──────────────────────────────────
const TWEET_URL = "https://twitter.com/ChilliensNFT";
// Set mint date here (YYYY, MonthIndex 0-11, DD, HH, MM, SS)
const MINT_DATE = new Date(2026, 8, 15, 20, 0, 0); // 15 Sep 2026, 20:00

// ── STARFIELD CANVAS ─────────────────────────
(function initStarfield() {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let stars = [];
  let W, H;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createStars(n) {
    stars = [];
    for (let i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 + 0.3,
        alpha: Math.random() * 0.6 + 0.2,
        speed: Math.random() * 0.015 + 0.005,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    // Deep space gradient bg
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#16240d");
    grad.addColorStop(0.5, "#1c2b12");
    grad.addColorStop(1, "#fdf6e3");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    stars.forEach((s) => {
      const twinkle = s.alpha * (0.7 + 0.3 * Math.sin(t * s.speed + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
      ctx.fill();
    });
  }

  let raf;
  function loop(t) {
    draw(t * 0.001);
    raf = requestAnimationFrame(loop);
  }

  resize();
  createStars(200);
  loop(0);

  window.addEventListener("resize", () => {
    resize();
    createStars(200);
  });
})();

// ── HEADER SCROLL ────────────────────────────
const header = document.getElementById("site-header");
window.addEventListener("scroll", () => {
  header?.classList.toggle("scrolled", window.scrollY > 60);
  // Back to top
  document.getElementById("back-to-top")?.classList.toggle("visible", window.scrollY > 400);
});

// ── MOBILE HAMBURGER ─────────────────────────
const hamburger = document.getElementById("hamburger");
const mainNav = document.getElementById("main-nav");

hamburger?.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  hamburger.classList.toggle("open", isOpen);
  hamburger.setAttribute("aria-expanded", String(isOpen));
});

// Close nav when a link is clicked
mainNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    hamburger?.classList.remove("open");
    hamburger?.setAttribute("aria-expanded", "false");
  });
});

// ── BACK TO TOP ──────────────────────────────
document.getElementById("back-to-top")?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ── ACTIVE NAV HIGHLIGHT ─────────────────────
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".main-nav a");

const observerNav = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((l) => l.classList.remove("active"));
        const active = document.querySelector(`.main-nav a[href="#${entry.target.id}"]`);
        active?.classList.add("active");
      }
    });
  },
  { rootMargin: "-50% 0px -50% 0px" }
);

sections.forEach((s) => observerNav.observe(s));

// ── SCROLL REVEAL ────────────────────────────
const revealElements = document.querySelectorAll(".reveal");
const observerReveal = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observerReveal.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealElements.forEach((el) => observerReveal.observe(el));

// ── COUNTER ANIMATION ────────────────────────
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const isDecimal = target % 1 !== 0;
  const duration = 1800;
  const step = 16;
  const steps = duration / step;
  let current = 0;

  const timer = setInterval(() => {
    current += target / steps;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = isDecimal ? current.toFixed(2) : Math.round(current).toLocaleString();
  }, step);
}

const statNums = document.querySelectorAll(".stat-num[data-target]");
const observerStats = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observerStats.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);
statNums.forEach((el) => observerStats.observe(el));

// Mint date TBA — countdown removed

// ── TASK CARDS ───────────────────────────────
const postTask = document.getElementById("task-post");
if (postTask) postTask.href = TWEET_URL;

document.querySelectorAll(".task-card[id]").forEach((card) => {
  card.addEventListener("click", () => {
    card.classList.add("completed");
  });
});

// Force reset checkbox and lock form on page load (so it resets on refresh)
window.addEventListener("DOMContentLoaded", () => {
  const confirmCheckbox = document.getElementById("confirm-tasks");
  const form = document.getElementById("wl-form");
  if (form) form.reset(); // clear inputs
  if (confirmCheckbox) confirmCheckbox.checked = false; // uncheck
});

// ── WHITELIST FORM ───────────────────────────
const form = document.getElementById("wl-form");
const messageEl = document.getElementById("wl-message");
const WALLET_REGEX = /^0x[a-fA-F0-9]{40}$/;

// Form lock logic
const confirmCheckbox = document.getElementById("confirm-tasks");
const xUsernameInput = document.getElementById("x-username");
const walletInput = document.getElementById("wallet");
const submitBtn = document.getElementById("wl-submit");

if (confirmCheckbox) {
  confirmCheckbox.addEventListener("change", (e) => {
    const isChecked = e.target.checked;
    if (xUsernameInput) xUsernameInput.disabled = !isChecked;
    if (walletInput) walletInput.disabled = !isChecked;
    if (submitBtn) submitBtn.disabled = !isChecked;
  });
}

// Generate or retrieve a persistent device fingerprint stored in localStorage
function getDeviceId() {
  const KEY = "chilliens-device-id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    const rand = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    const ua = navigator.userAgent;
    const lang = navigator.language;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    id = btoa(encodeURIComponent(`${rand}|${ua}|${lang}|${tz}`)).slice(0, 64);
    localStorage.setItem(KEY, id);
  }
  return id;
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const xUsernameRaw = document.getElementById("x-username").value.trim();
  const xUsername = xUsernameRaw.replace(/^@/, "");
  const wallet = document.getElementById("wallet").value.trim();
  const confirmed = document.getElementById("confirm-tasks").checked;
  const submitBtn = document.getElementById("wl-submit");

  // ── Client-side validation ──
  if (!xUsername) {
    showMessage("Please enter your X username first 👽", "error");
    document.getElementById("x-username").focus();
    return;
  }
  if (!WALLET_REGEX.test(wallet)) {
    showMessage("Invalid wallet address. Format: 0x followed by 40 hex characters.", "error");
    document.getElementById("wallet").focus();
    return;
  }
  if (!confirmed) {
    showMessage("Please confirm you've completed all tasks first!", "error");
    return;
  }

  // ── Loading state ──
  submitBtn.disabled = true;
  submitBtn.querySelector(".btn-text").textContent = "Submitting...";

  try {
    const res = await fetch("/api/whitelist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xUsername, wallet, deviceId: getDeviceId() }),
    });

    const data = await res.json();

    if (res.status === 201) {
      showMessage("🎉 You're in! Welcome to the Chilliens whitelist 🛸💚", "success");
      form.reset();
    } else if (res.status === 409) {
      showMessage("❌ This wallet is already registered! 👽", "error");
    } else if (res.status === 429) {
      const msg = data.error === "ip_limit"
        ? "❌ This IP address has already submitted a whitelist entry."
        : "❌ This device has already submitted a whitelist entry.";
      showMessage(msg, "error");
    } else if (res.status === 400) {
      showMessage(`❌ ${data.message || "Invalid input. Please check your details."}`, "error");
    } else {
      showMessage("❌ Something went wrong. Please try again!", "error");
    }

  } catch (err) {
    showMessage("❌ Network error. Check your connection and try again.", "error");
    console.error("[WL Submit Error]", err);
  }

  submitBtn.disabled = false;
  submitBtn.querySelector(".btn-text").textContent = "Submit for GTD Whitelist 🛸";
});

function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = "wl-message " + type;
  messageEl.style.animation = "none";
  requestAnimationFrame(() => {
    messageEl.style.animation = "fade-in 0.3s ease";
  });
}

// ── NFT CARD TILT ─────────────────────────────
document.querySelectorAll(".nft-card").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
    card.style.transform = `translateY(-8px) rotateX(${y}deg) rotateY(${x}deg)`;
    card.style.transition = "transform 0.05s linear";
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
    card.style.transition = "transform 0.3s ease";
  });
});

// ── HERO CARD PARALLAX ───────────────────────
const heroCard = document.querySelector(".hero-nft-card");
if (heroCard) {
  document.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 10;
    const y = (e.clientY / window.innerHeight - 0.5) * 6;
    heroCard.style.transform = `translateY(${y - 6}px) rotate(${x * 0.3}deg)`;
  });
}
