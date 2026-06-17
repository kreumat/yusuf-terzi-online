const TERM_LABEL = "2025-2026 Bahar Finaller";

const state = {
  exams: [],
  filtered: [],
  selectedIds: new Set(),
  generatedLines: [],
  termSelected: false,
};

const els = {};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  cacheElements();
  bindEvents();
  await loadData();
  renderSources();
  updateTermCounts();
  applyFilters();
  renderSelectedCourses();
  updateCounters();
  updateOutput();
  refreshIcons();
}

function cacheElements() {
  els.termScreen = document.querySelector("#termScreen");
  els.appShell = document.querySelector("#appShell");
  els.chooseTermButton = document.querySelector("#chooseTermButton");
  els.changeTermButton = document.querySelector("#changeTermButton");
  els.termExamCount = document.querySelector("#termExamCount");
  els.currentTermLabel = document.querySelector("#currentTermLabel");
  els.totalCount = document.querySelector("#totalCount");
  els.selectedCount = document.querySelector("#selectedCount");
  els.outputCount = document.querySelector("#outputCount");
  els.visibleCount = document.querySelector("#visibleCount");
  els.searchInput = document.querySelector("#searchInput");
  els.sourceFilter = document.querySelector("#sourceFilter");
  els.courseList = document.querySelector("#courseList");
  els.emptyState = document.querySelector("#emptyState");
  els.clearButton = document.querySelector("#clearButton");
  els.copyButton = document.querySelector("#copyButton");
  els.output = document.querySelector("#output");
  els.statusText = document.querySelector("#statusText");
  els.selectedLists = document.querySelectorAll("[data-selected-list]");
  els.selectedEmpties = document.querySelectorAll("[data-selected-empty]");
  els.selectedCounters = document.querySelectorAll("[data-selected-counter]");
}

function bindEvents() {
  els.chooseTermButton.addEventListener("click", selectTerm);
  els.changeTermButton.addEventListener("click", showTermScreen);
  els.searchInput.addEventListener("input", applyFilters);
  els.sourceFilter.addEventListener("change", applyFilters);
  els.clearButton.addEventListener("click", clearSelection);
  els.copyButton.addEventListener("click", copyOutput);
}

async function loadData() {
  try {
    const response = await fetch("data/exams.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.exams = await response.json();
  } catch (error) {
    els.statusText.textContent = "Dataset yüklenemedi. Siteyi localhost üzerinden açmayı deneyin.";
    console.error(error);
  }
}

function selectTerm() {
  state.termSelected = true;
  els.currentTermLabel.textContent = TERM_LABEL;
  els.termScreen.classList.add("hidden");
  els.appShell.classList.remove("hidden");
  els.appShell.classList.add("flex");
  els.searchInput.focus();
  refreshIcons();
}

function showTermScreen() {
  state.termSelected = false;
  els.appShell.classList.add("hidden");
  els.appShell.classList.remove("flex");
  els.termScreen.classList.remove("hidden");
  refreshIcons();
}

function updateTermCounts() {
  els.termExamCount.textContent = String(state.exams.length);
}

function renderSources() {
  const sources = [...new Set(state.exams.map((exam) => exam.source))].sort((a, b) => a.localeCompare(b, "tr"));
  const fragment = document.createDocumentFragment();

  for (const source of sources) {
    const option = document.createElement("option");
    option.value = source;
    option.textContent = source;
    fragment.append(option);
  }

  els.sourceFilter.append(fragment);
}

function applyFilters() {
  const query = normalize(els.searchInput.value);
  const source = els.sourceFilter.value;

  state.filtered = state.exams.filter((exam) => {
    const sourceMatches = source === "all" || exam.source === source;
    const queryMatches = !query || matchesQuery(searchText(exam), query);
    return sourceMatches && queryMatches;
  });

  renderCourses();
}

function renderCourses() {
  els.courseList.innerHTML = "";
  els.emptyState.classList.toggle("hidden", state.filtered.length > 0);
  els.visibleCount.textContent = `${state.filtered.length} sonuç`;

  const fragment = document.createDocumentFragment();
  for (const exam of state.filtered) {
    fragment.append(createCourseRow(exam));
  }

  els.courseList.append(fragment);
  updateCounters();
  refreshIcons();
}

function createCourseRow(exam) {
  const checked = state.selectedIds.has(exam.id);
  const row = document.createElement("label");
  row.className = [
    "grid cursor-pointer grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-md border p-3 transition",
    checked ? "border-teal-700 bg-teal-50" : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50",
  ].join(" ");

  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = checked;
  input.className = "mt-1 h-5 w-5 rounded border-zinc-300 text-teal-700 focus:ring-teal-700";
  input.addEventListener("change", () => toggleCourse(exam.id));

  const content = document.createElement("div");
  content.className = "min-w-0";

  const title = createText("p", "min-w-0 break-words text-sm font-semibold leading-5 text-zinc-950", exam.courseName);
  const teacher = createText("p", "mt-1 break-words text-sm leading-5 text-zinc-700", exam.teacher);

  const details = document.createElement("div");
  details.className = "mt-2 flex flex-wrap gap-2 text-xs";
  details.append(createBadge(`${exam.dateText} / ${exam.time}`, "border-teal-200 bg-teal-50 text-teal-800"));
  if (exam.programGroup) details.append(createBadge(exam.programGroup, "border-amber-200 bg-amber-50 text-amber-800"));
  if (exam.rooms?.length) details.append(createBadge(`Derslik: ${exam.rooms.join(", ")}`, "border-zinc-200 bg-zinc-50 text-zinc-600"));
  details.append(createBadge(exam.source, "border-sky-200 bg-sky-50 text-sky-800"));

  content.append(title, teacher, details);
  row.append(input, content);
  return row;
}

function toggleCourse(id) {
  if (state.selectedIds.has(id)) {
    state.selectedIds.delete(id);
  } else {
    state.selectedIds.add(id);
  }

  renderCourses();
  renderSelectedCourses();
  generateProgram();
  updateCounters();
}

function renderSelectedCourses() {
  const selected = selectedExams();
  for (const list of els.selectedLists) {
    list.innerHTML = "";
    const fragment = document.createDocumentFragment();
    for (const exam of selected) fragment.append(createSelectedRow(exam));
    list.append(fragment);
  }

  for (const empty of els.selectedEmpties) {
    empty.classList.toggle("hidden", selected.length > 0);
  }

  for (const counter of els.selectedCounters) {
    counter.textContent = `${selected.length} ders`;
  }

  refreshIcons();
}

function createSelectedRow(exam) {
  const row = document.createElement("div");
  row.className = "grid grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-md border border-zinc-200 bg-zinc-50 p-2";

  const content = document.createElement("div");
  content.className = "min-w-0";
  content.append(
    createText("p", "truncate text-sm font-semibold text-zinc-900", exam.courseName),
    createText("p", "mt-0.5 truncate text-xs text-zinc-600", exam.teacher),
    createText("p", "mt-1 text-xs font-medium text-teal-800", `${exam.dateText} / ${exam.time}`),
  );

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-300 bg-white text-zinc-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700";
  removeButton.setAttribute("aria-label", `${exam.courseName} seçimini kaldır`);
  removeButton.innerHTML = '<i data-lucide="x" class="h-4 w-4"></i>';
  removeButton.addEventListener("click", () => removeCourse(exam.id));

  row.append(content, removeButton);
  return row;
}

function removeCourse(id) {
  state.selectedIds.delete(id);
  renderCourses();
  renderSelectedCourses();
  generateProgram();
  updateCounters();
}

function generateProgram() {
  const selected = selectedExams();
  const seen = new Set();
  const lines = [];

  for (const exam of selected) {
    const line = `${exam.dateText} / ${exam.time} / ${exam.courseName.toLocaleUpperCase("tr-TR")}`;
    const key = `${exam.dateSort}|${exam.time}|${exam.courseName}`;
    if (!seen.has(key)) {
      seen.add(key);
      lines.push(line);
    }
  }

  state.generatedLines = lines;
  updateOutput();
  els.statusText.textContent = lines.length ? `${lines.length} sınav kronolojik olarak listelendi.` : "Seçili ders yok.";
  updateCounters();
}

function selectedExams() {
  return state.exams
    .filter((exam) => state.selectedIds.has(exam.id))
    .sort((a, b) => {
      const dateDiff = a.dateSort.localeCompare(b.dateSort);
      if (dateDiff) return dateDiff;
      const timeDiff = a.time.localeCompare(b.time);
      if (timeDiff) return timeDiff;
      return a.courseName.localeCompare(b.courseName, "tr");
    });
}

function updateOutput() {
  els.output.textContent = state.generatedLines.join("\n");
  els.outputCount.textContent = String(state.generatedLines.length);
}

function clearSelection() {
  state.selectedIds.clear();
  state.generatedLines = [];
  renderCourses();
  renderSelectedCourses();
  updateOutput();
  updateCounters();
  els.statusText.textContent = "Seçimler temizlendi.";
}

async function copyOutput() {
  const text = state.generatedLines.join("\n");
  if (!text) {
    els.statusText.textContent = "Kopyalanacak program yok.";
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    els.statusText.textContent = "Program panoya kopyalandı.";
  } catch (error) {
    els.statusText.textContent = "Kopyalama başarısız oldu.";
    console.error(error);
  }
}

function updateCounters() {
  els.totalCount.textContent = String(state.exams.length);
  els.selectedCount.textContent = String(state.selectedIds.size);
  els.outputCount.textContent = String(state.generatedLines.length);
}

function searchText(exam) {
  return [exam.courseName, exam.teacher, exam.programGroup, exam.source, exam.dateText, exam.time].filter(Boolean).join(" ");
}

function matchesQuery(text, query) {
  const haystack = normalize(text);
  return query.split(/\s+/).every((part) => haystack.includes(part));
}

function normalize(value) {
  return value.toLocaleUpperCase("tr-TR").trim();
}

function createBadge(text, className) {
  return createText("span", `inline-flex max-w-full items-center rounded-md border px-2 py-1 ${className}`, text);
}

function createText(tag, className, text) {
  const el = document.createElement(tag);
  el.className = className;
  el.textContent = text;
  return el;
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}
