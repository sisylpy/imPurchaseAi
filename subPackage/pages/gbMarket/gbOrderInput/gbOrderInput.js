var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;
import apiUrl from '../../../../config.js'

import {
  getDisPurchaseGoodsBatchGb,
  sellerFinishPurchaseGoodsBatchGb,
  sellerUpdatePurGoods,
} from '../../../../lib/apiDepOrder'

import dateUtil from '../../../../utils/dateUtil';

Page({




  onShow: function () {

    // 推荐直接用新API
    let windowInfo = wx.getWindowInfo();
    let globalData = getApp().globalData;
    this.setData({
      windowWidth: windowInfo.windowWidth * globalData.rpxR,
      windowHeight: windowInfo.windowHeight * globalData.rpxR,
      statusBarHeight: globalData.statusBarHeight * globalData.rpxR,
      numWidth: (windowInfo.windowWidth / 4) * globalData.rpxR - 40,
      numContainerWidth: (windowInfo.windowWidth / 4) * globalData.rpxR - 20,
      btnWidth: (windowInfo.windowWidth / 8) * globalData.rpxR - 20,
      btnWidthContainer: (windowInfo.windowWidth / 8) * globalData.rpxR,
      bigBtnWidth: (windowInfo.windowWidth / 6) * globalData.rpxR - 20,
      bigBtnWidthContainer: (windowInfo.windowWidth / 6) * globalData.rpxR,
    });


  },

  /**
   * 页面的初始数据
   */
  data: {
    isTishi: false,
    lastInput: true,
    focusGoodsIndex: -1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,
      statusBarHeight: globalData.statusBarHeight * globalData.rpxR,
      batchId: options.batchId,
      retName: options.retName,
      numWidth: (globalData.windowWidth / 4) * globalData.rpxR - 40,
      numContainerWidth: (globalData.windowWidth / 4) * globalData.rpxR - 20,
      btnWidth: (globalData.windowWidth / 8) * globalData.rpxR - 20,
      btnWidthContainer: (globalData.windowWidth / 8) * globalData.rpxR,
      bigBtnWidth: (globalData.windowWidth / 6) * globalData.rpxR - 20,
      bigBtnWidthContainer: (globalData.windowWidth / 6) * globalData.rpxR,
      url: apiUrl.server,
      todayDate: dateUtil.getWhichOnlyDate(0),
    })
    this._getInitData();
  },


  _getInitData() {
    var that = this;
    load.showLoading("获取订货商品")
    getDisPurchaseGoodsBatchGb(this.data.batchId)
      .then(res => {
        load.hideLoading();
        if (res.result.code == 0) {
          console.log(res.result.data)
          this.setData({
            batchStatus: res.result.data.gbDpbStatus,
          })
          var arr = res.result.data.gbDPGEntities;
          var total = "";
          for (var i = 0; i < arr.length; i++) {
            for (var j = 0; j < arr[i].gbDepartmentOrdersEntities.length; j++) {
              var sub = arr[i].gbDepartmentOrdersEntities[j].gbDoSubtotal;
              total = (Number(sub) + Number(total)).toFixed(1);
            }
          }
          var newBatch = res.result.data;
          newBatch.gbDpbSubtotal = total;
          that.setData({
            payTotal: total,
            batch: newBatch,
            goodsCount: res.result.data.gbDPGEntities.length
          })
        } else {
          wx.showToast({
            title: '没有订货',
            icon: 'none'
          })
          this.setData({
            batchStatus: -1
          })
        }
      })
  },



  // input

  try (data) {
    var value = wx.getStorageSync("num");
    var obj = "";
    for (var i = 0; i < value.length; i++) {
      var id = value[i].id;
      if (data == id) {
        obj = value[i];
      }
    }
    if (obj) {
      innerAudioContext.autoplay = true;
      innerAudioContext.src = obj.filePath;
      innerAudioContext.play();
    }
  },

  //input methos ======

  //1,输入
  inputValue(e) {
    console.log(e);
    var purStandard = this.data.batch.gbDPGEntities[this.data.focusGoodsIndex].gbDpgStandard;
    var goodsStandard = this.data.batch.gbDPGEntities[this.data.focusGoodsIndex].gbDistributerGoodsEntity.gbDgGoodsStandardname;
    var buyScale = this.data.batch.gbDPGEntities[this.data.focusGoodsIndex].gbDpgBuyScale;
    console.log(purStandard + " standnnddkdkdk" + goodsStandard + "biuysclele==" + buyScale)
    if (purStandard !== goodsStandard && buyScale !== '-1') {
      this._inputBuyScalePrice(e);
    } else {
      this._inputBuyPrice(e)
    }
  },

  _inputBuyPrice(e) {
    console.log("inpubuytpriice")
    var value = e.currentTarget.dataset.value;
    //输入单价
    // begin
    var oldValue = this.data.batch.gbDPGEntities[this.data.focusGoodsIndex].gbDpgBuyPrice;

    //1，输入数字
    if (value <= 9 && value >= 0) {
      var newValue = 0;
      if (oldValue !== null && oldValue !== "0.0") {
        newValue = oldValue + value;
      } else {
        newValue = value
      }

      this.setData({
        ["batch.gbDPGEntities[" + this.data.focusGoodsIndex + "].gbDpgBuyPrice"]: newValue,
        ["purGoods.gbDpgBuyPrice"]: newValue
      })
      this.try(value); // read 数字
      this._changeBuyPriceToDoPrice(newValue);
    } else {
      console.log("点击了非数字")
      //2，输入“dian”
      if (value == ".") {
        var newValue = 0;
        if (oldValue.indexOf(".") != -1) {
          this.try("tishi");
        } else {
          if (oldValue > 0) {
            newValue = oldValue + value;

            this.try("dian") // read 清除
            this._changeBuyPriceToDoPrice(newValue);

          } else {
            newValue = "0."
            this.try("lingdian") // read 清除
            this._changeBuyPriceToDoPrice();
          }
          this.setData({
            ["batch.gbDPGEntities[" + this.data.focusGoodsIndex + "].gbDpgBuyPrice"]: newValue,
            ["purGoods.gbDpgBuyPrice"]: newValue
          })
        }
      }
      //2，输入“删除”
      if (value == "del") {
        newValue = oldValue.substr(0, oldValue.length - 1);
        this.setData({
          ["batch.gbDPGEntities[" + this.data.focusGoodsIndex + "].gbDpgBuyPrice"]: newValue,
          ["purGoods.gbDpgBuyPrice"]: newValue
        })
        this.try("delete") // read 清除
        this._changeBuyPriceToDoPrice(newValue);
      }

      //31，输入“关闭”
      if (value == "close") {
        this.setData({
          focusGoodsIndex: -1,
          lastInput: true
        })
        this.try("close"); // read 关闭
        this._getInitData();

      }
      //32，输入“关闭”
      // if (value == "finish") {
      //   this.setData({
      //     focusGoodsIndex: -1,
      //     lastInput: true
      //   })
      //   this.try("close"); // read 关闭
      //   // this._savePurGoods();
      //   this._getInitData();
      // }
      //4,输入“下一个”
      if (value == "next") {
        this._savePurGoods();

        var goodsIndex = this.data.focusGoodsIndex;
        if (goodsIndex !== this.data.batch.gbDPGEntities.length - 1) {
          this.setData({
            focusGoodsIndex: goodsIndex + 1,
            purGoods: this.data.batch.gbDPGEntities[goodsIndex + 1]
          })
        } else {
          var purGoods = this.data.batch.gbDPGEntities[this.data.batch.gbDPGEntities.length - 1];
          this.setData({
            focusGoodsIndex: -1,
            lastInput: true,
            purGoods: purGoods
          })
        }
        this.try("next"); // read 下一个
      }
    }
  },

  _inputBuyScalePrice(e) {
    var value = e.currentTarget.dataset.value;
    //输入单价
    // begin
    var oldValue = this.data.batch.gbDPGEntities[this.data.focusGoodsIndex].gbDpgBuyScalePrice;

    //1，输入数字
    if (value <= 9 && value >= 0) {
      var newValue = 0;
      if (oldValue !== null && oldValue !== "0.0") {
        newValue = oldValue + value;
      } else {
        newValue = value
      }
      var scale = this.data.batch.gbDPGEntities[this.data.focusGoodsIndex].gbDpgBuyScale;
      var buyPrice = (Number(newValue) / Number(scale)).toFixed(2);
      this.setData({
        ["batch.gbDPGEntities[" + this.data.focusGoodsIndex + "].gbDpgBuyScalePrice"]: newValue,
        ["purGoods.gbDpgBuyScalePrice"]: newValue,
        ["batch.gbDPGEntities[" + this.data.focusGoodsIndex + "].gbDpgBuyPrice"]: buyPrice,
        ["purGoods.gbDpgBuyPrice"]: buyPrice,
      })
      this.try(value); // read 数字
      this._putBuyPriceAndDoPriceScale(newValue);
    } else {
      //2，输入“dian”
      if (value == ".") {
        var newValue = 0;
        if (oldValue.indexOf(".") != -1) {
          this.try("tishi");
        } else {
          if (oldValue > 0) {
            newValue = oldValue + value;
            this.try("dian") // read 清除
            this._putBuyPriceAndDoPriceScale(newValue);
          } else {
            newValue = "0."
            this.try("lingdian") // read 清除
            this._putBuyPriceAndDoPriceScale();
          }
          var scale = this.data.batch.gbDPGEntities[this.data.focusGoodsIndex].gbDpgBuyScale;
          var buyPrice = (Number(newValue) / Number(scale)).toFixed(2);
          this.setData({
            ["batch.gbDPGEntities[" + this.data.focusGoodsIndex + "].gbDpgBuyScalePrice"]: newValue,
            ["purGoods.gbDpgBuyScalePrice"]: newValue,
            ["batch.gbDPGEntities[" + this.data.focusGoodsIndex + "].gbDpgBuyPrice"]: buyPrice,
            ["purGoods.gbDpgBuyPrice"]: buyPrice,
          })
        }
      }
      //2，输入“删除”
      if (value == "del") {
        newValue = oldValue.substr(0, oldValue.length - 1);
        var scale = this.data.batch.gbDPGEntities[this.data.focusGoodsIndex].gbDpgBuyScale;
        var buyPrice = (Number(newValue) / Number(scale)).toFixed(2);
        this.setData({
          ["batch.gbDPGEntities[" + this.data.focusGoodsIndex + "].gbDpgBuyScalePrice"]: newValue,
          ["purGoods.gbDpgBuyScalePrice"]: newValue,
          ["batch.gbDPGEntities[" + this.data.focusGoodsIndex + "].gbDpgBuyPrice"]: buyPrice,
          ["purGoods.gbDpgBuyPrice"]: buyPrice,

        })
        this.try("delete") // read 清除
        this._putBuyPriceAndDoPriceScale(newValue);

      }

      //31，输入“关闭”
      if (value == "close") {
        this.setData({
          focusGoodsIndex: -1,
          lastInput: true
        })
        this.try("close"); // read 关闭
        this._getInitData();

      }

      //4,输入“下一个”
      if (value == "next") {
        this._savePurGoods();

        var goodsIndex = this.data.focusGoodsIndex;
        if (goodsIndex !== this.data.batch.gbDPGEntities.length - 1) {
          this.setData({
            focusGoodsIndex: goodsIndex + 1,
            purGoods: this.data.batch.gbDPGEntities[goodsIndex + 1]
          })
        } else {
          var purGoods = this.data.batch.gbDPGEntities[this.data.batch.gbDPGEntities.length - 1];
          this.setData({
            focusGoodsIndex: -1,
            lastInput: true,
            purGoods: purGoods
          })
        }
        this.try("next"); // read 下一个
      }
    }
  },

  //把比例采购价格赋值给订单的比例价格和普通价格
  _putBuyPriceAndDoPriceScale(data) {
    var orderArr = this.data.batch.gbDPGEntities[this.data.focusGoodsIndex].gbDepartmentOrdersEntities;

    for (var i = 0; i < orderArr.length; i++) {
      var scaleWeight = orderArr[i].gbDoScaleWeight;
      if (scaleWeight !== "0.0" && scaleWeight > 0) {
        var scalePrice = this.data.batch.gbDPGEntities[this.data.focusGoodsIndex].gbDpgBuyScalePrice;
        var scale = this.data.batch.gbDPGEntities[this.data.focusGoodsIndex].gbDepartmentOrdersEntities[i].gbDoDsStandardScale;
        var doSubtotal = (Number(scalePrice) * Number(scaleWeight)).toFixed(1)
        var doPrice = (Number(scalePrice) / Number(scale)).toFixed(1)
        console.log("_putBuyPriceAndDoPriceScale_putBuyPriceAndDoPriceScale");
        console.log(doSubtotal)
        this.setData({
          ["batch.gbDPGEntities[" + this.data.focusGoodsIndex + "].gbDepartmentOrdersEntities[" + i + "].gbDoScalePrice"]: data,
          ["batch.gbDPGEntities[" + this.data.focusGoodsIndex + "].gbDepartmentOrdersEntities[" + i + "].gbDoPrice"]: doPrice,

          ["batch.gbDPGEntities[" + this.data.focusGoodsIndex + "].gbDepartmentOrdersEntities[" + i + "].gbDoSubtotal"]: doSubtotal,
          ["purGoods.gbDepartmentOrdersEntities[" + i + "].gbDoScalePrice"]: data,
          ["purGoods.gbDepartmentOrdersEntities[" + i + "].gbDoPrice"]: doPrice,
          ["purGoods.gbDepartmentOrdersEntities[" + i + "].gbDoSubtotal"]: doSubtotal,


        })
      }
      this._getScaleSubTotal();
    }
  },

  _changeBuyPriceToDoPrice(data) {

    var orderArr = this.data.batch.gbDPGEntities[this.data.focusGoodsIndex].gbDepartmentOrdersEntities;
    for (var i = 0; i < orderArr.length; i++) {

      var weight = orderArr[i].gbDoWeight;
      console.log(weight);
      if (weight !== null && weight > 0) {
        var subtotal = Number(weight) * Number(data);
        this.setData({
          ["batch.gbDPGEntities[" + this.data.focusGoodsIndex + "].gbDepartmentOrdersEntities[" + i + "].gbDoSubtotal"]: subtotal.toFixed(1),
          ["purGoods.gbDepartmentOrdersEntities[" + i + "].gbDoSubtotal"]: subtotal.toFixed(1),
        })
      }
      this.setData({
        ["batch.gbDPGEntities[" + this.data.focusGoodsIndex + "].gbDepartmentOrdersEntities[" + i + "].gbDoPrice"]: data,
        ["purGoods.gbDepartmentOrdersEntities[" + i + "].gbDoPrice"]: data,
      })
      this._getSubTotal();
    }
  },

  _getSubTotal() {
    var item =
      this.data.batch.gbDPGEntities[this.data.focusGoodsIndex];
    var price = item.gbDpgBuyPrice;
    var quantity = item.gbDpgBuyQuantity;
    var subtotal = Number(price) * Number(quantity);
    var itemSubtotalData =
      "batch.gbDPGEntities[" + this.data.focusGoodsIndex + "].gbDpgBuySubtotal";
    this.setData({
      [itemSubtotalData]: subtotal.toFixed(1),
      ["purGoods.gbDpgBuySubtotal"]: subtotal.toFixed(1)
    })

    var goodArr = this.data.batch.gbDPGEntities;
    var subTemp = "";
    for (var i = 0; i < goodArr.length; i++) {
      var subTot = this.data.batch.gbDPGEntities[i].gbDpgBuySubtotal;
      if (subTot !== "null") {
        subTemp = Number(subTemp) + Number(subTot);
      }
    }

    var subData = "batch.gbDpbSubtotal";
    this.setData({
      [subData]: subTemp.toFixed(1),
      payTotal: subTemp.toFixed(1)
    })
  },

  _getScaleSubTotal() {
    var item =
      this.data.batch.gbDPGEntities[this.data.focusGoodsIndex];
    var price = item.gbDpgBuyScalePrice;
    var quantity = item.gbDpgBuyScaleQuantity;
    var subtotal = Number(price) * Number(quantity);
    var itemSubtotalData =
      "batch.gbDPGEntities[" + this.data.focusGoodsIndex + "].gbDpgBuySubtotal";

    this.setData({
      [itemSubtotalData]: subtotal.toFixed(1),
      ["purGoods.gbDpgBuySubtotal"]: subtotal.toFixed(1)
    })

    var goodArr = this.data.batch.gbDPGEntities;
    var subTemp = "";
    for (var i = 0; i < goodArr.length; i++) {
      var subTot = this.data.batch.gbDPGEntities[i].gbDpgBuySubtotal;
      if (subTot !== "null") {
        subTemp = Number(subTemp) + Number(subTot);
      }
    }

    var subData = "batch.gbDpbSubtotal";
    this.setData({
      [subData]: subTemp.toFixed(1),
      payTotal: subTemp.toFixed(1)
    })
  },

  changeFocusIndex(e) {
    if(this.data.focusGoodsIndex !== -1){
      this._savePurGoods();
    }
  

    var index = e.currentTarget.dataset.index;
    this.setData({
      focusGoodsIndex: index,
      lastInput: false,
      purGoods: this.data.batch.gbDPGEntities[index],
    })
  },



  toBack() {
    wx.setStorageSync('batch', this.data.batch)
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //上一个页面
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      batch: this.data.batch
    })
    wx.navigateBack({
      delta: 1,
    })
  },


  // onShareAppMessage(e) {
  //   console.log("showtishi00000")
  //   var batch = this.data.batch;
  //   var orderAmount = 0;
  //   var finishAmount = 0;
  //   for (var i = 0; i < batch.gbDPGEntities.length; i++) {
  //     var subtotal = batch.gbDPGEntities[i].gbDpgBuySubtotal;
  //     if (subtotal > 0 && subtotal !== null) {
  //       var ordersArr = batch.gbDPGEntities[i].gbDepartmentOrdersEntities;
  //       for (var j = 0; j < ordersArr.length; j++) {
  //         orderAmount = Number(orderAmount) + Number(1);
  //         var orderWeight = batch.gbDPGEntities[i].gbDepartmentOrdersEntities[j].gbDoWeight;
  //         var orderSubtotal = batch.gbDPGEntities[i].gbDepartmentOrdersEntities[j].gbDoSubtotal;
  //         console.log(orderSubtotal);

  //         if (orderWeight > 0 && orderWeight !== null && orderSubtotal > 0 && orderSubtotal !== null) {
  //           finishAmount = Number(finishAmount) + Number(1);
  //         }
  //       }
  //     }
  //   }

  //   if (orderAmount == finishAmount) {
  //     console.log(orderAmount + "=====???----" + finishAmount)
  //     var that = this;
  //     setTimeout(function () {
  //       that.setData({
  //         isTishi: true,
  //       })
  //     }, 3000)
  //     return new Promise((resolve, reject) => {
  //       sellerFinishPurchaseGoodsBatchGb(this.data.batch)
  //         .then(res => {
  //           if (res.result.code == 0) {
  //             resolve({
  //               title: "备货完成", // 默认是小程序的名称(可以写slogan等)
  //               path: '/pages/outMan/gbOrderBatch/gbOrderBatch?batchId=' + this.data.batch.gbDistributerPurchaseBatchId + '&retName=' + this.data.retName + '&receive=1&helpWeight=0',
  //               imageUrl: '',
  //             })
  //           } else {
  //             wx.showToast({
  //               title: res.result.msg,
  //               icon: 'none'
  //             })
  //           }
  //         })
  //     })

  //   } else {
  //     wx.showModal({
  //       title: "有未完成订单",
  //       content: "请采购员取消未完成订单",
  //       showCancel: false,
  //       confirmText: "知道了",
  //     })
  //   }
  // },


  showShareTishi() {
    console.log("showtishi")
    var batch = this.data.batch;
    var orderAmount = 0;
    var finishAmount = 0;
    var unFinishAmount = 0;
    for (var i = 0; i < batch.gbDPGEntities.length; i++) {
      var ordersArr = batch.gbDPGEntities[i].gbDepartmentOrdersEntities;
      for (var j = 0; j < ordersArr.length; j++) {
        orderAmount = Number(orderAmount) + Number(1);
        var orderWeight = batch.gbDPGEntities[i].gbDepartmentOrdersEntities[j].gbDoWeight;
        var orderSubtotal = batch.gbDPGEntities[i].gbDepartmentOrdersEntities[j].gbDoSubtotal;
        console.log(orderSubtotal);
        if (orderWeight > 0 && orderWeight !== null && orderSubtotal > 0 && orderSubtotal !== null) {
          finishAmount = Number(finishAmount) + Number(1);
        }
      }
    }

    unFinishAmount = Number(orderAmount) - Number(finishAmount);
    if (orderAmount == finishAmount) {
      var that = this;
      that.setData({
        isTishi: true,
      })
    } else {
      wx.showModal({
        title: "有" + unFinishAmount + "个未完成订单",
        content: "请输入数据或请采购员取消未完成订单",
        showCancel: false,
        confirmText: "知道了",
      })
    }
  },


  _savePurGoods() {
    load.showLoading("保存数据中");
    sellerUpdatePurGoods(this.data.purGoods)
      .then(res => {
        load.hideLoading();
        if (res.result.code == 0) {
          console.log(res.result.data)
          this._getInitData()

        }
      })
  },

  closeMask() {
    wx.navigateBack({
      delta: 1,
    })
  },


  radioChange(e){
    console.log(e);
    var typeData = "batch.gbDpbPayType";
    this.setData({
      [typeData]:  e.detail.value,
    })
    console.log(this.data.batch)
  },



  sendSucess() {
    if(this.data.batch.gbDpbPayType == null){
      wx.showToast({
        title: '请选择支付方式',
        icon: 'none'
      })
    }else{
      load.showLoading("保存订单");
      sellerFinishPurchaseGoodsBatchGb(this.data.batch)
        .then(res => {
          load.hideLoading();
          if (res.result.code == 0) {
          
            var pages = getCurrentPages();
            var prevPage1 = pages[pages.length - 2];
            prevPage1.setData({
              update: true,
            })
            
            wx.requestSubscribeMessage({
              tmplIds: ['CgludlqVZc_vmFaZUgVFC-iprkydrtOfF_GcODltpTc','_KhWtCVg3fIBH-tHqSV0hUk5m_vuKmxw1CGn0PEv6D0',
              'TE6HIkd7LRQ08zdnQXowRjZu8OBK0eGEd368p2NtTeA'
            ],
              success(res) {
                console.log("可以给用户推送一条中奖通知了。。。");
                wx.navigateBack({
                  delta: 1,
                })
              },
              fail(res) {
        
                console.log('fail  失败')
        
                console.log(res)
        
                logger.warn('订阅消息fail', res)
        
              },
              
            })
          
  
          } else {
            wx.showToast({
              title: res.result.msg,
              icon: 'none'
            })
          }
        })
    }
    
  },

  cancelCostBatch() {
    this.setData({
      isTishi: false
    })
  },





})