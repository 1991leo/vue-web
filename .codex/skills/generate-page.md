---
name: generate-page
description: Use this skill when generating or refactoring VUE-WEB project pages from screenshots, prototypes, interface documents, or existing page references. It focuses on current VUE-WEB visual style, Vue 3 UI, complete interaction flows, and normalized src/api/manage calls for manage business modules.
---

# VUE-WEB 页面生成

用于根据截图、原型、接口文档或业务说明，在 VUE-WEB 中生成或改造 `src/views/manage` 业务页面，并补齐 `src/api/manage` 接口封装与类型定义。

## 核心原则

- 当前系统风格优先于原型视觉：保留业务字段、层级、流程和交互意图，不照搬原型的导航、配色、圆角、阴影和布局外壳。
- 新业务页面统一放在 `src/views/manage`，新业务 API 统一放在 `src/api/manage`；`src/views/systemCore` 和 `src/api/system` 只用于平台基础能力。
- 优先复用公共组件、公共 hooks、权限指令、字典、store 和插件能力，避免重复造轮子。
- 搜索、分页、重置、新建、编辑、详情、删除、返回、弹窗提交、状态切换、刷新和权限控制必须形成闭环。
- 代码命名遵循 camelCase，类型和组件名遵循 PascalCase；新增类型必须明确建模，禁止滥用 `any`。

## 适用场景

- 根据页面截图、原型图、字段表、接口文档、菜单名或业务说明生成页面。
- 将旧页面或外部原型改造成 VUE-WEB 当前风格。
- 参考旧 `collaboration`、`operations`、`cockpit` 等页面范式实现新业务，但新代码仍落到 `src/views/manage`。
- 补齐页面对应 API、类型、字典、分页、弹窗、详情或业务操作链路。

## 必读上下文

开始前按需读取，不要凭空套模板：

- `AGENTS.md`：协作、注释、权限、若依接口和命名规则。
- `docs/公共组件使用说明文档.md`：公共组件 API 和视觉约束。
- `docs/公共能力目录说明.md`：公共能力职责边界。
- `docs/主题切换操作手册.md`：主题 token、硬编码禁用项和样式约束。
- 相关旧页面只作风格参考：`systemCore/collaboration/coordinate`、`tracking`、`projects`、`review`，`systemCore/operations/control`、`deptTask`、`weekly`、`calendar`。
- 本次会调用或修改的 `src/api/manage/**`、`types.ts`、hooks、工具函数和路由配置。

## 公共能力优先级

- 页面布局：`FormPageLayout`、`DetailPageLayout`、`PageTitle`、`CommonDivider`。
- 列表查询：`SearchHeader`、`CommonTable`、`TableList`、`Pagination`、`HeaderTabs`、`PriorityCard`。
- 业务展示：`DictTag`、`CommonTimeline`、`FilePreview`、`ImagePreview`、`MediaPreviewList`。
- 业务选择：`UserSelect`、`RoleSelect`。
- 逻辑能力：`usePagination`、`useLoading`、`useDialog`、`useCrudView`。
- 权限能力：模板用 `v-hasPermi` / `v-hasRoles`，逻辑判断用 `checkPermi` / `checkRole`。

## 目录规范

新增业务优先按接口模块创建：

```text
src/api/manage/{moduleName}/
├── index.ts
└── types.ts

src/views/manage/{category}/{featureName}/
├── index.vue
├── create.vue
├── detail.vue
├── config.ts
└── components/
```

规则：

- `index.vue` 承载列表入口和视图切换。
- `create.vue`、`detail.vue` 承载表单和详情。
- 复杂弹窗、卡片、子流程放 `components/`。
- 枚举、列配置、搜索项、状态映射和默认数据放 `config.ts`。
- 平台基础能力才继续使用 `src/api/system`。

## API 规范

`types.ts` 按接口文档建模：

- `XxxVO`：列表项和详情数据。
- `XxxForm`：新增、编辑提交表单。
- `XxxQuery`：查询参数，分页字段使用 `pageNum` / `pageSize`。
- `params?: Record<string, unknown>`，不要用 `Record<string, any>`。

`index.ts` 只负责请求封装：

- 使用 `@/utils/request`。
- CRUD 命名：`listXxx`、`getXxx`、`addXxx`、`updateXxx`、`delXxx`。
- 列表响应取 `res.rows` / `res.total`。
- 详情响应取 `res.data`。
- 文件下载使用项目 `$download` 或既有下载封装。
- 子资源按业务语义拆函数，例如统计、日志、里程碑、状态推进、导出。

## 页面实现流程

### 1. 原型与接口拆解

先识别页面类型、业务对象、主字段、状态枚举、金额/日期/人员/部门/附件、交互链路、信息层级和接口契约。

原型视觉与系统不一致时：

- 不还原原型顶部导航、侧边栏、背景装饰和独立页面外壳。
- 不迁移旧版按钮、表格、输入框、圆角、阴影和渐变。
- 业务状态色集中映射到状态 class 或配置，不散落到模板行内样式。

### 2. 建立展示模型

接口字段和页面字段不一致时，先写适配器：

```ts
function mapToViewItem(row: ModuleVO): ViewItem {
  return {
    id: String(row.id ?? ''),
    title: row.title ?? '',
    status: row.status ?? '0'
  };
}
```

规则：

- 模板只读取稳定的前端展示模型。
- 状态码、文案、图标、样式类集中维护。
- 提交 payload 用 `buildPayload` 一类方法统一组装。
- 枚举不确定时优先使用接口或字典数据，必要时提供 fallback 并在最终回复说明假设。

### 3. 列表页

- 标准顺序：`PageTitle`、`SearchHeader`、`CommonDivider`、操作区、内容区、分页区。
- 表格页优先用 `CommonTable`；复杂表格可用 `TableList`。
- 卡片页优先用 `PriorityCard`，只定制卡片内部业务信息。
- 状态统计用 `HeaderTabs`，统计接口独立请求，切换时同步查询参数并回到第一页。
- 搜索项用 `computed` 适配字典响应式。
- 分页使用 `usePagination` 或项目既有分页写法。
- 新增、编辑、删除、导出等按钮必须补权限标识。

### 4. 表单页

- 优先使用 `FormPageLayout`，特殊业务头部才做自定义布局。
- 表单使用 `label-position="top"`；两列网格，长文本、附件、备注、描述占满整行。
- 子组件只负责本地表单、校验和 `emit('submit', formData)`。
- 父组件统一调用 API、提示、刷新列表和切换视图。
- 编辑回显用 `watch` 或 `initForm` 复制 props，避免直接修改 props。
- 关联下拉、远程选项、互斥选择要覆盖基础校验。

### 5. 详情页

- 优先使用 `DetailPageLayout`。
- 常见结构为返回、标题、状态标签、基础信息、描述、业务动作、右侧时间线或日志。
- 时间线统一适配为 `CommonTimeline` 的 `{ time, label, type, user, content }`。
- 内联编辑必须复制详情数据到本地表单。
- 阶段推进、添加日志、创建里程碑等业务动作通过 emit 交给父组件调用 API。

### 6. 弹窗与子流程

- 复杂弹窗拆到 `components/*Dialog.vue`。
- 弹窗通过 `v-model` 控制显隐，提交后只抛数据。
- 父组件负责 API、刷新、错误提示和详情同步。

## 字典与权限

- 字典优先使用 `useDict` 或 `getDicts`，高频字典可接入 `useDictStore`。
- 查询项、表单项和状态标签尽量共用同一组选项。
- 不要在模板中散落大量三元表达式处理字典。
- 权限标识格式为 `模块:实体:操作`，如 `base:module:add`。
- 指令值必须是非空数组；与 `v-if` 同用时，`v-if` 管业务可见性，`v-hasPermi` 管权限。

## 样式规则

- 使用 `<style scoped lang="scss">`。
- 主体列表容器通常 `height: 100%; overflow: hidden;`。
- 创建和详情视图允许内部 `overflow-y: auto`。
- 大白卡片通常 `background: #fff; border-radius: 20px; padding: 30px;`。
- 小业务卡片通常 `border-radius: 8px` 到 `12px`。
- 主题色使用 CSS 变量：`var(--el-color-primary)`、`var(--el-color-primary-light-*)`、`rgba(var(--el-color-primary-rgb), n)`。
- 禁止硬编码主题主色：`#409eff`、`#00b46e`、`rgba(64, 158, 255, ...)`。
- `1200px` 以下表单和详情分栏降为单列，固定高度区域设置 `min-height: 0`。
- 不做营销式 hero、大面积装饰渐变或与管理后台不匹配的视觉。

## 注释规则

- 注释使用简体中文。
- 只注释“为什么”，不注释显而易见的“是什么”。
- 后端枚举、特殊字段、fallback、兼容逻辑、跨模块跳转参数需要简短注释。
- 禁止写 `// 获取列表`、`// 定义变量`、`// 点击事件` 等无意义注释。
- TODO 使用 `// TODO(姓名): 说明`。

## 验收清单

完成后检查：

- 页面路径、组件导入、API 导入和类型导入正确。
- 搜索、分页、重置、新建、编辑、详情、删除、返回、弹窗提交链路完整。
- 新增、编辑、删除、导出等按钮已接权限。
- 列表接口正确处理 `rows` 和 `total`，详情接口正确处理 `data`。
- 字典失败时有合理空态或 fallback。
- 状态码、状态文案、状态 class、图标映射集中维护。
- 表单校验覆盖必填项、互斥项和接口必传项。
- 响应式布局在 `1200px` 以下不挤压。
- 原型视觉已按当前系统风格统一，而不是照搬旧视觉。
- 运行项目实际检查命令，例如 `pnpm exec vue-tsc --noEmit`、`pnpm run lint:eslint`。

最终回复说明修改内容、参考依据、默认假设、验证命令及结果；如未运行验证，说明原因和残余风险。
