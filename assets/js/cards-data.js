(function () {
function c(company, title, url, note) { return { company, title, url, note }; }
function j(topic, detail, url) { return { topic, detail, url }; }
function d(topic, detail, url) { return { topic, detail, url }; }
function t(topic, detail, url) { return { topic, detail, url }; }
function n(topic, detail, url) { return { topic, detail, url }; }
function task(cat, company, title, minutes, detail, deliverable, links) {
  return { cat, company, title, minutes, detail, deliverable, links: links || [] };
}

const SETUP_DAYS = [
  {
    date: "2026-04-22",
    title: "暖身 Day 1：建立 baseline",
    desc: "先量出現在的 coding、英文、system design 起點。",
    tasks: [
      task("coding", "Google", "Baseline coding：Two Sum + 3Sum", 35, "用 Java 完成 LeetCode #1 Two Sum，接著看 #15 3Sum 的講解或解法，不必硬寫完。", "提交 #1；寫下 #15 會卡住的原因與 edge case。", [{label:"Two Sum", url:"https://leetcode.com/problems/two-sum/"}, {label:"3Sum", url:"https://leetcode.com/problems/3sum/"}]),
      task("english", "All", "聽講解 baseline：Two Sum / 3Sum", 20, "先聽別人怎麼拆題，不急著自己講。重點放在：如何釐清題目、選 HashMap / two pointers、怎麼說 complexity。", "交付：寫 5 行筆記：pattern、資料結構、edge case、time complexity、你聽到的一句好用英文。", [{label:"NeetCode Playlists", url:"https://www.youtube.com/@NeetCode/playlists"}]),
      task("system", "Google", "System design baseline：URL shortener", 25, "只畫 requirements、API、資料表、read/write path、瓶頸，不查答案。", "留下 1 張圖或 10 行筆記，標出你最不確定的地方。", [{label:"Hello Interview", url:"https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction"}]),
      task("behavior", "All", "建立面試筆記格式", 10, "意思是建立一個你每天固定填的面試日誌。你不用寫長篇心得，只要每天記：今天做哪題、卡在哪、複雜度、練了哪句英文、明天要補什麼。", "交付：照下方範本建立一份每日筆記，之後每天複製同一個格式填。", [])
    ]
  },
  {
    date: "2026-04-23",
    title: "暖身 Day 2：履歷與專案素材盤點",
    desc: "資深面試的故事要先準備好，後面每天會逐步打磨。",
    tasks: [
      task("behavior", "All", "專案 inventory", 30, "列出 3 個最能代表你的後端專案：規模、你的角色、技術決策、事故或 trade-off。", "每個專案至少 5 bullets，包含量化結果。", []),
      task("coding", "Google", "HashMap pattern：Group Anagrams", 30, "用 Java 寫 LeetCode #49，練習把 key 設計寫清楚。", "提交程式；英文寫出 time/space complexity。", [{label:"Group Anagrams", url:"https://leetcode.com/problems/group-anagrams/"}]),
      task("java", "Google", "Java HashMap 內部原理", 20, "讀 HashMap bucket、resize、treeification；整理成短筆記。", "用中文 5 bullets + 英文 5 句話整理。", [{label:"Baeldung HashMap", url:"https://www.baeldung.com/java-hashmap-internals"}]),
      task("english", "All", "聽別人怎麼講專案與設計", 10, "聽一段 system design 或 senior engineer mock，觀察對方怎麼從需求講到 trade-off。", "交付：摘 3 句你覺得可以學的英文句型。", [{label:"Hello Interview", url:"https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction"}])
    ]
  },
  {
    date: "2026-04-24",
    title: "暖身 Day 3：SQL / Python / TSMC IT 起點",
    desc: "補上台積電 IT、Data Engineer、Engineering Data Analysis 會用到的資料能力。",
    tasks: [
      task("data", "TSMC", "SQL baseline：SQL50 前 3 題", 35, "完成 LeetCode SQL50 的 select / where / aggregate 入門題。", "每題寫出查詢目的與可能索引。", [{label:"LeetCode SQL50", url:"https://leetcode.com/studyplan/top-sql-50/"}]),
      task("tsmc", "TSMC", "台積電 IT 組織理解", 20, "讀 TSID、ICSD、BSID、AAID，對應到智慧製造、雲端資安、企業系統、AI/工程資料分析。", "寫下你最可能投的 2 條路徑與理由。", [{label:"TSMC IT Careers", url:"https://www.tsmc.com/static/english/careers/it_career/index.html"}]),
      task("java", "TSMC", "OOP / design pattern 快問快答", 20, "整理 Strategy、Factory、Template Method 在企業系統中的使用情境。", "用一個 calculator 或 pricing service 範例說明。", []),
      task("english", "TSMC", "聽懂 TSMC IT / 製造資料語彙", 15, "閱讀 TSMC IT 官方頁，搭配 NotebookLM 產生 Audio Overview 來聽。重點聽懂 manufacturing data、reliability、cross-functional collaboration。", "交付：整理 8 個台積電 IT 相關英文詞彙與中文意思。", [{label:"TSMC IT Careers", url:"https://www.tsmc.com/static/english/careers/it_career/index.html"}, {label:"NotebookLM", url:"https://notebooklm.google.com/"}])
    ]
  },
  {
    date: "2026-04-25",
    title: "暖身 Day 4：NVIDIA infra 與效能意識",
    desc: "建立 NVIDIA 方向的語彙：Kubernetes、inference、latency、throughput、observability。",
    tasks: [
      task("coding", "NVIDIA", "Heap pattern：Top K Frequent Elements", 35, "用 Java 寫 LeetCode #347，練習 HashMap + heap / bucket sort trade-off。", "提交後寫下 2 種解法差異。", [{label:"Top K Frequent", url:"https://leetcode.com/problems/top-k-frequent-elements/"}]),
      task("system", "NVIDIA", "NIM / inference service 概念", 25, "讀 NIM 頁面，抓出 optimized inference、Kubernetes、observability、low latency/high throughput。", "寫出 Java backend 如何呼叫 inference microservice 的高階流程。", [{label:"NVIDIA NIM", url:"https://developer.nvidia.com/nim"}]),
      task("english", "NVIDIA", "聽懂 latency vs throughput", 20, "聽 NVIDIA / infra 類講解，重點放在 batching、queueing、timeout、metrics、GPU utilization。", "交付：寫 5 行聽力筆記；每行都要是一個你真的聽懂的技術點。", [{label:"NVIDIA Developer", url:"https://www.youtube.com/@NVIDIADeveloper/videos"}, {label:"NVIDIA NIM", url:"https://developer.nvidia.com/nim"}]),
      task("behavior", "All", "STAR 故事 1", 10, "寫一個 production incident 或 performance bug 的 STAR 草稿。", "Action 佔 60%，Result 要有數字。", [])
    ]
  },
  {
    date: "2026-04-26",
    title: "暖身 Day 5：正式開跑前校準",
    desc: "把弱點放進清單，明天開始 16 週課綱。",
    tasks: [
      task("coding", "All", "錯題回補", 30, "重做本週最卡的一題，不看答案，最多 25 分鐘。", "記錄卡住點：pattern、Java API、邊界條件或英文表達。", []),
      task("system", "Google", "URL shortener 補強", 25, "看一份參考解法後，修正自己的 API、資料模型、cache 與 rate limit。", "寫出 3 個你原本漏掉的 trade-off。", [{label:"Hello Interview", url:"https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction"}]),
      task("english", "All", "正式週聽力筆記模板", 20, "準備下週固定聽講解的筆記格式：problem、approach、data structure、trade-off、complexity、one sentence。", "交付：建立一份聽力筆記模板；之後每次聽影片都照這個格式填。", []),
      task("behavior", "All", "弱點清單初始化", 15, "把最弱的 5 個點新增到右側弱點清單。", "每個弱點要能被下一週任務驗證。", [])
    ]
  }
];

const LINKS = {
  sql50: "https://leetcode.com/studyplan/top-sql-50/",
  hello: "https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction",
  interviewing: "https://interviewing.io/mocks",
  googleCloudArch: "https://docs.cloud.google.com/architecture",
  googleSre: "https://sre.google/sre-book/table-of-contents/",
  tsmcIt: "https://www.tsmc.com/static/english/careers/it_career/index.html",
  nvidiaHire: "https://www.nvidia.com/en-eu/about-nvidia/careers/how-we-hire/",
  nvidiaNim: "https://developer.nvidia.com/nim",
  nvidiaAutoscale: "https://developer.nvidia.com/blog/horizontal-autoscaling-of-nvidia-nim-microservices-on-kubernetes/",
  notebook: "https://notebooklm.google.com/",
  notebookAudio: "https://blog.google/innovation-and-ai/products/notebooklm-audio-overviews/",
  googleGuide: "https://services.google.com/fh/files/misc/general_virtual_interviews_candidate_resource.pdf",
  googleSenior: "https://www.google.com/about/careers/applications/jobs/results/77738617966863046-senior-software-engineer/",
  baeldungHashMap: "https://www.baeldung.com/java-hashmap-internals",
  baeldungJvm: "https://www.baeldung.com/jvm-garbage-collectors",
  baeldungExecutor: "https://www.baeldung.com/java-executor-service-tutorial",
  baeldungLocks: "https://www.baeldung.com/java-concurrent-locks",
  baeldungJpa: "https://www.baeldung.com/spring-data-jpa-query",
  springTx: "https://docs.spring.io/spring-framework/reference/data-access/transaction.html",
  kafkaDocs: "https://kafka.apache.org/documentation/",
  redisDocs: "https://redis.io/docs/latest/",
  k8sDocs: "https://kubernetes.io/docs/concepts/",
  prometheus: "https://prometheus.io/docs/introduction/overview/",
  triton: "https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/index.html"
};

const WEEKS = [
  {
    phase: "Phase 1：基礎診斷與高頻 pattern",
    focus: "HashMap / Arrays / TSMC IT baseline",
    companies: ["Google", "NVIDIA", "TSMC"],
    coding: [
      c("Google", "LeetCode #49 Group Anagrams", "https://leetcode.com/problems/group-anagrams/", "key design、HashMap、排序成本"),
      c("Google", "LeetCode #3 Longest Substring Without Repeating Characters", "https://leetcode.com/problems/longest-substring-without-repeating-characters/", "sliding window、set/map"),
      c("TSMC", "SQL50：Select + Basic Joins 前 5 題", LINKS.sql50, "資料查詢精準度、join 語意"),
      c("Google", "LeetCode #238 Product of Array Except Self", "https://leetcode.com/problems/product-of-array-except-self/", "prefix/suffix、不可用除法"),
      c("NVIDIA", "LeetCode #347 Top K Frequent Elements", "https://leetcode.com/problems/top-k-frequent-elements/", "heap vs bucket sort")
    ],
    java: j("HashMap、equals/hashCode、immutability", "能解釋 bucket、hash collision、resize、Java 8 treeification，並說明在 cache key / entity key 的風險。", LINKS.baeldungHashMap),
    design: d("Design a rate limiter", "釐清 per-user/per-IP、fixed window、sliding window、token bucket、Redis atomicity、multi-region consistency。", LINKS.hello),
    tsmc: t("TSMC IT 組織與製造資料場景", "整理 TSID/ICSD/BSID/AAID；把你的 Java 後端經驗對應到 fab automation、ERP/SCM、engineering data analysis。", LINKS.tsmcIt),
    nvidia: n("NVIDIA backend performance vocabulary", "準備 latency、throughput、tail latency、batching、queue depth、resource utilization 的英文說法。", LINKS.nvidiaNim),
    behavior: "STAR：一次你在模糊需求下做出技術決策的經驗。",
    podcast: "Explain HashMap, sliding window, rate limiter, and why manufacturing IT systems need reliable data pipelines."
  },
  {
    phase: "Phase 1：資料結構手感",
    focus: "Linked List / Stack / Queue / OOP",
    companies: ["Google", "NVIDIA", "TSMC"],
    coding: [
      c("Google", "LeetCode #206 Reverse Linked List", "https://leetcode.com/problems/reverse-linked-list/", "pointer invariant"),
      c("Google", "LeetCode #20 Valid Parentheses", "https://leetcode.com/problems/valid-parentheses/", "stack、invalid input"),
      c("TSMC", "HackerRank Queue using Two Stacks", "https://www.hackerrank.com/challenges/ctci-queue-using-two-stacks", "上機考常見資料結構"),
      c("Google", "LeetCode #146 LRU Cache", "https://leetcode.com/problems/lru-cache/", "HashMap + doubly linked list"),
      c("TSMC", "Calculator mini design：不使用 eval 實作 + OOP 分層", "https://leetcode.com/problems/basic-calculator-ii/", "parser、operator precedence、design pattern")
    ],
    java: j("Collections、Iterator、LinkedHashMap、LRU", "能寫出 LRU 的 Java 實作，並說明 thread-safe 版本該如何取捨。", "https://www.baeldung.com/java-lru-cache"),
    design: d("Design an audit log service", "API、append-only storage、query by entity/user/time、retention、PII、backfill。", LINKS.googleCloudArch),
    tsmc: t("企業系統 OOP 與 design pattern", "用 ERP/SCM pricing 或 calculator service 解釋 Strategy、Factory、Template Method。", LINKS.tsmcIt),
    nvidia: n("Linux debugging baseline", "整理 top、ps、netstat/ss、lsof、jstack、heap dump 在後端排查中的用途。", "https://www.brendangregg.com/linuxperf.html"),
    behavior: "STAR：一次你把複雜問題拆小、讓團隊能交付的經驗。",
    podcast: "Discuss LRU cache, audit logs, OOP design patterns, and how to explain pointer-heavy problems in English."
  },
  {
    phase: "Phase 1：樹與搜尋",
    focus: "Trees / BFS / DFS / recursion clarity",
    companies: ["Google", "NVIDIA", "TSMC"],
    coding: [
      c("Google", "LeetCode #104 Maximum Depth of Binary Tree", "https://leetcode.com/problems/maximum-depth-of-binary-tree/", "recursion base case"),
      c("Google", "LeetCode #102 Binary Tree Level Order Traversal", "https://leetcode.com/problems/binary-tree-level-order-traversal/", "BFS queue"),
      c("Google", "LeetCode #236 Lowest Common Ancestor", "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/", "post-order reasoning"),
      c("TSMC", "SQL50：Group By / Aggregate 5 題", LINKS.sql50, "製造報表聚合"),
      c("Google", "LeetCode #98 Validate Binary Search Tree", "https://leetcode.com/problems/validate-binary-search-tree/", "bounds、duplicate policy")
    ],
    java: j("JVM memory：heap、stack、metaspace、GC root", "能用面試語言說明物件生命週期、stack overflow、OOM 類型與初步排查。", "https://www.baeldung.com/java-stack-heap"),
    design: d("Design autocomplete", "Trie vs search index、prefix query、ranking、freshness、cache、multi-language。", LINKS.hello),
    tsmc: t("工程資料查詢與聚合", "把 SQL aggregate 對應到 yield、defect count、tool utilization 報表。", LINKS.tsmcIt),
    nvidia: n("Queueing intuition", "理解 queue、worker pool、backpressure；準備 NVIDIA/infra 題常見效能說法。", LINKS.googleSre),
    behavior: "STAR：一次你發現品質問題並主動補測試或監控的經驗。",
    podcast: "Teach tree traversal, JVM memory, autocomplete architecture, and manufacturing aggregate analytics."
  },
  {
    phase: "Phase 1：圖與依賴",
    focus: "Graph / Topological sort / dependency thinking",
    companies: ["Google", "NVIDIA", "TSMC"],
    coding: [
      c("Google", "LeetCode #200 Number of Islands", "https://leetcode.com/problems/number-of-islands/", "DFS/BFS visited"),
      c("Google", "LeetCode #207 Course Schedule", "https://leetcode.com/problems/course-schedule/", "topological sort"),
      c("Google", "LeetCode #210 Course Schedule II", "https://leetcode.com/problems/course-schedule-ii/", "Kahn algorithm"),
      c("NVIDIA", "LeetCode #743 Network Delay Time", "https://leetcode.com/problems/network-delay-time/", "Dijkstra、priority queue"),
      c("TSMC", "SQL50：Subquery / CTE 5 題", LINKS.sql50, "依賴與資料轉換")
    ],
    java: j("ExecutorService、ThreadPoolExecutor", "能解釋 core/max pool、queue、rejection policy、thread starvation。", LINKS.baeldungExecutor),
    design: d("Design a distributed task scheduler", "DAG、worker lease、retry、idempotency、state persistence、dead-letter queue。", LINKS.hello),
    tsmc: t("製造任務排程概念", "把 job scheduler 對應到 fab automation、批次資料處理、報表排程。", LINKS.tsmcIt),
    nvidia: n("Resource scheduling vocabulary", "整理 GPU/CPU/memory、priority、fairness、preemption、utilization 的英文說法。", LINKS.nvidiaNim),
    behavior: "STAR：一次你處理跨服務依賴或排程失敗的經驗。",
    podcast: "Explain graphs, topological sorting, Java thread pools, and distributed task schedulers for interviews."
  },
  {
    phase: "Phase 2：演算法強化",
    focus: "Binary search / Heap / JVM / GC",
    companies: ["Google", "NVIDIA", "TSMC"],
    coding: [
      c("Google", "LeetCode #33 Search in Rotated Sorted Array", "https://leetcode.com/problems/search-in-rotated-sorted-array/", "binary search invariant"),
      c("Google", "LeetCode #215 Kth Largest Element", "https://leetcode.com/problems/kth-largest-element-in-an-array/", "heap vs quickselect"),
      c("NVIDIA", "LeetCode #295 Find Median from Data Stream", "https://leetcode.com/problems/find-median-from-data-stream/", "two heaps、stream"),
      c("Google", "LeetCode #162 Find Peak Element", "https://leetcode.com/problems/find-peak-element/", "binary search on property"),
      c("TSMC", "SQL50：Window Function 入門", LINKS.sql50, "排名、移動平均、設備報表")
    ],
    java: j("GC：G1、ZGC、pause time、allocation rate", "能說明 GC tuning 不是先背參數，而是先看 allocation、pause、heap、latency SLO。", LINKS.baeldungJvm),
    design: d("Design a metrics ingestion pipeline", "agent、gateway、Kafka、storage、downsampling、alert、cardinality explosion。", LINKS.googleSre),
    tsmc: t("設備與製程資料監控", "把 metrics pipeline 對應到 tool health、defect trend、fab dashboard。", LINKS.tsmcIt),
    nvidia: n("Performance debugging", "準備 p95/p99、CPU flame graph、GC log、thread dump、slow query 的排查順序。", "https://www.brendangregg.com/flamegraphs.html"),
    behavior: "STAR：一次你做 performance optimization 並量化成果的經驗。",
    podcast: "Cover binary search invariants, heap streaming, JVM GC, and metrics pipelines."
  },
  {
    phase: "Phase 2：DP 與資料庫",
    focus: "DP / Greedy / Spring transaction / SQL depth",
    companies: ["Google", "NVIDIA", "TSMC"],
    coding: [
      c("Google", "LeetCode #70 Climbing Stairs", "https://leetcode.com/problems/climbing-stairs/", "DP state"),
      c("Google", "LeetCode #198 House Robber", "https://leetcode.com/problems/house-robber/", "transition"),
      c("Google", "LeetCode #322 Coin Change", "https://leetcode.com/problems/coin-change/", "unbounded DP"),
      c("TSMC", "SQL50：Window Function / Dense Rank", LINKS.sql50, "資料分析筆試"),
      c("Google", "LeetCode #55 Jump Game", "https://leetcode.com/problems/jump-game/", "greedy proof")
    ],
    java: j("Spring transaction、isolation、propagation", "能解釋 read committed、repeatable read、phantom read、rollback-only、self-invocation 風險。", LINKS.springTx),
    design: d("Design an order/event consistency service", "transaction boundary、outbox pattern、idempotency key、retry、reconciliation。", LINKS.googleCloudArch),
    tsmc: t("SQL + 製造資料品質", "練習 missing data、duplicate rows、late arriving data、data validation。", LINKS.sql50),
    nvidia: n("Reliable async APIs", "把 outbox、retry、timeout、circuit breaker 對應到高吞吐服務。", "https://resilience4j.readme.io/docs"),
    behavior: "STAR：一次你避免資料不一致或修復資料問題的經驗。",
    podcast: "Explain DP states, SQL analytics, Spring transactions, and event consistency."
  },
  {
    phase: "Phase 2：訊息與快取",
    focus: "Kafka / Redis / idempotency / resilience",
    companies: ["Google", "NVIDIA", "TSMC"],
    coding: [
      c("Google", "LeetCode #560 Subarray Sum Equals K", "https://leetcode.com/problems/subarray-sum-equals-k/", "prefix sum + HashMap"),
      c("Google", "LeetCode #239 Sliding Window Maximum", "https://leetcode.com/problems/sliding-window-maximum/", "monotonic deque"),
      c("NVIDIA", "LeetCode #621 Task Scheduler", "https://leetcode.com/problems/task-scheduler/", "scheduling、cooldown"),
      c("TSMC", "HackerRank Ransom Note", "https://www.hackerrank.com/challenges/ctci-ransom-note", "HashMap counting"),
      c("Google", "LeetCode #460 LFU Cache", "https://leetcode.com/problems/lfu-cache/", "O(1) design")
    ],
    java: j("Kafka consumer、partition、offset、exactly-once 語意", "能說明 at-least-once、duplicate handling、consumer lag、rebalancing。", LINKS.kafkaDocs),
    design: d("Design a distributed cache", "cache-aside、TTL、eviction、hot key、consistency、multi-region invalidation。", LINKS.redisDocs),
    tsmc: t("製造事件流", "設計 tool event -> Kafka -> stream processing -> alert/dashboard 的路徑。", LINKS.tsmcIt),
    nvidia: n("Backpressure and queue control", "整理 bounded queue、drop policy、shed load、bulkhead、retry storm。", LINKS.googleSre),
    behavior: "STAR：一次你面對 incident、on-call 或 message backlog 的經驗。",
    podcast: "Discuss Kafka, Redis caching, idempotency, backpressure, and manufacturing event streams."
  },
  {
    phase: "Phase 2：搜尋與資料管線",
    focus: "Trie / Search / Data pipeline / Observability",
    companies: ["Google", "NVIDIA", "TSMC"],
    coding: [
      c("Google", "LeetCode #208 Implement Trie", "https://leetcode.com/problems/implement-trie-prefix-tree/", "Trie API"),
      c("Google", "LeetCode #212 Word Search II", "https://leetcode.com/problems/word-search-ii/", "Trie + DFS"),
      c("TSMC", "Python data processing：CSV 去重、grouping、rolling average", "https://pandas.pydata.org/docs/getting_started/intro_tutorials/index.html", "資料工程基本功"),
      c("Google", "LeetCode #76 Minimum Window Substring", "https://leetcode.com/problems/minimum-window-substring/", "sliding window hard"),
      c("TSMC", "SQL case：找出異常設備與連續 3 天 defect spike", LINKS.sql50, "window function + case when")
    ],
    java: j("Spring Data JPA、N+1、index、pagination", "能說明 join fetch、EntityGraph、offset vs cursor pagination、slow query。", LINKS.baeldungJpa),
    design: d("Design search autocomplete with analytics", "index build、query service、ranking signals、click logs、A/B、privacy。", LINKS.hello),
    tsmc: t("工程資料分析 pipeline", "設計 raw data -> validation -> feature table -> dashboard/model 的路徑。", LINKS.tsmcIt),
    nvidia: n("Observability for backend services", "metrics、logs、traces、SLO、alert fatigue、high cardinality。", LINKS.prometheus),
    behavior: "STAR：一次你用資料改善系統或產品決策的經驗。",
    podcast: "Teach trie/search, JPA performance, observability, and TSMC-style engineering data pipelines."
  },
  {
    phase: "Phase 3：Infra / SRE / Kubernetes",
    focus: "Kubernetes / Linux / reliability",
    companies: ["Google", "NVIDIA", "TSMC"],
    coding: [
      c("Google", "LeetCode #127 Word Ladder", "https://leetcode.com/problems/word-ladder/", "BFS shortest path"),
      c("NVIDIA", "LeetCode #146 LRU Cache 冷解 15 分鐘", "https://leetcode.com/problems/lru-cache/", "速度與正確性"),
      c("TSMC", "SQL50：Advanced joins + null handling", LINKS.sql50, "資料品質"),
      c("Google", "LeetCode #128 Longest Consecutive Sequence", "https://leetcode.com/problems/longest-consecutive-sequence/", "HashSet O(n)"),
      c("NVIDIA", "LeetCode #23 Merge K Sorted Lists", "https://leetcode.com/problems/merge-k-sorted-lists/", "heap、stream merging")
    ],
    java: j("Service reliability in Java", "thread dump、connection pool、timeout、bulkhead、health check、graceful shutdown。", LINKS.googleSre),
    design: d("Design a Kubernetes job platform", "API、controller、scheduler、worker pod、retry、quota、observability、multi-tenant isolation。", LINKS.k8sDocs),
    tsmc: t("ICSD / cloud / security 對應", "整理台積電 IT infrastructure、cloud computing、network/security 對 Java backend 的要求。", LINKS.tsmcIt),
    nvidia: n("GPU workload on Kubernetes", "理解 node labels、taints/tolerations、resource requests、autoscaling、metrics。", LINKS.nvidiaAutoscale),
    behavior: "STAR：一次你在 on-call 或高壓情境下做出正確取捨的經驗。",
    podcast: "Explain Kubernetes job platforms, reliability, Linux debugging, and GPU workload scheduling."
  },
  {
    phase: "Phase 3：AI Infra / Inference Service",
    focus: "NIM / Triton / async batching / API gateway",
    companies: ["Google", "NVIDIA", "TSMC"],
    coding: [
      c("Google", "LeetCode #84 Largest Rectangle in Histogram", "https://leetcode.com/problems/largest-rectangle-in-histogram/", "monotonic stack"),
      c("NVIDIA", "LeetCode #981 Time Based Key-Value Store", "https://leetcode.com/problems/time-based-key-value-store/", "binary search + storage"),
      c("Google", "LeetCode #297 Serialize and Deserialize Binary Tree", "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/", "API design in code"),
      c("NVIDIA", "LeetCode #355 Design Twitter", "https://leetcode.com/problems/design-twitter/", "feed merge、heap"),
      c("TSMC", "Python：用 pandas 做 anomaly rule prototype", "https://pandas.pydata.org/docs/getting_started/intro_tutorials/index.html", "rolling stats、threshold")
    ],
    java: j("gRPC、REST、timeout、client-side resiliency", "能解釋 sync vs async、deadline、retry policy、streaming、backpressure。", "https://grpc.io/docs/what-is-grpc/core-concepts/"),
    design: d("Design a high-throughput inference gateway", "request queue、async batching、model endpoint、timeout、fallback、metrics、cost controls。", LINKS.nvidiaNim),
    tsmc: t("AI/ML Engineer 與 Data Engineer 交界", "把 anomaly detection 從 notebook 變成可維運的服務：features、batch/online、monitoring。", LINKS.tsmcIt),
    nvidia: n("Triton / NIM operational model", "整理 model server、GPU utilization、KV cache、TTFT、inter-token latency。", LINKS.triton),
    behavior: "STAR：一次你把 prototype 推進到 production 的經驗。",
    podcast: "Discuss inference gateways, async batching, gRPC deadlines, Triton/NIM metrics, and production ML services."
  },
  {
    phase: "Phase 4：System Design Classic I",
    focus: "大型服務設計與 senior trade-off",
    companies: ["Google", "NVIDIA", "TSMC"],
    coding: [
      c("Google", "LeetCode #42 Trapping Rain Water", "https://leetcode.com/problems/trapping-rain-water/", "two pointers"),
      c("Google", "LeetCode #10 Regular Expression Matching", "https://leetcode.com/problems/regular-expression-matching/", "2D DP"),
      c("Google", "LeetCode #269 Alien Dictionary", "https://leetcode.com/problems/alien-dictionary/", "topological sort hard"),
      c("NVIDIA", "LeetCode #432 All O(1) Data Structure", "https://leetcode.com/problems/all-oone-data-structure/", "O(1) data structure"),
      c("Google", "LeetCode #4 Median of Two Sorted Arrays", "https://leetcode.com/problems/median-of-two-sorted-arrays/", "binary search hard")
    ],
    java: j("Concurrency：synchronized、Lock、Atomic、volatile", "能說明 happens-before、visibility、race condition、deadlock、lock granularity。", LINKS.baeldungLocks),
    design: d("Design YouTube", "upload、transcode、metadata、search、streaming、CDN、recommendation boundary、abuse control。", "https://interviewing.io/mocks/google-system-design-design-youtube"),
    tsmc: t("Design a fab dashboard", "資料 ingestion、aggregation、alert、permission、high availability、audit trail。", LINKS.tsmcIt),
    nvidia: n("Senior trade-off framing", "每個 design 回答都要講 scale、bottleneck、failure mode、operational cost。", LINKS.hello),
    behavior: "STAR：一次你主導設計 review 並影響團隊方向的經驗。",
    podcast: "Run a senior-level mock discussion about YouTube design, Java concurrency, and operational trade-offs."
  },
  {
    phase: "Phase 4：System Design Classic II",
    focus: "Collaboration / data products / manufacturing systems",
    companies: ["Google", "NVIDIA", "TSMC"],
    coding: [
      c("Google", "LeetCode #51 N-Queens", "https://leetcode.com/problems/n-queens/", "backtracking"),
      c("Google", "LeetCode #312 Burst Balloons", "https://leetcode.com/problems/burst-balloons/", "interval DP"),
      c("TSMC", "SQL case：良率趨勢與設備異常 correlation", LINKS.sql50, "analysis query"),
      c("Google", "LeetCode #224 Basic Calculator", "https://leetcode.com/problems/basic-calculator/", "parser / stack"),
      c("TSMC", "Python case：產線事件資料 ETL + validation", "https://pandas.pydata.org/docs/getting_started/intro_tutorials/index.html", "ETL reliability")
    ],
    java: j("Testing strategy：unit、integration、contract、load test", "能說明如何測試 transaction、message consumer、batch job、external API。", "https://martinfowler.com/articles/practical-test-pyramid.html"),
    design: d("Design Google Docs collaborative editing", "document model、conflict resolution、OT/CRDT concept、presence、history、permission。", LINKS.hello),
    tsmc: t("Design manufacturing anomaly detection platform", "資料來源、feature、model serving、alert workflow、human feedback、false positive controls。", LINKS.tsmcIt),
    nvidia: n("Data-intensive systems", "把 storage、stream、batch、online serving 的邊界講清楚。", "https://dataintensive.net/"),
    behavior: "STAR：一次你和資料/製程/產品角色跨部門合作的經驗。",
    podcast: "Explain collaborative editing, manufacturing anomaly detection, testing strategy, and data-intensive trade-offs."
  },
  {
    phase: "Phase 5：Google Mock Loop",
    focus: "Coding speed / system design conversation / Googleyness",
    companies: ["Google", "NVIDIA", "TSMC"],
    coding: [
      c("Google", "Blind timed：Graph medium 35 分鐘", "https://leetcode.com/problemset/?difficulty=MEDIUM&topicSlugs=graph", "全英文讀題與筆記"),
      c("Google", "Blind timed：Sliding window medium 35 分鐘", "https://leetcode.com/problemset/?difficulty=MEDIUM&topicSlugs=sliding-window", "clarify -> solve -> optimize"),
      c("Google", "Blind timed：DP medium 35 分鐘", "https://leetcode.com/problemset/?difficulty=MEDIUM&topicSlugs=dynamic-programming", "state definition"),
      c("Google", "Blind timed：Heap / PriorityQueue 35 分鐘", "https://leetcode.com/problemset/?topicSlugs=heap-priority-queue", "Java API 熟練"),
      c("Google", "Redo hardest wrong answer", "https://leetcode.com/submissions/", "冷解錯題")
    ],
    java: j("Google-style code quality", "練習乾淨命名、test cases、edge cases、complexity，像在 Google Doc 裡寫 code。", LINKS.googleGuide),
    design: d("Design personalized news feed", "fanout、ranking、privacy、freshness、cache、abuse、experiments。", LINKS.interviewing),
    tsmc: t("不排 TSMC 新內容", "本週主攻 Google，但週五仍用 SQL warm-up 保持手感。", LINKS.sql50),
    nvidia: n("不排 NVIDIA 新內容", "本週主攻 Google，但保留 performance vocabulary。", LINKS.nvidiaNim),
    behavior: "Googleyness：ambiguity、intellectual humility、leadership without authority。",
    podcast: "Create a Google mock interview episode: coding explanation, news feed system design, and behavioral answers."
  },
  {
    phase: "Phase 5：NVIDIA Mock Loop",
    focus: "AI infra / Kubernetes / performance / distributed systems",
    companies: ["Google", "NVIDIA", "TSMC"],
    coding: [
      c("NVIDIA", "Timed：Merge K Sorted Lists", "https://leetcode.com/problems/merge-k-sorted-lists/", "heap + throughput story"),
      c("NVIDIA", "Timed：Find Median from Data Stream", "https://leetcode.com/problems/find-median-from-data-stream/", "streaming data"),
      c("NVIDIA", "Timed：Task Scheduler", "https://leetcode.com/problems/task-scheduler/", "resource scheduling"),
      c("NVIDIA", "Timed：LRU Cache", "https://leetcode.com/problems/lru-cache/", "cache internals"),
      c("NVIDIA", "Timed：Top K Frequent", "https://leetcode.com/problems/top-k-frequent-elements/", "heap/bucket trade-off")
    ],
    java: j("High-throughput Java service", "thread pool、Netty/async concept、connection pool、GC、metrics、backpressure。", LINKS.googleSre),
    design: d("Design GPU inference autoscaling", "traffic, queue, batching, GPU cache usage, Prometheus metrics, HPA/custom metrics, degradation。", LINKS.nvidiaAutoscale),
    tsmc: t("TSMC parallel：GPU/inference vs manufacturing analytics", "比較兩者的 pipeline、latency、observability，準備跨公司轉換說法。", LINKS.tsmcIt),
    nvidia: n("NIM/Triton mock", "聽懂並整理 NIM, Triton, Kubernetes, TTFT, inter-token latency, GPU utilization。", LINKS.nvidiaNim),
    behavior: "STAR：一次你優化效能或資源成本的經驗。",
    podcast: "Create an NVIDIA-style senior backend mock about inference autoscaling, Kubernetes, and Java performance."
  },
  {
    phase: "Phase 5：TSMC IT / Data Mock Loop",
    focus: "製造業 IT / SQL / Python / cross-functional",
    companies: ["Google", "NVIDIA", "TSMC"],
    coding: [
      c("TSMC", "SQL timed：Top SQL 50 任選 5 題", LINKS.sql50, "45 分鐘完成"),
      c("TSMC", "Python timed：CSV ETL + anomaly rule", "https://pandas.pydata.org/docs/getting_started/intro_tutorials/index.html", "資料清理與驗證"),
      c("TSMC", "HackerRank：Minimum Swaps 2", "https://www.hackerrank.com/challenges/minimum-swaps-2", "上機考練習"),
      c("TSMC", "Calculator / parser redo", "https://leetcode.com/problems/basic-calculator-ii/", "OOP + edge cases"),
      c("TSMC", "SQL case：設備 downtime 報表", LINKS.sql50, "join、group by、window")
    ],
    java: j("Enterprise backend：Spring Batch、scheduler、transaction、audit", "能說明資料批次、重跑、rollback、audit log、operator workflow。", "https://spring.io/projects/spring-batch"),
    design: d("Design a manufacturing data platform", "MES/tool events、data lake/warehouse、validation、feature store、dashboard、access control。", LINKS.tsmcIt),
    tsmc: t("TSMC manager interview prep", "準備專案細節、抗壓、on-call、跨部門溝通、論文/研究/數據結果。", LINKS.tsmcIt),
    nvidia: n("保留 infra 語彙", "把 observability、reliability、autoscaling 用在製造資料平台回答中。", LINKS.googleSre),
    behavior: "STAR：一次你與非軟體背景 stakeholder 溝通需求的經驗。",
    podcast: "Create a TSMC IT mock episode about manufacturing data, SQL/Python, enterprise systems, and cross-functional communication."
  },
  {
    phase: "Phase 6：Final Onsite Simulation",
    focus: "正式面試節奏 / 弱點清零 / 反問面試官",
    companies: ["Google", "NVIDIA", "TSMC"],
    coding: [
      c("Google", "Onsite coding mock 1：陌生 Medium/Hard", "https://leetcode.com/problemset/", "45 分鐘"),
      c("NVIDIA", "Onsite coding mock 2：heap/stream/cache", "https://leetcode.com/problemset/?topicSlugs=heap-priority-queue", "45 分鐘"),
      c("TSMC", "Onsite data mock：SQL + Python", LINKS.sql50, "60 分鐘"),
      c("Google", "System design mock：YouTube / Docs / Scheduler 三選一", LINKS.interviewing, "45 分鐘"),
      c("All", "錯題最終清單清零", "https://leetcode.com/submissions/", "只看自己錯過的")
    ],
    java: j("Final Java backend interview packet", "整理你會被問的 20 題：JVM、GC、thread pool、Spring tx、Kafka、Redis、SQL、observability；每題準備 30 秒與 2 分鐘版。", LINKS.googleSre),
    design: d("Final architecture review", "用同一個框架回答：requirements、non-goals、APIs、data model、scaling、failure、metrics、trade-offs。", LINKS.hello),
    tsmc: t("反問台積電面試官", "準備 5 題：team ownership、製造資料挑戰、系統穩定度、跨廠部署、成長路徑。", LINKS.tsmcIt),
    nvidia: n("反問 NVIDIA 面試官", "準備 5 題：AI infra scale、GPU utilization metrics、Kubernetes stack、on-call、team roadmap。", LINKS.nvidiaNim),
    behavior: "整理最後一版英文自我介紹文字、專案深挖筆記、STAR 六故事、反問面試官。",
    podcast: "Create a final confidence episode that rehearses your opening pitch, project stories, weak-spot repairs, and final technical summaries."
  }
];

const PRIORITIES = [
  {
    company: "Google",
    cls: "google",
    bullets: [
      "Coding：HashMap、graph、topological sort、binary search、heap、DP、trie、sliding window。",
      "System design：YouTube、Google Docs、autocomplete、distributed scheduler、rate limiter、cache。",
      "Behavioral：ambiguity、leadership without authority、conflict、project impact、feedback humility。"
    ],
    links: [{label:"Google senior SWE", url:LINKS.googleSenior}, {label:"Virtual interview guide", url:LINKS.googleGuide}]
  },
  {
    company: "NVIDIA",
    cls: "nvidia",
    bullets: [
      "Distributed systems：Kubernetes、Linux debugging、message broker、resource scheduling、performance。",
      "AI infra：NIM、Triton、async batching、autoscaling、GPU inference metrics。",
      "Coding：heap、stream、cache、scheduler 類題，重點是效能與資源取捨。"
    ],
    links: [{label:"NVIDIA hiring", url:LINKS.nvidiaHire}, {label:"NIM", url:LINKS.nvidiaNim}]
  },
  {
    company: "TSMC IT / Data",
    cls: "tsmc",
    bullets: [
      "Coding：HackerRank 類上機、Java OOP/design pattern、calculator/parser 類題。",
      "Data：SQL50、Python ETL、資料品質、異常偵測、製造資料 pipeline。",
      "Behavioral：抗壓、跨部門溝通、on-call、專案細節、論文/過往研究深挖。"
    ],
    links: [{label:"TSMC IT Careers", url:LINKS.tsmcIt}, {label:"SQL50", url:LINKS.sql50}]
  }
];

const SOURCES = [
  ["TSMC IT Careers", "官方 IT 團隊、產品、職缺方向：TSID、ICSD、BSID、AAID、Software、DevOps、SRE、AI/ML、Data Engineer。", LINKS.tsmcIt],
  ["NVIDIA How We Hire", "官方招募流程：多輪 30-60 分鐘面試，技術職可能有 coding exercise。", LINKS.nvidiaHire],
  ["NVIDIA NIM", "NVIDIA inference microservices、Kubernetes、low latency/high throughput、observability。", LINKS.nvidiaNim],
  ["NIM Kubernetes Autoscaling", "GPU cache usage、Prometheus、Grafana、custom metrics、autoscaling。", LINKS.nvidiaAutoscale],
  ["Google Senior SWE example", "Google senior SWE 常見職缺訊號：5 年以上、DSA、system design、API、跨團隊合作。", LINKS.googleSenior],
  ["Google Virtual Interview Guide", "面試工具、Google Meet、AI 禁用、技術問題保密與作答規範。", LINKS.googleGuide],
  ["Google Cloud Architecture Center", "雲端架構、可靠性、安全、成本、性能、部署拓撲。", LINKS.googleCloudArch],
  ["NotebookLM Audio Overview", "Google 官方說明：可根據來源生成可下載的英文 audio discussion，但仍需自行查核。", LINKS.notebookAudio]
];

const LISTENING_RESOURCES = [
  {
    title: "Coding / DSA",
    cls: "google",
    bullets: [
      "NeetCode：先聽解題 pattern，再自己用 Java 寫。",
      "重點：HashMap、sliding window、two pointers、graph、DP。",
      "筆記只抓 approach、edge case、complexity。"
    ],
    links: [{label:"NeetCode Playlists", url:"https://www.youtube.com/@NeetCode/playlists"}, {label:"NeetCode Practice", url:"https://neetcode.io/practice"}]
  },
  {
    title: "System Design",
    cls: "google",
    bullets: [
      "ByteByteGo / Hello Interview：聽大型系統怎麼拆。",
      "重點：requirements、API、data model、bottleneck、trade-off。",
      "不要追求一次全懂，先能畫出主流程。"
    ],
    links: [{label:"ByteByteGo", url:"https://www.youtube.com/@ByteByteGo/videos"}, {label:"Hello Interview", url:LINKS.hello}]
  },
  {
    title: "NVIDIA / Infra",
    cls: "nvidia",
    bullets: [
      "NVIDIA Developer：聽 NIM、Triton、Kubernetes、GPU inference。",
      "重點：latency、throughput、batching、autoscaling、metrics。",
      "聽不懂的詞直接放進弱點清單。"
    ],
    links: [{label:"NVIDIA Developer", url:"https://www.youtube.com/@NVIDIADeveloper/videos"}, {label:"NVIDIA NIM", url:LINKS.nvidiaNim}]
  },
  {
    title: "TSMC IT / Data",
    cls: "tsmc",
    bullets: [
      "TSMC IT 官方頁 + NotebookLM：把文字資料轉成可聽教材。",
      "重點：smart manufacturing、engineering data analysis、enterprise systems。",
      "搭配 SQL50 / Python ETL 任務做短筆記。"
    ],
    links: [{label:"TSMC IT Careers", url:LINKS.tsmcIt}, {label:"NotebookLM", url:LINKS.notebook}]
  },
  {
    title: "Java Backend",
    cls: "java",
    bullets: [
      "Baeldung / Spring Docs：用來補 JVM、concurrency、Spring transaction。",
      "重點：先看懂概念，再回到題目或專案場景。",
      "每次只整理 5 bullets，不要抄整篇。"
    ],
    links: [{label:"Baeldung", url:"https://www.baeldung.com/"}, {label:"Spring Transaction", url:LINKS.springTx}]
  },
  {
    title: "Generated Podcast",
    cls: "english",
    bullets: [
      "NotebookLM / Gemini：用本週筆記生成 8-10 分鐘英文聽力教材。",
      "目的：聽懂技術詞和講解順序，不練自我口說。",
      "每週日只摘 8 句你真的聽懂的句子。"
    ],
    links: [{label:"NotebookLM", url:LINKS.notebook}, {label:"Audio Overview", url:LINKS.notebookAudio}]
  }
];

const SCORE_FIELDS = [
  ["coding", "Coding 完成題數", 5],
  ["redo", "錯題冷解題數", 2],
  ["english", "技術聽力完成次數", 5],
  ["design", "System design 練習", 2],
  ["java", "Java 主題熟練度 1-5", 4],
  ["data", "SQL/Python 題數", 2]
];

const NOTE_TEMPLATE = `這個任務的意思：建立你每天固定填的面試日誌。不是寫作文，是讓你每天留下可複習的證據。

每天照這個格式填 5-10 分鐘：

Date:
Company focus:
Coding problem:
My approach:
Bug / stuck point:
Time complexity:
Space complexity:
English sentence I practiced:
One thing to redo tomorrow:

範例：
Date: 2026-04-22
Company focus: Google
Coding problem: Two Sum
My approach: Use a HashMap to store value -> index while scanning once.
Bug / stuck point: I forgot to explain why checking before inserting avoids using the same element twice.
Time complexity: O(n)
Space complexity: O(n)
English sentence I practiced: I would clarify whether the array can contain duplicates before choosing the implementation.
One thing to redo tomorrow: Explain 3Sum with two pointers in English.`;

const DEMO_SCRIPTS = {
  "聽講解 baseline：Two Sum / 3Sum": `聽完講解後，筆記可以長這樣：

Problem: Two Sum / 3Sum
Pattern: HashMap for Two Sum; sorting + two pointers for 3Sum.
Why this works: Two Sum needs fast complement lookup. 3Sum needs duplicate control and a systematic search after sorting.
Edge case: Same element cannot be used twice; 3Sum needs to skip duplicate values.
Complexity: Two Sum O(n), 3Sum O(n^2).
Useful English sentence: "I can reduce the lookup cost by storing previously seen values in a hash map."

你今天只要聽懂這種拆法，不需要自己錄音。`,

  "建立面試筆記格式": NOTE_TEMPLATE,

  "聽別人怎麼講專案與設計": `聽 system design / mock interview 時，照這個格式抓重點：

1. 開頭有沒有先問 requirements？
2. 對方怎麼切 API、資料模型、read path、write path？
3. 哪個 trade-off 講得最清楚？
4. 哪個 failure mode 是你原本沒想到的？
5. 摘一句你可以學的英文：
   "The main trade-off here is between consistency and availability."

你不用模仿語氣，先把架構思路聽懂。`,

  "聽懂 TSMC IT / 製造資料語彙": `今天聽 NotebookLM / 讀 TSMC IT 頁面時，抓這些詞：

Smart manufacturing: 智慧製造
Manufacturing data: 製造資料
Engineering data analysis: 工程資料分析
Reliability: 可靠性
Cross-functional collaboration: 跨部門合作
Enterprise systems: 企業系統
Cloud infrastructure: 雲端基礎建設
Data pipeline: 資料管線

筆記目標：你先能看懂、聽懂這些詞出現在職缺或介紹裡代表什麼。`,

  "聽懂 latency vs throughput": `聽 NVIDIA / infra 講解時，先抓這些概念：

Latency: 單一請求花多久完成。
Throughput: 單位時間能處理多少工作。
Batching: 一次處理多個請求，通常提高 throughput，但可能增加等待時間。
Queue depth: 排隊中的請求數，過高通常代表系統快塞住。
Timeout: 等太久就停止，避免資源被拖住。
GPU utilization: GPU 實際被使用的比例。

交付筆記範例：
"Batching improves throughput, but it can increase latency because requests may wait in a queue."`,

  "正式週聽力筆記模板": `下週每次聽講解都照這樣填：

Video / source:
Topic:
Problem:
Approach:
Data structure or system component:
Why this approach works:
Trade-off:
Complexity or bottleneck:
One useful English sentence:
One thing I still do not understand:

你只要穩定聽、穩定寫短筆記，先不用自己講。`
};

const WEEK1_ENGLISH_DEMOS = {
  1: `聽完 Group Anagrams / HashMap 講解後，筆記可以長這樣：

Problem: Group Anagrams
Pattern: HashMap grouping
Approach: Convert each word into a normalized key, then group original words by that key.
Trade-off: Sorting the word is simpler; counting characters is faster for lowercase English letters.
Complexity: Sorting approach is O(n * k log k).
Useful sentence: "The normalized key lets us group equivalent strings together."
Still unclear: How to implement the character-count key cleanly in Java.`,

  2: `聽完 Rate Limiter 講解後，筆記可以長這樣：

Problem: Limit abusive or excessive requests.
Components: API gateway, Redis, token bucket or sliding window.
Trade-off: Fixed window is simple but inaccurate near boundaries; sliding window is more accurate but more expensive.
Failure mode: Redis latency or outage can affect all requests.
Useful sentence: "The main trade-off is accuracy versus operational simplicity."
Still unclear: When should the system fail open versus fail closed?`,

  3: `聽完 NVIDIA / performance 講解後，筆記可以長這樣：

Topic: Inference API performance
Important metrics: p95 latency, p99 latency, throughput, queue depth, GPU utilization.
Trade-off: Batching improves throughput, but may increase latency.
Failure mode: Retry amplification can make overload worse.
Useful sentence: "We should define the SLO before optimizing the system."
Still unclear: How custom metrics drive autoscaling in Kubernetes.`,

  4: `聽完 TSMC IT / manufacturing data 講解後，筆記可以長這樣：

Scenario: Equipment events to engineering dashboard.
Pipeline: Ingestion -> validation -> storage -> aggregation -> dashboard / alert.
Key concern: Data correctness matters because engineers may make decisions based on this data.
Useful terms: manufacturing data, yield analysis, anomaly detection, cross-functional collaboration.
Useful sentence: "The pipeline should be idempotent because the same event may arrive more than once."
Still unclear: Which parts are batch processing and which parts need near-real-time updates?`,

  5: `聽完 behavioral / senior interview mock 後，筆記可以長這樣：

Question type: Ambiguous requirement / leadership
Structure: Situation -> constraint -> decision -> trade-off -> result.
Good signal: The speaker quantified impact and explained why the trade-off was reasonable.
Useful sentence: "I aligned the team by separating must-have requirements from nice-to-have features."
Still unclear: How much technical detail should be included in a behavioral answer?`
};

const SETUP_START = new Date(2026, 3, 22);
const FORMAL_START = new Date(2026, 3, 27);
const FORMAL_END = new Date(2026, 7, 16);
const MS_DAY = 24 * 60 * 60 * 1000;
const DAY_NAMES = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];
const SOURCE_DATE = "2026-04-22";

window.PREP_DATA = {
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
};
})();
