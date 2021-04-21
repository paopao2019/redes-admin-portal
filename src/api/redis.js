import service from '@/utils/request'
import { handleFileError } from '@/utils/download'

// @Tags CMDBRedis
// @Summary 新增redis
// @Router /cmdb/redis/createRedis[post]
export const addRedisCluster = (data) => {
  return service({
    url: "/redis/addCluster",
    method: 'post',
    data
  })
}

export const deleteRedisCluster = (data) => {
  return service({
    url: "/redis/deleteCluster",
    method: 'delete',
    data: data
  })
}




export const updateRedisCluster = (data) => {
  return service({
    url: "/redis/updateCluster",
    method: 'put',
    data: data
  })
}


// 查
export const getRedisClusterList = (data) => {
  return service({
    url: "/redis/getClusterList",
    method: 'post',
    data
  })
}

// 通过ID
export const getRedisClusterById = (data) => {
  return service({
    url: "/redis/getClusterById",
    method: 'post',
    data
  })
}

// 根据时间范围查找
// {
//   "cluster_id": 1,
//   "start_time": "1618552743",
//   "end_time": "1618552863",
//   "node_list": ["10.108.26.60:6391","10.108.26.60:6392"]
//
// }
export const getInfoItemMonitorData = (data) => {
  return service({
    url: "/monitor/getInfoItemMonitorData",
    method: 'post',
    data
  })
}

// @Tags CMDBRedis
// @Summary Export
// @Router /cmdb/redis/exportExcel[get]
export const exportExcel = (params) => {
  return service({
    url: "/cmdb/redis/exportExcel",
    method: 'get',
    params,
    responseType: 'blob'   // blob文件对象
  }).then(res => {
    handleFileError(res, params.fileName)
  })
}




// 发送命令
export const sendCommand = (data) => {
  return service({
    url: "/command/sendCommand",
    method: 'post',
    data
  })
}