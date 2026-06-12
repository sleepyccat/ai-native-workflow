# 专项检查清单

> 本文件为用户可编辑的参考配置，cr-general 执行专项检查时读取。
> 换团队时替换此文件即可。用户可新增任意专项检查维度。

## 逻辑健壮性专项（前端）

- [ ] 状态一致性：多个相关状态更新时是否保持一致（是否有冗余状态可以从其他数据源派生）
- [ ] 条件判断遗漏：三元/if-else 是否有遗漏导致误渲染
- [ ] 数字精度：价格等金额字段是否使用分单位
- [ ] 枚举值映射：前后端枚举映射是否完整
- [ ] 表单重置：重置操作是否清空所有相关状态

## 接口调用专项（前端）

- [ ] 加载状态：是否有 loading 状态防止重复操作（按钮 loading/disabled）
- [ ] 防重提交：表单提交是否有 debounce 或 loading 状态防止重复提交
- [ ] 错误提示：是否使用适当的用户提示（如 toast/message）告知用户错误信息
- [ ] 竞态条件：快速切换页面/tab 时，旧请求响应是否被忽略
- [ ] 参数类型：number 类型参数是否传了 string（常见于表单取值）
- [ ] 保存后刷新：保存成功后是否正确刷新列表/数据，是否有时序问题

## 性能与可维护性专项（前端）

- [ ] 冗余状态：是否有可以从其他数据源派生的冗余状态
- [ ] 大列表渲染：列表/表格是否使用虚拟滚动或分页
- [ ] 防抖搜索：搜索输入是否有防抖（>=300ms）

## 代码逻辑优化专项（React）

- [ ] 滥用局部状态：是否有可以用引用或派生计算替代的状态
- [ ] 响应式数据监听风险：监听的数据变化是否会触发不必要的重渲染/重计算
- [ ] 状态提升过度：是否有本应在子组件/模块内部管理的状态被提升到了父组件/外部
- [ ] 未合并相关状态：多个紧密关联的状态是否应该合并为一个对象（如 {loading, data, error}）
- [ ] 频繁创建新引用：是否有在渲染/热路径中频繁创建新函数/对象，应提取到外部或缓存
- [ ] 不必要的副作用：useEffect 中是否有可以在事件处理函数中直接执行的逻辑
- [ ] 无限循环风险：useEffect 的依赖项是否在内部被修改，导致死循环
- [ ] 列表缺少稳定 key：渲染列表时是否使用 index 作为 key（应使用稳定唯一标识）

## React + TypeScript 代码规范专项

类型与接口：
- [ ] Props 必须有 interface 定义，避免 any（必要时用 unknown + 类型收窄）
- [ ] 接口类型定义：请求参数和响应是否都有 TypeScript 类型定义

日期库：
- [ ] 禁止引入 moment，必须用 dayjs
- [ ] DatePicker 从 antd 引入，禁止用 CompactV4Moment

导入与路径：
- [ ] 导入合并：是否有重复导入（如同时 import {Form} from 'antd' 和 import type {FormInstance} from 'antd'）
- [ ] 路径别名：是否正确使用 @/ 和 @@/ 别名，不要用相对路径跨层级引用

代码风格：
- [ ] 函数风格：必须使用箭头函数表达式（func-style: expression），禁止 function 声明
- [ ] 循环中的 ++：使用 i += 1 代替 i++（ESLint no-plusplus）

React 渲染与状态：
- [ ] 条件渲染：是否有 0 值渲染异常（如 `list.length && <Component />` 会渲染 0）
- [ ] 滥用 useState：是否有可以用 useRef 或派生计算替代的 state
- [ ] 滥用 useMemo/useCallback：是否在不需要优化的场景过度使用，增加了复杂度
- [ ] Form.useWatch 风险：useWatch 监听的字段变化是否会触发不必要的重渲染

React 副作用：
- [ ] 请求时机：useEffect 依赖是否完整，是否导致请求死循环
- [ ] 不必要的副作用：useEffect 中是否有可以在事件处理函数中直接执行的逻辑
- [ ] 无限循环风险：useEffect 的依赖项是否在内部被修改，导致死循环

组件与 JSX：
- [ ] 组件大小：单文件是否超过 300 行，超出则拆分
- [ ] 内联函数过多：JSX 中是否有大量内联函数/对象，应提取到组件外部或用 useCallback
- [ ] 嵌套三元：是否有嵌套三元表达式（ESLint 禁止），改用 IIFE 或提取函数

## IP 联名套餐专项

- [ ] 套餐价格计算：套餐价 vs 原价合计是否正确，是否使用分单位
- [ ] 时间判断：活动开始/结束时间，dayjs 时区处理是否正确
- [ ] 门店选择：TreeSelect/Select 新增和编辑时数据回显是否正常

## 营销活动专项

- [ ] 优惠券/活动状态流转是否完整
- [ ] 活动时间范围校验是否正确
- [ ] 库存/数量边界是否处理

## Antd 升级专项

适用于任意版本升级后的重点关注范围。

Table — 数据与性能：
- [ ] dataSource 为空时是否兜底，columns render 是否处理空值
- [ ] rowKey 是否稳定唯一，rowSelection 类型是否兼容
- [ ] 大数据量分页/虚拟滚动是否正常
- [ ] sorter/filter 受控模式状态更新是否正确

Form — 联动与校验：
- [ ] dependencies 联动是否触发重新校验
- [ ] setFieldsValue 与 initialValues 优先级是否符合预期
- [ ] useWatch 监听是否导致频繁重渲染
- [ ] 嵌套字段 name={['a', 'b']} 回显和提交是否正确
- [ ] 校验规则（rules）行为是否一致

Modal — 生命周期：
- [ ] destroyOnClose 关闭后表单/状态是否正确清理
- [ ] Modal 内 Form 打开时是否重新初始化
- [ ] forceRender 和 afterClose 行为是否符合预期

Select / Cascader：
- [ ] showSearch 搜索过滤是否正常
- [ ] 多选/labelInValue 模式下值类型是否兼容
- [ ] Cascader 异步加载行为是否正常

DatePicker：
- [ ] RangePicker disabledDate/disabledTime 限制是否生效
- [ ] value 类型（dayjs 对象）是否兼容
- [ ] 格式化输出是否一致

Upload：
- [ ] 受控 fileList 状态更新是否正确
- [ ] onChange 中各 status 处理是否完整
- [ ] beforeUpload 校验和返回值行为是否一致

## React 升级专项（17 → 18）

入口文件变更：
- [ ] createRoot 替换 ReactDOM.render（入口文件 index.tsx）
- [ ] unmountComponentAtNode 替换为 root.unmount

自动批处理（Automatic Batching）：
- [ ] setTimeout/Promise/原生事件中的多次 setState 现在会自动合并，之前依赖"每次 setState 立即触发渲染"的逻辑是否受影响
- [ ] 需要立即刷新的场景是否用 flushSync 包裹

Strict Mode 行为变化：
- [ ] 开发模式下 useEffect 会执行两次（mount → unmount → mount），副作用是否幂等
- [ ] 接口请求是否因 double invoke 导致重复调用
- [ ] 事件监听/定时器是否在 cleanup 中正确清理

useEffect 清理时机：
- [ ] cleanup 函数现在在新的 effect 执行前同步运行，依赖此时序的逻辑是否正常

Suspense 与懒加载：
- [ ] React.lazy + Suspense 的路由懒加载是否正常（LazyComponent 实现）
- [ ] fallback 组件是否正确展示

第三方库兼容性：
- [ ] 状态管理库（redux/rematch/zustand 等）是否兼容 React 18
- [ ] 路由库（react-router-dom）是否需要升级
- [ ] 拖拽库（react-beautiful-dnd / @dnd-kit 等）是否兼容
- [ ] 微前端框架（qiankun / wujie 等）是否兼容
- [ ] 其他 React 生态库是否有兼容性问题

事件系统变化：
- [ ] 事件不再挂载到 document 而是 root 容器，微前端场景下事件冒泡是否受影响
- [ ] onFocus/onBlur 使用原生 focusin/focusout，表单聚焦行为是否一致

TypeScript 类型变化：
- [ ] children 不再隐式包含在 FC props 中，需显式声明 children?: React.ReactNode
- [ ] 组件返回类型允许 undefined，之前必须返回 null 的地方是否需要调整
