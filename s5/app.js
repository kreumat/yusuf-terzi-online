(() => {
  "use strict";

  const countries = [
    {
      geoCode: "RUS",
      country: "Russia",
      nationality: "Russian",
      character: "Alex",
      pronoun: "She",
      image: "assets/characters/country/02_alex_russia.webp",
      flag: "assets/flags/ru.png",
      focusWidth: 510,
    },
    {
      geoCode: "TUR",
      country: "Türkiye",
      nationality: "Turkish",
      character: "Steve",
      pronoun: "He",
      image: "assets/characters/country/01_steve_turkiye.webp",
      flag: "assets/flags/tr.png",
      focusWidth: 190,
    },
    {
      geoCode: "CHN",
      country: "China",
      nationality: "Chinese",
      character: "Panda",
      pronoun: "It",
      image: "assets/characters/country/03_panda_china.webp",
      flag: "assets/flags/cn.png",
      focusWidth: 310,
    },
    {
      geoCode: "FRA",
      country: "France",
      nationality: "French",
      character: "My Melody",
      pronoun: "She",
      image: "assets/characters/country/04_my_melody_france.webp",
      flag: "assets/flags/fr.png",
      focusWidth: 150,
    },
    {
      geoCode: "ITA",
      country: "Italy",
      nationality: "Italian",
      character: "Cinnamoroll",
      pronoun: "He",
      image: "assets/characters/country/05_cinnamoroll_italy.webp",
      flag: "assets/flags/it.png",
      focusWidth: 135,
    },
    {
      geoCode: "DEU",
      country: "Germany",
      nationality: "German",
      character: "Sheep",
      pronoun: "It",
      image: "assets/characters/country/06_sheep_germany.webp",
      flag: "assets/flags/de.png",
      focusWidth: 125,
    },
    {
      geoCode: "GRC",
      country: "Greece",
      nationality: "Greek",
      character: "Cow",
      pronoun: "It",
      image: "assets/characters/country/07_cow_greece.webp",
      flag: "assets/flags/gr.png",
      focusWidth: 125,
    },
    {
      geoCode: "USA",
      country: "the U.S.A",
      shortCountry: "U.S.A.",
      nationality: "American",
      character: "Wolf",
      pronoun: "It",
      image: "assets/characters/country/08_wolf_usa.webp",
      flag: "assets/flags/us.png",
      focusWidth: 450,
    },
    {
      geoCode: "GBR",
      country: "Britain",
      nationality: "British",
      character: "Hello Kitty",
      pronoun: "She",
      image: "assets/characters/country/09_hello_kitty_britain.webp",
      flag: "assets/flags/gb.png",
      focusWidth: 125,
    },
    {
      geoCode: "JPN",
      country: "Japan",
      nationality: "Japanese",
      character: "Kuromi",
      pronoun: "She",
      image: "assets/characters/country/10_kuromi_japan.webp",
      flag: "assets/flags/jp.png",
      focusWidth: 160,
    },
    {
      geoCode: "IRN",
      country: "Iran",
      nationality: "Iranian",
      character: "Cat",
      pronoun: "It",
      image: "assets/characters/country/11_cat_iran.webp",
      flag: "assets/flags/ir.png",
      focusWidth: 185,
    },
    {
      geoCode: "IRQ",
      country: "Iraq",
      nationality: "Iraqi",
      character: "Parrot",
      pronoun: "It",
      image: "assets/characters/country/12_parrot_iraq.webp",
      flag: "assets/flags/iq.png",
      focusWidth: 145,
    },
    {
      geoCode: "PAK",
      country: "Pakistan",
      nationality: "Pakistani",
      character: "Bee",
      pronoun: "It",
      image: "assets/characters/country/13_bee_pakistan.webp",
      flag: "assets/flags/pk.png",
      focusWidth: 165,
    },
  ];

  const neutralCharacters = [
    { name: "Steve", image: "assets/characters/neutral/01_steve.webp" },
    { name: "Hello Kitty", image: "assets/characters/neutral/02_hello_kitty.webp" },
    { name: "Sonic", image: "assets/characters/neutral/03_sonic.webp" },
    { name: "Creeper", image: "assets/characters/neutral/04_creeper.webp" },
    { name: "Bunny", image: "assets/characters/neutral/05_bunny.webp" },
    { name: "Lion", image: "assets/characters/neutral/07_lion.webp" },
  ];

  const directions = ["north", "east", "south", "west"];

  const sections = [
    { id: "context", label: "Meet Steve and Kuromi", status: "Context" },
    { id: "tour", label: "13-Country Tour", status: "Activity 1 · Country Tour" },
    { id: "map", label: "Where is ... from?", status: "Activity 2 · Map Hunt" },
    { id: "select", label: "Choose a Character", status: "Activity 3 · Character Choice" },
    { id: "compass", label: "Countries and Directions", status: "Activity 3 · Direction Game" },
    { id: "final", label: "Where is ...?", status: "Activity 4 · Where Is ...?" },
    { id: "success", label: "Mission Complete", status: "Wrap-up" },
  ];

  const app = document.getElementById("app");
  const status = document.getElementById("lessonStatus");
  const drawer = document.getElementById("drawer");
  const menu = document.getElementById("lessonMenu");
  const backButton = document.getElementById("backButton");
  const nextButton = document.getElementById("nextButton");
  const toast = document.getElementById("toast");

  const state = {
    section: "context",
    tourIndex: 0,
    mapOrder: shuffle(countries.map((country) => country.geoCode)),
    mapIndex: 0,
    mapCorrect: false,
    selectedCharacter: null,
    compassRound: null,
    compassCorrect: false,
    compassTravelDirection: null,
    finalRound: null,
    finalCorrect: false,
  };

  let toastTimer = null;
  let compassReturnTimer = null;

  function shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  }

  function sample(items, count) {
    return shuffle(items).slice(0, count);
  }

  function countryByCode(code) {
    return countries.find((country) => country.geoCode === code);
  }

  function visibleCountryName(country) {
    return country.shortCountry || country.country;
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1450);
  }

  function saveProgress() {
    const serializable = {
      section: state.section,
      tourIndex: state.tourIndex,
      mapOrder: state.mapOrder,
      mapIndex: state.mapIndex,
      selectedCharacter: state.selectedCharacter,
    };
    try {
      localStorage.setItem("week5-world-map-progress", JSON.stringify(serializable));
    } catch (_error) {
      // The site works without local storage (for example from a restricted USB drive).
    }
  }

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem("week5-world-map-progress"));
      if (!saved || !sections.some((section) => section.id === saved.section)) return;
      state.section = saved.section;
      state.tourIndex = Math.min(Math.max(saved.tourIndex || 0, 0), countries.length - 1);
      if (
        Array.isArray(saved.mapOrder) &&
        saved.mapOrder.length === countries.length &&
        saved.mapOrder.every((code) => countryByCode(code))
      ) {
        state.mapOrder = saved.mapOrder;
      }
      state.mapIndex = Math.min(Math.max(saved.mapIndex || 0, 0), countries.length - 1);
      state.selectedCharacter = neutralCharacters.some((character) => character.name === saved.selectedCharacter)
        ? saved.selectedCharacter
        : null;
    } catch (_error) {
      // Start cleanly if a previous save is unavailable or malformed.
    }
  }

  function goTo(sectionId, { restart = false } = {}) {
    if (!sections.some((section) => section.id === sectionId)) return;
    window.clearTimeout(compassReturnTimer);
    compassReturnTimer = null;
    if (restart && sectionId === "tour") {
      state.tourIndex = 0;
    }
    if (restart && sectionId === "map") {
      state.mapIndex = 0;
      state.mapOrder = shuffle(countries.map((country) => country.geoCode));
    }
    state.section = sectionId;
    state.mapCorrect = false;
    state.compassCorrect = false;
    state.finalCorrect = false;
    if (sectionId === "compass") createCompassRound();
    if (sectionId === "final") createFinalRound();
    saveProgress();
    closeMenu();
    render();
  }

  function sectionIndex() {
    return sections.findIndex((section) => section.id === state.section);
  }

  function previousSection() {
    const index = sectionIndex();
    if (index > 0) goTo(sections[index - 1].id);
  }

  function nextSection() {
    const index = sectionIndex();
    if (index < sections.length - 1) {
      if (state.section === "select" && !state.selectedCharacter) {
        showToast("Choose a character first.");
        return;
      }
      const targetSection = sections[index + 1].id;
      goTo(targetSection, { restart: state.section === "context" && targetSection === "tour" });
    }
  }

  function openMenu() {
    buildMenu();
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
  }

  function closeMenu() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
  }

  function buildMenu() {
    menu.innerHTML = "";
    sections.forEach((section, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = state.section === section.id ? "active" : "";
      button.innerHTML = `<span class="menu-number">${index + 1}</span><span>${section.label}</span>`;
      button.addEventListener("click", () => {
        const restart = section.id === "tour" || section.id === "map";
        goTo(section.id, { restart });
      });
      menu.appendChild(button);
    });
  }

  function updateHeader() {
    const current = sections[sectionIndex()];
    status.textContent = current.status;
    backButton.disabled = sectionIndex() === 0;
    nextButton.disabled = sectionIndex() === sections.length - 1;
  }

  function render() {
    updateHeader();
    switch (state.section) {
      case "context":
        renderContext();
        break;
      case "tour":
        renderTour();
        break;
      case "map":
        renderMapGame();
        break;
      case "select":
        renderCharacterSelection();
        break;
      case "compass":
        renderCompassGame();
        break;
      case "final":
        renderFinalGame();
        break;
      case "success":
        renderSuccess();
        break;
      default:
        goTo("context");
    }
  }

  function renderContext() {
    app.innerHTML = `
      <section class="screen context-screen">
        <div class="context-copy">
          <span class="eyebrow">A NEW WORLD ADVENTURE</span>
          <h1 class="screen-title">Steve and Kuromi want to learn about the world!</h1>
          <p class="screen-subtitle">Let’s explore countries, nationalities and directions together.</p>
          <div class="context-actions">
            <button class="primary-button" id="startTourButton" type="button">Let’s start with the countries! →</button>
          </div>
        </div>
        <div class="context-characters" aria-label="Steve and Kuromi">
          <img class="context-character" src="assets/characters/country/01_steve_turkiye.webp" alt="Steve" />
          <img class="context-character" src="assets/characters/country/10_kuromi_japan.webp" alt="Kuromi" />
          <div class="speech-bubble">Can you help us?</div>
        </div>
      </section>
    `;
    document
      .getElementById("startTourButton")
      .addEventListener("click", () => goTo("tour", { restart: true }));
  }

  function renderTour() {
    const country = countries[state.tourIndex];
    const isLast = state.tourIndex === countries.length - 1;
    app.innerHTML = `
      <section class="screen">
        <div class="map-layout">
          <div class="map-card">
            <div class="map-heading">Find ${visibleCountryName(country)} on the map.</div>
            <div class="map-controls" aria-label="Harita kontrolleri">
              <button class="map-control" data-map-control="zoom-in" type="button" aria-label="Yakınlaştır">+</button>
              <button class="map-control" data-map-control="zoom-out" type="button" aria-label="Uzaklaştır">−</button>
              <button class="map-control" data-map-control="reset" type="button" aria-label="Haritayı sıfırla">⌂</button>
            </div>
            <div id="mapMount" class="map-mount"></div>
          </div>
          <aside class="side-panel">
            <div class="panel-top-row">
              <span class="counter-pill">${state.tourIndex + 1} / ${countries.length}</span>
              <button class="section-reset-button" id="tourRestartButton" type="button">↻ Restart tour</button>
            </div>
            <img class="side-character" src="${country.image}" alt="${country.character}" />
            <div class="flag-name-row">
              <img class="country-flag" src="${country.flag}" alt="Flag of ${visibleCountryName(country)}" />
              <h2 class="country-name">${visibleCountryName(country)}</h2>
            </div>
            <div class="sentence-stack">
              <p class="model-sentence">${country.character} is from ${country.country}.</p>
              <p class="model-sentence">${country.character} is ${country.nationality}.</p>
            </div>
            <div class="panel-action tour-actions ${state.tourIndex === 0 ? "single" : ""}">
              ${
                state.tourIndex > 0
                  ? '<button class="secondary-button" id="tourPreviousButton" type="button">← Previous</button>'
                  : ""
              }
              <button class="primary-button" id="tourNextButton" type="button">
                ${isLast ? "Start the map game →" : "Next country →"}
              </button>
            </div>
          </aside>
        </div>
      </section>
    `;
    createWorldMap(document.getElementById("mapMount"), {
      currentCode: country.geoCode,
      focusCode: country.geoCode,
      showCurrentLabel: true,
      interactive: false,
    });
    const previous = document.getElementById("tourPreviousButton");
    if (previous) {
      previous.addEventListener("click", () => {
        state.tourIndex -= 1;
        saveProgress();
        renderTour();
      });
    }
    document.getElementById("tourRestartButton").addEventListener("click", () => {
      state.tourIndex = 0;
      saveProgress();
      renderTour();
    });
    document.getElementById("tourNextButton").addEventListener("click", () => {
      if (isLast) {
        state.mapIndex = 0;
        state.mapCorrect = false;
        goTo("map");
      } else {
        state.tourIndex += 1;
        saveProgress();
        renderTour();
      }
    });
  }

  function renderMapGame() {
    const country = countryByCode(state.mapOrder[state.mapIndex]);
    const isLast = state.mapIndex === countries.length - 1;
    app.innerHTML = `
      <section class="screen">
        <div class="map-layout">
          <div class="map-card">
            <div class="map-heading">Touch the country on the map.</div>
            <div class="map-controls" aria-label="Harita kontrolleri">
              <button class="map-control" data-map-control="zoom-in" type="button" aria-label="Yakınlaştır">+</button>
              <button class="map-control" data-map-control="zoom-out" type="button" aria-label="Uzaklaştır">−</button>
              <button class="map-control" data-map-control="reset" type="button" aria-label="Haritayı sıfırla">⌂</button>
            </div>
            <div id="mapMount" class="map-mount"></div>
          </div>
          <aside class="side-panel">
            <div class="panel-top-row">
              <span class="counter-pill">Question ${state.mapIndex + 1} / ${countries.length}</span>
              <button class="section-reset-button" id="mapRestartButton" type="button">↻ Restart game</button>
            </div>
            <img class="side-character" src="${country.image}" alt="${country.character}" />
            <p class="question-sentence">Where is ${country.character} from?</p>
            <p class="answer-frame">${country.pronoun} is from ________.</p>
            ${
              state.mapCorrect
                ? `<p class="revealed-answer">${country.pronoun} is from ${country.country}. ${country.pronoun} is ${country.nationality}.</p>`
                : ""
            }
            <div class="panel-action">
              ${
                state.mapCorrect
                  ? `<button class="primary-button" id="mapNextButton" type="button">${
                      isLast ? "Choose a character →" : "Next question →"
                    }</button>`
                  : ""
              }
            </div>
          </aside>
        </div>
      </section>
    `;
    const controller = createWorldMap(document.getElementById("mapMount"), {
      correctCode: state.mapCorrect ? country.geoCode : null,
      interactive: !state.mapCorrect,
      onCountryClick: (code, group) => {
        if (code === country.geoCode) {
          state.mapCorrect = true;
          group.classList.add("correct");
          window.setTimeout(renderMapGame, 380);
        } else {
          group.classList.add("wrong");
          showToast("Try again — ask another student.");
          window.setTimeout(() => group.classList.remove("wrong"), 750);
        }
      },
    });
    if (state.mapCorrect) controller.markCorrect(country.geoCode);

    document.getElementById("mapRestartButton").addEventListener("click", () => {
      state.mapIndex = 0;
      state.mapOrder = shuffle(countries.map((item) => item.geoCode));
      state.mapCorrect = false;
      saveProgress();
      renderMapGame();
    });

    const next = document.getElementById("mapNextButton");
    if (next) {
      next.addEventListener("click", () => {
        if (isLast) {
          goTo("select");
        } else {
          state.mapIndex += 1;
          state.mapCorrect = false;
          saveProgress();
          renderMapGame();
        }
      });
    }
  }

  function renderCharacterSelection() {
    app.innerHTML = `
      <section class="screen selection-screen">
        <div class="selection-heading">
          <span class="eyebrow">DIRECTION CHALLENGE</span>
          <h1 class="screen-title">Choose your character</h1>
          <p class="screen-subtitle">This character will travel around the compass.</p>
        </div>
        <div class="character-grid">
          ${neutralCharacters
            .map(
              (character) => `
                <button class="character-button" type="button" data-character="${character.name}">
                  <img src="${character.image}" alt="${character.name}" />
                  <span>${character.name}</span>
                </button>
              `,
            )
            .join("")}
        </div>
      </section>
    `;
    app.querySelectorAll("[data-character]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedCharacter = button.dataset.character;
        saveProgress();
        goTo("compass");
      });
    });
  }

  function createCompassRound() {
    if (!state.selectedCharacter) state.selectedCharacter = neutralCharacters[0].name;
    const choices = sample(countries, 4);
    const target = choices[Math.floor(Math.random() * choices.length)];
    const shuffledDirections = shuffle(directions);
    state.compassRound = {
      targetCode: target.geoCode,
      positions: Object.fromEntries(choices.map((country, index) => [shuffledDirections[index], country.geoCode])),
    };
    state.compassCorrect = false;
    state.compassTravelDirection = null;
  }

  function renderCompassGame() {
    if (!state.compassRound) createCompassRound();
    const character = neutralCharacters.find((item) => item.name === state.selectedCharacter) || neutralCharacters[0];
    const target = countryByCode(state.compassRound.targetCode);
    const targetDirection = directions.find(
      (direction) => state.compassRound.positions[direction] === target.geoCode,
    );

    app.innerHTML = `
      <section class="screen compass-screen">
        <div class="game-prompt ${state.compassCorrect ? "correct-prompt" : ""}">
          <span class="eyebrow">READ, LOOK AND ANSWER</span>
          <h1>${character.name} is from ${target.country}. <span class="prompt-question">Where is ${visibleCountryName(target)}?</span></h1>
          ${
            state.compassCorrect
              ? `<div class="prompt-result">✓ ${visibleCountryName(target)} is in the ${targetDirection}.</div>`
              : ""
          }
        </div>
        ${directions.map((direction) => `<span class="compass-label ${direction}">${direction.toUpperCase()}</span>`).join("")}
        <img class="center-character ${
          state.compassCorrect ? `travel-${state.compassTravelDirection || targetDirection}` : ""
        }" src="${character.image}" alt="${character.name}" />
        ${directions
          .map((direction) => {
            const country = countryByCode(state.compassRound.positions[direction]);
            const correctClass = state.compassCorrect && country.geoCode === target.geoCode ? "correct" : "";
            return `
              <button class="country-card ${direction} ${correctClass}" type="button" data-direction="${direction}">
                <span class="direction-word">${direction.toUpperCase()}</span>
                <img src="${country.flag}" alt="" />
                <span>${visibleCountryName(country)}</span>
              </button>
            `;
          })
          .join("")}
      </section>
    `;

    app.querySelectorAll("[data-direction]").forEach((button) => {
      button.disabled = state.compassCorrect;
      button.addEventListener("click", () => {
        const direction = button.dataset.direction;
        if (state.compassRound.positions[direction] === target.geoCode) {
          state.compassCorrect = true;
          state.compassTravelDirection = direction;
          renderCompassGame();
          compassReturnTimer = window.setTimeout(() => {
            if (state.section === "compass" && state.compassCorrect) {
              goTo("select");
            }
          }, 2600);
        } else {
          button.classList.add("wrong");
          showToast("Try again — ask another student.");
          window.setTimeout(() => button.classList.remove("wrong"), 750);
        }
      });
    });

  }

  function createFinalRound() {
    if (!state.selectedCharacter) state.selectedCharacter = neutralCharacters[0].name;
    state.finalRound = { direction: directions[Math.floor(Math.random() * directions.length)] };
    state.finalCorrect = false;
  }

  function renderFinalGame() {
    if (!state.finalRound) createFinalRound();
    const character = neutralCharacters.find((item) => item.name === state.selectedCharacter) || neutralCharacters[0];
    const correctDirection = state.finalRound.direction;

    app.innerHTML = `
      <section class="screen compass-screen final-screen">
        <div class="game-prompt ${state.finalCorrect ? "correct-prompt" : ""}">
          <span class="eyebrow">LOOK AND ANSWER</span>
          <h1>Where is ${character.name}?</h1>
          ${
            state.finalCorrect
              ? `<div class="prompt-result">${character.name} is in the ${correctDirection}.
                   <button class="next-round" id="nextFinalRound" type="button">New round →</button>
                 </div>`
              : ""
          }
        </div>
        ${directions.map((direction) => `<span class="compass-label ${direction}">${direction.toUpperCase()}</span>`).join("")}
        <img class="final-character ${correctDirection}" src="${character.image}" alt="${character.name}" />
        <div class="answer-grid">
          ${directions
            .map(
              (direction) => `
                <button class="answer-button ${state.finalCorrect && direction === correctDirection ? "correct" : ""}"
                        type="button" data-answer="${direction}">
                  ${character.name} is in the ${direction}.
                </button>
              `,
            )
            .join("")}
        </div>
      </section>
    `;

    app.querySelectorAll("[data-answer]").forEach((button) => {
      button.disabled = state.finalCorrect;
      button.addEventListener("click", () => {
        if (button.dataset.answer === correctDirection) {
          state.finalCorrect = true;
          renderFinalGame();
        } else {
          button.classList.add("wrong");
          showToast("Try again — ask another student.");
          window.setTimeout(() => button.classList.remove("wrong"), 750);
        }
      });
    });

    const next = document.getElementById("nextFinalRound");
    if (next) {
      next.addEventListener("click", () => {
        createFinalRound();
        renderFinalGame();
      });
    }
  }

  function renderSuccess() {
    app.innerHTML = `
      <section class="screen success-screen">
        <div class="success-card">
          <div class="success-icon" aria-hidden="true">🌍</div>
          <span class="eyebrow">MISSION COMPLETE</span>
          <h1 class="screen-title">Great work, explorers!</h1>
          <p class="screen-subtitle">You helped Steve and Kuromi learn about countries, nationalities and directions.</p>
          <button class="primary-button" id="playAgainButton" type="button">Play the direction game again</button>
        </div>
      </section>
    `;
    document.getElementById("playAgainButton").addEventListener("click", () => {
      goTo("compass");
    });
  }

  function createWorldMap(mount, options = {}) {
    const rows = window.WORLD_MAP_DATA || [];
    const svgNamespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNamespace, "svg");
    svg.setAttribute("class", "world-map");
    svg.setAttribute("viewBox", "0 0 1000 500");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "World map with thirteen interactive target countries");

    const ocean = document.createElementNS(svgNamespace, "rect");
    ocean.setAttribute("x", "0");
    ocean.setAttribute("y", "0");
    ocean.setAttribute("width", "1000");
    ocean.setAttribute("height", "500");
    ocean.setAttribute("fill", "#c9f3ff");
    svg.appendChild(ocean);

    const mapGroup = document.createElementNS(svgNamespace, "g");
    svg.appendChild(mapGroup);
    const groups = new Map();
    let dragged = false;

    const backgroundPath = document.createElementNS(svgNamespace, "path");
    backgroundPath.setAttribute(
      "d",
      rows
        .filter((row) => !row.target)
        .map((row) => row.path)
        .join(" "),
    );
    backgroundPath.setAttribute("class", "country-shape world-background");
    backgroundPath.setAttribute("aria-hidden", "true");
    mapGroup.appendChild(backgroundPath);

    rows.filter((row) => row.target).forEach((row) => {
      const group = document.createElementNS(svgNamespace, "g");
      group.setAttribute("class", "map-country is-target");
      group.dataset.code = row.code;
      group.setAttribute("role", "button");

      const path = document.createElementNS(svgNamespace, "path");
      path.setAttribute("d", row.path);
      path.setAttribute("class", "country-shape target");
      group.appendChild(path);

      const hit = document.createElementNS(svgNamespace, "circle");
      hit.setAttribute("class", "country-hit");
      hit.setAttribute("cx", row.labelX);
      hit.setAttribute("cy", row.labelY);
      hit.setAttribute("r", "22");
      group.appendChild(hit);

      const activate = () => {
        if (!options.interactive || dragged || !options.onCountryClick) return;
        options.onCountryClick(row.code, group);
      };
      group.addEventListener("click", activate);
      groups.set(row.code, group);
      mapGroup.appendChild(group);
    });

    const currentRow = rows.find((row) => row.code === options.currentCode);
    if (currentRow) {
      const group = groups.get(currentRow.code);
      if (group) group.classList.add("current");
      if (options.showCurrentLabel) {
        const label = document.createElementNS(svgNamespace, "text");
        label.setAttribute("class", "map-label");
        label.setAttribute("x", currentRow.labelX);
        label.setAttribute("y", currentRow.labelY - 17);
        label.textContent = visibleCountryName(countryByCode(currentRow.code));
        mapGroup.appendChild(label);
      }
    }

    mount.appendChild(svg);

    let view = { x: 0, y: 0, width: 1000, height: 500 };
    let pointer = null;

    function applyView() {
      const maxX = 1000 - view.width;
      const maxY = 500 - view.height;
      view.x = Math.max(0, Math.min(view.x, maxX));
      view.y = Math.max(0, Math.min(view.y, maxY));
      svg.setAttribute("viewBox", `${view.x} ${view.y} ${view.width} ${view.height}`);
    }

    function zoom(factor) {
      const newWidth = Math.max(210, Math.min(1000, view.width * factor));
      const newHeight = newWidth / 2;
      const centerX = view.x + view.width / 2;
      const centerY = view.y + view.height / 2;
      view = {
        x: centerX - newWidth / 2,
        y: centerY - newHeight / 2,
        width: newWidth,
        height: newHeight,
      };
      applyView();
    }

    if (options.focusCode) {
      const focusRow = rows.find((row) => row.code === options.focusCode);
      const focusCountry = countryByCode(options.focusCode);
      if (focusRow && focusCountry) {
        const focusWidth = focusCountry.focusWidth || 180;
        view = {
          x: focusRow.labelX - focusWidth / 2,
          y: focusRow.labelY - focusWidth / 4,
          width: focusWidth,
          height: focusWidth / 2,
        };
        applyView();
      }
    }

    mount.parentElement.querySelector('[data-map-control="zoom-in"]').addEventListener("click", () => zoom(0.72));
    mount.parentElement.querySelector('[data-map-control="zoom-out"]').addEventListener("click", () => zoom(1.38));
    mount.parentElement.querySelector('[data-map-control="reset"]').addEventListener("click", () => {
      view = { x: 0, y: 0, width: 1000, height: 500 };
      applyView();
    });

    svg.addEventListener("pointerdown", (event) => {
      if (event.target.closest && event.target.closest(".map-country.is-target")) {
        // Do not capture a country tap as a drag; its own click handler must fire.
        return;
      }
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, viewX: view.x, viewY: view.y };
      dragged = false;
      svg.classList.add("dragging");
      svg.setPointerCapture(event.pointerId);
    });

    svg.addEventListener("pointermove", (event) => {
      if (!pointer || event.pointerId !== pointer.id) return;
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      if (Math.abs(dx) + Math.abs(dy) > 7) dragged = true;
      view.x = pointer.viewX - (dx / svg.clientWidth) * view.width;
      view.y = pointer.viewY - (dy / svg.clientHeight) * view.height;
      applyView();
    });

    function endPointer(event) {
      if (pointer && event.pointerId === pointer.id) {
        pointer = null;
        svg.classList.remove("dragging");
        window.setTimeout(() => {
          dragged = false;
        }, 0);
      }
    }

    svg.addEventListener("pointerup", endPointer);
    svg.addEventListener("pointercancel", endPointer);

    svg.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        zoom(event.deltaY < 0 ? 0.86 : 1.16);
      },
      { passive: false },
    );

    return {
      markCorrect(code) {
        const group = groups.get(code);
        if (group) group.classList.add("correct");
      },
    };
  }

  document.getElementById("menuButton").addEventListener("click", openMenu);
  document.getElementById("closeMenuButton").addEventListener("click", closeMenu);
  document.getElementById("drawerBackdrop").addEventListener("click", closeMenu);
  backButton.addEventListener("click", previousSection);
  nextButton.addEventListener("click", nextSection);

  document.getElementById("fullscreenButton").addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (_error) {
      showToast("Fullscreen is not available in this browser.");
    }
  });

  document.getElementById("resetButton").addEventListener("click", () => {
    try {
      localStorage.removeItem("week5-world-map-progress");
    } catch (_error) {
      // Nothing else is needed.
    }
    state.section = "context";
    state.tourIndex = 0;
    state.mapOrder = shuffle(countries.map((country) => country.geoCode));
    state.mapIndex = 0;
    state.mapCorrect = false;
    state.selectedCharacter = null;
    state.compassRound = null;
    state.finalRound = null;
    closeMenu();
    render();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
    if (event.key === "ArrowLeft" && !drawer.classList.contains("open")) previousSection();
    if (event.key === "ArrowRight" && !drawer.classList.contains("open")) nextSection();
  });

  loadProgress();
  render();
})();
