# 🚀 开发工作流 — 使用说明

> 一个开发自动化 Skill，用 AI 自动化开发全流程：需求分析 → 设计文档 → 代码开发 → 接口联调 → AI CR → 单元测试 → 提测。同时支持日报、周报、季度/年度总结的自动生成。

支持混合存储：日报和进度跟踪始终使用本地文件（`daily-log.md` + `dw-state.json`）；需要共享的文档（需求分析、设计文档、周报、总结等）在配置飞书 MCP 后自动创建在飞书 `AI-docs/` 目录，未配置飞书时使用本地 `dw-docs/` + `dw-index.md` 替代。

---

## 📦 前置准备

> **飞书是可选的**：以下步骤仅在使用飞书后端时需要。不使用飞书的用户可直接跳到"使用方式"，所有功能默认使用本地存储。

如需使用飞书后端，安装 `feishu-doc` skill 并按其 README 完成飞书应用配置、MCP 配置和首次授权即可。详细步骤见 [feishu-doc 使用说明](../feishu-doc/README.md)。

### 飞书目录准备（可选）

在飞书知识库中创建根目录 `AI-docs/`，子目录会在流程中自动创建。

### 5. 配置私人凭证（可选）

所有需要私人凭证的配置统一存放在 `{SKILLS_DIR}/config.json`：

```bash
# 复制模板
cp {SKILLS_DIR}/config.example.json {SKILLS_DIR}/config.json

# 编辑 config.json，填写你的凭证
```

| 字段 | 说明 | 用途 |
|------|------|------|
| `feishu.app_id` | 飞书应用 App ID | feishu-doc skill |
| `feishu.app_secret` | 飞书应用 App Secret | feishu-doc skill |
| `feishu.bot_webhook_url` | 机器人 Webhook 地址 | 流程通知推送 |
| `feishu.root_wiki_url` | AI-docs 根目录 Wiki 链接 | 文档自动存放 |
| `feishu.uat_config_path` | UAT 写入的配置文件路径 | 多 AI 工具适配 |
| `feishu.uat_json_path` | UAT 在配置文件中的 JSON 路径 | 多 AI 工具适配 |

> `config.json` 包含私人凭证，不应分享。分享时只需提供 `config.example.json`。

---

## 🚀 使用方式

### 开始新需求

```
开启 dw https://xxx.feishu.cn/wiki/xxx（飞书 PRD 链接）
开启 dw ./docs/PRD.md（本地 PRD 文件）
开启 dw（交互式输入需求信息）
```

AI 会自动按七步流程推进，每步完成后等你确认再继续。

> 第一步会自动生成 Git 分支名并创建分支，后续通过分支名自动关联需求上下文。

### 跟进需求（只做需求分析）

```
跟进 xxx https://xxx.feishu.cn/wiki/xxx（飞书 PRD 链接）
跟进 xxx ./docs/PRD.md（本地 PRD 文件）
```

不创建 Git 分支，只做需求分析。AI 会询问飞书项目链接并写入需求分析文档，方便后续跟进。状态只有"跟进中"和"已上线"两种。

> 也可以事后删除已写入的 Git 分支名，将开发型需求转为跟进型。

---

## 📢 常用命令

| 说什么 | 做什么 |
|--------|--------|
| `开启 dw` + PRD链接 | 🚀 启动七步流程 |
| `开启 dw` + PRD链接 + `模块：xxx` | 🚀 启动流程并指定模块专项规范 |
| `跟进 xxx` + PRD链接 | 📋 跟进模式，只做需求分析（不建分支，记录飞书项目链接） |
| `继续 dw` | 🔗 自动通过 Git 分支名匹配需求，从断点继续（也支持接手移交的需求） |
| `更新 dw` + 状态 | 📝 手动更新需求状态（如"已上线"） |
| `记录` / `记一下` / `log` + 工作内容 | 📌 快速记录零散工作（bug fix、会议、调研等） |
| `移交 [需求名] 给 [人名]` | 🤝 生成移交文档并通知接手人 |
| `导出 skill 到 [平台]` | 📦 将 skill 导出为 Cursor/Kiro/Windsurf/Trae 格式 |
| `新增模块规范：xxx` | 📦 创建新的模块专项规范文件 |
| `写周报` | 📊 自动汇总本周工作生成周报（含效率度量数据） |
| `写季度总结` / `Q1总结` | 📋 生成季度总结 |
| `年度总结` | 📋 生成年度总结 |

---

## 📋 流程概览

```
PRD链接 → ① 需求分析 → ② 设计文档 → ③ 代码开发 → ④ 接口联调(可跳过) → ⑤ AI CR → ⑥ 单元测试 → ⑦ 提测
                                                          ↑
                                                   无接口文档时先 Mock
                                                   有接口文档后联调替换
```

每步都有确认点，你说"确认"才会进入下一步。

> 💡 第六步单元测试由 unit-testing skill 自动生成测试代码并运行，提测前请确保已完成 QA 冒烟测试。

---

## 📁 文件结构

```
{SKILLS_DIR}/daily-workflow/
├── SKILL.md                          # Skill 主流程骨架（精简版，引用 references）
├── README.md                         # 本文件（使用说明）
├── LEARNING.md                       # 学习规则与反馈日志
├── REPORT.md                         # 实践报告
├── output/                           # 输出目录（按项目隔离）
│   ├── .dw-state.template.json       # 本地状态模板
│   └── {项目名}/                     # 运行时生成
│       ├── dw-state.json             # 进度跟踪（始终本地）
│       ├── daily-log.md              # 日报记录（始终本地）
│       ├── dw-index.md               # 索引（无飞书配置时）
│       └── dw-docs/                  # 文档（无飞书配置时）
└── references/                       # 规范文档（AI 按需读取）
    ├── code-review.md                # 🔍 AI CR 走查规范
    ├── general-rules.md              # ⚙️ 通用规则
    ├── weekly-report.md              # 📊 周报模板
    ├── periodic-summary.md           # 📋 季度/年度总结模板
    ├── index-strategy.md             # 🧠 结构化索引策略（长期记忆层）
    ├── feedback-loop.md              # 🔄 RL 训练闭环（反馈驱动优化）
    ├── metrics.md                    # 📈 度量埋点规范（效率量化）
    ├── quick-log.md                  # 📌 快速记录规范
    ├── handover.md                   # 🤝 需求移交规范
    ├── cross-platform-export.md      # 📦 跨平台导出规范
    ├── bot-notification.md           # 🔔 飞书机器人通知规范
    └── modules/                      # 📦 模块专项规范（可选）
        ├── _template.md
        └── xxx.md
```

> 设计文档、需求分析、编码规范、代码走查、单元测试已独立为单独 skill，daily-workflow 在对应步骤自动引用。

---

## ❓ 常见问题

**Q: 不用飞书能用吗？**
> 可以。不配置飞书 MCP 时，daily-workflow 自动使用本地存储：`dw-state.json` 记录状态，`dw-docs/` 存放文档，`dw-index.md` 维护索引。所有功能不受影响。

**Q: 飞书 MCP 连接失败？**
> 检查 App ID/Secret 是否正确，应用是否已发布并审批通过，权限是否齐全。

**Q: 流程中断了怎么恢复？**
> 只要你在对应的 Git 分支上，直接说 `继续 dw` 即可。AI 会通过当前分支名自动匹配需求，从断点继续。

**Q: 可以同时推进多个需求吗？**
> 可以。每个需求在 `dw-state.json` 的 `requirements` 数组中独立一个条目，`daily-log.md` 中同一天可以有多个需求的记录，通过需求名区分。

**Q: 一个需求要在同一个对话里跑完七步吗？**
> 不建议。每步完成后开新对话，下次说"继续 dw"即可从断点恢复。这样做有三个好处：① 节省 token 消耗（上下文越长每次交互成本越高）；② 避免长上下文导致 AI 注意力分散、后续步骤质量下降；③ 每步的 references 文件不同，新对话加载更精准。只有在某一步内部反复修改（如设计文档被驳回多次）时，才建议保持同一对话。

**Q: 流程规范不合理怎么办？**
> AI 会主动识别可优化的点：你指出的问题当场响应，AI 自己发现的优化点会攒到当前步骤确认时一并提出，不打断你的工作节奏。确认后 AI 会自动更新规范及所有关联文件，即刻生效。
