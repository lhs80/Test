<template>
  <div class="app-container calendar-list-container client-list">
    <!--菜单栏-->
    <div class="text-right" v-if="$route.query.type!==0">
      <div style="width:400px;display:inline-block;">
        <el-date-picker
          size="small"
          v-model="timeRange"
          type="daterange"
          align="right"
          unlink-panels
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerOptions2"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          change="timeChange"
        >
        </el-date-picker>
      </div>
      <div style="width:200px;display:inline-block;">
        <el-select size="small" v-model="txInfo.serachName" placeholder="请选择">
          <el-option value="tx_code" label="提现单号">提现单号</el-option>
          <el-option value="m_name" label="商户名称">商户名称</el-option>
        </el-select>
      </div>
      <div style="width:200px;display:inline-block;">
        <el-input size="small" v-model="txInfo.searchKey" placeholder="请输入关键字"></el-input>
      </div>
      <div style="display:inline-block;">
        <el-button type="primary" size="small" @click="getTxOrderList">搜索</el-button>
      </div>
    </div>
    <el-table :data="txList" stripe style="width: 100%">
      <el-table-column prop="tx_code" label="提现单号"></el-table-column>
      <el-table-column prop="m_name" label="商户"></el-table-column>
      <el-table-column prop="tx_type" label="提现方式">
        <template slot-scope="scope">
          {{scope.row.tx_type===1?"银行卡":""}}
        </template>
      </el-table-column>
      <el-table-column prop="tx_money" label="申请金额">
        <template slot-scope="scope">
          <span>￥{{scope.row.tx_money}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="tx_charge" label="服务费">
        <template slot-scope="scope">
          <span>￥{{scope.row.tx_charge}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="tx_real_money" label="实际到账">
        <template slot-scope="scope">
          <span class="text-warning">￥{{scope.row.tx_real_money}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="cdate" label="申请时间">
        <template slot-scope="scope">
          <span>{{timestampToTime(scope.row.cdate)}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="tx_status" label="状态">
        <template slot-scope="scope">
          <span v-html="getTxStatus(scope.row.tx_status)"></span>
        </template>
      </el-table-column>
      <el-table-column prop="tx_status" label="操作" v-if="$route.query.type===1" width="300">
        <template slot-scope="scope">
          <el-button size="small" type="primary" @click="adminHandleTxOrder(scope.row.id,'2')">线下打款</el-button>
          <el-button size="small" type="danger" @click="adminHandleTxOrder(scope.row.id,'0')">拒绝</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="paginations.total > 0"
      :page-sizes="paginations.pageSizes"
      :page-size="paginations.page_size"
      :layout="paginations.layout"
      :total="paginations.total"
      :current-page="paginations.page_index"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    ></el-pagination>
  </div>
</template>
<script>
  import {adminTxOrderListFun, adminHandleTxOrderFun} from "@/api/activity"

  export default {
    data() {
      return {
        txList: [],
        timeRange: "",
        txInfo: {
          tx_status: this.$route.query.type,
          startTime: "",
          endTime: "",
          serachName: "",
          searchValue: "",
          pageSize: 20,
          pageIndex: 1
        },
        pickerOptions2: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
        paginations: {
          page_index: 1, // 当前位于哪页
          total: 0, // 总条数`
          page_count: 0,//总页数
          page_size: 5, // 1页显示多少条
          pageSizes: [5, 10, 15, 20], //每页显示多少条
          layout: "total, sizes, prev, pager, next, jumper" // 翻页属性
        },
      }
    },
    watch: {
      "$route": "getTxOrderList"
    },
    mounted() {
      this.getTxOrderList();
    },
    methods: {
      getTxOrderList() {
        let params = {
          tx_status: this.$route.query.type,
          startTime: this.timeRange[0],
          endTime: this.timeRange[1],
          serachName: this.txInfo.searchName,
          searchValue: this.txInfo.searchValue,
          pageSize: this.paginations.page_size,
          pageIndex: this.paginations.page_index,
        };
        adminTxOrderListFun(params).then(res => {
          console.log(this.txInfo);
          if (res.data.success) {
            console.log("txInfo", res);
            this.txList = res.data.data.data;
          }
        })
      },
      adminHandleTxOrder(id, status) {
        let params = {
          order_id: id,
          tx_status: status
        };
        adminHandleTxOrderFun(params).then(res => {
          if (res.data.success) {
            this.$message({
              showClose: true,
              message: "申请处理成功",
              type: "success"
            });
            this.getTxOrderList();
          }
        })
      },
      getTxStatus(type) {
        switch (type) {
          case 1:
            return "<span class='text-info'>审核中</span>";
          case 2:
            return "<span class='text-success'>审核通过</span>";
          case 0:
            return "<span class='text-muted'>无效</span>";
          case -1:
            return "<span class='text-warning'>撤消</span>";
        }
      },
      // 上下分页
      handleCurrentChange(page) {
        this.paginations.page_index = page;
        this.getOrderList();
      },
      // 每页多少条切换
      handleSizeChange(page_size) {
        this.paginations.page_size = page_size;
        this.getOrderList()
      },
    }
  };
</script>
