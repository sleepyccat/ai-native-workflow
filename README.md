# 🧠 AI Skills 仓库

> 一套通用的 AI Skills，覆盖从需求分析到代码走查的全流程自动化。默认配置面向 React + Antd 5 前端开发，通过替换 `references/` 配置即可适配任意技术栈。可选集成飞书云文档。
>
> 适用于任何支持 Skill/Prompt 机制的 AI IDE（Kiro、Claude Code、Cursor 等），只需将 Skill 文件放入对应 IDE 的配置目录即可。
>
> **飞书是可选的**：不使用飞书的用户无需任何飞书配置，所有 skill 默认在对话中输出结果。如需写入飞书文档，安装 `feishu-doc` skill 并配置凭证即可。

**路径变量说明**：文档中的 `{SKILLS_DIR}` 代表当前 skills 目录的实际路径，不同 IDE 对应不同位置：

| IDE | `{SKILLS_DIR}` 实际路径 |
|-----|------------------------|
| Kiro | `.kiro/skills/`（工作区级）或 `~/.kiro/skills/`（用户级） |
| Claude Code | `~/.claude/skills/` |
| Cursor | `.cursor/rules/` |

---

## 📦 Skills 一览

| Skill | 触发词 | 简介 |
|-------|--------|------|
| [daily-workflow](./daily-workflow/) | `开启 dw`、`继续 dw`、`记录`、`写周报` | 开发七步全流程自动化 + 快速记录 + 周报/总结 |
| [requirement-analysis](./requirement-analysis/) | `需求分析`、`审PRD`、`看看这个需求` | PRD 质量评审（含代码对照分析），支持卡点机制 |
| [development-design](./development-design/) | `设计文档`、`写设计`、`生成设计` | 设计文档生成（交互流程图、数据流图、修改文件表格） |
| [coding-standards](./coding-standards/) | `编码规范`、`代码规范`、`怎么写` | 编码规范查询与代码风格检查 |
| [cr-general](./cr-general/) | `代码走查`、`CR`、`code review` | 代码走查，6 大维度 + 专项检查 |
| [cr-by-mr](./cr-by-mr/) | `CR MR xxx`、`走查MR xxx`、`review MR xxx` | 根据 MR ID 定位合并提交，提取与 master 的 diff 执行代码走查 |
| [unit-testing](./unit-testing/) | `单元测试`、`写单测`、`跑测试` | 单元测试自动生成与执行，失败用例自动修复 |
| [test-submission](./test-submission/) | `提测`、`写提测文档` | 提测文档生成，自动填充上下文字段 |
| [feishu-doc](./feishu-doc/) | `写飞书文档`、`创建飞书文档`、`刷新飞书token` | 飞书文档操作（写作/编辑规范 + 配置管理 + Token 刷新），可选，其他 skill 的飞书输出通道 |
| [cross-platform-export](./cross-platform-export/) | `导出 skill`、`适配 [平台]` | 将 Skill 导出为 Cursor/Kiro/Windsurf/Trae 格式 |

---

## 🔗 Skill 间协作

```
daily-workflow 流程中自动引用：
  第一步（需求分析）  → requirement-analysis skill
  第二步（设计文档）  → development-design skill
  第三步（代码开发）  → coding-standards skill
  第五步（AI CR）    → cr-general skill
  按 MR 走查时       → cr-by-mr skill
  第六步（单元测试）  → unit-testing skill
  第七步（提测）     → test-submission skill
  飞书输出时        → feishu-doc skill
  Token 过期时       → feishu-doc skill（内置 Token 刷新）
  跨平台导出时       → cross-platform-export skill
```

十个 Skill 均可独立使用，也可在 daily-workflow 流程中自动串联。

---

## 🛠️ 环境依赖

- 支持 Skill/Prompt 机制的 AI IDE（Claude Code、Cursor 等）
- Git（daily-workflow 会自动创建和管理分支）
- **飞书 MCP**（可选，用于自动创建/更新飞书云文档）

如需使用飞书功能，请安装 `feishu-doc` skill 并配置凭证，详见 [feishu-doc 使用说明](./feishu-doc/README.md)。

---

## 🚀 快速开始

### 接入方式

将本仓库的 Skill 文件复制到你所用 IDE 的 Skill 配置目录下：

| IDE | 配置目录 |
|-----|----------|
| Kiro | `.kiro/skills/` |
| Claude Code | `.claude/skills/` 或项目根 `CLAUDE.md` |
| Cursor | `.cursor/rules/` |
| Windsurf | `.windsurf/rules/` |
| 其他 | 参考各 IDE 文档 |

### 配置私人凭证

复制模板并填写你的飞书应用凭证和目录地址：

```bash
cp {SKILLS_DIR}/config.example.json {SKILLS_DIR}/config.json
```

编辑 `config.json`，填写以下字段：

| 字段 | 说明 |
|------|------|
| `feishu.app_id` | 飞书企业自建应用的 App ID |
| `feishu.app_secret` | 飞书企业自建应用的 App Secret |
| `feishu.bot_webhook_url` | 飞书机器人 Webhook 地址（用于流程通知） |
| `feishu.root_wiki_url` | 飞书 AI-docs 根目录的 Wiki 链接 |

> UAT 写入路径无需配置——刷新脚本自动检测当前平台并写入对应位置（Kiro: `~/.kiro/settings/mcp.json`，Claude Code: `~/.claude.json`）。仅 Cursor 等非标准平台需要手动添加 `uat_config_path` 字段覆盖。

> `config.json` 包含私人凭证，不应分享。分享时只需提供 `config.example.json`（占位符模板）。

### 使用示例

```
# 启动一个新需求的完整开发流程
开启 dw https://xxx.feishu.cn/wiki/xxx

# 单独评审一个 PRD
审PRD https://xxx.feishu.cn/wiki/xxx

# 查询编码规范
Form 怎么写

# 单独对某个模块做代码走查
代码走查 src/view/organization/**/*.tsx

# 快速记录零散工作
记录：修了个线上优惠券展示 bug

# 生成周报
写周报
```

---

## 📁 目录结构

```
skills/
├── README.md                         # 本文件
├── config.json                       # 私人凭证（不入库，分享时使用 config.example.json）
├── config.example.json               # 凭证模板（占位符，分享用）
├── requirement-analysis/             # 需求分析 Skill
│   ├── SKILL.md                      # 通用流程定义
│   ├── references/                    # 可替换的引导配置
│   │   └── frontend-concerns.md      # 前端需求关注点
│   ├── LEARNING.md                   # 学习规则与反馈日志
│   └── README.md
├── development-design/               # 设计文档 Skill
│   ├── SKILL.md                      # 通用流程定义
│   ├── references/                    # 可替换的引导配置
│   │   └── design-template.md        # React + Antd 5 模板配置
│   ├── LEARNING.md                   # 学习规则与反馈日志
│   └── README.md
├── coding-standards/                 # 编码规范 Skill
│   ├── SKILL.md                      # 通用流程定义
│   ├── references/                    # 可替换的引导配置
│   │   └── tech-stack.md             # React + Antd 5 技术栈配置
│   ├── LEARNING.md                   # 学习规则与反馈日志
│   └── README.md
├── cr-general/                       # 代码走查 Skill
│   ├── SKILL.md                      # 通用流程定义
│   ├── references/                    # 可替换的引导配置
│   │   └── specialized-checks.md     # 专项检查清单
│   ├── LEARNING.md                   # 学习规则与反馈日志
│   ├── README.md
│   └── REPORT.md
├── cr-by-mr/                         # 按 MR ID 代码走查 Skill
│   ├── SKILL.md                      # 流程定义（定位合并提交→提取 diff→走查）
│   ├── LEARNING.md                   # 学习规则与反馈日志
│   └── README.md
├── unit-testing/                     # 单元测试 Skill
│   ├── SKILL.md                      # 通用流程定义
│   ├── references/                    # 可替换的引导配置
│   │   └── frontend-testing.md       # 前端测试框架配置
│   ├── LEARNING.md                   # 学习规则与反馈日志
│   └── README.md
├── test-submission/                  # 提测文档 Skill
│   ├── SKILL.md                      # 通用流程定义
│   ├── references/                    # 可替换的引导配置
│   │   └── frontend-submission.md    # 前端提测文档模板
│   ├── LEARNING.md                   # 学习规则与反馈日志
│   ├── output/                       # 输出目录
│   └── README.md
├── feishu-doc/                       # 飞书文档操作 Skill（可选）
│   ├── SKILL.md
│   ├── references/                    # 可替换的引导配置
│   │   └── report-style.md                  # 文档输出风格偏好
│   ├── scripts/                       # Token 刷新脚本
│   │   └── feishu_uat_refresh.js
│   ├── LEARNING.md                   # 学习规则与反馈日志
│   └── README.md
├── cross-platform-export/            # 跨平台导出 Skill
│   └── SKILL.md
└── daily-workflow/                   # 开发工作流 Skill
    ├── SKILL.md                      # 精简流程骨架，引用 references
    ├── README.md
    ├── LEARNING.md                   # 学习规则与反馈日志
    ├── REPORT.md
    ├── output/                       # 输出目录（按项目隔离）
    │   └── .dw-state.template.json   # 本地状态模板
    └── references/                   # 规范文档集
        ├── code-review.md
        ├── general-rules.md
        ├── weekly-report.md
        ├── periodic-summary.md
        ├── index-strategy.md         # 结构化索引策略
        ├── feedback-loop.md          # RL 训练闭环
        ├── quick-log.md              # 快速记录规范
        ├── handover.md               # 需求移交规范
        ├── cross-platform-export.md  # 跨平台导出规范
        ├── bot-notification.md       # 飞书机器人通知规范
        └── modules/                  # 模块专项规范（可选）
```

---

## 🎯 三层架构

每个 Skill 由三层文件组成：

| 层 | 文件 | 管理者 | 说明 |
|----|------|--------|------|
| 通用规则 | `SKILL.md` | AI 维护 | 通用流程定义，不包含技术栈特定内容 |
| 参考配置 | `references/` | **用户编辑** | 技术栈/团队/个人偏好，换团队时替换即可 |
| 学习反馈 | `LEARNING.md` | AI 管理 | 基于用户反馈自动学习，记录偏好和沉淀规范 |

**核心设计**：SKILL.md 是通用的，references/ 是可替换的。默认 references 面向 React + Antd 5 前端，换成 Vue/Angular/后端项目只需替换对应参考配置文件。

### Spec 质量标准

一个好的 Spec 必须具备以下特质：

| 特质 | 含义 | 检验方式 |
|------|------|----------|
| **清晰 & 明确** | 无歧义，每条规则只有一种理解 | 换一个人/AI 读，理解一致 |
| **可执行** | AI 读了知道做什么、按什么顺序、遇到什么情况怎么处理，不是"应该注意" | 能直接转化为操作步骤 |
| **可回溯** | 规则的来源可追踪——为什么存在、谁加的、什么场景触发的 | 每条规则能回答"这条从哪来的" |
| **可学习** | 规则可以基于反馈进化，不是一成不变的 | 有反馈机制和沉淀路径 |
| **可验证** | 能检查规则是否被执行、执行是否正确 | 有产出物可校验 |
| **无冲突** | 规则之间不矛盾，跨文件一致 | 变更一处时能确认关联文件同步 |

**架构性文件名不是硬编码**：`references/` 下的文件名（如 `tech-stack.md`、`general-rules.md`）是架构定义，换技术栈换内容不换名字。属于可变值的才需要抽离到配置。

### 适配新技术栈 / 新团队

本仓库默认面向 React + Antd 5 前端开发。换团队或换技术栈时，**只需替换 `references/` 下的技术栈相关文件**，无需修改任何 SKILL.md。

#### 需要替换的文件

| Skill | 文件 | 默认内容 | 替换为什么 |
|-------|------|---------|-----------|
| coding-standards | `references/tech-stack.md` | React + Antd 5 编码规范 | 你团队的技术栈规范（Vue/Angular/后端/移动端…） |
| cr-general | `references/specialized-checks.md` | 前端专项检查（逻辑/接口/性能/React） | 你技术栈的专项检查项 |
| unit-testing | `references/frontend-testing.md` | Jest + @testing-library/react 配置 | 你的测试框架和策略（Vitest/JUnit/XCTest…） |
| requirement-analysis | `references/frontend-concerns.md` | 前端需求关注点（交互/缓存/多端/加载） | 你角色的需求关注点 |
| development-design | `references/design-template.md` | React + Antd 5 设计模板（组件流程图/文件结构） | 你技术栈的设计文档模板 |
| test-submission | `references/frontend-submission.md` | 前端提测文档字段 | 你团队的提测文档模板 |

替换时保持文件名不变（架构约定），只换内容。

#### 不需要动的文件

- **SKILL.md** — 通用流程定义，与技术栈无关
- **LEARNING.md** — AI 自动管理，随使用自动学习你的偏好
- **daily-workflow/references/** — 流程和文档模板（周报、总结、移交等），与技术栈无关

#### 可按需移除的 Skill

不用的 skill 直接删除对应目录即可，不影响其他 skill 运行：

| Skill | 不需要时 |
|-------|---------|
| feishu-doc | 不使用飞书云文档时删除，daily-workflow 自动降级为本地存储 |
| test-submission | 不需要生成提测文档时删除，daily-workflow 第七步会跳过 |

#### 适配示例

| 场景 | 需要做的 |
|------|---------|
| React 前端 → Vue 前端 | 替换 6 个 references 文件，内容改为 Vue 生态 |
| 前端 → Java 后端 | 替换 6 个 references 文件，关注点从交互/渲染改为接口/数据/并发；提测文档字段替换为后端项 |
| 前端 → Android/iOS | 替换 6 个 references 文件，测试框架改为 JUnit/XCTest，需求关注点改为设备/性能/离线 |
| 同技术栈换团队 | 只需调整 references 中的团队偏好（命名规范、提测字段、周报格式等） |

> **提示**：不用一开始就替换全部文件。先用默认配置跑一轮，AI 会在使用中通过 LEARNING.md 学习你的偏好，积累足够反馈后逐步沉淀为你团队的专属配置。

---

## 🧠 自我学习

每个功能型 Skill 都具备独立的学习和反馈机制，各自维护 `LEARNING.md` 文件：

| Skill | 学习文件 | 学习内容 |
|-------|---------|---------|
| daily-workflow | `LEARNING.md` + `references/feedback-loop.md` | 流程级反馈、用户偏好、步骤优化 |
| requirement-analysis | `LEARNING.md` | 检查维度调整、问题模式发现 |
| development-design | `LEARNING.md` | 文档结构偏好、组件拆分策略 |
| coding-standards | `LEARNING.md` | 规范条目增改、编码偏好 |
| cr-general | `LEARNING.md` | 检查项增减、误报/漏报模式、定级规则 |
| unit-testing | `LEARNING.md` | 测试框架配置、Mock 策略、覆盖维度调整 |
| feishu-doc | `LEARNING.md` | 飞书格式规则、编辑操作偏好 |

统一策略：同类修改 ≥2 次建议更新规范，驳回 ≥1 次下次规避，确认 ≥3 次固化最佳实践。所有学习记录可追溯。
