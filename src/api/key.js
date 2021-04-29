import service from '@/utils/request'



export const getDBList = (query) => {
  return service({
    url: "/data/getDBList/" + query,
    method: 'get',
  })
}



export const keyScan = (data) => {
  return service({
    url: "/key/scan",
    method: 'post',
    data: data
  })
}



export const keyQuery = (data) => {
  return service({
    url: "/key/query",
    method: 'post',
    data: data
  })
}
