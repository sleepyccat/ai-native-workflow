# coding-standards

编码规范查询与应用。

## 触发词

- "编码规范" / "coding standards" / "代码规范"
- "写法" / "怎么写"
- "检查规范"

## 功能

1. 规范查询：问"xxx 怎么写"，给出符合项目规范的写法
2. 代码风格检查：提供代码片段或文件，检查是否符合规范
3. 被 daily-workflow 第三步自动引用，确保生成代码符合规范

## 覆盖范围

- Prettier 格式化配置
- 命名规范（文件/代码）
- ESLint 核心规则
- 类型规范
- 组件规范
- 状态管理
- UI 组件库使用规范
- 接口请求规范
- 样式规范
- Git 规范
- 代码质量（复杂度/注释/文件大小）

技术栈特定的规范（React 组件规范、Rematch 状态管理、Ant Design 5 使用规范、TypeScript 类型规范、CSS Modules + Less 等）详见 `references/tech-stack.md`，可按团队替换。

## 个性化配置

`references/` 目录存放用户可编辑的引导配置，换团队/换技术栈时替换即可：

- `tech-stack.md` — 技术栈版本、项目结构、路径别名、项目特有 ESLint 规则

## 输出

本 skill 支持三种输出方式：
1. **对话输出**（默认）：直接在对话中展示
2. **飞书文档**（代码风格检查结果）：需安装 `feishu-doc` skill 并配置凭证
3. **本地 MD 文件**：保存到 `{SKILLS_DIR}/coding-standards/output/{项目名}/`

## 自我学习

本 skill 具备独立的学习和反馈机制，详见 `LEARNING.md`。

- 每次用户对 AI 输出做修改/驳回/补充时自动记录反馈
- 同类修改 ≥2 次建议更新规范，驳回 ≥1 次下次规避，确认 ≥3 次固化最佳实践
- 所有学习记录和沉淀的规范更新都在 `LEARNING.md` 中可追溯
