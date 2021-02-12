// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
var db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  
  console.log("event.ids ==>",event.ids)
  try {
    return await db.collection("c_address").where({
      _id:_.in(event.ids)
    }).remove()
  } catch (err) {
    console.log("err ==>",err)
  }
}