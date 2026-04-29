// AI chat and assistant rendering
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
