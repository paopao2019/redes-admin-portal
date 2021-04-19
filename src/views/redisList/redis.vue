<template>
  <div class="list">
    <div class="search-term">
      <el-form :inline="true" :model="searchInfo">
        <el-form-item label="集群名称">
          <el-input
                  v-model="searchInfo.name"
                  placeholder="请输入名称"
                  clearable
                  @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="redis类型">
          <el-select clearable placeholder="请选择" v-model="searchInfo.mode">
            <el-option label="单机" value="1"></el-option>
            <el-option label="主从" value="2"></el-option>
            <el-option label="哨兵" value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
                  class="filter-item"
                  type="primary"
                  icon="el-icon-search"
                  @click="handleQuery"
          >搜索</el-button>
        </el-form-item>
      </el-form>
      <el-form>
        <el-form-item>
          <el-button
                  class="filter-item"
                  type="primary"
                  icon="el-icon-plus"
                  size="mini"
                  @click="handleClickAddOrEdit(null, 'create')"
          >新增集群</el-button>
          <el-button
                  class="filter-item"
                  type="primary"
                  icon="el-icon-download"
                  size="mini"
                  @click="handleClickExport(null, 'create')"
          >EXCEL导出</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table
            :data="tableData"
            row-key="ID"
            border
            style="width: 100%">
      <el-table-column prop="name" label="集群名" width="200" />
      <el-table-column prop="mode" label="类型" width="60" >
        <template slot-scope="scope">{{scope.row.mode | basecode(scope.row.mode,'modeOptions')}}</template>
      </el-table-column>
      <el-table-column prop="env" label="环境" width="50" >
        <template slot-scope="scope">{{scope.row.env | basecode(scope.row.env,'envOptions')}}</template>
      </el-table-column>
      <el-table-column prop="nodes" label="节点列表" width="450"/>
      <el-table-column label="dbsize" align="center" width="80">
        <template slot-scope="scope">
          <router-link :to="{name: 'redisDatabase', query:{id:scope.row.ID, redis_name:scope.row.name}}" class="link-type">
            <span>{{ scope.row.db_size }}</span>
          </router-link>
        </template>redisDatabase.vue
      </el-table-column>
      <el-table-column label="创建日期" align="center" prop="createdAt" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.CreatedAt|formatDate}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="280">
        <template slot-scope="scope">
          <el-button
                  @click="handleClickAddOrEdit(scope.row.ID, 'find')"
                  size="small"
                  type="primary"
                  icon="el-icon-info"
          >详情</el-button>
          <el-button
                  @click="handleClickAddOrEdit(scope.row.ID, 'edit')"
                  size="small"
                  type="primary"
                  icon="el-icon-edit"
          >编辑</el-button>
          <el-button @click="deleteRedisCluster(scope.row)" type="danger" icon="el-icon-delete" style="margin-left: 6px;" size="mini" >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
            :current-page="page"
            :page-size="pageSize"
            :page-sizes="[10, 30, 50, 100]"
            :style="{float:'right',padding:'20px'}"
            :total="total"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
            layout="total, sizes, prev, pager, next, jumper"
    ></el-pagination>
  </div>
</template>

<script>
  import {
    getRedisClusterList,
    deleteRedisCluster,
    exportExcel
  } from "@/api/redis";
  import { formatTimeToStr } from '@/utils/date'
  import infoList from '@/mixins/infoList'

  export default {
    name: "redis",
    mixins: [infoList],
    data() {
      return {
        listApi: getRedisClusterList,
        searchInfo: {
          name: '',
          mode: '',
        },
      }
    },
    methods: {
      // 项目搜索
      handleQuery() {
        this.getTableData()
      },
      // 进入详情、新增、编辑页面
      handleClickAddOrEdit(id, type="") {
        this.$router.push({ name: 'redisDetail', query: { id: id, type: type }})
      },

      // 删除项目
      deleteRedisCluster(row) {
        this.$confirm("此操作将永久删除该项目, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(async () => {
            this.visible = false;
            const res = await deleteRedisCluster({ ID: row.ID });
            if (res.code == 0) {
              this.$message({
                type: "success",
                message: "删除成功!"
              });
              await  this.getTableData();
            }
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消删除"
            });
          });
      },
      handleClickExport() {
        let params = this.searchInfo       // 按条件检索后 去导出excel
        params.fileName = 'REDIS集群列表.xlsx'   // excel下载的文件名
        // exportExcel({fileName: '项目列表.xlsx'})
        exportExcel(params)
      }
    },
    filters: {
      formatDate: function(time) {
        if (time != null && time != '') {
          let date = new Date(time)
          return formatTimeToStr(date, 'yyyy-MM-dd')
        } else {
          return ''
        }
      },
      formatString: function(bool) {
        if (bool != null) {
          return bool ? "正常" :"关闭";
        } else {
          return "";
        }
      },
      formatBoolean: function(s) {
        if (s == "1" ) {
          return true
        } else {
          return false;
        }
      }
    },
    async created() {
      await this.getTableData()
      console.log(this.tableData)
    }
  }
</script>

<style scoped>
  a:link {color: blue}
  a:visited {color: blue}
  a:hover {color: black}
  a:active {color: yellow}

  .list {
    width: 90%;
    margin: 0 auto;
  }
</style>
