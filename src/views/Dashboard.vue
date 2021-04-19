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
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import { getRedisClusterList } from "@/api/redis";
  export default {
    name: "Dashboard",
    data() {
      return {
        clusterList: []
      }
    },
    methods: {

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
    height: 350px;
  }
</style>