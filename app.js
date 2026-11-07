/**
 * JEE Main 2027 — Mathematics Practice & PR Engine (app.js)
 * Pure Vanilla JS • LocalStorage Persistence • KaTeX Auto-Render
 */

(function () {
  'use strict';

  // ================= CONSTANTS & STORAGE KEYS =================
  const STORAGE_KEY_PREFIX = 'jee_main_2027_state_';
  const THEME_STORAGE_KEY = 'jee_main_2027_theme';
  const CUSTOM_MD_STORAGE_KEY = 'jee_main_2027_custom_md';

  // JEE Main Mathematics Percentage-of-Max-Marks to Percentile (PR) Interpolation Curve
  // Calibrated to typical NTA JEE Main Mathematics difficulty where ~60-65% raw marks yields 98+ PR.
  const JEE_MATH_PR_ANCHORS = [
    { pct: -25, pr: 5.0 },
    { pct: 0, pr: 28.0 },
    { pct: 10, pr: 55.0 },
    { pct: 20, pr: 74.0 },
    { pct: 30, pr: 85.5 },
    { pct: 40, pr: 92.0 },
    { pct: 50, pr: 95.8 },
    { pct: 60, pr: 98.1 },
    { pct: 65, pr: 98.75 },
    { pct: 75, pr: 99.4 },
    { pct: 85, pr: 99.78 },
    { pct: 95, pr: 99.95 },
    { pct: 100, pr: 99.99 }
  ];

  // ================= APPLICATION STATE =================
  let questions = [];          // Array of parsed question objects
  let chapters = [];           // Unique chapter names in order
  let filteredIndices = [];    // Indices into `questions` matching active chapter/review filter
  let activeStorageKey = STORAGE_KEY_PREFIX + 'default';
  let timerInterval = null;

  let state = {
    currentQuestionId: 1,
    responses: {},             // { [qId]: 'A' | 'B' | 'C' | 'D' }
    markedForReview: {},       // { [qId]: true }
    visited: {},               // { [qId]: true }
    elapsedSeconds: 0,
    isSubmitted: false
  };

  // ================= DOM ELEMENTS =================
  const dom = {
    currentSectionBadge: document.getElementById('currentSectionBadge'),
    chapterSelect: document.getElementById('chapterSelect'),
    reviewFilterWrap: document.getElementById('reviewFilterWrap'),
    reviewFilterSelect: document.getElementById('reviewFilterSelect'),
    timerDisplay: document.getElementById('timerDisplay'),
    openLoaderBtn: document.getElementById('openLoaderBtn'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    mobilePaletteBtn: document.getElementById('mobilePaletteBtn'),
    answeredCountMobile: document.getElementById('answeredCountMobile'),
    submitExamBtn: document.getElementById('submitExamBtn'),
    viewScorecardBtn: document.getElementById('viewScorecardBtn'),

    examWorkspace: document.getElementById('examWorkspace'),
    questionNumberLabel: document.getElementById('questionNumberLabel'),
    chapterTitleLabel: document.getElementById('chapterTitleLabel'),
    reviewStatusBadge: document.getElementById('reviewStatusBadge'),
    questionText: document.getElementById('questionText'),
    optionsContainer: document.getElementById('optionsContainer'),
    answerVerificationBox: document.getElementById('answerVerificationBox'),

    prevQuestionBtn: document.getElementById('prevQuestionBtn'),
    markReviewBtn: document.getElementById('markReviewBtn'),
    clearResponseBtn: document.getElementById('clearResponseBtn'),
    nextQuestionBtn: document.getElementById('nextQuestionBtn'),

    paletteSidebar: document.getElementById('paletteSidebar'),
    closePaletteBtn: document.getElementById('closePaletteBtn'),
    statAnswered: document.getElementById('statAnswered'),
    statReview: document.getElementById('statReview'),
    statUnanswered: document.getElementById('statUnanswered'),
    statUnvisited: document.getElementById('statUnvisited'),
    paletteGrid: document.getElementById('paletteGrid'),
    resetProgressBtn: document.getElementById('resetProgressBtn'),

    scorecardView: document.getElementById('scorecardView'),
    reviewQuestionsBtn: document.getElementById('reviewQuestionsBtn'),
    retakeExamBtn: document.getElementById('retakeExamBtn'),
    resTotalMarks: document.getElementById('resTotalMarks'),
    resNormalizedMarks: document.getElementById('resNormalizedMarks'),
    resPercentile: document.getElementById('resPercentile'),
    resPrRemark: document.getElementById('resPrRemark'),
    resAccuracy: document.getElementById('resAccuracy'),
    resAttemptRatio: document.getElementById('resAttemptRatio'),
    resTimeTaken: document.getElementById('resTimeTaken'),
    resAvgTime: document.getElementById('resAvgTime'),
    resCorrectCount: document.getElementById('resCorrectCount'),
    resPositiveMarks: document.getElementById('resPositiveMarks'),
    resWrongCount: document.getElementById('resWrongCount'),
    resNegativeMarks: document.getElementById('resNegativeMarks'),
    resSkippedCount: document.getElementById('resSkippedCount'),
    chapterAnalysisBody: document.getElementById('chapterAnalysisBody'),

    loaderModal: document.getElementById('loaderModal'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    mdFileInput: document.getElementById('mdFileInput'),
    mdPasteTextarea: document.getElementById('mdPasteTextarea'),
    loadPastedMdBtn: document.getElementById('loadPastedMdBtn')
  };

  // ================= INITIALIZATION =================
  function init() {
    initTheme();
    bindEvents();
    loadInitialMarkdown();
  }

  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    dom.themeToggleBtn.textContent = savedTheme === 'dark' ? '☀' : '☽';
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    dom.themeToggleBtn.textContent = next === 'dark' ? '☀' : '☽';
  }

  async function loadInitialMarkdown() {
    // 1. Try fetching ./questions.md from the same directory
    try {
      const response = await fetch('./questions.md', { cache: 'no-cache' });
      if (response.ok) {
        const mdText = await response.text();
        if (mdText && mdText.trim().length > 50) {
          bootWithMarkdown(mdText);
          return;
        }
      }
    } catch (err) {
      // Fetch fails when opened directly via file:// protocol in some browsers
    }

    // 2. Fallback: Check if user previously loaded/pasted Markdown in localStorage
    const cachedMd = localStorage.getItem(CUSTOM_MD_STORAGE_KEY);
    if (cachedMd && cachedMd.trim().length > 50) {
      bootWithMarkdown(cachedMd);
      return;
    }

    // 3. Otherwise, prompt the user to select or paste `questions.md`
    dom.questionText.innerHTML =
      '<code>questions.md</code> ફાઇલ આપમેળે લોડ થઈ શકી નથી (બ્રાઉઝર <code>file://</code> સુરક્ષાને કારણે). કૃપા કરીને ઉપરના <strong>📄 ફાઇલ</strong> બટન પર ક્લિક કરીને તમારી <code>questions.md</code> ફાઇલ પસંદ કરો.';
    dom.loaderModal.classList.remove('hidden');
  }

  // ================= MARKDOWN PARSER =================
  /**
   * Parses `questions.md` into structured questions and matches the 4-column answer key table.
   */
  function parseQuestionsMarkdown(rawMd) {
    const normalized = rawMd.replace(/\r\n/g, '\n');

    // Split Question Body vs Answer Key Section
    let bodyPart = normalized;
    let answerPart = '';

    const answerHeaderMatch = normalized.match(/###\s*\*\*.*?(?:ઉત્તરવહી|Answer\s*Key).*?\*\*/i);
    if (answerHeaderMatch) {
      const splitIdx = answerHeaderMatch.index;
      bodyPart = normalized.slice(0, splitIdx);
      answerPart = normalized.slice(splitIdx);
    }

    // 1. Parse Answer Key Table (handles 4 columns per row: | **1** | A | **26** | B | ...)
    const answerKeyMap = {};
    const ansRegex = /\*\*(\d+)\*\*\s*\|\s*([A-D])/gi;
    let ansMatch;
    while ((ansMatch = ansRegex.exec(answerPart)) !== null) {
      const qNum = parseInt(ansMatch[1], 10);
      const opt = ansMatch[2].toUpperCase();
      answerKeyMap[qNum] = opt;
    }

    // 2. Parse Sections, Chapters, Questions, and Options line by line
    const lines = bodyPart.split('\n');
    const parsedQuestions = [];
    const chapterSet = new Set();

    let currentSection = 'JEE Main ગણિત';
    let currentChapter = 'સામાન્ય (General)';
    let currentQ = null;

    const sectionRegex = /^###\s+\*\*(.+?)\*\*\s*$/;
    const chapterRegex = /^####\s+\*\*(.+?)\*\*\s*$/;
    const questionStartRegex = /^\*\*(\d+)\.\*\*\s*(.+)$/;
    const optionLineRegex = /^\(([A-D])\)\s*(.+)$/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line || line === '---') {
        continue;
      }

      // Check Section Heading (e.g. ### **વિભાગ I: ધોરણ 11 (Class 11)**)
      const secMatch = line.match(sectionRegex);
      if (secMatch) {
        currentSection = secMatch[1].trim();
        continue;
      }

      // Check Chapter Heading (e.g. #### **પ્રકરણ 2: સંબંધ અને વિધયો...**)
      const chapMatch = line.match(chapterRegex);
      if (chapMatch) {
        currentChapter = chapMatch[1].trim();
        chapterSet.add(currentChapter);
        continue;
      }

      // Check Question Start (e.g. **1.** ગણ $A = ...$)
      const qMatch = line.match(questionStartRegex);
      if (qMatch) {
        if (currentQ) {
          parsedQuestions.push(currentQ);
        }
        const qId = parseInt(qMatch[1], 10);
        currentQ = {
          id: qId,
          section: currentSection,
          chapter: currentChapter,
          statementLines: [qMatch[2].trim()],
          options: {},
          correctOption: answerKeyMap[qId] || null
        };
        chapterSet.add(currentChapter);
        continue;
      }

      // If inside a question, check for Option (A)-(D) or multi-line statement continuation
      if (currentQ) {
        const optMatch = line.match(optionLineRegex);
        if (optMatch) {
          const optKey = optMatch[1].toUpperCase();
          currentQ.options[optKey] = optMatch[2].trim();
        } else if (Object.keys(currentQ.options).length === 0) {
          // Multi-line equations before option (A), e.g. Q72 & Q78 systems of equations
          currentQ.statementLines.push(line);
        }
      }
    }

    if (currentQ) {
      parsedQuestions.push(currentQ);
    }

    return {
      questions: parsedQuestions,
      chapters: Array.from(chapterSet)
    };
  }

  // ================= STATE & LOCALSTORAGE =================
  function computeHash(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return (hash >>> 0).toString(16);
  }

  function loadStateFromStorage() {
    try {
      const raw = localStorage.getItem(activeStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        state = {
          currentQuestionId: parsed.currentQuestionId || (questions[0] ? questions[0].id : 1),
          responses: parsed.responses || {},
          markedForReview: parsed.markedForReview || {},
          visited: parsed.visited || {},
          elapsedSeconds: Number.isFinite(parsed.elapsedSeconds) ? parsed.elapsedSeconds : 0,
          isSubmitted: Boolean(parsed.isSubmitted)
        };
        return;
      }
    } catch (e) {
      console.error('Failed to read state from localStorage:', e);
    }

    // Default fresh state
    state = {
      currentQuestionId: questions[0] ? questions[0].id : 1,
      responses: {},
      markedForReview: {},
      visited: {},
      elapsedSeconds: 0,
      isSubmitted: false
    };
  }

  function saveStateToStorage() {
    try {
      localStorage.setItem(activeStorageKey, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }

  // ================= BOOTSTRAP QUESTION PAPER =================
  function bootWithMarkdown(mdText) {
    const parsed = parseQuestionsMarkdown(mdText);
    if (!parsed.questions.length) {
      alert('આ ફાઇલમાંથી કોઈ પ્રશ્નો મળ્યા નથી. કૃપા કરીને questions.md ફોર્મેટ તપાસો.');
      return;
    }

    questions = parsed.questions;
    chapters = parsed.chapters;
    activeStorageKey = STORAGE_KEY_PREFIX + computeHash(mdText.slice(0, 2000) + questions.length);

    loadStateFromStorage();
    populateChapterDropdown();
    applyFilters();

    // Ensure currentQuestionId exists
    if (!questions.some((q) => q.id === state.currentQuestionId)) {
      state.currentQuestionId = questions[0].id;
    }

    state.visited[state.currentQuestionId] = true;
    saveStateToStorage();

    syncSubmissionUI();
    renderCurrentQuestion();
    renderPalette();
    startTimer();
  }

  function populateChapterDropdown() {
    dom.chapterSelect.innerHTML = '<option value="all">બધા પ્રકરણો (All Chapters — ' + questions.length + ')</option>';
    chapters.forEach((chap) => {
      const count = questions.filter((q) => q.chapter === chap).length;
      const opt = document.createElement('option');
      opt.value = chap;
      opt.textContent = `${chap} (${count})`;
      dom.chapterSelect.appendChild(opt);
    });
  }

  function applyFilters() {
    const selectedChapter = dom.chapterSelect.value;
    const reviewMode = state.isSubmitted ? dom.reviewFilterSelect.value : 'all';

    filteredIndices = [];
    questions.forEach((q, idx) => {
      if (selectedChapter !== 'all' && q.chapter !== selectedChapter) {
        return;
      }

      if (state.isSubmitted && reviewMode !== 'all') {
        const userAns = state.responses[q.id];
        if (reviewMode === 'correct' && (!userAns || userAns !== q.correctOption)) return;
        if (reviewMode === 'incorrect' && (!userAns || userAns === q.correctOption)) return;
        if (reviewMode === 'unattempted' && userAns) return;
      }

      filteredIndices.push(idx);
    });
  }

  // ================= RENDERING & KATEX =================
  function renderLatex(element) {
    if (typeof window.renderMathInElement === 'function') {
      window.renderMathInElement(element, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true }
        ],
        throwOnError: false
      });
    } else {
      // Retry briefly if KaTeX script is still defer-loading
      setTimeout(() => renderLatex(element), 120);
    }
  }

  function renderCurrentQuestion() {
    if (!questions.length) return;

    // If current question is filtered out, jump to the first available question in filter
    let currentIdx = questions.findIndex((q) => q.id === state.currentQuestionId);
    if (currentIdx === -1 || (filteredIndices.length > 0 && !filteredIndices.includes(currentIdx))) {
      currentIdx = filteredIndices.length > 0 ? filteredIndices[0] : 0;
      state.currentQuestionId = questions[currentIdx].id;
    }

    // Empty filter state check
    if (filteredIndices.length === 0) {
      dom.questionText.innerHTML = 'આ ફિલ્ટરમાં કોઈ પ્રશ્ન નથી. કૃપા કરીને ઉપરથી બીજું પ્રકરણ અથવા પરિણામ ફિલ્ટર પસંદ કરો.';
      dom.optionsContainer.innerHTML = '';
      dom.answerVerificationBox.classList.add('hidden');
      return;
    }

    const q = questions[currentIdx];
    state.visited[q.id] = true;
    saveStateToStorage();

    // Update Headers & Badges
    dom.currentSectionBadge.textContent = q.section;
    dom.questionNumberLabel.textContent = `પ્રશ્ન ${q.id} / ${questions.length}`;
    dom.chapterTitleLabel.textContent = q.chapter;

    // Render Question Statement (multi-line joined by <br>)
    dom.questionText.innerHTML = q.statementLines.join('<br />');

    // Render Options (A, B, C, D)
    const userSelected = state.responses[q.id] || null;
    dom.optionsContainer.innerHTML = '';

    ['A', 'B', 'C', 'D'].forEach((optKey) => {
      if (!q.options[optKey]) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-item';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', userSelected === optKey ? 'true' : 'false');

      if (!state.isSubmitted) {
        if (userSelected === optKey) {
          btn.classList.add('selected');
        }
        btn.addEventListener('click', () => handleSelectOption(q.id, optKey));
      } else {
        btn.classList.add('locked');
        if (optKey === q.correctOption) {
          btn.classList.add('correct-answer');
        } else if (userSelected === optKey && userSelected !== q.correctOption) {
          btn.classList.add('wrong-selected');
        }
      }

      const keySpan = document.createElement('span');
      keySpan.className = 'option-key';
      keySpan.textContent = `(${optKey})`;

      const contentSpan = document.createElement('span');
      contentSpan.className = 'option-content';
      contentSpan.innerHTML = q.options[optKey];

      btn.appendChild(keySpan);
      btn.appendChild(contentSpan);
      dom.optionsContainer.appendChild(btn);
    });

    // Post-Submit Status Pill & Verification Box
    if (state.isSubmitted) {
      dom.reviewStatusBadge.classList.remove('hidden', 'pill-correct', 'pill-wrong', 'pill-skipped');
      dom.answerVerificationBox.classList.remove('hidden');

      if (!userSelected) {
        dom.reviewStatusBadge.textContent = 'છોડી દીધેલ (0)';
        dom.reviewStatusBadge.classList.add('pill-skipped');
        dom.answerVerificationBox.innerHTML = `
          <span>તમારો જવાબ: <strong>અટેમ્પ્ટ નથી કર્યો</strong></span>
          <span>સત્તાવાર સાચો વિકલ્પ (Answer Key): <strong>(${q.correctOption || '?'})</strong></span>
        `;
      } else if (userSelected === q.correctOption) {
        dom.reviewStatusBadge.textContent = 'સાચો જવાબ (+4)';
        dom.reviewStatusBadge.classList.add('pill-correct');
        dom.answerVerificationBox.innerHTML = `
          <span>તમારો જવાબ: <strong>(${userSelected}) — સાચો (+4 ગુણ)</strong></span>
          <span>સત્તાવાર સાચો વિકલ્પ (Answer Key): <strong>(${q.correctOption})</strong></span>
        `;
      } else {
        dom.reviewStatusBadge.textContent = 'ખોટો જવાબ (−1)';
        dom.reviewStatusBadge.classList.add('pill-wrong');
        dom.answerVerificationBox.innerHTML = `
          <span>તમારો જવાબ: <strong>(${userSelected}) — ખોટો (−1 ગુણ)</strong></span>
          <span>સત્તાવાર સાચો વિકલ્પ (Answer Key): <strong>(${q.correctOption || '?'})</strong></span>
        `;
      }
    } else {
      dom.reviewStatusBadge.classList.add('hidden');
      dom.answerVerificationBox.classList.add('hidden');
    }

    // Update Action Buttons
    const posInFilter = filteredIndices.indexOf(currentIdx);
    dom.prevQuestionBtn.disabled = posInFilter <= 0;
    dom.nextQuestionBtn.disabled = posInFilter === -1 || posInFilter >= filteredIndices.length - 1;

    const isMarked = Boolean(state.markedForReview[q.id]);
    dom.markReviewBtn.classList.toggle('active-mark', isMarked);
    dom.markReviewBtn.textContent = isMarked
      ? '★ પુનઃસમીક્ષામાં છે (Marked)'
      : 'પુનઃસમીક્ષા (Mark for Review)';

    dom.markReviewBtn.disabled = state.isSubmitted;
    dom.clearResponseBtn.disabled = state.isSubmitted || !userSelected;

    // Trigger KaTeX math rendering on question and options
    renderLatex(dom.questionText);
    renderLatex(dom.optionsContainer);
  }

  function renderPalette() {
    dom.paletteGrid.innerHTML = '';

    let answeredCount = 0;
    let reviewCount = 0;
    let unansweredCount = 0;
    let unvisitedCount = 0;

    questions.forEach((q, idx) => {
      const hasAns = Boolean(state.responses[q.id]);
      const isMarked = Boolean(state.markedForReview[q.id]);
      const isVisited = Boolean(state.visited[q.id]);

      if (hasAns) answeredCount++;
      if (isMarked) reviewCount++;
      if (isVisited && !hasAns) unansweredCount++;
      if (!isVisited && !hasAns) unvisitedCount++;

      // Only show buttons belonging to the active filter in the palette grid
      if (!filteredIndices.includes(idx)) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'palette-btn';
      btn.textContent = q.id;

      if (q.id === state.currentQuestionId) {
        btn.classList.add('current-q');
      }

      if (state.isSubmitted) {
        const userAns = state.responses[q.id];
        if (userAns && userAns === q.correctOption) {
          btn.classList.add('eval-correct');
        } else if (userAns && userAns !== q.correctOption) {
          btn.classList.add('eval-wrong');
        }
      } else {
        if (isMarked) {
          btn.classList.add('st-review');
        } else if (hasAns) {
          btn.classList.add('st-answered');
        } else if (isVisited) {
          btn.classList.add('st-unanswered');
        }
      }

      btn.addEventListener('click', () => {
        state.currentQuestionId = q.id;
        renderCurrentQuestion();
        renderPalette();
        closeMobileDrawer();
      });

      dom.paletteGrid.appendChild(btn);
    });

    dom.statAnswered.textContent = answeredCount;
    dom.statReview.textContent = reviewCount;
    dom.statUnanswered.textContent = unansweredCount;
    dom.statUnvisited.textContent = unvisitedCount;
    dom.answeredCountMobile.textContent = `${answeredCount}/${questions.length}`;
  }

  // ================= USER INTERACTIONS =================
  function handleSelectOption(qId, optKey) {
    if (state.isSubmitted) return;

    // Clicking the already selected option deselects it
    if (state.responses[qId] === optKey) {
      delete state.responses[qId];
    } else {
      state.responses[qId] = optKey;
    }

    saveStateToStorage();
    renderCurrentQuestion();
    renderPalette();
  }

  function navigateRelative(delta) {
    const currentIdx = questions.findIndex((q) => q.id === state.currentQuestionId);
    const posInFilter = filteredIndices.indexOf(currentIdx);
    const targetPos = posInFilter + delta;

    if (targetPos >= 0 && targetPos < filteredIndices.length) {
      const nextGlobalIdx = filteredIndices[targetPos];
      state.currentQuestionId = questions[nextGlobalIdx].id;
      renderCurrentQuestion();
      renderPalette();
    }
  }

  function handleToggleReview() {
    if (state.isSubmitted) return;
    const qId = state.currentQuestionId;
    if (state.markedForReview[qId]) {
      delete state.markedForReview[qId];
    } else {
      state.markedForReview[qId] = true;
    }
    saveStateToStorage();
    renderCurrentQuestion();
    renderPalette();
  }

  function handleClearResponse() {
    if (state.isSubmitted) return;
    const qId = state.currentQuestionId;
    delete state.responses[qId];
    saveStateToStorage();
    renderCurrentQuestion();
    renderPalette();
  }

  // ================= TIMER =================
  function formatTime(totalSec) {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return [hrs, mins, secs].map((v) => String(v).padStart(2, '0')).join(':');
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    dom.timerDisplay.textContent = formatTime(state.elapsedSeconds);

    if (state.isSubmitted) return;

    timerInterval = setInterval(() => {
      if (!state.isSubmitted) {
        state.elapsedSeconds += 1;
        dom.timerDisplay.textContent = formatTime(state.elapsedSeconds);
        if (state.elapsedSeconds % 5 === 0) {
          saveStateToStorage();
        }
      }
    }, 1000);
  }

  // ================= SCORING & PERCENTILE (PR) ENGINE =================
  function estimateMathematicsPR(percentageScore) {
    const clamped = Math.max(-25, Math.min(100, percentageScore));
    for (let i = 0; i < JEE_MATH_PR_ANCHORS.length - 1; i++) {
      const a = JEE_MATH_PR_ANCHORS[i];
      const b = JEE_MATH_PR_ANCHORS[i + 1];
      if (clamped >= a.pct && clamped <= b.pct) {
        const t = (clamped - a.pct) / (b.pct - a.pct);
        return a.pr + t * (b.pr - a.pr);
      }
    }
    return clamped >= 100 ? 99.99 : 5.0;
  }

  function getPrRemark(pr) {
    if (pr >= 99.0) return 'ઉત્તમ! (Top NIT / IIIT સ્તરની તૈયારી)';
    if (pr >= 98.0) return 'લક્ષ્યાંક સિદ્ધ! (98+ PR — મજબૂત પકડ)';
    if (pr >= 95.0) return 'ખૂબ સરસ (95+ PR — થોડા સુધારાથી 98+ શક્ય)';
    if (pr >= 90.0) return 'સારી શરૂઆત (Advanced Qualifying સ્તર)';
    if (pr >= 75.0) return 'સરેરાશ (નબળા પ્રકરણોનું પુનરાવર્તન કરો)';
    return 'વધુ મહાવરાની જરૂર છે (NCERT અને પાયાના સૂત્રો તપાસો)';
  }

  function evaluateAndRenderScorecard() {
    const totalQuestions = questions.length;
    const maxMarks = totalQuestions * 4;

    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    const chapterStats = {};
    chapters.forEach((c) => {
      chapterStats[c] = { total: 0, attempted: 0, correct: 0, wrong: 0, marks: 0 };
    });

    questions.forEach((q) => {
      const userAns = state.responses[q.id];
      const cStat = chapterStats[q.chapter] || { total: 0, attempted: 0, correct: 0, wrong: 0, marks: 0 };
      cStat.total += 1;

      if (!userAns) {
        skippedCount += 1;
      } else if (userAns === q.correctOption) {
        correctCount += 1;
        cStat.attempted += 1;
        cStat.correct += 1;
        cStat.marks += 4;
      } else {
        wrongCount += 1;
        cStat.attempted += 1;
        cStat.wrong += 1;
        cStat.marks -= 1;
      }
      chapterStats[q.chapter] = cStat;
    });

    const attemptedCount = correctCount + wrongCount;
    const rawMarks = correctCount * 4 - wrongCount * 1;
    const percentageScore = maxMarks > 0 ? (rawMarks / maxMarks) * 100 : 0;
    const normalizedOutOf100 = (rawMarks / maxMarks) * 100;
    const estimatedPR = attemptedCount === 0 ? 0 : estimateMathematicsPR(percentageScore);
    const accuracy = attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0;
    const avgTimePerAttempt = attemptedCount > 0 ? Math.round(state.elapsedSeconds / attemptedCount) : 0;

    // Populate Summary Cards
    dom.resTotalMarks.textContent = `${rawMarks} / ${maxMarks}`;
    dom.resNormalizedMarks.textContent = `100 ગુણના પેપરમાં સમતુલ્ય: ${normalizedOutOf100.toFixed(1)} / 100`;
    dom.resPercentile.textContent = `${estimatedPR.toFixed(2)} PR`;
    dom.resPrRemark.textContent = getPrRemark(estimatedPR);
    dom.resAccuracy.textContent = `${accuracy.toFixed(1)}%`;
    dom.resAttemptRatio.textContent = `${attemptedCount} / ${totalQuestions} પ્રશ્નો અટેમ્પ્ટ કર્યા`;
    dom.resTimeTaken.textContent = formatTime(state.elapsedSeconds);
    dom.resAvgTime.textContent = `પ્રતિ અટેમ્પ્ટ સરેરાશ: ${avgTimePerAttempt} સેકન્ડ`;

    dom.resCorrectCount.textContent = correctCount;
    dom.resPositiveMarks.textContent = `(+${correctCount * 4})`;
    dom.resWrongCount.textContent = wrongCount;
    dom.resNegativeMarks.textContent = `(−${wrongCount})`;
    dom.resSkippedCount.textContent = skippedCount;

    // Populate Chapter-Wise Breakdown Table
    dom.chapterAnalysisBody.innerHTML = '';
    chapters.forEach((chap) => {
      const st = chapterStats[chap];
      const chapAcc = st.attempted > 0 ? ((st.correct / st.attempted) * 100).toFixed(0) + '%' : '—';
      const maxChapMarks = st.total * 4;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${chap}</strong></td>
        <td>${st.total}</td>
        <td>${st.attempted}</td>
        <td>${st.correct}</td>
        <td>${st.wrong}</td>
        <td>${chapAcc}</td>
        <td><strong>${st.marks}</strong> / ${maxChapMarks}</td>
      `;
      dom.chapterAnalysisBody.appendChild(tr);
    });
  }

  function syncSubmissionUI() {
    if (state.isSubmitted) {
      dom.submitExamBtn.classList.add('hidden');
      dom.viewScorecardBtn.classList.remove('hidden');
      dom.reviewFilterWrap.classList.remove('hidden');
    } else {
      dom.submitExamBtn.classList.remove('hidden');
      dom.viewScorecardBtn.classList.add('hidden');
      dom.reviewFilterWrap.classList.add('hidden');
      dom.reviewFilterSelect.value = 'all';
    }
  }

  function handleFinalSubmit() {
    const attemptedCount = Object.keys(state.responses).length;
    const confirmMsg = `તમે ${questions.length} માંથી ${attemptedCount} પ્રશ્નોના જવાબ આપ્યા છે.\n\nશું તમે ખરેખર Final Submit કરવા માંગો છો?`;
    if (!window.confirm(confirmMsg)) return;

    state.isSubmitted = true;
    if (timerInterval) clearInterval(timerInterval);
    saveStateToStorage();

    syncSubmissionUI();
    applyFilters();
    renderCurrentQuestion();
    renderPalette();
    showScorecardView();
  }

  function showScorecardView() {
    evaluateAndRenderScorecard();
    dom.examWorkspace.classList.add('hidden');
    dom.scorecardView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function showWorkspaceView() {
    dom.scorecardView.classList.add('hidden');
    dom.examWorkspace.classList.remove('hidden');
    renderCurrentQuestion();
    renderPalette();
  }

  function handleResetOrRetake() {
    const msg = 'શું તમે બધો પ્રોગ્રેસ અને જવાબો ભૂંસીને નવેસરથી શરૂ કરવા માંગો છો?';
    if (!window.confirm(msg)) return;

    localStorage.removeItem(activeStorageKey);
    dom.chapterSelect.value = 'all';
    dom.reviewFilterSelect.value = 'all';

    loadStateFromStorage();
    state.visited[state.currentQuestionId] = true;
    saveStateToStorage();

    syncSubmissionUI();
    applyFilters();
    showWorkspaceView();
    startTimer();
  }

  // ================= MOBILE DRAWER =================
  function openMobileDrawer() {
    dom.paletteSidebar.classList.add('drawer-open');
  }

  function closeMobileDrawer() {
    dom.paletteSidebar.classList.remove('drawer-open');
  }

  // ================= EVENT LISTENERS =================
  function bindEvents() {
    dom.themeToggleBtn.addEventListener('click', toggleTheme);

    dom.prevQuestionBtn.addEventListener('click', () => navigateRelative(-1));
    dom.nextQuestionBtn.addEventListener('click', () => navigateRelative(1));
    dom.markReviewBtn.addEventListener('click', handleToggleReview);
    dom.clearResponseBtn.addEventListener('click', handleClearResponse);

    dom.chapterSelect.addEventListener('change', () => {
      applyFilters();
      renderCurrentQuestion();
      renderPalette();
    });

    dom.reviewFilterSelect.addEventListener('change', () => {
      applyFilters();
      renderCurrentQuestion();
      renderPalette();
    });

    dom.submitExamBtn.addEventListener('click', handleFinalSubmit);
    dom.viewScorecardBtn.addEventListener('click', showScorecardView);
    dom.reviewQuestionsBtn.addEventListener('click', showWorkspaceView);
    dom.retakeExamBtn.addEventListener('click', handleResetOrRetake);
    dom.resetProgressBtn.addEventListener('click', handleResetOrRetake);

    // Mobile Palette Drawer
    dom.mobilePaletteBtn.addEventListener('click', openMobileDrawer);
    dom.closePaletteBtn.addEventListener('click', closeMobileDrawer);

    // File / Paste Loader Modal
    dom.openLoaderBtn.addEventListener('click', () => {
      dom.loaderModal.classList.remove('hidden');
    });

    dom.closeModalBtn.addEventListener('click', () => {
      dom.loaderModal.classList.add('hidden');
    });

    dom.mdFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target.result;
        if (content) {
          localStorage.setItem(CUSTOM_MD_STORAGE_KEY, content);
          dom.loaderModal.classList.add('hidden');
          bootWithMarkdown(content);
        }
      };
      reader.readAsText(file, 'UTF-8');
    });

    dom.loadPastedMdBtn.addEventListener('click', () => {
      const pasted = dom.mdPasteTextarea.value;
      if (!pasted || pasted.trim().length < 20) {
        alert('કૃપા કરીને questions.md ફાઇલ પસંદ કરો અથવા તેનું લખાણ પેસ્ટ કરો.');
        return;
      }
      localStorage.setItem(CUSTOM_MD_STORAGE_KEY, pasted);
      dom.loaderModal.classList.add('hidden');
      bootWithMarkdown(pasted);
    });

    // Keyboard Shortcuts (Active when Exam Workspace is visible and modal is closed)
    window.addEventListener('keydown', (e) => {
      if (
        !dom.loaderModal.classList.contains('hidden') ||
        !dom.scorecardView.classList.contains('hidden') ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)
      ) {
        return;
      }

      const key = e.key.toUpperCase();
      if (key === 'ARROWLEFT') {
        e.preventDefault();
        navigateRelative(-1);
      } else if (key === 'ARROWRIGHT') {
        e.preventDefault();
        navigateRelative(1);
      } else if (!state.isSubmitted) {
        if (key === 'A' || key === '1') handleSelectOption(state.currentQuestionId, 'A');
        else if (key === 'B' || key === '2') handleSelectOption(state.currentQuestionId, 'B');
        else if (key === 'C' || key === '3') handleSelectOption(state.currentQuestionId, 'C');
        else if (key === 'D' || key === '4') handleSelectOption(state.currentQuestionId, 'D');
        else if (key === 'R') handleToggleReview();
        else if (key === 'BACKSPACE' || key === 'DELETE') handleClearResponse();
      }
    });
  }

  // Start the application once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
