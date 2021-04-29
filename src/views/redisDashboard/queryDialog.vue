<template>
  <div>
    <el-dialog
            :title="cluster_name"
            :visible.sync="visible"
            width="50%"
            :before-close="handleClose"
            @open="openDialog"
            @close="$emit('closeFlag', false)"

    >
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
  import { getDBList, keyScan, keyQuery } from "@/api/key";

  export default {
    name: "queryDialog",
    data() {
      return {
        // 弹框变量
        searchInfo: {
          queryKey: '',
          database: '',

        },
        cluster_name: '',
        queryResult: '',
        dbList: [],
        visible: false

      }
    },
    props: ['currentCluster','dialogVisible']
    ,
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
      openDialog() {
        console.log('------------', this.dialogVisible)
        getDBList(this.currentCluster.ID).then(res => {
          console.log(res)
          this.dbList = res.data
        })
        this.cluster_name = this.currentCluster.name

      },
      handleClose() {
        this.searchInfo = {}
        this.queryResult = ''
        this.visible = false
        // this.$emit('closeFlag', false)
      }
    },
    watch: {
      dialogVisible() {
        this.visible = this.dialogVisible;
      },
    }
  }
</script>

<style scoped>

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