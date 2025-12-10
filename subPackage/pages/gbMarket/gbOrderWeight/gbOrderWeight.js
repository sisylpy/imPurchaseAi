var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;
import apiUrl from '../../../../config.js'

import {

  gbOrderOutWeight,
  supplierGetUnWeightOutPurGoods,


} from '../../../../lib/apiDepOrder'


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


   
  },

  data: {
    bottomHeight: 240,
    formHeight: 480,
    lastInput: true,
    focusIndex: -1,
    toPrice: false,
    retName: "",
    scaleInput: false,
    showConfirmModal: false, // 是否显示确认弹窗
    pasteContent: '' // 粘贴的内容
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
      batchId: options.batchId,
     
    })


    this._getInitData();

  },

  _getInitData() {
    load.showLoading("获取订货商品")
    supplierGetUnWeightOutPurGoods(this.data.batchId)
      .then(res => {
        load.hideLoading();
        if (res.result.code == 0) {
          this.setData({
            purArr: res.result.data,
          })
         
        }else{
          wx.showToast({
            title: res.result.msg,
            icon: 'none'
          })
        }
      })
  },

  onShareAppMessage(e) {
    var shareObj = {
      imageUrl: '',
    }
    shareObj.title = "请称重这些订单"
    shareObj.path = '/subPackage/pages/gbMarket/gbOrderWeight/gbOrderWeight?batchId=' + this.data.batchId + '&retName=' + this.data.retName ;
    return shareObj;
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
    var oldValue = this.data.purArr[this.data.focusIndex].gbDistributerGoodsEntity.gbDepartmentOrdersEntities[this.data.orderIndex].gbDoWeight;
    //1，输入数字
    if (value <= 9 && value >= 0) {
      oldValue = this.data.purArr[this.data.focusIndex].gbDistributerGoodsEntity.gbDepartmentOrdersEntities[this.data.orderIndex].gbDoWeight;
      var newValue = 0;
      if (oldValue !== null && oldValue !== "0.0") {
        newValue = oldValue + value;
      } else {
        newValue = value
      }
      this.setData({
        ["purArr[" + this.data.focusIndex + "].gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoWeight"]: newValue,
        ["item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoWeight"]: newValue,
        ["orders.gbDoWeight"]: newValue
      })
      this._getTotalQuantity();
    } else {
      //2，输入“dian”
      if (value == ".") {
        oldValue = this.data.purArr[this.data.focusIndex].gbDistributerGoodsEntity.gbDepartmentOrdersEntities[this.data.orderIndex].gbDoWeight;
        var newValue = 0;
        if (oldValue.indexOf(".") != -1) {} else {
          if (oldValue > 0) {
            newValue = oldValue + value;
            this._getTotalQuantity();
          } else {
            newValue = "0."
          }
          this.setData({
            ["purArr[" + this.data.focusIndex + "].gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoWeight"]: newValue,
            ["item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoWeight"]: newValue,
            ["orders.gbDoWeight"]: newValue
          })
          this._getTotalQuantity();
        }
      }
      //2，输入“删除”
      if (value == "del") {
        newValue = oldValue.substr(0, oldValue.length - 1);
        this.setData({
          ["purArr[" + this.data.focusIndex + "].gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoWeight"]: newValue,
          ["item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoWeight"]: newValue,
          ["orders.gbDoWeight"]: newValue
        })
        this._getTotalQuantity();
      }

      //31，输入“关闭”
      if (value == "close") {

        // this._getInitData()
        
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
        if (focusIndex !== this.data.purArr.length - 1) {
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
    var arr = this.data.purArr[this.data.focusIndex].gbDistributerGoodsEntity.gbDepartmentOrdersEntities;
    var temp = "";
    for (var i = 0; i < arr.length; i++) {
      var weightValue = this.data.purArr[this.data.focusIndex].gbDistributerGoodsEntity.gbDepartmentOrdersEntities[i].gbDoWeight;
      if (weightValue) {
        temp = Number(temp) + Number(weightValue);
      }
    }
    temp = Number(temp).toFixed(1);
    console.log("teimpp" + temp)
    this.setData({
      ["purArr[" + this.data.focusIndex + "].gbDpgBuyQuantity"]: temp,
      ["item.gbDpgBuyQuantity"]: temp
    })

    var price = this.data.purArr[this.data.focusIndex].gbDpgBuyPrice;
    if (price > 0) {
      console.log("subttototopricepriceprice" + price)
      var weight = this.data.purArr[this.data.focusIndex].gbDpgBuyQuantity;
      var subtotal = Number(price) * Number(weight);
      console.log("subttototo" + subtotal)

      this.setData({
        ["purArr[" + this.data.focusIndex + "].gbDpgBuySubtotal"]: subtotal.toFixed(1),
        ["item.gbDpgBuySubtotal"]: subtotal.toFixed(1)
      })
      var orderWeight = this.data.purArr[this.data.focusIndex].gbDistributerGoodsEntity.gbDepartmentOrdersEntities[this.data.orderIndex].gbDoWeight;
      var sub = Number(orderWeight) * Number(price)
      this.setData({
        ["purArr[" + this.data.focusIndex + "].gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoSubtotal"]: sub.toFixed(1),
        ["item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoSubtotal"]: sub.toFixed(1),
      })
    }
    this._getOrderSubTotal();
  },

  // 普通录入计算采购商品
  _getOrderSubTotal() {
    var priceValue = this.data.purArr[this.data.focusIndex].gbDpgBuyPrice;
    var weightValue = this.data.purArr[this.data.focusIndex].gbDpgBuyQuantity;
    if (priceValue !== null) {
      var subtotalValue = (Number(weightValue) * Number(priceValue)).toFixed(1);
      this.setData({
        ["purArr[" + this.data.focusIndex + "].gbDpgBuySubtotal"]: subtotalValue,
      })
    }
  },

  // /////////////scale ================================
  //有系数规格录入重量
  _multipleInput(e) {
    var value = e.currentTarget.dataset.value;
    //输入单价
    var oldValue = this.data.purArr[this.data.focusIndex].gbDistributerGoodsEntity.gbDepartmentOrdersEntities[this.data.orderIndex].gbDoScaleWeight;
    //1，输入数字
    if (value <= 9 && value >= 0) {
      oldValue = this.data.purArr[this.data.focusIndex].gbDistributerGoodsEntity.gbDepartmentOrdersEntities[this.data.orderIndex].gbDoScaleWeight;
      var newValue = 0;
      if (oldValue !== null && oldValue !== "0.0") {
        newValue = oldValue + value;
      } else {
        newValue = value
      }
      this.setData({
        ["purArr[" + this.data.focusIndex + "].gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoScaleWeight"]: newValue,
        ["item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoScaleWeight"]: newValue,
        ["orders.gbDoScaleWeight"]: newValue
      })
      this._getDoWeightScale();
    } else {
      //2，输入“dian”
      if (value == ".") {
        oldValue = this.data.purArr[this.data.focusIndex].gbDistributerGoodsEntity.gbDepartmentOrdersEntities[this.data.orderIndex].gbDoScaleWeight;
        var newValue = 0;
        if (oldValue.indexOf(".") != -1) {} else {
          if (oldValue > 0) {
            newValue = oldValue + value;
            this._getDoWeightScale();
          } else {
            newValue = "0."
          }
          this.setData({

            ["purArr[" + this.data.focusIndex + "].gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoScaleWeight"]: newValue,
            ["item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoScaleWeight"]: newValue,
            ["orders.gbDoScaleWeight"]: newValue
          })
          this._getDoWeightScale();
        }
      }
      //2，输入“删除”
      if (value == "del") {
        newValue = oldValue.substr(0, oldValue.length - 1);
        this.setData({
          ["purArr[" + this.data.focusIndex + "].gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoScaleWeight"]: newValue,
          ["item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoScaleWeight"]: newValue,
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
        if (focusIndex !== this.data.purArr.length - 1) {
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
    var scaleWeight = this.data.purArr[this.data.focusIndex].gbDistributerGoodsEntity.gbDepartmentOrdersEntities[this.data.orderIndex].gbDoScaleWeight;
    var scale = this.data.purArr[this.data.focusIndex].gbDistributerGoodsEntity.gbDepartmentOrdersEntities[this.data.orderIndex].gbDoDsStandardScale;
    console.log(scaleWeight);
    var doWeight = (Number(scaleWeight) * Number(scale)).toFixed(1);
    this.setData({
      ["purArr[" + this.data.focusIndex + "].gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoWeight"]: doWeight,
      ["item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoWeight"]: doWeight,
      ["orders.gbDoWeight"]: doWeight
    })

    this._getSclaeOrderTotal(); // 计算采购商品的总重量
    this._getTotalScale() //计算采购商品的小计
  },

  _getSclaeOrderTotal() {

    var arr = this.data.purArr[this.data.focusIndex].gbDistributerGoodsEntity.gbDepartmentOrdersEntities;
    var temp = "";
    for (var i = 0; i < arr.length; i++) {
      var weightValue = this.data.purArr[this.data.focusIndex].gbDistributerGoodsEntity.gbDepartmentOrdersEntities[i].gbDoWeight;

      if (weightValue) {
        temp = Number(temp) + Number(weightValue);
      }
    }
    temp = Number(temp).toFixed(1);
    this.setData({
      ["purArr[" + this.data.focusIndex + "].gbDpgBuyQuantity"]: temp,
      ["item.gbDpgBuyQuantity"]: temp
    })

    var scalePrice = this.data.purArr[this.data.focusIndex].gbDpgBuyScalePrice;
    console.log("scalrpririir000000000" + scalePrice)
    if (scalePrice) {
      var orderWeight = this.data.purArr[this.data.focusIndex].gbDistributerGoodsEntity.gbDepartmentOrdersEntities[this.data.orderIndex].gbDoScaleWeight;
      var orderSubtotal = (Number(scalePrice) * Number(orderWeight)).toFixed(1);
      console.log("orderSubtotal" + orderSubtotal)
      this.setData({
        ["purArr[" + this.data.focusIndex + "].gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoSubtotal"]: orderSubtotal,
        ["item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + this.data.orderIndex + "].gbDoSubtotal"]: orderSubtotal,
        ["orders.gbDoSubtotal"]: orderSubtotal
      })
    }
  },


  _getTotalScale() {
    var arr = this.data.purArr[this.data.focusIndex].gbDistributerGoodsEntity.gbDepartmentOrdersEntities;
    var temp = "";
    for (var i = 0; i < arr.length; i++) {
      var weightValue = this.data.purArr[this.data.focusIndex].gbDistributerGoodsEntity.gbDepartmentOrdersEntities[i].gbDoScaleWeight;
      if (weightValue) {
        temp = Number(temp) + Number(weightValue);
      }
    }
    // temp = Number(temp);  
    this.setData({
      ["purArr[" + this.data.focusIndex + "].gbDpgBuyScaleQuantity"]: temp,
      ["item.gbDpgBuyScaleQuantity"]: temp
    })

    var price = this.data.purArr[this.data.focusIndex].gbDpgBuyScalePrice;
    if (price) {
      var weight = this.data.purArr[this.data.focusIndex].gbDpgBuyScaleQuantity;
      var subtotal = Number(price) * Number(weight);
      this.setData({
        ["purArr[" + this.data.focusIndex + "].gbDpgBuySubtotal"]: subtotal.toFixed(1),
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

    //判断item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities 订单的gbDoWeight大于 0，否则不能请求接口
    

    load.showLoading("保存数据中");
    
    // 使用新的接口提交订单重量
    var currentOrder = this.data.orders;
    gbOrderOutWeight({
      orderId: currentOrder.gbDepartmentOrdersId,
      weight: currentOrder.gbDoWeight
    })
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
          this._getInitData();
        }
      })
  },



toBack(){
  wx.navigateBack({delta: 1})
},

// 复制订单 - 生成订单文本并复制到剪贴板
pasteOrder(){
  // 生成订单格式化文本
  const orderText = this._formatOrderContent();
  
  

  // 复制到剪贴板
  wx.setClipboardData({
    data: orderText,
    success: () => {
      // 显示确认弹窗预览
      this.setData({
        pasteContent: orderText,
        showConfirmModal: true
      });
      // wx.showToast({
      //   title: '订单内容已复制',
      //   icon: 'success'
      // });
    },
    fail: (err) => {
      wx.showToast({
        title: '复制失败',
        icon: 'none'
      });
    }
  });
},

// 格式化订单内容：序号、商品名称(规格)、订单数量、订单备注
_formatOrderContent(){
  const purArr = this.data.purArr;
  if (!purArr || purArr.length === 0) {
    return '';
  }

  let orderLines = [];
  let globalIndex = 1; // 全局序号

  purArr.forEach((item, index) => {
    const goodsName = item.gbDistributerGoodsEntity?.gbDgGoodsName || '';
    const goodsDetail = item.gbDistributerGoodsEntity?.gbDgGoodsDetail || '';
    const remark = (goodsDetail && goodsDetail !== 'null' && goodsDetail.length > 0) ? goodsDetail : '';
    
    // 获取商品的标准规格名称
    const standardName = item.gbDistributerGoodsEntity?.gbDgGoodsStandardname || '';
    
    // 如果有订单列表
    if (item.gbDistributerGoodsEntity?.gbDepartmentOrdersEntities && 
        item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities.length > 0) {
      
      item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities.forEach((order) => {
        const quantity = order.gbDoQuantity || '';
        const standard = order.gbDoStandard || '';
        const quantityText = quantity + standard;
        
        // 订单规格：如果有换算比例，显示换算格式，否则显示标准规格名称
        let orderStandard = '';
        let hasBrackets = false; // 标记规格是否已包含括号
        
        if (order.gbDoDsStandardScale && 
            order.gbDoDsStandardScale !== null && 
            order.gbDoDsStandardScale > 0 && 
            order.gbDoDsStandardScale !== '-1') {
          // 有换算比例：显示 (换算值标准规格名/订单规格)，已包含括号
          orderStandard = `${order.gbDoDsStandardScale}${standardName}/${standard}`;
          hasBrackets = true;
        } else {
          // 无换算比例：显示标准规格名称，需要加括号
          orderStandard = standardName || standard;
          hasBrackets = false;
        }
        
        // 组合订单行：序号、商品名称(规格)、订单数量、订单备注
        // 格式：序号. 商品名称(规格) 订单数量 备注
        let line = `${globalIndex}. ${goodsName}`;
        if (orderStandard) {
          if (hasBrackets) {
            // 换算比例的情况，已经包含内部结构，直接加括号
            line += `(${orderStandard})`;
          } else {
            // 普通规格，直接加括号
            line += `(${orderStandard})`;
          }
        }
        line += ` ${quantityText}`;
        if (remark) {
          line += ` ${remark}`;
        }
        
        orderLines.push(line);
        globalIndex++;
      });
    }
  });

  return orderLines.join('\n');
},

// 关闭确认弹窗
closeConfirmModal(){
  this.setData({
    showConfirmModal: false
  });
},

// 阻止事件冒泡
stopPropagation(){
  // 空函数，阻止点击弹窗内容区域关闭弹窗
},

// 确认更新粘贴内容
confirmUpdatePasteContent(){
  
  this.closeConfirmModal();
},



})