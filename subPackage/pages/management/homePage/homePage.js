
const globalData = getApp().globalData;

import apiUrl from '../../../../config.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showOperation: false,
    toOpenMini: false,
    isTishi: false,
    toSharePurchase: false,
    editUser:  false,
    yuyin: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight  * globalData.rpxR,
      sysDeviceId: globalData.sysDeviceId,
      url: apiUrl.server,
      disId: options.disId,
    })

    var disInfo = wx.getStorageSync('disInfo');
    if(disInfo){
      this.setData({
        disInfo: disInfo,
        appSupplierDepId: disInfo.appSupplierDepartment.gbDepartmentId

      })
    }
    
     
   
  },



  toMendian(){
    wx.navigateTo({
      url: '../../mendian/index/index',
    })

  },
  

  toGoods(){
    wx.navigateTo({
      url: '../../goods/index/index',
    })
  },
  
  // xiadan
  toResGoods() {

    wx.navigateTo({
      url: '../../goods/resGoods/resGoods',
    })

  },


  toJrdh() {
    wx.navigateTo({
      url: '../../supplier/index/index',
    })
  },


  toStaff(){
    wx.navigateTo({
      url: '../staff/staff',
    })
  },


  editHome(){
    wx.navigateTo({
      url: '../homeEdit/homeEdit',
    })

  },

  toHistory(){
    wx.navigateTo({
      url: '../../../subPackage/pages/orderHistory/index/index?disId=' + this.data.disId,
    })
  },


  toAccount(){
    wx.navigateTo({
      url: '../../account/payPage/payPage?type=0',
    })
  } , 


toPayList(){
  wx.navigateTo({
    url: '../../account/payList/payList',
  })
},



toPayPage(){
  wx.navigateTo({
    url: '../../account/payPage/payPage?type=0',
  })
},


toStock(){
  console.log("dstooddkckc")
  wx.navigateTo({
    url: '../../stock/index/index',
  })
},

toReceipts(){
  wx.navigateTo({
    url: '../../receipts/purchaseBillsTotal/purchaseBillsTotal',
  })
},



toReport(){
  wx.navigateTo({
    url: '../../data/reportPage/reportPage',
  })
},

toPriceFenxi(){
  wx.navigateTo({
    url: '../../data/priceFenxi/priceFenxi',
  })
},



toYishang() {
 
  wx.navigateTo({
    url: '../../yishang/yishangList/yishangList?depId=' + this.data.appSupplierDepId,
  })
},

  /**
   * 订货商
   */
  toJrdh() {
    wx.navigateTo({
      url: '../../supplier/index/index',
    })
  },


  toShixanBill(){
    wx.navigateTo({
      url: '../../yishang/myNxDistributerBill/myNxDistributerBill?nxDisId=' + this.data.disInfo.nxDistributerEntity.nxDistributerId + '&gbDisId=' + this.data.disId,
    })


  },



  toBack(){
    wx.navigateBack({
      delta: 1,
    })
  },








})