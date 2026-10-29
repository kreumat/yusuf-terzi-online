"use strict";

const days = [
  { name: "Monday", color: "#ffe27b" },
  { name: "Tuesday", color: "#ffa98a" },
  { name: "Wednesday", color: "#bde782" },
  { name: "Thursday", color: "#83d8ec" },
  { name: "Friday", color: "#aeb8ff" },
  { name: "Saturday", color: "#d9b5f6", weekend: true },
  { name: "Sunday", color: "#ffb9d1", weekend: true },
];

const characters = [
  {
    id: "steve",
    name: "Steve",
    day: "Monday",
    role: "pupil",
    pronoun: "He",
    roleSentence: "He is a pupil.",
    image: "assets/characters/01_steve.webp",
  },
  {
    id: "hello-kitty",
    name: "Hello Kitty",
    day: "Tuesday",
    role: "friend",
    pronoun: "She",
    roleSentence: "She is my friend.",
    image: "assets/characters/02_hello_kitty.webp",
  },
  {
    id: "sonic",
    name: "Sonic",
    day: "Wednesday",
    role: "pupil",
    pronoun: "He",
    roleSentence: "He is a pupil.",
    image: "assets/characters/03_sonic.webp",
  },
  {
    id: "creeper",
    name: "Creeper",
    day: "Thursday",
    role: "teacher",
    pronoun: "It",
    roleSentence: "It is a teacher.",
    image: "assets/characters/04_creeper.webp",
  },
  {
    id: "bunny",
    name: "Bunny",
    day: "Friday",
    role: "pupil",
    pronoun: "It",
    roleSentence: "It is a pupil.",
    image: "assets/characters/05_bunny.webp",
  },
  {
    id: "owl",
    name: "Owl",
    day: "Saturday",
    role: "headmistress",
    pronoun: "She",
    roleSentence: "She is a headmistress.",
    image: "assets/characters/06_owl.webp",
  },
  {
    id: "lion",
    name: "Lion",
    day: "Sunday",
    role: "headmaster",
    pronoun: "He",
    roleSentence: "He is a headmaster.",
    image: "assets/characters/07_lion.webp",
  },
];

const places = [
  { id: "school", name: "school", image: "assets/places/01_school.webp", x: 22, y: 19 },
  { id: "library", name: "library", image: "assets/places/02_library.webp", x: 50, y: 18 },
  { id: "classroom", name: "classroom", image: "assets/places/03_classroom.webp", x: 78, y: 19 },
  { id: "canteen", name: "canteen", image: "assets/places/04_canteen.webp", x: 20, y: 48 },
  { id: "teachers-room", name: "teacher's room", image: "assets/places/05_teachers_room.webp", x: 50, y: 48 },
  { id: "garden", name: "garden", image: "assets/places/06_garden.webp", x: 80, y: 48 },
  { id: "playground", name: "playground", image: "assets/places/07_playground.webp", x: 21, y: 78 },
  { id: "lunch-hall", name: "lunch hall", image: "assets/places/08_lunch_hall.webp", x: 50, y: 78 },
  { id: "sports-hall", name: "sports hall", image: "assets/places/09_sports_hall.webp", x: 79, y: 78 },
];

const screenMeta = {
  warmup: { label: "Warm-up" },
  meet: { label: "Activity 1 · Meet My Friends" },
  days: { label: "Activity 2 · Days Chain" },
  confused: { label: "Activity 3 · Story" },
  quiz: { label: "Activity 3 · Place Quiz" },
  success: { label: "Places Complete" },
  choose: { label: "Activity 4 · Choose a Friend" },
  map: { label: "Activity 4 · School Map" },
  goodbye: { label: "Wrap-up" },
};

const menuSections = [
  ["warmup", "1 · Warm-up"],
  ["meet", "2 · Meet My Friends"],
  ["days", "3 · Days Chain"],
  ["confused", "4 · Place Story"],
  ["quiz", "5 · Place Quiz"],
  ["success", "6 · Success"],
  ["choose", "7 · Map Game"],
  ["goodbye", "8 · Wrap-up"],
];

const stage = document.querySelector("#stage");
const sectionLabel = document.querySelector("#sectionLabel");
const nextButton = document.querySelector("#nextButton");
const backButton = document.querySelector("#backButton");
const menuButton = document.querySelector("#menuButton");
const menuOverlay = document.querySelector("#menuOverlay");
const closeMenuButton = document.querySelector("#closeMenuButton");
const menuGrid = document.querySelector("#menuGrid");
const resetButton = document.querySelector("#resetButton");
const fullscreenButton = document.querySelector("#fullscreenButton");
const toast = document.querySelector("#toast");

let toastTimer = null;
let mapAnimationToken = 0;

const initialState = () => ({
  screen: "warmup",
  history: [],
  selectedDay: null,
  charIndex: 0,
  charStep: 0,
  chainIndex: 0,
  chainRounds: 0,
  quizOrder: [],
  quizIndex: 0,
  quizOptions: [],
  quizCorrect: false,
  quizWrong: null,
  selectedCharacterId: null,
  targetBag: [],
  lastTargetId: null,
  mapTargetId: null,
  mapCorrect: false,
  mapArrived: false,
  mapAnswerRevealed: false,
});

let state = initialState();

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function getCharacter(id = state.selectedCharacterId) {
  return characters.find((character) => character.id === id) || characters[0];
}

function getPlace(id = state.mapTargetId) {
  return places.find((place) => place.id === id) || places[0];
}

function showToast(message, tone = "info", duration = 1500) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className = `toast show ${tone}`;
  toastTimer = window.setTimeout(() => {
    toast.className = "toast";
  }, duration);
}

function setNext(label, disabled = false) {
  nextButton.innerHTML = `${label} <span aria-hidden="true">→</span>`;
  nextButton.disabled = disabled;
}

function goTo(screenName, { push = true, resetSection = false } = {}) {
  mapAnimationToken += 1;
  if (push && state.screen !== screenName) state.history.push(state.screen);
  state.screen = screenName;

  if (resetSection) resetScreenState(screenName);
  if (screenName === "quiz" && state.quizOrder.length === 0) startQuizState();
  if (screenName === "map" && !state.mapTargetId) prepareMapTarget();

  closeMenu();
  render();
}

function resetScreenState(screenName) {
  if (screenName === "meet") {
    state.charIndex = 0;
    state.charStep = 0;
  }
  if (screenName === "days") {
    state.chainIndex = 0;
    state.chainRounds = 0;
  }
  if (screenName === "quiz") startQuizState();
  if (screenName === "choose") state.selectedCharacterId = null;
}

function goBack() {
  if (!state.history.length) return;
  mapAnimationToken += 1;
  state.screen = state.history.pop();
  closeMenu();
  render();
}

function openMenu() {
  menuOverlay.classList.remove("hidden");
}

function closeMenu() {
  menuOverlay.classList.add("hidden");
}

function resetLesson() {
  const confirmed = window.confirm("Dersi baştan başlatmak istediğinizden emin misiniz?");
  if (!confirmed) return;
  mapAnimationToken += 1;
  state = initialState();
  closeMenu();
  render();
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

function renderMenu() {
  menuGrid.innerHTML = menuSections
    .map(
      ([screenName, label]) =>
        `<button class="menu-section-button" type="button" data-screen="${screenName}">${label}</button>`,
    )
    .join("");

  menuGrid.querySelectorAll("[data-screen]").forEach((button) => {
    button.addEventListener("click", () => {
      const screenName = button.dataset.screen;
      if (screenName === "quiz") startQuizState();
      if (screenName === "choose") {
        state.selectedCharacterId = null;
        state.mapTargetId = null;
      }
      goTo(screenName, { resetSection: screenName === "meet" || screenName === "days" });
    });
  });
}

function syncChrome() {
  sectionLabel.textContent = screenMeta[state.screen].label;
  backButton.disabled = state.history.length === 0;
}

function render() {
  syncChrome();
  switch (state.screen) {
    case "warmup":
      renderWarmup();
      break;
    case "meet":
      renderMeet();
      break;
    case "days":
      renderDaysChain();
      break;
    case "confused":
      renderConfused();
      break;
    case "quiz":
      renderQuiz();
      break;
    case "success":
      renderSuccess();
      break;
    case "choose":
      renderCharacterChoice();
      break;
    case "map":
      renderMap();
      break;
    case "goodbye":
      renderGoodbye();
      break;
    default:
      goTo("warmup", { push: false });
  }
}

function renderWarmup() {
  setNext("Arkadaşlarla Tanış", false);

  const dayCards = days
    .map(
      (day, index) => `
        <button class="day-card ${state.selectedDay === day.name ? "active" : ""}" type="button"
          data-day="${day.name}" style="--day-color:${day.color}">
          ${day.weekend ? '<span class="weekend-ribbon">WEEKEND</span>' : ""}
          <span class="calendar-icon" aria-hidden="true">${index + 1}</span>
          <strong>${day.name}</strong>
        </button>`,
    )
    .join("");

  stage.innerHTML = `
    <section class="screen warmup-screen">
      <div class="warmup-heading">
        <div>
          <p class="eyebrow">Warm-up</p>
          <h1>What day is it today?</h1>
        </div>
        <p class="large-copy">Choose today. Then use the sentence on the normal board.</p>
      </div>
      <div class="days-board" aria-label="Days of the week">${dayCards}</div>
      <div class="chunk-panel">
        <span>What day is it today?</span>
        <span aria-hidden="true">→</span>
        <span class="answer">${state.selectedDay ? `It is ${state.selectedDay} today.` : "It is ______ today."}</span>
      </div>
    </section>`;

  stage.querySelectorAll("[data-day]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedDay = button.dataset.day;
      renderWarmup();
    });
  });
}

function renderMeet() {
  const character = characters[state.charIndex];
  const questionVisible = state.charStep >= 1;
  const answerVisible = state.charStep >= 2;

  const nextLabel = state.charStep === 0 ? "Soruyu Göster" : state.charStep === 1 ? "Cevabı Göster" : state.charIndex === characters.length - 1 ? "Days Chain" : "Sonraki Arkadaş";
  setNext(nextLabel, false);

  const progress = characters
    .map((_, index) => `<span class="progress-dot ${index < state.charIndex ? "done" : ""} ${index === state.charIndex ? "current" : ""}"></span>`)
    .join("");

  stage.innerHTML = `
    <section class="screen meet-screen">
      <div class="character-visual" id="meetCharacter" title="İlerlemek için dokunun">
        <img src="${character.image}" alt="${character.name}" />
      </div>
      <div class="meet-copy">
        <div class="progress-row" aria-label="Character ${state.charIndex + 1} of ${characters.length}">
          ${progress}
          <strong>${state.charIndex + 1} / ${characters.length}</strong>
        </div>
        <p class="eyebrow">Meet my friends</p>
        <h1>${questionVisible ? "Who is this?" : "Look!"}</h1>
        ${questionVisible ? '<div class="question-card">Who is this?</div>' : ""}
        ${
          answerVisible
            ? `<div class="answer-card">
                <span class="main-answer">This is ${character.name}.</span>
                <span class="role-answer">${character.roleSentence}</span>
              </div>
              <span class="day-badge">${character.day} · ${character.role}</span>`
            : ""
        }
        <div class="action-row">
          <button class="action-button ${answerVisible ? "green" : ""}" id="meetAdvance" type="button">${nextLabel}</button>
        </div>
      </div>
    </section>`;

  stage.querySelector("#meetAdvance").addEventListener("click", advanceMeet);
  stage.querySelector("#meetCharacter").addEventListener("click", advanceMeet);
}

function advanceMeet() {
  if (state.charStep < 2) {
    state.charStep += 1;
    renderMeet();
    return;
  }
  if (state.charIndex < characters.length - 1) {
    state.charIndex += 1;
    state.charStep = 0;
    renderMeet();
    return;
  }
  goTo("days");
}

function renderDaysChain() {
  const currentDay = days[state.chainIndex];
  setNext("Place Story", false);

  const track = days
    .map(
      (day, index) => `
        <div class="chain-day ${index === state.chainIndex ? "current" : ""} ${index < state.chainIndex ? "done" : ""}"
          style="--day-color:${day.color}">
          ${day.weekend ? '<span class="weekend-ribbon">WEEKEND</span>' : ""}
          ${day.name}
        </div>`,
    )
    .join("");

  stage.innerHTML = `
    <section class="screen days-chain-screen">
      <div>
        <p class="eyebrow">Activity 2</p>
        <h1>Days Chain</h1>
        <p class="large-copy">One student, one day. Keep the chain going!</p>
      </div>
      <div class="chain-track">${track}</div>
      <div class="chain-controls">
        <button class="action-button light" id="helperButton" type="button">⭐ Helper to the board</button>
        <button class="action-button orange" id="repeatDayButton" type="button">🔊 ${currentDay.name}</button>
        <button class="action-button green" id="nextDayButton" type="button">Next student →</button>
      </div>
    </section>`;

  stage.querySelector("#helperButton").addEventListener("click", () => showToast("You are our helper!", "info"));
  stage.querySelector("#repeatDayButton").addEventListener("click", () => speak(currentDay.name));
  stage.querySelector("#nextDayButton").addEventListener("click", () => {
    state.chainIndex = (state.chainIndex + 1) % days.length;
    if (state.chainIndex === 0) state.chainRounds += 1;
    renderDaysChain();
  });
}

function friendsCloud(extraClass = "") {
  const images = characters
    .map((character) => `<img class="friend-mini" src="${character.image}" alt="${character.name}" />`)
    .join("");
  return `<div class="friends-cloud ${extraClass}">${images}</div>`;
}

function renderConfused() {
  setNext("Let's Help!", false);

  stage.innerHTML = `
    <section class="screen confused-screen">
      <div class="friends-cloud">
        ${characters.map((character) => `<img class="friend-mini" src="${character.image}" alt="${character.name}" />`).join("")}
        <span class="question-bubble q1">?</span>
        <span class="question-bubble q2">?</span>
        <span class="question-bubble q3">?</span>
        <img class="floating-place p1" src="${places[1].image}" alt="" />
        <img class="floating-place p2" src="${places[4].image}" alt="" />
        <img class="floating-place p3" src="${places[8].image}" alt="" />
      </div>
      <div class="story-copy">
        <p class="eyebrow">A little problem</p>
        <h1>Our friends are confused!</h1>
        <div class="speech">They do not know the places at school.</div>
        <div class="speech">Let’s help them!</div>
        <button class="action-button green" id="startQuizButton" type="button">Start the Place Quiz →</button>
      </div>
    </section>`;

  stage.querySelector("#startQuizButton").addEventListener("click", () => {
    startQuizState();
    goTo("quiz");
  });
}

function startQuizState() {
  state.quizOrder = shuffle(places.map((place) => place.id));
  state.quizIndex = 0;
  state.quizCorrect = false;
  state.quizWrong = null;
  state.quizOptions = makeQuizOptions(state.quizOrder[0]);
}

function makeQuizOptions(correctId) {
  const distractors = shuffle(places.filter((place) => place.id !== correctId)).slice(0, 2);
  return shuffle([getPlace(correctId), ...distractors]).map((place) => place.id);
}

function currentQuizPlace() {
  return getPlace(state.quizOrder[state.quizIndex]);
}

function renderQuiz() {
  if (!state.quizOrder.length) startQuizState();
  const place = currentQuizPlace();
  if (!state.quizOptions.length) state.quizOptions = makeQuizOptions(place.id);
  setNext(state.quizIndex === places.length - 1 ? "Başarı Ekranı" : "Sonraki Mekân", !state.quizCorrect);

  const progress = places
    .map((_, index) => `<span class="${index < state.quizIndex || (index === state.quizIndex && state.quizCorrect) ? "done" : ""}"></span>`)
    .join("");

  const options = state.quizOptions
    .map((id, index) => {
      const option = getPlace(id);
      const isCorrect = state.quizCorrect && id === place.id;
      const isWrong = state.quizWrong === id && !state.quizCorrect;
      return `
        <button class="answer-button ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}" type="button" data-answer="${id}" ${state.quizCorrect ? "disabled" : ""}>
          <span class="letter">${String.fromCharCode(65 + index)}</span>
          <span>This is a ${option.name}.</span>
        </button>`;
    })
    .join("");

  stage.innerHTML = `
    <section class="screen quiz-screen">
      <div class="quiz-visual">
        <div class="quiz-progress">${progress}</div>
        <div class="quiz-image-frame"><img src="${place.image}" alt="School place" /></div>
      </div>
      <div class="quiz-copy">
        <p class="eyebrow">Place ${state.quizIndex + 1} of ${places.length}</p>
        <h1 class="quiz-question">What is this?</h1>
        <div class="answer-list">${options}</div>
      </div>
    </section>`;

  stage.querySelectorAll("[data-answer]").forEach((button) => {
    button.addEventListener("click", () => answerQuiz(button.dataset.answer));
  });
}

function answerQuiz(answerId) {
  const place = currentQuizPlace();
  if (answerId === place.id) {
    state.quizCorrect = true;
    state.quizWrong = null;
    showToast("Great!", "good");
    speak(`This is a ${place.name}.`);
  } else {
    state.quizWrong = answerId;
    showToast("Try again!", "bad");
  }
  renderQuiz();
}

function advanceQuiz() {
  if (!state.quizCorrect) return;
  if (state.quizIndex >= state.quizOrder.length - 1) {
    goTo("success");
    return;
  }
  state.quizIndex += 1;
  state.quizCorrect = false;
  state.quizWrong = null;
  state.quizOptions = makeQuizOptions(state.quizOrder[state.quizIndex]);
  renderQuiz();
}

function confetti() {
  const colors = ["#ffcf3f", "#e94f64", "#5ed7e8", "#8c6be8", "#27a96c", "#ff9e5d"];
  return Array.from({ length: 36 }, (_, index) => {
    const left = (index * 31) % 100;
    const delay = -((index * 0.21) % 3);
    const drift = `${(index % 2 === 0 ? 1 : -1) * (24 + (index % 7) * 9)}px`;
    return `<span class="confetti-piece" style="left:${left}%;--delay:${delay}s;--drift:${drift};--confetti-color:${colors[index % colors.length]}"></span>`;
  }).join("");
}

function renderSuccess() {
  setNext("Harita Oyununa Geç", false);

  stage.innerHTML = `
    <section class="screen success-screen">
      ${confetti()}
      ${friendsCloud()}
      <div class="story-copy">
        <p class="eyebrow">Mission complete</p>
        <h1>Great job!</h1>
        <div class="speech">Our friends know the school now!</div>
        <button class="action-button green" id="toMapButton" type="button">Choose a Friend →</button>
      </div>
    </section>`;

  stage.querySelector("#toMapButton").addEventListener("click", () => goTo("choose"));
}

function renderCharacterChoice() {
  setNext("Bir Karakter Seçin", true);

  const cards = characters
    .map(
      (character) => `
        <button class="character-choice" type="button" data-character="${character.id}">
          <img src="${character.image}" alt="${character.name}" />
          <strong>${character.name}</strong>
          <small>${character.day} · ${character.role}</small>
        </button>`,
    )
    .join("");

  stage.innerHTML = `
    <section class="screen choose-screen">
      <div class="choose-heading">
        <div>
          <p class="eyebrow">Activity 4</p>
          <h1>Choose a friend!</h1>
        </div>
        <p class="large-copy">Who will visit the school?</p>
      </div>
      <div class="character-grid">${cards}</div>
    </section>`;

  stage.querySelectorAll("[data-character]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedCharacterId = button.dataset.character;
      state.mapTargetId = null;
      prepareMapTarget();
      goTo("map");
    });
  });
}

function prepareMapTarget() {
  if (state.targetBag.length === 0) {
    state.targetBag = shuffle(places.map((place) => place.id));
    if (state.lastTargetId && state.targetBag[0] === state.lastTargetId && state.targetBag.length > 1) {
      [state.targetBag[0], state.targetBag[1]] = [state.targetBag[1], state.targetBag[0]];
    }
  }
  state.mapTargetId = state.targetBag.shift();
  state.lastTargetId = state.mapTargetId;
  state.mapCorrect = false;
  state.mapArrived = false;
  state.mapAnswerRevealed = false;
}

function renderMap() {
  const character = getCharacter();
  const target = getPlace();
  setNext("Mekânı Seç", true);

  const placeButtons = places
    .map(
      (place) => `
        <button class="map-place" type="button" data-place="${place.id}" aria-label="${place.name}"
          style="left:${place.x}%;top:${place.y}%">
          <img src="${place.image}" alt="" />
          <span class="map-label">${place.name}</span>
        </button>`,
    )
    .join("");

  stage.innerHTML = `
    <section class="screen map-screen">
      <div class="map-target-bar">
        <small>Read and touch</small>
        <strong lang="en">${target.name}</strong>
      </div>
      <div class="school-map" id="schoolMap">
        ${placeButtons}
        <img class="character-pawn" id="characterPawn" src="${character.image}" alt="" />
      </div>
      <div class="map-result hidden" id="mapResult">
        <div class="map-result-copy">
          <h3>Where is ${character.name}?</h3>
          <div class="map-answer hidden" id="mapAnswer">${character.pronoun} is in the ${target.name}.</div>
        </div>
        <div class="action-row">
          <button class="action-button orange" id="showMapAnswer" type="button">Show the full answer</button>
          <button class="action-button green hidden" id="nextRoundButton" type="button">Next round</button>
          <button class="action-button light hidden" id="finishLessonButton" type="button">Finish lesson</button>
        </div>
      </div>
    </section>`;

  stage.querySelectorAll("[data-place]").forEach((button) => {
    button.addEventListener("click", () => handleMapChoice(button));
  });
  stage.querySelector("#showMapAnswer").addEventListener("click", revealMapAnswer);
  stage.querySelector("#nextRoundButton").addEventListener("click", nextMapRound);
  stage.querySelector("#finishLessonButton").addEventListener("click", () => goTo("goodbye"));
}

function handleMapChoice(button) {
  if (state.mapCorrect) return;
  const selectedId = button.dataset.place;
  const target = getPlace();
  if (selectedId !== target.id) {
    button.classList.add("wrong");
    showToast("Try again!", "bad");
    window.setTimeout(() => button.classList.remove("wrong"), 650);
    return;
  }

  state.mapCorrect = true;
  const token = ++mapAnimationToken;
  button.classList.add("correct");
  stage.querySelectorAll("[data-place]").forEach((placeButton) => {
    placeButton.disabled = true;
  });

  const pawn = stage.querySelector("#characterPawn");
  pawn.classList.add("walking");
  window.requestAnimationFrame(() => {
    pawn.style.left = `${target.x}%`;
    pawn.style.top = `${target.y + 7}%`;
  });
  showToast("Great!", "good");

  window.setTimeout(() => {
    if (token !== mapAnimationToken || state.screen !== "map") return;
    pawn.classList.add("entering");
  }, 1750);

  window.setTimeout(() => {
    if (token !== mapAnimationToken || state.screen !== "map") return;
    state.mapArrived = true;
    stage.querySelector(".map-screen").classList.add("has-result");
    stage.querySelector("#mapResult").classList.remove("hidden");
  }, 2350);
}

function revealMapAnswer() {
  if (!state.mapArrived) return;
  state.mapAnswerRevealed = true;
  stage.querySelector("#mapAnswer").classList.remove("hidden");
  stage.querySelector("#showMapAnswer").classList.add("hidden");
  stage.querySelector("#nextRoundButton").classList.remove("hidden");
  stage.querySelector("#finishLessonButton").classList.remove("hidden");
  setNext("Yeni Tur", false);
}

function nextMapRound() {
  state.selectedCharacterId = null;
  state.mapTargetId = null;
  state.mapCorrect = false;
  state.mapArrived = false;
  state.mapAnswerRevealed = false;
  goTo("choose");
}

function renderGoodbye() {
  const character = getCharacter(state.selectedCharacterId || "steve");
  setNext("Dersi Baştan Başlat", false);

  stage.innerHTML = `
    <section class="screen goodbye-screen">
      <img class="goodbye-character" src="${character.image}" alt="${character.name}" />
      <div class="story-copy">
        <p class="eyebrow">Wrap-up</p>
        <h1>Great work today!</h1>
        <div class="final-question">What day is it today?</div>
        <div class="final-question">Where is ${character.name}?</div>
        <h2>Goodbye, everyone!</h2>
        <p class="large-copy">See you next week.</p>
      </div>
    </section>`;
}

function handleNext() {
  switch (state.screen) {
    case "warmup":
      goTo("meet");
      break;
    case "meet":
      advanceMeet();
      break;
    case "days":
      goTo("confused");
      break;
    case "confused":
      startQuizState();
      goTo("quiz");
      break;
    case "quiz":
      advanceQuiz();
      break;
    case "success":
      goTo("choose");
      break;
    case "choose":
      break;
    case "map":
      if (state.mapAnswerRevealed) nextMapRound();
      break;
    case "goodbye":
      resetLesson();
      break;
    default:
      break;
  }
}

menuButton.addEventListener("click", openMenu);
closeMenuButton.addEventListener("click", closeMenu);
menuOverlay.addEventListener("click", (event) => {
  if (event.target === menuOverlay) closeMenu();
});
resetButton.addEventListener("click", resetLesson);
fullscreenButton.addEventListener("click", toggleFullscreen);
backButton.addEventListener("click", goBack);
nextButton.addEventListener("click", handleNext);

document.addEventListener("keydown", (event) => {
  const activeTag = document.activeElement?.tagName;
  const buttonFocused = activeTag === "BUTTON" || activeTag === "A";
  if ((event.key === "ArrowRight" || event.key === " ") && !buttonFocused) {
    event.preventDefault();
    if (!nextButton.disabled) handleNext();
  }
  if (event.key === "ArrowLeft" && !buttonFocused) {
    event.preventDefault();
    goBack();
  }
  if (event.key.toLowerCase() === "f") toggleFullscreen();
  if (event.key.toLowerCase() === "m") openMenu();
  if (event.key === "Escape" && !menuOverlay.classList.contains("hidden")) closeMenu();
});

renderMenu();
render();
