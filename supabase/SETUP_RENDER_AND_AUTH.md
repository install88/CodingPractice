# Render + Auth Setup

這個版本改成正式登入：

- 使用者以 `username + password` 登入
- 進度存在 Supabase
- 可在頁面看到所有使用者的摘要進度
- 第一個註冊成功的使用者會自動成為 `admin`

## 1. 跑資料庫腳本

在 Supabase 的 `SQL Editor` 執行：

- [app_schema.sql](/C:/Users/insta/Desktop/interview_prep/supabase/app_schema.sql)

這會建立：

- `public.profiles`
- `public.learner_progress`
- `public.handle_new_user()` trigger
- `public.list_progress_overview()` summary function

## 2. 開啟 Email/Password 並關掉 Confirm Email

因為這個專案前端是輸入 `username`，底層會轉成系統內部 email，所以你必須把 Supabase 的 `Confirm Email` 關掉，否則新帳號會卡在不可登入狀態。

路徑：

1. `Authentication`
2. `Sign In / Providers`
3. 點 `Email`
4. 確認 `Allow new users to sign up` 是開啟
5. **把 `Confirm Email` 關掉**
6. `Save`

Supabase 官方文件提到：
- hosted project 預設通常需要 email confirmation
- 關掉後，`signUp()` 會直接回傳 session

來源：
- [Password-based Auth](https://supabase.com/docs/guides/auth/passwords)
- [General configuration](https://supabase.com/docs/guides/auth/general-configuration)

## 3. 部署到 Render

這一版可以直接部署成 Render Static Site。

Render 官方文件：
- [Static Sites](https://render.com/docs/static-sites)
- [Blueprint YAML Reference](https://render.com/docs/blueprint-spec)

## 4. 第一個帳號

第一個註冊成功的帳號會自動成為 `admin`。

建議先建立：

- username: `weiZheng`
- password: 你指定的密碼

之後其他人可以從登入畫面的註冊頁自己建立帳號。
