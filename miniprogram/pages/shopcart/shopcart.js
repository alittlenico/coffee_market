// miniprogram/pages/shopcart/shopcart.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

    //购物车商品数据
    shopcartData: [],

    //全选
    isAllSelect: false,

    //管理商品
    isManage: false,

    //总金额
    total: 0

  },

  /**
   * 生命周期函数--监听页面加载, 只执行一次，首次进来
   */
  onLoad: function (options) {
    console.log('onload');

    

  },

  //当页面显示的时候执行 数据被渲染后
  onShow: function () {
    this.setData({
      shopcartData: []
    })
    console.log('onshow');
    //根据用户查询购物车商品数据
    this.getShopcartByUser();
  },

  //根据用户查询购物车商品数据
  getShopcartByUser: function () {
    //加载提示
    wx.showLoading({
      title: '加载中...'
    })

    wx.cloud.callFunction({
      name: 'coffee_get_shopcart_byuser',
      success: res => {
        //关闭加载提示
        wx.hideLoading();
        console.log('res ==> ', res);

        //添加一个isSelect属性,用于判断是否勾选商品
        res.result.data.forEach(v => {
          v.isSelect = false;
        })

        this.setData({
          shopcartData: res.result.data
        })

        //获取所有商品id, 需要排除重复的商品id
        var ids = [];

        res.result.data.forEach(v => {
          //如果当前商品id不存在，则将当前商品id推进ids数组中
          if (ids.indexOf(v.id) === -1) {
            ids.push(v.id);
          }
        })

        // console.log('ids ==> ', ids);

        //根据商品id查询商品数据
        this.getProductById(ids);


      },
      fail: err => {
        //关闭加载提示
        wx.hideLoading();
        console.log('出错了 err ==> ', err);
      }
    })
  },

  //根据商品id查询商品数据
  getProductById: function (ids) {
    //加载提示
    wx.showLoading({
      title: '加载中...'
    })

    wx.cloud.callFunction({
      name: 'coffee_get_product_byid',
      data: {
        ids: ids
      },

      success: res => {
        //关闭加载提示
        wx.hideLoading();
        console.log('商品数据 res ==> ', res);

        //购物车商品数据
        var shopcartData = this.data.shopcartData;

        

        //遍历购物车商品数据，然后根据商品id去筛选商品数据(商品图片、商品名称、商品价格)
        shopcartData.forEach(v => {

          //遍历商品数据
          for (var i = 0; i < res.result.data.length; i++) {
            if (v.id == res.result.data[i]._id) {
              v.img = res.result.data[i].small_img;
              v.name = res.result.data[i].name;
              v.price = res.result.data[i].price;
              break;
            }
          }
        })

        
        console.log('shopcartData ==> ', shopcartData);

        this.setData({
          shopcartData: shopcartData
        })

      },

      fail: err => {
        //关闭加载提示
        wx.hideLoading();
        console.log('出错了 err ==> ', err);
      }

    })
  },

  //全选
  allSelect: function () {
    this.setData({
      isAllSelect: !this.data.isAllSelect
    })

    //勾选所有单选
    this.data.shopcartData.forEach(v => {
      v.isSelect = this.data.isAllSelect;
    })

    this.setData({
      shopcartData: this.data.shopcartData
    })

    //计算总金额
    this.sum();

  },

  //单选
  simpleSelect: function (e) {

    var item = this.data.shopcartData[e.currentTarget.dataset.index];

    item.isSelect = !item.isSelect;

    this.setData({
      shopcartData: this.data.shopcartData
    })

    //遍历所有单选，如果发现一个没有勾选，则表明全选不能勾选
    var isHas = false;
    for (var i = 0; i < this.data.shopcartData.length; i++) {
      if (!this.data.shopcartData[i].isSelect) {
        this.setData({
          isAllSelect: false
        })
        isHas = true;
        break;
      }
    }

    if (!isHas) {
      this.setData({
        isAllSelect: true
      })
    }


    //计算总金额
    this.sum();

    
  },

  //增加数量
  increase: function (e) {
    console.log('e ==> ', e);

    var count = this.data.shopcartData[e.currentTarget.dataset.index].count;

    //修改页面的商品数量
    count++;

    this.data.shopcartData[e.currentTarget.dataset.index].count = count;

    this.setData({
      shopcartData: this.data.shopcartData
    })

    //修改购物车的商品数量
    this.modifyCount(e.currentTarget.dataset.id, count);

  },

  //减少数量
  decrease: function (e) {
    //保证商品数量至少为1
    var count = this.data.shopcartData[e.currentTarget.dataset.index].count;

    if (count == 1) {
      return;
    }

    count--;

    this.data.shopcartData[e.currentTarget.dataset.index].count = count;

    this.setData({
      shopcartData: this.data.shopcartData
    })

    //修改购物车的商品数量
    this.modifyCount(e.currentTarget.dataset.id, count);


  },

  //修改购物车的商品数量
  modifyCount: function (id, count) {
    //加载提示
    wx.showLoading({
      title: '加载中...'
    })

    wx.cloud.callFunction({
      name: 'coffee_update_shopcart_count',
      data: {
        id: id,
        count: count
      },
      success: res => {
        //关闭加载提示
        wx.hideLoading();
        console.log('res ==> ', res);
        //计算总金额
        this.sum();
      },
      fail: err => {
        //关闭加载提示
        wx.hideLoading();
        console.log('出错了 err ==> ', err);
      }
    })
  },

  //管理商品
  manageProduct: function () {
    this.setData({
      isManage: !this.data.isManage
    })
  },

  //删除数据库的购物车商品
  removeShopcart: function (ids, index) {
    //ids: 购物车id集合

    //加载提示
    wx.showLoading({
      title: '加载中...'
    })

    wx.cloud.callFunction({
      name: 'remove_shopcart_byid',
      data: {
        ids: ids
      },
      success: res => {
        //关闭加载提示
        wx.hideLoading();
        console.log('res ==> ', res);

        //删除一个购物车商品
        if (index !== undefined) {
          this.data.shopcartData.splice(index, 1);

        } else {
          //删除选择的购物车商品
          for (var i = this.data.shopcartData.length - 1; i >= 0; i--) {
            if (this.data.shopcartData[i].isSelect) {
              this.data.shopcartData.splice(i, 1);
            }
          }

          
        }

        this.setData({
          shopcartData: this.data.shopcartData
        })

        //计算总金额
        this.sum();
      },
      fail: err => {
        //关闭加载提示
        wx.hideLoading();
        console.log('出错了 err ==> ', err);
      }
    })

  },

  //单个删除购物车商品
  removeOneShopcart: function (e) {
    console.log('e ==> ', e);

    var ids = [e.currentTarget.dataset.id];

    var index = e.currentTarget.dataset.index;

    this.removeShopcart(ids, index);

  },

  //删除选中的购物车商品
  removeSelectShopcart: function () {

    //获取选中购物车id
    var ids = [];

    this.data.shopcartData.forEach(v => {
      if (v.isSelect) {
        ids.push(v._id);
      }
    })

    console.log('ids ==> ', ids);

    if (ids.length == 0) {
      wx.showToast({
        title: '请选择删除的商品',
        icon: 'none',
        duration: 2000
      })
      return;
    }


    //删除购物车商品
    this.removeShopcart(ids);

  },

  //计算总金额
  sum: function () {
    //获取勾选的商品计算总金额
    var total = 0;

    this.data.shopcartData.forEach(v => {
      if (v.isSelect) {
        total += v.count * v.price;
      }
    })

    this.setData({
      total: total
    })
  },

  //去结算
  pay: function () {
    //获取选中的购物车id
    var ids = [];

    this.data.shopcartData.forEach(v => {
      if (v.isSelect) {
        ids.push(v._id)
      }
    })

    //如果没有勾选商品，则不做任何事情
    if (ids.length == 0) {
      wx.showToast({
        title: '请选择需要购买的商品',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    console.log('ids ==> ', ids);

    //携带ids跳转到提交订单页面
    wx.navigateTo({
      url: '../commit/commit?id=' + ids.join('@')
    })
  }
  
})