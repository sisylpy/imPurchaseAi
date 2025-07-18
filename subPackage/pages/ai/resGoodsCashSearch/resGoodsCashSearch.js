var load = require('../../../../lib/load.js');

const globalData = getApp().globalData;
var dateUtils = require('../../../../utils/dateUtil');
import apiUrl from '../../../../config.js'
let windowWidth = 0;
let itemWidth = 0;
let heightArr = [0];

import {

  queryDepDisGoodsByQuickSearchJj,
  disSaveStandard,

  saveGbOrderJj,
  updateOrderGbJj,

  updateOrderGbJjSx,
  deleteOrderGb,
  saveOrdersGbJjAndSaveDepGoodsSx,
  saveOrdersGbJjAndSaveGoodsSx,
  saveGbOrderJjSx,
} from '../../../../lib/apiDepOrder';


Page({
  data: {
    applyNumber: "",
    applyRemark: "",
    applyStandardName: "",
    applySubtotal: "",
    item: {},
    itemDis: null,
    maskHeight: "",
    statusBarHeight: "",
    windowHeight: "",
    windowWidth: "",
    deleteShow: false,
    tab1IndexSearch: 0,
    itemIndexSearch: 0,
    sliderOffsetSearch: 0,
    sliderOffsetsSearch: [],
    sliderLeftSearch: 0,
    tabsSearch: [{
      id: 0,
      amount: 0,
      words: "我的商品"
    }, {
      id: 1,
      amount: 0,
      words: "商品目录"
    }],
    isSearching: true,
    searchResult: false,
    placeHolder: "输入商品名称或拼音字母、首字母",
    itemDis: "",
    depGoods: null,
    orderCount: 0,
    editApply: false,


  },
  onShow() {
    this.setData({
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
      url: apiUrl.server,
    })
  },

  onLoad: function (options) {

    var value = wx.getStorageSync('userInfo');
    if (value) {
      this.setData({
        userInfo: value,
      })
    } else {
      this.setData({
        userInfo: null,
      })
    }

    var depValue = wx.getStorageSync('orderDepInfo');
    if (depValue) {
      this.setData({
        depInfo: depValue,
        depId: depValue.gbDepartmentId,
        depFatherId: depValue.gbDepartmentFatherId,
      })

    }

    var disInfo = wx.getStorageSync('disInfo');
    if (disInfo) {
      this.setData({
        disInfo: disInfo,
        disId: disInfo.gbDistributerId
      })
    }
    this.clueOffsetSearch();


  },

  showDialogBtn: function (e) {

    console.log("showDialogBtnshowDialogBtn")
    this.setData({
      item: e.currentTarget.dataset.item,
      showInd: true,
      windowHeight: this.data.windowHeight,
      windowWidth: this.data.windowWidth

    })

  },



  // !!!!!!!!!!!!!!!!!!!search--------------------------------------
  /**
   * 计算偏移量
   */
  clueOffsetSearch() {
    var that = this;

    wx.getSystemInfo({
      success: function (res) {
        itemWidth = Math.ceil(res.windowWidth / that.data.tabsSearch.length);
        let tempArr = [];
        for (let i in that.data.tabsSearch) {
          tempArr.push(itemWidth * i);
        }
        // tab 样式初始化
        windowWidth = res.windowWidth;
        that.setData({
          sliderOffsetsSearch: tempArr,
          sliderOffsetSearch: tempArr[that.data.tab1IndexSearch],
          sliderLeftSearch: globalData.windowWidth / 8,

        });
      }
    });
  },

  /**
   * tabItme点击
   */
  onTab1ClickSearch(event) {
    let index = event.currentTarget.dataset.index;
    this.setData({
      sliderOffsetSearch: this.data.sliderOffsetsSearch[index],
      tab1IndexSearch: index,
      itemIndexSearch: index,
      showOperation: false
    })
    this.clueOffsetSearch();
  },

  swiperChangeSearch(event) {
    this.setData({
      sliderOffsetSearch: this.data.sliderOffsetsSearch[event.detail.current],
      tab1IndexSearch: event.detail.current,
      itemIndexSearch: event.detail.current,
    })

  },

  /**
   * 配送申请，换订货规格
   * @param {*} e 
   */

  changeStandard: function (e) {

    this.setData({
      applyStandardName: e.detail.applyStandardName,
      priceLevel: e.detail.level,
    })
    var levelTwoStandard = "";
    if (this.data.itemDis != null) {
      levelTwoStandard = this.data.itemDis.nxDgWillPriceTwoStandard;
    } else {
      levelTwoStandard = this.data.depGoods.nxDgWillPriceTwoStandard;
    }

    if (this.data.applyStandardName == levelTwoStandard) {
      this.setData({
        printStandard: levelTwoStandard
      })
    } else {
      this.setData({
        printStandard: this.data.itemDis.nxDgGoodsStandardname
      })
    }
    console.log("thisdaprinfir", this.data.printStandard)
  },



  toEditApply(e) {

    console.log("contoEditApplytoEditApply")
    var applyItem = e.currentTarget.dataset.order;
    var itemStatus = applyItem.nxDoPurchaseStatus;
    if (itemStatus == 4) {
      wx.showModal({
        title: "不能修改",
        content: "订单在配送中，如果有变化，请与采购员联系.",
        showCancel: false,
        confirmText: "知道了",
        success: function (res) {
          if (res.cancel) {
            //点击取消           
          } else if (res.confirm) {}
        }
      })
    } else {
      this.setData({
        placeHolder: this.data.searchString,
        applyItem: e.currentTarget.dataset.order,
        showCash: true,
        goodsName: e.currentTarget.dataset.disgoods.nxDgGoodsName,
        applyStandardName: applyItem.nxDoStandard,
        itemNxDis: e.currentTarget.dataset.disgoods,
        editApply: true,
        applyNumber: applyItem.nxDoQuantity,
        applyRemark: applyItem.nxDoRemark,
        index: e.currentTarget.dataset.index,
        printStandard: applyItem.nxDoPrintStandard,
        priceLevel: applyItem.nxDoCostPriceLevel

      })

      if (this.data.applyItem.nxDoSubtotal !== null) {
        console.log("eidididiiidid");
        this.setData({
          applySubtotal: applyItem.nxDoSubtotal + "元"
        })

      }

    }
  },


  // 保存订货订单
  confirmCash: function (e) {
    if (this.data.editApply) {
      this._updateDisOrder(e);
    } else {
      this._saveOrderCash(e);
    }

    this.setData({
      show: false,
      editApply: false,
      applyItem: "",
      item: "",
      applyNumber: "",
      applyStandardName: "",
    })
  },

  _saveOrderCash: function (e) {

    var arriveDate = dateUtils.getArriveDate(0);
    var arriveOnlyDate = dateUtils.getArriveOnlyDate(0);
    var weekYear = dateUtils.getArriveWeeksYear(0);
    var week = dateUtils.getArriveWhatDay(0);
    var depDisGoodsId = -1;
   

    // 是否有部门商品
    if (this.data.depGoods && this.data.depGoods !== null) {
      depDisGoodsId = this.data.depGoods.nxDepartmentDisGoodsId;
    }
    var userId = -1;
    if (this.data.userInfo !== null) {
      userId = this.data.userInfo.nxDepartmentUserId;
    }
    var dg = {
      nxDoOrderUserId: userId,
      nxDoDepDisGoodsId: depDisGoodsId, //
      nxDoDisGoodsFatherId: this.data.itemDis.nxDgDfgGoodsFatherId,
      nxDoDisGoodsGrandId: this.data.itemDis.nxDgDfgGoodsGrandId,
      nxDoDisGoodsId: this.data.itemDis.nxDistributerGoodsId, //1
      nxDoDepartmentId: this.data.depId,
      nxDoDistributerId: this.data.disId,
      nxDoDepartmentFatherId: this.data.depFatherId,
      nxDoQuantity: e.detail.applyNumber,

      nxDoStandard: e.detail.applyStandardName,
      nxDoRemark: e.detail.applyRemark,
      nxDoIsAgent: 4,
      nxDoArriveDate: arriveDate,
      nxDoArriveWeeksYear: weekYear,
      nxDoArriveOnlyDate: arriveOnlyDate,
      nxDoArriveWhatDay: week,
      nxDoCostPriceUpdate: this.data.itemDis.nxDgBuyingPriceUpdate,
      nxDoCostPrice: this.data.itemDis.nxDgBuyingPrice,
      nxDoPurchaseGoodsId: this.data.itemDis.nxDgPurchaseAuto,
      nxDoNxGoodsId: this.data.itemDis.nxDgNxGoodsId,
      nxDoNxGoodsFatherId: this.data.itemDis.nxDgNxFatherId,
      nxDoGoodsType: this.data.itemDis.nxDgPurchaseAuto,
      nxDoPrintStandard: this.data.itemDis.nxDgGoodsStandardname,
    };

    console.log("savcash", dg);
    var that = this;
    saveCash(dg).then(res => {
      if (res.result.code == 0) {
        // 设置刷新标记，确保返回时刷新订单数据
        wx.setStorageSync('needRefreshOrderData', true);

        const newOrderInfo = {
          nxDepartmentDisGoodsId: depDisGoodsId,
          nxDistributerGoodsId: res.result.data.nxDoDisGoodsId,
          nxDepartmentOrdersEntity: res.result.data
        };
        wx.setStorageSync('newOrderInfo', newOrderInfo);
        wx.setStorageSync('needRefreshOrderData', true);
        that.setData({
          isSearching: true,
          searchString: "",
          canSave: false,
          searchResult: false,

        })
        that.getSearchStringPlaceHolder();
        this.setData({
          isSearching: false,
          strArr: [],
          searchStr: "",
          toSearch: true,
          show: false,
          editApply: false,
          applyItem: "",
          item: "",
          applyNumber: "",
          applyStandardName: "",
          showMyIndependent: false,
          showOperation: false,
          showAdd: false,
        })


      } else {
        wx.showToast({
          title: '订单保存失败',
          icon: 'none'
        })
      }
    })

  },


  // 保存订货订单
  confirm: function (e) {
    if (this.data.editApply) {
      this._updateDisOrder(e);
    } else {
      this._saveOrder(e);
    }

    var ordercount = this.data.orderCount;
    this.setData({
      show: false,
      editApply: false,
      applyItem: "",
      itemDis: "",
      applyNumber: "",
      applyStandardName: "",
      orderCount: ordercount + 1
    })
    console.log("this.daordocudnnd", this.data.orderCount)
  },

  showTishi() {
    wx.showModal({
      title: "不能修改",
      content: "订单在配送中，如果有变化，请与采购员联系.",
      showCancel: false,
      confirmText: "知道了",
      success: function (res) {
        if (res.cancel) {
          //点击取消           
        } else if (res.confirm) {}
      }

    })
  },


  // 
  applyGoodsDep(e) {
    console.log("applyGoodsDepapplyGoodsDep")
    var depGoods = e.currentTarget.dataset.depgoods;
    this.setData({
      index: e.currentTarget.dataset.index,
      itemDis: e.currentTarget.dataset.gbDistributerGoodsEntity,
      depGoods: e.currentTarget.dataset.depgoods,
      showDep: true,
      applyStandardName: depGoods.gbDdgOrderStandard,
      applyRemark: depGoods.gbDdgOrderRemark,
      canSave: true,
      placeHolder: this.data.searchString,
    })
    if (e.currentTarget.dataset.depgoods.gbDepartmentGoodsStockEntities.length > 0) {
      console.log(e.currentTarget.dataset.depgoods.gbDepartmentGoodsStockEntities.length);
      this.setData({
        hasStock: true
      })
    } else {
      this.setData({
        hasStock: false
      })
    }

  },

  // 
  applyGoods(e) {
    console.log("applyGoodsapplyGoods", e);

    if (e.currentTarget.dataset.depgoods !== null) {
      this.setData({
        depGoods: e.currentTarget.dataset.depgoods,
      })
      if (e.currentTarget.dataset.depgoods.gbDepartmentGoodsStockEntities.length > 0) {
        console.log(e.currentTarget.dataset.depgoods.gbDepartmentGoodsStockEntities.length);
        this.setData({
          hasStock: true
        })
      } else {
        this.setData({
          hasStock: false
        })
      }

    }
    if (e.currentTarget.dataset.item.gbDisGoodsId !== -1) {
      this.setData({
        itemGbDisId: e.currentTarget.dataset.item.gbDisGoodsId,
        gbDisGoodsFatherId: e.currentTarget.dataset.item.gbDisGoodsFatherId,
        gbDisGoodsType: e.currentTarget.dataset.item.gbDisGoodsType,
        gbDisToDepId: e.currentTarget.dataset.item.gbDisGoodsToDepId
      })
    } else {
      this.setData({
        itemGbDisId: -1,
      })
    }




    this.setData({
      index: e.currentTarget.dataset.index,
      itemNxDis: e.currentTarget.dataset.item,

      itemNx: e.currentTarget.dataset.nxgoods,
      show: true,
      applyStandardName: e.currentTarget.dataset.standard,
      priceLevel: e.currentTarget.dataset.level,
      applySubtotal: "0.0元",
      canSave: false,
    })


  },



  toEditApplyDep(e) {
    var applyItem = e.currentTarget.dataset.order;
    var itemStatus = applyItem.gbDoBuyStatus;
    if (itemStatus > 3) {
      wx.showModal({
        title: "不能修改",
        content: "订单在配送中，如果有变化，请与采购员联系.",
        showCancel: false,
        confirmText: "知道了",
        success: function (res) {
          if (res.cancel) {
            //点击取消           
          } else if (res.confirm) {}
        }
      })
    } else {
      this.setData({

        index: e.currentTarget.dataset.index,
        applyItem: e.currentTarget.dataset.order,
        delOrderId: e.currentTarget.dataset.order.gbDepartmentOrdersId,
        showDep: true,
        applyStandardName: applyItem.gbDoStandard,
        printStandard: applyItem.gbDoPrintStandard,
        editApply: true,
        applyNumber: applyItem.gbDoQuantity,
        applyRemark: applyItem.gbDoRemark,
        depGoods: e.currentTarget.dataset.depgoods,
      })


    }
  },


  toEditApply(e) {
    console.log("contoEditApplytoEditApply")
    var applyItem = e.currentTarget.dataset.order;
    console.log("arritme", e)
    var itemStatus = applyItem.nxDoPurchaseStatus;
    applyItem.disgoods = e.currentTarget.dataset.disgoods;
    if (itemStatus > 3) {
      wx.showModal({
        title: "不能修改",
        content: "订单在配送中，如果有变化，请与采购员联系.",
        showCancel: false,
        confirmText: "知道了",
        success: function (res) {
          if (res.cancel) {
            //点击取消           
          } else if (res.confirm) {}
        }
      })
    } else {
      this.setData({
        applyItem: e.currentTarget.dataset.order,
        delOrderId: e.currentTarget.dataset.order.nxDoGbDepartmentOrderId,
        show: true,
        applyStandardName: applyItem.nxDoStandard,
        //  itemNxDis: e.currentTarget.dataset.item,
        itemNxDis: e.currentTarget.dataset.disgoods,
        editApply: true,
        applyNumber: applyItem.nxDoQuantity,
        applyRemark: applyItem.nxDoRemark,
        index: e.currentTarget.dataset.index,
        canSave: false,
        priceLevel: e.currentTarget.dataset.level
      })
      console.log("cansaveee", this.data.canSave)
      if (this.data.applyItem.nxDoSubtotal !== null) {
        console.log("eidididiiidid");
        this.setData({
          applySubtotal: applyItem.nxDoSubtotal + "元"
        })
      }



    }
  },


  /**
   * 删除订货
   */
  delApplyDep() {
    this.setData({
      warnContent: this.data.depGoods.gbDdgDepGoodsName + "  " + this.data.applyItem.gbDoQuantity + this.data.applyItem.gbDoStandard,
      deleteShow: true,
      show: false,
      popupType: 'deleteOrder',
      showPopupWarn: true,
      showOperationGoods: false,
      showOperationLinshi: false
    })


  },


  // 保存订货订单

  confirmDep(e) {
    if (this.data.editApply) {
      this._updateDepOrder(e);
    } else {

      this._saveOrderDep(e);

    }
  },


  // 保存订货订单
  confirmCash: function (e) {
    if (this.data.editApply) {
      this._updateDisOrder(e);
    } else {
      this._saveOrder(e);
    }

    this.setData({
      show: false,
      editApply: false,
      applyItem: "",
      applyNumber: "",
      applyStandardName: "",
    })
  },




  _saveOrder: function (e) {
    var arriveDate = dateUtils.getArriveDate(0);
    var arriveOnlyDate = dateUtils.getArriveOnlyDate(0);
    var weekYear = dateUtils.getArriveWeeksYear(0);
    var week = dateUtils.getArriveWhatDay(0);
    var nxGoodsId = this.data.itemNxDis.nxDgNxGoodsId;
    var nxGoodsFatherId = this.data.itemNxDis.nxDgNxFatherId;
    var nxDisId = this.data.disInfo.nxDistributerEntity.nxDistributerId;
    var nxDisGoodsId = this.data.itemNxDis.nxDistributerGoodsId;
    var price = "";

    var weight = e.detail.applyNumber;
    var depDisGoodsId = -1;
    var gbDisGoodsId = -1;
    var gbDisGoodsFatherId = -1;
    var subtotal = "0.1";
    var goodsType = "";
    var printStandard = "";
    if (this.data.priceLevel == "1") {
      printStandard = this.data.itemNxDis.nxDgGoodsStandardname;
    } else {
      printStandard = this.data.itemNxDis.nxDgWillPriceTwoStandard;
    }

    if (e.detail.applyStandardName == this.data.itemNxDis.nxDgGoodsStandardname) {
      subtotal = (Number(weight) * Number(this.data.itemNxDis.nxDgWillPrice)).toFixed(1);
      price = this.data.itemNxDis.nxDgWillPrice;
    } else {
      if (this.data.itemNxDis.nxDgWillPriceTwo !== null && this.data.itemNxDis.nxDgWillPriceTwo > 0 && e.detail.applyStandardName == this.data.itemNxDis.nxDgWillPriceTwoStandard) {
        subtotal = (Number(weight) * Number(this.data.itemNxDis.nxDgWillPriceTwo)).toFixed(1);
        price = this.data.itemNxDis.nxDgWillPriceTwo;
      }
    }

    if (this.data.itemGbDisId !== -1) {
      gbDisGoodsId = this.data.itemGbDisId;
      gbDisGoodsFatherId = this.data.gbDisGoodsFatherId;
      goodsType = this.data.gbDisGoodsType;
    } else {
      goodsType = 2;

    }

    var userId = "";
    if (this.data.userInfo !== null) {
      userId = this.data.userInfo.gbDepartmentUserId;
    }

    if (this.data.depGoods !== null) {
      depDisGoodsId = this.data.depGoods.gbDepartmentDisGoodsId;
    }

    var dg = {
      gbDoOrderUserId: userId,
      gbDoDepDisGoodsId: depDisGoodsId, //
      gbDoDisGoodsId: gbDisGoodsId, //
      gbDoDisGoodsFatherId: gbDisGoodsFatherId,
      gbDoDepartmentId: this.data.depId,
      gbDoToDepartmentId: this.data.gbDisToDepId,
      gbDoDistributerId: this.data.disId,
      gbDoDepartmentFatherId: this.data.depFatherId,
      gbDoQuantity: e.detail.applyNumber,
      gbDoPrice: price,
      gbDoWeight: weight,
      gbDoSubtotal: subtotal,
      gbDoStandard: e.detail.applyStandardName,
      gbDoRemark: e.detail.applyRemark,
      gbDoIsAgent: 3,
      gbDoNxGoodsId: nxGoodsId,
      gbDoNxGoodsFatherId: nxGoodsFatherId,
      gbDoNxDistributerGoodsId: nxDisGoodsId,
      gbDoNxDistributerId: nxDisId,
      gbDoGoodsType: goodsType,
      gbDoOrderType: 5,
      gbDoDsStandardScale: -1,
      stockIsZero: e.detail.stockIsZero,
      gbDoPrintStandard: printStandard,
      gbDoCostPriceLevel: this.data.priceLevel
    };

    console.log(dg);
    if (this.data.itemGbDisId == -1) {
      load.showLoading("保存订单");
      saveOrdersGbJjAndSaveGoodsSx(dg).then(res => {
        load.hideLoading();
        if (res.result.code == 0) {
          var newGoods = res.result.data.gbDistributerGoodsEntity;
          var data = "disSearchArr[" + this.data.index + "].nxDepartmentOrdersEntity";
          var dataDis = "disSearchArr[" + this.data.index + "].gbDistributerGoodsEntity";
          this.setData({
            [data]: res.result.data,
            [dataDis]: newGoods,
          })

        } else {
          wx.showToast({
            title: '订单保存失败',
            icon: 'none'
          })
        }
      })
    } else {
      if (this.data.depGoods == null) {
        load.showLoading("保存订单");
        saveOrdersGbJjAndSaveDepGoodsSx(dg).then(res => {
          load.hideLoading();
          if (res.result.code == 0) {

            var data = "disSearchArr[" + this.data.index + "].nxDepartmentOrdersEntity";
            this.setData({
              [data]: res.result.data
            })

          } else {
            wx.showToast({
              title: '订单保存失败',
              icon: 'none'
            })
          }
        })
      } else {
        load.showLoading("保存订单");
        saveGbOrderJjSx(dg).then(res => {
          load.hideLoading();
          if (res.result.code == 0) {

            var data = "disSearchArr[" + this.data.index + "].nxDepartmentOrdersEntity";
            this.setData({
              [data]: res.result.data
            })

          } else {
            wx.showToast({
              title: '订单保存失败',
              icon: 'none'
            })
          }
        })
      }

    }

  },


  /**
   * 修改配送申请
   * @param {} e 
   */
  _updateDepOrder(e) {
    var that = this;
    var dg = {
      id: that.data.applyItem.gbDepartmentOrdersId,
      weight: e.detail.applyNumber,
      standard: e.detail.applyStandardName,
      remark: e.detail.applyRemark,
    };

    updateOrderGbJj(dg).then(res => {
      load.showLoading("修改订单")
      if (res.result.code == 0) {
        load.hideLoading();
        var data = "depSearchArr[" + this.data.index + "].gbDepartmentOrdersEntity";
        this.setData({
          [data]: res.result.data
        })

      } else {
        load.hideLoading();
        wx.showToast({
          title: res.result.msg,
          icon: "none"
        })
      }
    })
  },


  /**
   * 修改配送申请
   * @param {} e 
   */
  _updateDisOrder(e) {
    var that = this;
    var dg = {
      id: that.data.applyItem.nxDepartmentOrdersId,
      weight: e.detail.applyNumber,
      standard: e.detail.applyStandardName,
      remark: e.detail.applyRemark,
    };

    updateOrderGbJjSx(dg).then(res => {
      load.showLoading("修改订单")
      if (res.result.code == 0) {
        load.hideLoading();

        var data = "disSearchArr[" + this.data.index + "].nxDepartmentOrdersEntity";
        this.setData({
          [data]: res.result.data
        })


      } else {
        load.hideLoading();
        wx.showToast({
          title: res.result.msg,
          icon: "none"
        })
      }
    })
  },


  _saveOrderDep: function (e) {

    var dg = {
      gbDoOrderUserId: this.data.userInfo.gbDepartmentUserId,
      gbDoDepDisGoodsId: this.data.depGoods.gbDepartmentDisGoodsId, //
      gbDoDisGoodsId: this.data.depGoods.gbDdgDisGoodsId, //
      gbDoDisGoodsFatherId: this.data.depGoods.gbDdgDisGoodsFatherId,
      gbDoDepartmentId: this.data.depId,
      gbDoDistributerId: this.data.disId,
      gbDoDepartmentFatherId: this.data.depInfo.gbDepartmentFatherId,
      gbDoQuantity: e.detail.applyNumber,
      gbDoStandard: e.detail.applyStandardName,
      gbDoRemark: e.detail.applyRemark,
      gbDoIsAgent: 5,
      stockIsZero: e.detail.stockIsZero,
      gbDoPrintStandard: this.data.printStandard,
      gbDoCostPriceLevel: this.data.depGoods.gbDdgOrderPriceLevel,
    };
    console.log(dg);
    load.showLoading("保存订单");
    saveGbOrderJj(dg).then(res => {
      load.hideLoading();
      if (res.result.code == 0) {
        load.hideLoading();
        if (this.data.itemIndexSearch == 0) {
          console.log("depgodosoagupddpdd");
          var data = "depSearchArr[" + this.data.index + "].gbDepartmentOrdersEntity";

          var dataGoods = "depSearchArr[" + this.data.index + "].gbDistributerGoodsEntity";


          this.setData({
            [data]: res.result.data,
            [dataGoods]: res.result.data.gbDistributerGoodsEntity,
          })
          if (dg.stockIsZero) {
            var dataStock = "depSearchArr[" + this.data.index + "].gbDepartmentGoodsStockEntities";
            this.setData({
              [dataStock]: ""
            })
          }

        } else {
          var data = "disSearchArr[" + this.data.index + "].gbDepartmentOrdersEntity";
          this.setData({
            [data]: res.result.data
          })
        }

      } else {
        wx.showToast({
          title: '订单保存失败',
          icon: 'none'
        })
      }
    })

  },



  //  //////..//

  toAddGoods() {
    this.setData({
      placeHolder: this.data.searchString
    })
    wx.navigateTo({
      url: '../disAddGoods/disAddGoods?goodsName=' + this.data.searchString + "&disId=" + this.data.disId,
    })

  },


  confirmStandard(e) {

    var data = {
      nxDsDisGoodsId: this.data.itemDis.nxDistributerGoodsId,
      nxDsStandardName: e.detail.newStandardName,
    }
    disSaveStandard(data).
    then(res => {
      if (res.result.code == 0) {
        var standardArr = this.data.itemDis.nxDistributerStandardEntities;
        standardArr.push(res.result.data);
        var standards = "itemDis.nxDistributerStandardEntities"
        this.setData({
          [standards]: standardArr,
          applyStandardName: res.result.data.nxDsStandardName,
        })
      } else {
        wx.showToast({
          title: res.result.msg,
          icon: 'none'
        })
      }
    })
  },

  /**
   * 删除订货
   */
  delApply() {
    this.setData({
      warnContent: this.data.itemNxDis.nxDgGoodsName + "  " + this.data.applyItem.nxDoQuantity + this.data.applyItem.nxDoStandard,
      showDep: false,
      show: false,
      popupType: 'deleteOrder',
      showPopupWarn: true,
      showOperationGoods: false,
      showOperationLinshi: false
    })
  },

  confirmWarn() {
    this.deleteYes()
  },

  deleteYes() {
    var that = this;
    deleteOrderGb(this.data.delOrderId).then(res => {
      if (res.result.code == 0) {

        that.getSearchString()
        that._cancle();

      }
    })
  },



  deleteNo() {
    this.setData({
      applyItem: "",
      deleteShow: false,
    })
  },

  closeWarn() {
    this.setData({

      warnContent: "",
      show: false,
      popupType: '',
      showPopupWarn: false,
    })
  },




  delSearch() {
    var str = this.data.searchString;
    if (str.length > 0) {
      this.setData({
        searchString: str.slice(0, -1),

      })
      this.getSearchString()
    }

  },


  searchApplyDisGoods(e) {
    var pullOff = e.currentTarget.dataset.pulloff;
    if (pullOff == 1) {
      wx.showToast({
        title: '暂时不能订货',
        icon: 'none'
      })
    } else {
      this.setData({
        showCash: true,
        index: e.currentTarget.dataset.index,
        itemDis: e.currentTarget.dataset.item,
        applyStandardName: e.currentTarget.dataset.item.nxDgGoodsStandardname,
      })
      if (this.data.tab1IndexSearch == 0) {
        this.setData({
          depGoods: e.currentTarget.dataset.depgoods,
        })
      } else {
        this.setData({
          depGoods: e.currentTarget.dataset.item.departmentDisGoodsEntity,
        })
      }
    }
  },


  getString(e) {
    console.log("searchindindidnid");

    var string = e.detail.value;
    string = string.replace(/\s*/g, "");
    if (string.length > 0) {
      this.setData({
        searchString: string
      })
    } else {
      this.setData({
        searchString: ""
      })
    }

  },

  getSearchString(e) {


    if (this.data.searchString.length > 0) {
      var data = {
        disId: this.data.disInfo.nxDistributerEntity.nxDistributerId,
        searchStr: this.data.searchString,
        depId: this.data.depInfo.gbDepartmentId,
        gbDisId: this.data.disId
      }
      load.showLoading("搜索商品中...")
      queryDepDisGoodsByQuickSearchJj(data).then(res => {
        if (res.result.code == 0) {
          console.log(res.result.data);
          load.hideLoading();

          var depTabCount = "tabsSearch[0].amount";
          var disTabCount = "tabsSearch[1].amount";
          var depGoodsLength = res.result.data.dep.length;

          this.setData({
            disSearchArr: res.result.data.dis,
            depSearchArr: res.result.data.dep,
            searchResult: true,
            [depTabCount]: res.result.data.dep.length,
            [disTabCount]: res.result.data.dis.length,
          })
          if (depGoodsLength == 0) {
            this.setData({
              tab1IndexSearch: 1,
              itemIndexSearch: 1
            })
          } else {
            this.setData({
              tab1IndexSearch: 0,
              itemIndexSearch: 0
            })
          }

        } else {
          load.hideLoading();
          wx.showToast({
            title: res.result.msg,
            icon: "none"
          })

        }
      })
    } else {

      load.hideLoading();
      var resCom = "tabsSearch[1].amount";
      var res = "tabsSearch[0].amount";
      that.setData({
        disSearchArr: [],
        depSearchArr: [],
        [resCom]: "0",
        [res]: "0",
        searchResult: false,
        searchString: ""
      })
    }
  },



  _cancle() {
    this.setData({
      show: false,
      applyStandardName: "",
      itemDis: "",
      editApply: false,
      applyNumber: "",
      applyRemark: "",
      applySubtotal: ""
    })
  },

  // no use


  getSearchStringPlaceHolder() {

    var that = this;
    if (that.data.placeHolder.length > 0) {
      var data = {
        disId: this.data.depInfo.nxDepartmentDisId,
        searchStr: this.data.placeHolder,
        depId: this.data.depInfo.nxDepartmentId
      }
      load.showLoading("搜索商品中...")
      queryDepDisGoodsByQuickSearch(data).then(res => {
        if (res.result.code == 0) {
          load.hideLoading();
          var depTabCount = "tabsSearch[0].amount";
          var disTabCount = "tabsSearch[1].amount";
          this.setData({
            disSearchArr: res.result.data.dis,
            depSearchArr: res.result.data.dep,
            searchResult: true,
            [depTabCount]: res.result.data.dep.length,
            [disTabCount]: res.result.data.dis.length,
          })

        } else {
          load.hideLoading();
          wx.showToast({
            title: res.result.msg,
            icon: "none"
          })

        }
      })
    } else {
      var resCom = "tabsSearch[1].amount";
      var res = "tabsSearch[0].amount";
      that.setData({
        [resCom]: 0,
        [res]: 0,
        depSearchArr: [],
        disSearchArr: [],
        searchResult: false,
        isSearching: true,

      })

    }
  },



  hideMask() {
    this.setData({
      showOperation: false,
    })
  },


  toBack() {
    wx.navigateBack({
      delta: 1
    })
  },

  onUnload() {
    if (this.data.orderCount > 0) {
      var pages = getCurrentPages();
      var prevPage = pages[pages.length - 2]; //上一个页面
      //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
      prevPage.setData({
        update: true
      })
    }
  }

})
