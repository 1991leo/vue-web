# VUE-Web 协作规则

## 沟通

- 默认使用简体中文回复；专有名词、接口字段、文件名和技术名词保留源语言。
- 代码命名遵循 camelCase，类型和组件名遵循项目已有 PascalCase 习惯。
- 修改或生成代码时添加简洁、必要的中文注释，避免无意义注释。
- 实现前先读相关页面、接口和文档；实现后检查导入、类型、交互链路和样式。

## 项目简介

VUE-Web 是基于若依 Vue3 + Element Plus + TypeScript + SCSS + Vite 的国资数字化管理平台前端工程。

重点目录：

- `src/layout`：主布局和大屏布局。
- `src/views/manage`：后续新增业务页面统一目录，页面风格沿用旧 `systemCore/operations`、`systemCore/cockpit`、`systemCore/collaboration` 的管理后台范式。
- `src/views/systemCore`：平台、系统、权限、流程、租户、字典等基础能力页面；旧业务目录仅作为迁移前参考，后续不再新增业务页面。
- `src/api/manage`：后续新增业务接口封装和类型定义，目录与 `src/views/manage` 业务模块对照。
- `src/api/system`：平台、系统、权限、字典、租户等基础能力接口。
- `src/components`：项目公共组件。
- `src/directive`：全局自定义指令，包含权限与复制文本等通用能力。
- `src/enums`：语言、菜单、导航、响应码、侧边栏主题等全局枚举。
- `src/hooks`：列表分页、loading、防重复提交、弹窗、CRUD 视图切换等组合式函数。
- `src/plugins`：全局挂载插件能力，如 modal、download、tab、cache、auth、svgicon。
- `src/router`：路由初始化、动态路由、基础路由与错误页路由。
- `src/store`：Pinia 全局状态，包含用户、权限、字典、设置、标签页、通知等模块。
- `src/utils`：request、permission、ruoyi、theme、dict、auth、validate、websocket、sse 等公共工具。
- `docs`：公共组件、公共能力目录、主题等项目说明文档。
- `.codex/skills/generate-page.md`：根据截图和接口文档生成高保真页面与规范接口调用的项目级 skill。

## 开发原则

- 最重要：优先复用公共组件、已有页面风格和项目 API 封装方式，禁止重复造轮子。
- 主题色和系列色使用 `src/theme/index.ts` 集中配置，并通过 `src/utils/theme.ts` 写入全局 CSS 变量；业务状态色集中映射，避免散落在模板和样式中。
- 后续只调整主题风格时，页面布局风格保持不变，优先修改 `src/theme/index.ts` 的色系、圆角、阴影等 token；仅运行时主色默认值由 `src/settings.ts` 的 `theme` 引用主题 token，避免重写页面结构、卡片层级、间距和组件 API。
- 列表、搜索、分页、新建、编辑、详情、删除、弹窗、返回等链路要能实际串起来。

## 页面与接口创建规则

- 新增业务页面统一创建在 `src/views/manage/<业务域>/<功能名>`；不要在 `src/views/systemCore/operations`、`src/views/systemCore/cockpit`、`src/views/systemCore/collaboration` 下继续新增业务页面。
- 新增业务 API 统一创建在 `src/api/manage/<模块名>/index.ts`，类型创建在同目录 `types.ts`。
- `src/views/systemCore` 与 `src/api/system` 仅用于平台基础能力：用户、角色、菜单、字典、租户、流程、系统监控、平台配置等。
- 旧 `systemCore/operations`、`systemCore/cockpit`、`systemCore/collaboration` 页面后续会删除；开发新页面时只参考其列表、卡片、表单、详情、看板等风格，不复制其目录归属。
- 业务页面推荐结构：`index.vue` 作为列表/入口，`create.vue`、`detail.vue` 承载表单与详情，复杂流程放 `components/`，枚举、列配置、状态映射放 `config.ts`。

## 代码注释规范

- **只注释"为什么"，不注释"是什么"**：好的命名已经说明代码做了什么，注释应解释隐藏约束、非直觉行为或特定场景的取舍原因。
- **禁止无意义注释**：如 `// 获取列表`、`// 定义变量` 等描述显而易见逻辑的注释一律不写。
- **函数/方法注释**：仅在逻辑复杂、入参含义不明或有副作用时添加简短说明，一行为宜，禁止写多行 JSDoc 块。
- **业务特殊逻辑必须注释**：绕过框架默认行为、临时 workaround、与后端约定的特殊字段或枚举值，需注明原因（如 `// 后端枚举 0=草稿 1=已发布，前端不可自行扩展`）。
- **TODO 格式统一**：`// TODO(姓名): 说明` — 必须写清楚负责人和待办原因，禁止裸写 `// TODO`。
- **注释语言**：与项目默认语言一致，使用简体中文；专有名词、字段名保留原样。

## 按钮权限

新增、编辑、删除、导出等操作按钮统一接入权限控制，权限标识格式为 `模块:实体:操作`（如 `base:weeklyReportConfig:add`）。

- 模板按钮用指令控制：`v-hasPermi="['base:weeklyReportConfig:add']"`（按钮权限）、`v-hasRoles="['admin']"`（角色权限）。无权限时指令会直接移除该节点。
- 指令值必须为非空数组，否则会抛错；`*:*:*` 表示拥有全部权限。
- 与 `v-if` 同用时，`v-if` 控制业务可见性、`v-hasPermi` 控制权限，二者独立判断。
- 在 JS 逻辑中做权限判断时使用工具函数 `checkPermi(['...'])` / `checkRole(['...'])`（来自 `@/utils/permission`），返回布尔值，适合非按钮场景（如条件分支、动态列）。
- 指令在 `src/directive/permission`，已全局注册；新增按钮请参照旧业务页的权限写法补齐权限标识，但新代码必须落到 `src/views/manage`。

## 若依开发常用知识

本工程基于若依（RuoYi-Vue3）规范，常用约定如下：

### 请求与响应

- 统一使用 `@/utils/request` 发起请求，已封装 `baseURL`（`VITE_APP_BASE_API`）、自动携带 `Bearer` token，并按业务 `code` 统一处理：`200` 成功、`401` 失效跳登录、`500` 错误提示、`601` 警告提示。
- 拦截器返回的是后端 `res.data`（即 `{ code, msg, data }` 或列表的 `{ code, msg, rows, total }`），业务代码直接取 `res.data` / `res.rows` / `res.total`，无需再解一层 axios。
- 需要跳过 token 时在请求头设 `isToken: false`；文件下载用 `responseType: 'blob'`，拦截器会自动放行二进制流。

### API 封装模式

- 新增业务接口按模块放在 `src/api/manage/<模块>/index.ts`，类型放同目录 `types.ts`（`XxxVO` 列表项、`XxxForm` 表单、`XxxQuery` 查询参数）；平台基础能力接口继续放 `src/api/system`。
- CRUD 命名固定：`listXxx`(get/list)、`getXxx`(get/`/{id}`)、`addXxx`(post)、`updateXxx`(put)、`delXxx`(delete/`/{ids}`)。
- 分页参数用 `pageNum` / `pageSize`，列表响应取 `rows` 与 `total`。

### 字典

- 用 `useDict('sys_normal_disable', 'sys_xxx')` 响应式获取字典，返回 `{ 字典类型: DictDataOption[] }`，已做缓存。
- 模板回显标签用 `selectDictLabel(dictArr, value)`（`@/utils/ruoyi`）；业务状态色建议集中映射，避免散落。

### 常用工具（`@/utils/ruoyi`）

- `parseTime(time, pattern)` 时间格式化；`addDateRange(params, dateRange, propName)` 拼接日期范围查询；
- `handleTree(data, id, parentId, children)` 列表转树；`tansParams(params)` 拼接 GET 参数。

### Store 与权限数据

- `useUserStore()` 提供 `userId` / `deptId` / `nickname` / `roles` / `permissions`，按钮权限判断基于 `permissions`，角色判断基于 `roles`。

### 项目 hooks

- `usePagination(fetchFn, pageSize)`：返回 `currentPage` / `pageSize` / `total`，页码变化自动触发 `fetchFn`。
- `useLoading(asyncFn)`：返回 `{ loading, run }`，用于防重复提交并托管 loading。
- `useDialog`：统一弹窗开关与状态管理。

---

## AI 代码生成与工程化规范

### 类型安全性与代码纯净度（针对 AI 的特殊规范）

虽然项目本地的部分 TS 校验规则（如 `noImplicitAny` 和 `strictNullChecks`）在编译选项中被设置为宽松模式，但 **AI 在生成新代码时必须采用高标准的类型约束**：

1. **禁止滥用 any**：除与老旧系统交互等不可抗力外，所有声明必须定义明确的 TypeScript 类型。新增业务接口必须在 `src/api/manage/<模块>/types.ts` 中声明，平台基础接口才放 `src/api/system/<模块>/types.ts`。
2. **空指针安全与可选链**：在处理异步请求数据、嵌套对象属性读取时，**必须使用可选链 `?.`** 进行防空指针崩溃处理，以确保运行时的健壮性。
3. **清理死代码**：AI 生成或修改完代码后，必须检查并清理无用的 imports 和未使用的变量（unused-vars），保持文件纯净度。
4. **安全断言**：尽量避免盲目使用 `as` 绕过类型检查，优先通过类型守卫或接口声明解决。

### 核心公共组件复用规范（禁止重复造轮子）

为保持平台视觉统一，AI 生成页面时**必须强制复用**以下已封装的公共组件（具体 API 见 [公共组件使用说明文档.md](./docs/%E5%85%AC%E5%85%B1%E7%BB%84%E4%BB%B6%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E%E6%96%87%E6%A1%A3.md)，公共目录边界见 [公共能力目录说明.md](./docs/%E5%85%AC%E5%85%B1%E8%83%BD%E5%8A%9B%E7%9B%AE%E5%BD%95%E8%AF%B4%E6%98%8E.md)）：

- **页面布局**：表单编辑使用 `FormPageLayout`；数据详情使用 `DetailPageLayout`；页面标题使用 `PageTitle`；满宽分割线使用 `CommonDivider`。
- **列表与查询**：配置化搜索栏使用 `SearchHeader`；数据表格使用 `CommonTable`；分页展示使用 `Pagination`。
- **文件与媒体处理**：文件上传使用 `FileUpload`；图片上传使用 `ImageUpload`；文件与图片预览使用 `FilePreview`、`ImagePreview` 及 `MediaPreviewList`。
- **业务选择与数据回显**：人员选择使用 `UserSelect`；角色选择使用 `RoleSelect`；字典回显标签使用 `DictTag`；时间线使用 `CommonTimeline`。

### 项目 Hooks 与单元测试规范

1. **组合式函数（Hooks）**：AI 编写逻辑时应熟练使用 `src/hooks` 目录下的组合式函数，如 `usePagination` (分页状态管理)、`useLoading` (防止按钮重复点击的 loading 包裹器)、`useDialog` (弹窗开关状态重置)、`useCrudView` (管理 CRUD 视图切换与路由参数清理)。
2. **单元测试（Vitest）**：当在 `src/utils` 或核心公共 hooks 中编写非 DOM 的复杂算法、数据格式化函数、转换工具时，必须在其同级目录下创建 `__tests__` 文件夹并编写配套的 Vitest 单元测试，确保测试可全部通过。
