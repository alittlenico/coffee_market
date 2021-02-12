// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

//获取数据库引用
var db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {

  console.log("123")
  console.log("event ==>",event)
  try {

    return await db.collection('c_address').add({
      data: event
    });

  } catch (err) {
    console.log('云函数调用失败 err ==> ', err);
  }
  
}