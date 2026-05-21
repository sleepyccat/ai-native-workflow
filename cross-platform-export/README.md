# cross-platform-export

将 AI Skill 导出为其他 AI IDE 的规则格式，方便团队协作或跨平台使用。

## 功能

- 将指定 skill 或全部 skill 导出为目标平台的格式
- 自动转换目录结构、文件命名和 front-matter
- 生成目标平台的 MCP 配置文件模板
- 生成迁移说明

## 支持的导出目标

| 平台 | 输出目录 | 格式说明 |
|------|----------|----------|
| Cursor | `.cursor/rules/` | .mdc 文件，Cursor 专用 front-matter（description、globs、alwaysApply） |
| Kiro | `.kiro/skills/` | SKILL.md + references 目录结构，front-matter 需转换为 Kiro 格式 |
| Windsurf | `.windsurf/rules/` | Markdown 文件 |
| Trae | `.trae/rules/` | Markdown 文件 |

## 使用方式

在 Claude Code 中说：

- "导出 skill 到 cursor" — 导出全部 skill
- "导出 daily-workflow 到 kiro" — 只导出指定 skill
- "适配 windsurf" — 导出全部 skill 到 Windsurf
- "生成 trae 版本" — 导出全部 skill 到 Trae

也可以在 daily-workflow 流程中通过 `cross-platform-export` skill 自动引用。

## 文件结构

```
cross-platform-export/
├── SKILL.md     # Skill 定义（Claude 自动读取）
└── README.md    # 本文件
```

## 导出规则

- 核心内容（规范、流程定义、检查项）保持一致，只转换"包装格式"
- 如果目标平台不支持某些特性（如 skill 间引用），将被引用的内容内联展开
- 导出后不影响当前版本的 skill 文件
- 每次导出会覆盖目标目录下的同名文件，导出前提示用户确认
