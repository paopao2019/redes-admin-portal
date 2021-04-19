<template>
  <div>
    <div class="search-term">
      <el-form :inline="true" :model="searchInfo" class="demo-form-inline" ref="queryForm">
        <el-form-item label="库号" prop="redis_number" >
          <el-input placeholder="库号" v-model="searchInfo.redis_number" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="handleQuery" icon="el-icon-search" type="primary">查询</el-button>
        </el-form-item>
      </el-form>
      <el-form>
        <el-form-item>
          <el-button @click="createRedisDatabase()" type="primary">增加库号记录</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table
            :data="tableData"
            border
            ref="multipleTable"
            stripe
            style="width: 100%"
            tooltip-effect="dark"
    >
      <el-table-column label="库号" prop="redis_number" width="120"></el-table-column>
      <el-table-column label="REDIS集群" prop="redis.name" ></el-table-column>
      <el-table-column label="项目归属" prop="project.project_name" ></el-table-column>
      <el-table-column label="描述" prop="describe" ></el-table-column>
      <el-table-column label="按钮组" width="220" >
        <template slot-scope="scope">
          <el-button @click="updateRedisDatabase(scope.row)" icon="el-icon-edit" size="small" type="primary">编辑</el-button>
          <el-button @click="deleteRedisDatabase(scope.row)" type="danger" icon="el-icon-delete" style="margin-left: 6px;" size="mini" slot="reference">删除</el-button>
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

    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible" width="600px" >
      <el-form ref="elForm" :model="formData" :rules="rules" size="medium" label-width="110px">
        <el-form-item label="REDIS集群名">
          <el-input
                  v-model="formData.redis_name"
                  disabled
                  :style="{width: '90%'}"
          ></el-input>
        </el-form-item>
        <el-form-item label="库号" prop="redis_number">
          <el-input
                  v-model="formData.redis_number"
                  placeholder="库号"
                  clearable
                  :style="{width: '90%'}"
          ></el-input>
        </el-form-item>

        <el-form-item label="项目名" prop="project_code" style="width:100%">
          <el-select  placeholder="请选择项目归属" v-model="formData.project_code" style="width:90%">
            <el-option
                    v-for="(item, i) in projectOptions"
                    :key="i"
                    :label="item.project_name"
                    :value="item.project_code"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="备注" prop="describe">
          <el-input v-model="formData.describe" placeholder="请输入备注" clearable type="textarea" :style="{width: '90%'}"></el-input>
        </el-form-item>
      </el-form>

      <div class="dialog-footer" slot="footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button @click="enterDialog" type="primary">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {
    createRedisDatabase,
    updateRedisDatabase,
    deleteRedisDatabase,
    getRedisDatabaseList
  } from "@/api/cmdb_redis"; //  此处请自行替换地址
  import { formatTimeToStr } from "@/utils/date";
  import infoList from "@/mixins/infoList";
  import { getProjectList }  from "@/api/cmdb_project";

  export default {
    name: "redisDatabase",
    mixins: [infoList],
    data() {
      return {
        projectOptions: [],
        listApi: getRedisDatabaseList,
        dialogFormVisible: false,
        dialogTitle: "增加库号记录",
        visible: false,
        type: "",
        searchInfo: {
          redis_number: undefined,
        },
        formData: {
          redis_id: undefined,
          redis_name: '',
          redis_number: '',   // 库号
          project_code: '',  // 字典标签值
          project_name: '',  // 字典标签值
          describe: ''
        },
        rules: {
          redis_number: [{required: true,message: "请输入redis库号", pattern: /^[0-9]\d{0,3}$/, trigger: "blur"}],
          project_code: [{required: true, message: "请选择项目", trigger: "blur"}]

        }
      };
    },
    filters: {
      formatDate: function(time) {
        if (time != null && time != "") {
          var date = new Date(time);
          return formatTimeToStr(date, "yyyy-MM-dd hh:mm:ss");
        } else {
          return "";
        }
      },
    },
    methods: {
      //条件搜索前端看此方法
      handleQuery() {
        this.getTableData();
      },
      async updateRedisDatabase(row) {
        this.type = "update";
        this.formData = row
        this.formData.redis_name = row.redis.name
        this.dialogFormVisible = true;
      },
      closeDialog() {
        this.dialogFormVisible = false;
        this.formData = {}
        this.searchInfo.redis_id = this.$route.query.id
        this.formData.redis_id = parseInt(this.$route.query.id)
        this.formData.redis_name = this.$route.query.redis_name
      },
      deleteRedisDatabase(row) {
        this.$confirm("此操作将永久删除库记录, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(async () => {
            this.visible = false;
            const res = await deleteRedisDatabase({ ID: row.ID });
            if (res.code == 0) {
              this.$message({
                type: "success",
                message: "删除成功!"
              });
              await this.getTableData();
            }
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消删除"
            });
          });
      },
      async enterDialog() {
        this.$refs['elForm'].validate(async valid => {
          if (!valid) return
          let res;
          switch (this.type) {
            case "create":
              this.formData.id = null
              res = await createRedisDatabase(this.formData);
              break;
            case "update":
              res = await updateRedisDatabase(this.formData);
              break;
            default:
              res = await createRedisDatabase(this.formData);
              break;
          }
          if (res.code == 0) {
            this.$message({
              type:"success",
              message:"创建/更改成功"
            })
            this.closeDialog();
            await this.getTableData();
          }
        })

      },
      async createRedisDatabase(){
        this.dialogTitle = '增加库号记录'
        this.type = 'create';
        this.dialogFormVisible = true;
      }
    },
    async created() {
      this.searchInfo.redis_id = this.$route.query.id
      this.formData.redis_id = parseInt(this.$route.query.id)
      this.formData.redis_name = this.$route.query.redis_name
      await this.getTableData();
      getProjectList({'page':1, 'pageSize': 100}).then(response => {
        this.projectOptions = response.data.list;
      })

    }
  };
</script>

<style>
</style>
