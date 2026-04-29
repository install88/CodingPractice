// Board and sidebar rendering
function demoHtml(taskItem) {
  const demo = demoForTask(taskItem);
  if (!demo) return "";
  const label = taskItem.cat === "english" ? "?雓圾蝑?蝭?" : "???祈?隤芣?";
  return `<details class="demo"><summary>${label}</summary><pre>${escapeHtml(demo)}</pre></details>`;
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
