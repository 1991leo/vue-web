<template>
	<div class="docs-page">
		<div class="wrap">
			<section class="card">
				<h1>RuoYi-Vue-Plus 租户业务闭环手册</h1>

				<div class="meta">
					<span class="tag">视角：前端实施/开发</span>
					<span class="tag">目标：最小可用到全量闭环</span>
					<span class="tag">范围：系统管理 + 监控 + 调度 + 工作流</span>
				</div>
			</section>

			<section class="card">
				<h2>一级手册目录（A-H）</h2>
				<div class="toc">
					<a href="#A">A. 准入与租户</a>
					<a href="#B">B. 权限组织</a>
					<a href="#C">C. 业务配置</a>
					<a href="#D">D. 审计监控</a>
					<a href="#E">E. 调度自动化</a>
					<a href="#F">F. 研发提效</a>
					<a href="#G">G. 工作流治理</a>
					<a href="#H">H. 工作流执行</a>
				</div>
			</section>

			<section class="card">
				<h3>A-H 模块总表</h3>

				<table>
					<thead>
						<tr>
							<th>模块</th>
							<th>核心职责</th>
							<th>实施步骤（验收标准）</th>
							<th>输入输出</th>
							<th>常见失效原因</th>
							<th>主要角色</th>
							<th>入口页面（关联）</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td id="A">A. 准入与租户</td>
							<td>控制谁能进入系统、进入哪个租户</td>
							<td>
								1) 在租户套餐维护可用能力范围；2) 在租户管理新建租户并绑定套餐，同时创建首个管理员；3)
								配置状态、到期时间、用户上限；4)
								管理员登录并切换租户。验收点：租户绑定套餐正确，登录成功且租户上下文正确。
							</td>
							<td>输入：账号、租户、clientId；输出：会话与租户上下文</td>
							<td>租户停用/过期/超上限、clientId 不一致</td>
							<td>超管、平台管理员</td>
							<td>
								<router-link class="route-link" to="/tenant/tenant"><code>/tenant/tenant</code></router-link> /
								<router-link class="route-link" to="/tenant/package"><code>/tenant/package</code></router-link>
							</td>
						</tr>
						<tr>
							<td id="B">B. 权限组织</td>
							<td>把区域、岗位、角色、菜单和用户绑定落地</td>
							<td>
								1) 建区域与岗位；2) 建角色并分配菜单/按钮；3) 绑定用户与组织权限；4)
								重新登录校验权限。验收点：菜单、按钮、数据范围一致。
							</td>
							<td>输入：组织与权限模型；输出：菜单、按钮、数据权限</td>
							<td>角色未授权、菜单未挂载、绑定缺失</td>
							<td>平台管理员</td>
							<td>
								<router-link class="route-link" to="/system/dept"><code>/system/dept</code></router-link> /
								<router-link class="route-link" to="/system/post"><code>/system/post</code></router-link> /
								<router-link class="route-link" to="/system/role"><code>/system/role</code></router-link> /
								<router-link class="route-link" to="/system/user"><code>/system/user</code></router-link>
							</td>
						</tr>
						<tr>
							<td id="C">C. 业务配置</td>
							<td>用配置驱动业务规则，减少硬编码</td>
							<td>
								1) 维护字典和参数；2) 配置公告与文件存储策略；3)
								在业务页回归验证。验收点：配置生效且异常场景有兜底策略。
							</td>
							<td>输入：字典/参数/公告/存储配置；输出：页面行为变化</td>
							<td>字典缺失、参数类型错误、存储切换异常</td>
							<td>平台管理员</td>
							<td>
								<router-link class="route-link" to="/system/config"><code>/system/config</code></router-link> /
								<router-link class="route-link" to="/system/dict"><code>/system/dict</code></router-link> /
								<router-link class="route-link" to="/system/notice"><code>/system/notice</code></router-link>
							</td>
						</tr>
						<tr>
							<td id="D">D. 审计监控</td>
							<td>异常可发现、可定位、可追责</td>
							<td>
								1) 查询操作日志与登录日志；2) 检查在线会话；3) 结合服务与缓存指标定位；4)
								修复后回归。验收点：问题可定位、过程可追溯、结果可复盘。
							</td>
							<td>输入：查询条件；输出：日志证据与系统指标</td>
							<td>日志量大、查询慢、会话异常</td>
							<td>平台管理员、政府监管人员</td>
							<td>
								<router-link class="route-link" to="/monitor/operlog"><code>/monitor/operlog</code></router-link> /
								<router-link class="route-link" to="/monitor/logininfor"><code>/monitor/logininfor</code></router-link>
								/
								<router-link class="route-link" to="/monitor/online"><code>/monitor/online</code></router-link>
							</td>
						</tr>
						<tr>
							<td id="E">E. 调度自动化</td>
							<td>让重复任务自动执行并可恢复</td>
							<td>
								1) 配置任务与触发策略；2) 手动执行首轮验证；3) 检查执行日志；4)
								按重试策略处理失败。验收点：任务稳定执行、失败可恢复。
							</td>
							<td>输入：任务策略；输出：执行结果与重试记录</td>
							<td>执行器离线、任务堆积、策略错误</td>
							<td>平台管理员</td>
							<td>
								<router-link class="route-link" to="/monitor/snailjob"><code>/monitor/snailjob</code></router-link> /
								<router-link class="route-link" to="/monitor/cache"><code>/monitor/cache</code></router-link> /
								<router-link class="route-link" to="/monitor/admin"><code>/monitor/admin</code></router-link>
							</td>
						</tr>
						<tr>
							<td id="F">F. 研发提效</td>
							<td>生成代码骨架，缩短交付周期</td>
							<td>
								1) 导入表结构并配置字段规则；2) 生成代码骨架；3) 补齐业务逻辑与校验；4)
								挂菜单并完成权限联调。验收点：CRUD可运行且可持续二开。
							</td>
							<td>输入：表结构与字段规则；输出：可运行模块</td>
							<td>覆盖二开、接口契约偏差</td>
							<td>平台管理员</td>
							<td>
								<router-link class="route-link" to="/tool/gen"><code>/tool/gen</code></router-link> /
								<router-link class="route-link" to="/system/menu"><code>/system/menu</code></router-link>
							</td>
						</tr>
						<tr>
							<td id="G">G. 工作流治理</td>
							<td>设计规则、发布流程、控制版本</td>
							<td>
								1) 建流程分类；2) 配置表达式规则；3) 设计流程并发布版本；4)
								根据实例运行迭代。验收点：流程可发布、可停用、版本可追溯。
							</td>
							<td>输入：分类/表达式/定义；输出：可执行流程版本</td>
							<td>规则错误、版本混用、停用策略不当</td>
							<td>平台管理员</td>
							<td>
								<router-link class="route-link" to="/workflow/category"><code>/workflow/category</code></router-link> /
								<router-link class="route-link" to="/workflow/spel"><code>/workflow/spel</code></router-link> /
								<router-link class="route-link" to="/workflow/processDefinition"
									><code>/workflow/processDefinition</code></router-link
								>
							</td>
						</tr>
						<tr>
							<td id="H">H. 工作流执行</td>
							<td>发起、审批、驳回、归档全链路执行</td>
							<td>
								1) 普通员工提单；2) 按岗位权限由相关人员处理通过/驳回；3) 驳回后补充材料重提；4)
								通过后归档与抄送。验收点：状态流转正确且全程有轨迹。
							</td>
							<td>输入：业务单据与审批动作；输出：状态流转与轨迹</td>
							<td>待办积压、状态错配、驳回信息不足</td>
							<td>普通员工</td>
							<td>
								<router-link class="route-link" to="/workflow/task/myDocument"
									><code>/workflow/task/myDocument</code></router-link
								>
								/ <router-link class="route-link" to="/task/taskWaiting"><code>/task/taskWaiting</code></router-link> /
								<router-link class="route-link" to="/task/taskFinish"><code>/task/taskFinish</code></router-link> /
								<router-link class="route-link" to="/task/taskCopyList"><code>/task/taskCopyList</code></router-link>
							</td>
						</tr>
					</tbody>
				</table>
			</section>

			<section class="card">
				<h3>V3.2 新建租户端到端闭环（详细执行版）</h3>
				<p>
					说明：本节是“可直接照做”的执行清单。主顺序固定为
					<code>S1 -> S2 -> S3 -> S4 -> S5 -> S6 -> S7</code>。
				</p>
				<table>
					<thead>
						<tr>
							<th>阶段</th>
							<th>操作角色</th>
							<th>入口页面（关联）</th>
							<th>实施步骤（详细）</th>
							<th>数据状态变化</th>
							<th>异常处理</th>
							<th>验收标准</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>S1 租户开通</td>
							<td>平台管理员</td>
							<td>
								<router-link class="route-link" to="/tenant/tenant"><code>/tenant/tenant</code></router-link> /
								<router-link class="route-link" to="/tenant/package"><code>/tenant/package</code></router-link>
							</td>
							<td>
								1) 在租户套餐先创建套餐并配置菜单能力边界；2) 在租户管理新建租户并绑定该套餐，录入基础信息；3)
								创建首个平台管理员账号并设置状态、到期时间、用户上限；4) 保存后执行租户初始化。
							</td>
							<td>
								套餐记录从“未配置”到“可绑定”；租户记录从“未创建”到“已创建且已绑定套餐”；管理员账号从“无”到“可登录”。
							</td>
							<td>若提示租户编码重复或套餐不匹配，先修正主数据再重试；若初始化失败，先检查依赖字典/参数是否完整。</td>
							<td>套餐可被成功绑定；租户创建成功；首个管理员账号可登录；租户状态为启用。</td>
						</tr>
						<tr>
							<td>S2 准入校验</td>
							<td>超管、平台管理员</td>
							<td>
								<router-link class="route-link" to="/login"><code>/login</code></router-link> /
								<router-link class="route-link" to="/tenant/tenant"><code>/tenant/tenant</code></router-link> /
								<router-link class="route-link" to="/system/client"><code>/system/client</code></router-link>
							</td>
							<td>
								1) 使用管理员账号登录；2) 校验 <code>clientId</code> 与当前环境一致；3) 进入系统后确认默认租户上下文。
							</td>
							<td>会话从“未建立”到“已建立”；登录上下文绑定目标租户。</td>
							<td>
								若出现无权限或登录失败，先核对租户状态（停用/过期）和 <code>clientId</code> 配置；再检查账号状态。
							</td>
							<td>可稳定登录；会话中的租户上下文正确。</td>
						</tr>
						<tr>
							<td>S3 组织与权限落地</td>
							<td>平台管理员</td>
							<td>
								<router-link class="route-link" to="/system/dept"><code>/system/dept</code></router-link> /
								<router-link class="route-link" to="/system/post"><code>/system/post</code></router-link> /
								<router-link class="route-link" to="/system/role"><code>/system/role</code></router-link> /
								<router-link class="route-link" to="/system/user"><code>/system/user</code></router-link>
							</td>
							<td>
								1) 建区域和岗位；2) 建角色并分配菜单/按钮；3) 新增业务用户并绑定区域/岗位/角色；4)
								让用户重新登录验证权限集。
							</td>
							<td>权限模型从“空”到“可用”；用户与组织权限绑定完成。</td>
							<td>若菜单可见但按钮不可用，检查按钮权限与角色绑定；若数据越权，检查角色数据范围。</td>
							<td>用户菜单、按钮、数据范围与角色设计一致。</td>
						</tr>
						<tr>
							<td>S4 业务配置生效</td>
							<td>平台管理员</td>
							<td>
								<router-link class="route-link" to="/system/dict"><code>/system/dict</code></router-link> /
								<router-link class="route-link" to="/system/config"><code>/system/config</code></router-link> /
								<router-link class="route-link" to="/system/notice"><code>/system/notice</code></router-link>
							</td>
							<td>
								1) 维护业务字典和系统参数；2) 配置公告与文件策略；3) 到业务页触发关键场景验证；4) 记录配置版本和变更人。
							</td>
							<td>系统行为由“默认值”切换到“租户化配置”。</td>
							<td>若页面显示异常，优先核对字典键值和参数类型；若文件上传失败，检查存储策略与连接配置。</td>
							<td>关键页面按配置预期运行；变更可追溯。</td>
						</tr>
						<tr>
							<td>S5 审批链路接入（可选）</td>
							<td>平台管理员</td>
							<td>
								<router-link class="route-link" to="/workflow/category"><code>/workflow/category</code></router-link> /
								<router-link class="route-link" to="/workflow/spel"><code>/workflow/spel</code></router-link> /
								<router-link class="route-link" to="/workflow/processDefinition"
									><code>/workflow/processDefinition</code></router-link
								>
								/
								<router-link class="route-link" to="/workflow/task/myDocument"
									><code>/workflow/task/myDocument</code></router-link
								>
								/ <router-link class="route-link" to="/task/taskWaiting"><code>/task/taskWaiting</code></router-link> /
								<router-link class="route-link" to="/task/taskFinish"><code>/task/taskFinish</code></router-link> /
								<router-link class="route-link" to="/task/taskCopyList"><code>/task/taskCopyList</code></router-link>
							</td>
							<td>
								1) 配分类和表达式；2) 设计并发布流程版本；3) 发起业务单据并走审批；4) 验证通过、驳回、撤销、抄送分支。
							</td>
							<td>单据状态在 <code>draft -> waiting -> finish/back/cancel</code> 之间流转并留痕。</td>
							<td>若流程卡死，先查表达式与人员规则；若待办分配错误，检查节点配置与角色映射。</td>
							<td>主流程与异常分支均可闭环；轨迹可追踪。</td>
						</tr>
						<tr>
							<td>S6 运营与自动化</td>
							<td>平台管理员、政府监管人员</td>
							<td>
								<router-link class="route-link" to="/system/log/operlog"><code>/system/log/operlog</code></router-link>
								/
								<router-link class="route-link" to="/system/log/logininfor"
									><code>/system/log/logininfor</code></router-link
								>
								/ <router-link class="route-link" to="/monitor/online"><code>/monitor/online</code></router-link> /
								<router-link class="route-link" to="/monitor/snailjob"><code>/monitor/snailjob</code></router-link> /
								<router-link class="route-link" to="/monitor/cache"><code>/monitor/cache</code></router-link> /
								<router-link class="route-link" to="/monitor/admin"><code>/monitor/admin</code></router-link>
							</td>
							<td>1) 建立日志巡检规则；2) 配置调度任务与告警；3) 演练失败重试和人工兜底；4) 固化日常巡检节奏。</td>
							<td>从“可运行”提升为“可观测、可恢复、可持续”。</td>
							<td>若日志查询慢，按时间窗和关键字段缩小范围；若任务堆积，优先处理执行器状态与并发策略。</td>
							<td>异常发现时效、恢复时效达标；关键任务稳定执行。</td>
						</tr>
						<tr>
							<td>S7 研发提效落地</td>
							<td>平台管理员</td>
							<td>
								<router-link class="route-link" to="/tool/gen"><code>/tool/gen</code></router-link> /
								<router-link class="route-link" to="/system/menu"><code>/system/menu</code></router-link> /
								<router-link class="route-link" to="/system/role"><code>/system/role</code></router-link>
							</td>
							<td>
								1) 选择已稳定的业务表并在代码生成维护字段规则；2) 生成前后端代码骨架并完成二开；3)
								挂载菜单、绑定权限点并联调；4) 以租户维度完成回归并沉淀模板，作为后续租户复制交付基线。
							</td>
							<td>交付模式从“单租户手工实现”提升为“模板化可复制交付”；模块资产从“一次性”升级为“可复用”。</td>
							<td>若生成代码覆盖二开内容，先隔离自定义逻辑再重生；若权限点不一致，核对菜单路由与角色授权映射。</td>
							<td>新功能模块可在新租户快速复制上线；二开规范与回归清单可复用。</td>
						</tr>
					</tbody>
				</table>

				<h3>全业务生命周期闭环（从最小到最大）</h3>
				<ol class="step">
					<li>L0 最小闭环：完成 S1 + S2，保证租户可创建、可登录、可切换。</li>
					<li>L1 权限闭环：完成 S3，保证组织权限与角色授权一致。</li>
					<li>L2 配置闭环：完成 S4，保证业务配置生效且可追溯。</li>
					<li>L3 审批闭环：完成 S5，保证业务单据可发起、可审批、可回退、可归档。</li>
					<li>L4 运营闭环：完成 S6，保证异常可发现、可定位、可恢复。</li>
					<li>L5 提效闭环：完成 S7，接入 F（研发提效），保证生成+二开+回归链路可复用。</li>
				</ol>

				<h3>关键异常分支</h3>
				<ol class="step">
					<li>租户不可登录：按“租户状态 -> 到期时间 -> clientId -> 账号状态”顺序排查。</li>
					<li>权限不生效：按“角色授权 -> 用户绑定 -> 重新登录 -> 数据范围”顺序排查。</li>
					<li>流程不流转：按“表达式 -> 节点人员规则 -> 流程版本状态”顺序排查。</li>
					<li>任务失败不恢复：按“执行器在线状态 -> 触发策略 -> 重试策略 -> 人工补偿”顺序排查。</li>
					<li>任一层不通过，先修复再进入下一层。</li>
				</ol>
			</section>
			<section class="card">
				<h3>流程设计使用方法（三级审批实例）</h3>
				<p>下面这套步骤可直接照做，目标是跑通“三级审批 + 驳回回退 + 重提再审”的完整闭环。</p>
				<ol class="step">
					<li>0. 进入设计器前：在流程定义页点“新增/复制流程”，填流程编码、名称、分类、表单路由，保存后进入设计器。</li>
					<li>1. 先摆节点（从左到右）：开始 -> 申请提交 -> 县级初审 -> 市级复核 -> 省级终审 -> 结束。</li>
					<li>
						2. 连主链路：开始->申请提交；申请提交->县级初审；县级初审->市级复核；市级复核->省级终审；省级终审->结束。
					</li>
					<li>3. 连驳回回退线：县级初审->申请提交；市级复核->申请提交；省级终审->申请提交。</li>
					<li>
						4. 配“申请提交”节点：基础设置确认名称即可；办理人保持最小配置；先保存一次，避免后续驳回节点下拉无数据。
					</li>
					<li>
						5.
						配“县级初审”节点：审批方式选“或签”；或签策略“固定通过人数”；固定通过人数=1；固定驳回人数=1；驳回方式选“驳到指定节点”；驳回节点选“申请提交”；办理人选县级管理员账号。
					</li>
					<li>6. 配“市级复核”节点：同上，办理人换成市级管理员；通过线指向省级终审；退回线指向申请提交。</li>
					<li>7. 配“省级终审”节点：同上，办理人换成省级管理员；通过线指向结束；退回线指向申请提交。</li>
					<li>
						8. 配“申请提交->县级初审”线：若你的设计器有“提交/发起”选项则选它；若没有则选“审批通过”（当前系统常见）。
					</li>
					<li>
						9.
						保存并发布：保存流程；若报“开始或中间节点必须画连线”，先点“自适应”找孤立节点，删除或补连线后再保存；返回列表点“发布流程”。
					</li>
					<li>
						10. 验收三条用例：A 全通过（发起->县级通过->市级通过->省级通过->结束）；B
						中间驳回（到市级驳回->申请人重提->再通过）；C 终审驳回（到省级驳回->重提->通过）。
					</li>
				</ol>
				<h3>流程逻辑详解</h3>
				<ol class="step">
					<li>主链路逻辑：每一条“通过线”把单据从下一级状态推进到上一级状态，直到结束节点，最终状态为“审核通过”。</li>
					<li>回退逻辑：任一级选择“退回”，单据立即回到“申请提交”，状态进入“审核驳回”，申请人可修改后再次提交。</li>
					<li>重提逻辑：重提后从“申请提交”重新进入县级初审，再按主链路继续，不会跳级。</li>
					<li>状态一致性：节点状态、待办归属、轨迹记录三者必须一致，否则按节点人员规则和跳转线语义反查。</li>
				</ol>
				<h3>常见报错快速定位</h3>
				<ol class="step">
					<li>驳回节点下拉空：通常是没保存、无可回退目标、申请提交未接入主链路。</li>
					<li>保存提示连线问题：存在孤立节点或线未吸附到锚点，建议删线重画并“自适应”全图检查。</li>
					<li>待办没人处理：审批节点办理人未配齐，或用了角色/区域但未转成具体用户。</li>
				</ol>
				<h3>注意点：表单路径 formPath</h3>
				<ol class="step">
					<li>“查看/编辑/审批”跳转地址不是前端写死，来源于流程定义里配置的 <code>formPath</code>。</li>
					<li>配置位置：流程定义页“修改流程”弹窗中的“表单路径”。示例：<code>/workflow/leaveEdit/index</code>。</li>
					<li>若这里填错或留空，任务列表点击“查看”会跳到错误页面（常见跳到列表页自身或 404）。</li>
					<li>流程定义改完后要“保存 + 发布新版本”才会对新发起单据生效。</li>
					<li>历史单据通常沿用历史版本的 <code>formPath</code>，排查时请区分“旧实例”和“新实例”。</li>
				</ol>
			</section>
		</div>
	</div>
</template>

<style scoped lang="scss">
.docs-page {
	min-height: 100%;
	background: #f6f8fb;
}

.wrap {
	max-width: 1200px;
	margin: 0 auto;
	padding: 24px;
}

.card {
	background: #fff;
	border: 1px solid #e6ebf2;
	border-radius: 10px;
	padding: 20px;
	margin-bottom: 16px;
}

h1,
h2,
h3 {
	margin: 0 0 12px;
}

h1 {
	font-size: 28px;
}

h2 {
	font-size: 22px;
}

h3 {
	font-size: 18px;
}

p {
	margin: 8px 0;
	color: #5b6b7b;
	line-height: 1.65;
}

.toc {
	display: grid;
	grid-template-columns: repeat(2, minmax(260px, 1fr));
	gap: 10px;
}

.toc a {
	display: block;
	text-decoration: none;
	color: #00b46e;
	border: 1px solid rgba(0, 180, 110, 0.2);
	background: rgba(0, 180, 110, 0.05);
	border-radius: 8px;
	padding: 10px 12px;
	font-weight: 600;
}

.route-link {
	color: #00b46e;
	text-decoration: none;
}

.route-link:hover {
	text-decoration: underline;
}

.meta {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-top: 10px;
}

.tag {
	font-size: 12px;
	background: #f2f6fc;
	color: #4b5969;
	border: 1px solid #dfe7f0;
	border-radius: 99px;
	padding: 2px 10px;
}

table {
	width: 100%;
	border-collapse: collapse;
	margin-top: 8px;
}

th,
td {
	border: 1px solid #e6ebf2;
	padding: 10px;
	text-align: left;
	vertical-align: top;
	font-size: 14px;
}

th {
	background: #f9fbff;
}

.step {
	margin: 8px 0 0;
	padding-left: 20px;
	color: #3f4d5d;
}

.step li {
	margin: 4px 0;
}

.divider {
	height: 1px;
	background: #e6ebf2;
	margin: 18px 0 8px;
}
</style>
