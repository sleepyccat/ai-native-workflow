# coding-standards 学习记录

## 用户偏好

- （暂无）

## 已沉淀的规范更新

| 日期 | 触发来源 | 变更内容 | 变更文件 |
|------|---------|---------|---------|
| 2026-06-17 | areaInfoForm 去 useCallback 重构 CR + 用户反馈"总爱加 useCallback" | 新增「useCallback / useMemo 使用判定」：默认不加，仅三类场景（进依赖 / 传 React.memo 热点子组件 / 自定义 Hook 暴露）使用；禁止用 disable 注释压 exhaustive-deps | references/tech-stack.md |
