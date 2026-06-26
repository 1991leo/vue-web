<template>
  <div class="dashboard-page" :class="{ 'big-screen-active': bigScreenVisible }">
    <!-- 顶部标题栏 -->
    <div class="page-header">
      <div class="title-left">
        <span class="title-decorator"></span>
        <h2>经营驾驶舱</h2>
        <div class="month-filter">
          <span>月份：</span>
          <el-select v-model="selectMonth" placeholder="请选择月份" style="width: 130px">
            <el-option label="2026-01" value="2026-01" />
            <el-option label="2026-02" value="2026-02" />
            <el-option label="2026-03" value="2026-03" />
            <el-option label="2026-04" value="2026-04" />
            <el-option label="2026-05" value="2026-05" />
            <el-option label="2026-06" value="2026-06" />
          </el-select>
        </div>
      </div>
      <div class="title-right">
        <el-button type="primary" class="big-screen-btn" @click="openBigScreen">
          <el-icon><DataLine /></el-icon>
          <span>大屏演示模式</span>
        </el-button>
      </div>
    </div>

    <!-- 指标卡片区域 - 美化为玻璃拟态、Hover悬浮、发光指示 -->
    <div class="card-group">
      <!-- 营业收入 -->
      <div class="card-item card-revenue">
        <div class="card-left">
          <div class="icon-box">
            <el-icon><Money /></el-icon>
          </div>
        </div>
        <div class="card-right">
          <div class="card-top">
            <span class="card-name">营业收入</span>
            <span class="card-tag tag-blue">完成率 85%</span>
          </div>
          <div class="card-value">¥ 35,680 <span class="unit">万元</span></div>
          <div class="card-desc-group">
            <div class="desc-item">
              <span class="desc-label">下月预测：</span>
              <span class="desc-val">¥ 38,000 万</span>
            </div>
            <div class="desc-item">
              <span class="desc-label">年度目标：</span>
              <span class="desc-val">¥ 420,000 万</span>
            </div>
          </div>
          <el-progress :percentage="85" :stroke-width="6" :show-text="false" class="card-progress" />
        </div>
      </div>

      <!-- 利润总额 -->
      <div class="card-item card-profit">
        <div class="card-left">
          <div class="icon-box">
            <el-icon><TrendCharts /></el-icon>
          </div>
        </div>
        <div class="card-right">
          <div class="card-top">
            <span class="card-name">利润总额</span>
            <span class="card-tag tag-green">完成率 78%</span>
          </div>
          <div class="card-value">¥ 8,520 <span class="unit">万元</span></div>
          <div class="card-desc-group">
            <div class="desc-item">
              <span class="desc-label">下月预测：</span>
              <span class="desc-val">¥ 9,200 万</span>
            </div>
            <div class="desc-item">
              <span class="desc-label">年度目标：</span>
              <span class="desc-val">¥ 110,000 万</span>
            </div>
          </div>
          <el-progress :percentage="78" :stroke-width="6" :show-text="false" class="card-progress" />
        </div>
      </div>

      <!-- 新签合同 -->
      <div class="card-item card-contract">
        <div class="card-left">
          <div class="icon-box">
            <el-icon><DocumentCopy /></el-icon>
          </div>
        </div>
        <div class="card-right">
          <div class="card-top">
            <span class="card-name">新签合同</span>
            <span class="card-tag tag-purple">完成率 92%</span>
          </div>
          <div class="card-value">¥ 22,400 <span class="unit">万元</span></div>
          <div class="card-desc-group">
            <div class="desc-item">
              <span class="desc-label">下月预测：</span>
              <span class="desc-val">¥ 25,000 万</span>
            </div>
            <div class="desc-item">
              <span class="desc-label">年度目标：</span>
              <span class="desc-val">¥ 244,000 万</span>
            </div>
          </div>
          <el-progress :percentage="92" :stroke-width="6" :show-text="false" class="card-progress" />
        </div>
      </div>

      <!-- 投资完成 -->
      <div class="card-item card-invest">
        <div class="card-left">
          <div class="icon-box">
            <el-icon><Wallet /></el-icon>
          </div>
        </div>
        <div class="card-right">
          <div class="card-top">
            <span class="card-name">投资完成</span>
            <span class="card-tag tag-yellow">完成率 63%</span>
          </div>
          <div class="card-value">¥ 12,600 <span class="unit">万元</span></div>
          <div class="card-desc-group">
            <div class="desc-item">
              <span class="desc-label">下月预测：</span>
              <span class="desc-val">¥ 15,000 万</span>
            </div>
            <div class="desc-item">
              <span class="desc-label">年度目标：</span>
              <span class="desc-val">¥ 200,000 万</span>
            </div>
          </div>
          <el-progress :percentage="63" :stroke-width="6" :show-text="false" class="card-progress" />
        </div>
      </div>

      <!-- 研发投入 -->
      <div class="card-item card-rnd">
        <div class="card-left">
          <div class="icon-box">
            <el-icon><Cpu /></el-icon>
          </div>
        </div>
        <div class="card-right">
          <div class="card-top">
            <span class="card-name">研发投入</span>
            <span class="card-tag tag-orange">完成率 55%</span>
          </div>
          <div class="card-value">¥ 4,950 <span class="unit">万元</span></div>
          <div class="card-desc-group">
            <div class="desc-item">
              <span class="desc-label">下月预测：</span>
              <span class="desc-val">¥ 5,800 万</span>
            </div>
            <div class="desc-item">
              <span class="desc-label">年度目标：</span>
              <span class="desc-val">¥ 90,000 万</span>
            </div>
          </div>
          <el-progress :percentage="55" :stroke-width="6" :show-text="false" class="card-progress" />
        </div>
      </div>
    </div>

    <!-- 月度趋势图 - 精美升级 -->
    <div class="chart-box">
      <div class="chart-title">
        <div class="title-left">
          <span class="title-dot"></span>
          <span>月度累计趋势分析</span>
        </div>
      </div>
      <div ref="trendChart" class="chart-container" style="height: 360px"></div>
    </div>

    <!-- 子公司经营明细 - 采用卡片化科技表头 -->
    <div class="table-box">
      <div class="table-header">
        <div class="title-left">
          <span class="title-dot"></span>
          <span>子公司经营明细</span>
        </div>
        <el-button type="primary" class="export-btn" @click="handleExport">导出明细数据</el-button>
      </div>
      <el-table :data="companyList" border stripe @row-click="handleRowClick" style="width: 100%" class="modern-table">
        <el-table-column prop="companyName" label="公司名称" align="center" width="160" />

        <el-table-column label="营业收入" align="center">
          <el-table-column label="营收目标(万)" align="center" prop="revenueTarget" />
          <el-table-column label="实际营收(万)" align="center" prop="revenueActual" />
          <el-table-column label="年化进度" align="center" width="100">
            <template #default="scope">
              <span class="completion-tag" :class="getRateTagClass(scope.row.revenueAnnualRate)"> {{ scope.row.revenueAnnualRate }}% </span>
            </template>
          </el-table-column>
          <el-table-column label="阶段进度" align="center" width="100">
            <template #default="scope">
              <span class="completion-tag" :class="getRateTagClass(scope.row.revenueStageRate)"> {{ scope.row.revenueStageRate }}% </span>
            </template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="利润总额" align="center">
          <el-table-column label="利润目标(万)" align="center" prop="profitTarget" />
          <el-table-column label="实际利润(万)" align="center" prop="profitActual" />
          <el-table-column label="年化进度" align="center" width="100">
            <template #default="scope">
              <span class="completion-tag" :class="getRateTagClass(scope.row.profitAnnualRate)"> {{ scope.row.profitAnnualRate }}% </span>
            </template>
          </el-table-column>
          <el-table-column label="阶段进度" align="center" width="100">
            <template #default="scope">
              <span class="completion-tag" :class="getRateTagClass(scope.row.profitStageRate)"> {{ scope.row.profitStageRate }}% </span>
            </template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="新签合同额" align="center">
          <el-table-column label="合同目标(万)" align="center" prop="contractTarget" />
          <el-table-column label="实际合同(万)" align="center" prop="contractActual" />
          <el-table-column label="年化进度" align="center" width="100">
            <template #default="scope">
              <span class="completion-tag" :class="getRateTagClass(scope.row.contractAnnualRate)"> {{ scope.row.contractAnnualRate }}% </span>
            </template>
          </el-table-column>
          <el-table-column label="阶段进度" align="center" width="100">
            <template #default="scope">
              <span class="completion-tag" :class="getRateTagClass(scope.row.contractStageRate)"> {{ scope.row.contractStageRate }}% </span>
            </template>
          </el-table-column>
        </el-table-column>
      </el-table>
    </div>

    <!-- 详情弹窗 - 高级感强化 -->
    <el-dialog
      v-model="dialogVisible"
      :title="`${detailData.companyName} - 经营细节剖析`"
      width="820px"
      :close-on-click-modal="false"
      class="modern-dialog"
    >
      <div class="detail-header">
        <span class="month-text">当前分析周期：2026年5月</span>
      </div>
      <div class="detail-top-cards">
        <div class="detail-card card-blue">
          <div class="detail-card-title">营业收入</div>
          <div class="detail-card-value">¥{{ detailData.revenue.toLocaleString() }} <span class="unit">万</span></div>
          <div class="detail-card-sub">下月预计：¥{{ detailData.revenueNext.toLocaleString() }} 万</div>
          <div class="detail-card-rate">
            <span class="up"
              ><el-icon><CaretTop /></el-icon> 环比 +{{ detailData.revenueRate1 }}%</span
            >
            <span class="up"
              ><el-icon><CaretTop /></el-icon> 同比 +{{ detailData.revenueRate2 }}%</span
            >
          </div>
        </div>

        <div class="detail-card card-green">
          <div class="detail-card-title">利润总额</div>
          <div class="detail-card-value">¥{{ detailData.profit.toLocaleString() }} <span class="unit">万</span></div>
          <div class="detail-card-sub">下月预计：¥{{ detailData.profitNext.toLocaleString() }} 万</div>
          <div class="detail-card-rate">
            <span class="up"
              ><el-icon><CaretTop /></el-icon> 环比 +{{ detailData.profitRate1 }}%</span
            >
            <span class="up"
              ><el-icon><CaretTop /></el-icon> 同比 +{{ detailData.profitRate2 }}%</span
            >
          </div>
        </div>
        <div class="detail-card card-purple">
          <div class="detail-card-title">新签合同</div>
          <div class="detail-card-value">¥{{ detailData.contract.toLocaleString() }} <span class="unit">万</span></div>
          <div class="detail-card-sub">下月预计：¥{{ detailData.contractNext.toLocaleString() }} 万</div>
          <div class="detail-card-rate">
            <span class="up"
              ><el-icon><CaretTop /></el-icon> 环比 +{{ detailData.contractRate1 }}%</span
            >
            <span class="up"
              ><el-icon><CaretTop /></el-icon> 同比 +{{ detailData.contractRate2 }}%</span
            >
          </div>
        </div>
        <div class="detail-card card-yellow">
          <div class="detail-card-title">投资完成</div>
          <div class="detail-card-value">¥{{ detailData.invest.toLocaleString() }} <span class="unit">万</span></div>
          <div class="detail-card-sub">下月预计：¥{{ detailData.investNext.toLocaleString() }} 万</div>
          <div class="detail-card-rate">
            <span class="up"
              ><el-icon><CaretTop /></el-icon> 环比 +{{ detailData.investRate1 }}%</span
            >
            <span :class="detailData.investRate3 < 0 ? 'down' : 'up'">
              <el-icon><component :is="detailData.investRate3 < 0 ? 'CaretBottom' : 'CaretTop'" /></el-icon>
              同比 {{ detailData.investRate3 < 0 ? '↓' : '↑' }} {{ Math.abs(detailData.investRate3) }}%
            </span>
          </div>
        </div>
      </div>
      <div class="detail-chart-wrap">
        <div class="chart-title">各核心指标累计趋势 (万元)</div>
        <div ref="detailChart" style="height: 320px"></div>
      </div>
    </el-dialog>

    <!-- 大屏演示模式 - 重构为炫酷科幻深色大屏系统 -->
    <div v-if="bigScreenVisible" class="big-screen-overlay">
      <!-- 科技网格背景与光晕 -->
      <div class="big-screen-bg-glow"></div>
      <div class="big-screen-grid-lines"></div>

      <!-- 科幻对称头部 -->
      <div class="big-header">
        <div class="header-left">
          <div class="tech-time">
            <el-icon class="time-icon"><Clock /></el-icon>
            <span class="time-text">{{ currentTechTime }}</span>
          </div>
        </div>
        <div class="header-center">
          <div class="header-title-glare"></div>
          <h1 class="header-title">湖北大数据集团运营管理一体化平台</h1>
          <div class="header-title-sub">Chutian Group Enterprise Operation Dashboard</div>
        </div>
        <div class="header-right">
          <button class="tech-exit-btn" @click="closeBigScreen">
            <el-icon><ArrowLeft /></el-icon>
            <span>退出演示</span>
            <span class="btn-scan"></span>
          </button>
        </div>
      </div>

      <!-- 大屏核心指标简报（跑马灯/亮字） -->
      <div class="big-screen-summary">
        <div class="summary-item">
          <div class="summary-icon">
            <el-icon><Money /></el-icon>
          </div>
          <div class="summary-info">
            <div class="summary-label">集团总营业收入</div>
            <div class="summary-value text-blue">35,680 <span class="unit">万元</span></div>
          </div>
        </div>
        <div class="summary-item">
          <div class="summary-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="summary-info">
            <div class="summary-label">集团总利润总额</div>
            <div class="summary-value text-green">8,520 <span class="unit">万元</span></div>
          </div>
        </div>
        <div class="summary-item">
          <div class="summary-icon">
            <el-icon><DocumentCopy /></el-icon>
          </div>
          <div class="summary-info">
            <div class="summary-label">集团总新签合同</div>
            <div class="summary-value text-purple">22,400 <span class="unit">万元</span></div>
          </div>
        </div>
      </div>

      <!-- 大屏主图表 - CSS科技边框四角 -->
      <div class="tech-card-container big-screen-main-chart">
        <div class="tech-corners"><span></span><span></span><span></span><span></span></div>
        <div class="chart-header">
          <div class="chart-title-tech"><span class="tech-dot"></span>核心经营指标分析图</div>
          <!-- 切换 Tab 按钮，科技风 -->
          <div class="big-screen-tabs">
            <el-radio-group v-model="bigActiveTab" class="tab-group-tech">
              <el-radio-button value="revenue">营业收入</el-radio-button>
              <el-radio-button value="profit">利润总额</el-radio-button>
              <el-radio-button value="contract">新签合同</el-radio-button>
            </el-radio-group>
            <el-radio-group v-model="bigViewTab" class="view-tab-group-tech">
              <el-radio-button value="actual">按实际值</el-radio-button>
              <el-radio-button value="target">按年度目标</el-radio-button>
              <el-radio-button value="rate">按阶段完成率</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div class="chart-content">
          <div ref="bigMainChart" style="width: 100%; height: 100%"></div>
        </div>
      </div>

      <!-- 下方三个小排名图 - 升级为丰富的高级科技图表 -->
      <div class="big-screen-bottom">
        <div class="tech-card-container bottom-chart">
          <div class="tech-corners"><span></span><span></span><span></span><span></span></div>
          <div class="chart-title-tech"><span class="tech-dot blue"></span>子公司营业收入占比</div>
          <div class="chart-content">
            <div ref="revenueRankChart" style="width: 100%; height: 100%"></div>
          </div>
        </div>
        <div class="tech-card-container bottom-chart">
          <div class="tech-corners"><span></span><span></span><span></span><span></span></div>
          <div class="chart-title-tech"><span class="tech-dot green"></span>子公司利润目标与实际对比</div>
          <div class="chart-content">
            <div ref="profitRankChart" style="width: 100%; height: 100%"></div>
          </div>
        </div>
        <div class="tech-card-container bottom-chart">
          <div class="tech-corners"><span></span><span></span><span></span><span></span></div>
          <div class="chart-title-tech"><span class="tech-dot purple"></span>子公司新签合同额趋势</div>
          <div class="chart-content">
            <div ref="contractRankChart" style="width: 100%; height: 100%"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import * as echarts from 'echarts';
import { ElLoading, ElMessage } from 'element-plus';
import FileSaver from 'file-saver';
import { DataLine, Money, TrendCharts, DocumentCopy, Wallet, Cpu, Clock, ArrowLeft, CaretTop, CaretBottom } from '@element-plus/icons-vue';

// 筛选月份
const selectMonth = ref('2026-05');

// 图表 DOM 引用
const trendChart = ref<HTMLElement | null>(null);
const revenueBar = ref<HTMLElement | null>(null);
const profitBar = ref<HTMLElement | null>(null);
const contractBar = ref<HTMLElement | null>(null);
const detailChart = ref<HTMLElement | null>(null);

// 大屏组件 DOM 引用
const bigMainChart = ref<HTMLElement | null>(null);
const revenueRankChart = ref<HTMLElement | null>(null);
const profitRankChart = ref<HTMLElement | null>(null);
const contractRankChart = ref<HTMLElement | null>(null);

// 弹窗可见性
const dialogVisible = ref(false);

// 大屏演示模块状态
const bigScreenVisible = ref(false);
const bigActiveTab = ref('revenue');
const bigViewTab = ref('actual');
const currentTechTime = ref('');
let timeIntervalId: any = null;

// ECharts 实例统一安全管理，杜绝内存泄漏
const chartInstances: Record<string, echarts.ECharts | null> = {
  trend: null,
  revenueBar: null,
  profitBar: null,
  contractBar: null,
  detail: null,
  bigMain: null,
  revenueRank: null,
  profitRank: null,
  contractRank: null
};

// 辅助方法：安全地初始化或重绘 ECharts，自动销毁残留实例
const initOrUpdateChart = (key: string, dom: HTMLElement | null, option: any) => {
  if (!dom) return null;
  if (chartInstances[key]) {
    chartInstances[key]?.dispose();
    chartInstances[key] = null;
  }
  const instance = echarts.init(dom);
  instance.setOption(option);
  chartInstances[key] = instance;
  return instance;
};

// 更新科技时间（秒级刷新）
const updateTechTime = () => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  currentTechTime.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

// 表格数据
const companyList = ref([
  {
    companyName: '集团本部',
    revenueTarget: 120000,
    revenueActual: 108000,
    revenueAnnualRate: 90,
    revenueStageRate: 45,
    profitTarget: 35000,
    profitActual: 28000,
    profitAnnualRate: 80,
    profitStageRate: 37.5,
    contractTarget: 70000,
    contractActual: 63000,
    contractAnnualRate: 90,
    contractStageRate: 45
  },
  {
    companyName: '投资并购',
    revenueTarget: 80000,
    revenueActual: 56000,
    revenueAnnualRate: 70,
    revenueStageRate: 35,
    profitTarget: 25000,
    profitActual: 18750,
    profitAnnualRate: 75,
    profitStageRate: 37.5,
    contractTarget: 50000,
    contractActual: 40000,
    contractAnnualRate: 80,
    contractStageRate: 40
  },
  {
    companyName: '算力科技',
    revenueTarget: 65000,
    revenueActual: 55250,
    revenueAnnualRate: 85,
    revenueStageRate: 42.5,
    profitTarget: 18000,
    profitActual: 14400,
    profitAnnualRate: 80,
    profitStageRate: 40,
    contractTarget: 40000,
    contractActual: 36000,
    contractAnnualRate: 90,
    contractStageRate: 45
  },
  {
    companyName: '数字产业',
    revenueTarget: 50000,
    revenueActual: 32500,
    revenueAnnualRate: 65,
    revenueStageRate: 32.5,
    profitTarget: 12000,
    profitActual: 7200,
    profitAnnualRate: 60,
    profitStageRate: 30,
    contractTarget: 30000,
    contractActual: 21000,
    contractAnnualRate: 70,
    contractStageRate: 35
  },
  {
    companyName: '数据交易中心',
    revenueTarget: 45000,
    revenueActual: 36000,
    revenueAnnualRate: 80,
    revenueStageRate: 40,
    profitTarget: 10000,
    profitActual: 7500,
    profitAnnualRate: 75,
    profitStageRate: 37.5,
    contractTarget: 26000,
    contractActual: 20800,
    contractAnnualRate: 80,
    contractStageRate: 40
  },
  {
    companyName: '楚天云公司',
    revenueTarget: 38000,
    revenueActual: 26600,
    revenueAnnualRate: 70,
    revenueStageRate: 35,
    profitTarget: 6000,
    profitActual: 4200,
    profitAnnualRate: 70,
    profitStageRate: 35,
    contractTarget: 18000,
    contractActual: 12600,
    contractAnnualRate: 70,
    contractStageRate: 35
  },
  {
    companyName: '政务数据服务',
    revenueTarget: 22000,
    revenueActual: 11000,
    revenueAnnualRate: 50,
    revenueStageRate: 25,
    profitTarget: 4000,
    profitActual: 2000,
    profitAnnualRate: 50,
    profitStageRate: 25,
    contractTarget: 10000,
    contractActual: 5000,
    contractAnnualRate: 50,
    contractStageRate: 25
  }
]);

// 弹窗详情数据
const detailData = ref({
  companyName: '集团本部',
  revenue: 108000,
  revenueNext: 115000,
  revenueRate1: 6.5,
  revenueRate2: 12.3,
  profit: 28000,
  profitNext: 30500,
  profitRate1: 8.9,
  profitRate2: 15.1,
  contract: 63000,
  contractNext: 68000,
  contractRate1: 7.9,
  contractRate2: 10.5,
  invest: 18500,
  investNext: 20000,
  investRate1: 8.1,
  investRate3: -2.3
});

// 标签色彩分类
const getRateTagClass = (rate: number) => {
  if (rate >= 80) return 'tag-green';
  if (rate >= 70) return 'tag-blue';
  if (rate >= 60) return 'tag-purple';
  return 'tag-orange';
};

type XlsxModule = typeof import('xlsx');

// xlsx 使用安全 alias 包，保留动态导入以避免增加驾驶舱首屏体积
const loadXlsxLibrary = async (): Promise<XlsxModule> => import('xlsx');

// 导出子公司经营明细数据为标准的 XLSX 格式 (支持多级表头合并)
const handleExport = async () => {
  let loadingInstance: ReturnType<typeof ElLoading.service> | null = null;
  try {
    // 1. 启动 Element Loading 友好加载状态
    loadingInstance = ElLoading.service({
      text: '正在配置导出引擎...',
      background: 'rgba(255, 255, 255, 0.7)'
    });

    // 2. 异步动态加载 SheetJS，不侵入 node_modules 且规避编译/依赖版本冲突
    const XLSX = await loadXlsxLibrary();

    loadingInstance.setText('正在构建二级表头与数据行...');

    // 3. 构建二维数组 (AOA) 数据结构，行和列对应双级表头的物理格位置
    const aoaData = [
      // 第一行表头：包含空字符串占位以配合合并单元格
      ['公司名称', '营业收入', '', '', '', '利润总额', '', '', '', '新签合同额', '', '', ''],
      // 第二行表头：具体指标名称
      [
        '',
        '营收目标(万)',
        '实际营收(万)',
        '年化进度',
        '阶段进度',
        '利润目标(万)',
        '实际利润(万)',
        '年化进度',
        '阶段进度',
        '合同目标(万)',
        '实际合同(万)',
        '年化进度',
        '阶段进度'
      ],
      // 数据实体行
      ...companyList.value.map((item) => [
        item.companyName,
        item.revenueTarget,
        item.revenueActual,
        `${item.revenueAnnualRate}%`,
        `${item.revenueStageRate}%`,
        item.profitTarget,
        item.profitActual,
        `${item.profitAnnualRate}%`,
        `${item.profitStageRate}%`,
        item.contractTarget,
        item.contractActual,
        `${item.contractAnnualRate}%`,
        `${item.contractStageRate}%`
      ])
    ];

    // 4. 定义合并规则 (merges)，s 表示 Start (r行, c列)，e 表示 End (r行, c列)，皆为 0 索引
    const merges = [
      // 公司名称：纵向合并第一列的两行 (A1:A2)
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
      // 营业收入：横向合并第一行的第2至5列 (B1:E1)
      { s: { r: 0, c: 1 }, e: { r: 0, c: 4 } },
      // 利润总额：横向合并第一行的第6至9列 (F1:I1)
      { s: { r: 0, c: 5 }, e: { r: 0, c: 8 } },
      // 新签合同额：横向合并第一行的第10至13列 (J1:M1)
      { s: { r: 0, c: 9 }, e: { r: 0, c: 12 } }
    ];

    // 5. 利用 SheetJS 初始化 Workbook 并转换 AOA 数据
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoaData);

    // 注入合并规则和列宽信息，规避导出后内容过于拥挤或被 "###" 遮蔽
    ws['!merges'] = merges;
    ws['!cols'] = [
      { wch: 18 }, // 公司名称
      { wch: 13 },
      { wch: 13 },
      { wch: 10 },
      { wch: 10 }, // 营业收入明细
      { wch: 13 },
      { wch: 13 },
      { wch: 10 },
      { wch: 10 }, // 利润总额明细
      { wch: 13 },
      { wch: 13 },
      { wch: 10 },
      { wch: 10 } // 新签合同额明细
    ];

    // 6. 将配置好的 Worksheet 装载入 Book，触发浏览器下载标准 XLSX 文件
    XLSX.utils.book_append_sheet(wb, ws, '子公司经营明细');

    const timestamp = new Date().getTime();
    XLSX.writeFile(wb, `子公司经营明细_${timestamp}.xlsx`);

    ElMessage.success('子公司经营明细数据导出成功！');
  } catch (error: unknown) {
    console.error('导出 Excel 失败:', error);
    ElMessage.error(error instanceof Error ? error.message : '导出失败，请重试！');
  } finally {
    if (loadingInstance) {
      loadingInstance.close();
    }
  }
};

// 表格行点击，拉起详情分析
const handleRowClick = (row: any) => {
  detailData.value = {
    companyName: row.companyName,
    revenue: row.revenueActual,
    revenueNext: Math.round(row.revenueActual * 1.06),
    revenueRate1: 6.5,
    revenueRate2: 12.3,
    profit: row.profitActual,
    profitNext: Math.round(row.profitActual * 1.09),
    profitRate1: 8.9,
    profitRate2: 15.1,
    contract: row.contractActual,
    contractNext: Math.round(row.contractActual * 1.08),
    contractRate1: 7.9,
    contractRate2: 10.5,
    invest: Math.round(row.revenueActual * 0.17),
    investNext: Math.round(row.revenueActual * 0.18),
    investRate1: 8.1,
    investRate3: -2.3
  };
  dialogVisible.value = true;
  nextTick(() => initDetailChart());
};

// 1. 初始化趋势图（平滑折线 + 节点高亮 + 双行X轴 + 定制气泡Label）
const initTrendChart = () => {
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#334155', fontSize: 12 },
      extraCssText: 'box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); backdrop-filter: blur(4px); border-radius: 8px; padding: 12px;',
      formatter: (params: any) => {
        let html = `<div style="font-weight: bold; margin-bottom: 6px; color: #1e293b;">${params[0].name.replace('\n', ' ')}</div>`;
        params.forEach((item: any) => {
          html += `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 4px;">
              <span style="display: flex; align-items: center; gap: 6px; color: #64748b;">
                <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: ${item.color}; border: 1.5px solid #fff; box-shadow: 0 0 4px ${item.color};"></span>
                ${item.seriesName}
              </span>
              <span style="font-weight: bold; color: #334155;">${item.value.toLocaleString()} 万元</span>
            </div>
          `;
        });
        return html;
      }
    },
    legend: {
      show: true,
      bottom: 0,
      icon: 'circle',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 24,
      data: ['营收(万元)', '利润(万元)', '合同(万元)', '投资(万元)', '研发(万元)'],
      textStyle: { color: '#64748b', fontSize: 12 }
    },
    grid: { left: '3%', right: '4%', bottom: '12%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月(预测)'],
      axisLine: { lineStyle: { color: '#cbd5e1' } },
      axisTick: { alignWithLabel: true },
      axisLabel: {
        color: '#64748b',
        fontSize: 12,
        interval: 0,
        formatter: (value: string) => {
          if (value === '1月') return 'Q1\n1月';
          if (value === '2月') return '\n2月';
          if (value === '3月') return 'Q1\n3月';
          if (value === '4月') return 'Q2\n4月';
          if (value === '5月') return '\n5月';
          if (value === '6月(预测)') return 'Q2\n6月(预测)';
          return value;
        }
      }
    },
    yAxis: {
      type: 'value',
      max: 8000,
      interval: 1000,
      splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
      axisLine: { show: false },
      axisLabel: { color: '#64748b' }
    },
    series: [
      {
        name: '营收(万元)',
        type: 'line',
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, color: '#4F8BFF' },
        itemStyle: { color: '#fff', borderColor: '#4F8BFF', borderWidth: 2 },
        data: [
          5200,
          4800,
          {
            value: 6100,
            symbolSize: 10,
            itemStyle: { color: '#fff', borderColor: '#4F8BFF', borderWidth: 3 },
            label: {
              show: true,
              position: 'top',
              color: '#4F8BFF',
              fontWeight: 'bold',
              fontSize: 11,
              formatter: 'Q1: 16,100',
              offset: [0, -4]
            }
          },
          5800,
          6500,
          {
            value: 7200,
            symbolSize: 10,
            itemStyle: { color: '#fff', borderColor: '#4F8BFF', borderWidth: 3 },
            label: {
              show: true,
              position: 'top',
              color: '#4F8BFF',
              fontWeight: 'bold',
              fontSize: 11,
              formatter: 'Q2: 19,500',
              offset: [0, -4]
            }
          }
        ]
      },
      {
        name: '利润(万元)',
        type: 'line',
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, color: '#4CAF50' },
        itemStyle: { color: '#fff', borderColor: '#4CAF50', borderWidth: 2 },
        data: [
          1100,
          980,
          {
            value: 1300,
            symbolSize: 10,
            itemStyle: { color: '#fff', borderColor: '#4CAF50', borderWidth: 3 },
            label: {
              show: true,
              position: 'top',
              color: '#4CAF50',
              fontWeight: 'bold',
              fontSize: 11,
              formatter: 'Q1: 3,430',
              offset: [0, -4]
            }
          },
          1250,
          1500,
          {
            value: 1800,
            symbolSize: 10,
            itemStyle: { color: '#fff', borderColor: '#4CAF50', borderWidth: 3 },
            label: {
              show: true,
              position: 'top',
              color: '#4CAF50',
              fontWeight: 'bold',
              fontSize: 11,
              formatter: 'Q2: 4,600',
              offset: [0, -4]
            }
          }
        ]
      },
      {
        name: '合同(万元)',
        type: 'line',
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, color: '#A855F7' },
        itemStyle: { color: '#fff', borderColor: '#A855F7', borderWidth: 2 },
        data: [
          3000,
          2800,
          {
            value: 3800,
            symbolSize: 10,
            itemStyle: { color: '#fff', borderColor: '#A855F7', borderWidth: 3 },
            label: {
              show: true,
              position: 'top',
              color: '#A855F7',
              fontWeight: 'bold',
              fontSize: 11,
              formatter: 'Q1: 9,600',
              offset: [0, -4]
            }
          },
          3600,
          4100,
          {
            value: 5000,
            symbolSize: 10,
            itemStyle: { color: '#fff', borderColor: '#A855F7', borderWidth: 3 },
            label: {
              show: true,
              position: 'top',
              color: '#A855F7',
              fontWeight: 'bold',
              fontSize: 11,
              formatter: 'Q2: 12,800',
              offset: [0, -4]
            }
          }
        ]
      },
      {
        name: '投资(万元)',
        type: 'line',
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, color: '#EAB308' },
        itemStyle: { color: '#fff', borderColor: '#EAB308', borderWidth: 2 },
        data: [
          1800,
          1500,
          {
            value: 2200,
            symbolSize: 10,
            itemStyle: { color: '#fff', borderColor: '#EAB308', borderWidth: 3 },
            label: {
              show: true,
              position: 'top',
              color: '#EAB308',
              fontWeight: 'bold',
              fontSize: 11,
              formatter: 'Q1: 5,500',
              offset: [0, -4]
            }
          },
          2000,
          2400,
          {
            value: 2700,
            symbolSize: 10,
            itemStyle: { color: '#fff', borderColor: '#EAB308', borderWidth: 3 },
            label: {
              show: true,
              position: 'top',
              color: '#EAB308',
              fontWeight: 'bold',
              fontSize: 11,
              formatter: 'Q2: 7,100',
              offset: [0, -4]
            }
          }
        ]
      },
      {
        name: '研发(万元)',
        type: 'line',
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, color: '#F97316' },
        itemStyle: { color: '#fff', borderColor: '#F97316', borderWidth: 2 },
        data: [
          600,
          550,
          {
            value: 900,
            symbolSize: 10,
            itemStyle: { color: '#fff', borderColor: '#F97316', borderWidth: 3 },
            label: {
              show: true,
              position: 'top',
              color: '#F97316',
              fontWeight: 'bold',
              fontSize: 11,
              formatter: 'Q1: 2,100',
              offset: [0, -4]
            }
          },
          800,
          950,
          {
            value: 1100,
            symbolSize: 10,
            itemStyle: { color: '#fff', borderColor: '#F97316', borderWidth: 3 },
            label: {
              show: true,
              position: 'top',
              color: '#F97316',
              fontWeight: 'bold',
              fontSize: 11,
              formatter: 'Q2: 2,850',
              offset: [0, -4]
            }
          }
        ]
      }
    ]
  };
  initOrUpdateChart('trend', trendChart.value, option);
};

// 2. 初始化首页底部三个对比柱状图（带渐变圆角）
const initBarCharts = () => {
  const names = companyList.value.map((i) => i.companyName);
  const revenueData = companyList.value.map((i) => i.revenueActual);
  const profitData = companyList.value.map((i) => i.profitActual);
  const contractData = companyList.value.map((i) => i.contractActual);

  const getBarOption = (data: number[], color1: string, color2: string) => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e2e8f0',
      textStyle: { color: '#333' }
    },
    grid: { left: '3%', right: '3%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: names,
      axisLabel: { interval: 0, rotate: 25, fontSize: 10, color: '#64748b' },
      axisLine: { lineStyle: { color: '#cbd5e1' } }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
      axisLine: { show: false }
    },
    series: [
      {
        type: 'bar',
        data: data,
        barWidth: 16,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: color1 },
            { offset: 1, color: color2 }
          ])
        }
      }
    ]
  });

  initOrUpdateChart('revenueBar', revenueBar.value, getBarOption(revenueData, '#4080FF', '#88B0FF'));
  initOrUpdateChart('profitBar', profitBar.value, getBarOption(profitData, '#67C23A', '#A3E287'));
  initOrUpdateChart('contractBar', contractBar.value, getBarOption(contractData, '#9B59B6', '#C39BD3'));
};

// 3. 弹窗趋势图美化
const initDetailChart = () => {
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e2e8f0',
      textStyle: { color: '#333' }
    },
    legend: { data: ['营收', '利润', '合同', '投资', '研发'], bottom: 0, textStyle: { color: '#64748b' } },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月'],
      axisLine: { lineStyle: { color: '#cbd5e1' } },
      axisLabel: { color: '#64748b' }
    },
    yAxis: {
      type: 'value',
      max: 21000,
      splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }
    },
    series: [
      {
        name: '营收',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: [15200, 14800, 16200, 17000, 17800],
        itemStyle: { color: '#4080FF' }
      },
      {
        name: '利润',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: [4200, 4000, 4500, 4800, 5100],
        itemStyle: { color: '#67C23A' }
      },
      {
        name: '合同',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: [9000, 8800, 9800, 10500, 11200],
        itemStyle: { color: '#9B59B6' }
      },
      {
        name: '投资',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: [3800, 3500, 4000, 4300, 4600],
        itemStyle: { color: '#E6A23C' }
      },
      {
        name: '研发',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: [1500, 1600, 1800, 2000, 2200],
        itemStyle: { color: '#E67E22' }
      }
    ]
  };
  initOrUpdateChart('detail', detailChart.value, option);
};

// 4. 打开大屏并启动科技时钟
const openBigScreen = () => {
  bigScreenVisible.value = true;
  document.body.style.overflow = 'hidden'; // 大屏开启时，强制隐藏全局/底层滚动条
  updateTechTime();
  if (timeIntervalId) clearInterval(timeIntervalId);
  timeIntervalId = setInterval(updateTechTime, 1000);

  nextTick(() => {
    setTimeout(() => {
      initBigScreenCharts();
    }, 150);
  });
};

// 关闭大屏演示并销毁时钟
const closeBigScreen = () => {
  bigScreenVisible.value = false;
  document.body.style.overflow = ''; // 还原滚动条
  if (timeIntervalId) {
    clearInterval(timeIntervalId);
    timeIntervalId = null;
  }
  // 关闭时也安全清理大屏专用的ECharts实例，节省内存
  const bigKeys = ['bigMain', 'revenueRank', 'profitRank', 'contractRank'];
  bigKeys.forEach((k) => {
    if (chartInstances[k]) {
      chartInstances[k]?.dispose();
      chartInstances[k] = null;
    }
  });
};

// 5. 初始化大屏图表
const initBigScreenCharts = () => {
  initBigMainChart();
  initBigBottomCharts();
};

// 6. 大屏主图表（带背景轨道的横向渐变圆角柱状图）
const initBigMainChart = () => {
  updateBigMainChart();
};

// 7. 更新大屏主图表数据与动态配色
const updateBigMainChart = () => {
  const sortedList = [...companyList.value].sort((a, b) => a.revenueActual - b.revenueActual);
  const names = sortedList.map((i) => i.companyName);
  let data: number[] = [];
  let colorRange: [string, string] = ['#2563eb', '#38bdf8']; // 默认营收青蓝

  if (bigActiveTab.value === 'revenue') {
    colorRange = ['#2563eb', '#38bdf8'];
    if (bigViewTab.value === 'actual') {
      data = sortedList.map((i) => i.revenueActual);
    } else if (bigViewTab.value === 'target') {
      data = sortedList.map((i) => i.revenueTarget);
    } else {
      data = sortedList.map((i) => i.revenueStageRate);
    }
  } else if (bigActiveTab.value === 'profit') {
    colorRange = ['#16a34a', '#4ade80'];
    if (bigViewTab.value === 'actual') {
      data = sortedList.map((i) => i.profitActual);
    } else if (bigViewTab.value === 'target') {
      data = sortedList.map((i) => i.profitTarget);
    } else {
      data = sortedList.map((i) => i.profitStageRate);
    }
  } else {
    colorRange = ['#7c3aed', '#c084fc'];
    if (bigViewTab.value === 'actual') {
      data = sortedList.map((i) => i.contractActual);
    } else if (bigViewTab.value === 'target') {
      data = sortedList.map((i) => i.contractTarget);
    } else {
      data = sortedList.map((i) => i.contractStageRate);
    }
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: '#334155',
      borderWidth: 1,
      textStyle: { color: '#f8fafc', fontSize: 13 },
      extraCssText: 'box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); backdrop-filter: blur(4px);'
    },
    grid: { left: '4%', right: '8%', bottom: '3%', top: '5%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: names,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
      splitLine: { show: false }
    },
    series: [
      {
        type: 'bar',
        data: data,
        barWidth: 14,
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(255, 255, 255, 0.02)',
          borderRadius: [0, 7, 7, 0]
        },
        itemStyle: {
          borderRadius: [0, 7, 7, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: colorRange[0] },
            { offset: 1, color: colorRange[1] }
          ])
        },
        label: {
          show: true,
          position: 'right',
          color: '#f8fafc',
          fontWeight: 'bold',
          formatter: (params: any) => {
            if (bigViewTab.value === 'rate') {
              return params.value + '%';
            }
            return params.value + ' 万';
          }
        }
      }
    ]
  };

  initOrUpdateChart('bigMain', bigMainChart.value, option);
};

// 8. 大屏底部三个子图表丰富化改造（南丁格尔玫瑰图 + 科技雷达图 + 渐变折线面积图）
const initBigBottomCharts = () => {
  // 1) 营业收入占比 - 炫酷南丁格尔玫瑰图 (Rose Pie Chart)
  const pieColors = [
    '#38bdf8', // 集团本部：天蓝色
    '#4ade80', // 投资并购：嫩绿色
    '#c084fc', // 算力科技：淡紫色
    '#fb923c', // 数字产业：温暖橙
    '#f472b6', // 数据交易中心：浪漫粉
    '#fbbf24', // 楚天云公司：亮黄色
    '#22d3ee' // 政务数据服务：湖蓝色
  ];

  const pieData = companyList.value.map((i) => ({
    name: i.companyName,
    value: i.revenueActual
  }));

  const revenueOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#334155',
      borderWidth: 1,
      textStyle: { color: '#f8fafc', fontSize: 12 },
      extraCssText: 'box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35); backdrop-filter: blur(4px); border-radius: 6px;',
      formatter: '{b}: <span style="color:#38bdf8;font-weight:bold;">{c}</span> 万元 ({d}%)'
    },
    color: pieColors,
    series: [
      {
        name: '营业收入占比',
        type: 'pie',
        radius: ['18%', '78%'],
        center: ['50%', '50%'],
        roseType: 'radius',
        itemStyle: {
          borderRadius: 5,
          borderColor: '#070d19',
          borderWidth: 2
        },
        label: {
          show: true,
          color: '#94a3b8',
          fontSize: 10,
          formatter: '{b}\n{d}%'
        },
        labelLine: {
          lineStyle: { color: '#334155' },
          smooth: 0.2,
          length: 4,
          length2: 8
        },
        data: pieData
      }
    ]
  };
  initOrUpdateChart('revenueRank', revenueRankChart.value, revenueOption);

  // 2) 利润目标与实际对比 - 双维度科技雷达图 (Radar Chart)
  // 获取最大利润数值以动态设置雷达图边界
  const maxProfitVal = Math.max(...companyList.value.map((i) => Math.max(i.profitActual, i.profitTarget)));
  const radarLimit = Math.ceil(maxProfitVal / 5000) * 5000;

  const radarOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#334155',
      borderWidth: 1,
      textStyle: { color: '#f8fafc', fontSize: 12 },
      extraCssText: 'box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35); backdrop-filter: blur(4px); border-radius: 6px;'
    },
    legend: {
      data: ['实际利润', '利润目标'],
      textStyle: { color: '#94a3b8', fontSize: 10 },
      bottom: 0,
      icon: 'roundRect',
      itemWidth: 12,
      itemHeight: 8,
      itemGap: 16
    },
    radar: {
      indicator: companyList.value.map((i) => ({ name: i.companyName, max: radarLimit })),
      shape: 'polygon',
      radius: '68%',
      center: ['50%', '43%'],
      axisName: { color: '#94a3b8', fontSize: 9 },
      splitNumber: 4,
      splitLine: {
        lineStyle: { color: 'rgba(0, 240, 255, 0.12)' }
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(0, 240, 255, 0.01)', 'rgba(0, 240, 255, 0.03)']
        }
      },
      axisLine: {
        lineStyle: { color: 'rgba(0, 240, 255, 0.12)' }
      }
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: companyList.value.map((i) => i.profitActual),
            name: '实际利润',
            symbol: 'circle',
            symbolSize: 4,
            lineStyle: { width: 2, color: '#4ade80' },
            itemStyle: { color: '#4ade80' },
            areaStyle: {
              color: new echarts.graphic.RadialGradient(0.5, 0.5, 0.5, [
                { offset: 0, color: 'rgba(74, 222, 128, 0.05)' },
                { offset: 1, color: 'rgba(74, 222, 128, 0.22)' }
              ])
            }
          },
          {
            value: companyList.value.map((i) => i.profitTarget),
            name: '利润目标',
            symbol: 'circle',
            symbolSize: 4,
            lineStyle: { width: 1.5, type: 'dashed', color: '#38bdf8' },
            itemStyle: { color: '#38bdf8' },
            areaStyle: {
              color: 'rgba(56, 189, 248, 0.05)'
            }
          }
        ]
      }
    ]
  };
  initOrUpdateChart('profitRank', profitRankChart.value, radarOption);

  // 3) 新签合同额趋势 - 优雅发光面积折线图 (Area Line Chart)
  // 按降序进行排列以展现高科技公司的梯队梯度趋势
  const sortedListCon = [...companyList.value].sort((a, b) => b.contractActual - a.contractActual);
  const conNames = sortedListCon.map((i) => i.companyName);
  const conVals = sortedListCon.map((i) => i.contractActual);

  const contractOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#334155',
      borderWidth: 1,
      textStyle: { color: '#f8fafc', fontSize: 12 },
      extraCssText: 'box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35); backdrop-filter: blur(4px); border-radius: 6px;',
      formatter: (params: any) => {
        return `${params[0].name}<br/>新签合同: <span style="color:#c084fc;font-weight:bold;">${params[0].value.toLocaleString()}</span> 万元`;
      }
    },
    grid: { left: '4%', right: '6%', bottom: '6%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: conNames,
      axisLabel: {
        color: '#94a3b8',
        fontSize: 9,
        interval: 0,
        rotate: 18
      },
      axisLine: { lineStyle: { color: '#334155' } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#94a3b8', fontSize: 9 },
      splitLine: {
        lineStyle: { color: '#1e293b', type: 'dashed' }
      },
      axisLine: { show: false }
    },
    series: [
      {
        name: '新签合同额',
        type: 'line',
        smooth: true,
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 3,
          color: '#c084fc',
          shadowColor: 'rgba(192, 132, 252, 0.45)',
          shadowBlur: 8
        },
        itemStyle: {
          color: '#c084fc',
          borderColor: '#070d19',
          borderWidth: 1.5
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(192, 132, 252, 0.32)' },
            { offset: 1, color: 'rgba(192, 132, 252, 0.01)' }
          ])
        },
        label: {
          show: true,
          position: 'top',
          color: '#f8fafc',
          fontSize: 9,
          fontWeight: 'bold',
          formatter: '{c}'
        },
        data: conVals
      }
    ]
  };
  initOrUpdateChart('contractRank', contractRankChart.value, contractOption);
};

// 监听大屏Tab的切换，以进行重绘
watch([bigActiveTab, bigViewTab], () => {
  if (bigScreenVisible.value) {
    updateBigMainChart();
  }
});

// window resize 事件回调（防抖优化）
const handleResize = () => {
  Object.values(chartInstances).forEach((instance) => {
    if (instance && !instance.isDisposed()) {
      instance.resize();
    }
  });
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  nextTick(() => {
    initTrendChart();
    initBarCharts();
  });
});

onUnmounted(() => {
  document.body.style.overflow = ''; // 还原滚动条，防止用户切走页面后宿主滚动条异常
  // 彻底移除定时器与 window resize 事件监听，规避内存泄露风险
  if (timeIntervalId) {
    clearInterval(timeIntervalId);
  }
  window.removeEventListener('resize', handleResize);

  // 清理所有的 ECharts 实例
  Object.keys(chartInstances).forEach((key) => {
    if (chartInstances[key]) {
      chartInstances[key]?.dispose();
      chartInstances[key] = null;
    }
  });
});
</script>

<style lang="scss" scoped>
/* 设计系统色彩变量 */
$primary-color: #00b46e;
$success-color: #52c41a;
$warning-color: #fa8c16;
$purple-color: #722ed1;
$orange-color: #fa541c;
$bg-main: #f8fafc;
$border-light: #e2e8f0;

.dashboard-page {
  // margin-bottom: 50px;
  // background-color: $bg-main;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

  &.big-screen-active {
    overflow: hidden !important;
    height: 100vh !important;
    min-height: 100vh !important;
    padding: 0 !important;
    margin: 0 !important;
  }
}

/* 顶部标题栏 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  padding: 16px 24px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);

  .title-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .title-decorator {
      width: 4px;
      height: 20px;
      background: linear-gradient(180deg, $primary-color, #597ef7);
      border-radius: 2px;
    }

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
    }

    .month-filter {
      display: flex;
      align-items: center;
      font-size: 14px;
      gap: 8px;
      color: #64748b;
      margin-left: 20px;

      :deep(.el-input__wrapper) {
        border-radius: 8px;
        box-shadow: 0 0 0 1px #e2e8f0 inset !important;
      }
    }
  }

  .big-screen-btn {
    background: linear-gradient(135deg, $primary-color, #597ef7);
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(47, 84, 235, 0.2);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(47, 84, 235, 0.3);
      opacity: 0.95;
    }

    &:active {
      transform: translateY(1px);
    }
  }
}

/* 卡片组（微型高光、Hover 3D浮动） */
.card-group {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 18px;
  margin-bottom: 24px;

  .card-item {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.6);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.02);
    display: flex;
    gap: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      opacity: 0.8;
    }

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
    }

    /* 各卡片主题配色 */
    &.card-revenue {
      &::before {
        background: linear-gradient(90deg, #4080ff, #85b0ff);
      }
      .icon-box {
        background: rgba(64, 128, 255, 0.08);
        color: #4080ff;
      }
      :deep(.el-progress-bar__inner) {
        background: linear-gradient(90deg, #4080ff, #85b0ff) !important;
      }
    }
    &.card-profit {
      &::before {
        background: linear-gradient(90deg, #67c23a, #a8e388);
      }
      .icon-box {
        background: rgba(103, 194, 58, 0.08);
        color: #67c23a;
      }
      :deep(.el-progress-bar__inner) {
        background: linear-gradient(90deg, #67c23a, #a8e388) !important;
      }
    }
    &.card-contract {
      &::before {
        background: linear-gradient(90deg, #9b59b6, #c59cd6);
      }
      .icon-box {
        background: rgba(155, 89, 182, 0.08);
        color: #9b59b6;
      }
      :deep(.el-progress-bar__inner) {
        background: linear-gradient(90deg, #9b59b6, #c59cd6) !important;
      }
    }
    &.card-invest {
      &::before {
        background: linear-gradient(90deg, #e6a23c, #f3d19e);
      }
      .icon-box {
        background: rgba(230, 162, 60, 0.08);
        color: #e6a23c;
      }
      :deep(.el-progress-bar__inner) {
        background: linear-gradient(90deg, #e6a23c, #f3d19e) !important;
      }
    }
    &.card-rnd {
      &::before {
        background: linear-gradient(90deg, #e67e22, #f5b075);
      }
      .icon-box {
        background: rgba(230, 126, 34, 0.08);
        color: #e67e22;
      }
      :deep(.el-progress-bar__inner) {
        background: linear-gradient(90deg, #e67e22, #f5b075) !important;
      }
    }

    .card-left {
      display: flex;
      align-items: flex-start;
      .icon-box {
        width: 42px;
        height: 42px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }
    }

    .card-right {
      flex: 1;
      display: flex;
      flex-direction: column;

      .card-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;

        .card-name {
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
        }

        .card-tag {
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }

        .tag-blue {
          background: #e0f2fe;
          color: #0284c7;
        }
        .tag-green {
          background: #dcfce7;
          color: #16a34a;
        }
        .tag-purple {
          background: #f3e8ff;
          color: #7c3aed;
        }
        .tag-yellow {
          background: #fef3c7;
          color: #d97706;
        }
        .tag-orange {
          background: #ffedd5;
          color: #ea580c;
        }
      }

      .card-value {
        font-size: 21px;
        font-weight: 700;
        color: #1e293b;
        margin-bottom: 8px;
        .unit {
          font-size: 12px;
          font-weight: 500;
          color: #94a3b8;
        }
      }

      .card-desc-group {
        display: flex;
        flex-direction: column;
        gap: 3px;
        margin-bottom: 12px;

        .desc-item {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          .desc-label {
            color: #94a3b8;
          }
          .desc-val {
            color: #64748b;
            font-weight: 500;
          }
        }
      }

      .card-progress {
        :deep(.el-progress-bar__outer) {
          background-color: #f1f5f9;
          border-radius: 4px;
        }
      }
    }
  }
}

/* 图表盒子 */
.chart-box {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  border: 1px solid $border-light;

  .chart-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 15px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 16px;

    .title-left {
      display: flex;
      align-items: center;
      gap: 8px;
      .title-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: $primary-color;
        box-shadow: 0 0 8px $primary-color;
      }
    }
  }
}

/* 表格盒子 */
.table-box {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  border: 1px solid $border-light;

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    font-size: 15px;
    font-weight: 600;
    color: #1e293b;

    .title-left {
      display: flex;
      align-items: center;
      gap: 8px;
      .title-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: $primary-color;
        box-shadow: 0 0 8px $primary-color;
      }
    }

    .export-btn {
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 500;
      background: #f0f5ff;
      color: $primary-color;
      border: 1px solid #adc6ff;
      transition: all 0.3s;

      &:hover {
        background: $primary-color;
        color: #fff;
        border-color: $primary-color;
      }
    }
  }

  .modern-table {
    border-radius: 8px;
    overflow: hidden;

    :deep(.el-table__header-wrapper) th {
      background-color: #f8fafc !important;
      color: #475569;
      font-weight: 600;
    }

    :deep(.el-table__row) {
      cursor: pointer;
      transition: background-color 0.2s;
      &:hover {
        background-color: #f1f5f9 !important;
      }
    }
  }

  /* 明细完成率胶囊 Tag */
  .completion-tag {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    text-align: center;

    &.tag-green {
      background-color: #ecfdf5;
      color: #059669;
    }
    &.tag-blue {
      background-color: #eff6ff;
      color: #2563eb;
    }
    &.tag-purple {
      background-color: #faf5ff;
      color: #7c3aed;
    }
    &.tag-orange {
      background-color: #fff7ed;
      color: #ea580c;
    }
  }
}

/* 柱状图对比组 - 渲染原先缺失的底部图表 */
.bar-group {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-bottom: 20px;

  .bar-item {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
    border: 1px solid $border-light;

    .bar-title {
      font-size: 14px;
      font-weight: 600;
      color: #475569;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;

      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        &.blue {
          background-color: #4080ff;
          box-shadow: 0 0 6px #4080ff;
        }
        &.green {
          background-color: #67c23a;
          box-shadow: 0 0 6px #67c23a;
        }
        &.purple {
          background-color: #9b59b6;
          box-shadow: 0 0 6px #9b59b6;
        }
      }
    }
  }
}

/* 弹窗高级样式美化 */
:deep(.modern-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);

  .el-dialog__header {
    padding: 20px 24px 10px;
    border-bottom: 1px solid #f1f5f9;
    .el-dialog__title {
      font-size: 17px;
      font-weight: 600;
      color: #1e293b;
    }
  }

  .el-dialog__body {
    padding: 20px 24px 24px;
  }
}

.detail-header {
  text-align: right;
  margin-bottom: 14px;
  .month-text {
    font-size: 12px;
    font-weight: 500;
    color: #94a3b8;
    background: #f1f5f9;
    padding: 4px 12px;
    border-radius: 20px;
  }
}

.detail-top-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 24px;

  .detail-card {
    padding: 16px;
    border-radius: 10px;
    transition: transform 0.2s;

    &:hover {
      transform: translateY(-2px);
    }

    &.card-blue {
      background: #f0f6ff;
      border: 1px solid #d0e1ff;
    }
    &.card-green {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
    }
    &.card-purple {
      background: #faf5ff;
      border: 1px solid #f3e8ff;
    }
    &.card-yellow {
      background: #fffbeb;
      border: 1px solid #fef3c7;
    }

    .detail-card-title {
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
      margin-bottom: 6px;
    }
    .detail-card-value {
      font-size: 19px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 4px;
      .unit {
        font-size: 11px;
        color: #94a3b8;
        font-weight: 500;
      }
    }
    .detail-card-sub {
      font-size: 12px;
      color: #94a3b8;
      margin-bottom: 8px;
    }
    .detail-card-rate {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 11px;
      font-weight: 600;

      .up {
        color: #16a34a;
        display: flex;
        align-items: center;
        gap: 2px;
      }
      .down {
        color: #dc2626;
        display: flex;
        align-items: center;
        gap: 2px;
      }
    }
  }
}

.detail-chart-wrap {
  .chart-title {
    font-size: 14px;
    font-weight: 600;
    color: #475569;
    margin-bottom: 12px;
  }
}

/* ==========================================================================
   大屏演示模式极客/科幻风格重构
   ========================================================================== */
.big-screen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle at center, #070d19 0%, #03060c 100%);
  color: #fff;
  z-index: 9999;
  padding: 16px 24px 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  user-select: none;

  /* 科技光晕底饰 */
  .big-screen-bg-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(0, 240, 255, 0.05) 0%, transparent 70%);
    pointer-events: none;
    z-index: 1;
  }

  /* 科技网格线 */
  .big-screen-grid-lines {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px);
    background-size: 30px 30px;
    pointer-events: none;
    z-index: 2;
  }

  /* 科幻流线型对称头部 */
  .big-header {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 64px;
    margin-bottom: 16px;
    z-index: 10;
    border-bottom: 2px solid rgba(0, 240, 255, 0.15);

    &::before,
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      width: 80px;
      height: 4px;
      background: #00f0ff;
      box-shadow: 0 0 10px #00f0ff;
    }
    &::before {
      left: 10%;
    }
    &::after {
      right: 10%;
    }

    .header-left {
      width: 25%;
      .tech-time {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(30, 41, 59, 0.4);
        padding: 6px 14px;
        border-radius: 4px;
        border: 1px solid rgba(0, 240, 255, 0.1);
        width: fit-content;

        .time-icon {
          color: #00f0ff;
          animation: pulse 2s infinite;
        }

        .time-text {
          font-family: 'Courier New', Courier, monospace;
          font-size: 13px;
          color: #94a3b8;
          font-weight: bold;
          letter-spacing: 1px;
        }
      }
    }

    .header-center {
      position: relative;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .header-title-glare {
        position: absolute;
        top: -10px;
        width: 150px;
        height: 10px;
        background: rgba(0, 240, 255, 0.3);
        filter: blur(10px);
        animation: wave 4s infinite linear;
      }

      .header-title {
        margin: 0;
        font-size: 22px;
        font-weight: 800;
        letter-spacing: 3px;
        background: linear-gradient(180deg, #ffffff 0%, #a5f3fc 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 15px rgba(0, 240, 255, 0.4);
      }

      .header-title-sub {
        font-size: 10px;
        color: #00f0ff;
        opacity: 0.6;
        letter-spacing: 2px;
        margin-top: 2px;
      }
    }

    .header-right {
      width: 25%;
      display: flex;
      justify-content: flex-end;

      .tech-exit-btn {
        position: relative;
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(0, 240, 255, 0.3);
        border-radius: 4px;
        color: #00f0ff;
        padding: 6px 16px;
        font-size: 12px;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        transition: all 0.3s;
        overflow: hidden;

        &:hover {
          background: rgba(0, 240, 255, 0.15);
          border-color: #00f0ff;
          box-shadow: 0 0 12px rgba(0, 240, 255, 0.4);

          .btn-scan {
            left: 100%;
          }
        }

        .btn-scan {
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.4), transparent);
          transition: all 0.5s ease;
        }
      }
    }
  }

  /* 大屏核心汇总指标 */
  .big-screen-summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 16px;
    z-index: 10;

    .summary-item {
      background: rgba(15, 23, 42, 0.55);
      border: 1px solid rgba(0, 240, 255, 0.08);
      border-radius: 6px;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      backdrop-filter: blur(8px);

      .summary-icon {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: rgba(0, 240, 255, 0.08);
        border: 1px solid rgba(0, 240, 255, 0.2);
        color: #00f0ff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: 0 0 10px rgba(0, 240, 255, 0.1);
      }

      .summary-info {
        .summary-label {
          font-size: 12px;
          color: #94a3b8;
          margin-bottom: 4px;
        }
        .summary-value {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 1px;
          display: flex;
          align-items: baseline;
          gap: 4px;

          &.text-blue {
            color: #38bdf8;
            text-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
          }
          &.text-green {
            color: #4ade80;
            text-shadow: 0 0 10px rgba(74, 222, 128, 0.3);
          }
          &.text-purple {
            color: #c084fc;
            text-shadow: 0 0 10px rgba(192, 132, 252, 0.3);
          }

          .unit {
            font-size: 11px;
            color: #64748b;
            font-weight: 500;
          }
        }
      }
    }
  }

  /* CSS 科技边框卡片包装器 */
  .tech-card-container {
    position: relative;
    background: rgba(15, 23, 42, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.04);
    box-shadow: inset 0 0 20px rgba(0, 240, 255, 0.03);
    border-radius: 6px;
    z-index: 10;
    backdrop-filter: blur(8px);

    /* 经典科技感四角定位标识 */
    .tech-corners {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      span {
        position: absolute;
        width: 10px;
        height: 10px;
        border-color: #00f0ff;
        border-style: solid;
        opacity: 0.8;
        &:nth-child(1) {
          top: 0;
          left: 0;
          border-width: 2px 0 0 2px;
        }
        &:nth-child(2) {
          top: 0;
          right: 0;
          border-width: 2px 2px 0 0;
        }
        &:nth-child(3) {
          bottom: 0;
          left: 0;
          border-width: 0 0 2px 2px;
        }
        &:nth-child(4) {
          bottom: 0;
          right: 0;
          border-width: 0 2px 2px 0;
        }
      }
    }
  }

  /* 大屏主图表板块 */
  .big-screen-main-chart {
    flex: 1;
    height: 0;
    padding: 16px 20px;
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .chart-title-tech {
        font-size: 13px;
        font-weight: bold;
        color: #f8fafc;
        display: flex;
        align-items: center;
        gap: 6px;
        letter-spacing: 1px;

        .tech-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #00f0ff;
          box-shadow: 0 0 8px #00f0ff;
        }
      }

      .big-screen-tabs {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-shrink: 0;
        white-space: nowrap;

        /* 重绘科技感 EPlus Tab 按钮，强制抹消原生浅色白底样式与任何边框 */
        .tab-group-tech,
        .view-tab-group-tech {
          background: rgba(15, 23, 42, 0.65) !important;
          padding: 2px;
          border-radius: 4px;
          border: 1px solid rgba(0, 240, 255, 0.15) !important;
          display: inline-flex !important;
          align-items: center;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
          flex-wrap: nowrap !important; /* 强制内部绝对不换行 */
          white-space: nowrap !important;

          :deep(.el-radio-button) {
            border: none !important;
            box-shadow: none !important;
            outline: none !important;

            .el-radio-button__inner {
              background: transparent !important;
              color: #64748b !important;
              border: none !important;
              border-left: none !important;
              border-right: none !important;
              border-top: none !important;
              border-bottom: none !important;
              box-shadow: none !important;
              outline: none !important;
              font-size: 11px;
              padding: 4px 8px !important; /* 调小内边距，确保一排绝对能放下 */
              font-weight: bold;
              border-radius: 3px !important;
              transition: all 0.3s ease;
              text-shadow: none !important;
            }

            /* 地毯式干掉 Element Plus 特异性极高的首尾元素边框 */
            &:first-child .el-radio-button__inner {
              border: none !important;
              border-left: none !important;
              border-radius: 3px 0 0 3px !important;
            }

            &:last-child .el-radio-button__inner {
              border: none !important;
              border-right: none !important;
              border-radius: 0 3px 3px 0 !important;
            }

            &.is-active .el-radio-button__inner,
            .el-radio-button__orig-radio:checked + .el-radio-button__inner {
              background: rgba(0, 240, 255, 0.15) !important;
              color: #00f0ff !important;
              text-shadow: 0 0 5px rgba(0, 240, 255, 0.4) !important;
              box-shadow: inset 0 0 8px rgba(0, 240, 255, 0.1) !important;
              border: none !important;
              border-left: none !important;
              border-right: none !important;
              border-top: none !important;
              border-bottom: none !important;
            }

            &:hover .el-radio-button__inner {
              color: #e2e8f0 !important;
            }
          }
        }
      }
    }

    .chart-content {
      flex: 1;
      position: relative;
    }
  }

  /* 下方三个排名图板块 - 修改为 flex 1 配合主图 1:1 均分空间 */
  .big-screen-bottom {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    flex: 1;
    height: 0;

    .bottom-chart {
      padding: 12px 16px;
      display: flex;
      flex-direction: column;

      .chart-title-tech {
        font-size: 12px;
        font-weight: bold;
        color: #f8fafc;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;

        .tech-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          &.blue {
            background-color: #38bdf8;
            box-shadow: 0 0 6px #38bdf8;
          }
          &.green {
            background-color: #4ade80;
            box-shadow: 0 0 6px #4ade80;
          }
          &.purple {
            background-color: #c084fc;
            box-shadow: 0 0 6px #c084fc;
          }
        }
      }

      .chart-content {
        flex: 1;
        position: relative;
      }
    }
  }
}

/* ==========================================================================
   CSS 微交互动效
   ========================================================================== */
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.15);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
}

@keyframes wave {
  0% {
    transform: translateX(-150px) rotate(-15deg);
  }
  100% {
    transform: translateX(150px) rotate(-15deg);
  }
}
</style>
