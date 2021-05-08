<template>
  <div class="content">
    <div class="monitor-condition-wrapper">
      <div class="condition-wrapper">
        <el-select v-model="cluster_id" placeholder="选择集群" style="width: 180px;">
          <el-option
                  v-for="item in clusterOptions"
                  :key="item.ID"
                  :label="item.name"
                  :value="item.ID">
          </el-option>
        </el-select>

        <el-select v-model="searchNode" placeholder="选择集群中节点" style="width: 200px;">
          <el-option
                  v-for="(item, index) in nodeOptions"
                  :key="index"
                  :label="item"
                  :value="item">
          </el-option>
        </el-select>

<!--        <el-select v-model="value" placeholder="时间" style="width: 180px;">-->
<!--          <el-option-->
<!--                  v-for="item in timeOptions"-->
<!--                  :key="item.value"-->
<!--                  :label="item.label"-->
<!--                  :value="item.value">-->
<!--          </el-option>-->
<!--        </el-select>-->
        <div class="block">
          <el-date-picker
                  v-model="timeRange"
                  type="datetimerange"
                  :picker-options="pickerOptions"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  align="right">
          </el-date-picker>
        </div>
        <i class="el-icon-refresh-left refresh" style="font-size: 26px" @click="searchHandle"></i>
      </div>
    </div>
    <hr>
    <div class="image-box">
      <div class="item-box" v-for="(itemName, index) in monitorOptions">
        <p style="text-align: center">{{itemName.item}} <span v-if="itemName.unit != ''">({{itemName.unit}})</span></p>
        <item-Monitor :itemName="itemName.item" :redisMonitorData="redisMonitorData"></item-Monitor>
      </div>
    </div>
  </div>
</template>

<script>
  import { getRedisClusterList, getRedisClusterById, getInfoItemMonitorData } from "@/api/redis";
  import itemMonitor from "./itemMonitor";
  export default {
    name: "Monitor",
    components: {
      itemMonitor,
    },
    data() {
      return {
        clusterOptions: [],
        nodeOptions: ['Master', 'Nodes'],
        timeOptions: ['Minute', 'Hour'],
        monitorOptions: [
          {"item": 'total_commands_processed', "unit": "K"},
          {"item": 'used_memory', "unit": "MB"},
          {"item": 'used_memory_peak', "unit": "MB"},
          {"item": 'connected_clients', "unit": ""},
          {"item": 'blocked_clients', "unit": ""},
          {"item": 'expired_keys', "unit": ""},
          {"item": 'keyspace_hits', "unit": ""},
          {"item": 'keyspace_misses', "unit": ""},
        ],
        cluster_id: '',
        searchNode: 'Master',
        node_list: [],  // 查找的条件
        redisMonitorData: [],

        pickerOptions: {
          shortcuts: [{
            text: '今天',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setHours(0)
              start.setMinutes(0)
              start.setSeconds(0)
              start.setTime(start.getTime())
              end.setTime(end.getTime())
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '昨天',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setHours(0)
              start.setMinutes(0)
              start.setSeconds(0)
              end.setHours(0)
              end.setMinutes(0)
              end.setSeconds(0)
              start.setTime(start.getTime() - 3600 * 1000 * 24);
              end.setTime(end.getTime());
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
        timeRange: [new Date(+(new Date() - 15 * 60 * 1000)) , new Date()], // 15分钟
      }
    },
    methods: {
      searchHandle() {
        console.log('刷新 重新获取数据')
        console.log(this.timeRange)
        this.searchMonitorData()
        // 查询数据
      },
      searchMonitorData(type) {
        if (type == "first") {
          getRedisClusterList().then( res => {
            if (res.code == 0 ) {
              this.clusterOptions = res.data.list
              this.cluster_id = this.clusterOptions[0].ID
              if (this.searchNode == "Master") {
                this.node_list = []
                this.node_list.push(this.clusterOptions[0].cluster_master)
              } else {
                this.node_list = []
                this.node_list = this.clusterOptions[0].nodes.split(',')
              }
              // 获取监控数据
              console.log(this.timeRange)

              getInfoItemMonitorData({"cluster_id":this.cluster_id, "start_time":this.getTimeStampString(this.timeRange[0]),
                "end_time":this.getTimeStampString(this.timeRange[1]), "node_list": this.node_list}).then(res => {
                console.log(res)
                this.redisMonitorData = res.data
              })
            } else {
              this.$message({
                type: 'error',
                message: '网络请求失败',
              })
            }
          })
        } else {
          // 通过clusterID 获取集群信息 pass
          getRedisClusterById({id: parseInt(this.cluster_id)}).then(res => {
            if (res.code == 0) {
              this.cluster_master = res.data.redis.cluster_master
              if (this.searchNode == "Master") {
                this.node_list = []
                this.node_list.push(this.cluster_master)
              } else {
                this.node_list = []
                this.node_list = res.data.redis.nodes.split(',')
              }
              getInfoItemMonitorData({"cluster_id":this.cluster_id, "start_time":this.getTimeStampString(this.timeRange[0]),
                "end_time":this.getTimeStampString(this.timeRange[1]), "node_list": this.node_list}).then(res => {
                console.log(res)
                this.redisMonitorData = res.data
              })
            }
          })
        }

      },
      // 转成 s的字符串时间戳
      getTimeStampString(d) {
        return Math.floor(d.getTime() / 1000 ) + ''
      }
    },
    created() {
      this.searchMonitorData("first")

    }
  }
</script>

<style scoped>

  .content {
    width: 90%;
    margin: 0 auto;
    background-color: lightgray;
    text-align: left;
  }

  .monitor-condition-wrapper .condition-wrapper{
    height: 60px;
    width: 90%;
    display: flex;
    align-items: center;
    justify-content: space-between;

    /*background-color: white;*/
    /*background-color: #fff;*/
    padding: 10px;
    /*vertical-align: middle*/
  }

  .image-box {
    margin-top: 10px;
    background-color: lightgray;
    /*height: 500px;*/

    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin: 0 auto;
  }

  .item-box {
    width: 520px;
    height: 400px;
    background: #dad5d5;
    margin-left: 20px;
    margin-bottom: 20px;
    border: 2px solid white;
  }
</style>