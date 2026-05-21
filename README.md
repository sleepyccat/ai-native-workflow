# 🧠 AI-Native Workflow

> 一套可编排、可复用、可进化的 AI 开发工作流框架。让 AI 成为开发流程的执行引擎，人专注于决策和创造。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 💡 这是什么？

一套基于 Multi-Agent 协作的开发工作流系统，覆盖从**需求分析到提测**的全流程自动化。

核心理念：**AI 执行，人决策。**

- AI 主动推进流程，在关键节点停下等你确认
- 你不再是"动手的人"，而是"拍板的人"
- 文档类工作提效 80%+，日报实现零人工

```
传统方式：人驱动流程，AI 偶尔辅助（AI-Augmented）
本项目：  AI 驱动流程，人在关键节点决策（AI-Native）
```

---

## 📊 效果

基于真实项目验证（中等复杂度前端需求）：

| 环节 | 传统耗时 | AI 辅助耗时 | 提效 |
|------|----------|-------------|------|
| 需求分析 | 30-60 min | 8-15 min | ~75% |
| 设计文档 | 1-2 h | 4-15 min | ~80% |
| 代码开发 | 视需求 | 视需求 | ~30-50% |
| 单元测试 | 30-60 min | 5-10 min | ~80% |
| 提测文档 | 20-30 min | 3-5 min | ~85% |
| 日报 | 5-10 min/天 | 0 min | 100% |

> 以上数据含人工审核确认时间，不含需求澄清等待时间。

---

## 🏗️ 架构

### Multi-Agent 协作

```
┌─────────────────────────────────────────────────┐
│              编排 Agent (daily-workflow)          │
│         流程编排 · 状态管理 · 断点重连            │
└──────────┬──────┬──────┬──────┬──────┬──────────┘
           │      │      │      │      │
     ┌─────▼┐ ┌──▼───┐ ┌▼────┐ ┌▼───┐ ┌▼─────┐
     │需求分析│ │设计文档│ │CR   │ │单测│ │提测   │
     │ Agent │ │Agent │ │Agent│ │Agent│ │Agent │
     └──────┘ └──────┘ └─────┘ └────┘ └──────┘
```

每个 Agent 可独立使用，也可在编排流程中自动串联。

### 三层文件架构

| 层 | 文件 | 管理者 | 说明 |
|----|------|--------|------|
| 通用规则 | `SKILL.md` | AI 维护 | 通用流程定义，与技术栈无关 |
| 参考配置 | `references/` | **用户编辑** | 技术栈/团队偏好，换团队时替换 |
| 学习反馈 | `LEARNING.md` | AI 管理 | 基于反馈自动学习，持续进化 |

**核心设计**：SKILL.md 是通用的，references/ 是可替换的。换技术栈只需替换 references，流程框架完全复用。

---

## 📦 Skills 一览

| Skill | 触发词 | 职责 |
|-------|--------|------|
| **daily-workflow** | `开启 dw`、`继续 dw` | 编排 Agent，七步全流程自动化 |
| **requirement-analysis** | `需求分析`、`审PRD` | PRD 质量评审 + 待澄清问题提取 |
| **development-design** | `设计文档`、`写设计` | 代码结构分析 + 设计方案生成 |
| **coding-standards** | `编码规范`、`怎么写` | 编码规范查询与代码风格约束 |
| **cr-general** | `代码走查`、`CR` | 多维度代码走查，输出结构化报告 |
| **unit-testing** | `单元测试`、`写单测` | 测试生成 + 运行 + 失败自动修复 |
| **test-submission** | `提测`、`写提测文档` | 提测文档自动生成，信息自动回填 |
| **feishu-doc** | `写飞书文档` | 飞书文档操作（可选） |
| **cross-platform-export** | `导出 skill` | 导出为 Cursor/Windsurf/Trae 格式 |

### 流程串联

```
开启 dw + PRD 链接
  ├── Step 1: 需求分析 → requirement-analysis
  ├── Step 2: 设计文档 → development-design
  ├── Step 3: 代码开发 → coding-standards（约束）
  ├── Step 4: 接口联调
  ├── Step 5: AI CR → cr-general
  ├── Step 6: 单元测试 → unit-testing
  └── Step 7: 提测 → test-submission
```

每步完成后等待用户确认，不会擅自推进。

---

## 🚀 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/your-username/ai-native-workflow.git
```

### 2. 放入你的 AI IDE

| IDE | 目标目录 |
|-----|----------|
| Kiro | `.kiro/skills/` |
| Claude Code | `~/.claude/skills/` |
| Cursor | `.cursor/rules/` |
| Windsurf | `.windsurf/rules/` |

### 3. 配置凭证（可选，仅飞书用户）

```bash
cp config.example.json config.json
# 编辑 config.json，填写飞书应用凭证
```

> 不使用飞书的用户无需任何配置，所有输出默认在对话中展示。

### 4. 开始使用

```
# 启动完整开发流程
开启 dw + [你的 PRD 链接]

# 单独使用某个 Skill
审PRD [PRD 链接]
代码走查 src/**/*.tsx
写单测 src/components/MyComponent.tsx
```

---

## 🔧 适配你的技术栈

默认配置面向 React + TypeScript 前端开发。适配其他技术栈**只需替换 `references/` 下的文件**：

| 场景 | 操作 |
|------|------|
| React → Vue | 替换 6 个 references 文件内容 |
| 前端 → Java 后端 | 替换 references，关注点改为接口/数据/并发 |
| 前端 → iOS/Android | 替换 references，测试框架改为 XCTest/JUnit |
| 同技术栈换团队 | 只调整团队偏好（命名规范、文档格式等） |

需要替换的文件：

| Skill | 文件 | 内容 |
|-------|------|------|
| coding-standards | `references/tech-stack.md` | 技术栈编码规范 |
| cr-general | `references/specialized-checks.md` | 专项检查清单 |
| unit-testing | `references/frontend-testing.md` | 测试框架配置 |
| requirement-analysis | `references/frontend-concerns.md` | 需求关注点 |
| development-design | `references/design-template.md` | 设计文档模板 |
| test-submission | `references/frontend-submission.md` | 提测文档模板 |

> 💡 不用一开始就替换全部。先用默认配置跑一轮，AI 会通过 LEARNING.md 学习你的偏好，逐步沉淀为专属配置。

---

## 🧬 自我进化

每个 Skill 都具备独立的学习机制：

- **用户驳回 ≥1 次** → 下次主动确认，避免重复犯错
- **用户确认 ≥3 次** → 固化为最佳实践，写入规范
- **AI 自发现** → 阶段结束时提出优化建议

规范不是写出来的，是**跑出来的**。

---

## 🎯 核心设计模式

| 模式 | 说明 |
|------|------|
| 编排-调度 | 编排 Agent 不执行具体任务，只负责调度专项 Agent |
| 确认点机制 | 每阶段完成后等待用户确认，AI 不擅自推进 |
| 断点重连 | 中断后说"继续"，AI 自动从断点恢复 |
| 需求移交 | 换人时自动生成移交摘要，接手人零学习成本 |
| 规范即配置 | 团队规范编码为 AI 可执行的约束文件 |

---

## 📁 目录结构

```
ai-native-workflow/
├── README.md
├── config.example.json          # 凭证模板（飞书可选）
├── daily-workflow/              # 编排 Agent（核心）
│   ├── SKILL.md
│   ├── LEARNING.md
│   └── references/
├── requirement-analysis/        # 需求分析 Agent
│   ├── SKILL.md
│   ├── LEARNING.md
│   └── references/
├── development-design/          # 设计文档 Agent
│   ├── SKILL.md
│   ├── LEARNING.md
│   └── references/
├── coding-standards/            # 编码规范 Agent
│   ├── SKILL.md
│   ├── LEARNING.md
│   └── references/
├── cr-general/                  # 代码走查 Agent
│   ├── SKILL.md
│   ├── LEARNING.md
│   └── references/
├── unit-testing/                # 单元测试 Agent
│   ├── SKILL.md
│   ├── LEARNING.md
│   └── references/
├── test-submission/             # 提测文档 Agent
│   ├── SKILL.md
│   ├── LEARNING.md
│   └── references/
├── feishu-doc/                  # 飞书文档（可选）
│   ├── SKILL.md
│   └── scripts/
└── cross-platform-export/       # 跨平台导出
    └── SKILL.md
```

---

## 🤝 Contributing

欢迎贡献！特别是：

- 🌐 **新技术栈的 references 配置**（Vue、Angular、Go、Java、Python...）
- 📝 **新的 Skill**（比如发布流程、故障复盘、技术方案评审...）
- 🐛 **Bug 反馈和优化建议**
- 📖 **文档改进**

请提 Issue 或 PR，一起探索 AI-Native 开发工作流的可能性。

---

## 📄 License

MIT

---

## 🔗 相关文章

- [一个需求从需求分析到提测，AI 全流程只花了 51 分钟](https://blog.csdn.net/guanguan0_0/article/details/161117640?spm=1011.2124.3001.6209)
- [前端 80% 的时间不在写代码——我用 AI 把这部分干掉了](https://blog.csdn.net/guanguan0_0/article/details/161187473?spm=1011.2124.3001.6209)
- [淘汰你的不是 AI，而是会用 AI 的同行](https://blog.csdn.net/guanguan0_0/article/details/161217781?spm=1011.2124.3001.6209)
- [AI-Native 前端工程化：完整技术方案](https://blog.csdn.net/guanguan0_0/article/details/161285959)

---

> **淘汰你的不是 AI，而是会用 AI 的同行。而你，可以成为设计"AI 怎么用"的那个人。**
