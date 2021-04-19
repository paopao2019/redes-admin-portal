// 字典

import global from "@/global";

export function basecode($event,value,dicName) {
    var key = value;
    if (value === undefined || value === null) {
        return ''
    }
    if (dicName === undefined || dicName === null) {
        return value
    }

    let dictLabel = ''
    var dictList = global[dicName]
    for (let i = 0; i < dictList.length ; i++) {
        if (dictList[i].item_value == key) {
            dictLabel = dictList[i].item_name
        }
    }
    console.log(dictLabel)
    return dictLabel




}


// 根据字典值获取数据
export function getDataByCode(keyCode) {
    var dict = basecode[keyCode]
    let list = []
    for (var key in dict) {
        list.push({
            'value': key,
            'text': dict[key]
        })
    }
    return list
}



// 时间戳转日期
export function formatTimestamp(value) {
    if (value == null) {
        return ''
    }
    var date = new Date(value)
    var y = date.getFullYear()
    var m = date.getMonth() + 1
    m = m < 10 ? ('0' + m) : m
    var d = date.getDate()
    d = d < 10 ? ('0' + d) : d
    var h = date.getHours()
    h = h < 10 ? ('0' + h) : h
    var minute = date.getMinutes()
    var second = date.getSeconds()
    minute = minute < 10 ? ('0' + minute) : minute
    second = second < 10 ? ('0' + second) : second
    return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second
}


// 时间戳转日期
export function formatDate(value) {
    if (value == null) {
        return ''
    }
    var date = new Date(value)
    var y = date.getFullYear()
    var m = date.getMonth() + 1
    m = m < 10 ? ('0' + m) : m
    var d = date.getDate()
    d = d < 10 ? ('0' + d) : d
    return y + '-' + m + '-' + d
}
