# NVIDIA AI 助理設定

這個專案現在已經內建 `NVIDIA AI 助理` 面板，會透過後端代理去呼叫 NVIDIA 的模型，不會把 API key 暴露在前端。

## 你要做的事

### 1. 在 Render 設定環境變數

至少要加這個：

- `NVIDIA_API_KEY`

可選：

- `NVIDIA_MODEL`
  - 例如：`nvidia/llama-3.1-nemotron-nano-8b-v1`
- `NVIDIA_MODELS`
  - 用逗號分隔模型清單，前端下拉選單會顯示這些模型
  - 例如：
    - `nvidia/llama-3.1-nemotron-nano-8b-v1,google/gemma-4-31b-it`
- `NVIDIA_API_BASE_URL`
  - 預設就是 `https://integrate.api.nvidia.com/v1`
  - 一般不用改

### 2. 重新部署 Render

環境變數存好後，做一次：

- `Manual Deploy -> Deploy latest commit`

### 3. 登入網站後開始用

登入後右側會多一塊：

- `NVIDIA AI 助理`

你可以直接：

- `解釋這張卡`
- `給我提示`
- `模擬追問`
- 或自己輸入自由問題

## 安全性

這版不是前端直接打 NVIDIA API，而是：

1. 前端先確認使用者已登入 Supabase
2. 前端把 Supabase access token 帶給本站後端
3. 後端驗證 token 後，才代你呼叫 NVIDIA API

所以：

- 沒登入的人不能直接刷你的 NVIDIA key
- key 不會出現在瀏覽器原始碼裡

## 官方參考

- NVIDIA 官方 LLM API 總覽：
  - [https://docs.api.nvidia.com/nim/reference/llm-apis](https://docs.api.nvidia.com/nim/reference/llm-apis)
- NVIDIA 官方 chat completions 參考：
  - [https://docs.api.nvidia.com/nim/reference/google-gemma-4-31b-it-infer](https://docs.api.nvidia.com/nim/reference/google-gemma-4-31b-it-infer)
- NVIDIA API key 頁面：
  - [https://build.nvidia.com/settings/api-keys](https://build.nvidia.com/settings/api-keys)
