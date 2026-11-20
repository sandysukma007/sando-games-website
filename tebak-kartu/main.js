"use strict";

/* ---------- koleksi set kartu ---------- */
const SETS = [
  { id: "delta", name: "Delta Emas", rarity: "legenda",
    desc: "Set termewah di toko: bingkai emas berhias permata dan kartu bergambar penuh bernuansa rune kuno." },
  { id: "natal", name: "Kartu Natal", rarity: "epik",
    desc: "Edisi terbatas Event Natal: Santa, Mrs Claus, dan kawan-kawan. Hanya bisa diklaim dengan login pada 25 Desember." },
  { id: "topeng", name: "Karnaval Topeng", rarity: "epik",
    desc: "Kemeriahan pesta topeng Venesia dengan warna marun dan emas yang dramatis." },
  { id: "kacapatri", name: "Kaca Patri", rarity: "epik",
    desc: "Setiap kartu seperti jendela kaca patri katedral: panel warna tegas yang berkilau." },
  { id: "nusantara", name: "Nusantara", rarity: "epik",
    desc: "Para penjaga pusaka berbusana khas Nusantara, lengkap dengan keris dan panji merah putih." },
  { id: "orbit", name: "Penjaga Orbit", rarity: "langka",
    desc: "Kartografer langit dan penjaga rasi bintang dari ruang angkasa yang tenang." },
];
const RARITY_LABEL = { langka: "Langka", epik: "Epik", legenda: "Legenda" };

(function setupSets() {
  const root = document.querySelector("[data-sets]");
  if (!root) return;
  const tabs = root.querySelector(".set-tabs");
  const cards = root.querySelector(".set-cards");
  const rarity = root.querySelector("[data-rarity]");
  const name = root.querySelector("[data-name]");
  const desc = root.querySelector("[data-desc]");
  let current = -1;

  function show(i, focus) {
    if (i === current) return;
    current = i;
    const s = SETS[i];
    tabs.querySelectorAll(".set-tab").forEach((t, k) => {
      t.setAttribute("aria-selected", k === i ? "true" : "false");
      t.tabIndex = k === i ? 0 : -1;
      if (k === i && focus) t.focus();
    });
    cards.classList.add("swap");
    setTimeout(() => {
      // urutan: kiri (Q), kanan (A), tengah depan (K)
      cards.innerHTML = [1, 2, 0]
        .map((n) => `<img src="../assets/sets/${s.id}_${n}.webp" alt="Kartu ${s.name}">`)
        .join("");
      rarity.className = "rarity " + s.rarity;
      rarity.textContent = RARITY_LABEL[s.rarity];
      name.textContent = s.name;
      desc.textContent = s.desc;
      requestAnimationFrame(() => cards.classList.remove("swap"));
    }, current === -1 ? 0 : 180);
  }

  SETS.forEach((s, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "set-tab";
    b.setAttribute("role", "tab");
    b.textContent = s.name;
    b.addEventListener("click", () => show(i));
    tabs.appendChild(b);
  });
  tabs.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    show((current + (e.key === "ArrowRight" ? 1 : SETS.length - 1)) % SETS.length, true);
  });
  show(0);
})();

/* ---------- demo permainan: ingat, ikuti kocokan, tebak ---------- */
(function setupDemo() {
  const board = document.getElementById("board");
  const startBtn = document.getElementById("start");
  const msg = document.getElementById("msg");
  const scoreEl = document.getElementById("score");
  const streakEl = document.getElementById("streak");
  const livesEl = document.getElementById("lives");
  if (!board) return;

  const FACES = {
    KH: "K hati", QS: "Q sekop", JC: "J keriting", "7H": "7 hati",
    "9S": "9 sekop", "10D": "10 wajik", "5C": "5 keriting", "8D": "8 wajik",
  };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  let score = 0, streak = 0, lives = 3, busy = false, slots = [], targetSlot = null;

  function setMsg(html, tone) {
    msg.innerHTML = html;
    msg.className = "table-msg" + (tone ? " " + tone : "");
  }
  function hud() {
    scoreEl.textContent = score;
    streakEl.textContent = streak;
    livesEl.textContent = "♥".repeat(lives) + "♡".repeat(3 - lives);
    livesEl.setAttribute("aria-label", lives + " nyawa");
  }

  function layout() {
    const n = slots.length;
    if (!n) return;
    const w = board.clientWidth;
    const cw = Math.min(140, (w - 12 * (n - 1)) / (n + 0.4));
    board.style.setProperty("--cw", cw + "px");
    slots.forEach((s) => { s.el.style.left = ((s.pos + 0.5) / n) * 100 + "%"; });
  }
  window.addEventListener("resize", layout);

  function deal(n, faces) {
    board.innerHTML = "";
    slots = faces.map((f, i) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "slot";
      el.disabled = true;
      el.setAttribute("aria-label", "Kartu " + (i + 1));
      el.innerHTML =
        `<div class="flip"><div class="face"><img src="../assets/cards/${f}.webp" alt="" draggable="false"></div>` +
        `<div class="back"><img src="../assets/backs/ukiran-koral.webp" alt="" draggable="false"></div></div>`;
      board.appendChild(el);
      const s = { el, face: f, pos: i };
      el.addEventListener("click", () => pick(s));
      return s;
    });
    layout();
  }

  async function round() {
    busy = true;
    const n = streak < 3 ? 3 : streak < 6 ? 4 : 5;
    const faces = shuffle(Object.keys(FACES)).slice(0, n);
    deal(n, faces);
    targetSlot = slots[Math.floor(Math.random() * n)];
    targetSlot.el.classList.add("target");
    setMsg(`Ingat kartu ini: <b>${FACES[targetSlot.face]}</b>`);
    await wait(1500);

    targetSlot.el.classList.remove("target");
    slots.forEach((s) => s.el.classList.add("down"));
    setMsg("Mengocok...");
    await wait(500);

    // kocok: tukar posisi dua kartu berulang kali, makin cepat setiap tebakan beruntun
    const move = reduceMotion ? 0.05 : Math.max(0.16, 0.42 - streak * 0.03);
    board.style.setProperty("--move", move + "s");
    const swaps = 4 + Math.min(streak, 8);
    for (let k = 0; k < swaps; k++) {
      const a = slots[Math.floor(Math.random() * n)];
      let b = a;
      while (b === a) b = slots[Math.floor(Math.random() * n)];
      [a.pos, b.pos] = [b.pos, a.pos];
      a.el.classList.add("lift");
      layout();
      await wait(move * 1000 + 40);
      a.el.classList.remove("lift");
    }

    setMsg(`Di mana <b>${FACES[targetSlot.face]}</b>? Ketuk kartunya!`);
    // urutan fokus keyboard mengikuti posisi di meja
    slots.slice().sort((x, y) => x.pos - y.pos).forEach((s, i) => {
      s.el.disabled = false;
      s.el.classList.add("pickable");
      s.el.setAttribute("aria-label", "Kartu posisi " + (i + 1));
      board.appendChild(s.el);
    });
    busy = false;
  }

  async function pick(s) {
    if (busy || !s.el.classList.contains("pickable")) return;
    busy = true;
    slots.forEach((x) => { x.el.classList.remove("pickable"); x.el.disabled = true; });
    s.el.classList.remove("down");
    if (s === targetSlot) {
      streak++;
      const gain = 10 * streak;
      score += gain;
      s.el.classList.add("right");
      setMsg(streak >= 3 ? `Luar biasa! +${gain} (beruntun ${streak}×)` : `Benar! +${gain}`, "good");
    } else {
      streak = 0;
      lives--;
      s.el.classList.add("wrong");
      await wait(350);
      targetSlot.el.classList.remove("down");
      targetSlot.el.classList.add("right");
      setMsg("Meleset! Kartunya ada di sini.", "bad");
    }
    hud();
    await wait(1500);
    if (lives <= 0) {
      setMsg(`Permainan selesai! Skor kamu <b>${score}</b>. Versi lengkapnya jauh lebih seru!`);
      startBtn.textContent = "Main lagi";
      startBtn.hidden = false;
      busy = false;
      return;
    }
    round();
  }

  startBtn.addEventListener("click", () => {
    score = 0; streak = 0; lives = 3;
    hud();
    startBtn.hidden = true;
    round();
  });

  // tampilan awal: tiga kartu tertutup
  deal(3, ["KH", "QS", "7H"]);
  slots.forEach((s) => s.el.classList.add("down"));
})();
