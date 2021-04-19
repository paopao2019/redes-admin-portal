<template>
    <div :id="itemName" class="item-main">
      1
    </div>
</template>

<script>
  export default {
    name: "itemMonitor",
    data() {
      return {
        dataY: [],  // item中的y数据 -> 值
        dataX: [],  // item中x数据 -> 时间
        myChart: null,
        dataLegend: [],
        dataSeries: [],
      }
    },
    props: {
      itemName: String,
      redisMonitorData: {
        type: Array,
        default: function () {
          return []
        }
      },   // 监控的数据
    },
    mounted() {
      this.drawLine();
    },
    methods: {
      drawLine() {
        // console.log(this.redisMonitorData)
        this.dataSeries = []   // 先清空数据 避免vue缓存
        this.dataLegend = []   // 先清空数据 避免vue缓存
        for (let NodeMonitorData of this.redisMonitorData) {
          // 循环遍历节点数据
          for (let itemData of NodeMonitorData) {
            // 节点中的监控数据
            this.dataX.push(itemData.UpdatedAt)
            if (this.itemName.indexOf("used_memory")  !== -1) {
              itemData[this.itemName] = (itemData[this.itemName] / 1024 /1024).toFixed(1)
            }
            this.dataY.push(itemData[this.itemName])
          }
          this.dataSeries.push({
            "name": NodeMonitorData[0].node +"-" + NodeMonitorData[0].node_role,
            "type": 'line',
            "data": this.dataY,
          })

          this.dataLegend.push(NodeMonitorData[0].node +"-" + NodeMonitorData[0].node_role)
        }
        console.log(this.dataSeries)


        if (this.myChart != null && this.myChart!= "" && this.myChart!= undefined) {
          this.myChart.dispose();
        }
        this.myChart  =  this.$echarts.init(document.getElementById(this.itemName));


        var option;
        option = {
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: this.dataLegend   // 图例；刻印文字
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '11%',
            containLabel: true
          },
          toolbox: {
            feature: {
              saveAsImage: {}
            }
          },
          xAxis: {
            type: 'category',
            axisLabel: {
              rotate: 45,
              formatter:function(value)
              {
                // X 轴的时间显示格式化
                const timeObj = new Date(value)
                let h = timeObj.getHours()   // 时
                h = h < 10 ? '0' + h : h
                let m = timeObj.getMinutes()       // 分
                m = m < 10 ? '0' + m : m

                return h + ':' + m

              }
            },
            // data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            data: this.dataX   // X轴数据
          },
          yAxis: {
            axisLine: {show:true},
            type: 'value',
            minInterval:1,
          },
          series: this.dataSeries   // 折线图的Y轴数据
        };
        option && this.myChart.setOption(option);

      },

    },
    watch: {
      // 父组件传递过来的值 会变化 所以要watch 不然获取不全
      redisMonitorData(val) {
        console.log('监听值变化--------')
        this.redisMonitorData = val
        this.drawLine()
      }
    }
  }
</script>

<style scoped>

  .item-main {
    height: 90%;
    width: 100%;
  }

</style>