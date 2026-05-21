---
name: cross-platform-export
description: 将 AI Skill 导出为其他 AI IDE 的规则格式（Cursor、Kiro、Windsurf、Trae）。当用户说"导出 skill"、"适配 cursor"、"生成 kiro 版本"时自动触发。支持导出指定 skill 或全部 skill。
---

# Skill: 跨平台导出

## 触发词

- 导出 skill 到 [平台名]
- 适配 [平台名]
- 生成 [平台名] 版本

## 用途

将当前 skill 体系（基于 Claude Code）导出为其他 AI IDE 的规则格式，方便团队协作或跨平台使用。

## 当前平台

Kiro（`.kiro/skills/` + SKILL.md front-matter）

> Skill 原始格式兼容 Claude Code（`.claude/skills/`），已适配 Kiro 运行环境。

## 支持的导出目标

| 平台 | 输出目录 | 格式说明 |
|------|----------|----------|
| Cursor | `.cursor/rules/` | .mdc 文件，Cursor 专用 front-matter（description、globs、alwaysApply） |
| Claude Code | `.claude/skills/` | SKILL.md + references 目录结构，原始格式 |
| Windsurf | `.windsurf/rules/` | Markdown 文件 |
| Trae | `.trae/rules/` | Markdown 文件 |

## Kiro 平台适配规范

当前 skill 体系已运行在 Kiro 中。以下是 Kiro 平台的关键特性和适配要点：

### Kiro Skill 加载机制

| 特性 | 说明 |
|------|------|
| 配置目录 | `.kiro/skills/`（工作区级）或 `~/.kiro/skills/`（用户级） |
| 加载方式 | 通过 `discloseContext` 工具按名称加载 skill 到上下文 |
| front-matter | 与 Claude Code 格式一致：`---\nname: xxx\ndescription: xxx\n---` |
| 文件结构 | SKILL.md + references/ + LEARNING.md，与 Claude Code 完全兼容 |
| MCP 配置 | `.kiro/settings/mcp.json`（工作区级）或 `~/.kiro/settings/mcp.json`（用户级） |

### Kiro 与 Claude Code 的差异

| 维度 | Kiro | Claude Code |
|------|------|-------------|
| Skill 加载 | 按需加载（`discloseContext`），不自动全量加载 | 自动加载 skills 目录下所有文件 |
| MCP 配置位置 | `.kiro/settings/mcp.json` | `~/.claude.json` 或项目根 `.mcp.json` |
| Token 刷新后 | 手动刷新 MCP 连接即可，无需重启 | 需要重启整个应用 |
| Steering 文件 | `.kiro/steering/*.md`，支持 always/fileMatch/manual 三种 inclusion 模式 | 无对应概念 |
| Hooks | `.kiro/hooks/*.json`，支持事件驱动的自动化 | 无对应概念 |

### Kiro 特有能力（可选增强）

当 skill 运行在 Kiro 中时，可以利用以下 Kiro 特有能力增强体验：

1. **Steering 文件**：将通用编码规范（如 `coding-standards/references/tech-stack.md`）同时配置为 steering 文件（`inclusion: auto`），这样即使不显式触发 skill，AI 也会自动遵循编码规范。

2. **Hooks**：可以创建 hooks 实现自动化，例如：
   - `fileEdited` + `*.ts` → 自动运行 lint
   - `postToolUse` + `write` → 自动检查编码规范
   - `userTriggered` → 手动触发 CR 或单元测试

3. **Spec 模式**：Kiro 的 Spec 会话可以与 daily-workflow 的七步流程对应——每个步骤可以映射为一个 Spec task。

### 从其他平台导入到 Kiro

从 Claude Code 导入时：
1. 将 `.claude/skills/` 下的文件复制到 `.kiro/skills/`
2. front-matter 格式无需修改（兼容）
3. 将 `~/.claude.json` 中的 MCP 配置迁移到 `~/.kiro/settings/mcp.json`
4. config.json 中无需配置 `uat_config_path`（脚本自动检测平台，Kiro 默认写入 `~/.kiro/settings/mcp.json`）

从 Cursor 导入时：
1. 将 `.cursor/rules/*.mdc` 文件转换为 `SKILL.md` 格式
2. 移除 Cursor 专用 front-matter（description、globs、alwaysApply），替换为 `name` + `description`
3. 将 `~/.cursor/mcp.json` 中的 MCP 配置迁移到 `~/.kiro/settings/mcp.json`

### 导出时的 UAT 路径处理

`feishu_uat_refresh.js` 内置了平台检测逻辑，导出到不同平台时**无需修改脚本**，默认路径自动适配：

| 目标平台 | 脚本自动写入路径 | 检测方式 |
|----------|-----------------|----------|
| Kiro（默认） | `~/.kiro/settings/mcp.json` | 无特殊环境变量 |
| Claude Code | `~/.claude.json` | `CLAUDECODE=1` |
| Cursor | `~/.cursor/mcp.json` | config.json 中覆盖 `uat_config_path` |

只有非标准平台（如 Cursor、Windsurf）需要在 config.json 中手动配置 `uat_config_path` 和 `uat_json_path` 覆盖默认值。

## 执行流程

1. 确认导出范围：用户指定 skill 名（如"导出 daily-workflow 到 cursor"）或全部（如"导出全部 skill 到 trae"）
2. 读取目标 skill 的所有文件（SKILL.md + LEARNING.md + references + output 模板）
3. 按目标平台的格式要求转换：
   - 调整目录结构和文件命名
   - 转换 front-matter 为目标平台格式（如 Claude Code 的 `---name/description---` → Cursor 的 `.mdc` front-matter）
   - 生成目标平台的 MCP 配置文件模板（飞书 MCP 配置）
   - 保留所有规范内容不变
4. 输出到目标平台对应的目录下
5. 生成一份简短的迁移说明（告诉接收方如何配置 MCP、如何使用）

## 规则

- 核心内容（规范、流程定义、检查项）保持一致，只转换"包装格式"
- 如果目标平台不支持某些特性（如 skill 间引用），将被引用的内容内联展开
- 导出后不影响当前版本的 skill 文件
- 每次导出会覆盖目标目录下的同名文件，导出前提示用户确认

## 示例

- "导出 skill 到 cursor" → 导出全部 skill，在 `.cursor/rules/` 下生成所有规则文件
- "导出 daily-workflow 到 kiro" → 只导出 daily-workflow skill 到 `.kiro/skills/`
- "导出 coding-standards 到 windsurf" → 只导出编码规范 skill 到 `.windsurf/rules/`
- "导出 unit-testing 到 kiro" → 只导出单元测试 skill 到 `.kiro/skills/`
- "导出全部 skill 到 trae" → 导出所有 skill 到 `.trae/rules/`

## 可导出的 Skill 列表

| Skill | 文件组成 |
|-------|---------|
| daily-workflow | SKILL.md + LEARNING.md + README.md + REPORT.md + references/*.md + references/modules/*.md |
| requirement-analysis | SKILL.md + LEARNING.md + README.md + references/ |
| development-design | SKILL.md + LEARNING.md + README.md + references/ |
| coding-standards | SKILL.md + LEARNING.md + README.md + references/ |
| cr-general | SKILL.md + LEARNING.md + README.md + references/ |
| unit-testing | SKILL.md + LEARNING.md + README.md + references/ |
| test-submission | SKILL.md + LEARNING.md + README.md + references/ |
| feishu-doc | SKILL.md + LEARNING.md + README.md + references/ + scripts/ |
