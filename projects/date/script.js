const assets = {
  icons: {
    calendar: "assets/icons/calendar-heart.png",
    map: "assets/icons/map-pin.png",
    coffee: "assets/icons/coffee-cup.png",
    food: "assets/icons/food-plate.png",
    beer: "assets/icons/beer-locked.png",
    lock: "assets/icons/padlock.png",
    star: "assets/icons/quest-star.png",
    speech: "assets/icons/speech-bubble.png",
    placeFsm: "assets/icons/place-fsm.png",
    placeOzluce: "assets/icons/place-ozluce.png",
    placeGorukle: "assets/icons/place-gorukle.png",
  },
  sprites: {
    yusuf: "assets/sprites/character-green-khaki.png",
  },
};

const dialogueLines = [
  "Merhaba Tuana Ela Aytekin. Oteki adiyla, 8. sinifta bana acilan kiz. Simdilik Ela ile devam edelim.",
  "Benimle bayagi bir konustun, ama artik konusma limitini yenilemen gerekiyor. Limiti yenilemek icin benimle yeni bir date ayarlamali ve bu gorevin son adimina kadar gelmelisin.",
];

const dates = [
  { id: "2026-07-08", label: "8 Temmuz", day: "Carsamba", locked: false },
  { id: "2026-07-09", label: "9 Temmuz", day: "Persembe", locked: true },
  { id: "2026-07-10", label: "10 Temmuz", day: "Cuma", locked: false },
  { id: "2026-07-11", label: "11 Temmuz", day: "Cumartesi", locked: true },
  { id: "2026-07-12", label: "12 Temmuz", day: "Pazar", locked: false },
  { id: "2026-07-13", label: "13 Temmuz", day: "Pazartesi", locked: false },
  { id: "2026-07-14", label: "14 Temmuz", day: "Sali", locked: true },
  { id: "2026-07-15", label: "15 Temmuz", day: "Carsamba", locked: false },
  { id: "2026-07-16", label: "16 Temmuz", day: "Persembe", locked: true },
  { id: "2026-07-17", label: "17 Temmuz", day: "Cuma", locked: false },
];

const places = [
  { id: "fsm", name: "FSM", time: "19.00", icon: assets.icons.placeFsm },
  { id: "ozluce", name: "Ozluce", time: "18.30", icon: assets.icons.placeOzluce },
  { id: "gorukle", name: "Gorukle", time: "18.00", icon: assets.icons.placeGorukle },
];

const activities = [
  { id: "tea-coffee", label: "Cay Kahve", icon: assets.icons.coffee, locked: false },
  { id: "food", label: "Yemek", icon: assets.icons.food, locked: false },
  {
    id: "beer",
    label: "Bira",
    icon: assets.icons.beer,
    locked: true,
    note: "Bu secenegi acmak icin once diger secenekleri tamamlamalisiniz",
  },
];

const characters = [
  {
    id: "yusuf",
    name: "Yusuf Terzi",
    sub: "Gorev icin hazir",
    image: assets.sprites.yusuf,
    locked: false,
  },
  {
    id: "others",
    name: "Diger Adaylar",
    sub: "...",
    locked: true,
  },
];

const outfitOptions = {
  top: [
    {
      id: "white",
      label: "Beyaz t-shirt",
      icon: "assets/sprites/top-white-tshirt.png",
    },
    {
      id: "gray",
      label: "Gri t-shirt",
      icon: "assets/sprites/top-gray-tshirt.png",
    },
    {
      id: "green",
      label: "Koyu yesil gomlek",
      icon: "assets/sprites/top-green-shirt.png",
    },
  ],
  bottom: [
    {
      id: "white",
      label: "Beyaz sort",
      icon: "assets/sprites/bottom-white-shorts.png",
    },
    {
      id: "black",
      label: "Siyah sort",
      icon: "assets/sprites/bottom-black-shorts.png",
    },
    {
      id: "khaki",
      label: "Haki sort",
      icon: "assets/sprites/bottom-khaki-shorts.png",
    },
  ],
  shoes: [
    {
      id: "white",
      label: "Beyaz spor ayakkabi",
      icon: "assets/sprites/shoes-white.png",
    },
  ],
};

const LOADING_SECONDS = 10;

const state = {
  dialogueIndex: 0,
  date: null,
  place: null,
  activity: null,
  character: null,
  outfit: {
    top: 0,
    bottom: 1,
    shoes: 0,
  },
};

const $ = (selector) => document.querySelector(selector);

const sections = {
  place: "#placeSection",
  activity: "#activitySection",
  character: "#characterSection",
  outfit: "#outfitSection",
  final: "#finalSection",
};

document.addEventListener("DOMContentLoaded", () => {
  renderDates();
  renderPlaces();
  renderActivities();
  renderCharacters();
  updateOutfit();
  updateSummary();
  updateProgress();
  startLoadingSequence();

  $("#dialogueNext").addEventListener("click", nextDialogue);
  $("#startButton").addEventListener("click", startGame);
  $("#confirmOutfit").addEventListener("click", finishQuest);
  $("#copyButton").addEventListener("click", copyFinalMessage);
  $("#shareButton").addEventListener("click", shareFinalMessage);

  document.querySelectorAll("[data-carousel]").forEach((button) => {
    button.addEventListener("click", () => {
      const kind = button.dataset.carousel;
      const direction = Number(button.dataset.direction);
      rotateOutfit(kind, direction);
    });
  });
});

function startLoadingSequence() {
  const loadingScreen = $("#loadingScreen");
  const introScreen = $("#introScreen");
  const countdown = $("#loadingCountdown");
  const meterFill = $("#loadingMeterFill");
  const status = $("#loadingStatus");
  let remaining = LOADING_SECONDS;

  preloadImages(getCriticalImagePaths()).then(() => {
    if (status) {
      status.textContent = "Gorseller hazir";
    }
  });

  updateLoadingCountdown(remaining);
  const timer = window.setInterval(() => {
    remaining -= 1;
    updateLoadingCountdown(remaining);

    if (remaining <= 0) {
      window.clearInterval(timer);
      loadingScreen.classList.remove("is-active");
      loadingScreen.setAttribute("aria-hidden", "true");
      introScreen.classList.add("is-active");
      introScreen.setAttribute("aria-hidden", "false");
    }
  }, 1000);

  function updateLoadingCountdown(value) {
    const clamped = Math.max(0, value);
    const progress = (LOADING_SECONDS - clamped) / LOADING_SECONDS;
    if (countdown) {
      countdown.textContent = String(clamped);
    }
    if (meterFill) {
      meterFill.style.transform = `scaleX(${progress})`;
    }
  }
}

function getCriticalImagePaths() {
  const outfitImages = [];
  outfitOptions.top.forEach((top) => {
    outfitOptions.bottom.forEach((bottom) => {
      outfitImages.push(`assets/sprites/outfits/outfit-${top.id}-${bottom.id}.png`);
    });
  });

  const clothingImages = [
    ...outfitOptions.top.map((option) => option.icon),
    ...outfitOptions.bottom.map((option) => option.icon),
    ...outfitOptions.shoes.map((option) => option.icon),
  ];

  const domImages = [...document.querySelectorAll("img[src]")]
    .map((image) => image.getAttribute("src"))
    .filter(Boolean);

  const cssImages = [
    "assets/backgrounds/date-park-background.png",
    "assets/icons/arrow-right.png",
    "assets/icons/hanger.png",
    "assets/icons/share-phone.png",
    "assets/icons/start-gem.png",
    "assets/icons/the-great-quest-icon.png",
    "assets/sprites/portrait-yusuf.png",
    "assets/ui/button-hover.png",
    "assets/ui/button-normal.png",
    "assets/ui/frame-button-hover.png",
    "assets/ui/frame-button.png",
    "assets/ui/frame-card-locked.png",
    "assets/ui/frame-card-selected.png",
    "assets/ui/frame-card.png",
    "assets/ui/frame-input.png",
    "assets/ui/frame-panel-soft.png",
    "assets/ui/frame-panel.png",
    "assets/ui/frame-podium.png",
    "assets/ui/frame-slot.png",
    "assets/ui/frame-toast.png",
    "assets/ui/mystery-character.png",
    "assets/ui/podium-shadow.png",
    "assets/ui/podium-step.png",
    "assets/ui/progress-done.png",
    "assets/ui/progress-empty.png",
  ];

  return [...new Set([
    ...Object.values(assets.icons),
    ...Object.values(assets.sprites),
    ...domImages,
    ...cssImages,
    ...clothingImages,
    ...outfitImages,
  ])];
}

function preloadImages(paths) {
  const tasks = paths.map((path) => new Promise((resolve) => {
    const image = new Image();
    image.onload = resolve;
    image.onerror = resolve;
    image.src = path;
  }));

  return Promise.allSettled(tasks);
}

function nextDialogue() {
  state.dialogueIndex += 1;
  $("#dialogueText").textContent = dialogueLines[state.dialogueIndex];
  $("#dialogueNext").hidden = true;
  $("#startButton").hidden = false;
}

function startGame() {
  const shade = $("#transitionShade");
  shade.classList.add("is-on");

  window.setTimeout(() => {
    $("#introScreen").classList.remove("is-active");
    $("#gameScreen").classList.add("is-active");
    $("#gameScreen").setAttribute("aria-hidden", "false");
  }, 320);

  window.setTimeout(() => {
    shade.classList.remove("is-on");
    $("#dateSection").scrollIntoView({ behavior: "smooth", block: "start" });
  }, 720);
}

function renderDates() {
  const grid = $("#dateGrid");
  dates.forEach((date) => {
    const button = makeOptionTile({
      id: date.id,
      group: "date",
      icon: date.locked ? assets.icons.lock : assets.icons.calendar,
      label: date.label,
      sub: date.day,
      locked: date.locked,
      note: date.locked ? "Yusuf o gun musait degil" : "",
      reserveNote: true,
    });

    button.addEventListener("click", () => {
      if (date.locked) {
        showToast("Yusuf o gun musait degil.");
        return;
      }

      state.date = date;
      markSelected("date", date.id);
      reveal("place");
      updateSummary();
      updateProgress();
      scrollToSection("place");
    });

    grid.appendChild(button);
  });
}

function renderPlaces() {
  const grid = $("#placeGrid");
  places.forEach((place) => {
    const button = makeOptionTile({
      id: place.id,
      group: "place",
      icon: place.icon,
      label: place.name,
      sub: place.time,
    });

    button.addEventListener("click", () => {
      state.place = place;
      markSelected("place", place.id);
      reveal("activity");
      updateSummary();
      updateProgress();
      scrollToSection("activity");
    });

    grid.appendChild(button);
  });
}

function renderActivities() {
  const grid = $("#activityGrid");
  activities.forEach((activity) => {
    const button = makeOptionTile({
      id: activity.id,
      group: "activity",
      icon: activity.icon,
      label: activity.label,
      sub: activity.locked ? "Kilitli" : "Secilebilir",
      locked: activity.locked,
      note: activity.note || "",
    });

    button.addEventListener("click", () => {
      if (activity.locked) {
        showToast(activity.note);
        return;
      }

      state.activity = activity;
      markSelected("activity", activity.id);
      reveal("character");
      updateSummary();
      updateProgress();
      scrollToSection("character");
    });

    grid.appendChild(button);
  });
}

function renderCharacters() {
  const grid = $("#characterGrid");
  characters.forEach((character) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "character-tile";
    button.dataset.group = "character";
    button.dataset.id = character.id;

    if (character.id === "others") {
      const silhouette = document.createElement("div");
      silhouette.className = "mystery-silhouette";
      silhouette.textContent = "...";
      button.appendChild(silhouette);
    } else {
      const image = document.createElement("img");
      image.src = character.image;
      image.alt = "";
      button.appendChild(image);
    }

    const name = document.createElement("span");
    name.className = "character-name";
    name.textContent = character.name;
    button.appendChild(name);

    const sub = document.createElement("span");
    sub.className = "character-sub";
    sub.textContent = character.sub;
    button.appendChild(sub);

    button.addEventListener("click", () => {
      if (character.id === "others") {
        button.animate(
          [
            { transform: "translateX(0)" },
            { transform: "translateX(-8px)" },
            { transform: "translateX(8px)" },
            { transform: "translateX(0)" },
          ],
          { duration: 220, easing: "steps(4, end)" },
        );
        showToast("Yakismadi...");
        return;
      }

      state.character = character;
      markSelected("character", character.id);
      reveal("outfit");
      updateSummary();
      updateProgress();
      scrollToSection("outfit");
    });

    grid.appendChild(button);
  });
}

function makeOptionTile({ id, group, icon, label, sub, locked = false, note = "", reserveNote = false }) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `option-tile${locked ? " is-locked" : ""}`;
  button.dataset.group = group;
  button.dataset.id = id;

  const image = document.createElement("img");
  image.src = icon;
  image.alt = "";
  button.appendChild(image);

  const labelNode = document.createElement("span");
  labelNode.className = "option-label";
  labelNode.textContent = label;
  button.appendChild(labelNode);

  const subNode = document.createElement("span");
  subNode.className = "option-sub";
  subNode.textContent = sub;
  button.appendChild(subNode);

  if (note || reserveNote) {
    const noteNode = document.createElement("span");
    noteNode.className = "option-lock-note";
    noteNode.textContent = note;
    noteNode.setAttribute("aria-hidden", note ? "false" : "true");
    button.appendChild(noteNode);
  }

  return button;
}

function markSelected(group, id) {
  document.querySelectorAll(`[data-group="${group}"]`).forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.id === id);
  });
}

function reveal(sectionName) {
  const section = $(sections[sectionName]);
  if (!section || !section.hidden) {
    return;
  }

  section.hidden = false;
  requestAnimationFrame(() => section.classList.add("is-visible"));
}

function scrollToSection(sectionName) {
  window.setTimeout(() => {
    const section = $(sections[sectionName]);
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 180);
}

function rotateOutfit(kind, direction) {
  const list = outfitOptions[kind];
  const current = state.outfit[kind];
  state.outfit[kind] = (current + direction + list.length) % list.length;
  updateOutfit(true);
  updateSummary();
}

function updateOutfit(animate = false) {
  const top = getOutfit("top");
  const bottom = getOutfit("bottom");
  const shoes = getOutfit("shoes");
  const preview = $("#outfitPreview");

  $("#topIcon").src = top.icon;
  $("#topLabel").textContent = top.label;
  $("#bottomIcon").src = bottom.icon;
  $("#bottomLabel").textContent = bottom.label;
  $("#shoeIcon").src = shoes.icon;
  $("#shoeLabel").textContent = shoes.label;

  const nextSource = `assets/sprites/outfits/outfit-${top.id}-${bottom.id}.png`;
  if (!animate) {
    preview.src = nextSource;
    return;
  }

  preview.classList.add("is-changing");
  window.setTimeout(() => {
    preview.src = nextSource;
    preview.classList.remove("is-changing");
  }, 130);
}

function getOutfit(kind) {
  return outfitOptions[kind][state.outfit[kind]];
}

function finishQuest() {
  reveal("final");
  updateSummary();
  updateProgress(true);
  $("#finalMessage").value = buildFinalMessage();
  scrollToSection("final");
}

function buildFinalMessage() {
  const top = getOutfit("top");
  const bottom = getOutfit("bottom");
  const shoes = getOutfit("shoes");

  return [
    "Yusuf Terzi, konusma limitimi yenilemek icin ikinci bulusma gorevinde son adima geldim.",
    "",
    `Gun: ${state.date.label} ${state.date.day}`,
    `Mekan ve saat: ${state.place.name} - ${state.place.time}`,
    `Plan: ${state.activity.label}`,
    "Bulusma karakteri: Yusuf Terzi",
    `Kiyafet: ${top.label}, ${bottom.label}, ${shoes.label}`,
    "",
    "Konusma limitimin yenilenmesi ve gorevin tamamlanmasi icin bu mesaji Yusuf Terzi'ye atiyorum.",
  ].join("\n");
}

async function copyFinalMessage() {
  const message = $("#finalMessage").value || buildFinalMessage();

  try {
    await navigator.clipboard.writeText(message);
    showToast("Mesaj kopyalandi. Gorevi bitirmek icin Yusuf'a gonder.");
  } catch {
    $("#finalMessage").focus();
    $("#finalMessage").select();
    document.execCommand("copy");
    showToast("Mesaj secildi. Kopyalayip Yusuf'a gonder.");
  }
}

async function shareFinalMessage() {
  const message = $("#finalMessage").value || buildFinalMessage();

  if (navigator.share) {
    try {
      await navigator.share({
        title: "The Great Quest",
        text: message,
      });
      showToast("Paylasim ekrani acildi.");
      return;
    } catch {
      showToast("Paylasim iptal edildi.");
      return;
    }
  }

  await copyFinalMessage();
}

function updateSummary() {
  const summary = $("#choiceSummary");
  const top = getOutfit("top");
  const bottom = getOutfit("bottom");
  const shoes = getOutfit("shoes");

  const rows = [
    ["Gun", state.date ? `${state.date.label} ${state.date.day}` : "Bekleniyor"],
    ["Mekan", state.place ? `${state.place.name}, ${state.place.time}` : "Bekleniyor"],
    ["Plan", state.activity ? state.activity.label : "Bekleniyor"],
    ["Karakter", state.character ? state.character.name : "Bekleniyor"],
    ["Kiyafet", `${top.label}, ${bottom.label}, ${shoes.label}`],
  ];

  summary.replaceChildren();
  rows.forEach(([term, detail]) => {
    const wrapper = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = term;
    dd.textContent = detail;
    wrapper.append(dt, dd);
    summary.appendChild(wrapper);
  });
}

function updateProgress(finished = false) {
  const steps = [
    Boolean(state.date),
    Boolean(state.place),
    Boolean(state.activity),
    Boolean(state.character),
    finished || !$("#finalSection").hidden,
  ];

  const dots = $("#progressDots");
  dots.replaceChildren();

  steps.forEach((done, index) => {
    const dot = document.createElement("span");
    dot.className = `progress-dot${done ? " is-done" : ""}`;
    dot.setAttribute("aria-label", `${index + 1}. adim`);
    dots.appendChild(dot);
  });
}

let toastTimer = 0;

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
}
