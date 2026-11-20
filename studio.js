"use strict";

// daftar kaiju (urutan arena 01-15)
const KAIJU = [
  ["kerocon", "Kerocon"], ["ravager", "Ravager"], ["toxicus", "Toxicus"], ["voltar", "Voltar"],
  ["titanus", "Titanus"], ["ignaroth", "Ignaroth"], ["abyssal", "Abyssal"], ["dreadwing", "Dreadwing"],
  ["colossor", "Colossor"], ["necrox", "Necrox"], ["frostmaw", "Frostmaw"], ["oblivion", "Oblivion"],
  ["behemoth", "Behemoth"], ["apocalypse", "Apocalypse"], ["the_alpha", "The Alpha"],
];

(function roster() {
  const list = document.querySelector(".roster-list");
  if (!list) return;
  list.innerHTML = KAIJU.map(([id, name], i) =>
    `<li><span class="r-no">${String(i + 1).padStart(2, "0")}</span>` +
    `<img src="assets/kaiju/${id}.webp" alt="${name}" loading="lazy" width="180" height="180">` +
    `<b>${name}</b></li>`).join("");
})();

// muncul halus saat digulir
(function reveal() {
  const els = document.querySelectorAll(".section-head, .about-text, .founders, .stats, .game, .roster, .principle-grid article, .support-card, .contact");
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  els.forEach((e) => e.classList.add("reveal"));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  els.forEach((e) => io.observe(e));
})();
