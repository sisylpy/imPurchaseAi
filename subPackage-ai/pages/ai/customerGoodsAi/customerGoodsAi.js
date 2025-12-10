const globalData = getApp().globalData;
var load = require('../../../../lib/load.js');
import apiUrl from '../../../../config.js'
var dateUtils = require('../../../../utils/dateUtil');

import {
  disGetSubDepAiOrder,
}
from '../../../../lib/apiDistributer'

import {
  saveGbOrderJj
} from '../../../../lib/apiDepOrder'

Page({


  onShow() {

    let windowInfo = wx.getWindowInfo();
    let globalData = getApp().globalData;
    this.setData({
      windowWidth: windowInfo.windowWidth * globalData.rpxR,
      windowHeight: windowInfo.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
      url: apiUrl.server,

    });
  },

  /**
   * 页面的初始数据
   */
  data: {
    depGoodsArr: [],
    currentPage: 1,
    limit: 20,
    totalPage: 0,
    totalCount: 0,
    hasMore: true, // 是否还有更多数据
    isLoading: false, // 是否正在加载
    showSkeleton: true,
    dots: '',
    loadingTimer: null,
    fadeAnimation: {}
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      depId: options.depId,
    })

    var orderDepInfo = wx.getStorageSync('orderDepInfo');
    if (orderDepInfo) {
      this.setData({
        depInfo: orderDepInfo
      })
    }

    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo
      })
    }

    this._getResGoodsWithOrders();
  },

  _getResGoodsWithOrders() {
    if (!this.data.hasMore || this.data.isLoading) {
      return;
    }

    this.setData({
      isLoading: true
    });

    load.showLoading("获取数据");
    var data = {
      depId: this.data.depId,
      page: this.data.currentPage,
      limit: this.data.limit,
    }

    disGetSubDepAiOrder(data)
      .then(res => {
        load.hideLoading();
        this.setData({
          isLoading: false
        });
        console.log(res.result.page);
        if (res.result.code == 0) {
          const pageData = res.result.page;
          const newData = pageData.list || [];
          if (pageData.currPage < pageData.totalPage) {
            this.setData({
              hasMore: true,
            })
          } else {
            this.setData({
              hasMore: false
            })
          }
          // 如果是第一页，直接设置数据
          if (this.data.currentPage === 1) {
            this.setData({
              depGoodsArr: newData,
              totalCount: pageData.totalCount, // 保存总记录数
              totalPage: pageData.totalPage,
              currentPage: pageData.currPage, // 保存总页数
            });
          } else {
            // 如果不是第一页，追加数据
            this.setData({
              depGoodsArr: [...this.data.depGoodsArr, ...newData],
              // 保存总页数
            });
          }
        } else {
          wx.showToast({
            title: res.result.msg,
            icon: 'none'
          });
          this.setData({
            depGoodsArr: this.data.page === 1 ? [] : this.data.depGoodsArr,
            hasMore: false
          });
        }
      })
      .catch(err => {
        load.hideLoading();
        this.setData({
          isLoading: false
        });
        wx.showToast({
          title: '获取数据失败',
          icon: 'none'
        });
      });
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
    var levelTwoStandard = this.data.itemDis.nxDgWillPriceTwoStandard;
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

  applyGoodsDep(e) {
    var depGoods = e.currentTarget.dataset.depgoods;
    this.setData({
      index: e.currentTarget.dataset.index,
      itemDis: e.currentTarget.dataset.disgoods,
      depGoods: e.currentTarget.dataset.depgoods,
      show: true,
      applyNumber: depGoods.aiOrderQuantity,
      applyStandardName: depGoods.gbDdgOrderStandard,
      applyRemark: depGoods.gbDdgOrderRemark,
      canSave: true,
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
  /**
   * 保存配送申请
   * @param {*} 
   */

  confirm: function (e) {

    var arriveDate = dateUtils.getArriveDate(0);
    var arriveOnlyDate = dateUtils.getArriveOnlyDate(0);
    var weekYear = dateUtils.getArriveWeeksYear(0);
    var week = dateUtils.getArriveWhatDay(0);

    var dg = {
      gbDoOrderUserId: this.data.userInfo.gbDepartmentUserId,
      gbDoDepDisGoodsId: this.data.depGoods.gbDepartmentDisGoodsId, //
      gbDoDisGoodsId: this.data.depGoods.gbDdgDisGoodsId, //
      gbDoDisGoodsFatherId: this.data.depGoods.gbDdgDisGoodsFatherId,
      gbDoDepartmentId: this.data.depId,
     
      gbDoDistributerId: this.data.disId,
      gbDoDepartmentFatherId: this.data.depInfo.gbDepartmentFatherId,
      gbDoQuantity: e.detail.applyNumber,
      // gbDoPrice: price,
      // gbDoWeight: weight,
      // gbDoSubtotal: subtotal,
      gbDoStandard: e.detail.applyStandardName,
      gbDoRemark: e.detail.applyRemark,
      gbDoIsAgent: 0,
      gbDoArriveDate: arriveDate,
      gbDoArriveWeeksYear: weekYear,
      gbDoArriveOnlyDate: arriveOnlyDate,
      gbDoArriveWhatDay: week,
      // gbDoNxGoodsId: this.data.itemDis.gbDgNxGoodsId,
      // gbDoNxGoodsFatherId: this.data.itemDis.gbDgNxFatherId,
      gbDoNxDistributerGoodsId: this.data.itemDis.gbDgNxDistributerGoodsId,
      gbDoNxDistributerId: this.data.itemDis.gbDgNxDistributerId,
      gbDoGoodsType: this.data.itemDis.gbDgGoodsType,
      gbDoOrderType: this.data.itemDis.gbDgGoodsType,
      gbDoDsStandardScale: -1,
      stockIsZero: e.detail.stockIsZero,
      gbDoPrintStandard: this.data.itemDis.gbDgGoodsStandardname,

    };
    console.log(dg);

    load.showLoading("保存订单");
    saveGbOrderJj(dg).then(res => {
      load.hideLoading();
      if (res.result.code == 0) {
        load.hideLoading();
        // 设置刷新标记，确保返回时刷新订单数据
        wx.setStorageSync('needRefreshOrderData', true);

        const newArr = this.data.depGoodsArr.filter((_, i) => i !== this.data.index);
        this.setData({
          depGoodsArr: newArr
        });

      } else {
        wx.showToast({
          title: '订单保存失败',
          icon: 'none'
        })
      }
    })

  },



  toBack() {
    wx.navigateBack({
      delta: 1
    })
  },


})