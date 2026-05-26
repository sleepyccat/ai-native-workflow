# 度量埋点规范

## 核心目标

量化 AI 辅助开发的效率提升，为调优和对外输出提供数据支撑。

## 度量维度

### 1. 阶段耗时

记录每个需求在七步流程中各阶段的开始/结束时间，计算各阶段耗时。

| 阶段 | 开始时机 | 结束时机 |
|------|----------|----------|
| 需求分析 | 用户提供 PRD 时 | 用户确认需求分析通过 |
| 设计文档 | 需求分析确认后 | 用户确认设计文档通过 |
| 代码开发 | 设计文档确认后 | 用户确认代码通过 |
| 接口联调 | 进入联调阶段时 | 用户确认联调通过 |
| AI CR | 代码/联调确认后 | 用户确认 CR 通过 |
| 单元测试 | CR 确认后 | 用户确认测试通过 |
| 提测 | 单元测试确认后 | 用户确认提测文档通过 |

### 2. AI 交互消耗

每个阶段记录：
- **轮次数**（turns）：AI 与用户的交互轮次（一问一答算一轮）
- **修改次数**（revisions）：用户要求 AI 修改输出的次数
- **驳回次数**（rejections）：用户完全否定 AI 输出的次数

### 3. 质量指标

| 指标 | 采集时机 | 说明 |
|------|----------|------|
| CR 问题数 | 第五步完成时 | AI CR 发现的问题总数 |
| CR 误报数 | 第五步确认时 | 用户标记为"忽略"的问题数 |
| 测试覆盖率 | 第六步完成时 | 单元测试行覆盖率 |
| 测试用例数 | 第六步完成时 | 生成的测试用例总数 |
| 首次通过率 | 第六步完成时 | 首次运行即通过的用例占比 |
| Bug 修复数 | 第六步完成时 | 单元测试过程中发现并修复的源码 Bug 数 |

### 4. 需求复杂度标签

在需求分析完成时，AI 自动评估并记录需求复杂度：

| 维度 | 取值 | 说明 |
|------|------|------|
| 规模 | S / M / L / XL | 预估代码变更量（S<100行, M<500行, L<1000行, XL>1000行） |
| 类型 | 新功能 / 重构 / Bug修复 / 优化 | 需求类型 |
| 涉及模块数 | 数字 | 涉及的业务模块数量 |

## 存储策略

度量原始数据**只存本地** `dw-state.json`，不写入飞书文档。原因：
- 结构化 JSON 方便程序化聚合和趋势计算
- 读写快，不依赖飞书 MCP
- 原始数据是给 AI 读的，不需要人看

**飞书只在输出节点写入汇总结果**：周报效率数据、季度趋势分析、需求完成时的度量摘要——这些是给人看的可读内容。

## 数据结构

### dw-state.json 中的度量字段

每个需求对象新增 `metrics` 字段：

```json
{
  "metrics": {
    "complexity": {
      "size": "M",
      "type": "新功能",
      "modules_count": 2
    },
    "phases": {
      "requirement_analysis": {
        "started_at": "2026-05-12T10:30:00+08:00",
        "completed_at": "2026-05-12T11:15:00+08:00",
        "duration_minutes": 45,
        "turns": 5,
        "revisions": 1,
        "rejections": 0
      },
      "design": {
        "started_at": null,
        "completed_at": null,
        "duration_minutes": null,
        "turns": 0,
        "revisions": 0,
        "rejections": 0
      },
      "development": { "..." : "同上结构" },
      "integration": { "..." : "同上结构，跳过时为 null" },
      "code_review": { "..." : "同上结构" },
      "unit_test": { "..." : "同上结构" },
      "test_submission": { "..." : "同上结构" }
    },
    "quality": {
      "cr_issues_total": 0,
      "cr_false_positives": 0,
      "test_coverage_percent": null,
      "test_cases_total": 0,
      "test_first_pass_rate": null,
      "bugs_found": 0
    },
    "total_duration_minutes": null,
    "total_turns": 0
  }
}
```

### 记录规则

### 自动记录（无需用户操作）

1. **阶段开始**：进入每个步骤时，自动记录 `started_at`
2. **阶段结束**：用户确认通过时，自动记录 `completed_at` 并计算 `duration_minutes`
3. **交互轮次**：每次 AI 响应后自增 `turns`
4. **修改/驳回**：根据用户反馈类型自增对应计数器
5. **质量指标**：在对应步骤完成时自动采集

### 计算规则

- `duration_minutes`：`completed_at - started_at`，取分钟数（向上取整）
- `total_duration_minutes`：所有阶段 `duration_minutes` 之和（跳过的阶段不计）
- `total_turns`：所有阶段 `turns` 之和
- 跳过的阶段（如无需联调）：整个阶段对象设为 `null`

### 时间戳格式

统一使用 ISO 8601 格式，带时区：`2026-05-12T10:30:00+08:00`

## 数据分析与输出

度量数据只在用户主动要求时才汇总输出到可读文档，不自动追加。

### 触发方式

| 用户说 | 输出内容 |
|--------|----------|
| "写周报" | 周报中包含本周效率数据章节 |
| "写季度总结" / "年度总结" | 总结中包含趋势分析 |
| "看看效率数据" / "度量报告" | 单独输出度量汇总 |

### 周报中的度量（用户写周报时自动包含）

```
## 本周效率数据
- 完成需求：X 个（S:X, M:X, L:X）
- 平均需求耗时：X 小时
- 平均交互轮次：X 轮/需求
- CR 精准率：X%
- 测试覆盖率均值：X%
```

### 趋势分析（季度/年度总结时）

按时间维度聚合，输出趋势图数据：

| 指标 | 分析方式 |
|------|----------|
| 平均阶段耗时 | 按月/季度聚合，观察是否收敛 |
| 修改/驳回率 | 按月趋势，验证"越用越好"假设 |
| CR 精准率 | 按月趋势，验证 CR 规则优化效果 |
| 测试覆盖率 | 按月趋势，验证测试策略优化效果 |
| 平均交互轮次 | 按月趋势，验证流程效率提升 |

### 对比基线

首批 3-5 个需求的数据作为 baseline，后续数据与 baseline 对比计算提效百分比。

在 `dw-state.json` 顶层维护 baseline，**按复杂度分层**：

```json
{
  "metrics_baseline": {
    "established_at": "2026-05-30",
    "global": {
      "sample_count": 5,
      "avg_duration_minutes": 480,
      "avg_turns": 35,
      "avg_revision_rate": 0.15,
      "avg_cr_precision": 0.7,
      "avg_test_coverage": 0.6
    },
    "by_size": {
      "S": {
        "sample_count": 2,
        "avg_duration_minutes": 120,
        "avg_turns": 15
      },
      "M": {
        "sample_count": 2,
        "avg_duration_minutes": 480,
        "avg_turns": 35
      },
      "L": {
        "sample_count": 1,
        "avg_duration_minutes": 960,
        "avg_turns": 60
      },
      "XL": null
    }
  }
}
```

**baseline 规则**：
- 全局 baseline 在第 5 个需求完成时自动计算并写入
- 分层 baseline 在该规模累计 ≥ 2 个需求时自动计算
- 对比时优先使用同规模 baseline，该规模无 baseline 时降级到全局 baseline
- baseline 建立后不再自动更新（除非用户手动要求"重新计算 baseline"）

## 隐私与安全

- 度量数据不包含任何业务代码或敏感信息
- 仅记录统计数字和时间戳
- 对外输出时可选择脱敏（隐藏需求名、分支名等）
