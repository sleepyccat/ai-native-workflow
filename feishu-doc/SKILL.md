---
name: feishu-doc
description: 飞书文档操作（写作规范 + 编辑规范 + 配置管理 + Token 刷新）。当用户说"写飞书文档"、"飞书文档"、"创建飞书文档"、"刷新飞书token"、"飞书token过期"时自动触发。支持独立创建/编辑飞书文档、UAT Token 刷新，也可被其他 skill 引用作为飞书输出通道。不安装此 skill 时，其他 skill 的输出默认在对话中展示。
---

# Skill: 飞书文档操作

## 触发词
- 写飞书文档 / 飞书文档 / 创建飞书文档
- 写入飞书 / 更新飞书文档
- 帮我建个飞书文档
- 刷新飞书token / 飞书token过期 / feishu token expired
- 飞书授权 / 刷新UAT / 刷新飞书

## 角色定位
你是一个飞书云文档操作专家，负责所有飞书文档的创建、编辑和格式化。作为其他 skill 的飞书输出通道，确保文档格式正确、操作安全。

## 两种使用模式

### 模式一：独立使用
用户直接说"帮我写个飞书文档"，根据用户描述创建或编辑飞书文档。

### 模式二：被其他 skill 引用
作为其他 skill 的飞书输出通道。当其他 skill 需要将结果写入飞书时，引用本 skill 的写作规范和编辑规范。

## 前置配置

要读/写飞书文档，需要完成以下三步配置：

### 1. 配置飞书应用凭证

凭证存放在 `{SKILLS_DIR}/config.json`（Kiro 为 `.kiro/skills/`，Claude Code 为 `~/.claude/skills/`，其他 IDE 见各自 skills 目录）：

| 字段 | 说明 | 必填 |
|------|------|------|
| `feishu.app_id` | 飞书企业自建应用的 App ID | 是 |
| `feishu.app_secret` | 飞书企业自建应用的 App Secret | 是 |
| `feishu.bot_webhook_url` | 飞书机器人 Webhook 地址 | 否（通知用） |
| `feishu.root_wiki_url` | 飞书文档根目录 Wiki 链接 | 是 |

> UAT 写入路径无需配置——脚本自动检测当前平台（Kiro 默认写入 `~/.kiro/settings/mcp.json`，Claude Code 写入 `~/.claude.json`）。仅非标准平台需要在 config.json 中添加 `uat_config_path` 和 `uat_json_path` 覆盖。

模板文件：`{SKILLS_DIR}/config.example.json`

### 2. 开通飞书 MCP

在 AI 工具的 MCP 配置中添加飞书 MCP 服务器（Kiro 为 `~/.kiro/settings/mcp.json`，其他工具见 config.json 的 `uat_config_path`）：

```json
{
  "mcpServers": {
    "feishu": {
      "transport": "http",
      "url": "https://mcp.feishu.cn/mcp",
      "headers": {
        "Content-Type": "application/json",
        "X-Lark-MCP-UAT": "",
        "X-Lark-MCP-Allowed-Tools": "search-doc,create-doc,fetch-doc,update-doc,list-docs,get-comments,add-comments,search-user,get-user,fetch-file"
      },
      "autoApprove": ["fetch-doc","update-doc","search-user","create-doc","list-docs","search-doc","fetch-file"]
    }
  }
}
```

### 3. 初始授权获取 UAT

MCP 配置中的 `X-Lark-MCP-UAT` 初始为空，需要完成首次 OAuth 授权来获取：

```bash
node {SKILLS_DIR}/feishu-doc/scripts/feishu_uat_refresh.js
```

授权成功后 UAT 会自动写入 MCP 配置文件，之后飞书 MCP 即可正常使用。UAT 过期时按下方「飞书 Token 过期处理」流程刷新。

**首次写入飞书文档前必须校验**：如果 config.json 不存在、或必填字段缺失、或值仍为占位符（以"在此"开头），则停止写入并提示用户：

> 飞书凭证未配置。请执行以下步骤：
> 1. 复制模板：`cp {SKILLS_DIR}/config.example.json {SKILLS_DIR}/config.json`
> 2. 编辑 config.json，填写飞书应用凭证和文档根目录链接
> 3. 在 MCP 配置文件中添加飞书 MCP 服务器配置
> 4. 运行 `node {SKILLS_DIR}/feishu-doc/scripts/feishu_uat_refresh.js` 完成首次授权
> 5. 重新执行即可

## MCP 可用性前置检查（Hard Rule）

> **任何需要飞书操作的流程开始前，必须执行此检查。这是硬规则，不可跳过。**

### 检查流程

1. 尝试调用任意飞书 MCP 工具（推荐 `fetch-doc` 或 `get-user`）
2. 根据结果判断：
   - **工具调用成功** → 继续正常流程
   - **工具不在可用列表中 / 调用报错 / 返回 token invalid** → 执行下方刷新流程

### 自动刷新流程

```bash
# 注意：项目 package.json 有 "type": "module"，必须用 .cjs 后缀
# 如果 .cjs 文件不存在，先复制一份
node {SKILLS_DIR}/feishu-doc/scripts/feishu_uat_refresh.cjs
```

刷新成功后：
- 提示用户在 Kiro 中刷新 MCP 连接
- 用户确认后，再次调用飞书工具验证可用性
- 确认可用后继续原流程

### 禁止行为

- ❌ 尝试 `web_fetch` 绕行访问飞书文档
- ❌ 让用户手动检查 MCP 状态
- ❌ 跳过飞书写入，只在对话中输出
- ❌ 假设"MCP 可能没配置"而放弃尝试

### 触发时机

- daily-workflow 流程启动时（第一步开始前）
- 任何 skill 首次需要调用飞书 MCP 时
- 飞书操作中途报错时

## 飞书文档写作规范

### 用户偏好（必须遵循）

写入飞书文档前必须读取 `references/report-style.md`，按用户偏好的风格输出。注意：report-style.md 仅适用于汇报类文档（REPORT、周报、总结等），技术类文档（设计文档、单元测试报告、CR 报告等）使用各 skill 自身的固定模板格式。

### 换行规则

- **表格单元格内换行**：必须使用 `<br/>`，普通换行符（`\n`）在表格单元格内无效，会被合并为一行
- **段落之间**：需要空行分隔，单个换行符会被飞书合并为同一段落
- **callout / grid / column 等组件内**：内容前后需要空行，否则内容可能无法正确渲染
- **lark-table 单元格内**：`<lark-td>` 标签内的内容前后必须空行

### 格式规范

- **必须使用 `<lark-table>` 增强表格**（支持横向滚动），禁止使用 Markdown 表格
- **列宽规范**：按每列内容量分配，禁止均分。参考：序号/编号 30-40px，短文本（状态/标签/管理者）80-100px，日期列 100-120px，中等文本（名称/优化项/指令）150-200px，长描述（说明）撑满剩余宽度。文本内容列最小 160px
- **链接**：文档中的链接必须是可点击的飞书链接

## 飞书文档编辑规范

### 编辑操作安全规则

- **优先使用 `replace_range` + 精确定位**，避免 `replace_all`
- **表格类内容修改**：用 `selection_by_title` 按章节定位更安全，避免定位到表格内部结构
- **`replace_all` 慎用**：会替换文档中所有匹配项，容易误改不相关的内容
- **插入内容时**：`insert_before` / `insert_after` 的定位文本要足够长（10-20 字符），确保唯一匹配
- **表格行级定位困难**：飞书云文档中的表格转换后结构复杂，无法精确定位到某一行。需要更新表格中的某几行时，用 `selection_by_title` 替换整个章节（包含表头和所有行），而不是尝试定位单行


### 写入前必读

每次操作飞书文档前，必须先 `fetch-doc` 读取当前完整内容，确认列数、行数、列顺序后再写入。不要凭记忆操作。

## 飞书 Token 过期处理

操作过程中飞书 MCP 报 `user access token is invalid or expired` 时，自动执行 token 刷新流程，刷新成功后继续当前操作。

### ⚠️ 重要：禁止使用 mcp__feishu__authenticate

`mcp__feishu__authenticate` 强制走完整 OAuth 浏览器授权流程，即使 refresh_token 仍然有效也会要求用户打开浏览器。**token 过期时必须使用刷新脚本**，不要调用 `mcp__feishu__authenticate`。只有从未授权过的首次场景才需要浏览器 OAuth。

### 完整刷新流程

此流程分三步，必须全部完成才能真正恢复飞书 MCP 功能：

#### 第一步：保存当前任务上下文

刷新 token 后必须重启 Claude 才能让 MCP 加载新 token（详见第三步），重启会丢失当前对话上下文。因此在刷新前：

1. 将当前任务的关键信息（做了什么、还差什么、下一步是什么）保存到记忆中
2. 确保记忆已写入磁盘

#### 第二步：刷新 UAT

运行刷新脚本更新 UAT：

```bash
node {SKILLS_DIR}/feishu-doc/scripts/feishu_uat_refresh.js
```

- **静默刷新**：优先使用 refresh_token 刷新（30天有效），无需用户操作
- **OAuth 授权**：refresh_token 也过期时，自动打开浏览器让用户授权
- **强制重新授权**：加 `--force` 参数跳过检查直接走 OAuth
- **多工具适配**：UAT 写入路径和 JSON 路径通过 config.json 的 `uat_config_path` 和 `uat_json_path` 配置，默认面向 Claude Code，换成 Cursor 等工具只需修改配置

脚本工作流程：
1. 检查当前 token 是否有效（有效则跳过）
2. 尝试 refresh_token 静默刷新（大多数情况）
3. 刷新失败则启动 OAuth 浏览器授权流程（120秒超时）
4. 新 token 自动写入配置文件的飞书 MCP 配置
5. refresh_token 持久化到脚本同目录的 `.feishu-uat.json`

#### 第三步：刷新 MCP 使新 token 生效

UAT 刷新成功后，MCP 服务器缓存了旧 headers，不会自动重新读取配置文件。不同工具的生效方式不同：

**自动检测当前工具**：通过环境变量判断当前运行环境。

| 工具 | 生效方式 |
|------|---------|
| **Kiro** | 手动刷新 MCP 连接即可，无需重启 |
| **Claude Code** | 需要重启 Claude Code |

操作（Kiro，默认）：
1. 刷新成功后，提示用户：**"Token 已刷新，请在 Kiro 中手动刷新 MCP 连接即可继续"**
2. 用户手动刷新 MCP 后，验证可用性，继续任务

操作（Claude Code，`CLAUDECODE=1`）：
1. 刷新成功后，主动提示用户：**"记忆已保存，请重启 Claude Code 并说'继续'即可接着工作"**
2. 用户重启后说"继续"，AI 自动加载记忆，恢复之前的任务上下文
3. 验证飞书 MCP 是否可用（调用任意飞书 MCP 工具测试）
4. 确认可用后继续之前的飞书操作

#### 执行后

- 告知用户刷新结果（成功/失败）
- 自动检测运行环境，根据当前工具提示对应操作：
  - Kiro（默认）：**"Token 已刷新，请在 Kiro 中手动刷新 MCP 连接即可继续"**
  - Claude Code（`CLAUDECODE=1`）：**"记忆已保存，请重启 Claude Code 并说'继续'即可接着工作"**
- 恢复后先验证 MCP 可用性，再从记忆恢复上下文继续任务

### Token 有效期

| Token 类型 | 有效期 | 说明 |
|-----------|--------|------|
| UAT (access_token) | 2 小时 | 过期后需刷新 |
| refresh_token | 30 天 | 用于静默刷新 UAT |

## 独立使用流程

1. 用户描述要创建/编辑的文档内容
2. 校验 config.json 配置
3. 按写作规范生成文档内容
4. 调用飞书 MCP 创建/更新文档
5. 返回文档链接

## 被其他 skill 引用

其他 skill 需要写入飞书时，读取本 skill 中的写作规范和编辑规范。引用方式：

- 在 SKILL.md 中注明"飞书输出需引用 feishu-doc skill"
- 写入飞书前先读取本 SKILL.md 中的"飞书文档写作规范"和"飞书文档编辑规范"，以及 `references/report-style.md` 中的用户偏好
- 不安装 feishu-doc skill 时，该 skill 的输出默认在对话中展示

## References（参考配置）

`references/` 目录存放用户可编辑的参考配置，每次执行前自动读取该目录下所有文件。换团队/换技术栈时替换文件内容即可，无需修改 SKILL.md。

## 自我学习

学习规则与反馈日志详见 `LEARNING.md`。

核心机制：
- **触发时机**：用户对 AI 输出做了修改/驳回/补充时自动记录
- **策略优化**：同类修改 ≥2 次建议更新规范，驳回 ≥1 次下次规避，确认 ≥3 次固化最佳实践
- **执行流程**：识别 → 提出 → 用户确认 → 执行 → 记录到 LEARNING.md
- **变更同步**：规范更新后同步更新 SKILL.md 对应章节

每次执行前读取 LEARNING.md 中的"用户偏好"和"已沉淀的规范更新"，将学到的知识应用到当前输出中。
