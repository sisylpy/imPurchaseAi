var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;
import apiUrl from '../../../../config.js'

import {
  
  queryDisGoodsByQuickSearchGb,
  disUpdateBuyingPrice,
 
} from '../../../../lib/apiDistributer'


import { 
  downDisGoods,

}from '../../../../lib/apiibook'

let itemWidth = 0;
const viewBarHeight = 70;

Page({
  onShow(){
    if(this.data.update){
      this._searchGoods();
    }
  },

  data: {
    disArr: [],
    strArr:[],
    nxArr: [],
  },

  onLoad(options) {
    var barHeight = 90;
    this.setData({
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
      viewBarHeight: barHeight * globalData.rpxR,
      url: apiUrl.server,
    })
   
    var value = wx.getStorageSync('disInfo');
    if (value) {
      this.setData({
        disId: value.gbDistributerId,
        disInfo: value
      })
     
    } 
 
  },



  isInputing(e) {
    if (e.detail.value.length == 0) {
      this.setData({
        nxArr: [],
        strArr: [],
      })
    }
  },

  beginSearch() {
    this.setData({
      isSearching: true,
    })

  },

  stopSearch() {
    this.setData({
      isSearching: false,
      searchStr: "",
      strArr: [],
      nxArr: [],
    })
  },

  getSearchString(e) {
    if (e.detail.value.length > 0) {
      this.setData({
        searchStr: e.detail.value
      })
      this._searchGoods();

    } else {
      this.setData({
        strArr: [],
        nxArr: [],
      })
    }

  },

  _searchGoods() {
    var data = {
      disId: this.data.disId,
      searchStr: this.data.searchStr
    }
    load.showLoading("商品搜索中")
    queryDisGoodsByQuickSearchGb(data).then(res => {
      load.hideLoading();
      console.log(res.result.data);
      if (res.result.code == 0) {
        this.setData({
          disArr: res.result.data,
        })

      }
    })

  },

  toDetail(e) {
  
    wx.navigateTo({
      url: '../disGoodsPage/disGoodsPage?disGoodsId=' + e.currentTarget.dataset.id + '&goodsName=' + e.currentTarget.dataset.name + '&color=' + e.currentTarget.dataset.color  +'&from=search',
    })

  },

  toBack() {
   wx.navigateBack({delta: 1});
  }
});
