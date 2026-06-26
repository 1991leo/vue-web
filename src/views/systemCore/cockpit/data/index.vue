<template>
  <div class="data-fill-container">
    <div class="data-fill-main">
      <div class="operation-row">
        <div class="tabs-header-row">
          <HeaderTabs v-model="activeTab" :tabs="reportTabs" :show-count="false" @change="handleTabChange" />
        </div>

        <div class="operation-actions">
          <div v-if="activeTab === 'cumulative'" class="period-control">
            <span class="label">选择月份</span>
            <el-date-picker
              v-model="selectedMonth"
              type="month"
              format="YYYY年MM月"
              value-format="YYYY-MM"
              placeholder="选择月份"
              class="month-picker"
              :clearable="false"
            />
          </div>

          <div v-if="activeTab === 'quarter'" class="period-control">
            <span class="label">选择季度</span>
            <el-select v-model="selectedQuarter" placeholder="请选择季度" class="quarter-select">
              <el-option label="第一季度" value="1" />
              <el-option label="第二季度" value="2" />
              <el-option label="第三季度" value="3" />
              <el-option label="第四季度" value="4" />
            </el-select>
          </div>

          <el-button type="primary" :loading="submitLoading" @click="handleSave">
            {{ saveButtonText }}
          </el-button>
        </div>
      </div>

      <div v-loading="loading" class="main-content">
        <div class="tab-content">
          <div class="summary-section">
            <div class="target-grid">
              <div v-for="item in metricConfigs" :key="item.key" class="target-card" :class="`card-${item.key}`">
                <img class="metric-icon" :src="item.icon" :alt="item.label" />
                <div class="metric-label">{{ item.label }}（万元）</div>
                <div class="metric-value">
                  <div v-if="canEditCurrentReport" class="hover-edit-field metric-edit-field">
                    <span class="display-value">{{ formatDisplayValue(currentReport[item.field]) }}</span>
                    <el-input
                      class="edit-input"
                      :model-value="currentReport[item.field]"
                      placeholder="请输入金额"
                      inputmode="decimal"
                      @update:model-value="updateCurrentReportField(item.field, $event)"
                    />
                  </div>
                  <span v-else>{{ formatDisplayValue(currentReport[item.field]) }}</span>
                </div>
                <div class="metric-period">{{ currentMetricSubtitle }}</div>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <PageTitle :title="currentTableTitle" />
            <div class="table-container">
              <CommonTable :data="reportTableRows" :columns="reportTableColumns" :loading="loading" row-key="deptId" max-height="100%">
                <template #deptName="{ row }">
                  <span :class="{ 'total-row-text': row.isTotal }">{{ row.deptName || fallbackDeptName }}</span>
                </template>
                <template #operatingRevenue="{ row }">
                  <div v-if="canEditDetailRow(row)" class="hover-edit-field table-edit-field">
                    <span class="display-value">{{ formatDisplayValue(row.operatingRevenue) }}</span>
                    <el-input
                      class="cell-input edit-input"
                      :model-value="row.operatingRevenue"
                      inputmode="decimal"
                      @update:model-value="updateDetailReportField(row, 'operatingRevenue', $event)"
                    />
                  </div>
                  <span v-else>{{ formatDisplayValue(row.operatingRevenue) }}</span>
                </template>
                <template #totalProfit="{ row }">
                  <div v-if="canEditDetailRow(row)" class="hover-edit-field table-edit-field">
                    <span class="display-value">{{ formatDisplayValue(row.totalProfit) }}</span>
                    <el-input
                      class="cell-input edit-input"
                      :model-value="row.totalProfit"
                      inputmode="decimal"
                      @update:model-value="updateDetailReportField(row, 'totalProfit', $event)"
                    />
                  </div>
                  <span v-else>{{ formatDisplayValue(row.totalProfit) }}</span>
                </template>
                <template #newContractAmount="{ row }">
                  <div v-if="canEditDetailRow(row)" class="hover-edit-field table-edit-field">
                    <span class="display-value">{{ formatDisplayValue(row.newContractAmount) }}</span>
                    <el-input
                      class="cell-input edit-input"
                      :model-value="row.newContractAmount"
                      inputmode="decimal"
                      @update:model-value="updateDetailReportField(row, 'newContractAmount', $event)"
                    />
                  </div>
                  <span v-else>{{ formatDisplayValue(row.newContractAmount) }}</span>
                </template>
                <template #rdInvestment="{ row }">
                  <div v-if="canEditDetailRow(row)" class="hover-edit-field table-edit-field">
                    <span class="display-value">{{ formatDisplayValue(row.rdInvestment) }}</span>
                    <el-input
                      class="cell-input edit-input"
                      :model-value="row.rdInvestment"
                      inputmode="decimal"
                      @update:model-value="updateDetailReportField(row, 'rdInvestment', $event)"
                    />
                  </div>
                  <span v-else>{{ formatDisplayValue(row.rdInvestment) }}</span>
                </template>
                <template #investmentAmount="{ row }">
                  <div v-if="canEditDetailRow(row)" class="hover-edit-field table-edit-field">
                    <span class="display-value">{{ formatDisplayValue(row.investmentAmount) }}</span>
                    <el-input
                      class="cell-input edit-input"
                      :model-value="row.investmentAmount"
                      inputmode="decimal"
                      @update:model-value="updateDetailReportField(row, 'investmentAmount', $event)"
                    />
                  </div>
                  <span v-else>{{ formatDisplayValue(row.investmentAmount) }}</span>
                </template>
              </CommonTable>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import dayjs from 'dayjs';
import { ElMessage } from 'element-plus';
import HeaderTabs from '@/components/HeaderTabs/index.vue';
import CommonTable from '@/components/CommonTable/index.vue';
import PageTitle from '@/components/PageTitle/index.vue';
import { addDataReport, listDataReport } from '@/api/system/dataReport';
import type { DataReportForm, DataReportQuery, DataReportVO } from '@/api/system/dataReport/types';
import { listUser } from '@/api/system/user';
import type { UserVO } from '@/api/system/user/types';
import { useUserStore } from '@/store/modules/user';
import iconRevenue from '@/assets/cockpit/data/icon-1.png';
import iconProfit from '@/assets/cockpit/data/icon-2.png';
import iconContract from '@/assets/cockpit/data/icon-3.png';
import iconRd from '@/assets/cockpit/data/icon-4.png';
import iconInvestment from '@/assets/cockpit/data/icon-5.png';

type ReportTab = 'year' | 'cumulative' | 'quarter';
type ReportType = 1 | 2 | 3;
type MetricField = 'operatingRevenue' | 'totalProfit' | 'newContractAmount' | 'rdInvestment' | 'investmentAmount';
type EditableReportRow = DataReportVO & {
  isTotal?: boolean;
};

const userStore = useUserStore();
const activeTab = ref<ReportTab>('year');
const selectedMonth = ref(dayjs().format('YYYY-MM'));
const selectedQuarter = ref('2');
const loading = ref(false);
const submitLoading = ref(false);
const reportRows = ref<EditableReportRow[]>([]);
const deptUserList = ref<UserVO[]>([]);

const reportTabs = [
  { label: '年度目标', name: 'year' },
  { label: '累计数据', name: 'cumulative' },
  { label: '季度预计', name: 'quarter' }
];

const metricConfigs: Array<{ key: string; field: MetricField; label: string; icon: string }> = [
  { key: 'revenue', field: 'operatingRevenue', label: '营业收入', icon: iconRevenue },
  { key: 'profit', field: 'totalProfit', label: '利润总额', icon: iconProfit },
  { key: 'contract', field: 'newContractAmount', label: '新签合同额', icon: iconContract },
  { key: 'rnd', field: 'rdInvestment', label: '研发投入', icon: iconRd },
  { key: 'investment', field: 'investmentAmount', label: '投资额', icon: iconInvestment }
];

const headOfficeDeptId = '420100';
const currentDeptId = computed(() => userStore.deptId);
const currentDeptIdNumber = computed(() => Number(currentDeptId.value));
const currentYear = computed(() =>
  activeTab.value === 'cumulative' ? Number(String(selectedMonth.value).slice(0, 4)) || dayjs().year() : dayjs().year()
);
const fallbackDeptName = computed(() => deptUserList.value[0]?.deptName || reportRows.value[0]?.deptName || '当前部门');

const reportTypeMap: Record<ReportTab, ReportType> = {
  year: 1,
  cumulative: 2,
  quarter: 3
};

const reportTypeAliasMap: Record<string, ReportType> = {
  year: 1,
  年度: 1,
  年度目标: 1,
  cumulative: 2,
  累计: 2,
  累计数据: 2,
  quarter: 3,
  季度: 3,
  季度预计: 3
};

// 统一转换年度/累计/季度类型，避免 label 值被直接传给后端。
const getCurrentReportType = (): ReportType => {
  return reportTypeAliasMap[String(activeTab.value)] || reportTypeMap.year;
};

const isCurrentDeptRow = (row: Pick<EditableReportRow, 'deptId'>): boolean => {
  return String(row.deptId || '') === String(currentDeptId.value || '');
};

const isGroupReportRow = (row: Pick<EditableReportRow, 'deptId'>): boolean => {
  return String(row.deptId || '') === headOfficeDeptId;
};

const currentReport = computed<EditableReportRow>(() => reportRows.value.find(isGroupReportRow) || createEmptyGroupReportRow());
const isSuperiorDept = computed(() => Number.isFinite(currentDeptIdNumber.value) && currentDeptIdNumber.value < 420200);
const isYearReport = computed(() => activeTab.value === 'year');
const canEditCurrentReport = computed(() => isSuperiorDept.value);

const saveButtonText = computed(() => {
  if (activeTab.value === 'cumulative') return '保存累计数据';
  if (activeTab.value === 'quarter') return '保存季度预计';
  return '保存年度目标';
});

const currentTableTitle = computed(() => {
  if (activeTab.value === 'cumulative') return '累计数据明细';
  if (activeTab.value === 'quarter') return '季度预计明细';
  return '年度目标明细';
});

const currentMetricSubtitle = computed(() => {
  if (activeTab.value === 'cumulative') return dayjs(selectedMonth.value).format('YYYY年MM月');
  if (activeTab.value === 'quarter') return `第${selectedQuarter.value}季度`;
  return `${currentYear.value}年目标`;
});

const reportTableColumns = computed(() => {
  const suffix = activeTab.value === 'quarter' ? '季度预计' : activeTab.value === 'year' ? '目标' : '';
  return [
    { label: '部门名称', slotName: 'deptName', width: 160 },
    { label: `营业收入${suffix} (万元)`, slotName: 'operatingRevenue', minWidth: 150 },
    { label: `利润总额${suffix} (万元)`, slotName: 'totalProfit', minWidth: 150 },
    { label: `新签合同额${suffix} (万元)`, slotName: 'newContractAmount', minWidth: 160 },
    { label: `研发投入${suffix} (万元)`, slotName: 'rdInvestment', minWidth: 150 },
    { label: `投资额${suffix} (万元)`, slotName: 'investmentAmount', minWidth: 150 }
  ];
});

// 后端按 deptId 编码区分管理层级：420200 以下可维护年度目标，累计和季度明细仅查看。
const canEditDetailRow = (row: EditableReportRow): boolean => {
  if (row.isTotal) return false;
  if (isGroupReportRow(row)) return false;
  if (isSuperiorDept.value) return isYearReport.value;
  return isCurrentDeptRow(row);
};

const reportTableRows = computed(() => {
  // 集团总部数据只在顶部卡片展示，明细列表仅展示下级部门数据。
  return reportRows.value.filter((row) => !isGroupReportRow(row));
});

const handleTabChange = (name: string | number) => {
  activeTab.value = name as ReportTab;
};

const createEmptyReportRow = (): EditableReportRow => ({
  reportType: getCurrentReportType(),
  quarter: activeTab.value === 'quarter' ? selectedQuarter.value : '',
  year: currentYear.value,
  month: activeTab.value === 'cumulative' ? selectedMonth.value : '',
  deptId: currentDeptId.value,
  deptName: fallbackDeptName.value,
  tenantId: userStore.tenantId,
  operatingRevenue: '',
  totalProfit: '',
  newContractAmount: '',
  rdInvestment: '',
  investmentAmount: '',
  remark: ''
});

const createEmptyGroupReportRow = (): EditableReportRow => ({
  ...createEmptyReportRow(),
  deptId: headOfficeDeptId,
  deptName: '集团'
});

const normalizeReportRow = (row: DataReportVO): EditableReportRow => ({
  ...row,
  reportType: row.reportType || getCurrentReportType(),
  quarter: activeTab.value === 'quarter' ? row.quarter || selectedQuarter.value : '',
  year: row.year || currentYear.value,
  month: activeTab.value === 'cumulative' ? row.month || selectedMonth.value : '',
  deptId: row.deptId || currentDeptId.value,
  deptName: row.deptName || fallbackDeptName.value,
  operatingRevenue: row.operatingRevenue ?? '',
  totalProfit: row.totalProfit ?? '',
  newContractAmount: row.newContractAmount ?? '',
  rdInvestment: row.rdInvestment ?? '',
  investmentAmount: row.investmentAmount ?? '',
  remark: row.remark || ''
});

const getGroupReportRow = (): EditableReportRow => {
  const groupRow = reportRows.value.find(isGroupReportRow);
  if (groupRow) return groupRow;

  const emptyRow = createEmptyGroupReportRow();
  reportRows.value.unshift(emptyRow);
  return emptyRow;
};

const normalizeDecimalInput = (value: string | number): string => {
  const inputValue = String(value ?? '');
  const sanitizedValue = inputValue
    .replace(/[^\d.]/g, '')
    .replace(/^\./, '0.')
    .replace(/(\..*)\./g, '$1');
  const [integerPart, decimalPart] = sanitizedValue.split('.');

  if (decimalPart === undefined) return integerPart;
  return `${integerPart}.${decimalPart.slice(0, 4)}`;
};

// 顶部年度/累计/季度卡片始终写入集团行，列表仍完整展示后端返回数据。
const updateCurrentReportField = (field: MetricField, value: string | number) => {
  getGroupReportRow()[field] = normalizeDecimalInput(value);
};

const updateDetailReportField = (row: EditableReportRow, field: MetricField, value: string | number) => {
  row[field] = normalizeDecimalInput(value);
};

const toNumber = (value: unknown) => {
  if (value === '' || value === null || value === undefined) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatDisplayValue = (value: unknown) => {
  if (value === '' || value === null || value === undefined) return '--';
  return value;
};

const buildQuery = (): DataReportQuery => {
  // 数据填报列表接口不传分页参数，仅按当前页签传 reportType。
  return {
    deptId: currentDeptId.value,
    reportType: getCurrentReportType(),
    year: currentYear.value,
    quarter: activeTab.value === 'quarter' ? selectedQuarter.value : '',
    month: activeTab.value === 'cumulative' ? selectedMonth.value : ''
  };
};

const buildPayload = (row: EditableReportRow): DataReportForm => ({
  id: row.id,
  reportType: getCurrentReportType(),
  quarter: activeTab.value === 'quarter' ? selectedQuarter.value : '',
  year: currentYear.value,
  month: activeTab.value === 'cumulative' ? selectedMonth.value : '',
  operatingRevenue: toNumber(row.operatingRevenue),
  totalProfit: toNumber(row.totalProfit),
  newContractAmount: toNumber(row.newContractAmount),
  rdInvestment: toNumber(row.rdInvestment),
  investmentAmount: toNumber(row.investmentAmount),
  deptId: row.deptId || currentDeptId.value,
  tenantId: row.tenantId || userStore.tenantId,
  remark: row.remark
});

const getEditableReportRows = (): EditableReportRow[] => {
  if (isSuperiorDept.value && isYearReport.value) {
    return reportRows.value.filter((row) => !row.isTotal);
  }

  if (canEditCurrentReport.value) {
    return [getGroupReportRow()];
  }

  return reportRows.value.filter(canEditDetailRow);
};

const loadDeptUserList = async () => {
  if (!currentDeptId.value) return;
  try {
    const res = (await listUser({
      pageNum: 1,
      pageSize: 999,
      deptId: currentDeptId.value
    })) as any;
    // 根据当前部门字段查询用户列表，作为数据隔离和部门名称兜底来源。
    deptUserList.value = res.rows || res.data?.rows || res.data || [];
  } catch {
    deptUserList.value = [];
  }
};

const fetchReports = async () => {
  if (!currentDeptId.value) {
    reportRows.value = [];
    return;
  }

  loading.value = true;
  try {
    const res = (await listDataReport(buildQuery())) as any;
    const rows = (res.rows || res.data?.rows || res.data || []) as DataReportVO[];
    reportRows.value = rows.map(normalizeReportRow);
  } finally {
    loading.value = false;
  }
};

const refreshPageData = async () => {
  await loadDeptUserList();
  await fetchReports();
};

const handleSave = async () => {
  // if (!currentDeptId.value) {
  //   ElMessage.warning('当前用户缺少 deptId，暂不能保存数据填报');
  //   return;
  // }

  submitLoading.value = true;
  try {
    const payloads = getEditableReportRows().map(buildPayload);
    if (payloads.length === 0) {
      ElMessage.warning('当前没有可编辑的数据');
      return;
    }
    await addDataReport(payloads);
    ElMessage.success(`${saveButtonText.value}成功`);
    await fetchReports();
  } finally {
    submitLoading.value = false;
  }
};

watch([activeTab, selectedMonth, selectedQuarter], () => {
  fetchReports();
});

watch(currentDeptId, () => {
  // 退出登录会清空 deptId，此时旧页面仍可能存活，避免触发无效业务请求。
  if (!currentDeptId.value) {
    reportRows.value = [];
    deptUserList.value = [];
    return;
  }
  refreshPageData();
});

onMounted(() => {
  refreshPageData();
});
</script>

<style scoped lang="scss">
$primary-color: #00b879;
$text-main: #172b4d;
$text-regular: #72819a;
$text-secondary: #8795ad;
$border-light: #eef2f7;
$table-header-bg: #f5f7fa;
$card-shadow: 0 12px 34px rgba(24, 48, 82, 0.04);
$transition-smooth: all 0.22s ease;

.data-fill-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  padding: 0 0 10px;
  overflow: hidden;

  .data-fill-main {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    box-sizing: border-box;
    overflow: hidden;

    .operation-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
      margin-bottom: 22px;
      flex-shrink: 0;

      .tabs-header-row {
        flex-shrink: 0;
      }

      .operation-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 16px;
        min-width: 0;
      }

      .period-control {
        display: flex;
        align-items: center;
        gap: 12px;

        .label {
          color: #42526e;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
        }

        .month-picker,
        .quarter-select {
          width: 202px;

          :deep(.el-input__wrapper),
          :deep(.el-select__wrapper) {
            height: 34px;
            border-radius: 8px;
            box-shadow: 0 0 0 1px #e3e9f1 inset;
          }
        }
      }
    }

    .main-content {
      flex: 1;
      min-height: 0;
      overflow: hidden;

      .tab-content {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
        gap: 22px;
      }

      .hover-edit-field {
        position: relative;
        display: inline-flex;
        align-items: center;
        height: 34px;
        max-width: 100%;
        border-radius: 7px;

        .display-value {
          display: inline-flex;
          align-items: center;
          width: 100%;
          height: 100%;
          overflow: hidden;
          color: inherit;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: opacity 0.16s ease;
        }

        .edit-input {
          position: absolute;
          inset: 0;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.16s ease;
        }

        &:hover,
        &:focus-within {
          .display-value {
            opacity: 0;
          }

          .edit-input {
            opacity: 1;
            pointer-events: auto;
          }
        }
      }

      .summary-section {
        flex-shrink: 0;

        .target-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px;
        }

        .target-card {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          padding: 20px 24px;
          overflow: hidden;
          border: 1px solid rgba(227, 234, 243, 0.55);
          border-radius: 18px;
          background: #ffffff;
          box-shadow: $card-shadow;
          transition: $transition-smooth;

          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 16px 36px rgba(24, 48, 82, 0.07);
          }

          .metric-icon {
            position: absolute;
            top: 21px;
            right: 26px;
            width: 48px;
            height: 48px;
            object-fit: contain;
          }

          .metric-label {
            max-width: calc(100% - 62px);
            color: $text-secondary;
            font-size: 16px;
            line-height: 20px;
            white-space: nowrap;
          }

          .metric-value {
            min-height: 30px;
            margin-top: 13px;
            color: $text-main;
            font-size: 26px;
            font-weight: 800;
            line-height: 30px;
            letter-spacing: 0;

            .metric-edit-field {
              width: 172px;
              height: 30px;
            }

            :deep(.el-input) {
              width: 172px;
            }

            :deep(.el-input__wrapper) {
              border-radius: 7px;
              background: #ffffff;
              box-shadow: 0 0 0 1px #dfe5ee inset;
            }

            :deep(.el-input__inner) {
              color: $text-main;
              font-size: 16px;
            }
          }

          .metric-period {
            margin-top: 12px;
            color: $text-secondary;
            font-size: 16px;
            line-height: 20px;
          }
        }
      }

      .detail-section {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        padding: 28px 32px 20px;
        border-radius: 20px;
        background: #ffffff;
        box-shadow: $card-shadow;

        :deep(.page-title-container) {
          margin-bottom: 18px;
        }

        :deep(.page-title) {
          color: $text-main;
          font-size: 23px;
          font-weight: 800;
        }

        .table-container {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 0;
          border-radius: 0;
          background-color: #ffffff;

          :deep(.common-table-wrapper) {
            min-height: 0;
          }

          :deep(.common-prototype-table) {
            color: #263d61;
            --el-table-border-color: #edf1f6;
          }

          :deep(.common-prototype-table .el-table__header .el-table__cell) {
            height: 59px;
            background: $table-header-bg !important;
            color: #183052;
            font-size: 15px;
            font-weight: 800;
          }

          :deep(.common-prototype-table .el-table__body .el-table__cell) {
            height: 78px;
            color: #304766;
            font-size: 15px;
            font-weight: 500;
          }

          :deep(.common-prototype-table .el-table__row:hover > .el-table__cell) {
            background: #fbfdff;
          }

          :deep(.el-scrollbar__bar.is-vertical) {
            width: 8px;
            right: 2px;
          }

          :deep(.el-scrollbar__thumb) {
            background: #d9dee8;
          }
        }

        .total-row-text {
          color: $text-main;
          font-weight: 600;
        }

        .cell-input {
          width: 170px;

          :deep(.el-input__wrapper) {
            height: 34px;
            border-radius: 7px;
            background-color: #ffffff !important;
            box-shadow: 0 0 0 1px #dfe5ee inset !important;
          }

          :deep(.el-input__inner) {
            text-align: left;
            color: #304766;
            font-size: 15px;
            font-weight: 500;
          }

          &:focus-within :deep(.el-input__wrapper) {
            box-shadow: 0 0 0 1px $primary-color inset !important;
          }

          :deep(.el-input.is-disabled .el-input__wrapper) {
            background: transparent !important;
            box-shadow: none !important;
          }

          :deep(.el-input.is-disabled .el-input__inner) {
            color: #304766 !important;
            -webkit-text-fill-color: #304766 !important;
            cursor: default;
          }
        }

        .table-edit-field {
          width: 170px;
          color: #304766;
          font-size: 15px;
          font-weight: 500;
        }
      }
    }
  }
}

@media (max-width: 1440px) {
  .data-fill-container {
    .data-fill-main {
      .operation-row {
        .tabs-header-row {
          :deep(.header-tabs-container) {
            min-width: 360px;
          }

          :deep(.tab-item) {
            min-width: 116px;
          }
        }
      }

      .main-content {
        .summary-section {
          .target-grid {
            gap: 14px;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          }

          .target-card {
            padding-right: 20px;
            padding-left: 20px;

            .metric-value {
              font-size: 24px;

              .metric-edit-field {
                width: 150px;
              }

              :deep(.el-input) {
                width: 150px;
              }
            }
          }
        }
      }
    }
  }
}

@media (max-width: 1200px) {
  .data-fill-container {
    overflow: auto;

    .data-fill-main {
      min-height: 760px;
      overflow: visible;

      .operation-row {
        align-items: flex-start;
        flex-direction: column;
      }

      .main-content {
        overflow: visible;

        .tab-content {
          height: auto;
        }

        .summary-section {
          .target-grid {
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          }
        }

        .detail-section {
          min-height: 520px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .data-fill-container {
    .data-fill-main {
      .operation-row {
        .tabs-header-row,
        .operation-actions {
          width: 100%;
        }

        .tabs-header-row {
          overflow-x: auto;
        }

        .operation-actions {
          align-items: flex-start;
          flex-direction: column;
        }
      }

      .main-content {
        .summary-section {
          .target-grid {
            grid-template-columns: 1fr;
          }
        }

        .detail-section {
          padding: 20px 16px;

          .table-edit-field {
            width: 140px;
          }

          .cell-input {
            width: 140px;
          }
        }
      }
    }
  }
}
</style>
