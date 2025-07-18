var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;
import apiUrl from '../../../../config.js'

import {


  jrdhSellerRegisterWithFileGbJj,
  whichJrdhUserLoginGbJj,
  sellUserReadDisBatchGb,

  sellerUpdatePurGoods,
  supplierEditBatchGb,
  supplierGetPrintBatchGb,

} from '../../../../lib/apiDepOrder'

import {
  getDisPurchaseGoodsBatchGb,
} from '../../../../lib/apiDistributerGb'


import dateUtil from '../../../../utils/dateUtil';

Page({

  onShow() {

      // 推荐直接用新API
      let windowInfo = wx.getWindowInfo();
      let globalData = getApp().globalData;
      this.setData({
        windowWidth: globalData.windowWidth * globalData.rpxR,
        windowHeight: globalData.windowHeight * globalData.rpxR,
        statusBarHeight: globalData.statusBarHeight * globalData.rpxR,
        numWidth: (globalData.windowWidth / 4) * globalData.rpxR - 40,
        numContainerWidth: (globalData.windowWidth / 4) * globalData.rpxR - 20,
        numHeight: (globalData.windowWidth / 4) * globalData.rpxR - 40,
        numContainerHeight: (globalData.windowWidth / 4) * globalData.rpxR - 20,
        btnWidth: (globalData.windowWidth / 8) * globalData.rpxR - 20,
        btnWidthContainer: (globalData.windowWidth / 8) * globalData.rpxR,
        bigBtnWidth: (globalData.windowWidth / 6) * globalData.rpxR - 20,
        bigBtnWidthContainer: (globalData.windowWidth / 6) * globalData.rpxR,
      });


    if (this.data.update) {
      this._getInitData();
    }

    // 2，打印初始化参数
    var list = []
    var numList = []
    var j = 0
    for (var i = 20; i < 200; i += 10) {
      list[j] = i;
      j++
    }
    for (var i = 1; i < 10; i++) {
      numList[i - 1] = i
    }
    this.setData({
      buffSize: list,
      oneTimeData: list[0],
      printNum: numList,
      printerNum: numList[0],
      looptime: 0,
      currentTime: 1,
      lastData: 0,
      returnResult: "",
      buffIndex: 0,
      printNumIndex: 0,
      currentPrint: 1,
      isReceiptSend: false,
      isLabelSend: false,

      printTimes: 0,
      canConnect: false,
      printOk: false
    })
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
    buyUser: false,
    canSave: false,
    nickName: "",
  },

  onLoad: function (options) {
    this.setData({
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,
      statusBarHeight: globalData.statusBarHeight * globalData.rpxR,
      numWidth: (globalData.windowWidth / 4) * globalData.rpxR - 40,
      numContainerWidth: (globalData.windowWidth / 4) * globalData.rpxR - 20,
      numHeight: (globalData.windowWidth / 4) * globalData.rpxR - 40,
      numContainerHeight: (globalData.windowWidth / 4) * globalData.rpxR - 20,
      btnWidth: (globalData.windowWidth / 8) * globalData.rpxR - 20,
      btnWidthContainer: (globalData.windowWidth / 8) * globalData.rpxR,
      bigBtnWidth: (globalData.windowWidth / 6) * globalData.rpxR - 20,
      bigBtnWidthContainer: (globalData.windowWidth / 6) * globalData.rpxR,
      url: apiUrl.server,
      todayDate: dateUtil.getWhichOnlyDate(0),
      orderTime: dateUtil.getOnlyTime(0),
      avatarUrl: "/images/user.png",
      canRegister: false,
      batchId: options.batchId,
      retName: options.retName,
      disId: options.disId,
      buyerUserId: options.buyerUserId,
      fromBuyer: options.fromBuyer,
      depId: options.depId,
      purUserId: options.buyerUserId
    })

    var nxDisId = wx.getStorageSync('nxDisId');
    if(nxDisId){
      this.setData({
        nxDisId: nxDisId
      })
    }else{
      this.setData({
        nxDisId: -1
      })
    }

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

          if (res.result.data.gbDpbStatus == -1 && this.data.buyUser == false) {
            that._shareUserRead();
          }
        } else {
          this.setData({
            billCancle: true,
          })
        }
      })
  },

  _userLogin() {
    //jrdh用户登陆，默认是供货商卖方
    var that = this;
    wx.login({
      success: (res) => {

        var data = {
          gbDisId: this.data.disId,
          code: res.code,
          batchId: this.data.batchId,
          gbDepId: this.data.depId,
          purUserId: this.data.purUserId,
        }
        whichJrdhUserLoginGbJj(data)
          .then((res) => {
            console.log(res.result)
            if (res.result.code == 0) {
              that.setData({
                disInfo: res.result.data.disInfo,
              })

              if (res.result.data.code !== -1) {
                that.setData({
                  buyUser: res.result.data.buyUser,
                  supplierInfo: res.result.data.supplierInfo,
                })
                if (!res.result.data.buyUser) {
                  that.setData({
                    jrdhUserInfo: res.result.data.userInfo,
                    supplierInfo: res.result.data.supplierInfo,
                  })
                  wx.setStorageSync('jrdhUserInfo', res.result.data.userInfo);
                }
                that._getInitData();
              } else {
                //采购员登陆失败
                that.setData({
                  isSellRegiste: true
                })

              }
              // that._getInitData();

            } else {
              if (res.result.msg == "meiyou") {
                this.setData({
                  billCancle: true
                })
              } else {
                //采购员登陆失败
                that.setData({
                  isSellRegiste: true
                })
              }

            }

          })
      }
    })
  },



  _shareUserRead() {

    var that = this;
    var batch = that.data.batch;
    batch.gbDpbSellUserId = that.data.jrdhUserInfo.nxJrdhUserId;
    batch.gbDpbBuyUserId = that.data.buyerUserId;
    batch.gbDpbSellUserOpenId = that.data.jrdhUserInfo.nxJrdhWxOpenId;
    batch.gbDpbSupplierId = that.data.supplierInfo.nxJrdhSupplierId;
    sellUserReadDisBatchGb(batch)
      .then(res => {
        if (res.result.code == 0) {
          this.setData({
            isTishi: false,
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
        title: '转发订货',
        path: '/pages/gbMarket/gbOrderBatch/gbOrderBatch?batchId=' + this.data.batchId +
          '&retName=' + this.data.retName + '&disId=' + this.data.disId + 'fromBuyer=0',
        envVersion: 'release', //release develop trial
        imageUrl: '',
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



  sellerCheckUnPay() {
    console.log("check")
    // var gbDisId = this.data.batch.gbDpbDistributerId;
    // var sellerId = this.data.batch.nxJrdhSellerEntity.nxJrdhUserId;
    console.log("kkanakuissiisis");
    wx.redirectTo({
      url: '../jinriListWithLogin/jinriListWithLogin',
    })
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

    load.showLoading("保存数据中");
    sellerUpdatePurGoods(this.data.item)
      .then(res => {
        load.hideLoading();
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
    load.showLoading();
    supplierEditBatchGb(this.data.batch.gbDistributerPurchaseBatchId)
      .then(res => {
        load.hideLoading();
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


  getNickName(e) {
    this.setData({
      nickName: e.detail.value,
    })
    if (e.detail.value.length > 0) {
      this.setData({
        canSave: true,
      })
    } else {
      this.setData({
        canSave: false
      })
    }
  },


  tishi() {
    if (!this.data.canSave) {
      wx.showToast({
        title: '请输入用户名',
        icon: 'none'
      })
    } else {
      wx.getUserProfile({
        desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: resUser => {
          wx.login({
            success: (res) => {
              this.setData({
                code: res.code
              })
            }
          })
        }
      })
    }

  },

  // 实时获取输入内容（可选）
  onNicknameInput(e) {
    const value = e.detail.value;
    this.setData({
      nickName: value
    });
    console.log('实时昵称:', value);
    this._checkRegister();
  },


  onChooseAvatar(e) {
    const {
      avatarUrl
    } = e.detail
    this.setData({
      avatarUrl,
    })
    this._checkRegister();
  },

  _checkRegister() {
    if (this.data.avatarUrl !== '/images/user.png' && this.data.nickName.length > 0) {
      this.setData({
        canRegister: true,
      })
    } else {
      this.setData({
        canRegister: false,
      })
    }
  },

  save(e) {
     if(!this.data.canRegister){
       if(this.data.avatarUrl == '/images/user.png'){
        wx.showToast({
          title: '请选择头像',
          icon: 'none'
        })
       }else if(this.data.nickname !== ""){
        wx.showToast({
          title: '请选择微信昵称',
          icon: 'none'
        })
       }
    
     }else{
      wx.getUserProfile({
        desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: resUser => {
          wx.login({
            success: (res) => {
              this.setData({
                code: res.code
              })
              var that = this;
              var src = [];
              src.push(this.data.avatarUrl)
              var filePathList = src;
              var userName = this.data.nickName;
              var gbDisId = this.data.disId;
              var code = this.data.code;
              var admin = 3;
              var buyerUserId = this.data.buyerUserId;
              load.showLoading("保存修改内容")
              console.log(filePathList, userName, code, admin, gbDisId, buyerUserId, this.data.depId, this.data.purUserId);
              console.log("------------")
              jrdhSellerRegisterWithFileGbJj(filePathList, userName, code, admin, gbDisId, buyerUserId, this.data.depId, this.data.purUserId).then((res) => {
                console.log(res);
                load.hideLoading();
                if (res.result == '{"code":0}') {
                  this.setData({
                    isSellRegiste: false,
                    canSave: false
                  })
  
                  that._userLogin();
  
                }
  
              })
  
  
            }
          })
        }
      })
     }
  

  },

  sellRegiste() {
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: resUser => {
        wx.login({
          success: (res) => {
            this.setData({
              code: res.code
            })
          }
        })
      }
    })
  },





  //1
  startSearch: function () {
    console.log("startSearchstartSearch")
    if (this.data.deviceId !== "-1") {
      var that = this
      wx.openBluetoothAdapter({
        success: function (res) {
          wx.getBluetoothAdapterState({
            success: function (res) {
              console.log('openBluetoothAdapter success', res)
              if (res.available) {
                if (res.discovering) {
                  wx.stopBluetoothDevicesDiscovery({
                    success: function (res) {
                      console.log(res)
                    }
                  })
                } else {
                  // that.startBluetoothDevicesDiscovery()
                  that.getBluetoothDevices()
                }
                // that.checkPemission()
              } else {
                wx.showModal({
                  title: '提示',
                  content: '本机蓝牙不可用',
                  showCancel: false
                })
              }
            },
          })
        },
        fail: function (e) {
          console.log(e)
          if (e.errCode === 10001) {
            wx.onBluetoothAdapterStateChange(function (res) {
              console.log('onBluetoothAdapterStateChange', res)
              if (res.available) {
                this.startBluetoothDevicesDiscovery()
              }
            })
          }

          wx.showModal({
            title: '提示',
            content: '蓝牙初始化失败，请到设置打开蓝牙',
            showCancel: false
          })
        }
      })
    } else {
      wx.navigateTo({
        url: '../../pSearchPrinter/pSearchPrinter',
      })
    }
  },


  getBluetoothDevices: function () { //获取蓝牙设备信息
    var that = this
    this.setData({
      isScanning: true
    })
    wx.startBluetoothDevicesDiscovery({
      success: function (res) {
        console.log(res)
        setTimeout(function () {
          wx.getBluetoothDevices({
            success: function (res) {
              var devices = []
              var num = 0
              for (var i = 0; i < res.devices.length; ++i) {
                if (res.devices[i].name != "未知设备") {
                  devices[num] = res.devices[i]
                  num++
                }
              }
              that.setData({
                list: devices,
                isScanning: false
              })
              // load.hideLoading()
              wx.stopBluetoothDevicesDiscovery({
                success: function (res) {
                  console.log("停止搜索蓝牙")
                }
              })
            },
          })
        }, 5000)
        that._connn();
      },
    })
  },



  _connn() {
    var that = this;
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
        console.log(res)
      },
    })
    this.setData({
      serviceId: 0,
      writeCharacter: false,
      readCharacter: false,
      notifyCharacter: false
    })
    wx.showLoading({
      title: '正在连接',
    })
    wx.createBLEConnection({
      deviceId: this.data.deviceId,
      success: function (res) {
        console.log(res)
        that.getSeviceId()
      },
      fail: function (e) {
        // wx.showModal({
        //   title: '提示',
        //   content: '连接失败',
        //   showCancel: false
        // })
        if (e.errno !== 1509007) {
          wx.navigateTo({
            url: '../../pSearchPrinter/pSearchPrinter',
          })
        }

        console.log(e)

      },
      complete: function (e) {
        console.log(e)
        if (e.errno == 1509007) {
          that.setData({
            printOk: true,
          })
          that.getSeviceId()
        }
      }
    })
  },


  getSeviceId: function () {
    var that = this

    wx.getBLEDeviceServices({
      deviceId: this.data.deviceId,
      success: function (res) {
        that.setData({
          services: res.services
        })
        that.getCharacteristics()
      },
      fail: function (e) {
        console.log(e)
        wx.navigateTo({
          url: '../../pSearchPrinter/pSearchPrinter',
        })
      },
      complete: function (e) {
        // console.log(e)
      }
    })
  },

  getCharacteristics: function () {
    var that = this
    var list = this.data.services
    var num = this.data.serviceId
    var write = this.data.writeCharacter
    var read = this.data.readCharacter
    var notify = this.data.notifyCharacter
    wx.getBLEDeviceCharacteristics({
      deviceId: this.data.deviceId,
      serviceId: list[num].uuid,
      success: function (res) {
        console.log(res)
        for (var i = 0; i < res.characteristics.length; ++i) {
          var properties = res.characteristics[i].properties
          var item = res.characteristics[i].uuid
          if (!notify) {
            if (properties.notify) {
              that.data.notifyCharaterId = item
              that.data.notifyServiceId = list[num].uuid
              notify = true
            }
          }
          if (!write) {
            if (properties.write) {
              that.data.writeCharaterId = item
              that.data.writeServiceId = list[num].uuid
              write = true
            }
          }
          if (!read) {
            if (properties.read) {
              that.data.readCharaterId = item
              that.data.readServiceId = list[num].uuid
              read = true
            }
          }
        }
        if (!write || !notify || !read) {
          num++
          that.setData({
            writeCharacter: write,
            readCharacter: read,
            notifyCharacter: notify,
            serviceId: num
          })
          if (num == list.length) {
            wx.showModal({
              title: '提示',
              content: '找不到该读写的特征值',
              showCancel: false
            })
          } else {
            that.getCharacteristics()
          }
        } else {
          wx.showToast({
            title: '连接成功',
          })
          that.setData({
            printOk: true
          })
          if (that.data.batchStatus == 0) {
            that.receiptTest();
          } else {
            that.receiptTestBill();
          }

        }
      },
      fail: function (e) {
        console.log(e)
      },
      complete: function (e) {
        console.log("write:" + that.data.writeCharaterId)
        console.log("read:" + that.data.readCharaterId)
        console.log("notify:" + that.data.notifyCharaterId)
      }
    })
  },



  // 票据测试方法
  receiptTestBill: function () {
    console.log("receiptTestBill");
    wx.showToast({
      title: '准备数据',
    });
    var that = this;

    // 调用获取打印数组的方法，传入回调函数
    that._getPrintArr(function () {
      // 在数据获取成功后执行打印逻辑
      var command = esc.jpPrinter.createNew();
      command.init();
      console.log("开始打印");
      command.setPrintAndFeedRow(5);
      command.setSelectJustification(1); // 居中
      command.setCharacterSize(17); // 设置倍高倍宽
      command.setText(that.data.disInfo.gbDistributerName);
      command.setPrint(); // 打印并换行
      command.setPrint(); // 打印并换行
      command.setSelectJustification(0); // 设置居左
      command.setCharacterSize(0);
      command.setText("日期: " + that.data.todayDate);
      command.setPrint(); // 打印并换行
      command.setPrint();
      command.setSelectJustification(0); // 设置居左
      command.setText("   商品");
      command.setAbsolutePrintPosition(228);
      command.setText("数量");
      command.setAbsolutePrintPosition(324);
      command.setText("单价");
      command.setAbsolutePrintPosition(420);
      command.setText("小计");
      command.setPrint();
      command.setText("================================================");
      command.setPrint();
      console.log("打印订单项");

      // 打印订单项
      that._printOrderTime(command);

      command.setSelectJustification(0); // 设置居左
      command.setText("“" + that.data.batch.nxJrdhWxNickName + "”为您提供最优的产品！");
      command.setPrint();
      command.setPrint();
      command.setPrintAndFeedRow(5);

      // 准备发送数据
      that.prepareSend(command.getData());
    });
  },

  // 票据测试方法
  receiptTestBill: function () {
    console.log("receiptTestBill");
    wx.showToast({
      title: '准备数据',
    });
    var that = this;

    // 调用获取打印数组的方法，传入回调函数
    that._getPrintArr(function () {
      // 在数据获取成功后执行打印逻辑
      var command = esc.jpPrinter.createNew();
      command.init();
      console.log("开始打印");
      command.setPrintAndFeedRow(5);
      command.setSelectJustification(1); // 居中
      command.setCharacterSize(17); // 设置倍高倍宽
      command.setText(that.data.disInfo.gbDistributerName);
      command.setPrint(); // 打印并换行
      command.setPrint(); // 打印并换行
      command.setSelectJustification(0); // 设置居左
      command.setCharacterSize(0);
      command.setText("日期: " + that.data.todayDate);
      command.setPrint(); // 打印并换行
      command.setPrint();
      command.setSelectJustification(0); // 设置居左
      command.setText("   商品");
      command.setAbsolutePrintPosition(228);
      command.setText("数量");
      command.setAbsolutePrintPosition(324);
      command.setText("单价");
      command.setAbsolutePrintPosition(420);
      command.setText("小计");
      command.setPrint();
      command.setText("================================================");
      command.setPrint();
      console.log("打印订单项");

      // 打印订单项
      that._printOrderTime(command);

      command.setSelectJustification(0); // 设置居左
      command.setText("“" + that.data.batch.nxJrdhSellerEntity.nxJrdhWxNickName + "”为您提供最优的产品！");
      command.setPrint();
      command.setPrint();
      command.setPrintAndFeedRow(5);

      // 准备发送数据
      that.prepareSend(command.getData());
    });
  },

  // 获取打印数组的方法，接受回调函数
  _getPrintArr: function (callback) {
    var that = this;
    supplierGetPrintBatchGb(this.data.batch.gbDistributerPurchaseBatchId)
      .then(res => {
        if (res.result.code == 0) {
          that.setData({
            printArr: res.result.data,
          });
          // 数据设置成功后，执行回调函数
          if (typeof callback === 'function') {
            callback();
          }
        }
      });
  },



  // // 获取打印数组的方法，接受回调函数
  // _getPrintArr: function(callback) {
  //   var that = this;
  //   supplierGetPrintBatchGb(this.data.batch.gbDistributerPurchaseBatchId)
  //     .then(res => {
  //       if (res.result.code == 0) {
  //         that.setData({
  //           printArr: res.result.data,
  //         });
  //         // 数据设置成功后，执行回调函数
  //         if (typeof callback === 'function') {
  //           callback();
  //         }
  //       }
  //     });
  // },


  //   receiptTestBill: function () { //票据测试
  //      console.log("receiptTestBillreceiptTestBill")
  //     wx.showToast({
  //       title: '准备数据',
  //     })
  //     var that = this;

  //     var command = esc.jpPrinter.createNew();
  //     command.init()
  //     console.log("printitititiititiiti")
  //     command.setPrintAndFeedRow(5);
  //     command.setSelectJustification(1) //居中
  //     command.setCharacterSize(17); //设置倍高倍宽
  //     command.setText(that.data.disInfo.gbDistributerName);
  //     command.setPrint(); //打印并换行
  //     command.setPrint(); //打印并换行
  //     command.setSelectJustification(0) //设置居左 
  //     command.setCharacterSize(0);
  //     command.setText("日期: " + that.data.todayDate);
  //     command.setPrint(); //打印并换行
  //     command.setPrint();
  //     command.setSelectJustification(0) //设置居左
  //     command.setText("   商品")
  //     command.setAbsolutePrintPosition(228)
  //     command.setText("数量")
  //     command.setAbsolutePrintPosition(324)
  //     command.setText("单价")
  //     command.setAbsolutePrintPosition(420)
  //     command.setText("小计")
  //     command.setPrint();
  //     command.setText("================================================")
  //     command.setPrint();
  //     console.log("==================ok next");
  //     // if(this.data.depHasSubs > 0){
  //     //   that._printSubDepOrderTime(command);
  //     // }else{
  //     //   that._printOrderTime(command);
  //     // }

  //     that._printOrderTime(command);

  //     command.setSelectJustification(0) //设置居左  
  //     command.setText("“" + that.data.batch.nxJrdhWxNickName + "”" + "为您提供最优的产品！");
  //     command.setPrint();
  //     command.setPrint();
  //     command.setPrintAndFeedRow(5);

  //     that.prepareSend(command.getData()) //准备发送数据
  //   },



  _printOrderTime(command) {


    var ordersArr = this.data.printArr;
    console.log("_printOrderTime", ordersArr.length);
    console.log("_printOrderTime", ordersArr);

    for (var j = 0; j < ordersArr.length; j++) {
      var standardName = ordersArr[j].gbDistributerGoodsEntity.gbDgGoodsStandardname;
      var goodsName = ordersArr[j].gbDistributerGoodsEntity.gbDgGoodsName;
      var weight = ordersArr[j].gbDoWeight;
      var price = ordersArr[j].gbDoPrice;
      var subtotal = ordersArr[j].gbDoSubtotal;
      command.setText(j + 1 + ", ")

      command.setText(goodsName);
      console.log("orderArr.goodsName", goodsName);
      command.setAbsolutePrintPosition(228)
      command.setText(weight + standardName);
      command.setAbsolutePrintPosition(324)
      command.setText(price);
      command.setAbsolutePrintPosition(420)
      command.setText(subtotal);
      command.setPrint();
      console.log("orderArr.goodsName", subtotal);

      var orderRemark = ordersArr[j].gbDoRemark;
      if (orderRemark !== "null" && orderRemark.length > 0) {
        command.setText("   备注:" + orderRemark + "");
        command.setPrint();
      }
      command.setText("-----------------------------------------------")
      command.setPrint();

      //
    }


    command.setSelectJustification(2);
    command.setCharacterSize(1);
    command.setText("总计:" + this.data.batch.gbDpbSubtotal + "元");
    console.log("orderArr.goodsName", this.data.batch.gbDpbSubtotal);

    command.setPrint();
    command.setText("================================================")
    command.setPrint();
  },




  receiptTest: function () { //票据测试
    console.log("receiptTestreceiptTestjianhuodan----")
    wx.showToast({
      title: '准备数据',
    })
    var that = this;

    var command = esc.jpPrinter.createNew();
    command.init()

    command.setPrintAndFeedRow(5);
    command.setSelectJustification(1) //居中
    command.setCharacterSize(17); //设置倍高倍宽
    command.setText("拣货单");
    command.setPrint(); //打印并换行
    command.setSelectJustification(0) //设置居左 
    command.setCharacterSize(0);
    command.setText("日期: " + that.data.todayDate);
    command.setPrint(); //打印并换行

    var depName = that.data.retName;
    command.setText("客户: " + depName);
    command.setPrint();
    command.setSelectJustification(0) //设置居左
    command.setText("   商品")
    command.setAbsolutePrintPosition(196)
    command.setText("订货")
    command.setAbsolutePrintPosition(276)
    command.setText("数量")
    command.setPrint();
    command.setText("------------------------------------------------")
    command.setPrint();
    var purGoodsArr = that.data.batch.gbDPGEntities;

    for (var j = 0; j < purGoodsArr.length; j++) {
      // var brand = purGoodsArr[j].gbDgGoodsBrand;
      var standardName = purGoodsArr[j].gbDistributerGoodsEntity.gbDgGoodsStandardname;
      var goodsName = purGoodsArr[j].gbDistributerGoodsEntity.gbDgGoodsName;
      command.setCharacterSize(1);
      // if (brand !== null && brand.length > 0) {
      //   command.setText(brand + "-");
      // }
      command.setText(j + 1 + ". ");
      command.setText(goodsName);
      if (standardName !== '斤') {
        command.setText("(" + standardName + ")");
      }
      command.setPrint();

      var orderArr = purGoodsArr[j].gbDepartmentOrdersEntities;
      if (orderArr.length > 0) {
        for (var m = 0; m < orderArr.length; m++) {
          var depName = "";
          //nxOrder
          var gbDepartment = purGoodsArr[j].gbDepartmentOrdersEntities[m].gbDepartmentEntity;
          if (gbDepartment !== null) {
            depName = purGoodsArr[j].gbDepartmentOrdersEntities[m].gbDepartmentEntity.gbDepartmentName;
          }
          console.log("depnamee", depName);
          var orderQuantity = purGoodsArr[j].gbDepartmentOrdersEntities[m].gbDoQuantity;
          var orderStandard = purGoodsArr[j].gbDepartmentOrdersEntities[m].gbDoStandard;
          console.log("orderQuantity", orderQuantity + orderStandard);
          command.setText(" " + depName + "  " + orderQuantity + orderStandard);
          command.setPrint();

        }
      }

      command.setText("------------------------------------------------")
      command.setPrint();

    }

    command.setPrint();
    command.setPrint();
    command.setPrint();
    command.setPrint();
    command.setPrint();
    command.setPrint();

    that.prepareSend(command.getData()) //准备发送数据

  },


  prepareSend: function (buff) { //准备发送，根据每次发送字节数来处理分包数量

    var that = this
    var time = that.data.oneTimeData;

    var looptime = parseInt(buff.length / time);
    var lastData = parseInt(buff.length % time);
    that.setData({
      looptime: looptime + 1,
      lastData: lastData,
      currentTime: 1,
    })
    that.Send(buff)
  },

  queryStatus: function () { //查询打印机状态
    var that = this
    var buf;
    var dateView;
    /*
    n = 1：传送打印机状态
    n = 2：传送脱机状态
    n = 3：传送错误状态
    n = 4：传送纸传感器状态
    */
    buf = new ArrayBuffer(3)
    dateView = new DataView(buf)
    dateView.setUint8(0, 16)
    dateView.setUint8(1, 4)
    dateView.setUint8(2, 2)
    wx.writeBLECharacteristicValue({
      deviceId: this.data.deviceId,
      serviceId: this.data.writeServiceId,
      characteristicId: this.data.writeCharaterId,
      value: buf,
      success: function (res) {
        console.log("发送成功")
        that.setData({
          isQuery: true
        })
      },
      fail: function (e) {
        wx.showToast({
          title: '发送失败',
          icon: 'none',
        })
        console.log(e)
        return;
      },
      complete: function () {

      }
    })

    wx.notifyBLECharacteristicValueChange({
      deviceId: this.data.deviceId,
      serviceId: this.data.notifyServiceId,
      characteristicId: this.data.notifyCharaterId,
      state: true,
      success: function (res) {
        wx.onBLECharacteristicValueChange(function (r) {
          console.log(`characteristic ${r.characteristicId} has changed, now is ${r}`)
          var result = ab2hex(r.value)
          console.log("返回" + result)
          var tip = ''
          if (result == 12) { //正常
            tip = "正常"
          } else if (result == 32) { //缺纸
            tip = "缺纸"
          } else if (result == 36) { //开盖、缺纸
            tip = "开盖、缺纸"
          } else if (result == 16) {
            tip = "开盖"
          } else if (result == 40) { //其他错误
            tip = "其他错误"
          } else { //未处理错误
            tip = "未知错误"
          }
          wx.showModal({
            title: '打印机状态',
            content: tip,
            showCancel: false
          })
        })
      },
      fail: function (e) {
        wx.showModal({
          title: '打印机状态',
          content: '获取失败',
          showCancel: false
        })
        console.log(e)
      },
      complete: function (e) {
        that.setData({
          isQuery: false
        })
        console.log("执行完成")
      }
    })
  },


  Send: function (buff) { //分包发送
    var that = this
    var currentTime = that.data.currentTime
    var loopTime = that.data.looptime
    var lastData = that.data.lastData
    var onTimeData = that.data.oneTimeData
    var printNum = that.data.printerNum
    var currentPrint = that.data.currentPrint
    var buf
    var dataView
    if (currentTime < loopTime) {
      buf = new ArrayBuffer(onTimeData)
      dataView = new DataView(buf)
      for (var i = 0; i < onTimeData; ++i) {
        dataView.setUint8(i, buff[(currentTime - 1) * onTimeData + i])
      }
    } else {
      buf = new ArrayBuffer(lastData)
      dataView = new DataView(buf)
      for (var i = 0; i < lastData; ++i) {
        dataView.setUint8(i, buff[(currentTime - 1) * onTimeData + i])
      }
    }
    console.log("第" + currentTime + "次发送数据大小为：" + buf.byteLength)
    if (buf.byteLength > 0) {
      wx.writeBLECharacteristicValue({
        deviceId: this.data.deviceId,
        serviceId: this.data.writeServiceId,
        characteristicId: this.data.writeCharaterId,
        value: buf,
        success: function (res) {
          var times = that.data.printTimes;
          that.setData({
            showOperation: false,
            printTimes: times + 1,
          })

          if (currentTime == loopTime) {
            //最后一次，保存订单
            // that._closeBLE();
            that.setData({
              printTimes: 0
            })

          }
        },
        fail: function (e) {
          wx.showToast({
            title: '打印第' + currentPrint + '张失败',
            icon: 'none',
          })
        },
        complete: function () {
          currentTime++
          if (currentTime <= loopTime) {
            that.setData({
              currentTime: currentTime
            })
            that.Send(buff)
          } else {
            if (currentPrint == printNum) {
              that.setData({
                looptime: 0,
                lastData: 0,
                currentTime: 1,
                isReceiptSend: false,
                currentPrint: 1
              })

            } else {
              currentPrint++
              that.setData({
                currentPrint: currentPrint,
                currentTime: 1,
              })
              that.Send(buff)
            }
          }
        }
      })
    } else {
      // that._closeBLE();
      that.setData({
        printTimes: 0
      })
    }

  },



  toIndex() {
    wx.redirectTo({
      url: '../../../../pages/index/index',
    })
  },


  openJjsh() {
  wx.navigateToMiniProgram({
    appId: 'wx87baf9dcf935518a',
    path: 'subPackage/pages/trans/fromOrderPageGb/fromOrderPageGb?batchId=' + this.data.batchId,
    envVersion: 'trial', //release  develop  trial
  })
},


toCancleBack(){
  wx.redirectTo({
    url: '../../../../pages/index/index',
  })
},




})