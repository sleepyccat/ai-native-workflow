# 飞书文档输出风格

> 本文件为用户可编辑的参考配置，适用于**汇报类文档**（如 REPORT、周报、季度总结等）。
> 技术类文档（设计文档、单元测试报告、CR 报告等）有各自固定的模板格式，不适用本风格。


---

## 核心原则

这是**汇报文档**，不是技术笔记。关键信息必须视觉跳脱，不能让读者在段落里找重点。

- **彩色，不要黑白**：纯文字段落是最后的手段，视觉元素才是主角
- **重点必须跳出来**：关键结论、核心数据、主要风险——用 callout / 加粗 / 彩色文字，不能淹没在段落里
- **灵活组合，不要固化**：callout、grid、表格、流程图、代码块，根据内容自然搭配，没有固定模板

## 视觉元素使用直觉

### Callout 高亮块——最常用的视觉武器

什么场景用什么颜色，凭直觉选，不用死记：

- 好消息/成果/确认 → 绿色
- 重要提示/要点/总结 → 蓝色
- 警告/瓶颈/注意 → 黄色
- 问题/痛点/错误 → 红色
- 亮点/特性/能力 → 紫色
- 速览/核心摘要 → 橙色

```html
<callout emoji="emoji名称" background-color="颜色值">
内容
</callout>
```

常用 emoji：`alarm_clock`(速览) `bulb`(提示) `dart`(总结) `white_check_mark`(确认) `zap`(提效) `brain`(AI/学习) `x`(问题) `bug`(缺陷) `gift`(亮点) `link`(关联) `handshake`(协作) `arrows_counterclockwise`(循环) `fries`(轻松小结) —— 不局限这些，按内容选合适的

**典型用法**：
- 长文档开头放一个速览 callout，3-5 行说清楚做了什么、效果、亮点、瓶颈
- 并列的痛点/问题，每个一个 callout，红黄蓝错开
- 章节结尾小结用 callout 收束

### Grid 分栏——并列概念要左右摆

两个或三个东西并列、对比、互补时，用 grid 并排展示，比上下堆文字直观。

```html
<grid cols="2">
  <column width="50"><callout ...>左</callout></column>
  <column width="50"><callout ...>右</callout></column>
</grid>
```

### 表格——对比和清单用表格

数据对比、优化记录、功能清单，用表格一目了然。关键数字加粗。

```html
<lark-table rows="3" cols="3" header-row="true" column-widths="244,244,244">
  <lark-tr><lark-td>表头</lark-td>...</lark-tr>
  <lark-tr><lark-td>数据</lark-td>...</lark-tr>
</lark-table>
```

### 流程图——有流程就画图

多步骤流程、有分支的逻辑、有反馈回路的闭环，必须画 Mermaid 图，不用纯文字描述。

### 代码块——该用就用

文件结构、配置示例、命令行操作等，用代码块展示。

### 彩色文字——数字要跳出来

特别重要的数字用 `<text color="red">**2h**</text>` 突出。

## 布局节奏

连续纯文字不超过 3 段，第 4 段前必须插一个视觉元素（callout / grid / 表格 / 流程图 / 代码块）。

## 语法注意

飞书扩展语法用 HTML 标签，不要用 Markdown 语法：
- callout → `<callout>` 标签，不是 `>` 引用块
- 表格 → `<lark-table>` 标签，不是 Markdown 竖线表格
- 分栏 → `<grid>` 标签，不是纯文字并列
