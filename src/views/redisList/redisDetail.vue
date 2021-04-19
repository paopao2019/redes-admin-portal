<template>
  <div class="redis-detail">
    <el-form ref="form" :rules="rules" :model="form"  label-width="180px" size="media" :disabled="ifFind">
      <el-row :gutter="10">
        <el-col :span="9" v-show="ifFind">
          <el-form-item label="ID" prop="ID">
            <el-input v-model.trim="form.ID" prefix-icon="el-icon-info" style="width:100%" :disabled="true"/>
          </el-form-item>
        </el-col>
        <el-col :span="9" v-show="ifFind">
          <el-form-item label="创建时间" prop="CreatedAt">
            <el-input v-model="form.CreatedAt" prefix-icon="el-icon-info" style="width:100%" :disabled="true"/>
          </el-form-item>
        </el-col>
        <el-col :span="9">
          <el-form-item label="集群名" prop="name">
            <el-input placeholder="测试环境redis哨兵集群" v-model.trim="form.name"   style="width:100%" prefix-icon="el-icon-info"/>
          </el-form-item>
        </el-col>
        <el-col :span="9">
          <el-form-item label="模式" prop="mode" style="width:100%" >
            <el-select placeholder="请选择" v-model="form.mode" style="width:100%">
              <el-option
                      v-for="(item, i) in modeOptions"
                      :key="i"
                      :label="item.item_name"
                      :value="item.item_value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>



        <el-col :span="9" v-if="ifFind">
          <el-form-item label="节点列表" prop="nodes">
            <el-input placeholder="" v-model.trim.number="form.nodes"  style="width:100%" prefix-icon="el-icon-info"/>
          </el-form-item>
        </el-col>

        <el-col :span="9" v-else>
          <el-form-item v-for="(node, index) in nodeLists" :label="'节点' + index"
                        :key="node.key"
         >
            <el-input v-model="node.value" style="width:70%" prefix-icon="el-icon-info" class='nodeTag' @blur="checkRedisNodeRule()"/>
            <el-button v-if="index == 0" @click="addNode" style="width:30%" type="primary">+增加节点</el-button>
            <el-button v-else @click.prevent="removeNode(node)" style="width:30%" type="warning">-删除节点</el-button>
          </el-form-item>
        </el-col>

        <el-col :span="9">
          <el-form-item label="密码" prop="password">
            <el-input placeholder="密码" v-model.trim="form.password"   style="width:100%" prefix-icon="el-icon-info"/>
          </el-form-item>
        </el-col>

        <el-col :span="9">
          <el-form-item label="环境" prop="env" style="width:100%" >
            <el-select  placeholder="环境" v-model="form.env" style="width:100%">
              <el-option
                      v-for="(item, i) in envOptions"
                      :key="i"
                      :label="item.item_name"
                      :value="item.item_value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="9">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio
                      v-for="dict in statusOptions"
                      :key="dict.item_value"
                      :label="dict.item_value |formatBoolean"
              >{{ dict.item_name }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="bottom-button">
      <el-button v-if="!ifFind" type="primary" size="medium" @click="onSubmit">保存</el-button>
      <el-button v-else :disabled="true" type="primary" size="medium" @click="onSubmit">保存</el-button>
      <el-button size="medium" @click="goBack">取消</el-button>
    </div>

  </div>
</template>

<script>
  import {
    getRedisClusterById,
    addRedisCluster,
    updateRedisCluster,
  } from "@/api/redis";
  import { formatTimeToStr } from '@/utils/date';
  import infoList from '@/mixins/infoList';


  export default {
    name: "redisDetail",
    mixins: [infoList],
    data() {
      return {
        projectOptions: [],
        statusOptions:[],
        envOptions: [],
        modeOptions:[],
        nodeLists: [{
          value: '1.1.1.1:6379',
        }],
        form: {
          ID: '',
          name: '',
          mode: '3',
          nodes: '',
          database: 16,
          project_code:'',
          project_name:'',
          password: '',
          env:'prod',
          CreatedAt: null,   // 不能设置成 ''  时间格式要传递post到后端
          status: true,
        },
        ifFind: false,
        // 操作类型
        opType: '',   // find|edit|crate
        rules: {
          name: [{ required: true, message: '请输入集群名字', trigger: 'blur' }],
        },
      }
    },
    filters: {
      formatDate: function(time) {
        if (time != null && time != '') {
          var date = new Date(time)
          return formatTimeToStr(date, 'yyyy-MM-dd hh:mm:ss')
        } else {
          return ''
        }
      },
      formatBoolean: function(s) {
        if (s == "1" ) {
          return true
        } else {
          return false;
        }
      },

    },
    created() {
      const id = this.$route.query.id
      if (id != null) {
        this.queryDetail(id)
      }
      // 路由参数(页面操作类型) find|create|edit
      this.opType = this.$route.query.type
      if (this.opType == 'find') {
        this.ifFind = true
      }

      this.modeOptions = this.global.modeOptions
      this.envOptions = this.global.envOptions
      this.statusOptions = this.global.statusOptions


    },
    methods: {
      queryDetail(id) {
        getRedisClusterById({id: parseInt(id)}).then(res => {
          if (res.code == 0) {
            this.form = res.data.redis
            // redis节点重组
            this.nodeLists = this.form.nodes.split(',').map(n => {return {'value': n}})
          }
        })

      },
      async addRedisCluster(){
        // , 号重组节点列表
        this.form.nodes = this.nodeLists.map(n=>n.value).join(',')
        addRedisCluster(this.form).then(res => {
          if (res.code == 0) {
            this.$message({
              type: 'success',
              message: '创建成功',
            })
            this.$router.push({ name: 'redisList'})
          }
        })
      },
      updateRedisCluster() {
        // , 号重组节点列表
        this.form.nodes = this.nodeLists.map(n=>n.value).join(',')
        updateRedisCluster(this.form).then(res => {
          if (res.code == 0) {
            this.$message({
              type: 'success',
              message: '更新成功',
            })
            this.$router.push({ name: 'redisList'})
          }
        })

      },
      goBack() {
        this.$router.go(-1)
      },
      onSubmit() {
        this.$refs['form'].validate((valid) => {
          if (!valid) {
            return
          }
          // 编辑 提交
          if (this.opType == 'edit') {
            this.updateRedisCluster()

            // 新建
          } else if (this.opType == 'create') {
            this.addRedisCluster()
          } else {
            this.$message({
              type: 'error',
              message: '未知操作类型',
            })
          }
        })
      },
      addNode() {
        this.nodeLists.push({
          value: '',
          key: Date.now()
        })
      },
      removeNode(item) {
        let index = this.nodeLists.indexOf(item)
        if (index !== -1) {
          this.nodeLists.splice(index, 1)
        }
      },
      checkRedisNodeRule() {
        // 这里只能通过原生js判断
        const nodeElement = document.getElementsByClassName('nodeTag')
        // 获取input文本数据
        for (let i=0;i<nodeElement.length;i++) {
          let inputVal = nodeElement[i].children[0].value
          if (inputVal.indexOf(':') == -1) {
            nodeElement[i].children[0].style.color = 'red'
            this.$message.error('redis节点格式: ip:port')
          } else {
            nodeElement[i].children[0].style.color = ''
          }
        }
      }

    }
  }
</script>

<style scoped lang="css">
  .redis-detail {
    width: 90%;
    margin: 50px auto 0 auto;
    border: #2c3e50 2px dashed;
  }
</style>
