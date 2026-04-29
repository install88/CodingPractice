const {
  SETUP_DAYS,
  LINKS,
  WEEKS,
  PRIORITIES,
  SOURCES,
  LISTENING_RESOURCES,
  SCORE_FIELDS,
  NOTE_TEMPLATE,
  DEMO_SCRIPTS,
  SETUP_START,
  FORMAL_START,
  FORMAL_END,
  MS_DAY,
  DAY_NAMES,
  SOURCE_DATE
} = window.PREP_DATA;

const APP_CONFIG = window.__PREP_CONFIG__ || {};
const SUPABASE_URL = APP_CONFIG.supabaseUrl || "https://hbccslbwxxvkutzncakl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = APP_CONFIG.supabasePublishableKey || "sb_publishable_KeeiTQo_zeqn1xb8RMZjhA_urAd_1Ck";
const SUPABASE_PROGRESS_TABLE = "learner_progress";
const SUPABASE_PROGRESS_OVERVIEW_RPC = "list_progress_overview";
const AUTH_EMAIL_DOMAIN = "users.interview-prep.local";
let selectedDate = getInitialDate();

function c(company, title, url, note) { return { company, title, url, note }; }
function j(topic, detail, url) { return { topic, detail, url }; }
function d(topic, detail, url) { return { topic, detail, url }; }
function t(topic, detail, url) { return { topic, detail, url }; }
function n(topic, detail, url) { return { topic, detail, url }; }
function task(cat, company, title, minutes, detail, deliverable, links) {
  return { cat, company, title, minutes, detail, deliverable, links: links || [] };
}

function zeroTime(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
function parseYmd(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function daysBetween(a, b) { return Math.round((zeroTime(a) - zeroTime(b)) / MS_DAY); }
function clamp(num, min, max) { return Math.max(min, Math.min(max, num)); }
function getInitialDate() {
  const params = new URLSearchParams(location.search);
  return parseYmd(params.get("date")) || zeroTime(new Date());
}

function getWeekInfo(date) {
  const setupIndex = SETUP_DAYS.findIndex(day => day.date === dateKey(date));
  if (setupIndex >= 0) return { mode: "setup", setupIndex, weekIndex: -1, week: null, displayWeek: "暖身" };
  const formalDay = daysBetween(date, FORMAL_START);
  if (formalDay < 0) return { mode: "before", weekIndex: -1, week: WEEKS[0], displayWeek: "尚未開始" };
  const weekIndex = Math.floor(formalDay / 7);
  if (weekIndex >= WEEKS.length) return { mode: "after", weekIndex: WEEKS.length - 1, week: WEEKS[WEEKS.length - 1], displayWeek: "完成後" };
  return { mode: "formal", weekIndex, week: WEEKS[weekIndex], displayWeek: `第 ${weekIndex + 1} 週` };
}

function todayTasks(date) {
  const info = getWeekInfo(date);
  if (info.mode === "setup") return SETUP_DAYS[info.setupIndex].tasks.map((x, i) => ({...x, id: `setup-${i}`}));
  if (info.mode === "before") {
    return [withId(task("behavior", "All", "正式課綱尚未開始", 20, "先準備履歷、LeetCode 帳號、聽力資源清單與每日筆記格式。", "把 5 個弱點加入右側清單。", []), "before-0")];
  }
  if (info.mode === "after") {
    return [
      withId(task("behavior", "All", "16 週已完成：進入面試週維持模式", 30, "每天做 1 題 Medium、聽 1 段技術講解、重看 1 張 design 筆記。", "只維持手感，不再大量新增材料。", []), "after-0"),
      withId(task("system", "All", "Final readiness check", 30, "檢查 coding、system design、behavioral、company pitch 是否都有完成筆記與可重聽資源。", "列出真正面試前 48 小時只複習的 10 件事。", []), "after-1")
    ];
  }

  const week = info.week;
  const dow = date.getDay();
  const tasks = [];
  if (dow >= 1 && dow <= 5) {
    const coding = week.coding[dow - 1];
    const codingMinutes = dow === 5 ? 30 : 35;
    tasks.push(task("coding", coding.company, coding.title, codingMinutes, `重點：${coding.note}\n全程用 Java 或 SQL/Python 完成；先講思路再寫。`, "交付：提交或完成筆記；寫 time/space complexity；記 1 個 edge case。", [{label:"打開題目", url:coding.url}]));

    if (dow === 1) {
      tasks.push(task("java", "Google", week.java.topic, 25, week.java.detail, "交付：5 bullets + 5 句英文技術筆記。", [{label:"技術資源", url:week.java.url}]));
    } else if (dow === 2) {
      tasks.push(task("system", "Google", week.design.topic, 25, week.design.detail, "交付：requirements、API、data model、bottleneck、trade-off 各 1 點。", [{label:"設計資源", url:week.design.url}]));
    } else if (dow === 3) {
      tasks.push(task("system", "NVIDIA", week.nvidia.topic, 25, week.nvidia.detail, "交付：用英文寫 6 句 performance / infra 相關回答。", [{label:"NVIDIA/Infra 資源", url:week.nvidia.url}]));
    } else if (dow === 4) {
      tasks.push(task("data", "TSMC", week.tsmc.topic, 25, week.tsmc.detail, "交付：把題目連到 TSMC IT/製造資料場景，寫 5 bullets。", [{label:"TSMC/Data 資源", url:week.tsmc.url}]));
    } else {
      tasks.push(task("behavior", "All", "Behavioral / company drill", 20, week.behavior, "交付：STAR 草稿一版；Action 佔 60%，Result 有數字。", [
        {label:"Google", url:LINKS.googleSenior}, {label:"NVIDIA", url:LINKS.nvidiaHire}, {label:"TSMC", url:LINKS.tsmcIt}
      ]));
      tasks.push(task("english", "All", "Friday listening review", 20, `聽一段 behavioral 或 senior interview mock，重點觀察：對方怎麼描述 action、result、impact。\n本週題目：${week.behavior}`, "交付：摘 5 句好用英文；寫 3 行你聽到的回答結構。", [{label:"Hello Interview", url:LINKS.hello}]));
      tasks.push(task("english", "All", "Weekly podcast script prompt", 20, "使用右側 prompt，把本週筆記丟進 NotebookLM 或 Gemini Audio Overview，產生英文 podcast。", "交付：生成或保存 prompt；挑 5 句你下週要模仿的英文。", [{label:"NotebookLM", url:LINKS.notebook}]));
      return tasks.map((x, i) => ({...x, id: `formal-${info.weekIndex}-${dow}-${i}`}));
    }

    tasks.push(task("english", "All", listeningPrompt(week, dow), 20, "聽一段對應主題的講解。先不要自己口說，專心聽對方怎麼拆問題、怎麼講 trade-off。", "交付：3 個技術重點 + 3 句英文句型 + 1 個還沒聽懂的點。", listeningLinks(dow)));
    tasks.push(task("behavior", "All", "Daily interview log", 10, "把今天的 coding 錯誤、技術關鍵句、英文卡點、明日回補寫下來。", "交付：4 行筆記，不超過 10 分鐘。", []));
    return tasks.map((x, i) => ({...x, id: `formal-${info.weekIndex}-${dow}-${i}`}));
  }

  if (dow === 6) {
    tasks.push(task("coding", "All", "Weekly wrong-answer redo", 35, "從本週錯題或卡住題選 1-2 題冷解，不看答案。", "交付：寫出錯因分類：pattern / API / edge case / time management。", [{label:"LeetCode submissions", url:"https://leetcode.com/submissions/"}]));
    tasks.push(task("system", "All", "Weekly mock block", 35, `本週 mock：${week.design.topic} 或 ${week.tsmc.topic}。嚴格計時，像面試一樣講。`, "交付：一張架構圖 + 5 個 trade-off。", [{label:"Mock replays", url:LINKS.interviewing}]));
    tasks.push(task("english", "All", "Weekly listening recap", 20, "重聽本週最有幫助的一段講解，這次只抓你第一次沒聽懂的地方。", "交付：把 1 個沒聽懂的技術點新增到右側弱點清單。", []));
    return tasks.map((x, i) => ({...x, id: `formal-${info.weekIndex}-${dow}-${i}`}));
  }

  tasks.push(task("behavior", "All", "Weekly scorecard", 20, "填右側每週 Review 分數表，低於目標的項目排進下週。", "交付：分數表完成；低分項目進弱點清單。", []));
  tasks.push(task("english", "All", "Podcast listening review", 25, "聽本週 NotebookLM/Gemini 產生的英文 podcast；不用跟讀，只抓技術觀念和句型。", "交付：摘 8 句你看得懂、聽得懂的英文句子。", [{label:"NotebookLM", url:LINKS.notebook}]));
  tasks.push(task("system", "All", "Next-week preview", 20, "看下週主題，先列 3 個你預期會卡住的點。", "交付：把卡點放進弱點清單，明天開始照表補。", []));
  return tasks.map((x, i) => ({...x, id: `formal-${info.weekIndex}-${dow}-${i}`}));
}

function withId(item, id) { return {...item, id}; }
function listeningPrompt(week, dow) {
  const prompts = {
    1: `聽講解：${week.coding[0].title} + ${week.java.topic}`,
    2: `聽講解：${week.design.topic}`,
    3: `聽講解：NVIDIA / infra 主題：${week.nvidia.topic}`,
    4: `聽講解：TSMC IT / data 主題：${week.tsmc.topic}`,
    5: `聽講解：behavioral / senior interview answer`
  };
  return prompts[dow] || "聽講解：今天主題複習";
}

function listeningLinks(dow) {
  if (dow === 1) return [{label:"NeetCode", url:"https://www.youtube.com/@NeetCode/playlists"}, {label:"Baeldung", url:"https://www.baeldung.com/"}];
  if (dow === 2) return [{label:"ByteByteGo", url:"https://www.youtube.com/@ByteByteGo/videos"}, {label:"Hello Interview", url:LINKS.hello}];
  if (dow === 3) return [{label:"NVIDIA Developer", url:"https://www.youtube.com/@NVIDIADeveloper/videos"}, {label:"NVIDIA NIM", url:LINKS.nvidiaNim}];
  if (dow === 4) return [{label:"TSMC IT", url:LINKS.tsmcIt}, {label:"NotebookLM", url:LINKS.notebook}];
  return [{label:"Hello Interview", url:LINKS.hello}];
}

function catLabel(cat) {
  return { coding: "Coding", java: "Java Backend", system: "System Design", data: "SQL / Python", tsmc: "TSMC Track", nvidia: "NVIDIA Track", english: "English", behavior: "Behavioral" }[cat] || cat;
}
function companyClass(company) {
  const value = String(company).toLowerCase();
  if (value.includes("google")) return "google";
  if (value.includes("nvidia")) return "nvidia";
  if (value.includes("tsmc")) return "tsmc";
  return "";
}
function catClass(cat) {
  if (cat === "java") return "java";
  if (cat === "system") return "system";
  if (cat === "english") return "english";
  return "";
}
function storageJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}
function shouldSyncKey(key) {
  return key === cardCompletedKey() || key === weaknessKey() || key.startsWith("prep-v2:score:");
}
function setJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  if (shouldSyncKey(key)) scheduleRemoteSync();
}
function normalizeUsername(username) {
  return String(username || "").trim();
}
function usernameToEmail(username) {
  const normalized = normalizeUsername(username).toLowerCase();
  return normalized ? `${normalized}@${AUTH_EMAIL_DOMAIN}` : "";
}
function setErrorBox(message) {
  const box = document.getElementById("authErrorBox");
  if (!message) {
    box.textContent = "";
    box.classList.add("hidden");
    return;
  }
  box.textContent = message;
  box.classList.remove("hidden");
}
function setAuthStatus(message, targetId = "authStatus") {
  const node = document.getElementById(targetId);
  if (node) node.textContent = message;
}
function setAuthMode(mode) {
  const loginMode = mode !== "register";
  document.getElementById("loginForm").classList.toggle("hidden", !loginMode);
  document.getElementById("registerForm").classList.toggle("hidden", loginMode);
  document.getElementById("loginTabBtn").classList.toggle("active", loginMode);
  document.getElementById("registerTabBtn").classList.toggle("active", !loginMode);
  setErrorBox("");
}
function setActiveView(view) {
  activeView = ["board", "users", "chat"].includes(view) ? view : "board";
  const board = document.getElementById("boardView");
  const chat = document.getElementById("chatView");
  const users = document.getElementById("usersView");
  const isBoard = activeView === "board";
  const isUsers = activeView === "users";
  const isChat = activeView === "chat";
  board.classList.toggle("hidden", !isBoard);
  chat.classList.toggle("hidden", !isChat);
  users.classList.toggle("hidden", !isUsers);
  document.getElementById("viewBoardBtn").classList.toggle("active", isBoard);
  document.getElementById("viewUsersBtn").classList.toggle("active", isUsers);
  document.getElementById("viewChatBtn").classList.toggle("active", isChat);
  syncLocationState();
}
function updateUserPill() {
  const username = currentProfile?.username || currentAuthUser?.email || "未登入";
  const role = currentProfile?.role ? `<span class="role">${currentProfile.role}</span>` : "";
  document.getElementById("userPill").innerHTML = `${escapeHtml(username)} ${role}`;
}
function checkedKey(date) { return `prep-v2:checked:${dateKey(date)}`; }
function doneKey(dateString) { return `prep-v2:done:${dateString}`; }
function scoreKey(weekIndex) { return `prep-v2:score:${weekIndex}`; }
function weaknessKey() { return "prep-v2:weakness"; }
function getChecked(date) { return storageJson(checkedKey(date), []); }
function setChecked(date, ids) { setJson(checkedKey(date), ids); }
function showToast(text) {
  const toast = document.getElementById("toast");
  toast.textContent = text;
  toast.classList.add("show");
  window.clearTimeout(showToast.t);
  showToast.t = window.setTimeout(() => toast.classList.remove("show"), 1500);
}

function render() {
  const info = getWeekInfo(selectedDate);
  const dateString = dateKey(selectedDate);
  const tasks = todayTasks(selectedDate);
  const checked = getChecked(selectedDate).filter(id => tasks.some(t => t.id === id));
  if (checked.length !== getChecked(selectedDate).length) setChecked(selectedDate, checked);
  localStorage.setItem(doneKey(dateString), String(tasks.length > 0 && checked.length === tasks.length));

  document.getElementById("datePicker").value = dateString;
  document.getElementById("dateLabel").textContent = `${dateString} ${DAY_NAMES[selectedDate.getDay()]} | ${info.displayWeek}`;
  document.getElementById("todayDone").textContent = `${checked.length}/${tasks.length}`;
  document.getElementById("streakNum").textContent = String(calcStreak(selectedDate));
  document.getElementById("weekNum").textContent = info.mode === "formal" ? `${info.weekIndex + 1}/16` : info.displayWeek;
  document.getElementById("daysLeft").textContent = String(Math.max(0, daysBetween(FORMAL_END, selectedDate)));

  const totalFormalDays = daysBetween(FORMAL_END, FORMAL_START) + 1;
  const elapsed = clamp(daysBetween(selectedDate, FORMAL_START) + 1, 0, totalFormalDays);
  const pct = Math.round((elapsed / totalFormalDays) * 100);
  document.getElementById("progressPct").textContent = `${pct}%`;
  document.getElementById("progressFill").style.width = `${pct}%`;
  document.getElementById("progressLabel").textContent = "正式課綱進度：2026-04-27 到 2026-08-16";

  renderHero(info);
  renderTasks(tasks, checked);
  renderWeekOverview(info);
  renderScorecard(info);
  renderPodcast(info);
  renderPriorities();
  renderListeningResources();
  renderSources();
  renderWeakness();
}

function renderHero(info) {
  const week = info.week;
  let title = "";
  let desc = "";
  let chips = [];
  if (info.mode === "setup") {
    const setup = SETUP_DAYS[info.setupIndex];
    title = setup.title;
    desc = setup.desc;
    chips = ["暖身", "Baseline", "English", "Google", "NVIDIA", "TSMC"];
  } else if (info.mode === "before") {
    title = "正式課綱尚未開始";
    desc = "先完成暖身任務，正式週從 2026-04-27 開始。";
    chips = ["準備期"];
  } else if (info.mode === "after") {
    title = "16 週課綱已完成";
    desc = "進入面試週維持模式：少新增，多複習，多模擬。";
    chips = ["維持模式", "Mock", "Weakness repair"];
  } else {
    title = `${info.displayWeek}：${week.focus}`;
    desc = `${week.phase}。本週同時覆蓋 ${week.companies.join(" / ")}，每日約 90 分鐘。`;
    chips = [week.phase, ...week.companies, "Java", "System Design", "English"];
  }
  document.getElementById("phaseTitle").textContent = title;
  document.getElementById("phaseDesc").textContent = desc;
  document.getElementById("weekChips").innerHTML = chips.map(chip => {
    const cls = companyClass(chip) || (chip.includes("Java") ? "java" : chip.includes("System") ? "system" : chip.includes("English") ? "english" : "");
    return `<span class="chip ${cls}">${chip}</span>`;
  }).join("");
}

function renderTasks(tasks, checked) {
  document.getElementById("taskTitle").textContent = "今日任務";
  document.getElementById("taskSub").textContent = "所有卡片都有交付物。勾選之前，請確認你真的留下程式或短筆記。";
  document.getElementById("taskList").innerHTML = tasks.map(t => {
    const done = checked.includes(t.id);
    const companyCls = companyClass(t.company);
    const categoryCls = catClass(t.cat);
    return `
      <article class="task ${done ? "done" : ""}">
        <input type="checkbox" data-task-id="${t.id}" ${done ? "checked" : ""} aria-label="完成 ${t.title}">
        <div>
          <div class="task-meta">
            <span class="pill ${companyCls}">${t.company}</span>
            <span class="pill ${categoryCls}">${catLabel(t.cat)}</span>
            <span class="pill">${t.minutes} 分鐘</span>
          </div>
          <div class="task-title">${t.title}</div>
          <div class="task-detail">${t.detail}</div>
          <div class="deliverable">${t.deliverable}</div>
          ${linkHtml(t.links)}
          ${demoHtml(t)}
        </div>
      </article>
    `;
  }).join("");
  document.querySelectorAll("[data-task-id]").forEach(input => {
    input.addEventListener("change", () => {
      const tasksNow = todayTasks(selectedDate);
      const ids = new Set(getChecked(selectedDate));
      if (input.checked) ids.add(input.dataset.taskId);
      else ids.delete(input.dataset.taskId);
      const filtered = [...ids].filter(id => tasksNow.some(t => t.id === id));
      setChecked(selectedDate, filtered);
      render();
    });
  });
  document.getElementById("doneBanner").classList.toggle("show", tasks.length > 0 && checked.length === tasks.length);
}

function linkHtml(links) {
  if (!links || links.length === 0) return "";
  return `<div class="task-links">${links.map(l => `<a href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`).join("")}</div>`;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function demoHtml(taskItem) {
  const demo = demoForTask(taskItem);
  if (!demo) return "";
  const label = taskItem.cat === "english" ? "看聽講解筆記範例" : "看範本與說明";
  return `<details class="demo"><summary>${label}</summary><pre>${escapeHtml(demo)}</pre></details>`;
}

function getCurrentCard() {
  return ALL_CARDS[selectedCardIndex] || ALL_CARDS[0] || null;
}

function aiContextLabel(card) {
  if (!card) return "目前卡片上下文尚未準備好。";
  return `卡片 #${card.cardNo} · ${card.company} · ${catLabel(card.cat)} · ${card.title}`;
}

function buildAiCardContext(card) {
  if (!card) return "目前沒有可用的卡片上下文。";
  return [
    `目前卡片：#${card.cardNo} ${card.title}`,
    `公司方向：${card.company}`,
    `類型：${catLabel(card.cat)}`,
    `來源：${card.sourceLabel}${card.sourceSub ? ` / ${card.sourceSub}` : ""}`,
    `任務內容：${card.detail}`,
    `交付要求：${card.deliverable}`
  ].join("\n");
}

function buildAiMessages(mode, customPrompt = "") {
  const card = getCurrentCard();
  const systemPrompt = [
    "你是資深 Java backend 面試教練，也是這個面試準備網站的 AI 助理。",
    "請一律使用繁體中文回答，除非使用者明確要求英文。",
    "如果談到程式實作，優先用 Java 的思考方式解釋。",
    "如果使用者要提示，先給方向、資料結構、常見陷阱，不要直接把完整解答全貼出來。",
    "如果是在 system design 題目，請強調 requirements、API、資料模型、瓶頸與 trade-off。"
  ].join("\n");

  const cardContext = buildAiCardContext(card);
  let userPrompt = customPrompt.trim();

  if (mode === "explain") {
    userPrompt = "請用中文拆解這張卡，說明我實際要做什麼、先做哪一步、常見卡點在哪裡，最後給我一個 30~90 分鐘內可執行的做法。";
  } else if (mode === "hint") {
    userPrompt = "請針對這張卡給我解題提示，不要直接把完整答案貼出來。請先告訴我資料結構、核心步驟、常見 edge case，以及 Java 實作時要小心的地方。";
  } else if (mode === "mock") {
    userPrompt = "請模擬資深後端面試官，基於這張卡追問我 5 題。每題後面補一行答題重點，讓我知道回答時應該帶出什麼。";
  }

  return [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `${cardContext}\n\n使用者需求：${userPrompt || "請根據目前卡片給我最有幫助的說明。"}`
    }
  ];
}

function setAiStatus(message) {
  aiState.status = message;
  const node = document.getElementById("aiStatus");
  if (node) node.textContent = message;
}

function renderAiAssistant() {
  const panel = document.getElementById("nvidiaAssistantPanel");
  if (!panel) return;

  const card = getCurrentCard();
  const notice = document.getElementById("aiNotice");
  const responseText = document.getElementById("aiResponseText");
  const modelSelect = document.getElementById("aiModelSelect");
  const promptInput = document.getElementById("aiPromptInput");

  document.getElementById("aiCardContext").textContent = aiContextLabel(card);
  notice.textContent = aiConfig.reason || "";
  notice.classList.toggle("hidden", aiConfig.enabled);

  const currentValue = modelSelect.value;
  modelSelect.innerHTML = (aiConfig.models || []).map(model => `
    <option value="${escapeHtml(model)}">${escapeHtml(model)}</option>
  `).join("");

  const nextModel = aiConfig.models.includes(aiState.model)
    ? aiState.model
    : aiConfig.models.includes(currentValue)
      ? currentValue
      : aiConfig.defaultModel || aiConfig.models[0] || "";
  if (nextModel) {
    modelSelect.value = nextModel;
    aiState.model = nextModel;
  }

  if (promptInput.value !== aiState.prompt) promptInput.value = aiState.prompt;

  const disabled = !aiConfig.enabled || aiState.sending;
  ["aiModelSelect", "aiExplainBtn", "aiHintBtn", "aiMockBtn", "aiPromptInput", "aiAskBtn"].forEach(id => {
    const node = document.getElementById(id);
    if (node) node.disabled = disabled;
  });

  document.getElementById("aiClearBtn").disabled = aiState.sending;
  setAiStatus(aiState.status || "尚未發送請求。");

  if (aiState.lastError) {
    responseText.textContent = aiState.lastError;
    document.getElementById("aiResponseBox").style.borderColor = "rgba(255, 107, 122, 0.28)";
    return;
  }

  const usageText = aiState.usage
    ? `\n\n[usage] prompt_tokens=${aiState.usage.prompt_tokens || 0}, completion_tokens=${aiState.usage.completion_tokens || 0}, total_tokens=${aiState.usage.total_tokens || 0}`
    : "";
  responseText.textContent = aiState.response || "登入後就可以用目前卡片作為上下文發問。";
  document.getElementById("aiResponseBox").style.borderColor = "var(--border)";
  if (aiState.response && usageText && !responseText.textContent.includes("[usage]")) {
    responseText.textContent = `${aiState.response}${usageText}`;
  }
}

async function loadAiConfig() {
  try {
    const response = await fetch("/api/ai-config", { cache: "no-store" });
    const data = await response.json();
    aiConfig = {
      enabled: Boolean(data.enabled),
      provider: data.provider || "NVIDIA NIM",
      models: Array.isArray(data.models) ? data.models : [],
      defaultModel: data.defaultModel || "",
      reason: data.reason || ""
    };
    if (!aiState.model) aiState.model = aiConfig.defaultModel || aiConfig.models[0] || "";
    if (!aiConfig.enabled) {
      aiState.lastError = "";
      aiState.status = "NVIDIA 助理尚未啟用。";
    }
  } catch (error) {
    aiConfig = {
      enabled: false,
      provider: "NVIDIA NIM",
      models: [],
      defaultModel: "",
      reason: `讀取 NVIDIA 助理設定失敗：${error.message || "請稍後再試。"}`
    };
    aiState.status = "NVIDIA 助理設定載入失敗。";
  }
  renderAiAssistant();
}

async function sendAiRequest(mode = "custom") {
  if (!aiConfig.enabled) {
    aiState.lastError = aiConfig.reason || "NVIDIA 助理尚未啟用。";
    aiState.status = "NVIDIA 助理尚未啟用。";
    renderAiAssistant();
    return;
  }
  if (aiState.sending) return;

  const promptInput = document.getElementById("aiPromptInput");
  const customPrompt = (promptInput?.value || "").trim();
  if (mode === "custom" && !customPrompt) {
    aiState.lastError = "請先輸入你的問題。";
    aiState.status = "缺少提問內容。";
    renderAiAssistant();
    return;
  }

  aiState.prompt = customPrompt;
  aiState.lastError = "";
  aiState.sending = true;
  aiState.status = "NVIDIA 回應中...";
  renderAiAssistant();

  try {
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
    if (sessionError) throw sessionError;
    if (!sessionData.session?.access_token) {
      throw new Error("請先登入後再使用 NVIDIA 助理。");
    }
    currentSession = sessionData.session;
    currentAuthUser = sessionData.session.user;
    supabaseUserId = sessionData.session.user?.id || supabaseUserId;

    const requestBody = {
      model: document.getElementById("aiModelSelect").value,
      temperature: 0.25,
      max_tokens: 900,
      messages: buildAiMessages(mode, customPrompt)
    };

    const createChatRequest = accessToken => {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 65000);
      const request = fetch("/api/nvidia/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      }).finally(() => window.clearTimeout(timer));
      return request;
    };

    let response = await createChatRequest(sessionData.session.access_token);

    let data = await response.json().catch(() => ({}));
    if (response.status === 401) {
      const { data: retrySessionData } = await supabaseClient.auth.getSession();
      if (retrySessionData.session?.access_token && retrySessionData.session.access_token !== sessionData.session.access_token) {
        currentSession = retrySessionData.session;
        currentAuthUser = retrySessionData.session.user;
        supabaseUserId = retrySessionData.session.user?.id || supabaseUserId;
        response = await createChatRequest(retrySessionData.session.access_token);
        data = await response.json().catch(() => ({}));
      }
    }

    if (!response.ok) {
      const extra = data.auth_reason ? ` (${data.auth_reason}${data.auth_status ? `:${data.auth_status}` : ""})` : "";
      throw new Error(`${data.details || data.error || "NVIDIA API 呼叫失敗。"}${extra}`);
    }

    aiState.model = data.model || document.getElementById("aiModelSelect").value;
    aiState.response = data.text || "模型沒有回傳內容。";
    aiState.usage = data.usage || null;
    aiState.status = `已收到 ${aiState.model} 的回覆。`;
  } catch (error) {
    aiState.response = "";
    aiState.usage = null;
    aiState.lastError = error?.name === "AbortError"
      ? "等待 NVIDIA 助理回覆逾時。請稍後再試，或先換一個模型。"
      : (error.message || "NVIDIA API 呼叫失敗。");
    aiState.status = "NVIDIA 助理暫時不可用。";
  } finally {
    aiState.sending = false;
    renderAiAssistant();
  }
}

function demoForTask(taskItem) {
  if (!taskItem) return "";
  if (DEMO_SCRIPTS[taskItem.title]) return DEMO_SCRIPTS[taskItem.title];
  if (taskItem.title === "Daily interview log") return NOTE_TEMPLATE;
  const info = getWeekInfo(selectedDate);
  const dow = selectedDate.getDay();
  if (info.mode === "formal" && info.weekIndex === 0 && taskItem.cat === "english") {
    if (taskItem.title.startsWith("聽講解") && WEEK1_ENGLISH_DEMOS[dow]) return WEEK1_ENGLISH_DEMOS[dow];
    if (taskItem.title === "Friday listening review") return WEEK1_ENGLISH_DEMOS[5];
  }
  return "";
}

function renderWeekOverview(info) {
  if (info.mode === "setup") {
    const rows = SETUP_DAYS.map((day, idx) => `<tr><td>Day ${idx + 1}</td><td>${day.title}</td><td>${day.desc}</td></tr>`).join("");
    document.getElementById("weekOverview").innerHTML = `<table class="week-table"><thead><tr><th>日</th><th>主題</th><th>目的</th></tr></thead><tbody>${rows}</tbody></table>`;
    return;
  }
  const week = info.week || WEEKS[0];
  const rows = [
    ["週一", "Coding + Java", `${week.coding[0].title}；${week.java.topic}`],
    ["週二", "Coding + System Design", `${week.coding[1].title}；${week.design.topic}`],
    ["週三", "Coding + NVIDIA/Infra", `${week.coding[2].title}；${week.nvidia.topic}`],
    ["週四", "Coding/Data + TSMC", `${week.coding[3].title}；${week.tsmc.topic}`],
    ["週五", "Coding + Behavioral + Podcast", `${week.coding[4].title}；${week.behavior}`],
    ["週六", "Mock + Review", "錯題冷解、system design mock、英文 recap"],
    ["週日", "Light Review", "scorecard、podcast listening、下週預習"]
  ].map(row => `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td></tr>`).join("");
  document.getElementById("weekOverview").innerHTML = `<table class="week-table"><thead><tr><th>日期</th><th>任務型態</th><th>內容</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function renderScorecard(info) {
  const weekIndex = Math.max(0, info.weekIndex);
  const saved = storageJson(scoreKey(weekIndex), {});
  document.getElementById("scoreGrid").innerHTML = SCORE_FIELDS.map(([key, label, target]) => `
    <div class="score-item">
      <label for="score-${key}">${label} / 目標 ${target}</label>
      <input id="score-${key}" type="number" min="0" max="20" value="${saved[key] ?? ""}" data-score-key="${key}" placeholder="0">
    </div>
  `).join("");
  document.querySelectorAll("[data-score-key]").forEach(input => {
    input.addEventListener("input", () => {
      const next = storageJson(scoreKey(weekIndex), {});
      next[input.dataset.scoreKey] = input.value;
      setJson(scoreKey(weekIndex), next);
    });
  });
}

function renderPodcast(info) {
  const week = info.week || WEEKS[0];
  const prompt = [
    "You are creating an English listening lesson for a senior Java backend engineer preparing for Google, NVIDIA, and TSMC IT.",
    "",
    `Week focus: ${week.focus}`,
    `Companies: ${week.companies.join(", ")}`,
    `Technical themes: ${week.java.topic}; ${week.design.topic}; ${week.tsmc.topic}; ${week.nvidia.topic}`,
    "",
    "Create an 8 to 10 minute two-host technical explanation in clear American English.",
    "The tone should be interview-focused, concise, and practical. Avoid jokes, entertainment chatter, generic motivation, and speaking drills.",
    "",
    "Required structure:",
    "1. Explain the core technical concepts with simple examples.",
    "2. Ask and answer 8 senior-level interview questions slowly and clearly.",
    "3. Include 8 reusable English phrases for understanding system design and trade-off discussion.",
    "4. Include a vocabulary section with English term, Chinese meaning, and one example sentence.",
    "5. End with a checklist of what I should understand after listening.",
    "",
    "This week's special focus:",
    week.podcast,
    "",
    "Use only the notes and links I provide as sources. If a claim is uncertain, say it is a practice assumption."
  ].join("\n");
  document.getElementById("podcastPrompt").value = prompt;
}

function renderPriorities() {
  document.getElementById("priorityList").innerHTML = PRIORITIES.map(p => `
    <div class="priority-card">
      <h3><span class="chip ${p.cls}">${p.company}</span></h3>
      <ul>${p.bullets.map(b => `<li>${b}</li>`).join("")}</ul>
      ${linkHtml(p.links)}
    </div>
  `).join("");
}

function renderListeningResources() {
  document.getElementById("listeningResources").innerHTML = LISTENING_RESOURCES.map(item => `
    <div class="priority-card">
      <h3><span class="chip ${item.cls}">${item.title}</span></h3>
      <ul>${item.bullets.map(b => `<li>${b}</li>`).join("")}</ul>
      ${linkHtml(item.links)}
    </div>
  `).join("");
}

function renderSources() {
  document.getElementById("sourceList").innerHTML = SOURCES.map(s => `
    <div class="source">
      <b>${s[0]}</b>
      <p>${s[1]}</p>
      <a href="${s[2]}" target="_blank" rel="noopener">開啟來源</a>
      <p class="small" style="margin-top:8px;">Checked: ${SOURCE_DATE}</p>
    </div>
  `).join("");
}

function renderWeakness() {
  const items = storageJson(weaknessKey(), []);
  document.getElementById("weakCount").textContent = `${items.filter(x => !x.done).length} 個待回補`;
  document.getElementById("weakList").innerHTML = items.length ? items.map((item, idx) => `
    <label class="weak-item ${item.done ? "done" : ""}">
      <input type="checkbox" data-weak-index="${idx}" ${item.done ? "checked" : ""}>
      <span>${item.text}</span>
    </label>
  `).join("") : `<div class="small">目前沒有弱點項目。遇到講不順或重複錯的地方，就放進來。</div>`;
  document.querySelectorAll("[data-weak-index]").forEach(input => {
    input.addEventListener("change", () => {
      const next = storageJson(weaknessKey(), []);
      next[Number(input.dataset.weakIndex)].done = input.checked;
      setJson(weaknessKey(), next);
      renderWeakness();
    });
  });
}

function addWeakness() {
  const input = document.getElementById("weakInput");
  const text = input.value.trim();
  if (!text) return;
  const items = storageJson(weaknessKey(), []);
  items.unshift({ text, done: false, createdAt: dateKey(new Date()) });
  setJson(weaknessKey(), items);
  input.value = "";
  renderWeakness();
  showToast("已新增弱點");
}

function calcStreak(fromDate) {
  let count = 0;
  let cursor = zeroTime(fromDate);
  for (let i = 0; i < 400; i++) {
    const key = dateKey(cursor);
    if (localStorage.getItem(doneKey(key)) === "true") count++;
    else break;
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
  }
  return count;
}

const CARD_DAY_NAMES = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];

function stableHash(text) {
  let hash = 0;
  const value = String(text);
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

function stableCardId(taskItem, meta) {
  const seed = [
    meta.sourceMode,
    meta.sourceDate || "",
    meta.sourceWeekIndex,
    meta.sourceDow,
    taskItem.cat,
    taskItem.company,
    taskItem.title,
    taskItem.deliverable
  ].join("|");
  return `card-${stableHash(seed)}`;
}

function enrichCard(taskItem, index, meta) {
  return {
    ...taskItem,
    id: stableCardId(taskItem, meta),
    cardNo: index + 1,
    ...meta
  };
}

function buildTaskSequence() {
  const cards = [];

  SETUP_DAYS.forEach(day => {
    const dayDate = parseYmd(day.date);
    day.tasks.forEach(taskItem => {
      cards.push(enrichCard(taskItem, cards.length, {
        sourceMode: "setup",
        sourceLabel: day.title,
        sourceSub: day.desc,
        sourcePhase: "暖身",
        sourceWeekIndex: -1,
        sourceDate: day.date,
        sourceDow: dayDate ? dayDate.getDay() : 0
      }));
    });
  });

  for (let cursor = zeroTime(FORMAL_START); cursor <= FORMAL_END; cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1)) {
    const info = getWeekInfo(cursor);
    const tasks = todayTasks(cursor);
    const dow = cursor.getDay();
    tasks.forEach(taskItem => {
      cards.push(enrichCard(taskItem, cards.length, {
        sourceMode: "formal",
        sourceLabel: `第 ${info.weekIndex + 1} 週 / ${CARD_DAY_NAMES[dow]}`,
        sourceSub: info.week?.focus || "",
        sourcePhase: info.week?.phase || "正式課綱",
        sourceWeekIndex: info.weekIndex,
        sourceDate: dateKey(cursor),
        sourceDow: dow
      }));
    });
  }

  return cards;
}

const ALL_CARDS = buildTaskSequence();
const PROGRESS_EXPORT_VERSION = 1;
let supabaseClient = null;
let supabaseUserId = "";
let syncTimer = 0;
let suppressRemoteSync = false;
let syncState = {
  status: "offline",
  message: "目前先用本機狀態；等雲端同步成功後會自動切換。"
};
let currentSession = null;
let currentAuthUser = null;
let currentProfile = null;
let activeView = getInitialView();
let authBootstrapComplete = false;
let authHydrationPromise = null;
let lastHandledSessionKey = "";
let aiConfig = {
  enabled: false,
  provider: "NVIDIA NIM",
  models: [],
  defaultModel: "",
  reason: "正在檢查 NVIDIA 助理設定..."
};
let aiState = {
  prompt: "",
  response: "",
  status: "尚未發送請求。",
  sending: false,
  model: "",
  usage: null,
  lastError: ""
};

function aiConversationKey(cardId) {
  return `prep-v3:ai-chat:${cardId}`;
}

function normalizeAiConversation(items) {
  if (!Array.isArray(items)) return [];
  return items
    .filter(item => item && typeof item.content === "string" && item.content.trim())
    .map(item => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: item.content.trim(),
      createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
      model: typeof item.model === "string" ? item.model : "",
      usage: item.usage && typeof item.usage === "object" ? item.usage : null
    }));
}

function getAiConversation(card = getCurrentCard()) {
  if (!card) return [];
  return normalizeAiConversation(storageJson(aiConversationKey(card.id), []));
}

function setAiConversation(card, items) {
  if (!card) return;
  localStorage.setItem(aiConversationKey(card.id), JSON.stringify(normalizeAiConversation(items)));
}

function clearAiConversation(card = getCurrentCard()) {
  if (!card) return;
  localStorage.removeItem(aiConversationKey(card.id));
}

function cardCompletedKey() { return "prep-v3:completed-cards"; }
function cardIndexKey() { return "prep-v3:selected-card-index"; }

function getCompletedCardIds() {
  const validIds = new Set(ALL_CARDS.map(card => card.id));
  return storageJson(cardCompletedKey(), []).filter(id => validIds.has(id));
}

function setCompletedCardIds(ids) {
  setJson(cardCompletedKey(), ids);
}

function readAllScores() {
  const scores = {};
  WEEKS.forEach((_, weekIndex) => {
    const saved = storageJson(scoreKey(weekIndex), {});
    if (saved && typeof saved === "object" && Object.keys(saved).length) {
      scores[`week-${weekIndex + 1}`] = saved;
    }
  });
  return scores;
}

function normalizeWeaknessItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .filter(item => item && typeof item.text === "string" && item.text.trim())
    .map(item => ({
      text: item.text.trim(),
      done: Boolean(item.done),
      createdAt: typeof item.createdAt === "string" ? item.createdAt : dateKey(new Date())
    }));
}

function buildProgressSnapshot() {
  return {
    version: PROGRESS_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    totalCards: ALL_CARDS.length,
    selectedCardIndex,
    selectedCardNo: selectedCardIndex + 1,
    completedCardIds: getCompletedCardIds(),
    weaknesses: normalizeWeaknessItems(storageJson(weaknessKey(), [])),
    scores: readAllScores()
  };
}

function applyProgressSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") {
    throw new Error("進度檔格式不正確。");
  }

  suppressRemoteSync = true;
  try {
    const validIds = new Set(ALL_CARDS.map(card => card.id));
    const completedCardIds = Array.isArray(snapshot.completedCardIds)
      ? snapshot.completedCardIds.filter(id => validIds.has(id))
      : [];

    setCompletedCardIds(completedCardIds);

    const maxIndex = Math.max(0, ALL_CARDS.length - 1);
    const rawIndex = Number(snapshot.selectedCardIndex);
    const nextIndex = Number.isInteger(rawIndex)
      ? clamp(rawIndex, 0, maxIndex)
      : firstIncompleteCardIndex(completedCardIds);
    setSelectedCardIndex(nextIndex);

    setJson(weaknessKey(), normalizeWeaknessItems(snapshot.weaknesses));

    WEEKS.forEach((_, weekIndex) => {
      const value = snapshot.scores && typeof snapshot.scores === "object"
        ? snapshot.scores[`week-${weekIndex + 1}`]
        : {};
      setJson(scoreKey(weekIndex), value && typeof value === "object" ? value : {});
    });
  } finally {
    suppressRemoteSync = false;
  }
}

function progressFilename() {
  const stamp = new Date().toISOString().replaceAll(":", "").replace(/\.\d{3}Z$/, "Z");
  return `interview-progress-${stamp}.json`;
}

function downloadProgressSnapshot() {
  const snapshot = buildProgressSnapshot();
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = progressFilename();
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return snapshot;
}

function setSyncState(status, message) {
  syncState = { status, message };
  const node = document.getElementById("progressStatus");
  if (node) renderProgressPanel();
}

function buildRemoteProgressRow() {
  const snapshot = buildProgressSnapshot();
  return {
    user_id: supabaseUserId,
    selected_card_index: snapshot.selectedCardIndex,
    completed_card_ids: snapshot.completedCardIds,
    weaknesses: snapshot.weaknesses,
    scores: snapshot.scores,
    updated_at: new Date().toISOString()
  };
}

function scheduleRemoteSync() {
  if (suppressRemoteSync || !supabaseClient || !supabaseUserId) return;
  setSyncState("saving", "雲端同步中...");
  window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(async () => {
    try {
      const { error } = await supabaseClient
        .from(SUPABASE_PROGRESS_TABLE)
        .upsert(buildRemoteProgressRow(), { onConflict: "user_id" });
      if (error) throw error;
      const nowText = new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setSyncState("ready", `雲端同步完成，最後更新 ${nowText}。`);
      if (activeView === "users") {
        await loadUsersProgress();
      }
    } catch (error) {
      console.error(error);
      setSyncState("error", `雲端同步失敗：${error.message || "請檢查 Supabase 設定。"}`);
    }
  }, 500);
}

async function fetchCurrentProfile(userId) {
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("id, username, role, created_at")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

async function loadRemoteProgress() {
  const { data, error } = await supabaseClient
    .from(SUPABASE_PROGRESS_TABLE)
    .select("selected_card_index, completed_card_ids, weaknesses, scores, updated_at")
    .eq("user_id", supabaseUserId)
    .maybeSingle();
  if (error) throw error;

  if (data) {
    applyProgressSnapshot({
      selectedCardIndex: data.selected_card_index,
      completedCardIds: Array.isArray(data.completed_card_ids) ? data.completed_card_ids : [],
      weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses : [],
      scores: data.scores && typeof data.scores === "object" ? data.scores : {}
    });
    const updatedText = data.updated_at
      ? new Date(data.updated_at).toLocaleString("zh-TW", { hour12: false })
      : "剛剛";
    setSyncState("ready", `雲端進度已載入；最後同步 ${updatedText}。`);
  } else {
    const { error: insertError } = await supabaseClient
      .from(SUPABASE_PROGRESS_TABLE)
      .upsert(buildRemoteProgressRow(), { onConflict: "user_id" });
    if (insertError) throw insertError;
    setSyncState("ready", "已建立你的第一份雲端進度。");
  }
}

async function loadUsersProgress() {
  if (!supabaseClient || !currentSession) return;
  const { data, error } = await supabaseClient.rpc(SUPABASE_PROGRESS_OVERVIEW_RPC);
  if (error) {
    document.getElementById("usersProgressTable").innerHTML = `<div class="danger-note">讀取所有使用者進度失敗：${escapeHtml(error.message || "請稍後再試。")}</div>`;
    return;
  }

  if (!data || !data.length) {
    document.getElementById("usersProgressTable").innerHTML = `<div class="small">目前還沒有使用者資料。</div>`;
    return;
  }

  const rows = data.map(item => `
    <tr ${item.user_id === supabaseUserId ? `style="background: rgba(110, 168, 254, 0.06);"` : ""}>
      <td>${escapeHtml(item.username || "(unknown)")}</td>
      <td>${escapeHtml(item.role || "member")}</td>
      <td>${Number(item.completed_count || 0)}/${ALL_CARDS.length}</td>
      <td>#${Number(item.current_card_no || 1)}</td>
      <td>${item.updated_at ? escapeHtml(new Date(item.updated_at).toLocaleString("zh-TW", { hour12: false })) : "-"}</td>
    </tr>
  `).join("");

  document.getElementById("usersProgressTable").innerHTML = `
    <table class="week-table">
      <thead>
        <tr><th>使用者</th><th>角色</th><th>完成卡數</th><th>目前卡號</th><th>最近同步</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function fallbackProfileFromSession(session) {
  const usernameFromMeta = session?.user?.user_metadata?.username;
  const email = session?.user?.email || "";
  return {
    id: session?.user?.id || "",
    username: usernameFromMeta || (email.includes("@") ? email.split("@")[0] : email || "member"),
    role: currentProfile?.role || "member",
    created_at: session?.user?.created_at || null
  };
}

function sessionKey(session) {
  if (!session) return "";
  return session.access_token || `${session.user?.id || ""}:${session.expires_at || ""}`;
}

async function handleSignedInSession(session) {
  currentSession = session;
  currentAuthUser = session.user;
  supabaseUserId = session.user.id;
  document.getElementById("authShell").classList.add("hidden");
  document.getElementById("appShell").classList.remove("hidden");
  try {
    currentProfile = await fetchCurrentProfile(supabaseUserId);
  } catch (error) {
    console.warn("Profile load failed, using session metadata fallback.", error);
    currentProfile = fallbackProfileFromSession(session);
    setErrorBox(`已登入，但讀取個人資料失敗：${error.message || "請稍後再試。"}`);
  }
  updateUserPill();
  setSyncState("connecting", "正在載入你的雲端進度...");
  try {
    await loadRemoteProgress();
  } catch (error) {
    console.error(error);
    setSyncState("error", `已登入，但雲端進度載入失敗：${error.message || "請稍後再試。"}`);
  }
  try {
    await loadUsersProgress();
  } catch (error) {
    console.error(error);
  }
  render();
}

function hydrateSignedInSession(session) {
  const nextKey = sessionKey(session);
  if (!nextKey) return Promise.resolve();
  if (nextKey === lastHandledSessionKey) return Promise.resolve();
  if (authHydrationPromise) return authHydrationPromise;

  authHydrationPromise = handleSignedInSession(session)
    .then(() => {
      lastHandledSessionKey = nextKey;
    })
    .finally(() => {
      authHydrationPromise = null;
    });

  return authHydrationPromise;
}

function showLoggedOutState() {
  currentSession = null;
  currentAuthUser = null;
  currentProfile = null;
  supabaseUserId = "";
  lastHandledSessionKey = "";
  setSyncState("offline", "請先登入；登入後就會同步你的跨裝置進度。");
  document.getElementById("appShell").classList.add("hidden");
  document.getElementById("authShell").classList.remove("hidden");
  document.getElementById("usersProgressTable").innerHTML = "";
  updateUserPill();
}

async function initSupabaseAuth() {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    setSyncState("offline", "尚未設定 Supabase 連線。");
    return;
  }
  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    setErrorBox("Supabase SDK 載入失敗。");
    return;
  }

  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  });
  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (!session) {
      if (!authBootstrapComplete || event === "INITIAL_SESSION") return;
      showLoggedOutState();
      return;
    }
    window.setTimeout(() => {
      hydrateSignedInSession(session).catch(error => {
        console.error(error);
        setErrorBox(`登入後初始化失敗：${error.message || "請檢查 Supabase schema。"}`);
        setSyncState("error", `已登入，但初始化失敗：${error.message || "請稍後再試。"}`);
      });
    }, 0);
  });

  try {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) throw error;
    authBootstrapComplete = true;
    if (data.session) await hydrateSignedInSession(data.session);
    else showLoggedOutState();
  } catch (error) {
    console.error(error);
    authBootstrapComplete = true;
    setErrorBox(`Supabase 連線失敗：${error.message || "請檢查金鑰與登入設定。"}`);
    showLoggedOutState();
  }
}

function renderProgressPanel() {
  const snapshot = buildProgressSnapshot();
  const openWeaknesses = snapshot.weaknesses.filter(item => !item.done).length;
  document.getElementById("progressStatus").textContent =
    `已完成 ${snapshot.completedCardIds.length}/${snapshot.totalCards} 張；未完成弱點 ${openWeaknesses} 項。${syncState.message}`;
}

function firstIncompleteCardIndex(completedIds = getCompletedCardIds()) {
  const done = new Set(completedIds);
  const index = ALL_CARDS.findIndex(card => !done.has(card.id));
  return index === -1 ? ALL_CARDS.length - 1 : index;
}

function getInitialView() {
  const params = new URLSearchParams(location.search);
  const view = params.get("view");
  return ["board", "users", "chat"].includes(view) ? view : "board";
}

function getInitialCardIndex() {
  const params = new URLSearchParams(location.search);
  const queryCard = Number(params.get("card"));
  if (Number.isInteger(queryCard) && queryCard >= 1 && queryCard <= ALL_CARDS.length) return queryCard - 1;
  const saved = Number(localStorage.getItem(cardIndexKey()));
  if (Number.isInteger(saved) && saved >= 0 && saved < ALL_CARDS.length) return saved;
  return firstIncompleteCardIndex();
}

let selectedCardIndex = getInitialCardIndex();
function sidebarFilterKey() { return "prep-v3:sidebar-filter"; }
function sidebarSearchKey() { return "prep-v3:sidebar-search"; }
let sidebarFilter = ["all", "pending", "done"].includes(localStorage.getItem(sidebarFilterKey()))
  ? localStorage.getItem(sidebarFilterKey())
  : "all";
let sidebarSearch = localStorage.getItem(sidebarSearchKey()) || "";

function syncLocationState() {
  const url = new URL(location.href);
  url.searchParams.set("card", String(selectedCardIndex + 1));
  if (activeView === "board") url.searchParams.delete("view");
  else url.searchParams.set("view", activeView);
  history.replaceState({}, "", url.toString());
}

function setSelectedCardIndex(index) {
  selectedCardIndex = clamp(index, 0, ALL_CARDS.length - 1);
  localStorage.setItem(cardIndexKey(), String(selectedCardIndex));
  syncLocationState();
  scheduleRemoteSync();
}

function updateSidebarSearch(value) {
  sidebarSearch = String(value || "");
  localStorage.setItem(sidebarSearchKey(), sidebarSearch);
}

function updateSidebarFilter(value) {
  sidebarFilter = ["all", "pending", "done"].includes(value) ? value : "all";
  localStorage.setItem(sidebarFilterKey(), sidebarFilter);
}

function cardSearchText(card) {
  return [
    `#${card.cardNo}`,
    card.title,
    card.company,
    catLabel(card.cat),
    card.sourceLabel,
    card.sourceSub,
    card.sourcePhase
  ].filter(Boolean).join(" ").toLowerCase();
}

function getVisibleSidebarCards(completedIds) {
  const done = new Set(completedIds);
  const query = sidebarSearch.trim().toLowerCase();
  return ALL_CARDS.filter(card => {
    const isDone = done.has(card.id);
    if (sidebarFilter === "done" && !isDone) return false;
    if (sidebarFilter === "pending" && isDone) return false;
    if (!query) return true;
    return cardSearchText(card).includes(query);
  });
}

function openCard(index, nextView = activeView === "chat" ? "chat" : "board") {
  setSelectedCardIndex(index);
  if (nextView === "chat") setActiveView("chat");
  else if (nextView === "users") setActiveView("users");
  else setActiveView("board");
  render();
}

function renderSidebar(completedIds) {
  const input = document.getElementById("sidebarSearch");
  const meta = document.getElementById("sidebarMeta");
  const summary = document.getElementById("sidebarSummary");
  const list = document.getElementById("sidebarCardList");
  if (!input || !meta || !summary || !list) return;

  const done = new Set(completedIds);
  const visibleCards = getVisibleSidebarCards(completedIds);
  const pendingCount = ALL_CARDS.length - completedIds.length;

  if (input.value !== sidebarSearch) input.value = sidebarSearch;
  document.querySelectorAll("[data-card-filter]").forEach(button => {
    button.classList.toggle("active", button.dataset.cardFilter === sidebarFilter);
  });

  summary.textContent = `${completedIds.length} / ${ALL_CARDS.length}`;
  meta.textContent = `目前顯示 ${visibleCards.length} 張，未完成 ${pendingCount} 張，已完成 ${completedIds.length} 張。`;

  if (!visibleCards.length) {
    list.innerHTML = `<div class="sidebar-empty">目前沒有符合篩選條件的卡片。試試看清掉搜尋字，或切回「全部」。</div>`;
    return;
  }

  list.innerHTML = visibleCards.map(card => {
    const isDone = done.has(card.id);
    const isActive = card.cardNo - 1 === selectedCardIndex;
    return `
      <article class="sidebar-card ${isDone ? "done" : "pending"} ${isActive ? "active" : ""}" data-card-index="${card.cardNo - 1}">
        <div class="sidebar-card-top">
          <span class="sidebar-card-no">#${card.cardNo}</span>
          <span class="sidebar-card-state">${isDone ? "已完成" : "進行中"}</span>
        </div>
        <div class="sidebar-card-title">${escapeHtml(card.title)}</div>
        <div class="sidebar-card-meta">${escapeHtml(card.company)} / ${escapeHtml(catLabel(card.cat))}</div>
        <div class="sidebar-card-sub">${escapeHtml(card.sourceLabel)}</div>
        <div class="sidebar-card-actions">
          <button type="button" data-sidebar-open-board="${card.cardNo - 1}">打開卡片</button>
          <button type="button" data-sidebar-open-chat="${card.cardNo - 1}">AI 對話</button>
        </div>
      </article>
    `;
  }).join("");

  document.querySelectorAll("[data-card-index]").forEach(node => {
    node.addEventListener("click", event => {
      if (event.target.closest("button")) return;
      openCard(Number(node.dataset.cardIndex), activeView === "chat" ? "chat" : "board");
    });
  });
  document.querySelectorAll("[data-sidebar-open-board]").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      openCard(Number(button.dataset.sidebarOpenBoard), "board");
    });
  });
  document.querySelectorAll("[data-sidebar-open-chat]").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      openCard(Number(button.dataset.sidebarOpenChat), "chat");
    });
  });
}

function demoForTask(taskItem) {
  if (!taskItem) return "";
  if (DEMO_SCRIPTS[taskItem.title]) return DEMO_SCRIPTS[taskItem.title];
  if (taskItem.title === "Daily interview log") return NOTE_TEMPLATE;
  if (taskItem.sourceMode === "formal" && taskItem.sourceWeekIndex === 0 && taskItem.cat === "english") {
    if (taskItem.title.startsWith("聽講解") && WEEK1_ENGLISH_DEMOS[taskItem.sourceDow]) return WEEK1_ENGLISH_DEMOS[taskItem.sourceDow];
    if (taskItem.title === "Friday listening review") return WEEK1_ENGLISH_DEMOS[5];
  }
  return "";
}

function renderHero(card, completedIds) {
  const chips = [
    card.sourcePhase,
    card.company,
    catLabel(card.cat),
    card.sourceMode === "formal" ? `第 ${card.sourceWeekIndex + 1} 週` : "暖身"
  ].filter(Boolean);

  document.getElementById("phaseTitle").textContent = `卡片 #${card.cardNo}：${card.title}`;
  document.getElementById("phaseDesc").textContent = `${card.sourceLabel}${card.sourceSub ? " · " + card.sourceSub : ""}`;
  document.getElementById("weekChips").innerHTML = chips.map(chip => {
    const cls = companyClass(chip) || (chip.includes("Java") ? "java" : chip.includes("System") ? "system" : chip.includes("English") ? "english" : "");
    return `<span class="chip ${cls}">${chip}</span>`;
  }).join("");

  document.getElementById("dateLabel").textContent = `卡號 #${card.cardNo} | ${card.sourceLabel}`;
  document.getElementById("todayDone").textContent = `${completedIds.length}/${ALL_CARDS.length}`;
  document.getElementById("streakNum").textContent = String(card.cardNo);
  document.getElementById("weekNum").textContent = card.sourceMode === "formal" ? `${card.sourceWeekIndex + 1}/16` : "暖身";
  document.getElementById("daysLeft").textContent = String(ALL_CARDS.length - completedIds.length);

  const pct = Math.round((completedIds.length / ALL_CARDS.length) * 100);
  document.getElementById("progressPct").textContent = `${pct}%`;
  document.getElementById("progressFill").style.width = `${pct}%`;
  document.getElementById("progressLabel").textContent = `卡片進度：共 ${ALL_CARDS.length} 張，做完一張就往下一張走`;
}

function renderTasks(card, completedIds) {
  const done = completedIds.includes(card.id);
  document.getElementById("taskTitle").textContent = "目前卡片";
  document.getElementById("taskSub").textContent = "只做這一張。做完勾選，下次直接接下一張未完成卡。";
  document.getElementById("taskList").innerHTML = `
    <article class="task clickable-card ${done ? "done" : ""}" data-open-chat-card="${card.cardNo}">
      <input type="checkbox" data-task-id="${card.id}" ${done ? "checked" : ""} aria-label="完成 ${card.title}">
      <div>
        <div class="task-meta">
          <span class="pill ${companyClass(card.company)}">${card.company}</span>
          <span class="pill ${catClass(card.cat)}">${catLabel(card.cat)}</span>
          <span class="pill">${card.minutes} 分鐘</span>
          <span class="pill">#${card.cardNo}</span>
        </div>
        <div class="task-title">${card.title}</div>
        <div class="task-detail">${card.detail}</div>
        <div class="deliverable">${card.deliverable}</div>
        ${linkHtml(card.links)}
        ${demoHtml(card)}
        <div class="task-actions">
          <button type="button" data-open-chat-btn="${card.cardNo}">打開完整 AI 對話頁</button>
        </div>
      </div>
    </article>
  `;

  document.querySelectorAll("[data-task-id]").forEach(input => {
    input.addEventListener("change", () => {
      const ids = new Set(getCompletedCardIds());
      if (input.checked) ids.add(card.id);
      else ids.delete(card.id);
      setCompletedCardIds([...ids]);

      if (input.checked) {
        setSelectedCardIndex(firstIncompleteCardIndex([...ids]));
        showToast("已完成，已跳到下一張未完成卡");
      } else {
        setSelectedCardIndex(card.cardNo - 1);
        showToast("已取消完成");
      }
      render();
    });
  });
  document.querySelectorAll("[data-open-chat-card]").forEach(node => {
    node.addEventListener("click", event => {
      if (event.target.closest("button, a, input, textarea, select, label, summary, details")) return;
      openAiChat(Number(node.dataset.openChatCard) - 1);
    });
  });
  document.querySelectorAll("[data-open-chat-btn]").forEach(button => {
    button.addEventListener("click", () => {
      openAiChat(Number(button.dataset.openChatBtn) - 1);
    });
  });

  const allDone = completedIds.length === ALL_CARDS.length;
  const banner = document.getElementById("doneBanner");
  banner.textContent = allDone ? "全部卡片都完成了。接下來就是反覆複習弱點與模擬。" : "完成這張後就繼續下一張，不用切日期。";
  banner.classList.toggle("show", allDone);
}

function renderWeekOverview() {
  const completed = new Set(getCompletedCardIds());
  const upcoming = ALL_CARDS.slice(selectedCardIndex, Math.min(selectedCardIndex + 8, ALL_CARDS.length));
  const rows = upcoming.map(card => `
    <tr>
      <td>#${card.cardNo}</td>
      <td>${completed.has(card.id) ? "已完成" : "待做"}</td>
      <td>${card.title}</td>
      <td>${card.company} / ${catLabel(card.cat)}</td>
      <td>${card.sourceLabel}</td>
    </tr>
  `).join("");
  document.getElementById("weekOverview").innerHTML = `
    <table class="week-table">
      <thead>
        <tr><th>卡號</th><th>狀態</th><th>內容</th><th>類型</th><th>來源</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderCompletedList(completedIds) {
  const completedSet = new Set(completedIds);
  const completedCards = ALL_CARDS.filter(card => completedSet.has(card.id));

  if (!completedCards.length) {
    document.getElementById("completedList").innerHTML = `<div class="small">目前還沒有完成卡片。先從 #1 開始，做完後這裡就會開始累積。</div>`;
    return;
  }

  const rows = completedCards.map(card => `
    <tr>
      <td>#${card.cardNo}</td>
      <td>${card.title}</td>
      <td>${card.company} / ${catLabel(card.cat)}</td>
      <td>${card.sourceLabel}</td>
      <td><button type="button" data-jump-card="${card.cardNo}">跳到這張</button></td>
    </tr>
  `).join("");

  document.getElementById("completedList").innerHTML = `
    <div class="small" style="margin-bottom:8px;">目前共完成 ${completedCards.length} 張卡。</div>
    <table class="week-table">
      <thead>
        <tr><th>卡號</th><th>內容</th><th>類型</th><th>來源</th><th>操作</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  document.querySelectorAll("[data-jump-card]").forEach(button => {
    button.addEventListener("click", () => {
      const cardNo = Number(button.dataset.jumpCard);
      if (!Number.isInteger(cardNo)) return;
      setSelectedCardIndex(cardNo - 1);
      render();
      showToast(`已跳到卡片 #${cardNo}`);
    });
  });
}

function render() {
  const completedIds = getCompletedCardIds();
  if (!ALL_CARDS[selectedCardIndex]) setSelectedCardIndex(firstIncompleteCardIndex(completedIds));
  const card = ALL_CARDS[selectedCardIndex] || ALL_CARDS[0];
  document.getElementById("cardPicker").value = card.cardNo;
  renderSidebar(completedIds);
  renderHero(card, completedIds);
  renderTasks(card, completedIds);
  renderWeekOverview();
  renderCompletedList(completedIds);
  renderScorecard({ weekIndex: Math.max(0, card.sourceWeekIndex) });
  renderPodcast({ week: card.sourceMode === "formal" ? WEEKS[card.sourceWeekIndex] : WEEKS[0] });
  renderPriorities();
  renderListeningResources();
  renderSources();
  renderWeakness();
  renderProgressPanel();
  renderAiAssistant();
  renderAiChatView();
}

function aiContextLabel(card) {
  if (!card) return "目前沒有卡片可以聊天。";
  return `卡片 #${card.cardNo} · ${card.company} · ${catLabel(card.cat)} · ${card.title}`;
}

function buildAiCardContext(card) {
  if (!card) return "目前沒有卡片內容。";
  return [
    `卡號：#${card.cardNo}`,
    `標題：${card.title}`,
    `公司方向：${card.company}`,
    `類型：${catLabel(card.cat)}`,
    `來源：${card.sourceLabel}${card.sourceSub ? ` / ${card.sourceSub}` : ""}`,
    `任務內容：${card.detail}`,
    `完成標準：${card.deliverable}`
  ].join("\n");
}

function buildAiPrompt(mode, customPrompt = "") {
  const rawPrompt = String(customPrompt || "").trim();
  if (mode === "explain") {
    return "請先用中文把這張卡拆解清楚：它在考什麼、我該怎麼開始、常見陷阱是什麼，最後再給我一個最實戰的下一步。";
  }
  if (mode === "hint") {
    return "先不要直接把答案整份交給我。請給我 Java 解題提示、可用資料結構、edge case，以及我自己該先想的檢查點。";
  }
  if (mode === "mock") {
    return "請你扮演面試官，根據這張卡先追問我 5 題，難度用 senior backend interview 的深度。每次先丟問題，不要一次把完整答案講完。";
  }
  return rawPrompt;
}

function buildAiMessages(conversation = []) {
  const card = getCurrentCard();
  const systemPrompt = [
    "你是資深 Java backend 面試教練。",
    "請用清楚、務實、偏面試陪練的方式回答，不要空泛鼓勵。",
    "預設使用繁體中文，但保留必要的英文技術詞彙。",
    "如果是 coding 題，優先講思路、資料結構、複雜度、edge case 與 Java 實作提醒。",
    "如果是 system design 題，優先講 requirements、API、data model、bottleneck、trade-off 與 observability。",
    "如果使用者要求模擬追問，請一次只丟一到兩題，保持像真的對話。"
  ].join("\n");

  const cardContext = buildAiCardContext(card);
  return [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `以下是這次整段對話都要依據的卡片背景。\n\n${cardContext}\n\n後面的來回都請以這張卡為主。`
    },
    ...conversation.map(item => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: item.content
    }))
  ];
}

function formatAiTimestamp(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function setAiStatus(message) {
  aiState.status = message;
  ["aiStatus", "chatStatus"].forEach(id => {
    const node = document.getElementById(id);
    if (node) node.textContent = message;
  });
}

function syncAiModelSelections(selectIds) {
  const optionsHtml = (aiConfig.models || []).map(model => `
    <option value="${escapeHtml(model)}">${escapeHtml(model)}</option>
  `).join("");
  const currentValues = selectIds
    .map(id => document.getElementById(id))
    .filter(Boolean)
    .map(node => node.value)
    .filter(Boolean);

  selectIds.forEach(id => {
    const node = document.getElementById(id);
    if (node) node.innerHTML = optionsHtml;
  });

  const nextModel = aiConfig.models.includes(aiState.model)
    ? aiState.model
    : currentValues.find(value => aiConfig.models.includes(value))
      || aiConfig.defaultModel
      || aiConfig.models[0]
      || "";

  if (!nextModel) return;
  aiState.model = nextModel;
  selectIds.forEach(id => {
    const node = document.getElementById(id);
    if (node) node.value = nextModel;
  });
}

function openAiChat(targetIndex = selectedCardIndex) {
  if (Number.isInteger(targetIndex)) setSelectedCardIndex(targetIndex);
  setActiveView("chat");
  render();
  window.requestAnimationFrame(() => {
    const thread = document.getElementById("chatMessages");
    if (thread) thread.scrollTop = thread.scrollHeight;
  });
}

function renderAiAssistant() {
  const panel = document.getElementById("nvidiaAssistantPanel");
  if (!panel) return;

  const card = getCurrentCard();
  const notice = document.getElementById("aiNotice");
  const responseText = document.getElementById("aiResponseText");
  const promptInput = document.getElementById("aiPromptInput");
  const history = getAiConversation(card);
  const latestAssistantMessage = [...history].reverse().find(item => item.role === "assistant");

  document.getElementById("aiCardContext").textContent = aiContextLabel(card);
  notice.textContent = aiConfig.reason || "";
  notice.classList.toggle("hidden", aiConfig.enabled);
  syncAiModelSelections(["aiModelSelect", "chatModelSelect"]);

  if (promptInput.value !== aiState.prompt) promptInput.value = aiState.prompt;

  const disabled = !aiConfig.enabled || aiState.sending;
  ["aiModelSelect", "aiExplainBtn", "aiHintBtn", "aiMockBtn", "aiPromptInput", "aiAskBtn"].forEach(id => {
    const node = document.getElementById(id);
    if (node) node.disabled = disabled;
  });

  document.getElementById("aiClearBtn").disabled = aiState.sending;
  document.getElementById("openAiChatBtn").disabled = !card;
  setAiStatus(aiState.status || "已連線，可以開始發問。");

  if (aiState.lastError) {
    responseText.textContent = aiState.lastError;
    document.getElementById("aiResponseBox").style.borderColor = "rgba(255, 107, 122, 0.28)";
    return;
  }

  const usageText = aiState.usage
    ? `\n\n[usage] prompt_tokens=${aiState.usage.prompt_tokens || 0}, completion_tokens=${aiState.usage.completion_tokens || 0}, total_tokens=${aiState.usage.total_tokens || 0}`
    : "";
  responseText.textContent = aiState.response || latestAssistantMessage?.content || "登入後就可以用目前卡片作為上下文發問。";
  document.getElementById("aiResponseBox").style.borderColor = "var(--border)";
  if (aiState.response && usageText && !responseText.textContent.includes("[usage]")) {
    responseText.textContent = `${aiState.response}${usageText}`;
  }
}

function renderAiChatView() {
  const chatView = document.getElementById("chatView");
  if (!chatView) return;

  const card = getCurrentCard();
  const history = getAiConversation(card);
  const thread = document.getElementById("chatMessages");
  const input = document.getElementById("chatInput");
  const meta = document.getElementById("chatCardMeta");

  document.getElementById("chatCardKicker").textContent = card ? `卡片 #${card.cardNo} 對話` : "AI 對話頁";
  document.getElementById("chatTitle").textContent = card ? card.title : "請先選一張卡";
  document.getElementById("chatSubtitle").textContent = card
    ? `${card.company} · ${catLabel(card.cat)} · ${card.sourceLabel}${card.sourceSub ? ` / ${card.sourceSub}` : ""}`
    : "回到卡片列表選一張，再來這裡一來一回聊。";
  meta.innerHTML = card ? [
    `<span class="chip ${companyClass(card.company)}">${card.company}</span>`,
    `<span class="chip ${catClass(card.cat)}">${catLabel(card.cat)}</span>`,
    `<span class="chip">#${card.cardNo}</span>`,
    `<span class="chip">${card.minutes} 分鐘</span>`
  ].join("") : "";

  syncAiModelSelections(["chatModelSelect", "aiModelSelect"]);
  if (input.value !== aiState.prompt) input.value = aiState.prompt;

  const disabled = !card || !aiConfig.enabled || aiState.sending;
  ["chatModelSelect", "chatInput", "chatSendBtn", "chatExplainBtn", "chatHintBtn", "chatMockBtn"].forEach(id => {
    const node = document.getElementById(id);
    if (node) node.disabled = disabled;
  });
  document.getElementById("chatClearBtn").disabled = !card || aiState.sending;
  document.getElementById("chatJumpNextBtn").disabled = aiState.sending;

  const messages = history.map(item => {
    const metaParts = [item.role === "assistant" ? "NVIDIA 助理" : "你"];
    if (item.model) metaParts.push(item.model);
    const stamp = formatAiTimestamp(item.createdAt);
    if (stamp) metaParts.push(stamp);
    return `
      <article class="chat-message ${item.role}">
        <div class="chat-message-meta">${metaParts.map(part => `<span>${escapeHtml(part)}</span>`).join("")}</div>
        <div class="chat-bubble ${item.role}">${escapeHtml(item.content)}</div>
      </article>
    `;
  });

  if (aiState.sending) {
    messages.push(`
      <article class="chat-message assistant">
        <div class="chat-message-meta"><span>NVIDIA 助理</span><span>思考中</span></div>
        <div class="chat-bubble assistant pending">正在整理回覆，稍等一下…</div>
      </article>
    `);
  } else if (aiState.lastError) {
    messages.push(`
      <article class="chat-message assistant">
        <div class="chat-message-meta"><span>NVIDIA 助理</span><span>錯誤</span></div>
        <div class="chat-bubble error">${escapeHtml(aiState.lastError)}</div>
      </article>
    `);
  }

  if (!card) {
    thread.innerHTML = `
      <div class="chat-empty">
        <h3>先回到卡片區選一張題目</h3>
        <p>這個頁面會把目前卡片當成整段對話的固定上下文，所以先選卡，再來聊天會最順。</p>
      </div>
    `;
  } else if (!messages.length) {
    thread.innerHTML = `
      <div class="chat-empty">
        <h3>這張卡的對話還沒開始</h3>
        <p>你可以先按上面的快捷按鈕，或直接在下方輸入想問的內容。之後這張卡的來回訊息會留在這裡。</p>
        <div class="chat-card-meta">
          <span class="chip ${companyClass(card.company)}">${card.company}</span>
          <span class="chip ${catClass(card.cat)}">${catLabel(card.cat)}</span>
          <span class="chip">#${card.cardNo}</span>
        </div>
      </div>
    `;
  } else {
    thread.innerHTML = messages.join("");
  }

  if (!aiState.lastError) {
    setAiStatus(aiState.status || (aiConfig.enabled ? "已登入，可以直接開始問。" : aiConfig.reason || "NVIDIA 助理未啟用。"));
  }

  window.requestAnimationFrame(() => {
    thread.scrollTop = thread.scrollHeight;
  });
}

async function loadAiConfig() {
  try {
    const response = await fetch("/api/ai-config", { cache: "no-store" });
    const data = await response.json();
    aiConfig = {
      enabled: Boolean(data.enabled),
      provider: data.provider || "NVIDIA NIM",
      models: Array.isArray(data.models) ? data.models : [],
      defaultModel: data.defaultModel || "",
      reason: data.reason || ""
    };
    if (!aiState.model) aiState.model = aiConfig.defaultModel || aiConfig.models[0] || "";
    if (!aiConfig.enabled) {
      aiState.lastError = "";
      aiState.status = "NVIDIA 助理尚未啟用。";
    }
  } catch (error) {
    aiConfig = {
      enabled: false,
      provider: "NVIDIA NIM",
      models: [],
      defaultModel: "",
      reason: `讀取 NVIDIA 助理設定失敗：${error.message || "請稍後再試。"}`
    };
    aiState.status = "NVIDIA 助理設定載入失敗。";
  }
  renderAiAssistant();
  renderAiChatView();
}

async function sendAiRequest(mode = "custom") {
  if (!aiConfig.enabled) {
    aiState.lastError = aiConfig.reason || "NVIDIA 助理尚未啟用。";
    aiState.status = "NVIDIA 助理尚未啟用。";
    renderAiAssistant();
    renderAiChatView();
    return;
  }
  if (aiState.sending) return;

  const card = getCurrentCard();
  if (!card) {
    aiState.lastError = "目前沒有可聊天的卡片。";
    aiState.status = "請先選一張卡。";
    renderAiAssistant();
    renderAiChatView();
    return;
  }

  const rawPrompt = String(
    document.getElementById("chatInput")?.value
    || document.getElementById("aiPromptInput")?.value
    || aiState.prompt
    || ""
  ).trim();
  const userPrompt = buildAiPrompt(mode, rawPrompt);

  if (mode === "custom" && !userPrompt) {
    aiState.lastError = "請先輸入你想問的內容。";
    aiState.status = "還沒有送出任何問題。";
    renderAiAssistant();
    renderAiChatView();
    return;
  }

  const conversation = getAiConversation(card);
  const userMessage = {
    role: "user",
    content: userPrompt,
    createdAt: new Date().toISOString()
  };
  const pendingConversation = [...conversation, userMessage];
  setAiConversation(card, pendingConversation);

  aiState.prompt = "";
  aiState.response = "";
  aiState.usage = null;
  aiState.lastError = "";
  aiState.sending = true;
  aiState.status = "NVIDIA 回應中...";
  renderAiAssistant();
  renderAiChatView();

  try {
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
    if (sessionError) throw sessionError;
    if (!sessionData.session?.access_token) {
      throw new Error("請先登入後再使用 NVIDIA 助理。");
    }
    currentSession = sessionData.session;
    currentAuthUser = sessionData.session.user;
    supabaseUserId = sessionData.session.user?.id || supabaseUserId;

    const requestBody = {
      model: document.getElementById("chatModelSelect")?.value || document.getElementById("aiModelSelect").value,
      temperature: 0.25,
      max_tokens: 900,
      messages: buildAiMessages(pendingConversation)
    };

    const createChatRequest = accessToken => {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 65000);
      const request = fetch("/api/nvidia/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      }).finally(() => window.clearTimeout(timer));
      return request;
    };

    let response = await createChatRequest(sessionData.session.access_token);
    let data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      const { data: retrySessionData } = await supabaseClient.auth.getSession();
      if (retrySessionData.session?.access_token && retrySessionData.session.access_token !== sessionData.session.access_token) {
        currentSession = retrySessionData.session;
        currentAuthUser = retrySessionData.session.user;
        supabaseUserId = retrySessionData.session.user?.id || supabaseUserId;
        response = await createChatRequest(retrySessionData.session.access_token);
        data = await response.json().catch(() => ({}));
      }
    }

    if (!response.ok) {
      const extra = data.auth_reason ? ` (${data.auth_reason}${data.auth_status ? `:${data.auth_status}` : ""})` : "";
      throw new Error(`${data.details || data.error || "NVIDIA API 回傳失敗。"}${extra}`);
    }

    aiState.model = data.model || requestBody.model;
    aiState.response = data.text || "模型沒有回傳文字內容。";
    aiState.usage = data.usage || null;
    aiState.status = `已收到 ${aiState.model} 的回覆。`;
    setAiConversation(card, [
      ...pendingConversation,
      {
        role: "assistant",
        content: aiState.response,
        createdAt: new Date().toISOString(),
        model: aiState.model,
        usage: aiState.usage
      }
    ]);
  } catch (error) {
    aiState.response = "";
    aiState.usage = null;
    aiState.lastError = error?.name === "AbortError"
      ? "等待 NVIDIA 助理回覆逾時。請稍後再試，或先換一個模型。"
      : (error.message || "NVIDIA API 回傳失敗。");
    aiState.status = "NVIDIA 助理暫時不可用。";
  } finally {
    aiState.sending = false;
    renderAiAssistant();
    renderAiChatView();
  }
}

document.getElementById("cardPicker").addEventListener("change", event => {
  const no = Number(event.target.value);
  if (Number.isInteger(no) && no >= 1 && no <= ALL_CARDS.length) {
    setSelectedCardIndex(no - 1);
    render();
  }
});
document.getElementById("prevBtn").addEventListener("click", () => {
  setSelectedCardIndex(selectedCardIndex - 1);
  render();
});
document.getElementById("nextTodoBtn").addEventListener("click", () => {
  setSelectedCardIndex(firstIncompleteCardIndex());
  render();
});
document.getElementById("sidebarSearch").addEventListener("input", event => {
  updateSidebarSearch(event.target.value);
  renderSidebar(getCompletedCardIds());
});
document.querySelectorAll("[data-card-filter]").forEach(button => {
  button.addEventListener("click", () => {
    updateSidebarFilter(button.dataset.cardFilter);
    renderSidebar(getCompletedCardIds());
  });
});
document.getElementById("addWeakBtn").addEventListener("click", addWeakness);
document.getElementById("weakInput").addEventListener("keydown", event => {
  if (event.key === "Enter") addWeakness();
});
document.getElementById("clearWeakBtn").addEventListener("click", () => {
  const items = storageJson(weaknessKey(), []).filter(item => !item.done);
  setJson(weaknessKey(), items);
  renderWeakness();
  showToast("已清除完成項目");
});
document.getElementById("copyPodcastBtn").addEventListener("click", async () => {
  const textarea = document.getElementById("podcastPrompt");
  try {
    await navigator.clipboard.writeText(textarea.value);
    document.getElementById("copyStatus").textContent = "已複製，可以貼到 NotebookLM / Gemini。";
  } catch {
    textarea.focus();
    textarea.select();
    document.execCommand("copy");
    document.getElementById("copyStatus").textContent = "已選取 prompt；若未自動複製，請按 Ctrl+C。";
  }
  showToast("Podcast prompt ready");
});
document.getElementById("exportProgressBtn").addEventListener("click", () => {
  const snapshot = downloadProgressSnapshot();
  document.getElementById("progressStatus").textContent =
    `已匯出 ${snapshot.completedCardIds.length} 張完成卡號；建議把檔案存成 progress.local.json。`;
  showToast("進度 JSON 已匯出");
});
document.getElementById("importProgressBtn").addEventListener("click", () => {
  document.getElementById("progressFileInput").click();
});
document.getElementById("progressFileInput").addEventListener("change", async event => {
  const [file] = event.target.files || [];
  event.target.value = "";
  if (!file) return;
  try {
    const text = await file.text();
    const snapshot = JSON.parse(text);
    applyProgressSnapshot(snapshot);
    render();
    scheduleRemoteSync();
    document.getElementById("progressStatus").textContent =
      `已匯入 ${file.name}；目前完成 ${getCompletedCardIds().length}/${ALL_CARDS.length} 張。`;
    showToast("進度 JSON 已匯入");
  } catch (error) {
    document.getElementById("progressStatus").textContent =
      `匯入失敗：${error && error.message ? error.message : "請確認是有效的 JSON 檔。"}`
    ;
    showToast("匯入失敗");
  }
});
document.getElementById("aiPromptInput").addEventListener("input", event => {
  aiState.prompt = event.target.value;
  const chatInput = document.getElementById("chatInput");
  if (chatInput && chatInput.value !== event.target.value) chatInput.value = event.target.value;
});
document.getElementById("aiPromptInput").addEventListener("keydown", event => {
  if (event.isComposing) return;
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendAiRequest("custom");
  }
});
document.getElementById("aiModelSelect").addEventListener("change", event => {
  aiState.model = event.target.value;
  const chatModel = document.getElementById("chatModelSelect");
  if (chatModel) chatModel.value = event.target.value;
});
document.getElementById("aiExplainBtn").addEventListener("click", () => sendAiRequest("explain"));
document.getElementById("aiHintBtn").addEventListener("click", () => sendAiRequest("hint"));
document.getElementById("aiMockBtn").addEventListener("click", () => sendAiRequest("mock"));
document.getElementById("aiAskBtn").addEventListener("click", () => sendAiRequest("custom"));
document.getElementById("openAiChatBtn").addEventListener("click", () => openAiChat());
document.getElementById("aiClearBtn").addEventListener("click", () => {
  aiState.response = "";
  aiState.usage = null;
  aiState.lastError = "";
  aiState.status = "已清空這次回覆預覽。";
  renderAiAssistant();
  renderAiChatView();
});

document.getElementById("loginTabBtn").addEventListener("click", () => setAuthMode("login"));
document.getElementById("registerTabBtn").addEventListener("click", () => setAuthMode("register"));
document.getElementById("viewBoardBtn").addEventListener("click", () => setActiveView("board"));
document.getElementById("viewChatBtn").addEventListener("click", () => openAiChat());
document.getElementById("viewUsersBtn").addEventListener("click", async () => {
  setActiveView("users");
  await loadUsersProgress();
});
document.getElementById("chatBackBtn").addEventListener("click", () => setActiveView("board"));
document.getElementById("chatJumpNextBtn").addEventListener("click", () => {
  const nextIndex = firstIncompleteCardIndex();
  openAiChat(nextIndex);
});
document.getElementById("chatInput").addEventListener("input", event => {
  aiState.prompt = event.target.value;
  const aiPrompt = document.getElementById("aiPromptInput");
  if (aiPrompt && aiPrompt.value !== event.target.value) aiPrompt.value = event.target.value;
});
document.getElementById("chatInput").addEventListener("keydown", event => {
  if (event.isComposing) return;
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendAiRequest("custom");
  }
});
document.getElementById("chatModelSelect").addEventListener("change", event => {
  aiState.model = event.target.value;
  const aiModel = document.getElementById("aiModelSelect");
  if (aiModel) aiModel.value = event.target.value;
});
document.getElementById("chatExplainBtn").addEventListener("click", () => sendAiRequest("explain"));
document.getElementById("chatHintBtn").addEventListener("click", () => sendAiRequest("hint"));
document.getElementById("chatMockBtn").addEventListener("click", () => sendAiRequest("mock"));
document.getElementById("chatSendBtn").addEventListener("click", () => sendAiRequest("custom"));
document.getElementById("chatClearBtn").addEventListener("click", () => {
  clearAiConversation(getCurrentCard());
  aiState.response = "";
  aiState.usage = null;
  aiState.lastError = "";
  aiState.status = "這張卡的對話已清空。";
  renderAiAssistant();
  renderAiChatView();
});
document.getElementById("refreshUsersBtn").addEventListener("click", async () => {
  await loadUsersProgress();
  showToast("已更新所有使用者進度");
});
document.getElementById("logoutBtn").addEventListener("click", async () => {
  if (!supabaseClient) return;
  await supabaseClient.auth.signOut();
  showToast("已登出");
});
document.getElementById("loginForm").addEventListener("submit", async event => {
  event.preventDefault();
  setErrorBox("");
  const username = normalizeUsername(document.getElementById("loginUsername").value);
  const password = document.getElementById("loginPassword").value;
  if (!username || !password) {
    setErrorBox("請輸入 username 和 password。");
    return;
  }
  if (!supabaseClient) {
    setErrorBox("Supabase 尚未初始化完成。");
    return;
  }
  setAuthStatus("登入中...");
  const { error } = await supabaseClient.auth.signInWithPassword({
    email: usernameToEmail(username),
    password
  });
  if (error) {
    setAuthStatus("登入失敗，請再試一次。");
    setErrorBox(error.message || "登入失敗。");
    return;
  }
  setAuthStatus("登入成功，正在載入資料...");
});
document.getElementById("registerForm").addEventListener("submit", async event => {
  event.preventDefault();
  setErrorBox("");
  const username = normalizeUsername(document.getElementById("registerUsername").value);
  const password = document.getElementById("registerPassword").value;
  if (!username || !password) {
    setErrorBox("請輸入 username 和 password。");
    return;
  }
  if (password.length < 8) {
    setErrorBox("密碼至少需要 8 碼。");
    return;
  }
  if (!supabaseClient) {
    setErrorBox("Supabase 尚未初始化完成。");
    return;
  }
  setAuthStatus("建立帳號中...", "registerStatus");
  const { data, error } = await supabaseClient.auth.signUp({
    email: usernameToEmail(username),
    password,
    options: {
      data: { username }
    }
  });
  if (error) {
    setAuthStatus("建立帳號失敗。", "registerStatus");
    setErrorBox(error.message || "建立帳號失敗。");
    return;
  }
  if (!data.session) {
    setAuthStatus("帳號建立成功，但目前沒有 session。", "registerStatus");
    setErrorBox("Supabase 的 Confirm Email 很可能還沒關掉。請到 Authentication -> Sign In / Providers -> Email，把 Confirm Email 關掉後再重試。");
    return;
  }
  setAuthStatus("帳號建立成功，正在載入資料...", "registerStatus");
});

setAuthMode("login");
setActiveView(activeView);
render();
loadAiConfig();
initSupabaseAuth();
