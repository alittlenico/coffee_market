// miniprogram/pages/person/person.js
//获取小程序实例
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {

    //用户信息
    userInfo: {
      url: '',
      nickName: '',
      sex: ''
    }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    //如果授权，则获取用户信息
    if (app.globalData.isAuth) {
      wx.getUserInfo({
        success: res => {
          console.log('res ==> ', res);
          this.setData({
            userInfo: {
              url: res.userInfo.avatarUrl,
              nickName: res.userInfo.nickName,
              sex: res.userInfo.gender == 0 ? '未知' : res.userInfo.gender == 1 ? '男' : '女'
            }
          })
        }
      })
    }

  },

  //收货地址
  address: function () {
    wx.navigateTo({
      url: '../address/address'
    })
  }
})