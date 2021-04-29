<template>
  <div class="content">
    <el-row :gutter="20" >
      <el-col :span="6"  v-for="(item ,index) in clusterList" :key="index">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span style="float: left; padding: 3px 0; color: #303133">{{item.name}}</span>
            <i v-if="item.password != ''" class="el-icon-lock" style="float: right; padding: 3px 0px;"></i>
          </div>
          <div class="text item">
            <p>State: <el-tag size="mini" :type="item.cluster_state === 'health' ? 'success' : 'danger'"> {{item.cluster_state |toUpperCase}}</el-tag></p>
            <p>Cluster Type: <el-tag size="mini">{{item.mode | basecode(item.mode,'modeOptions')}}</el-tag></p>
            <p>Version: <el-tag size="mini" v-show="item.redis_version != ''">{{item.redis_version}}</el-tag></p>
            <p>Nodes: <el-tag size="mini">{{item.cluster_known_nodes}}</el-tag></p>
            <p>Master: <el-tag size="mini" v-show="item.cluster_master != ''">{{item.cluster_master}}</el-tag></p>
            <p>Total Momery: <el-tag size="mini" v-show="item.total_system_memory_human != ''">{{item.total_system_memory_human}}</el-tag></p>
            <p>DB Size: <el-tag size="mini"  v-show="item.db_size != ''">{{item.db_size}}</el-tag></p>
            <p>Environment: <el-tag size="mini">{{item.env}}</el-tag></p>
          </div>
          <div class="button-icon">
            <el-button icon="el-icon-search" circle size="mini"  @click="enterDialog(item)"></el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
            :title="cluster_name"
            :visible.sync="dialogVisible"
            width="50%"
            :before-close="handleClose">
      <div class="dialog-content">
        <div class="query-input">
          <el-form :inline="true" :model="searchInfo">
            <el-form-item>
              <el-select clearable placeholder="Select DB" v-model="searchInfo.database" style="width: 120px">
                <el-option
                        v-for="(item, i) in dbList"
                        :key="i"
                        :label="item.database"
                        :value="item.database"
                ></el-option>

              </el-select>
            </el-form-item>
            <el-form-item>
              <el-input
                      v-model="searchInfo.queryKey"
                      placeholder="Redis Key"
                      clearable
              />
            </el-form-item>

            <el-form-item>
              <el-button
                      class="filter-item"
                      type="primary"
                      icon="el-icon-search"
                      @click="handleQuery('query')"
              >Query</el-button>
            </el-form-item>
            <el-form-item>
              <el-button
                      class="filter-item"
                      icon="el-icon-search"
                      @click="handleQuery('scan')"
              >Scan</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="query-wrapper" >
          <span style="white-space:pre">{{queryResult}}</span>


        </div>
      </div>

    </el-dialog>

  </div>
</template>

<script>
  import { getRedisClusterList } from "@/api/redis";
  import { getDBList, keyScan, keyQuery } from "@/api/key";
  export default {
    name: "Dashboard",
    data() {
      return {
        clusterList: [],
        // 弹框变量
        dialogVisible: false,
        searchInfo: {
          queryKey: '',
          database: '',

        },
        currentCluster: undefined,
        cluster_name: '',
        queryResult: '',
        dbList: [],
      }
    },
    methods: {
      handleQuery(type) {
        console.log('searchInfo')
        console.log(this.currentCluster, "!!!!!!!!!!")
        if (type == "scan") {
          keyScan({"cluster_id": this.currentCluster.ID, "count": 100, "key": this.searchInfo.queryKey, database: this.searchInfo.database.replace('db', '') - 0}).then(res => {
            this.queryResult = res.data.join("\n")
          })
        } else if (type == "query") {
          keyQuery({"cluster_id": this.currentCluster.ID, "count": 100, "key": this.searchInfo.queryKey, database: this.searchInfo.database.replace('db', '') - 0}).then(res => {
            this.queryResult = res.data
          })
        } else {
          alert('查询参数不支持')
        }

      },
      enterDialog(currentCluster) {
        //
        this.currentCluster = currentCluster

        getDBList(currentCluster.ID).then(res => {
          console.log(res)
          this.dbList = res.data
        })
        this.cluster_name = currentCluster.name

        this.dialogVisible = true
      },
      handleClose() {
        this.searchInfo = {}
        this.queryResult = ''
        this.dialogVisible = false

      }
    },
    filters: {
      toUpperCase(value) {
        return value.toUpperCase()
      }
    },
    created() {
      getRedisClusterList().then( res => {
        if (res.code == 0 ) {
          this.clusterList = res.data.list
          console.log(this.clusterList)
        } else {
          this.$message({
            type: 'error',
            message: '网络请求失败',
          })
        }
      })

    }
  }
</script>

<style scoped>

  .content {
    width: 90%;
    margin: 0 auto;
  }


  .text {
    font-size: 14px;
    text-align: left;
    margin-top: -20px;
    margin-bottom: -20px;
  }

  .item {
    /*margin-bottom: 18px;*/
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }

  .box-card {
    height: 360px;

  }
  .box-card .button-icon {
    float: right;
  }


  /* 弹出框 */
  .dialog-content {
    height: 300px;
     }

  .query-wrapper {
    overflow: scroll;
    height: 260px;
    background-color: #303133;
    border: 1px solid gray;
    margin-left: 10px;
    text-align: left;
    color: white;
  }
</style>