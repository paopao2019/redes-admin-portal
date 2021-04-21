<template>
  <div>
    <hr style="width: 90%;margin-top: -10px" >
    <div class="console-box">
      <div class="search">
        <el-col :span="6">
          <el-select v-model="cluster_id" placeholder="选择集群" style="width:90%;">
            <el-option
                    v-for="item in clusterOptions"
                    :key="item.ID"
                    :label="item.name"
                    :value="item.ID">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="2">
          <el-input v-model="database" placeholder="库号" :style="{width: '90%'}"></el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" round @click="connectRedis()">连接redis</el-button>
        </el-col>
      </div>
      <br>
      <div class="console-wrapper">
        <div class="console-title">
          Redis Command
        </div>
        <div class="console">
          <div class="history">
            <span style="white-space:pre">{{history}}</span>

          </div>
          <div class="prepare">
            <div class="prepare-prefix" style="white-space:pre"> {{ commandPrepare}}</div>
            <div class="prepare-input" style="white-space:pre" @change="sendCommand"><el-input  v-model="command"></el-input></div>

          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
  import { getRedisClusterList, getRedisClusterById, sendCommand } from "@/api/redis";
  export default {
    name: "Operation",
    data() {
      return {
        clusterOptions: [],
        connect_flag: false,
        cluster_id: 0,
        cluster_name: '',
        cluster_master: '',
        database: 0,
        commandPrepare: '',
        command: '',
        history: '',
      }
    },
    methods: {
      searchMonitorData() {
        getRedisClusterList().then( res => {
          if (res.code == 0 ) {
            this.clusterOptions = res.data.list
            this.cluster_id = this.clusterOptions[0].ID
            this.cluster_master = this.clusterOptions[0].cluster_master
          } else {
            this.$message({
              type: 'error',
              message: '网络请求失败',
            })
          }
        })
      },
      connectRedis() {
        this.connect_flag = true
        // 通过clusterID 获取集群信息 pass
        getRedisClusterById({id: parseInt(this.cluster_id)}).then(res => {
          if (res.code == 0) {
            this.cluster_master = res.data.redis.cluster_master
          }
        })
        sendCommand({"cluster_id": parseInt(this.cluster_id), "database": parseInt(this.database)}).then(res => {
          if (res.code == 0) {
            this.history = '连接redis' + '集群:' + this.cluster_id + ',库号:' + this.database + '\r\n'
            this.commandPrepare = `[${this.cluster_master}]$ `
          } else {
            this.history += 'redis链接失败'
          }
        })
      },
      sendCommand() {
        if (!this.connect_flag) {
          alert('请先点击连接redis')
          return;
        }
        if (this.command == "clear") {
          // 模拟中断clear 清除屏幕指令
          this.history = ''
          this.command = ''
          return

        }
        console.log('发送命令请求')
        sendCommand({"cluster_id": parseInt(this.cluster_id), "database": parseInt(this.database), "command": this.command}).then(res => {
          if (res.code == 0) {
            console.log(res)
            this.history +=  this.commandPrepare + this.command + '\n' + res.data + '\n'
            this.command = ''
            this.commandPrepare = `[${this.cluster_master}]$ `
          } else {
            this.history += 'redis链接失败'
          }
        })
      }
    },
    created() {
      this.searchMonitorData()
      this.commandPrepare = `[${this.cluster_master}]$ `
    }
  }
</script>

<style>

  .console-box {
    width: 85%;
    margin: 0 auto;
    text-align: left ;

  }

  .console-wrapper {
    margin-top: 40px;
    color: #2c3e50;
    width: 100%;
    height: 100%;

  }

  .console-title {
    padding: 10px 20px;
    border-bottom: 1px solid #dcdfe6;
    background: #f0f2f5;
  }

  .console {
    height: 600px;
    overflow: scroll;
    padding: 10px 0;
    background-color: #000;
    color: #fff;
    font-size: 16px;
  }

  /*vue中 不能使用 style 不能加scope 这样才能生效 */
  .console .prepare input.el-input__inner {
    background-color: #000!important;
    border: none!important;
    color: #fff!important;
    padding: 0;
    background-color: #000;

  }

  .console .prepare-prefix {

    float: left;
    vertical-align: middle;
    height: 40px;
    line-height: 40px;
    /*padding-right: 5px;*/
  }
  .console .prepare-input {
    float: left;
    width: 600px;
  }
</style>