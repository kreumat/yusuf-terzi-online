"use strict";

const characters = [
  {
    name: "Steve",
    country: "Türkiye",
    nationality: "Turkish",
    pronoun: "he",
    image: "assets/characters/01_steve_turkiye.webp",
    checkNationality: "Turkish",
  },
  {
    name: "Alex",
    country: "Russia",
    nationality: "Russian",
    pronoun: "she",
    image: "assets/characters/02_alex_russia.webp",
    checkNationality: "French",
  },
  {
    name: "Panda",
    country: "China",
    nationality: "Chinese",
    pronoun: "it",
    image: "assets/characters/03_panda_china.webp",
    checkNationality: "Chinese",
  },
  {
    name: "My Melody",
    country: "France",
    nationality: "French",
    pronoun: "she",
    image: "assets/characters/04_my_melody_france.webp",
    checkNationality: "Japanese",
  },
  {
    name: "Cinnamoroll",
    country: "Italy",
    nationality: "Italian",
    pronoun: "he",
    image: "assets/characters/05_cinnamoroll_italy.webp",
    checkNationality: "Italian",
  },
  {
    name: "Sheep",
    country: "Germany",
    nationality: "German",
    pronoun: "it",
    image: "assets/characters/06_sheep_germany.webp",
    checkNationality: "Greek",
  },
  {
    name: "Cow",
    country: "Greece",
    nationality: "Greek",
    pronoun: "it",
    image: "assets/characters/07_cow_greece.webp",
    checkNationality: "Greek",
  },
  {
    name: "Wolf",
    country: "the U.S.A.",
    nationality: "American",
    pronoun: "it",
    image: "assets/characters/08_wolf_usa.webp",
    checkNationality: "British",
  },
  {
    name: "Hello Kitty",
    country: "Britain",
    nationality: "British",
    pronoun: "she",
    image: "assets/characters/09_hello_kitty_britain.webp",
    checkNationality: "British",
  },
  {
    name: "Kuromi",
    country: "Japan",
    nationality: "Japanese",
    pronoun: "she",
    image: "assets/characters/10_kuromi_japan.webp",
    checkNationality: "Turkish",
  },
  {
    name: "Cat",
    country: "Iran",
    nationality: "Iranian",
    pronoun: "it",
    image: "assets/characters/11_cat_iran.webp",
    checkNationality: "Iranian",
  },
  {
    name: "Parrot",
    country: "Iraq",
    nationality: "Iraqi",
    pronoun: "it",
    image: "assets/characters/12_parrot_iraq.webp",
    checkNationality: "Pakistani",
  },
  {
    name: "Bee",
    country: "Pakistan",
    nationality: "Pakistani",
    pronoun: "it",
    image: "assets/characters/13_bee_pakistan.webp",
    checkNationality: "Pakistani",
  },
];

const modes = {
  who: {
    chip: "PART 1 • NAMES",
    kicker: "LOOK AND CHOOSE",
    nextLabel: "Countries",
  },
  where: {
    chip: "PART 2 • COUNTRIES",
    kicker: "LOOK, READ AND CHOOSE",
    nextLabel: "Nationalities",
  },
  is: {
    chip: "PART 3 • NATIONALITIES",
    kicker: "YES OR NO?",
    nextLabel: "Results",
  },
};

const flowOrder = ["who", "where", "is"];

const state = {
  mode: null,
  index: 0,
  score: 0,
  answered: false,
  flow: false,
  flowIndex: 0,
  totalScore: 0,
  sound: true,
  currentOptions: [],
  stageAddedToTotal: false,
};

const homeScreen = document.querySelector("#homeScreen");
const gameScreen = document.querySelector("#gameScreen");
const finishScreen = document.querySelector("#finishScreen");
const menuButton = document.querySelector("#menuButton");
const brandButton = document.querySelector("#brandButton");
const soundButton = document.querySelector("#soundButton");
const soundIcon = document.querySelector("#soundIcon");
const soundLabel = document.querySelector("#soundLabel");
const fullscreenButton = document.querySelector("#fullscreenButton");
const fullLessonButton = document.querySelector("#fullLessonButton");
const modeButtons = [...document.querySelectorAll("[data-mode]")];

const partChip = document.querySelector("#partChip");
const progressFill = document.querySelector("#progressFill");
const progressText = document.querySelector("#progressText");
const scoreText = document.querySelector("#scoreText");
const speakerCard = document.querySelector("#speakerCard");
const speakerImage = document.querySelector("#speakerImage");
const speakerName = document.querySelector("#speakerName");
const characterImage = document.querySelector("#characterImage");
const characterStage = document.querySelector("#characterStage");
const questionKicker = document.querySelector("#questionKicker");
const questionText = document.querySelector("#questionText");
const optionsGrid = document.querySelector("#optionsGrid");
const feedbackPanel = document.querySelector("#feedbackPanel");
const feedbackIcon = document.querySelector("#feedbackIcon");
const feedbackTitle = document.querySelector("#feedbackTitle");
const feedbackText = document.querySelector("#feedbackText");
const nextButton = document.querySelector("#nextButton");
const speakButton = document.querySelector("#speakButton");
const celebration = document.querySelector("#celebration");
const liveRegion = document.querySelector("#liveRegion");
const maxOptionKey = document.querySelector("#maxOptionKey");

const finishEyebrow = document.querySelector("#finishEyebrow");
const finishTitle = document.querySelector("#finishTitle");
const finishMessage = document.querySelector("#finishMessage");
const finishScore = document.querySelector("#finishScore");
const finishTotal = document.querySelector("#finishTotal");
const resultStars = document.querySelector("#resultStars");
const repeatButton = document.querySelector("#repeatButton");
const continueButton = document.querySelector("#continueButton");
const continueLabel = document.querySelector("#continueLabel");

let audioContext = null;

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function showScreen(screen) {
  homeScreen.hidden = screen !== "home";
  gameScreen.hidden = screen !== "game";
  finishScreen.hidden = screen !== "finish";
  menuButton.hidden = screen === "home";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goHome() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  state.mode = null;
  state.flow = false;
  showScreen("home");
  liveRegion.textContent = "";
}

function startMode(mode, options = {}) {
  state.mode = mode;
  state.index = 0;
  state.score = 0;
  state.answered = false;
  state.stageAddedToTotal = false;

  if (options.newFlow) {
    state.flow = true;
    state.flowIndex = 0;
    state.totalScore = 0;
  } else if (!options.keepFlow) {
    state.flow = false;
    state.flowIndex = flowOrder.indexOf(mode);
    state.totalScore = 0;
  }

  showScreen("game");
  renderQuestion();
}

function deterministicOptions(correct, pool, count, seed) {
  const uniquePool = pool.filter((item, index) => item !== correct && pool.indexOf(item) === index);
  const picked = [];
  let cursor = (seed * 3 + 1) % uniquePool.length;

  while (picked.length < count - 1 && picked.length < uniquePool.length) {
    const candidate = uniquePool[cursor % uniquePool.length];
    if (!picked.includes(candidate)) picked.push(candidate);
    cursor += 4;
  }

  const choices = [correct, ...picked];
  const shift = seed % choices.length;
  return [...choices.slice(shift), ...choices.slice(0, shift)];
}

function buildWhoQuestion(character, index) {
  const choices = deterministicOptions(
    character.name,
    characters.map((item) => item.name),
    4,
    index
  );

  return {
    prompt: "Who is this?",
    options: choices.map((text) => ({ text, correct: text === character.name })),
    success: `Great! This is ${character.name}.`,
    correction: `This is ${character.name}.`,
  };
}

function buildWhereQuestion(character, index) {
  const simpleAnswers = index < 2;
  const choices = deterministicOptions(
    character.country,
    characters.map((item) => item.country),
    4,
    index + 2
  );
  const subject = capitalize(character.pronoun);

  return {
    prompt: `Where is ${character.name} from?`,
    options: choices.map((country) => ({
      text: simpleAnswers ? country : `${subject} is from ${country}.`,
      correct: country === character.country,
    })),
    success: `Exactly! ${subject} is from ${character.country}.`,
    correction: `${subject} is from ${character.country}.`,
  };
}

function buildIsQuestion(character, index) {
  const subject = capitalize(character.pronoun);
  const asked = character.checkNationality;
  const isTrue = asked === character.nationality;
  const shortAnswers = index < 4;
  const wrongNationality = characters[(index + 4) % characters.length].nationality;
  let yesAnswer;
  let noAnswer;

  if (shortAnswers) {
    yesAnswer = `Yes, ${character.pronoun} is.`;
    noAnswer = `No, ${character.pronoun} isn't.`;
  } else if (isTrue) {
    yesAnswer = `Yes, ${character.pronoun} is. ${subject} is ${character.nationality}.`;
    noAnswer = `No, ${character.pronoun} isn't. ${subject} is ${wrongNationality}.`;
  } else {
    yesAnswer = `Yes, ${character.pronoun} is. ${subject} is ${asked}.`;
    noAnswer = `No, ${character.pronoun} isn't ${asked}. ${subject} is ${character.nationality}.`;
  }

  const options = [
    { text: yesAnswer, correct: isTrue },
    { text: noAnswer, correct: !isTrue },
  ];

  if (index % 2 === 1) options.reverse();

  return {
    prompt: `Is ${character.pronoun} ${asked}?`,
    options,
    success: isTrue
      ? `Yes! ${subject} is ${character.nationality}.`
      : `That's right! ${subject} is ${character.nationality}.`,
    correction: `${subject} is ${character.nationality}.`,
  };
}

function buildQuestion(character, index) {
  if (state.mode === "who") return buildWhoQuestion(character, index);
  if (state.mode === "where") return buildWhereQuestion(character, index);
  return buildIsQuestion(character, index);
}

function renderQuestion() {
  const character = characters[state.index];
  const speaker = characters[(state.index + characters.length - 1) % characters.length];
  const question = buildQuestion(character, state.index);

  state.answered = false;
  state.currentOptions = question.options;
  maxOptionKey.textContent = question.options.length;
  characterImage.src = character.image;
  characterImage.alt = `${character.name}, ${character.nationality}`;
  characterImage.style.animation = "none";
  void characterImage.offsetHeight;
  characterImage.style.animation = "";

  if (state.mode === "is") {
    speakerCard.hidden = true;
  } else {
    speakerCard.hidden = false;
    speakerImage.src = speaker.image;
    speakerImage.alt = speaker.name;
    speakerName.textContent = speaker.name;
  }

  partChip.textContent = modes[state.mode].chip;
  questionKicker.textContent = modes[state.mode].kicker;
  questionText.textContent = question.prompt;
  progressText.textContent = `${state.index + 1} / ${characters.length}`;
  progressFill.style.width = `${((state.index + 1) / characters.length) * 100}%`;
  scoreText.textContent = state.score;

  feedbackPanel.hidden = true;
  feedbackPanel.className = "feedback-panel";
  nextButton.hidden = true;
  nextButton.querySelector("span:first-child").textContent =
    state.index === characters.length - 1 ? "Finish" : "Next";

  renderOptions(question);
  liveRegion.textContent = `${question.prompt} Question ${state.index + 1} of ${characters.length}.`;
}

function renderOptions(question) {
  optionsGrid.innerHTML = "";

  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-button";
    button.dataset.correct = String(option.correct);
    button.innerHTML = `
      <span class="option-key">${index + 1}</span>
      <span class="option-text"></span>
      <span class="option-mark" aria-hidden="true"></span>
    `;
    button.querySelector(".option-text").textContent = option.text;
    button.addEventListener("click", () => chooseAnswer(option, button, question));
    optionsGrid.appendChild(button);
  });
}

function chooseAnswer(option, chosenButton, question) {
  if (state.answered) return;
  state.answered = true;

  const buttons = [...optionsGrid.querySelectorAll(".option-button")];
  buttons.forEach((button) => {
    button.disabled = true;
    if (button.dataset.correct === "true") {
      button.classList.add("correct");
      button.querySelector(".option-mark").textContent = "✓";
    } else if (button === chosenButton) {
      button.classList.add("wrong");
      button.querySelector(".option-mark").textContent = "×";
    } else {
      button.classList.add("dimmed");
    }
  });

  if (option.correct) {
    state.score += 1;
    scoreText.textContent = state.score;
    feedbackPanel.classList.add("is-correct");
    feedbackIcon.textContent = "✓";
    feedbackTitle.textContent = "Excellent!";
    feedbackText.textContent = question.success;
    liveRegion.textContent = `Correct. ${question.success}`;
    playTone(true);
    celebrate();
  } else {
    feedbackPanel.classList.add("is-wrong");
    feedbackIcon.textContent = "×";
    feedbackTitle.textContent = "Good try!";
    feedbackText.textContent = question.correction;
    liveRegion.textContent = `Not quite. ${question.correction}`;
    playTone(false);
  }

  feedbackPanel.hidden = false;
  nextButton.hidden = false;
  nextButton.focus({ preventScroll: true });
}

function nextQuestion() {
  if (!state.answered) return;
  if (state.index < characters.length - 1) {
    state.index += 1;
    renderQuestion();
    return;
  }
  showFinish();
}

function showFinish() {
  if (!state.stageAddedToTotal) {
    state.totalScore += state.score;
    state.stageAddedToTotal = true;
  }

  const isFinalFlowPart = state.flow && state.flowIndex === flowOrder.length - 1;
  const shownScore = isFinalFlowPart ? state.totalScore : state.score;
  const shownTotal = isFinalFlowPart ? characters.length * flowOrder.length : characters.length;
  const percentage = shownScore / shownTotal;

  showScreen("finish");
  finishEyebrow.textContent = isFinalFlowPart ? "FULL SEQUENCE COMPLETE" : "PART COMPLETE";
  finishTitle.textContent = percentage >= 0.85 ? "Brilliant work!" : percentage >= 0.6 ? "Great progress!" : "Keep going!";
  finishMessage.textContent = isFinalFlowPart
    ? "You completed names, countries and nationalities."
    : "You met all 13 friends in this part.";
  finishScore.textContent = shownScore;
  finishTotal.textContent = `out of ${shownTotal}`;
  resultStars.textContent = percentage >= 0.85 ? "★★★" : percentage >= 0.6 ? "★★☆" : "★☆☆";

  if (state.flow && !isFinalFlowPart) {
    continueLabel.textContent = `Next: ${modes[state.mode].nextLabel}`;
  } else {
    continueLabel.textContent = "Back to menu";
  }

  playFinishTone();
}

function continueAfterFinish() {
  if (state.flow && state.flowIndex < flowOrder.length - 1) {
    state.flowIndex += 1;
    startMode(flowOrder[state.flowIndex], { keepFlow: true });
  } else {
    goHome();
  }
}

function repeatCurrentPart() {
  if (state.flow) {
    state.totalScore = Math.max(0, state.totalScore - state.score);
    startMode(state.mode, { keepFlow: true });
  } else {
    startMode(state.mode);
  }
}

function speakQuestion() {
  if (!("speechSynthesis" in window)) {
    liveRegion.textContent = "Speech is not available in this browser.";
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(questionText.textContent);
  utterance.lang = "en-GB";
  utterance.rate = 0.82;
  utterance.pitch = 1.04;
  window.speechSynthesis.speak(utterance);
}

function getAudioContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioContext = new AudioContextClass();
  }
  return audioContext;
}

function playTone(correct) {
  if (!state.sound) return;
  const context = getAudioContext();
  if (!context) return;

  const now = context.currentTime;
  const notes = correct ? [523.25, 659.25, 783.99] : [240, 190];
  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = correct ? "sine" : "triangle";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, now + index * 0.09);
    gain.gain.exponentialRampToValueAtTime(0.12, now + index * 0.09 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.09 + 0.13);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now + index * 0.09);
    oscillator.stop(now + index * 0.09 + 0.15);
  });
}

function playFinishTone() {
  if (!state.sound) return;
  [true, true].forEach((_, index) => window.setTimeout(() => playTone(true), index * 260));
}

function toggleSound() {
  state.sound = !state.sound;
  soundButton.setAttribute("aria-pressed", String(state.sound));
  soundIcon.textContent = state.sound ? "🔊" : "🔇";
  soundLabel.textContent = state.sound ? "Sound" : "Muted";
}

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch {
    liveRegion.textContent = "Full screen could not be opened. Press F11 in the browser.";
  }
}

function celebrate() {
  celebration.innerHTML = "";
  const colors = ["#ffc846", "#ff6f61", "#13a89e", "#8067d8"];
  for (let index = 0; index < 14; index += 1) {
    const spark = document.createElement("span");
    const angle = (Math.PI * 2 * index) / 14;
    const distance = 100 + (index % 4) * 23;
    spark.className = "spark";
    spark.textContent = index % 3 === 0 ? "★" : "●";
    spark.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
    spark.style.setProperty("--y", `${Math.sin(angle) * distance}px`);
    spark.style.setProperty("--spark-color", colors[index % colors.length]);
    spark.style.setProperty("--spark-size", `${1 + (index % 3) * 0.28}rem`);
    celebration.appendChild(spark);
  }
  window.setTimeout(() => {
    celebration.innerHTML = "";
  }, 850);
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => startMode(button.dataset.mode));
});

fullLessonButton.addEventListener("click", () => startMode("who", { newFlow: true }));
brandButton.addEventListener("click", goHome);
menuButton.addEventListener("click", goHome);
soundButton.addEventListener("click", toggleSound);
fullscreenButton.addEventListener("click", toggleFullscreen);
speakButton.addEventListener("click", speakQuestion);
nextButton.addEventListener("click", nextQuestion);
continueButton.addEventListener("click", continueAfterFinish);
repeatButton.addEventListener("click", repeatCurrentPart);

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "f" && !event.ctrlKey && !event.metaKey) {
    event.preventDefault();
    toggleFullscreen();
    return;
  }

  if (gameScreen.hidden) return;

  if (["1", "2", "3", "4"].includes(event.key) && !state.answered) {
    const button = optionsGrid.querySelectorAll(".option-button")[Number(event.key) - 1];
    if (button) button.click();
  }

  if ((event.key.toLowerCase() === "n" || event.key === "ArrowRight") && state.answered) {
    event.preventDefault();
    nextQuestion();
  }

  if (event.key.toLowerCase() === "l") speakQuestion();
});

characters.forEach((character) => {
  const image = new Image();
  image.src = character.image;
});

showScreen("home");
