# 技术栈与项目配置

> 本文件为用户可编辑的参考配置。换项目或换团队时，修改此文件即可适配。
> 每次执行 coding-standards skill 前，AI 会自动读取此文件。

## 技术栈

- React 17.0.2
- Ant Design 5.13.0（@ant-design/pro-components）
- TypeScript 4.x（strict 模式未开启）
- Less + CSS Modules
- Rsbuild（构建工具）
- Rematch（状态管理，基于 Redux）
- react-router-dom 6.x（HashRouter）
- dayjs（日期处理，禁止使用 moment）
- axios 1.6.8

## 项目结构

```
src/
├── api/                # 接口请求（按业务模块分子目录）
├── assets/             # 静态资源（图片等）
├── components/         # 公共组件（可通过 @@/ 别名引用）
├── constant/           # 常量定义
├── context/            # React Context
├── hooks/              # 自定义 Hooks
├── lib/                # 第三方库封装
├── models/             # Rematch 状态模型
├── route/              # 路由配置
├── services/           # 服务层
├── style/              # 全局样式
├── view/               # 页面组件（按业务模块分目录）
│   └── xxxModule/
│       ├── index.tsx
│       ├── index.module.less
│       └── components/   # 页面私有组件
├── App.tsx
├── store.ts            # Rematch store 初始化
├── Theme.tsx           # 主题配置
└── index.tsx           # 入口文件
```

## 路径别名

```typescript
// tsconfig.json & rsbuild 中已配置
import Foo from '@/components/Foo'   // → src/components/Foo
import Bar from '@@/Bar'             // → src/components/Bar
```

## 格式化配置（Prettier）

项目 `.prettierrc.cjs` 已配置，保存时自动格式化：

| 规则 | 值 | 说明 |
|------|------|------|
| `semi` | `false` | 不加分号 |
| `singleQuote` | `true` | 使用单引号 |
| `trailingComma` | `all` | 尾逗号 |
| `bracketSpacing` | `false` | 花括号内无空格 `{a, b}` |
| `printWidth` | `120` | 单行最大 120 字符 |
| `tabWidth` | `2` | 缩进 2 空格 |
| `arrowParens` | `avoid` | 单参数箭头函数不加括号 `x => x` |
| `jsxBracketSameLine` | `true` | JSX 闭合括号不换行 |
| `insertPragma` | `true` | 自动插入 `/** @format */` 文件头 |

```typescript
// ✅ 符合 Prettier 配置的代码风格
const getUserInfo = (id: number) => {
  const {name, age} = userMap[id]
  return {name, age}
}

// ❌ 不符合
const getUserInfo = (id: number) => {
  const { name, age } = userMap[id];
  return { name, age };
};
```

## 命名规范

### 文件命名

| 类型 | 规则 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `UserCard.tsx` |
| 页面目录 | camelCase | `view/accountManagement/index.tsx` |
| Hook 文件 | camelCase，use 前缀 | `useBrandId.ts` |
| 工具函数 | camelCase | `formatDate.ts` |
| 样式文件 | 与组件同名 | `index.module.less` |
| 常量文件 | camelCase | `storageKeys.ts` |
| Model 文件 | camelCase | `models/user/index.ts` |

### 代码命名

ESLint 强制 `camelcase` 规则，所有标识符必须使用驼峰命名。

```typescript
// 组件：PascalCase
const UserCard: React.FC<UserCardProps> = () => { ... }

// Hook：camelCase，use 前缀
const useUserList = () => { ... }

// 变量/函数：camelCase（ESLint camelcase 规则强制）
const userName = 'test'
const getUserInfo = () => { ... }

// 常量：UPPER_SNAKE_CASE
const MAX_PAGE_SIZE = 50

// 类型/接口：PascalCase，接口不加 I 前缀
type UserInfo = { ... }
interface UserCardProps { ... }

// 枚举：PascalCase，成员 PascalCase
enum StatusType {
  Active = 'active',
  Disabled = 'disabled',
}

// boolean 变量：is/has/should/can 前缀
const isLoading = true
const hasPermission = false
```

## ESLint 核心规则

以下规则在 `.eslintrc.json` 中配置为 error 级别，CI 不通过：

### 变量与声明

| 规则 | 说明 |
|------|------|
| `prefer-const` | 不会重新赋值的变量必须用 `const` |
| `no-var` | 禁止使用 `var` |
| `prefer-destructuring` | 优先使用解构赋值 |
| `camelcase` | 强制驼峰命名 |
| `eqeqeq` | 必须使用 `===` / `!==` |

### 函数风格

| 规则 | 说明 |
|------|------|
| `func-style: expression` | **必须使用函数表达式（箭头函数），禁止 function 声明** |
| `arrow-body-style: as-needed` | 箭头函数体只有一条语句时省略花括号 |
| `prefer-arrow-callback` | 回调函数必须使用箭头函数 |
| `no-loop-func` | 禁止在循环中定义函数 |
| `default-param-last` | 默认参数放在最后 |

```typescript
// ✅ 正确：函数表达式 + 箭头函数
const getUserInfo = (id: number) => fetchUser(id)

const handleClick = (id: number) => () => {
  console.log(id)
}

// ❌ 错误：function 声明（违反 func-style）
function getUserInfo(id: number) {
  return fetchUser(id)
}
```

### 对象与数组

| 规则 | 说明 |
|------|------|
| `object-shorthand` | 对象方法和属性使用简写 |
| `prefer-object-spread` | 使用展开运算符代替 `Object.assign` |
| `no-new-object` | 禁止 `new Object()` |
| `no-array-constructor` | 禁止 `new Array()` |
| `quote-props: as-needed` | 对象属性名仅在必要时加引号 |
| `no-prototype-builtins` | 禁止直接调用 `Object.prototype` 方法 |

### 复杂度控制

| 规则 | 值 | 说明 |
|------|------|------|
| `complexity` | 35 | 单函数圈复杂度上限 |
| `max-depth` | 6 | 最大嵌套深度 |
| `max-nested-callbacks` | 3 | 最大回调嵌套层数 |

### 其他

| 规则 | 说明 |
|------|------|
| `no-eval` | 禁止 eval |
| `no-param-reassign` | 避免修改函数参数（warn 级别） |
| `prefer-template` | 使用模板字符串代替字符串拼接 |
| `prefer-rest-params` | 使用剩余参数代替 `arguments` |
| `prefer-spread` | 使用展开运算符代替 `apply` |
| `spaced-comment: always` | 注释 `//` 后必须有空格 |
| `no-else-return` | 有 return 时不需要 else |

### 项目特有 ESLint 规则

| 规则 | 级别 | 说明 |
|------|------|------|
| `project-rules/no-moment` | error | 禁止引入 moment，必须使用 dayjs |
| `project-rules/no-CompactV4Moment` | error | 禁止使用 CompactV4Moment，DatePicker 从 antd 引入 |

```typescript
// ✅ 正确
import dayjs from 'dayjs'
import {DatePicker} from 'antd'

// ❌ 错误（ESLint error）
import moment from 'moment'
import {DatePicker} from '@/components/CompactV4Moment'
```

## TypeScript 规范

### 类型定义

```typescript
// 优先使用 interface 定义对象类型，type 用于联合类型、交叉类型等
interface UserInfo {
  id: number
  name: string
  age?: number
  role: 'admin' | 'user'
}

// 组件 Props 用 interface
interface UserCardProps {
  user: UserInfo
  onEdit: (id: number) => void
  children?: React.ReactNode
}

// 联合类型用 type
type Status = 'success' | 'error' | 'loading'
type Result<T> = {data: T; total: number}
```

### 类型使用要求

- 尽量避免使用 `any`，必要时用 `unknown` 替代后做类型收窄
- 组件 Props 必须定义类型，与组件放在同一文件
- 事件处理函数标注参数类型

```typescript
// ✅ 正确
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { ... }
const handleClick = (id: number) => () => { ... }

// ❌ 避免
const handleChange = (e: any) => { ... }
```

> 注意：项目 tsconfig 中 `strict: false`，不强制严格类型检查，但建议新代码尽量遵循严格模式写法。

## React 组件规范

### 组件定义

```typescript
// 统一使用函数组件 + React.FC
const UserCard: React.FC<UserCardProps> = ({user, onEdit}) => {
  return (
    <div className={styles.container}>
      <span>{user.name}</span>
    </div>
  )
}

export default UserCard
```

### Hooks 使用规则

ESLint 已配置 `react-hooks/rules-of-hooks`（error）和 `react-hooks/exhaustive-deps`（warn）。

```typescript
// useState：解构命名语义化
const [userList, setUserList] = useState<UserInfo[]>([])
const [loading, setLoading] = useState(false)

// useEffect：明确依赖项，拆分不同职责
useEffect(() => {
  fetchUserList()
}, [params])

useEffect(() => {
  initWebSocket()
  return () => cleanupWebSocket()
}, [])

// useMemo / useCallback：仅在确实需要优化时使用
const sortedList = useMemo(() => list.sort((a, b) => a.id - b.id), [list])
```

### JSX Props 展开

ESLint 配置 `react/jsx-props-no-spreading` 为 warn，尽量避免 `{...props}` 展开：

```typescript
// ✅ 推荐：显式传递 props
<UserCard name={user.name} age={user.age} />

// ⚠️ 警告：props 展开
<UserCard {...user} />
```

### 条件渲染

```typescript
// 简单条件用 &&
{isLogin && <UserInfo />}

// 二选一用三元
{isAdmin ? <AdminPanel /> : <UserPanel />}

// 多条件提取为变量或函数（注意 no-else-return 规则）
const renderContent = () => {
  if (loading) return <Spin />
  if (error) return <ErrorBlock message={error} />
  if (!data.length) return <Empty />
  return <UserList data={data} />
}
```

## 状态管理规范（Rematch）

项目使用 `@rematch/core` 进行状态管理。

### Model 定义

```typescript
// src/models/user/index.ts
import {createModel} from '@rematch/core'
import type {RootModel} from '../index'

interface UserState {
  userInfo: UserInfo | null
  loading: boolean
}

export const user = createModel<RootModel>()({
  state: {
    userInfo: null,
    loading: false,
  } as UserState,
  reducers: {
    setUserInfo(state, payload: UserInfo) {
      return {...state, userInfo: payload}
    },
    setLoading(state, payload: boolean) {
      return {...state, loading: payload}
    },
  },
  effects: dispatch => ({
    async fetchUserInfo() {
      dispatch.user.setLoading(true)
      try {
        const res = await getUserInfoApi()
        dispatch.user.setUserInfo(res.data)
      } finally {
        dispatch.user.setLoading(false)
      }
    },
  }),
})
```

### 组件中使用

```typescript
import {useSelector, useDispatch} from 'react-redux'
import type {RootState, Dispatch} from '@/store'

const UserPage: React.FC = () => {
  const dispatch = useDispatch<Dispatch>()
  const {userInfo, loading} = useSelector((state: RootState) => state.user)

  useEffect(() => {
    dispatch.user.fetchUserInfo()
  }, [])

  return <div>{userInfo?.name}</div>
}
```

## UI 组件库规范（Ant Design 5.13）

### 按需引入

```typescript
// 直接从 antd 引入，Rsbuild tree-shaking 会处理
import {Button, Table, Form, Input, message} from 'antd'
```

### Form 使用

```typescript
const [form] = Form.useForm<FormValues>()

<Form
  form={form}
  layout="vertical"
  onFinish={handleSubmit}
  initialValues={initialValues}>
  <Form.Item
    name="username"
    label="用户名"
    rules={[{required: true, message: '请输入用户名'}]}>
    <Input placeholder="请输入" />
  </Form.Item>
</Form>
```

### Table 使用

```typescript
const columns: ColumnsType<UserInfo> = [
  {title: '姓名', dataIndex: 'name', key: 'name'},
  {title: '年龄', dataIndex: 'age', key: 'age', sorter: true},
  {
    title: '操作',
    key: 'action',
    render: (_, record) => (
      <Space>
        <Button type="link" onClick={() => handleEdit(record.id)}>编辑</Button>
        <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" danger>删除</Button>
        </Popconfirm>
      </Space>
    ),
  },
]
```

### 日期组件

```typescript
// ✅ 正确：DatePicker 从 antd 引入，配合 dayjs
import {DatePicker} from 'antd'
import dayjs from 'dayjs'

<DatePicker value={dayjs(date)} onChange={(_, dateStr) => setDate(dateStr)} />

// ❌ 错误：使用 moment 或 CompactV4Moment（ESLint error）
import moment from 'moment'
import {DatePicker} from '@/components/CompactV4Moment'
```

### 反馈类组件

```typescript
// 全局提示统一使用 App.useApp() 获取（antd 5 推荐方式）
const {message, modal, notification} = App.useApp()

message.success('操作成功')
modal.confirm({
  title: '确认删除？',
  content: '删除后不可恢复',
  onOk: handleDelete,
})
```

## 接口请求规范

### 接口定义

```typescript
// src/api/user.ts
import request from './axios'

interface UserListParams {
  page: number
  pageSize: number
  keyword?: string
}

interface UserListResult {
  list: UserInfo[]
  total: number
}

/** 获取用户列表 */
export const getUserList = (params: UserListParams) =>
  request.get<UserListResult>('/api/user/list', {params})

/** 创建用户 */
export const createUser = (data: Omit<UserInfo, 'id'>) =>
  request.post<{id: number}>('/api/user/create', data)
```

### 错误处理

```typescript
// 统一在拦截器处理通用错误（401、500 等）
// 业务错误在调用处处理
try {
  const res = await createUser(values)
  message.success('创建成功')
} catch (err) {
  if (err.code === 'DUPLICATE_NAME') {
    form.setFields([{name: 'name', errors: ['名称已存在']}])
  }
}
```

## 样式规范

### CSS Modules + Less

```typescript
import styles from './UserCard.module.less'

<div className={styles.container}>
  <span className={styles.title}>{title}</span>
</div>
```

### 样式规则

- 组件样式使用 CSS Modules（`.module.less`）
- 全局样式放在 `src/style/` 下
- 不要使用内联样式，除非是动态计算值
- 不要直接覆盖 antd 组件的类名样式
- 响应式使用 antd 的 Grid 系统（Row/Col）
- 间距优先使用 antd 的 Space 组件或 token 变量

## Git 规范

### Commit Message

```
<type>(<scope>): <subject>

type: feat / fix / style / refactor / docs / chore / perf
示例：feat(user): 新增用户列表页面
```

### 分支规范

```
main / master   # 生产分支
develop         # 开发分支
feature/xxx     # 功能分支
hotfix/xxx      # 紧急修复
```

## 代码质量

### 通用原则

- 单个组件文件不超过 300 行，超出则拆分
- 单个函数不超过 50 行
- 组件 Props 不超过 10 个，超出考虑合并或拆分组件
- 嵌套深度不超过 6 层
- 回调嵌套不超过 3 层
- 不要在 render 中定义函数或对象
- 删除无用代码，不要注释保留

### 注释规范

```typescript
// 接口函数必须写 JSDoc
/** 获取用户列表 */
export const getUserList = () => { ... }

// 复杂逻辑写行内注释说明意图
// 按创建时间倒序，相同时间按优先级排序
const sorted = list.sort((a, b) => { ... })

// TODO/FIXME 标注待处理项
// TODO: 后续需要支持批量删除
// FIXME: 大数据量下性能有问题，需要虚拟滚动
```
