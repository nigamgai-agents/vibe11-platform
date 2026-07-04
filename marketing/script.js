// ===== Vibe11 marketing site interactions =====

// Sticky nav background on scroll
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 24);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Scroll-reveal animations
const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// Waitlist form — Formspree backend
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xvzjdnvr";

const form = document.getElementById("waitlist-form");
const note = document.getElementById("form-note");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = form.email.value.trim();
    if (!email) return;

    const button = form.querySelector("button");
    button.disabled = true;
    button.textContent = "Reserving…";

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`Formspree responded ${res.status}`);

      button.textContent = "You're in ✓";
      form.email.disabled = true;
      note.textContent = "▸ agent slot reserved — we'll be in touch soon";
      note.classList.add("success");
    } catch (err) {
      button.disabled = false;
      button.textContent = "Get early access";
      note.textContent = "▸ something broke — retry, or email hello@vibe11.ai";
    }
  });
}
