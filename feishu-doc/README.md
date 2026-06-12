# feishu-doc

飞书文档操作（写作规范 + 编辑规范 + 配置管理）。

## 触发词

- "写飞书文档" / "飞书文档" / "创建飞书文档"
- "写入飞书" / "更新飞书文档"

## 功能

1. 独立使用：直接创建或编辑飞书文档
2. 被其他 skill 引用：作为飞书输出通道，提供写作规范和编辑规范

## 前置配置

要读/写飞书文档，需要完成三步配置：

### 1. 配置飞书应用凭证

复制模板并填写：

```bash
cp {SKILLS_DIR}/config.example.json {SKILLS_DIR}/config.json
```

| 字段 | 说明 | 必填 |
|------|------|------|
| `feishu.app_id` | 飞书企业自建应用的 App ID | 是 |
| `feishu.app_secret` | 飞书企业自建应用的 App Secret | 是 |
| `feishu.bot_webhook_url` | 飞书机器人 Webhook 地址 | 否 |
| `feishu.root_wiki_url` | 飞书文档根目录 Wiki 链接 | 是 |
| `feishu.uat_config_path` | UAT 写入的配置文件路径，如 `~/.kiro/settings/mcp.json` | 否（默认 `~/.kiro/settings/mcp.json`） |
| `feishu.uat_json_path` | UAT 在配置文件中的 JSON 路径 | 否（默认 Kiro 路径） |

### 2. 开通飞书 MCP

在 AI 工具的 MCP 配置中添加飞书 MCP 服务器（配置示例见 SKILL.md）。

### 3. 初始授权获取 UAT

MCP 配置中的 `X-Lark-MCP-UAT` 初始为空，运行内置的 Token 刷新脚本完成首次 OAuth 授权即可自动填充：

```bash
node {SKILLS_DIR}/feishu-doc/scripts/feishu_uat_refresh.js
```

## 个性化偏好

飞书文档的输出风格可自定义。编辑 `references/report-style.md` 即可控制：
- 章节标题风格（中文序号、emoji 等）
- 流程图使用场景和语法
- Callout 色块的颜色和触发条件
- 表格表头 emoji、关键数字加粗
- 布局节奏（纯文本段落数上限）
- 禁止事项

每次写入飞书文档前，AI 会自动读取并遵循 `references/report-style.md` 中的规则。修改后下次执行即生效，无需重启。

## 与其他 Skill 的关系

- **不安装 feishu-doc**：所有 skill 的输出默认在对话中展示，无需任何飞书配置
- **安装 feishu-doc**：其他 skill（requirement-analysis、development-design、cr-general、unit-testing、daily-workflow）可将结果写入飞书文档，并自动遵循 `references/report-style.md` 的风格偏好
- **feishu-doc（内置 Token 刷新）**：飞书 token 过期时自动刷新，无需额外 skill

## 飞书是可选的

本 skill 是可选的。不使用飞书的用户无需安装，其他 skill 在没有 feishu-doc 时自动降级为对话输出。

## 自我学习

本 skill 具备独立的学习和反馈机制，详见 `LEARNING.md`。

- 每次用户对 AI 输出做修改/驳回/补充时自动记录反馈
- 同类修改 ≥2 次建议更新规范，驳回 ≥1 次下次规避，确认 ≥3 次固化最佳实践
- 所有学习记录和沉淀的规范更新都在 `LEARNING.md` 中可追溯
