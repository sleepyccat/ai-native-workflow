# 单元测试框架配置

> 本文件为用户可编辑的参考配置，unit-testing 生成和运行测试时读取。
> 换团队/换技术栈时替换此文件即可。用户可新增任意配置项。

## 测试框架

- **测试运行器**：Jest
- **React 测试工具**：@testing-library/react + @testing-library/jest-dom + @testing-library/user-event
- **Mock 工具**：Jest 内置 mock（jest.mock/jest.fn/jest.spyOn）

> 如使用 Vitest，替换为：测试运行器 Vitest，Mock 工具 vi.mock/vi.fn/vi.spyOn

## 测试命令

```bash
# 运行所有测试
npx jest --passWithNoTests

# 运行单个测试文件
npx jest [文件路径] --no-coverage

# 运行测试并输出覆盖率
npx jest --coverage --coverageReporters=text-summary
```

## 测试文件匹配模式

```
src/**/*.test.{ts,tsx}
src/**/__tests__/**/*.{ts,tsx}
```

## 测试文件命名

- 与源文件同目录
- 命名规则：`[源文件名].test.ts` 或 `[源文件名].test.tsx`
- 示例：`src/hooks/useUserList.ts` → `src/hooks/useUserList.test.ts`

## Mock 策略

### 必须 Mock 的模块

| 模块 | Mock 方式 | 示例 |
|------|----------|------|
| `src/api/*` | jest.mock，返回可控的 Promise | `jest.mock('@/api/user')` |
| `react-redux` | jest.mock，提供 mock useSelector/useDispatch | `jest.mock('react-redux')` |
| `react-router-dom` | jest.mock，提供 mock navigate/useParams | `jest.mock('react-router-dom')` |
| `antd` 的 message/modal/notification | jest.mock `App.useApp` | `jest.mock('antd')` |

### 不 Mock 的模块

- 纯工具函数（`src/lib/*`、`src/utils/*`）：直接调用，测真实行为
- Rematch reducers：直接调用 reducer 函数，不需要 mock store
- 类型定义和常量：不需要 mock

### 组件测试 Mock 规则

- Mock 子组件：仅 mock 跨层级的子组件（减少渲染复杂度）
- 不 Mock 同层级子组件：保持组件树完整性
- Antd 组件：不 mock 基础组件（Button/Input 等），mock 复杂组件（Table/Form 的 submit 行为）

## 测试用例编写规范

### 结构模板

```typescript
import {render, screen, fireEvent, waitFor} from '@testing-library/react'
import '@testing-library/jest-dom'
import {useUserList} from './useUserList'

// Mock 声明区
jest.mock('@/api/user')

describe('useUserList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('fetchUserList', () => {
    it('should return user list on success', async () => {
      // arrange
      ;(getUserList as jest.Mock).mockResolvedValue({list: [], total: 0})
      // act
      // assert
    })

    it('should handle empty response', async () => {
      // ...
    })

    it('should handle api error', async () => {
      // ...
    })
  })
})
```

### 命名规范

- describe 命名：被测函数/Hook/组件名
- it 命名：`should [预期行为] when [条件]` 或简写 `should [预期行为]`
- 使用英文命名，与项目代码风格一致

### 断言规范

- DOM 元素：优先使用 `@testing-library/jest-dom` 的匹配器（`toBeVisible`/`toHaveTextContent`/`toBeDisabled` 等）
- 函数调用：使用 `toHaveBeenCalledWith`/`toHaveBeenLastCalledWith`
- 异步操作：使用 `waitFor` + 断言，不使用 `setTimeout`
- 快照测试：仅用于纯展示组件，且快照应精简（使用 `toJson` 序列化）

## 覆盖率阈值

| 维度 | 最低要求 | 说明 |
|------|----------|------|
| 语句覆盖率 | 60% | 新项目可从低阈值起步 |
| 分支覆盖率 | 50% | 重点覆盖核心业务分支 |
| 函数覆盖率 | 60% | 导出的公共函数必须覆盖 |
| 行覆盖率 | 60% | 与语句覆盖率基本一致 |

> 这些阈值为 CI 门禁的最低要求，单元测试生成时以覆盖核心逻辑为主，不追求 100% 覆盖率。

## 路径别名支持

Jest 配置中需映射项目的路径别名：

```javascript
// jest.config.js
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
  '^@@/(.*)$': '<rootDir>/src/components/$1',
}
```

## 特殊场景处理

### Rematch Model 测试

直接测试 reducer 函数，不需要创建完整 store：

```typescript
import {user} from '@/models/user'

describe('user reducer', () => {
  it('should set user info', () => {
    const nextState = user.reducers.setUserInfo(
      {userInfo: null, loading: false},
      {id: 1, name: 'test'}
    )
    expect(nextState.userInfo).toEqual({id: 1, name: 'test'})
  })
})
```

### React Hook 测试

使用 `renderHook` + `act`：

```typescript
import {renderHook, act} from '@testing-library/react'

const {result} = renderHook(() => useUserList())
await act(async () => {
  await result.current.fetchUserList()
})
expect(result.current.userList).toEqual([])
```

### Antd Form 组件测试

使用 `userEvent` 模拟用户交互，不直接操作 Form 实例：

```typescript
import userEvent from '@testing-library/user-event'

const user = userEvent.setup()
await user.type(screen.getByLabelText('用户名'), 'test')
await user.click(screen.getByRole('button', {name: '提交'}))
```

## 首次运行配置

如果项目中不存在 `jest.config.js` 或 `vitest.config.ts`，执行以下步骤：

1. 安装依赖：
```bash
npm install --save-dev jest @types/jest ts-jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

2. 创建 `jest.config.js`：
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(less|css)$': 'identity-obj-proxy',
  },
  setupFilesAfterSetup: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
}
```

3. 创建 `jest.setup.ts`：
```typescript
import '@testing-library/jest-dom'
```

4. 在 `package.json` 中添加脚本：
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```
