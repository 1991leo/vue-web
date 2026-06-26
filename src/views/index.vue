<template>
	<div class="app-container">
		<div class="app-name">欢迎使用湖北省烟花爆竹零售店（点）风险监测预警一体化监管平台</div>

		<div class="customer-name">烟花爆竹经销全流程监管系统</div>
		<span class="app-desc"
			>搭建辖区内烟花爆竹生产、批发、零售经营主体的基础信息与经营数据同步体系，通过数字化台账与全链路追溯管理，实现从采购、仓储、销售到流向的闭环监管；同步开放移动端查询与备案入口，方便经营主体和监管区域实时报送数据、查询备案信息，提升烟花爆竹经销监管的精准性与透明度。</span
		>
	</div>
</template>

<style lang="scss" scoped>
.app-container {
	position: relative;
	width: calc(100% - 20px);
	height: calc(100vh - 165px) !important;
	background-image: url("../assets/images/home_background.webp");
	background-repeat: no-repeat;
	background-attachment: fixed;
	background-position: center center;
	background-size: 100% 100%;
	margin: 0 10px;

	.app-name {
		margin-top: 10rem;
		margin-left: 9.9rem;
		font-size: 2.625rem;
		font-weight: 600;
		color: #172b4d;
		font-family: "PingFang SC-Semibold";
	}
	.customer-name {
		margin-top: 3.1rem;
		margin-left: 9.9rem;
		font-size: 1.375rem;
		font-weight: 500;
		color: #42526e;
		font-family: "PingFang SC-Medium";
	}
	span {
		display: block;
		width: 35.8rem;
		margin-left: 9.9rem;
		margin-top: 3.9rem;
		font-size: 1.125rem;
		font-weight: 400;
		color: #6b778c;
		font-family: "PingFang SC-Regular";
	}
}
</style>
