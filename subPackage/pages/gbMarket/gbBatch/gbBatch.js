var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;
import apiUrl from '../../../../config.js'

import {
  getDisPurchaseGoodsBatchGb,

   jrdhUserLogin,

  sellUserReadDisBatchGb,
  sellerUpdatePurGoods,
  supplierEditBatchGb,
  supplierGetPrintBatchGb,

  
  
} from '../../../../lib/apiDepOrder'


import dateUtil from '../../../../utils/dateUtil';

Page({

  onShow() {
    // if (this.data.sendSuccess) {

    // 推荐直接用新API
    let windowInfo = wx.getWindowInfo();
    let globalData = getApp().globalData;
    this.setData({
      windowWidth: windowInfo.windowWidth * globalData.rpxR,
      windowHeight: windowInfo.windowHeight * globalData.rpxR,
      statusBarHeight: globalData.statusBarHeight * globalData.rpxR,
      numWidth: (windowInfo.windowWidth / 4) * globalData.rpxR - 40,
      numContainerWidth: (windowInfo.windowWidth / 4) * globalData.rpxR - 20,
      numHeight: (windowInfo.windowWidth / 4) * globalData.rpxR - 40,
      numContainerHeight: (windowInfo.windowWidth / 4) * globalData.rpxR - 20,
      btnWidth: (windowInfo.windowWidth / 8) * globalData.rpxR - 20,
      btnWidthContainer: (windowInfo.windowWidth / 8) * globalData.rpxR,
      bigBtnWidth: (windowInfo.windowWidth / 6) * globalData.rpxR - 20,
      bigBtnWidthContainer: (windowInfo.windowWidth / 6) * globalData.rpxR,
      
    });


      this._getInitData();
    // }
  },

  data: {
    bottomHeight: 240,
    formHeight: 480,
    isTishi: false,
    isTishiSave: false,
    lastInput: true,
    focusIndex: -1,
    isSellRegiste: false,
    toPrice: false,
    saveBatch: false,
    retName: "",
    batchId: null,
    sendSuccess: false,
    helpWeight: "0",
    scaleInput: false,
   
  },

  onLoad: function (options) {
    this.setData({
     
      url: apiUrl.server,
      todayDate: dateUtil.getWhichOnlyDate(0),
      orderTime: dateUtil.getOnlyTime(0),
      batchId: options.batchId,
      retName: options.retName,
      fromBuyer: options.fromBuyer,
    
      
    })

    this._userLogin();
   
    

  },

  _getInitData() {
    var that = this;
    load.showLoading("获取订货商品")
    getDisPurchaseGoodsBatchGb(this.data.batchId)
      .then(res => {
        load.hideLoading();
        if (res.result.code == 0) {
          this.setData({
            batch: res.result.data,
            batchStatus: res.result.data.gbDpbStatus,
            disId: res.result.data.gbDpbDistributerId,
          }) 
          
          if (res.result.data.gbDpbStatus == -1 ) {

            that._shareUserRead();
          }         
        }else{
          wx.showToast({
            title: res.result.msg,
            icon: 'none'
          })
          if(this.data.buyUser){
            wx.redirectTo({
              url: '../index/index',
            })
          }else{
            var disId = this.data.disId;
            var name = this.data.retName;
            wx.redirectTo({
              url: '../supplierBills/supplierBills?sellUserId=' + this.data.userInfo.nxJrdhUserId +   '&disId=' + disId +'&retName=' + name,
            })
          }
        } 
      })
  },

  

  _userLogin() {
    //jrdh用户登陆，默认是供货商卖方
    var that = this;
    wx.login({
      success: (res) => {
        var data = {
          disId: this.data.disId,
          code: res.code,
         
        }
      jrdhUserLogin(data)
          .then((res) => {
            console.log(res.result)
            if (res.result.code == 0) {
              that.setData({
                userInfo: res.result.data,
              })
            
              that._getInitData();
            }  

          })
      }
    })
  },
 


  _shareUserRead() {
    console.log("_shareUserRead_shareUserRead_shareUserRead_shareUserRead")
    var data  = {
      openId: this.data.userInfo.nxJrdhWxOpenId,
      sellUserId: this.data.userInfo.nxJrdhUserId,
      batchId: this.data.batchId
    }
    sellUserReadDisBatchGb(data)
      .then(res => {
        if (res.result.code == 0) {
          console.log(res.result)
          this.setData({
           
            batch: res.result.data,
            batchStatus: res.result.data.gbDpbStatus,
          })


          
        }
      })
  },

  getSupplierBatch(e) {
   
    wx.redirectTo({
      url: '../supplierBills/supplierBills?sellUserId=' + this.data.batch.gbDpbSellUserId + '&disId=' + this.data.disId,
    })

  },

  onShareAppMessage(e) {
    if (e.target.dataset.type == 'outOrder') {
      return {
        // title: '订货',
        path: '/pages/gbMarket/gbOrderBatch/gbOrderBatch?batchId=' + this.data.batchId +
        '&retName=' + this.data.retName + '&disId=' + this.data.disId + 'fromBuyer=0',
        envVersion: 'release', //release develop trial
      }
    }
    if (e.target.dataset.type == 'inOrder') {
      var shareObj = {
        imageUrl: '',
      }
      shareObj.title = "请称重这些订单"
      shareObj.path = '/pages/gbMarket/gbOrderBatch/gbOrderBatch?batchId=' + this.data.batchId + '&retName=' + this.data.retName + '&helpWeight=1';
      return shareObj;
    }
  },


  // **************input******************
  __checkNumber(e) {
    console.log("checkckckkckck")
    var patrn = /^(-)?\d+(\.\d+)?$/;
    if (patrn.exec(e.detail.value) == null) {
      return false
    } else {
      return true
    }
  },


  //input methos ======
  //1,输入
  inputValue(e) {
    if (this.data.scaleInput) {
      this._multipleInput(e);
    } else {
      this._singleInput(e);
    }
  },

  // 普通规格录入
  _singleInput(e) {
    var value = e.currentTarget.dataset.value;

    //输入单价
    var oldValue = this.data.batch.gbDPGEntities[this.data.focusIndex].gbDepartmentOrdersEntities[this.data.orderIndex].gbDoWeight;
    //1，输入数字
    if (value <= 9 && value >= 0) {
      oldValue = this.data.batch.gbDPGEntities[this.data.focusIndex].gbDepartmentOrdersEntities[this.data.orderIndex].gbDoWeight;
      var newValue = 0;
      if (oldValue !== null && oldValue !== "0.0") {
        newValue = oldValue + value;
      } else {
        newValue = value
      }
      this.setData({
        ["batch.gbDPGEntities[" + this.data.focusIndex + "].gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoWeight"]: newValue,
        ["item.gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoWeight"]: newValue,
        ["orders.gbDoWeight"]: newValue
      })
      this._getTotalQuantity();
    } else {
      //2，输入“dian”
      if (value == ".") {
        oldValue = this.data.batch.gbDPGEntities[this.data.focusIndex].gbDepartmentOrdersEntities[this.data.orderIndex].gbDoWeight;
        var newValue = 0;
        if (oldValue.indexOf(".") != -1) {} else {
          if (oldValue > 0) {
            newValue = oldValue + value;
            this._getTotalQuantity();
          } else {
            newValue = "0."
          }
          this.setData({
            ["batch.gbDPGEntities[" + this.data.focusIndex + "].gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoWeight"]: newValue,
            ["item.gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoWeight"]: newValue,
            ["orders.gbDoWeight"]: newValue
          })
          this._getTotalQuantity();
        }
      }
      //2，输入“删除”
      if (value == "del") {
        newValue = oldValue.substr(0, oldValue.length - 1);
        this.setData({
          ["batch.gbDPGEntities[" + this.data.focusIndex + "].gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoWeight"]: newValue,
          ["item.gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoWeight"]: newValue,
          ["orders.gbDoWeight"]: newValue
        })
        this._getTotalQuantity();
      }

      //31，输入“关闭”
      if (value == "close") {

        this._getInitData()
        // this.setData({
        //   ["item"]: "",
        //   ["orders"]: "",
        //   scaleInput: false,
        // })
        this.setData({
          focusIndex: -1,
          lastInput: true
        })
      }
      //32，输入“关闭”
      if (value == "finish") {
        this.setData({
          focusIndex: -1,
          lastInput: true
        })
        this._savePurGoods();
      }
      //4,输入“下一个”
      if (value == "next") {
        var focusIndex = this.data.focusIndex;
        if (focusIndex !== this.data.batch.gbDPGEntities.length - 1) {
          this.setData({
            focusIndex: focusIndex + 1,
          })
        } else {
          this.setData({
            focusIndex: -1,
            lastInput: true
          })
        }
      }
    }
    // .over
  },

  // 普通录入换算数量
  _getTotalQuantity() {
    var arr = this.data.batch.gbDPGEntities[this.data.focusIndex].gbDepartmentOrdersEntities;
    var temp = "";
    for (var i = 0; i < arr.length; i++) {
      var weightValue = this.data.batch.gbDPGEntities[this.data.focusIndex].gbDepartmentOrdersEntities[i].gbDoWeight;
      if (weightValue) {
        temp = Number(temp) + Number(weightValue);
      }
    }
    temp = Number(temp).toFixed(1);
    console.log("teimpp" + temp)
    this.setData({
      ["batch.gbDPGEntities[" + this.data.focusIndex + "].gbDpgBuyQuantity"]: temp,
      ["item.gbDpgBuyQuantity"]: temp
    })

    var price = this.data.batch.gbDPGEntities[this.data.focusIndex].gbDpgBuyPrice;
    if (price > 0) {
      console.log("subttototopricepriceprice" + price)
      var weight = this.data.batch.gbDPGEntities[this.data.focusIndex].gbDpgBuyQuantity;
      var subtotal = Number(price) * Number(weight);
      console.log("subttototo" + subtotal)

      this.setData({
        ["batch.gbDPGEntities[" + this.data.focusIndex + "].gbDpgBuySubtotal"]: subtotal.toFixed(1),
        ["item.gbDpgBuySubtotal"]: subtotal.toFixed(1)
      })
      var orderWeight = this.data.batch.gbDPGEntities[this.data.focusIndex].gbDepartmentOrdersEntities[this.data.orderIndex].gbDoWeight;
      var sub = Number(orderWeight) * Number(price)
      this.setData({
        ["batch.gbDPGEntities[" + this.data.focusIndex + "].gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoSubtotal"]: sub.toFixed(1),
        ["item.gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoSubtotal"]: sub.toFixed(1),
      })
    }
    this._getOrderSubTotal();
  },

  // 普通录入计算采购商品
  _getOrderSubTotal() {
    var priceValue = this.data.batch.gbDPGEntities[this.data.focusIndex].gbDpgBuyPrice;
    var weightValue = this.data.batch.gbDPGEntities[this.data.focusIndex].gbDpgBuyQuantity;
    if (priceValue !== null) {
      var subtotalValue = (Number(weightValue) * Number(priceValue)).toFixed(1);
      this.setData({
        ["batch.gbDPGEntities[" + this.data.focusIndex + "].gbDpgBuySubtotal"]: subtotalValue,
      })
    }
  },

  // /////////////scale ================================
  //有系数规格录入重量
  _multipleInput(e) {
    var value = e.currentTarget.dataset.value;
    //输入单价
    var oldValue = this.data.batch.gbDPGEntities[this.data.focusIndex].gbDepartmentOrdersEntities[this.data.orderIndex].gbDoScaleWeight;
    //1，输入数字
    if (value <= 9 && value >= 0) {
      oldValue = this.data.batch.gbDPGEntities[this.data.focusIndex].gbDepartmentOrdersEntities[this.data.orderIndex].gbDoScaleWeight;
      var newValue = 0;
      if (oldValue !== null && oldValue !== "0.0") {
        newValue = oldValue + value;
      } else {
        newValue = value
      }
      this.setData({
        ["batch.gbDPGEntities[" + this.data.focusIndex + "].gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoScaleWeight"]: newValue,
        ["item.gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoScaleWeight"]: newValue,
        ["orders.gbDoScaleWeight"]: newValue
      })
      this._getDoWeightScale();
    } else {
      //2，输入“dian”
      if (value == ".") {
        oldValue = this.data.batch.gbDPGEntities[this.data.focusIndex].gbDepartmentOrdersEntities[this.data.orderIndex].gbDoScaleWeight;
        var newValue = 0;
        if (oldValue.indexOf(".") != -1) {} else {
          if (oldValue > 0) {
            newValue = oldValue + value;
            this._getDoWeightScale();
          } else {
            newValue = "0."
          }
          this.setData({

            ["batch.gbDPGEntities[" + this.data.focusIndex + "].gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoScaleWeight"]: newValue,
            ["item.gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoScaleWeight"]: newValue,
            ["orders.gbDoScaleWeight"]: newValue
          })
          this._getDoWeightScale();
        }
      }
      //2，输入“删除”
      if (value == "del") {
        newValue = oldValue.substr(0, oldValue.length - 1);
        this.setData({
          ["batch.gbDPGEntities[" + this.data.focusIndex + "].gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoScaleWeight"]: newValue,
          ["item.gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoScaleWeight"]: newValue,
          ["orders.gbDoScaleWeight"]: newValue
        })
        this._getDoWeightScale();
      }

      //31，输入“关闭”
      if (value == "close") {
        this._getInitData()
        this.setData({
          ["item"]: "",
          ["orders"]: "",
          scaleInput: false,

        })
        this.setData({
          focusIndex: -1,
          lastInput: true
        })
      }
      //32，输入“关闭”
      if (value == "finish") {
        this.setData({
          focusIndex: -1,
          lastInput: true
        })
        this._savePurGoods();
      }
      //4,输入“下一个”
      if (value == "next") {
        var focusIndex = this.data.focusIndex;
        if (focusIndex !== this.data.batch.gbDPGEntities.length - 1) {
          this.setData({
            focusIndex: focusIndex + 1,
          })
        } else {
          this.setData({
            focusIndex: -1,
            lastInput: true
          })
        }
      }
    }
    // .over
  },


  // 换算每个订单的重量
  _getDoWeightScale() {
    var scaleWeight = this.data.batch.gbDPGEntities[this.data.focusIndex].gbDepartmentOrdersEntities[this.data.orderIndex].gbDoScaleWeight;
    var scale = this.data.batch.gbDPGEntities[this.data.focusIndex].gbDepartmentOrdersEntities[this.data.orderIndex].gbDoDsStandardScale;
    console.log(scaleWeight);
    var doWeight = (Number(scaleWeight) * Number(scale)).toFixed(1);
    this.setData({
      ["batch.gbDPGEntities[" + this.data.focusIndex + "].gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoWeight"]: doWeight,
      ["item.gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoWeight"]: doWeight,
      ["orders.gbDoWeight"]: doWeight
    })

    this._getSclaeOrderTotal(); // 计算采购商品的总重量
    this._getTotalScale() //计算采购商品的小计
  },

  _getSclaeOrderTotal() {

    var arr = this.data.batch.gbDPGEntities[this.data.focusIndex].gbDepartmentOrdersEntities;
    var temp = "";
    for (var i = 0; i < arr.length; i++) {
      var weightValue = this.data.batch.gbDPGEntities[this.data.focusIndex].gbDepartmentOrdersEntities[i].gbDoWeight;

      if (weightValue) {
        temp = Number(temp) + Number(weightValue);
      }
    }
    temp = Number(temp).toFixed(1);
    this.setData({
      ["batch.gbDPGEntities[" + this.data.focusIndex + "].gbDpgBuyQuantity"]: temp,
      ["item.gbDpgBuyQuantity"]: temp
    })

    var scalePrice = this.data.batch.gbDPGEntities[this.data.focusIndex].gbDpgBuyScalePrice;
    console.log("scalrpririir000000000" + scalePrice)
    if (scalePrice) {
      var orderWeight = this.data.batch.gbDPGEntities[this.data.focusIndex].gbDepartmentOrdersEntities[this.data.orderIndex].gbDoScaleWeight;
      var orderSubtotal = (Number(scalePrice) * Number(orderWeight)).toFixed(1);
      console.log("orderSubtotal" + orderSubtotal)
      this.setData({
        ["batch.gbDPGEntities[" + this.data.focusIndex + "].gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoSubtotal"]: orderSubtotal,
        ["item.gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoSubtotal"]: orderSubtotal,
        ["orders.gbDoSubtotal"]: orderSubtotal
      })
    }
  },


  _getTotalScale() {
    var arr = this.data.batch.gbDPGEntities[this.data.focusIndex].gbDepartmentOrdersEntities;
    var temp = "";
    for (var i = 0; i < arr.length; i++) {
      var weightValue = this.data.batch.gbDPGEntities[this.data.focusIndex].gbDepartmentOrdersEntities[i].gbDoScaleWeight;
      if (weightValue) {
        temp = Number(temp) + Number(weightValue);
      }
    }
    // temp = Number(temp);  
    this.setData({
      ["batch.gbDPGEntities[" + this.data.focusIndex + "].gbDpgBuyScaleQuantity"]: temp,
      ["item.gbDpgBuyScaleQuantity"]: temp
    })

    var price = this.data.batch.gbDPGEntities[this.data.focusIndex].gbDpgBuyScalePrice;
    if (price) {
      var weight = this.data.batch.gbDPGEntities[this.data.focusIndex].gbDpgBuyScaleQuantity;
      var subtotal = Number(price) * Number(weight);
      this.setData({
        ["batch.gbDPGEntities[" + this.data.focusIndex + "].gbDpgBuySubtotal"]: subtotal.toFixed(1),
        ["item.gbDpgBuySubtotal"]: subtotal.toFixed(1)
      })
    }
  },






  // *****

  // /////////
  inputGoods(e) {
    var orders = e.currentTarget.dataset.orders;
    if (orders.gbDoDsStandardScale !== null && orders.gbDoDsStandardScale > 0 && orders.gbDoDsStandardScale !== '-1') {
      this.setData({
        scaleInput: true,
      })
    }
    this.setData({
      item: e.currentTarget.dataset.item,
      orders: e.currentTarget.dataset.orders,
      focusIndex: e.currentTarget.dataset.index,
      orderIndex: e.currentTarget.dataset.orderindex,
      lastInput: false,
    })
  },


  showPrice() {
    this.setData({
      toPrice: true
    })
    wx.navigateTo({
      url: '../gbOrderInput/gbOrderInput?batchId=' + this.data.batchId + '&retName=' + this.data.retName,
    })
  },


  _savePurGoods() {

    sellerUpdatePurGoods(this.data.item)
      .then(res => {
        if (res.result.code == 0) {
          this.setData({
            focusIndex: -1,
            lastInput: true,
            ["item"]: "",
            ["orders"]: "",
            scaleInput: false,

          })
        }
      })
  },


  toEditOrders() {
    supplierEditBatchGb(this.data.batch.gbDistributerPurchaseBatchId)
      .then(res => {
        if (res.result.code == 0) {
          this.setData({
            bill: res.result.data,
            batchStatus: res.result.data.gbDpbStatus,
          })
        }
      })
  },

  toEditOrdersNo() {
    wx.showToast({
      title: '请采购员解锁',
      icon: 'none'
    })
  },



  toPrintReceipt(){

    supplierGetPrintBatchGb(this.data.batch.gbDistributerPurchaseBatchId)
    .then(res => {
      if (res.result.code == 0) {
        this.setData({
          bill: res.result.data,
          batchStatus: res.result.data.gbDpbStatus,
        })
      }
    })


  },

  toIndex(){
    wx.redirectTo({
      url: '../index/index?disId=' + this.data.disId,
    })
  }




})