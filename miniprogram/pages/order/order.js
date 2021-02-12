// miniprogram/pages/order/order.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //订单数据
    orderData: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  onShow: function () {
    this.getOrderData();
  },

  //获取订单数据
  getOrderData: function () {
    wx.showLoading({
      title: '加载中'
    })

    wx.cloud.callFunction({
      name: 'coffee_get_order',
      success: res => {
        wx.hideLoading();
        console.log('res ==> ', res);

        res.result.data.forEach(v => {
          v.count = 0;
          v.total = 0;
          v.products.forEach(item => {
            v.count += item.count;
            v.total += item.count * item.price;
          })
        })
        // 按订单时间排序 优先显示最近时间的
        res.result.data.sort(function(a,b){
          var t1 = new Date(a.orderDate).getTime();
          var t2 = new Date(b.orderDate).getTime();
          if(t1<t2){
            return 1
          }else if(t1==t2){
            return 0
          }else{
            return -1
          }
        })
        console.log("res.result.data ==>",res.result.data)
        this.setData({
          orderData: res.result.data
        })
      },
      fail: err => {
        wx.hideLoading();
        console.log('出错了 err ==> ', err);
      }
    })
  }

  
})