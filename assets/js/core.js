// Core utilities, state, progress sync, and auth
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

function getCurrentCard() {
  return ALL_CARDS[selectedCardIndex] || ALL_CARDS[0] || null;
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
