// DOM event wiring and app bootstrap
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
