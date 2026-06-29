---
name: generate-page
description: Use this skill when generating or refactoring VUE-WEB project pages from screenshots, prototypes, interface documents, or existing page references. It focuses on current VUE-WEB visual style, Vue 3 UI, complete interaction flows, and normalized src/api/manage calls for manage business modules.
---

# VUE-WEB 页面生成与风格统一

用于根据页面截图、原型说明、接口文档和业务描述，在 VUE-WEB 中生成或改造 `src/views/manage` 业务页面，同时补齐规范的 `src/api/manage` 接口调用与类型定义。

最重要原则：

- **项目风格优先于原型视觉**：原型或原型图与当前系统风格不一致时，只提取原型的业务内容、字段、层级、流程和交互意图，不照搬原型的旧版配色、圆角、阴影、导航、卡片样式或布局外壳。
- **页面必须落到新业务目录**：新增业务页面统一创建在 `src/views/manage`，新增业务 API 统一创建在 `src/api/manage`；`src/views/systemCore` 和 `src/api/system` 只用于平台基础能力。
- **页面必须落到现有范式**：列表、卡片、表单、详情、弹窗、看板、日历、工作台等页面，优先复用公共组件；旧 `systemCore/operations`、`systemCore/cockpit`、`systemCore/collaboration` 只作为迁移前风格参考，后续会删除。
- **复用公共组件**：优先使用 `HeaderTabs`、`PageTitle`、`SearchHeader`、`CommonDivider`、`CommonTable`、`TableList`、`Pagination`、`PriorityCard`、`FormPageLayout`、`DetailPageLayout`、`CommonTimeline` 等组件。
- **复用公共能力**：权限使用 `src/directive/permission` 或 `@/utils/permission`，分页/loading/弹窗/CRUD 视图切换优先用 `src/hooks`，全局弹窗/下载/页签/缓存优先用 `src/plugins`，用户/权限/字典/设置状态优先用 `src/store`。
- **交互闭环**：搜索、分页、重置、新建、编辑、详情、删除、返回、弹窗提交、状态切换、刷新和权限控制必须能串起来。
- **接口规范**：页面只通过 API 层调用后端，业务接口和类型优先放在 `src/api/manage/{moduleName}/index.ts` 与 `types.ts`。

## 触发场景

- 用户提供页面截图、原型图、原型说明、字段表、接口文档、菜单名或业务说明，要求生成页面。
- 用户要求页面参照 `collaboration`、`operations`、`cockpit`、`coordinate`、`tracking`、`control` 等旧页面风格，但新页面仍必须创建到 `src/views/manage`。
- 用户要求把旧风格页面或外部原型改造成 VUE-WEB 当前风格。
- 用户要求补齐页面对应 API、类型、字典、分页、弹窗、详情或业务操作链路。

## 必读上下文

开始前按需读取以下文件，不要凭空套模板：

- `AGENTS.md`：项目协作、注释、权限、若依接口和命名规则。
- `docs/公共组件使用说明文档.md`：公共组件 API 和视觉约束。
- `docs/公共能力目录说明.md`：`components/directive/enums/hooks/plugins/router/store/utils` 的职责边界和复用规则。
- `docs/主题切换操作手册.md`：主题 token、硬编码禁用项和样式引入约束。
- 旧 `src/views/systemCore/collaboration/coordinate`：标准表格列表、协调事项创建和详情参考，仅作风格参考。
- 旧 `src/views/systemCore/collaboration/tracking`：卡片列表、复杂详情、阶段推进、里程碑和跨模块联动参考，仅作风格参考。
- 旧 `src/views/systemCore/collaboration/projects`、`review`：复杂业务拆分组件、配置文件和多视图参考，仅作风格参考。
- 旧 `src/views/systemCore/operations/control`：状态 Tabs、任务卡片、重点任务 CRUD、详情时间线参考，仅作风格参考。
- 旧 `src/views/systemCore/operations/deptTask`：`HeaderTabs` + `TableList` 的任务台表格参考，仅作风格参考。
- 旧 `src/views/systemCore/operations/weekly`：运营工作板、顶部 banner、分段 tab 和全高滚动参考，仅作风格参考。
- 旧 `src/views/systemCore/operations/calendar`：日历、侧边栏、任务详情和组合布局参考，仅作风格参考。
- 本次会调用的 `src/api/manage/**`、`types.ts`、相关 hooks 和工具函数。

## 原型处理规则

### 内容提取

先拆解原型信息，再决定如何映射到现有风格：

- 页面类型：列表、表格页、卡片页、表单页、详情页、弹窗、看板、日历、工作台、统计页或组合页。
- 业务对象：实体名称、状态、主字段、辅助字段、枚举、金额、日期、人员、部门、企业、附件和备注。
- 交互链路：搜索、筛选、分页、新增、编辑、查看、删除、导出、导入、提交、审批、推进、归档、返回。
- 信息层级：页面标题、筛选区、操作区、主要内容、辅助信息、时间线、统计区、右侧栏。
- 接口契约：列表、详情、创建、更新、删除、统计、日志、里程碑、导出等接口。

### 风格统一

当原型和当前系统不一致时，执行以下转换：

- 原型的顶部导航、侧边菜单、面包屑、背景、装饰图形通常不还原，使用当前路由和主布局承载页面。
- 原型中的旧版圆角、阴影、渐变、表格、按钮、输入框样式不直接迁移，改用 Element Plus 和项目公共组件。
- 原型中的卡片内容可以保留，但卡片外观优先使用 `PriorityCard`、白色大卡片或当前页面已有卡片规范。
- 原型中的状态色只作为语义参考，最终色值集中映射到状态 class，主题主色使用 CSS 变量。
- 原型中的复杂流程保留业务步骤，但交互承载方式优先选择当前系统已有的 `HeaderTabs`、弹窗、详情页、右侧时间线或子组件。
- 后续只修改主题风格时，优先调整 `src/theme/index.ts` 的色系、圆角、阴影等 token；页面布局风格、公共组件 API、卡片层级、列表顺序、表单栅格和详情分栏保持不变。

最终页面应该看起来像 VUE-WEB 当前页面，而不是像原型工具导出的独立页面。

## 当前页面风格基线

### 标准列表页

适用于大多数 CRUD 列表：

```vue
<div class="feature-container" :class="`view-${currentView}`">
  <template v-if="currentView === 'list'">
    <div class="list-page">
      <PageTitle title="页面标题" />
      <SearchHeader :form-items="searchFields" @form-data-change="handleSearch" @form-data-reset="handleReset" />
      <CommonDivider :offset="30" />
      <div class="action-row">
        <el-button type="primary" v-hasPermi="['base:entity:add']" @click="handleCreate">新建</el-button>
      </div>
      <CommonTable :data="tableData" :columns="tableColumns" :loading="loading" />
      <div class="pager-row">
        <Pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" paginationType="success" />
      </div>
    </div>
  </template>
</div>
```

布局特征：

- 页面容器通常 `height: 100%; overflow: hidden;`。
- 白色主卡片 `border-radius: 20px; padding: 30px; background: #fff;`。
- 顺序固定为 `PageTitle`、`SearchHeader`、`CommonDivider`、操作区、内容区、分页区。
- 表格优先使用 `CommonTable`；需要复杂插槽、索引列、排序或项目已有配置时可使用 `TableList`。
- 分页统一使用 `Pagination`，业务页面常用 `paginationType="success"`。

### 状态 Tabs + 主卡片页

适用于任务、统计状态筛选和运营管理页面，可临时参考旧 `operations/control`、`operations/deptTask`、`operations/dashboard`：

- 顶部 `HeaderTabs` 放在主卡片外，作为浅背景上的状态筛选。
- 主内容用白色大卡片承载，卡片内部仍遵循标题、搜索、分割线、操作区、内容、分页。
- Tabs 的统计值来自统计接口，切换时同步更新查询参数并回到第一页。

### 卡片列表页

适用于项目、重点任务、优先级强的业务：

- 优先使用 `PriorityCard`，它已内置高中低/集团重点/公司重点/一般项目背景和 hover 过渡。
- 卡片内部常见结构为标题区、状态角标、描述、信息行、底部日期或预警、hover 操作入口。
- 点击卡片进入详情；编辑、删除等操作使用独立按钮并 `@click.stop`。
- 空态用 `el-empty`，列表加载用内容区域 `v-loading`。

### 表单页

优先使用 `FormPageLayout`，可临时参考旧 `operations/control/create.vue`：

- 标题和描述由 layout 承载，表单内容放默认插槽，底部操作放 `#actions`。
- `el-form` 使用 `label-position="top"`。
- 两列字段使用 `.form-grid`，长文本、附件、备注、描述占满整行。
- 编辑回显通过 `watch` 或 `initForm` 将 props 复制到本地表单，禁止直接修改 props。
- 提交前用 `FormInstance.validate`，父组件统一调用 API、提示消息、刷新和返回。

### 详情页

优先使用 `DetailPageLayout`，可临时参考旧 `operations/control/detail.vue` 和 `collaboration/tracking/detail.vue`：

- 头部包含返回按钮、标题、状态标签；状态样式用 `statusClass`。
- 详情大卡片内部由业务自定义，常见为左右分栏：左侧基础信息、描述、业务动作；右侧时间线、日志、进度或辅助信息。
- 时间线统一适配为 `CommonTimeline` 的 `{ time, label, type, user, content }`。
- 详情中的业务动作通过 emit 抛给父组件，由父组件调用 API 并刷新详情。

### 工作板、周报、日历和大组合页

适用于运营驾驶舱、周报、日历等非标准 CRUD：

- 可以使用全高布局，但仍保持白色内容区、圆角、浅背景和紧凑信息密度。
- 周报类页面可临时参考旧 `operations/weekly`：顶部 summary banner、工具栏、分段 tab、内容板。
- 日历类页面可临时参考旧 `operations/calendar`：侧边栏 + 主日历视图 + 任务详情，保证内部滚动和固定高度。
- Dashboard 可临时参考旧 `operations/dashboard` 与 `cockpit`：统计卡片、任务卡片和状态 Tabs 组合，不做营销式大 hero。

## 现有页面参考

### coordinate：协调支持事项

适合参考：

- `PageTitle` + `SearchHeader` + `CommonDivider` + `CommonTable` + `Pagination` 的标准表格列表。
- 新建页的自定义高保真表单卡片，当 `FormPageLayout` 无法满足截图里的业务头部时再参考。
- 详情页左右分栏，左侧描述和处理表单，右侧 `CommonTimeline`。
- 路由 query 带入初始值，支持从其他模块跳转创建协调事项。
- `mapToSupportItem` 一类适配器隔离后端字段和前端渲染模型。

### tracking：项目全生命周期

适合参考：

- `PriorityCard` 网格、阶段角标、金额展示、企业信息。
- `DetailPageLayout` + 基础信息内联编辑 + 阶段进度 + 里程碑 + 协调事项 + 动态时间线。
- 非 CRUD 动作：阶段推进、添加日志、添加/编辑/删除里程碑。
- 跨模块联动：从项目详情跳转到协调事项创建页。
- 字典兜底：接口字典失败时使用本地 fallback，保证页面可用。

### control：年度重点任务

适合参考：

- 顶部 `HeaderTabs` 状态统计和列表筛选。
- `PriorityCard` 任务卡片网格、优先级视觉、卡片悬浮操作。
- 新建/编辑复用 `FormPageLayout`。
- 详情复用 `DetailPageLayout`，右侧使用 `CommonTimeline`。
- 标准 API 目录：`src/api/manage/importantTask/index.ts` + `types.ts`。

### deptTask：部门任务

适合参考：

- `HeaderTabs` + 白色主面板 + `SearchHeader` + `TableList` 的表格型任务管理。
- 配置文件拆分：字段、状态 tabs、搜索项、表格列可放入 `config.ts`。
- 人员头像、协同人员、优先级 badge、逾期提示等表格单元格插槽。
- 路由 query 控制新建/编辑模式，复杂表单可拆到 `components/TaskCreateCard.vue`。

### weekly：工作周报

适合参考：

- 全高工作台式布局，顶部 summary banner，底部任务板内部滚动。
- 页内 tab 和 section tab 用按钮实现，但视觉必须贴近现有周报样式。
- 导出按钮接权限，如 `v-hasPermi="['base:weeklyReport:export']"`。

### projects/review

适合参考：

- 多子视图和复杂业务流程拆成 `components/*Page.vue`。
- `config.ts` 集中放枚举、列配置、字段配置、状态映射和默认数据。
- 父组件负责视图切换、接口调用、刷新和权限判断，子组件负责展示和 emit。

## 目录与命名

优先按接口模块创建：

```text
src/api/manage/{moduleName}/
├── index.ts
└── types.ts

src/views/manage/{category}/{featureName}/
├── index.vue
├── create.vue
├── detail.vue
└── components/
```

如果既有项目已有单文件 API（如旧 `src/api/system/coordination.ts`）或接口位于其他既有目录，迁移旧页面时可以尊重现状；新业务模块必须使用 `src/api/manage/{moduleName}` 目录式 API。平台基础能力才继续使用 `src/api/system`。

命名要求：

- 变量、函数、事件、字段适配方法使用 camelCase。
- 类型、接口、组件使用 PascalCase。
- 视图状态可用 `type ViewMode = 'list' | 'create' | 'detail'`。
- 事件处理函数使用 `handleSearch`、`handleReset`、`handleCreate`、`handleEdit`、`handleView`、`handleDelete`、`goBackToList`、`submitForm` 等项目习惯。
- 复杂页面的配置数据优先放 `config.ts`，避免模板和脚本堆积。

## API 层规范

`types.ts` 按接口文档定义，不用 `any` 逃避字段建模：

```ts
export interface ModuleVO extends BaseEntity {
  id?: string | number;
}

export interface ModuleQuery extends Partial<PageQuery> {
  orderByColumn?: string;
  isAsc?: string;
  params?: Record<string, any>;
}

export interface ModuleForm {
  id?: string | number;
}
```

`index.ts` 只负责请求封装：

```ts
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ModuleForm, ModuleQuery, ModuleVO } from './types';

export function listModule(query: ModuleQuery): AxiosPromise<ModuleVO[]> {
  return request({
    url: '/base/module/list',
    method: 'get',
    params: query
  });
}

export function getModule(id: string | number): AxiosPromise<ModuleVO> {
  return request({
    url: `/base/module/${id}`,
    method: 'get'
  });
}

export function addModule(data: ModuleForm): AxiosPromise<void> {
  return request({
    url: '/base/module',
    method: 'post',
    data
  });
}
```

有子资源时按接口语义拆函数，例如：

- `getModuleStatistics(query)`
- `advanceProject(id, stage)`
- `addProjectTimeline(projectId, data)`
- `updateProjectMilestone(data)`
- `updateProjectMilestoneStatus(id, status)`
- `exportModule(query)`

请求和响应遵循若依约定：

- 列表响应取 `res.rows` 与 `res.total`。
- 详情响应取 `res.data`。
- 分页参数使用 `pageNum` / `pageSize`。
- 文件下载使用项目 `$download` 或既有下载封装。

## 页面生成流程

### 1. 建立前端展示模型

接口字段和页面字段不一致时，先写适配器：

```ts
function mapToViewItem(row: ModuleVO): ViewItem {
  return {
    id: String(row.id || ''),
    title: row.title || '',
    status: row.status || '0'
  };
}
```

规则：

- 模板只读稳定的前端模型，避免到处写 `row.xxxName || row.xxx`。
- 状态码、图标、文案、样式类集中在映射函数、常量 map 或 `config.ts`。
- 后端提交 payload 由 `buildPayload` 一类方法统一组装。
- 枚举值不确定时优先使用接口/字典数据，缺失时提供 fallback 并在最终回复说明假设。

### 2. 列表页

根据业务选择表格或卡片：

- 表格页优先复用 `CommonTable`；复杂表格可复用 `TableList`。
- 卡片页优先复用 `PriorityCard`，只定制卡片内部信息结构。
- 有状态统计时使用 `HeaderTabs`，统计接口独立请求并与筛选联动。
- 搜索区使用 `SearchHeader`，搜索项用 `computed` 保持字典响应式。
- 分页使用 `usePagination` 或项目页面已有分页写法。
- 新增、编辑、删除、导出等按钮必须补 `v-hasPermi`。

推荐刷新方法：

```ts
function reloadFirstPage() {
  if (currentPage.value === 1) {
    getList();
    return;
  }
  currentPage.value = 1;
}
```

### 3. 表单页

优先复用 `FormPageLayout`；只有当截图/业务确实需要特殊头部时，才参考 `coordinate/create.vue` 做自定义布局。

规则：

- 子组件接收 `row`、`isEdit`、`xxxOptions`、`loading`，只负责校验和 `emit('submit', formData)`。
- 父组件统一调用 API、提示消息、刷新列表和切换视图。
- 表单用 `label-position="top"`，两列网格，复杂字段占满整行。
- 编辑回显用 `watch` 或 `initForm`，避免直接污染 props。
- 关联下拉、远程选项、互斥选择要在表单层完成基础校验。
- 注释只解释后端特殊约定、字段转换原因或非直觉逻辑。

### 4. 详情页

优先复用 `DetailPageLayout`；如果截图要求强，可像 `coordinate/detail.vue` 自定义头部和详情卡片。

详情页可以是只读，也可以包含内联编辑或业务动作：

- 只读信息：信息网格、描述块、状态标签、时间线。
- 内联编辑：复制详情数据到本地表单，保存后通知父组件。
- 业务动作：阶段推进、添加日志、创建里程碑、创建协调事项等，通过 emit 交给父组件调 API。
- 时间线统一适配为 `CommonTimeline` 的 `{ time, label, type, user, content }`。

### 5. 弹窗和子流程

截图包含弹窗时，单独拆组件：

- `AddLogDialog.vue`
- `AddMilestoneDialog.vue`
- `CreateTodoDialog.vue`
- `ImportDialog.vue`
- `ArchiveDialog.vue`

弹窗通过 `v-model` 控制显隐，提交后只抛数据；父组件负责 API 和刷新详情。

## 字典和选项

字典优先使用 `useDict` 或 `getDicts`。高频字典可接入 `useDictStore` 缓存；复杂页面可用 fallback 保障页面可用。

```ts
interface SelectOption {
  label: string;
  value: string | number;
  elTagType?: string;
  elTagClass?: string;
}

function mapDictOptions(dicts: DictDataOption[]): SelectOption[] {
  return dicts.map((item) => ({
    label: item.dictLabel,
    value: item.dictValue,
    elTagType: item.listClass,
    elTagClass: item.cssClass
  }));
}
```

规则：

- 查询项、表单项和状态标签尽量共用同一组选项。
- 状态文案、接口码值、样式类之间必须集中映射。
- 不要在模板中散落大量三元表达式处理字典。

## 权限规则

新增、编辑、删除、导出等操作按钮统一接入权限控制：

```vue
<el-button type="primary" v-hasPermi="['base:module:add']">新建</el-button>
<el-button link type="primary" v-hasPermi="['base:module:edit']">编辑</el-button>
<el-button link type="danger" v-hasPermi="['base:module:remove']">删除</el-button>
```

规则：

- 指令值必须是非空数组。
- 与 `v-if` 同用时，`v-if` 控制业务可见性，`v-hasPermi` 控制权限。
- 非按钮场景使用 `checkPermi(['base:module:query'])` 或 `checkRole(['admin'])`。

## 样式规则

- 使用 `<style scoped lang="scss">`。
- 主体列表容器通常 `height: 100%; overflow: hidden;`。
- 创建和详情视图通常允许内部 `overflow-y: auto`。
- 大白卡片通常 `background: #fff; border-radius: 20px; padding: 30px;`。
- 小业务卡片通常 `border-radius: 8px` 到 `12px`。
- 搜索、标题、分割线、操作区顺序跟现有页面一致，不随原型随意重排。
- 主题主色使用 `var(--el-color-primary)`、`var(--el-color-primary-light-*)`、`rgba(var(--el-color-primary-rgb), n)`；中性色、圆角、阴影优先使用 `--app-*` 变量。
- 禁止硬编码主题主色：`#409eff`、`#00b46e`、`rgba(64, 158, 255, ...)`。
- 业务状态色允许使用明确语义色，但必须集中在状态 class 或映射中，不散落在模板行内样式。
- 不做营销式 hero、大面积装饰渐变、漂浮装饰元素或与业务管理后台不匹配的视觉。
- 响应式要求：`1200px` 以下表单和详情分栏降为单列，固定高度区域要设置 `min-height: 0` 避免内部滚动失效。

## 注释规则

- 注释使用简体中文。
- 只注释“为什么”，不注释显而易见的“是什么”。
- 后端枚举、特殊字段、fallback、兼容逻辑、跨模块跳转参数需要简短注释。
- 禁止写 `// 获取列表`、`// 定义变量`、`// 点击事件` 等无意义注释。
- TODO 使用 `// TODO(姓名): 说明`。

## 验证清单

完成后检查：

- 页面路径、组件导入、API 导入和类型导入正确。
- 搜索、分页、重置、新建、编辑、详情、删除、返回、弹窗提交链路完整。
- 新增、编辑、删除、导出等按钮已补权限标识。
- 列表接口正确处理 `rows` 和 `total`。
- 详情接口正确处理嵌套 `logs`、`timelines`、`milestones`。
- 字典失败时有合理空态或 fallback。
- 状态码、状态文案、状态 class、图标映射集中维护。
- 表单校验覆盖必填项、互斥项和接口必传项。
- `1200px` 以下表单、详情和卡片布局不挤压。
- 原型视觉与当前系统不一致时，已按当前系统风格改写，而不是照搬旧视觉。
- 运行可用检查命令，例如 `pnpm exec vue-tsc --noEmit`、`pnpm run lint:eslint` 或项目实际脚本。

最终回复说明：

- 修改了哪些页面、API 或 skill 文件。
- 依据了哪些原型、接口文档或现有页面。
- 对原型视觉做了哪些风格统一处理。
- 使用了哪些默认假设。
- 验证命令及结果；若未运行，说明原因和残余风险。
